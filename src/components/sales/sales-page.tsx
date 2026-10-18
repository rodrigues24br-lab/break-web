import { getTranslations } from "next-intl/server";
import { BrandMark } from "@/components/brand-mark";
import { DynamicPrice } from "@/components/dynamic-price";
import { SalesAuth } from "@/components/sales/sales-auth";
import { SalesFooter } from "@/components/sales/sales-footer";

type Props = {
  locale: string;
};

export async function SalesPage({ locale }: Props) {
  const t = await getTranslations("sales");

  const problemItems = t.raw("problem.items") as string[];
  const consequenceItems = t.raw("consequences.items") as string[];
  const solutionItems = t.raw("solution.items") as {
    title: string;
    text: string;
  }[];
  const freeItems = t.raw("pro.freeItems") as string[];
  const proItems = t.raw("pro.items") as string[];
  const howSteps = t.raw("how.steps") as {
    n: string;
    title: string;
    text: string;
  }[];

  return (
    <div className="mx-auto w-full max-w-3xl">
      {/* 1. Hero */}
      <section className="flex min-h-[85vh] flex-col justify-center gap-8 py-12 text-center">
        <BrandMark size="hero" />
        <h1 className="animate-rise font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-title sm:text-5xl md:text-6xl">
          {t("hero.title")}
        </h1>
        <p className="animate-rise-delay mx-auto max-w-xl text-lg text-muted-foreground sm:text-xl">
          {t("hero.subtitle")}
        </p>
        <div className="animate-rise-delay">
          <a
            href="#account"
            className="inline-flex h-16 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold tracking-wide text-primary-foreground shadow-[0_8px_28px_-10px_var(--glow)] transition hover:brightness-110 animate-soft-pulse"
          >
            {t("hero.cta")}
          </a>
        </div>
      </section>

      {/* 2. Problem */}
      <section className="space-y-6 border-t border-border py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {t("problem.title")}
        </h2>
        <p className="text-lg text-muted-foreground">{t("problem.lead")}</p>
        <ul className="space-y-4 text-base text-foreground sm:text-lg">
          {problemItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 3. Consequences */}
      <section className="space-y-6 border-t border-border py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {t("consequences.title")}
        </h2>
        <p className="text-lg text-muted-foreground">{t("consequences.lead")}</p>
        <ul className="space-y-4 text-base text-foreground sm:text-lg">
          {consequenceItems.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-destructive/80" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* 4. Solution — 5 functions */}
      <section className="space-y-8 border-t border-border py-16">
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
            {t("solution.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("solution.lead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {solutionItems.map((item, i) => (
            <div
              key={item.title}
              className={`space-y-2 rounded-2xl border border-border bg-card p-5 shadow-sm ${
                i === solutionItems.length - 1 && solutionItems.length % 2 === 1
                  ? "sm:col-span-2"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-badge text-sm font-bold text-badge-foreground">
                  {i + 1}
                </span>
                <h3 className="text-lg font-semibold text-title">{item.title}</h3>
              </div>
              <p className="pl-11 text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Free vs Pro */}
      <section className="space-y-6 border-t border-border py-16">
        <div className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
            {t("pro.title")}
          </h2>
          <p className="text-lg text-muted-foreground">{t("pro.lead")}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-title">
              {t("pro.freeTitle")}
            </h3>
            <ul className="space-y-3">
              {freeItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground">
                  <span className="flex size-6 items-center justify-center rounded-full bg-track text-xs font-bold text-muted-foreground">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative space-y-4 rounded-2xl border-2 border-pro/40 bg-card p-6 shadow-sm">
            <span className="absolute -top-3 right-4 rounded-full bg-pro px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-white">
              {t("pro.proSeal")}
            </span>
            <h3 className="font-[family-name:var(--font-display)] text-xl font-bold text-pro">
              {t("pro.proTitle")}
            </h3>
            <ul className="space-y-3">
              {proItems.map((item) => (
                <li key={item} className="flex items-center gap-3 text-foreground">
                  <span className="flex size-6 items-center justify-center rounded-full bg-pro/15 text-xs font-bold text-pro">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 6. How it works */}
      <section className="space-y-8 border-t border-border py-16">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {t("how.title")}
        </h2>
        <ol className="space-y-6">
          {howSteps.map((step) => (
            <li key={step.n} className="flex gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-primary-foreground">
                {step.n}
              </span>
              <div>
                <h3 className="text-lg font-semibold text-title">{step.title}</h3>
                <p className="text-muted-foreground">{step.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 7. Offer */}
      <section className="space-y-6 border-t border-border py-16 text-center">
        <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
          {t("offer.title")}
        </h2>
        <p className="font-[family-name:var(--font-display)] text-5xl font-bold text-primary sm:text-6xl">
          <DynamicPrice fallback={t("offer.price")} />
          <span className="ml-2 text-lg font-medium text-muted-foreground">
            {t("offer.period")}
          </span>
        </p>
        <p className="text-base text-muted-foreground">
          <DynamicPrice
            mode="monthly"
            fallback={t("offer.monthlyApprox", { price: "$4.17" })}
            monthlyTemplate={t("offer.monthlyApprox")}
          />
        </p>
        <p className="mx-auto max-w-md text-muted-foreground">
          {t("offer.includes")}
        </p>
        <a
          href="#account"
          className="inline-flex h-16 items-center justify-center rounded-2xl bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-[0_8px_28px_-10px_var(--glow)] transition hover:brightness-110"
        >
          {t("offer.cta")}
        </a>
      </section>

      {/* 8. Account only — payment lives on /plans */}
      <section
        id="account"
        className="scroll-mt-24 space-y-6 border-t border-border py-16"
      >
        <div className="space-y-2 text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight text-title sm:text-4xl">
            {t("account.title")}
          </h2>
          <p className="text-muted-foreground">{t("account.subtitle")}</p>
        </div>
        <SalesAuth />
      </section>

      <SalesFooter locale={locale} />
    </div>
  );
}
