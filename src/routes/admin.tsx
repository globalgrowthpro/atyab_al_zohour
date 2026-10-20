import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { BarChart3, ClipboardList, FileText, Headset, LayoutDashboard, Package, Settings, ShieldCheck, Tags, Truck, Users } from "lucide-react";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "لوحة الإدارة | أطيب الزهور" },
      { name: "description", content: "لوحة إدارة أطيب الزهور للطلبات والعملاء والمنتجات والمندوبين." },
      { property: "og:title", content: "لوحة الإدارة | أطيب الزهور" },
      { property: "og:description", content: "إدارة الطلبات وعروض الأسعار والعملاء والمندوبين." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminLayout,
});

const navigation = [
  ["/admin", "نظرة عامة", LayoutDashboard],
  ["/admin/orders", "الطلبات", ClipboardList],
  ["/admin/quotes", "عروض الأسعار", FileText],
  ["/admin/products", "المنتجات والمخزون", Package],
  ["/admin/pricing", "قوائم الأسعار", Tags],
  ["/admin/clients", "حسابات العملاء", Users],
  ["/admin/couriers", "المندوبون", Truck],
  ["/admin/support", "تذاكر الدعم", Headset],
  ["/admin/reports", "التقارير", BarChart3],
  ["/admin/settings", "الإعدادات", Settings],
] as const;

function AdminLayout() {
  return (
    <section className="container-x py-7 md:py-8">
      <div className="mb-5">
        <span className="eyebrow">أطيب الزهور · الإدارة</span>
        <h1 className="mt-2 text-3xl">لوحة الإدارة</h1>
        <p className="mt-2 text-sm text-muted-foreground">تابع الطلبات والعملاء والمخزون والتوصيل من مكان واحد.</p>
      </div>
      <div className="mb-6 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-gold/30 bg-blush/30 px-4 py-2.5 text-xs leading-6 text-forest">
        <span className="flex items-center gap-2 font-bold"><ShieldCheck className="size-4" />عرض إدارة تجريبي</span>
        <span className="text-muted-foreground">البيانات تمثيلية والتعديلات لا تُحفظ.</span>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav aria-label="أقسام لوحة الإدارة" className="flex gap-2 overflow-x-auto rounded-2xl border bg-card p-3 shadow-soft lg:sticky lg:top-40 lg:flex-col">
          {navigation.map(([to, label, Icon]) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/admin" }}
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-forest hover:bg-muted">
              <Icon className="size-5" />{label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
    </section>
  );
}
