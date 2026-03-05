import { redirect } from "next/navigation";
import { SignIn } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

interface LoginPageProps {
  params: Promise<{ locale: string }>;
}

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  const user = await stackServerApp.getUser();
  if (user) {
    redirect(`/${locale}`);
  }

  return <SignIn fullPage />;
}
