import { defaultLocale } from "@/i18n/config";

export const withDefaultLocale = (path: string) => {
  if (path.startsWith(`/${defaultLocale}`)) {
    return path;
  }

  if (path === "/") {
    return `/${defaultLocale}`;
  }

  return `/${defaultLocale}${path}`;
};
