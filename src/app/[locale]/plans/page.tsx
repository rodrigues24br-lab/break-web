import { setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import CheckoutPanel from "@/components/checkout-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function PlansPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthShell showBack={false} ambient>
      <CheckoutPanel />
    </AuthShell>
  );
}
