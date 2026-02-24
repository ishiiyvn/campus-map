import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { stackServerApp } from "@/stack/server";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default async function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <SidebarProvider defaultOpen>
      <Suspense fallback={<div className="hidden md:block" style={{ width: "var(--sidebar-width)" }} />}>
        <AppSidebar />
      </Suspense>
      <main className="w-full">
        <SidebarTrigger />
        {children}
      </main>
    </SidebarProvider>
  );
}
