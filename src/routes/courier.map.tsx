import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, Package, UserRound, ArrowUpLeft } from "lucide-react";
import { useCourier } from "@/features/courier/context";
import { taskAsOrder } from "@/features/courier/data";
import { TaskBadge, taskCount } from "@/features/courier/shared";
import { TaskActions } from "@/features/courier/task-actions";
import { DeliveryMap } from "@/features/client/geographic-map";
import { courierRoute } from "@/features/courier/routes";
export const Route = createFileRoute("/courier/map")({
  validateSearch: (search: Record<string, unknown>): { task?: string | undefined } => ({
    task: typeof search["task"] === "string" ? search["task"] : undefined,
  }),
  component: CourierRoute,
});
function CourierRoute() {
  const { data } = useCourier();
  const { task: id } = Route.useSearch();
  const navigate = useNavigate();
  const task = id
    ? data.tasks.find((task) => task.id === id)
    : (data.tasks.find((task) => task.status === "out_for_delivery") ?? data.tasks[0]);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl">مسار التوصيل</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            راجع الوجهة والكميات وحدّث حالة مهمتك.
          </p>
        </div>
        <label className="space-y-2">
          <span className="block text-xs text-muted-foreground">اختر مهمة التوصيل</span>
          <select
            className="field !h-10 !w-auto max-w-full text-xs"
            value={task?.id ?? ""}
            onChange={(e) =>
              void navigate({
                to: "/courier/map",
                search: { task: e.target.value },
                resetScroll: false,
              })
            }
          >
            {!task && <option value="">اختر مهمة</option>}
            {data.tasks.map((item) => (
              <option key={item.id} value={item.id}>
                {item.id} · {item.district}
              </option>
            ))}
          </select>
        </label>
      </div>
      {!task ? (
        <p role="alert" className="rounded-2xl border bg-card p-6">
          المهمة غير موجودة. اختر مهمة من القائمة.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card px-5 py-4">
            <div className="flex flex-wrap items-center gap-3">
              <strong dir="ltr">{task.id}</strong>
              <TaskBadge status={task.status} />
              <span className="text-xs text-muted-foreground">
                <bdi>{task.slot}</bdi> · وقت تمثيلي
              </span>
            </div>
            <Link
              to="/courier/tasks"
              search={{ task: task.id }}
              className="flex items-center gap-1 text-xs font-bold text-primary"
            >
              كل تفاصيل المهمة <ArrowUpLeft className="size-4" />
            </Link>
          </div>
          <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
            <DeliveryMap order={taskAsOrder(task)} route={courierRoute(task)} />
            <aside className="space-y-5 rounded-2xl border bg-card p-5">
              <div>
                <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <UserRound className="size-4" />
                  العميل التجريبي
                </p>
                <h3 className="text-sm">{task.customer}</h3>
              </div>
              <div className="border-t pt-4">
                <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-4 text-rose" />
                  عنوان التسليم
                </p>
                <p className="text-sm font-bold">
                  {task.city}، {task.district}
                </p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">{task.street}</p>
              </div>
              <div className="border-t pt-4">
                <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
                  <Package className="size-4" />
                  حمولة الطلب
                </p>
                <strong className="text-sm">{taskCount(task)}</strong>
                <ul className="mt-3 space-y-2">
                  {task.items.map((item) => (
                    <li key={item.sku} className="flex justify-between gap-2 text-xs">
                      <span>{item.name}</span>
                      <span>
                        {item.qty} {item.unit}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="rounded-xl bg-muted/50 p-3 text-xs leading-6">{task.instruction}</p>
            </aside>
          </div>
          {task.status === "failed" && (
            <p className="rounded-xl border border-[#d7bc76]/40 bg-[#fbf5e5] p-4 text-sm">
              تعذّر التسليم في هذه التجربة. الخريطة تُظهر آخر موضع تمثيلي للمهمة، وليست رحلة حية.
            </p>
          )}
          <section className="rounded-2xl border bg-card p-5 sm:p-6">
            <h3 className="mb-2 text-base">تحديث حالة المهمة</h3>
            <p className="mb-5 text-xs leading-6 text-muted-foreground">
              راجع المنتجات والعنوان قبل تنفيذ الإجراء. التغيير يخص هذه التجربة فقط.
            </p>
            <TaskActions key={task.id} task={task} />
          </section>
          <Link
            to="/courier/support"
            search={{ task: task.id }}
            className="text-xs font-bold text-primary underline"
          >
            أحتاج مساعدة بخصوص هذه المهمة
          </Link>
        </>
      )}
    </div>
  );
}
