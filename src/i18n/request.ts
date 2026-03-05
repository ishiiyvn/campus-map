import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales } from "@/i18n/config";

export default getRequestConfig(async ({ locale }) => {
  const activeLocale = locale && locales.includes(locale as typeof locales[number])
    ? locale
    : defaultLocale;

  return {
    locale: activeLocale,
    messages: (await import(`@/messages/${activeLocale}.json`)).default,
  };
});
