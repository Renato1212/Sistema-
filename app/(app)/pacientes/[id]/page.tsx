import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { PatientDetailClient } from "./patient-detail-client";
import { attachmentSelect } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await auth();
  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      procedures: {
        include: { procedureType: { select: { name: true } } },
        orderBy: { date: "desc" },
      },
      attachments: { select: attachmentSelect, orderBy: { uploadedAt: "desc" } },
    },
  });

  if (!patient) notFound();

  const procedureTypes = await prisma.procedureType.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return <PatientDetailClient patient={patient} procedureTypes={procedureTypes} />;
}
