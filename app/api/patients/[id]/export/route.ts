import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      procedures: { include: { procedureType: { select: { name: true } } } },
      attachments: { select: { fileName: true, type: true, uploadedAt: true, mimeType: true } },
      appointments: { include: { procedureType: { select: { name: true } }, location: { select: { name: true } } } },
    },
  });

  if (!patient) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return new NextResponse(JSON.stringify(patient, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="paciente-${id}.json"`,
    },
  });
}
