import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

/** Legacy checkout route → plans */
export default async function CheckoutRedirect({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  redirect(`/${locale}/plans`);
}
