import "server-only";

import { StackServerApp } from "@stackframe/stack";
import { db } from "@/index";
import { profiles } from "@/server/db/schema";

export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
});

export async function ensureProfile() {
  const user = await stackServerApp.getUser();
  if (!user) {
    throw new Error("Unauthenticated");
  }
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  // Try common email shapes without depending on specific SDK types
  const userEmail = (user as any)?.email ?? (user as any)?.primaryEmail?.email ?? null;
  const isAdmin = userEmail ? adminEmails.includes(userEmail) : false;

  await db
    .insert(profiles)
    .values({ stack_user_id: user.id, is_admin: isAdmin })
    .onConflictDoUpdate({
      target: profiles.stack_user_id,
      set: { is_admin: isAdmin },
    });

  return { userId: user.id, isAdmin };
}

export async function requireAdmin() {
  const { isAdmin } = await ensureProfile();
  if (!isAdmin) {
    throw new Error("Forbidden");
  }
}
