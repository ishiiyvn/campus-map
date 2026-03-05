import type { AbstractIntlMessages } from "next-intl";
import { notFound } from "next/navigation";
import { defaultLocale, locales } from "@/i18n/config";

export async function loadMessages(locale: string): Promise<AbstractIntlMessages> {
  if (!locales.includes(locale as typeof locales[number])) {
    notFound();
  }

  switch (locale) {
    case "es":
      return (await import("@/messages/es.json")).default;
    default:
      return (await import("@/messages/es.json")).default;
  }
}

export { defaultLocale, locales };
