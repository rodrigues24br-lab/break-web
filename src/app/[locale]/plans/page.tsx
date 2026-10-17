import { setRequestLocale } from "next-intl/server";
import { PlansPage } from "@/components/plans/plans-page";

type Props = { params: Promise<{ locale: string }> };

export default async function PlansRoute({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PlansPage />;
}
