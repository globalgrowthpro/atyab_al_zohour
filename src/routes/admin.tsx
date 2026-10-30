import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Home, PanelRightClose, PanelRightOpen } from "lucide-react";
import { adminNavigation as navigation } from "@/features/admin/navigation";
import { AdminHeader } from "@/features/admin/header";
import { useAdminThemeClass } from "@/features/admin/theme";


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

function AdminLayout() {
  useAdminThemeClass();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <section className="w-full bg-admin-canvas px-4 py-5 md:px-6 lg:px-8">
      <AdminHeader />
      <div className={`grid items-start gap-6 transition-[grid-template-columns] ${collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)]"}`}>
        <nav aria-label="أقسام لوحة الإدارة" className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border bg-admin-side p-3 shadow-soft lg:sticky lg:top-6 lg:flex-col lg:overflow-visible">
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
    </section>
  );
}
