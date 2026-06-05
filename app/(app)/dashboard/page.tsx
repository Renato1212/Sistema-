import { auth } from "@/auth";
import { DashboardClient } from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  await auth();
  return <DashboardClient />;
}
