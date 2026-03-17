import { redirect } from "next/navigation";
import { withDefaultLocale } from "@/i18n/redirects";

export default function DashboardRedirect() {
  redirect(withDefaultLocale("/maps"));
}
