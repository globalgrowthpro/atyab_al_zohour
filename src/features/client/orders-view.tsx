import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Search,
  List,
  LayoutGrid,
  ArrowUpLeft,
  Package,
  SlidersHorizontal,
  MapPin,
  ArrowLeft,
} from "lucide-react";
import { orderStatus, type ClientOrder } from "./data";
import { StatusBadge, EmptyState } from "./shared";
import { orderAddress, orderAmount, orderQuantity, formatOrderDate } from "./order-presentation";
import { useIsMobile } from "@/hooks/use-mobile";

export function OrdersView({
  orders,
  onDetails,
}: {
  orders: ClientOrder[];
  onDetails: (order: ClientOrder) => void;
}) {
  const [view, setView] = useState<"table" | "grid">("table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filtered = [...orders]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .filter(
      (o) =>
        (!status || o.status === status) &&
        `${o.id} ${o.city} ${o.items.map((i) => i.name).join(" ")}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h2 className="text-2xl">طلباتي</h2>
            <span className="rounded-lg border bg-card px-2.5 py-1 text-xs font-bold text-primary">
              {orders.length} طلبات
            </span>
          </div>
          <p className="text-sm text-muted-foreground">تابع حالة كل طلب وراجع تفاصيله بسهولة.</p>
        </div>
        <Link to="/quote" className="btn btn-primary !h-10 !px-5 text-sm">
          طلب جديد <ArrowLeft className="size-4" />
        </Link>
      </div>
      {!orders.length ? (
        <EmptyState
          title="لا توجد طلبات بعد"
          text="يمكنك تحميل طلبات العرض من صفحة النظرة العامة لاستكشاف اللوحة."
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="flex flex-wrap items-center gap-3 border-b p-4">
            <label className="relative min-w-48 flex-1">
              <span className="sr-only">البحث في الطلبات</span>
              <Search className="pointer-events-none absolute start-3.5 top-3 size-4 text-muted-foreground" />
              <input
                className="field !h-10 !ps-10 text-sm"
                type="search"
                placeholder="ابحث برقم الطلب أو المنتج أو المدينة…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <span className="sr-only">حالة الطلب</span>
              <select
                className="field !h-10 !w-auto !min-w-36 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="">كل الحالات</option>
                {Object.entries(orderStatus).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
            <div
              className="flex rounded-xl border bg-muted/60 p-1"
              role="group"
              aria-label="طريقة عرض الطلبات"
            >
              <button
                type="button"
                aria-pressed={view === "table"}
                onClick={() => setView("table")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${view === "table" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
              >
                <List className="size-4" />
                جدول
              </button>
              <button
                type="button"
                aria-pressed={view === "grid"}
                onClick={() => setView("grid")}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${view === "grid" ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
              >
                <LayoutGrid className="size-4" />
                كروت
              </button>
            </div>
          </div>
          {!filtered.length ? (
            <div role="status" className="p-12 text-center">
              <Search className="mx-auto mb-4 size-8 text-muted-foreground" />
              <h3 className="text-lg">لا توجد نتائج مطابقة</h3>
              <p className="mt-2 text-sm text-muted-foreground">جرّب تغيير البحث أو حالة الطلب.</p>
              <button
                className="mt-4 text-sm font-bold text-primary underline"
                onClick={() => {
                  setQuery("");
                  setStatus("");
                }}
              >
                مسح الفلاتر
              </button>
            </div>
          ) : view === "table" ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[790px] text-start text-sm">
                <caption className="sr-only">
                  الطلبات مع التاريخ والمنتجات والعنوان والحالة والمجموع والإجراءات
                </caption>
                <thead className="bg-muted/40 text-xs text-muted-foreground">
                  <tr>
                    {[
                      "الطلب / التاريخ",
                      "المنتجات والكميات",
                      "التوصيل",
                      "الحالة",
                      "المجموع",
                      "",
                    ].map((label, i) => (
                      <th key={i} scope="col" className="px-5 py-4 text-start font-medium">
                        {label || <span className="sr-only">الإجراءات</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((order) => (
                    <tr key={order.id} className="group transition-colors hover:bg-accent/20">
                      <td className="px-5 py-5 align-top">
                        <button
                          onClick={() => onDetails(order)}
                          className="font-bold text-forest underline-offset-4 hover:underline"
                          dir="ltr"
                        >
                          {order.id}
                        </button>
                        <p className="mt-2 whitespace-nowrap text-xs text-muted-foreground">
                          {formatOrderDate(order.date)}
                        </p>
                      </td>
                      <td className="max-w-60 px-5 py-5 align-top">
                        <p
                          className="max-w-44 truncate font-medium"
                          title={order.items.map((i) => i.name).join("، ")}
                        >
                          {order.items[0]?.name}
                          {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">{orderQuantity(order)}</p>
                      </td>
                      <td className="px-5 py-5 align-top">
                        <p>{order.city}</p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {orderAddress(order).district}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-5 align-top">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="whitespace-nowrap px-5 py-5 align-top text-xs font-medium">
                        {orderAmount(order)}
                        {order.total === undefined && (
                          <span className="mt-2 block text-[11px] font-normal text-muted-foreground">
                            يُحدّد في عرض السعر
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-5 align-top">
                        <button
                          onClick={() => onDetails(order)}
                          className="mb-2 flex items-center gap-1.5 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-bold text-primary hover:bg-accent"
                          aria-label={`تفاصيل الطلب ${order.id}`}
                        >
                          التفاصيل <ArrowUpLeft className="size-3.5" />
                        </button>
                        <Link
                          to="/dashboard/track"
                          search={{ order: order.id }}
                          className="block text-center text-xs text-muted-foreground hover:text-primary"
                        >
                          تتبّع الطلب
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-4 bg-muted/20 p-4 sm:grid-cols-2">
              {filtered.map((order) => (
                <article key={order.id} className="overflow-hidden rounded-2xl border bg-card">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b p-5">
                    <div>
                      <p className="mb-2 text-[11px] text-muted-foreground">رقم الطلب</p>
                      <button
                        onClick={() => onDetails(order)}
                        className="font-bold text-forest hover:underline"
                        dir="ltr"
                      >
                        {order.id}
                      </button>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>
                  <div className="space-y-4 p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                        <Package className="size-5" />
                      </span>
                      <div>
                        <p className="text-sm font-bold">
                          {order.items[0]?.name}
                          {order.items.length > 1 ? ` +${order.items.length - 1}` : ""}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">{orderQuantity(order)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">تاريخ الطلب</p>
                        <p className="mt-2">{formatOrderDate(order.date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">التوصيل</p>
                        <p className="mt-2 flex items-center gap-1">
                          <MapPin className="size-3" />
                          {order.city}، {orderAddress(order).district}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4 text-sm">
                      <span className="text-muted-foreground">المجموع</span>
                      <strong className="text-forest">{orderAmount(order)}</strong>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onDetails(order)}
                        aria-label={`تفاصيل الطلب ${order.id}`}
                        className="btn btn-primary !h-10 !px-3 text-xs"
                      >
                        عرض التفاصيل <ArrowUpLeft className="size-4" />
                      </button>
                      <Link
                        to="/dashboard/track"
                        search={{ order: order.id }}
                        className="btn btn-outline !h-10 !px-3 text-xs"
                      >
                        تتبّع الطلب
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
          <div className="flex flex-wrap justify-between gap-2 border-t px-5 py-3 text-xs text-muted-foreground">
            <p>
              عرض {filtered.length} من {orders.length} طلبات
            </p>
            <p>بيانات عرض تجريبي · الأسعار غير مؤكدة</p>
          </div>
        </div>
      )}
    </div>
  );
}
