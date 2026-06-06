import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { patientSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";

  const patients = await prisma.patient.findMany({
    where: {
      deletedAt: null,
      OR: q ? [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ] : undefined,
    },
    orderBy: { fullName: "asc" },
    select: { id: true, fullName: true, email: true, phone: true },
  });

  return NextResponse.json(patients);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { birthDate, marketingConsentDate, ...rest } = parsed.data;
  const patient = await prisma.patient.create({
    data: {
      ...rest,
      birthDate: birthDate ? new Date(birthDate) : null,
      marketingConsentDate: marketingConsentDate ? new Date(marketingConsentDate) : null,
    },
  });

  return NextResponse.json({ id: patient.id }, { status: 201 });
}
