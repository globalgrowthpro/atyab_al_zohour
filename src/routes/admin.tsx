import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { BarChart3, Handshake, Home, Lock, Mail, PanelRightClose, PanelRightOpen, SearchCheck, ClipboardList, FileText, Headset, LayoutDashboard, Package, Settings, Tags, Truck, Users } from "lucide-react";

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
  ["/admin/crm", "إدارة العملاء CRM", Handshake],
  ["/admin/couriers", "المندوبون", Truck],
  ["/admin/support", "تذاكر الدعم", Headset],
  ["/admin/reports", "التقارير", BarChart3],
  ["/admin/smtp", "البريد SMTP", Mail],
  ["/admin/security", "الأمان", Lock],
  ["/admin/seo", "SEO · AEO · GEO", SearchCheck],
  ["/admin/settings", "الإعدادات", Settings],
] as const;

function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className="container-x py-7 md:py-8">
      <div className="bg-admin-canvas rounded-3xl border px-4 py-6 shadow-soft md:px-7 md:py-8">
      <div className={`grid items-start gap-6 transition-[grid-template-columns] ${collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)]"}`}>
        <nav aria-label="أقسام لوحة الإدارة" className="flex gap-2 overflow-x-auto rounded-2xl border bg-admin-side p-3 shadow-soft lg:sticky lg:top-6 lg:flex-col lg:overflow-visible">
          <button type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"} title={collapsed ? "توسيع القائمة" : "طي القائمة"}
            className="hidden items-center gap-3 rounded-xl border border-dashed px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted lg:flex">
            {collapsed ? <PanelRightOpen className="size-5" /> : <><PanelRightClose className="size-5" />طي القائمة</>}
          </button>
          {navigation.map(([to, label, Icon]) => (
            <Link key={to} to={to} activeOptions={{ exact: to === "/admin" }} title={label}
              activeProps={{ className: "!bg-primary !text-primary-foreground" }}
              className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-forest hover:bg-muted">
              <Icon className="size-5 shrink-0" /><span className={collapsed ? "lg:hidden" : ""}>{label}</span>
            </Link>
          ))}
          <Link to="/" title="العودة للموقع"
            className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl border border-dashed px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted">
            <Home className="size-5 shrink-0" /><span className={collapsed ? "lg:hidden" : ""}>العودة للموقع</span>
          </Link>
        </nav>
        <div className="min-w-0"><Outlet /></div>
      </div>
      </div>
    </section>
  );
}
