import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [{ title: "خدماتنا | أطيب الزهور" }, { name: "description", content: "خدماتنا — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "خدماتنا | أطيب الزهور" }, { property: "og:description", content: "خدماتنا — أطيب الزهور." }] }),
  component: () => <PageBanner title="خدماتنا" crumb="خدماتنا" subtitle="هذه الصفحة قيد التجهيز." />,
});
