import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { PatientsClient } from "./patients-client";

export const dynamic = "force-dynamic";

interface SearchParams {
  q?: string;
  archived?: string;
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await auth();
  const sp = await searchParams;
  const q = sp.q ?? "";
  const showArchived = sp.archived === "1";

  const patients = await prisma.patient.findMany({
    where: {
      deletedAt: showArchived ? { not: null } : null,
      OR: q
        ? [
            { fullName: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
            { phone: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    },
    orderBy: { fullName: "asc" },
    include: { _count: { select: { procedures: true, appointments: true } } },
  });

  return <PatientsClient patients={patients} query={q} showArchived={showArchived} />;
}
