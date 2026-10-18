import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** Top-level /success → /[locale]/success (proxy also redirects; this is a fallback). */
export default async function SuccessRedirect({ searchParams }: Props) {
  const q = await searchParams;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(q)) {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  const qs = params.toString();
  redirect(
    `/${routing.defaultLocale}/success${qs ? `?${qs}` : ""}`
  );
}
