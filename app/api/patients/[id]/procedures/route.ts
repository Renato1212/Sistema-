import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { procedureSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const procedures = await prisma.patientProcedure.findMany({
    where: { patientId: id },
    include: { procedureType: { select: { name: true } } },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(procedures);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();
  const parsed = procedureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const procedure = await prisma.patientProcedure.create({
    data: { ...rest, patientId: id, date: new Date(date) },
  });
  return NextResponse.json(procedure, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const procedureId = searchParams.get("procedureId");
  if (!procedureId) return NextResponse.json({ error: "procedureId required" }, { status: 400 });
  await prisma.patientProcedure.delete({ where: { id: procedureId } });
  return NextResponse.json({ ok: true });
}
