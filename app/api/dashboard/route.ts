import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { startOfMonth, startOfYear, startOfDay, endOfDay, subDays } from "date-fns";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const currency = searchParams.get("currency") ?? "BRL";

  const dateFilter = {
    gte: from ? new Date(from) : subDays(new Date(), 30),
    lte: to ? new Date(to + "T23:59:59") : new Date(),
  };

  const procedures = await prisma.patientProcedure.findMany({
    where: { date: dateFilter, currency },
    include: {
      patient: { select: { id: true, fullName: true } },
      procedureType: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  // Total
  const total = procedures.reduce((sum, p) => sum + p.amountCents, 0);

  // By date (group by day)
  const byDate: Record<string, number> = {};
  for (const p of procedures) {
    const key = p.date.toISOString().slice(0, 10);
    byDate[key] = (byDate[key] ?? 0) + p.amountCents;
  }

  // By patient
  const byPatient: Record<string, { id: string; name: string; total: number }> = {};
  for (const p of procedures) {
    const pid = p.patient.id;
    if (!byPatient[pid]) {
      byPatient[pid] = { id: pid, name: p.patient.fullName, total: 0 };
    }
    byPatient[pid].total += p.amountCents;
  }

  // By procedure type
  const byProcedure: Record<string, { id: string; name: string; total: number }> = {};
  for (const p of procedures) {
    const key = p.procedureType?.id ?? "custom";
    const name = p.procedureType?.name ?? p.customName ?? "Outros";
    if (!byProcedure[key]) {
      byProcedure[key] = { id: key, name, total: 0 };
    }
    byProcedure[key].total += p.amountCents;
  }

  return NextResponse.json({
    total,
    currency,
    byDate: Object.entries(byDate)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date)),
    byPatient: Object.values(byPatient).sort((a, b) => b.total - a.total),
    byProcedure: Object.values(byProcedure).sort((a, b) => b.total - a.total),
  });
}
