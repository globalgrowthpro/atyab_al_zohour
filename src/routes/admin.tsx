import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useState } from "react";
import { Home, PanelRightClose, PanelRightOpen, ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { getAdminNavigationForRole } from "@/features/admin/navigation";
import { AdminHeader } from "@/features/admin/header";
import { useAdminThemeClass } from "@/features/admin/theme";
import { useAuth, hasPermission, getRoleLabel } from "@/features/auth/context";
import { Button } from "@/components/ui/button";

function AdminLayoutError({ error }: { error: unknown }) {
  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-12">
      <div className="max-w-lg rounded-2xl border border-destructive/20 bg-card p-6 text-center shadow-lift">
        <h3 className="text-lg font-bold text-destructive">حدث خطأ في واجهة لوحة الإدارة</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {error instanceof Error ? error.message : String(error)}
        </p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()} className="btn btn-primary text-xs">
            إعادة تحميل الصفحة
          </Button>
          <Button asChild variant="outline" className="text-xs">
            <Link to="/">الرئيسية</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

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
  errorComponent: AdminLayoutError,
});

function AdminLayout() {
  useAdminThemeClass();
  const [collapsed, setCollapsed] = useState(false);
  const { role, isAuthenticated, isLoading } = useAuth();

  const isStaff = hasPermission(role, "portal:admin");
  const navigation = getAdminNavigationForRole(role);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-forest">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>جاري التحقق من صلاحيات الدخول...</span>
        </div>
      </div>
    );
  }

  // Access control guard
  if (!isAuthenticated || !isStaff) {
    return (
      <section className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <div className="max-w-md rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-lift">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-forest">غير مصرح بالدخول للوحة الإدارة</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            لوحة الإدارة مخصصة لطاقم العمل والعمليات. دورك الحالي في النظام هو:{" "}
            <span className="font-bold text-forest">{getRoleLabel(role)}</span>
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {role === "client" && (
              <Button asChild className="btn btn-primary w-full gap-2">
                <Link to="/dashboard">
                  <span>الانتقال إلى لوحة العميل B2B</span>
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            )}
            {role === "courier" && (
              <Button asChild className="btn btn-primary w-full gap-2">
                <Link to="/courier">
                  <span>الانتقال إلى لوحة المندوب اللوجستي</span>
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/login">
                <LogIn className="size-4" />
                <span>تسجيل الدخول بحساب إداري مختلف</span>
              </Link>
            </Button>
            <Link to="/" className="mt-2 text-xs text-muted-foreground hover:text-forest">
              العودة إلى الصفحة الرئيسية
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-admin-canvas px-4 py-5 md:px-6 lg:px-8">
      <AdminHeader />
      <div className={`grid items-start gap-6 transition-[grid-template-columns] ${collapsed ? "lg:grid-cols-[72px_minmax(0,1fr)]" : "lg:grid-cols-[220px_minmax(0,1fr)]"}`}>
        <nav aria-label="أقسام لوحة الإدارة" className="flex min-w-0 gap-2 overflow-x-auto rounded-2xl border bg-admin-side p-3 shadow-soft lg:sticky lg:top-6 lg:flex-col lg:overflow-visible">
          <button type="button" onClick={() => setCollapsed((c) => !c)} aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"} title={collapsed ? "توسيع القائمة" : "طي القائمة"}
            className="hidden items-center gap-3 rounded-xl border border-dashed px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-muted lg:flex">
            {collapsed ? <PanelRightOpen className="size-5" /> : <><PanelRightClose className="size-5" />طي القائمة</>}
          </button>
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} activeOptions={{ exact: item.to === "/admin" }} title={item.label}
                activeProps={{ className: "!bg-primary !text-primary-foreground" }}
                className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-forest hover:bg-muted">
                <Icon className="size-5 shrink-0" /><span className={collapsed ? "lg:hidden" : ""}>{item.label}</span>
              </Link>
            );
          })}
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
