import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, CalendarHeart, Hotel, Package, Snowflake, Truck } from "lucide-react";
import { PageBanner } from "@/components/site/PageBanner";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "خدماتنا | أطيب الزهور" },
      { name: "description", content: "خدمات توريد الورود بالجملة للمحلات والفنادق والمطاعم والشركات ومنظمي المناسبات." },
      { property: "og:title", content: "خدماتنا | أطيب الزهور" },
      { property: "og:description", content: "توريد جملة، حلول الفنادق، المناسبات والأعراس، وحسابات الشركات." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ServicesPage,
});

const services = [
  { icon: Package, title: "توريد الجملة لمحلات الورد", text: "طلبات منتظمة بكميات كبيرة من الورود والزهور وأوراق الزينة بجودة ثابتة." },
  { icon: Hotel, title: "حلول الفنادق والمطاعم", text: "توريد دوري لتنسيقات الاستقبال والقاعات والطاولات حسب جدولكم." },
  { icon: CalendarHeart, title: "المناسبات والأعراس", text: "كميات وألوان مخصصة لمنظمي الحفلات والأعراس والمؤتمرات." },
  { icon: Building2, title: "حسابات الشركات", text: "حساب خاص لشركتكم مع أسعار جملة وطلبات متكررة وسجل للطلبات." },
  { icon: Snowflake, title: "سلسلة تبريد", text: "حفظ الزهور في درجات حرارة مناسبة للمحافظة على نضارتها." },
  { icon: Truck, title: "التوصيل", text: "تنسيق مواعيد التسليم بما يناسب طبيعة عملكم." },
];

function ServicesPage() {
  return (
    <>
      <PageBanner title="خدماتنا" crumb="خدماتنا" subtitle="حلول توريد متكاملة تناسب المحلات والفنادق والشركات ومنظمي المناسبات." />
      <section className="container-x py-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xl border bg-card p-7 shadow-soft transition hover:-translate-y-1 hover:shadow-lift">
              <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-accent text-primary"><Icon className="size-7" /></div>
              <h2 className="text-xl">{title}</h2>
              <p className="mt-3 leading-8 text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-forest-gradient">
        <div className="container-x flex flex-col items-center gap-6 py-14 text-center">
          <h2 className="text-3xl !text-forest-foreground">هل تحتاج خدمة مخصصة؟</h2>
          <p className="max-w-xl text-forest-foreground/85">أخبرنا باحتياجك وسنجهز لك عرض سعر يناسب الكميات والمواعيد.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link to="/quote" className="btn btn-rose">طلب عرض سعر</Link>
            <Link to="/contact" className="btn btn-ghost-light">تواصل معنا</Link>
          </div>
        </div>
      </section>
    </>
  );
}
