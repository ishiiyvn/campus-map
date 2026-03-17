import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['es'],

  // Used when no locale matches
  defaultLocale: 'es'
});

/**
 * Prefix a path with the given locale segment.
 * e.g. routeWithLocale("/areas", "es") → "/es/areas"
 */
export function routeWithLocale(path: string, locale: string): string {
  const normalizedPath = path === '/' ? '' : path;
  return `/${locale}${normalizedPath}`;
}
