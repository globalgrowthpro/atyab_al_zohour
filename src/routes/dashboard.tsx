import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { ClientHeader, clientNavigation } from "@/features/client/header";
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
