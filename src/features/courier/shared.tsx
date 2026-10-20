import { Link } from "@tanstack/react-router";
import { Package, MapPin, UserRound, ArrowUpLeft } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { courierStatuses, type CourierTask } from "./data";
import { TaskActions } from "./task-actions";

export function TaskBadge({ status }: { status: CourierTask["status"] }) {
  const colors = {
    assigned: "bg-muted text-muted-foreground",
    accepted: "bg-accent text-primary",
    out_for_delivery: "bg-blush text-[#a93360]",
    delivered: "bg-primary/10 text-primary",
    failed: "bg-[#fcf0df] text-[#936321]",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${colors[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {courierStatuses[status]}
    </span>
  );
}
export function taskCount(task: CourierTask) {
  const quantities = task.items.reduce<Record<string, number>>((result, item) => {
    result[item.unit] = (result[item.unit] ?? 0) + item.qty;
    return result;
  }, {});
  return Object.entries(quantities)
    .map(([unit, qty]) => `${qty} ${unit}`)
    .join("، ");
}
export function TaskDrawer({
  task,
  open,
  onClose,
}: {
  task: CourierTask | undefined;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose();
      }}
    >
      <SheetContent
        side="left"
        dir="rtl"
        className="!w-full overflow-y-auto !p-0 sm:!max-w-[640px]"
      >
        <div className="border-b bg-surface px-6 pb-6 pt-12">
          <p className="mb-3 text-xs font-bold text-rose">تفاصيل مهمة التوصيل</p>
          <SheetTitle className="!text-start !text-2xl">
            <bdi>{task?.id ?? "مهمة غير موجودة"}</bdi>
          </SheetTitle>
          <SheetDescription className="mt-2 !text-start">
            تفاصيل العميل والبنود وإجراءات التسليم التجريبية.
          </SheetDescription>
          {task && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <TaskBadge status={task.status} />
              <span className="text-xs text-muted-foreground">
                الطلب <bdi>{task.orderId}</bdi>
              </span>
            </div>
          )}
        </div>
        {!task ? (
          <p role="alert" className="p-6">
            هذه المهمة غير موجودة ضمن بيانات المندوب.
          </p>
        ) : (
          <div className="space-y-6 p-5 sm:p-6">
            <section className="rounded-2xl border p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm">
                <UserRound className="size-4 text-primary" />
                العميل
              </h3>
              <p className="font-bold">{task.customer}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                رقم هاتف العميل غير متاح في العرض التجريبي.
              </p>
            </section>
            <section className="rounded-2xl bg-muted/50 p-5">
              <h3 className="mb-3 flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-rose" />
                عنوان التسليم (مثال)
              </h3>
              <p className="font-bold">
                {task.city}، {task.district}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{task.street}</p>
              <p className="mt-4 border-t pt-3 text-xs">
                نافذة التسليم التجريبية: <bdi>{task.slot}</bdi> · {task.date}
              </p>
            </section>
            <section>
              <div className="mb-3 flex justify-between">
                <h3 className="text-sm">بنود الطلب</h3>
                <span className="text-xs text-muted-foreground">{taskCount(task)}</span>
              </div>
              <ul className="divide-y rounded-2xl border">
                {task.items.map((item) => (
                  <li key={item.sku} className="flex items-center gap-3 p-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-accent text-primary">
                      <Package className="size-4" />
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-bold">{item.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.sku}</p>
                    </div>
                    <strong className="text-sm">
                      {item.qty} {item.unit}
                    </strong>
                  </li>
                ))}
              </ul>
            </section>
            <p className="rounded-xl bg-blush/40 p-4 text-sm leading-7">{task.instruction}</p>
            <div className="border-t pt-5">
              <h3 className="mb-4 text-base">إجراء المهمة</h3>
              <TaskActions key={task.id} task={task} />
            </div>
            <Link
              to="/courier/map"
              search={{ task: task.id }}
              onClick={onClose}
              className="btn btn-outline w-full text-sm"
            >
              فتح مسار التوصيل <ArrowUpLeft className="size-4" />
            </Link>
            <details className="rounded-xl border">
              <summary className="cursor-pointer p-4 text-sm font-bold">سجل تحديثات المهمة</summary>
              <ul className="divide-y border-t px-4">
                {task.events.map((event, index) => (
                  <li key={index} className="py-3">
                    <p className="text-sm font-bold">{event.label}</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{event.note}</p>
                    <time className="mt-1 block text-[10px] text-muted-foreground">
                      {new Date(event.at).toLocaleString("ar-EG", { timeZone: "Africa/Cairo" })}
                    </time>
                  </li>
                ))}
              </ul>
            </details>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
