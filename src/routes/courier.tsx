import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home, ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { CourierHeader, courierNavigation } from "@/features/courier/header";
import { useAdminThemeClass } from "@/features/admin/theme";
import { useAuth, hasPermission, getRoleLabel } from "@/features/auth/context";
import { Button } from "@/components/ui/button";

import { CourierProvider, useCourier } from "@/features/courier/context";
export const Route = createFileRoute("/courier")({
  head: () => ({
    meta: [
      { title: "لوحة المندوب | أطيب الزهور" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CourierLayout,
});
function CourierLayout() {
  useAdminThemeClass();
  const { role, isAuthenticated, isLoading } = useAuth();
  const canAccessCourier = hasPermission(role, "portal:courier");

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-forest">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>جاري التحقق من صلاحيات المندوب...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessCourier) {
    return (
      <section className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <div className="max-w-md rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-lift">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-forest">غير مصرح بالدخول للوحة المندوبين</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            هذه المنطقة مخصصة لكباتن التوصيل والأسطول المبرد. دورك الحالي في النظام هو:{" "}
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
            {hasPermission(role, "portal:admin") && (
              <Button asChild className="btn btn-primary w-full gap-2">
                <Link to="/admin">
                  <span>الانتقال إلى لوحة الإدارة</span>
                  <ArrowLeft className="size-4" />
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="w-full gap-2">
              <Link to="/login">
                <LogIn className="size-4" />
                <span>تسجيل الدخول بحساب كابتن توصيل</span>
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

    <CourierProvider>
      <section className="w-full bg-admin-canvas px-4 py-5 md:px-6 lg:px-8 min-h-screen">
        <CourierHeader />
        <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
          <nav
            aria-label="أقسام لوحة المندوب"
            className="hidden gap-2 rounded-2xl border bg-admin-side p-3 shadow-soft lg:sticky lg:top-6 lg:flex lg:flex-col"
          >
            {courierNavigation.map(([to, label, Icon]) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/courier" }}
                activeProps={{ className: "!bg-primary !text-primary-foreground" }}
                className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-forest hover:bg-muted"
              >
                <Icon className="size-5" />
                {label}
              </Link>
            ))}
            <Link to="/" className="mt-2 flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl border border-dashed px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted">
              <Home className="size-5" />
              العودة للموقع
            </Link>
          </nav>
          <div className="min-w-0 pb-20 lg:pb-0">
            <CourierContent />
          </div>
        </div>
        <nav
          aria-label="تنقل لوحة المندوب السريع"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-admin-side/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur lg:hidden"
        >
          {courierNavigation.map(([to, label, Icon]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/courier" }}
              activeProps={{ className: "!text-primary" }}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:text-forest"
            >
              <Icon className="size-5" />
              <span className="leading-none">{label}</span>
            </Link>
          ))}
        </nav>
      </section>
    </CourierProvider>
  );
}
function CourierContent() {
  const { error, notice } = useCourier();
  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-card p-4 text-sm text-destructive"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="mb-5 rounded-xl border border-primary/15 bg-accent/40 p-4 text-xs leading-6 text-primary"
        >
          {notice}
        </p>
      )}
      <Outlet />
    </>
  );
}
