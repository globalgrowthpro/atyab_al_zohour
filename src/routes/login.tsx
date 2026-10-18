import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "تسجيل الدخول | أطيب الزهور" }, { name: "description", content: "تسجيل الدخول — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "تسجيل الدخول | أطيب الزهور" }, { property: "og:description", content: "تسجيل الدخول — أطيب الزهور." }] }),
  component: () => <PageBanner title="تسجيل الدخول" crumb="تسجيل الدخول" subtitle="هذه الصفحة قيد التجهيز." />,
});
