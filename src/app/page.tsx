import { headers } from "next/headers";
import AdhanApp from "@/components/AdhanApp";
import { I18nProvider } from "@/components/I18nProvider";
import { pickLocale } from "@/lib/i18n";

export default async function Page() {
  const h = await headers();
  const locale = pickLocale(h.get("accept-language"));
  return (
    <I18nProvider initialLocale={locale}>
      <AdhanApp />
    </I18nProvider>
  );
}
