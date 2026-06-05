import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Nav } from "@/components/layout/nav";
import { ToastProvider } from "@/components/ui/toast";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login");

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Nav />
        <main className="flex-1 md:ml-[220px] min-h-screen bg-marfim pt-14 md:pt-0">
          {children}
        </main>
      </div>
    </ToastProvider>
  );
}
