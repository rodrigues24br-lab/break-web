import { cookies } from "next/headers";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { CheckoutPanel } from "@/components/checkout-panel";
import { decodeMockSession, MOCK_SESSION_COOKIE } from "@/lib/mock-session";

type Props = { params: Promise<{ locale: string }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");
  const jar = await cookies();
  const session = decodeMockSession(jar.get(MOCK_SESSION_COOKIE)?.value);

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 py-6">
      <div className="space-y-3 text-center">
        <BrandMark size="hero" />
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>
      <CheckoutPanel
        initialUser={
          session
            ? { uid: session.uid, email: session.email }
            : null
        }
      />
    </section>
  );
}
