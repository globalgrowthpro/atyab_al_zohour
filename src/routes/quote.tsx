import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/quote")({
  head: () => ({ meta: [{ title: "طلب عرض سعر | أطيب الزهور" }, { name: "description", content: "طلب عرض سعر — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "طلب عرض سعر | أطيب الزهور" }, { property: "og:description", content: "طلب عرض سعر — أطيب الزهور." }] }),
  component: () => <PageBanner title="طلب عرض سعر" crumb="طلب عرض سعر" subtitle="هذه الصفحة قيد التجهيز." />,
});
