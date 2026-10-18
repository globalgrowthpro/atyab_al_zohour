import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "إنشاء حساب شركة | أطيب الزهور" }, { name: "description", content: "إنشاء حساب شركة — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "إنشاء حساب شركة | أطيب الزهور" }, { property: "og:description", content: "إنشاء حساب شركة — أطيب الزهور." }] }),
  component: () => <PageBanner title="إنشاء حساب شركة" crumb="إنشاء حساب شركة" subtitle="هذه الصفحة قيد التجهيز." />,
});
