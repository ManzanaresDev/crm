// app/api/contacts/route.ts
// import { prisma } from "@/lib/prisma";
// import { auth } from "@/auth";
// import { NextResponse } from "next/server";

// export async function GET() {
//   const session = await auth();
//   if (!session?.user)
//     return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

//   const contacts = await prisma.contact.findMany({
//     where: { ownerId: session.user.id },
//     orderBy: { createdAt: "desc" },
//   });

//   return NextResponse.json(contacts);
// }

// export async function POST(req: Request) {
//   const session = await auth();
//   if (!session?.user)
//     return NextResponse.json({ error: "Non autorisé" }, { status: 401 });

//   const data = await req.json();

//   const contact = await prisma.contact.create({
//     data: { ...data, ownerId: session.user.id },
//   });

//   return NextResponse.json(contact);
// }

import { Prisma } from "@prisma/client";
import { db } from "@/lib/database";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
type CreateContactBody = Omit<Prisma.ContactUncheckedCreateInput, "ownerId">;

export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({
      error: "utilisateur pas autorisé",
      status: 401,
    });
  }

  const contacts = await db.contact.findMany({
    where: { ownerId: session?.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(contacts);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({
      error: "utilisateur pas autorisé",
      status: 401,
    });
  }

  const data: CreateContactBody = await req.json();

  // Vérification d'inputs: Name et lastName obligatoires...
  if (!data.firstName || !data.lastName) {
    return NextResponse.json({
      error: "firstName et lastName sont requis",
      status: 400,
    });
  }
  const contact = await db.contact.create({
    data: {
      ...data,
      ownerId: session.user.id,
    },
  });

  return NextResponse.json(contact);
}
