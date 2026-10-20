import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Truck, CheckCheck, Headset } from "lucide-react";
import { useClientData } from "@/features/client/context";
import { withDemonstrationData } from "@/features/client/data";
import { EmptyState, StatusBadge } from "@/features/client/shared";
export const Route = createFileRoute("/dashboard/")({ component: Overview });
function Overview() {
  const { data, save, saving } = useClientData();
  const stats = [
    ["إجمالي الطلبات", data.orders.length, Package],
    [
      "طلبات جارية",
      data.orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length,
      Truck,
    ],
    ["تم تسليمها", data.orders.filter((o) => o.status === "delivered").length, CheckCheck],
    ["تذاكر الدعم", data.tickets.length, Headset],
  ] as const;
  return (
    <div className="space-y-7">
      <div className="rounded-3xl bg-forest-gradient p-7 text-forest-foreground shadow-soft">
        <h2 className="text-2xl !text-forest-foreground">
          أهلاً {data.profile.name || "بك في مساحة العميل"}
        </h2>
        <p className="mt-3 leading-7 opacity-85">
          تابع طلباتك وجهّز استفساراتك بسهولة. كل البيانات المعروضة هنا تخص التجربة المحلية.
        </p>
        <Link to="/quote" className="btn btn-rose mt-5">
          طلب عرض سعر جديد
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(([label, number, Icon]) => (
          <div key={label} className="rounded-2xl border bg-card p-5 shadow-soft">
            <Icon className="mb-4 size-6 text-rose" />
            <p className="text-sm text-muted-foreground">{label}</p>
            <strong className="mt-2 block text-3xl text-forest">{number}</strong>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl">أحدث الطلبات</h2>
        <Link to="/dashboard/orders" className="text-sm font-bold text-primary underline">
          كل الطلبات
        </Link>
      </div>
      {!data.orders.length ? (
        <EmptyState
          title="لا توجد طلبات مرتبطة"
          text="طلب عرض السعر الذي تحمّله من الموقع لا يتحول تلقائياً إلى طلب مؤكد. سيظهر سجل الطلبات الحقيقي بعد ربط خدمة العملاء."
        />
      ) : (
        <div className="space-y-3">
          {data.orders.slice(0, 3).map((order) => (
            <Link
              key={order.id}
              to="/dashboard/orders"
              search={{ order: order.id }}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border bg-card p-5 shadow-soft"
            >
              <div>
                <strong dir="ltr">{order.id}</strong>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.date} · {order.city}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </Link>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-dashed bg-surface p-6">
        <h3 className="text-lg">استكشاف شكل الطلبات</h3>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          حمّل خمسة طلبات وتذاكر دعم ومحادثات توضيحية. ستبقى بياناتك المحلية الحالية محفوظة، ولن
          يتكرر أي سجل عند إعادة التحميل.
        </p>
        <button
          disabled={saving}
          className="btn btn-outline mt-4"
          onClick={() => void save(withDemonstrationData(data))}
        >
          تحميل بيانات العرض التجريبي
        </button>
        {data.orders.length > 0 && (
          <button
            disabled={saving}
            className="ms-4 mt-4 text-sm underline"
            onClick={() => {
              if (window.confirm("حذف الطلبات التوضيحية من هذا المتصفح؟"))
                void save({
                  ...data,
                  orders: data.orders.filter((o) => !o.id.startsWith("DEMO-")),
                  tickets: data.tickets.filter((t) => t.origin !== "demo"),
                });
            }}
          >
            حذف بيانات العرض فقط
          </button>
        )}
      </div>
    </div>
  );
}
