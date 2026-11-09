import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home, ShieldAlert, LogIn, ArrowLeft } from "lucide-react";
import { ClientHeader, clientNavigation } from "@/features/client/header";
import { useAdminThemeClass } from "@/features/admin/theme";
import { useAuth, hasPermission, getRoleLabel } from "@/features/auth/context";
import { Button } from "@/components/ui/button";

import { ClientProvider, useClientData } from "@/features/client/context";
import { emptyClientData } from "@/features/client/data";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "لوحة العميل | أطيب الزهور" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: DashboardLayout,
});

function DashboardLayout() {
  useAdminThemeClass();
  const { role, isAuthenticated, isLoading } = useAuth();
  const canAccessClient = hasPermission(role, "portal:client");

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-bold text-forest">
          <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>جاري التحقق من حساب العميل...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !canAccessClient) {
    return (
      <section className="container-x flex min-h-[70vh] items-center justify-center py-16">
        <div className="max-w-md rounded-3xl border border-destructive/20 bg-card p-8 text-center shadow-lift">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <ShieldAlert className="size-8" />
          </div>
          <h2 className="text-xl font-bold text-forest">غير مصرح بالدخول للوحة العميل</h2>
          <p className="mt-2 text-xs leading-6 text-muted-foreground">
            لوحة العميل مخصصة للمنشآت والمتاجر المسجلة. دورك الحالي في النظام هو:{" "}
            <span className="font-bold text-forest">{getRoleLabel(role)}</span>
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            {role === "courier" && (
              <Button asChild className="btn btn-primary w-full gap-2">
                <Link to="/courier">
                  <span>الانتقال إلى لوحة المندوب</span>
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
                <span>تسجيل الدخول بحساب منشأة</span>
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

    <ClientProvider>
      <section className="w-full bg-admin-canvas px-4 py-5 md:px-6 lg:px-8 min-h-screen">
        <ClientHeader />
        <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
          <nav
            aria-label="أقسام لوحة العميل"
            className="hidden gap-2 rounded-2xl border bg-admin-side p-3 shadow-soft lg:sticky lg:top-6 lg:flex lg:flex-col"
          >
            {clientNavigation.map(([to, label, Icon]) => (
              <Link
                key={to}
                to={to}
                activeOptions={{ exact: to === "/dashboard" }}
                activeProps={{ className: "!bg-primary !text-primary-foreground" }}
                className="flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl px-4 py-3 text-sm font-bold text-forest hover:bg-muted"
              >
                <Icon className="size-5" />
                {label}
              </Link>
            ))}
            <Link
              to="/"
              className="mt-2 flex shrink-0 items-center gap-3 whitespace-nowrap rounded-xl border border-dashed px-4 py-3 text-sm font-bold text-muted-foreground hover:bg-muted"
            >
              <Home className="size-5" />
              العودة للموقع
            </Link>
          </nav>
          <div className="min-w-0 pb-20 lg:pb-0">
            <DashboardContent />
          </div>
        </div>
        <nav
          aria-label="تنقل لوحة العميل السريع"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-admin-side/95 px-1 pb-[env(safe-area-inset-bottom)] shadow-lift backdrop-blur lg:hidden"
        >
          {clientNavigation.map(([to, label, Icon]) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: to === "/dashboard" }}
              activeProps={{ className: "!text-primary" }}
              className="flex flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold text-muted-foreground transition-colors hover:text-forest"
            >
              <Icon className="size-5" />
              <span className="leading-none">{label}</span>
            </Link>
          ))}
        </nav>
      </section>
    </ClientProvider>
  );
}

function DashboardContent() {
  const { notice, error, loading, loadFailed, retry, save } = useClientData();
  if (loading)
    return (
      <div className="rounded-2xl border bg-admin-panel p-12 text-center" role="status">
        جارٍ تحميل بيانات التجربة…
      </div>
    );
  if (loadFailed)
    return (
      <div className="space-y-4 rounded-2xl border bg-admin-panel p-8">
        <p role="alert">{error}</p>
        <div className="flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => retry()}>
            إعادة المحاولة
          </button>
          <button
            className="btn btn-outline"
            onClick={() => {
              if (
                window.confirm(
                  "سيتم استبدال بيانات التجربة المحفوظة على هذا المتصفح ببيانات فارغة. متابعة؟",
                )
              )
                void save(emptyClientData());
            }}
          >
            بدء تجربة فارغة
          </button>
        </div>
      </div>
    );
  return (
    <>
      {error && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-destructive/30 bg-admin-panel p-4 text-sm text-destructive"
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
