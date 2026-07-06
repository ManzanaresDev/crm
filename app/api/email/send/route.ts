// app/api/email/send/route.ts
import { Resend } from "resend";
import { db } from "@/lib/database";
import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/api-auth";

const resend = new Resend(process.env.RESENT_API_KEY);

export async function POST(req: Request) {
  const authResult = await requireApiSession();
  if ("error" in authResult) {
    return authResult.error;
  }
  const { session } = authResult;
  const { contactId, subject, body } = await req.json();

  // Recuperation de l'email du client to contacter
  const contactToSendEmail = await db.contact.findUnique({
    where: { id: contactId },
  });
  if (!contactToSendEmail?.email) {
    return NextResponse.json({ error: "client sans email", status: 400 });
  }

  await db.emailLog.create({
    data: {
      subject,
      body,
      contactId,
      ownerId: session.user.id,
      status: "EN_ATTENTE",
    },
  });

  try {
    // Email send
    await resend.emails.send({
      from: `${process.env.EMAIL_FROM}`,
      to: `${contactToSendEmail.email}`,
      subject,
      html: body,
    });
    // status update
    await db.emailLog.update({
      where: { id: contactId },
      data: { status: "ENVOYE", sentAt: new Date() },
    });
  } catch (error) {
    // un erreur est survenue et le log doit l'enregistrer
    await db.emailLog.update({
      where: { id: contactId },
      data: {
        status: "ECHOUE",
      },
    });
    return NextResponse.json({
      error: `Erreur d'envoi de l'email: ${error}`,
      status: 500,
    });
  }
  return NextResponse.json({ success: true });
}
