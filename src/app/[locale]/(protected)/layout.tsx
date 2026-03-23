import { redirect } from "next/navigation";
import { type ReactNode } from "react";
import { stackServerApp } from "@/stack/server";
import { AppTopbar } from "@/components/app-topbar";
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
    <div className="min-h-svh flex flex-col overflow-hidden">
      <AppTopbar />
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
