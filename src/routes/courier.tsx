import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { Home } from "lucide-react";
import { CourierHeader, courierNavigation } from "@/features/courier/header";
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
  return (
    <CourierProvider>
      <section className="w-full bg-admin-canvas px-4 py-5 md:px-6 lg:px-8 min-h-screen">
        <CourierHeader />
        <div className="grid items-start gap-6 lg:grid-cols-[210px_minmax(0,1fr)]">
          <nav
            aria-label="أقسام لوحة المندوب"
            className="flex gap-2 overflow-x-auto rounded-2xl border bg-admin-side p-3 shadow-soft lg:sticky lg:top-6 lg:flex-col"
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
          <div className="min-w-0">
            <CourierContent />
          </div>
        </div>
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
