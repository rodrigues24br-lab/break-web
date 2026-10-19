import { setRequestLocale } from "next-intl/server";
import AuthShell from "@/components/auth-shell";
import AuthForm from "@/components/auth-form";

type Props = { params: Promise<{ locale: string }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <AuthShell>
      <AuthForm mode="login" />
    </AuthShell>
  );
}
