import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Search, List, LayoutGrid, ArrowUpLeft, MapPin, Clock3, Package } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { courierStatuses, type CourierTask } from "./data";
import { TaskBadge, taskCount } from "./shared";
export function TaskList({
  tasks,
  onDetails,
}: {
  tasks: CourierTask[];
  onDetails: (task: CourierTask) => void;
}) {
  const mobile = useIsMobile();
  const [chosenView, setView] = useState<"table" | "grid" | null>(null);
  const view = chosenView ?? (mobile ? "grid" : "table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const filtered = tasks.filter(
    (task) =>
      (!status || task.status === status) &&
      `${task.id} ${task.orderId} ${task.customer} ${task.district} ${task.street}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <label className="relative min-w-44 flex-1">
          <span className="sr-only">البحث في المهام</span>
          <Search className="absolute start-3.5 top-3 size-4 text-muted-foreground" />
          <input
            className="field !h-10 !ps-10 text-sm"
            type="search"
            placeholder="رقم المهمة، العميل، أو الحي…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <label>
          <span className="sr-only">حالة المهمة</span>
          <select
            className="field !h-10 !w-auto text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">كل الحالات</option>
            {Object.entries(courierStatuses).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <div
          role="group"
          aria-label="طريقة عرض المهام"
          className="flex rounded-xl border bg-muted/40 p-1"
        >
          {(["table", "grid"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setView(mode)}
              aria-pressed={view === mode}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold ${view === mode ? "bg-card text-primary shadow-sm" : "text-muted-foreground"}`}
            >
              {mode === "table" ? <List className="size-4" /> : <LayoutGrid className="size-4" />}
              {mode === "table" ? "جدول" : "كروت"}
            </button>
          ))}
        </div>
      </div>
      {!filtered.length ? (
        <div className="p-12 text-center">
          <Package className="mx-auto mb-3 size-9 text-primary" />
          <h3 className="text-lg">لا توجد مهام مطابقة</h3>
          <p className="mt-2 text-sm text-muted-foreground">جرّب تغيير البحث أو الحالة.</p>
          <button
            onClick={() => {
              setQuery("");
              setStatus("");
            }}
            className="mt-4 text-sm text-primary underline"
          >
            مسح الفلاتر
          </button>
        </div>
      ) : view === "table" ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-start text-sm">
            <caption className="sr-only">
              مهام التوصيل والعميل والعنوان والكميات والموعد والحالة
            </caption>
            <thead className="bg-muted/40 text-xs text-muted-foreground">
              <tr>
                {[
                  "المهمة / الطلب",
                  "العميل والعنوان",
                  "الكميات",
                  "الموعد",
                  "الحالة",
                  "الإجراء",
                ].map((label) => (
                  <th key={label} scope="col" className="px-4 py-4 text-start font-medium">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((task) => (
                <tr key={task.id} className="hover:bg-accent/15">
                  <td className="px-4 py-5 align-top">
                    <button
                      onClick={() => onDetails(task)}
                      className="font-bold text-primary"
                      dir="ltr"
                    >
                      {task.id}
                    </button>
                    <p className="mt-2 text-[11px] text-muted-foreground" dir="ltr">
                      {task.orderId}
                    </p>
                    {task.priority === "high" && (
                      <span className="mt-2 inline-block rounded bg-blush/70 px-1.5 py-0.5 text-[10px] text-rose">
                        أولوية مرتفعة
                      </span>
                    )}
                  </td>
                  <td className="max-w-56 px-4 py-5 align-top">
                    <p className="max-w-48 truncate font-medium" title={task.customer}>
                      {task.customer}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {task.city}، {task.district}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{task.street}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-top text-xs">
                    {taskCount(task)}
                    <span className="mt-2 block text-[11px] text-muted-foreground">
                      {task.items.length} أصناف
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-5 align-top">
                    <bdi className="text-xs">{task.slot}</bdi>
                    <p className="mt-2 text-[11px] text-muted-foreground">{task.date}</p>
                  </td>
                  <td className="px-4 py-5 align-top">
                    <TaskBadge status={task.status} />
                  </td>
                  <td className="px-4 py-5 align-top">
                    <button
                      onClick={() => onDetails(task)}
                      aria-label={`تفاصيل المهمة ${task.id}`}
                      className="mb-2 flex items-center gap-1 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-bold text-primary"
                    >
                      التفاصيل <ArrowUpLeft className="size-3.5" />
                    </button>
                    <Link
                      to="/courier/map"
                      search={{ task: task.id }}
                      className="block text-center text-xs text-muted-foreground hover:text-primary"
                    >
                      المسار
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid gap-4 bg-muted/15 p-4 sm:grid-cols-2">
          {filtered.map((task) => (
            <article key={task.id} className="overflow-hidden rounded-2xl border bg-card">
              <div className="flex justify-between gap-3 border-b p-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">مهمة توصيل</p>
                  <strong className="mt-1 block text-sm" dir="ltr">
                    {task.id}
                  </strong>
                </div>
                <TaskBadge status={task.status} />
              </div>
              <div className="space-y-4 p-4">
                <p className="text-sm font-bold">{task.customer}</p>
                <p className="flex gap-2 text-xs leading-6 text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-rose" />
                  {task.city}، {task.district}، {task.street}
                </p>
                <div className="flex flex-wrap justify-between gap-2 rounded-xl bg-muted/40 p-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Clock3 className="size-3.5" />
                    <bdi>{task.slot}</bdi>
                  </span>
                  <strong>{taskCount(task)}</strong>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    aria-label={`تفاصيل المهمة ${task.id}`}
                    onClick={() => onDetails(task)}
                    className="btn btn-primary !h-10 !px-3 text-xs"
                  >
                    التفاصيل والإجراء
                  </button>
                  <Link
                    to="/courier/map"
                    search={{ task: task.id }}
                    className="btn btn-outline !h-10 !px-3 text-xs"
                  >
                    مسار التوصيل
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      <div className="flex justify-between border-t px-4 py-3 text-[11px] text-muted-foreground">
        <span>
          {filtered.length} من {tasks.length} مهام
        </span>
        <span>مهام تجريبية فقط</span>
      </div>
    </div>
  );
}
