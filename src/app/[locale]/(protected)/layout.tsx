import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { stackServerApp } from "@/stack/server";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { withDefaultLocale } from "@/i18n/redirects";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const user = await stackServerApp.getUser();
  if (!user) {
    redirect(withDefaultLocale("/login"));
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
