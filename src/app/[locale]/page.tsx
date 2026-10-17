import { setRequestLocale } from "next-intl/server";
import { SalesPage } from "@/components/sales/sales-page";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <SalesPage locale={locale} />;
}
