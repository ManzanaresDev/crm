// app/api/deals/route.ts
import { db } from "@/lib/database";
import { requireApiSession } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

type CreateDealBody = Omit<Prisma.DealUncheckedCreateInput, "ownerId">;

export async function GET() {
  const authResult = await requireApiSession();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  try {
    const deals = await db.deal.findMany({
      where: { ownerId: session.user.id },
      include: { contact: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(deals);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des opportunités" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authResult = await requireApiSession();
  if ("error" in authResult) return authResult.error;
  const { session } = authResult;

  const data: CreateDealBody = await req.json();

  if (!data.title || !data.contactId) {
    return NextResponse.json(
      { error: "title et contactId sont requis" },
      { status: 400 },
    );
  }

  try {
    // On vérifie que le contact appartient bien à l'utilisateur avant de créer le deal
    const contact = await db.contact.findFirst({
      where: { id: data.contactId, ownerId: session.user.id },
    });
    if (!contact) {
      return NextResponse.json(
        { error: "Contact introuvable" },
        { status: 404 },
      );
    }

    const deal = await db.deal.create({
      data: { ...data, ownerId: session.user.id },
    });
    return NextResponse.json(deal);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'opportunité" },
      { status: 500 },
    );
  }
}
