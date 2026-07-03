// app/api/contacts/[id]/route.ts
import { db } from "@/lib/database";
import { requireApiSession } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authResult = await requireApiSession();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const data = await req.json();

  try {
    const contact = await db.contact.update({
      where: { id, ownerId: session.user.id },
      data,
    });
    return NextResponse.json(contact);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Contact introuvable ou erreur de mise à jour" },
      { status: 404 },
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authResult = await requireApiSession();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  try {
    await db.contact.delete({
      where: { id, ownerId: session.user.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Contact introuvable ou erreur de suppression" },
      { status: 404 },
    );
  }
}
