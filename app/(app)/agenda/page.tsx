import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { AgendaClient } from "./agenda-client";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  await auth();

  const [procedureTypes, locations] = await Promise.all([
    prisma.procedureType.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.location.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return <AgendaClient procedureTypes={procedureTypes} locations={locations} />;
}
