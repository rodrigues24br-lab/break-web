import { setRequestLocale } from "next-intl/server";
import { SalesPage } from "@/components/sales/sales-page";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ paid?: string }>;
};

export default async function HomePage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = await searchParams;
  setRequestLocale(locale);

  return (
    <SalesPage locale={locale} initiallyPaid={sp.paid === "1"} />
  );
}
