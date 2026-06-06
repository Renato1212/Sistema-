import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { patientSchema } from "@/lib/schemas";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const patient = await prisma.patient.findUnique({ where: { id } });
  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(patient);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const body = await req.json();

  // Handle soft-delete / restore
  if ("deletedAt" in body) {
    const patient = await prisma.patient.update({
      where: { id },
      data: { deletedAt: body.deletedAt ? new Date(body.deletedAt) : null },
    });
    return NextResponse.json({ id: patient.id });
  }

  const parsed = patientSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { birthDate, marketingConsentDate, ...rest } = parsed.data;
  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...rest,
      birthDate: birthDate ? new Date(birthDate) : null,
      marketingConsentDate: marketingConsentDate ? new Date(marketingConsentDate) : null,
    },
  });
  return NextResponse.json({ id: patient.id });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  // Hard delete — requires explicit query param ?hard=true
  const { searchParams } = new URL(req.url);
  if (searchParams.get("hard") === "true") {
    await prisma.$transaction([
      prisma.patientProcedure.deleteMany({ where: { patientId: id } }),
      prisma.attachment.deleteMany({ where: { patientId: id } }),
      prisma.appointment.updateMany({ where: { patientId: id }, data: { patientId: null } }),
      prisma.patient.delete({ where: { id } }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // Soft delete
  await prisma.patient.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
  return NextResponse.json({ ok: true });
}
