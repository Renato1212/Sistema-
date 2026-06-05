import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { appointmentSchema } from "@/lib/schemas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const locationId = searchParams.get("locationId");
  const status = searchParams.get("status");

  const appointments = await prisma.appointment.findMany({
    where: {
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to + "T23:59:59") : undefined,
      },
      locationId: locationId || undefined,
      status: status || undefined,
    },
    include: {
      patient: { select: { id: true, fullName: true } },
      procedureType: { select: { name: true } },
      location: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }, { time: "asc" }],
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = appointmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
  }

  const { date, ...rest } = parsed.data;
  const appointment = await prisma.appointment.create({
    data: { ...rest, date: new Date(date) },
  });
  return NextResponse.json(appointment, { status: 201 });
}
