import { createFileRoute } from "@tanstack/react-router";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "التصنيفات | أطيب الزهور" }, { name: "description", content: "التصنيفات — أطيب الزهور لتوريد الورود بالجملة." }, { property: "og:title", content: "التصنيفات | أطيب الزهور" }, { property: "og:description", content: "التصنيفات — أطيب الزهور." }] }),
  component: () => <PageBanner title="التصنيفات" crumb="التصنيفات" subtitle="هذه الصفحة قيد التجهيز." />,
});
