import { redirect } from "next/navigation";
import { SignIn } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";

export default async function LoginPage() {
  const user = await stackServerApp.getUser();
  if (user) {
    redirect("/");
  }
  return <SignIn fullPage />;
}
