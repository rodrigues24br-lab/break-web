import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AuthForm } from "@/components/auth-form";
import { BrandMark } from "@/components/brand-mark";

type Props = { params: Promise<{ locale: string }> };

export default async function SignupPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("signup");

  return (
    <section className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-8 py-6">
      <div className="space-y-3 text-center">
        <BrandMark size="hero" />
        <h1 className="animate-rise-delay text-2xl font-semibold tracking-tight sm:text-3xl">
          {t("title")}
        </h1>
        <p className="animate-rise-delay text-muted-foreground">{t("subtitle")}</p>
      </div>
      <AuthForm mode="signup" />
      <p className="animate-fade text-center text-sm text-muted-foreground">
        <Link href={`/${locale}/login`} className="underline-offset-4 hover:underline">
          {t("toLogin")}
        </Link>
      </p>
    </section>
  );
}
