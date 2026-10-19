import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "إنشاء حساب | أطيب الزهور" }, { name: "description", content: "إنشاء حساب — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "إنشاء حساب | أطيب الزهور" }, { property: "og:description", content: "إنشاء حساب — أطيب الزهور." }] }),
  component: () => <PageBanner title="إنشاء حساب" crumb="إنشاء حساب" subtitle="هذه الصفحة قيد التجهيز." />,
});
