import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "تواصل معنا | أطيب الزهور" }, { name: "description", content: "تواصل معنا — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "تواصل معنا | أطيب الزهور" }, { property: "og:description", content: "تواصل معنا — أطيب الزهور." }] }),
  component: () => <PageBanner title="تواصل معنا" crumb="تواصل معنا" subtitle="هذه الصفحة قيد التجهيز." />,
});
