import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { CheckoutPanel } from "@/components/checkout-panel";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 py-6">
      <div className="space-y-3 text-center">
        <BrandMark size="hero" />
        <h1 className="animate-rise-delay text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="animate-rise-delay text-muted-foreground">{t("subtitle")}</p>
      </div>
      <CheckoutPanel />
    </section>
  );
}
