import { createFileRoute, Link } from "@tanstack/react-router";
import { Package, Truck, CheckCheck, AlertTriangle, ArrowLeft, Clock3, MapPin } from "lucide-react";
import { useCourier } from "@/features/courier/context";
import { demoCourierData } from "@/features/courier/data";
import { TaskBadge, taskCount } from "@/features/courier/shared";
export const Route = createFileRoute("/courier/")({ component: CourierOverview });
function CourierOverview() {
  const { data, save, saving } = useCourier();
  const stats = [
    ["مهام الجولة", data.tasks.length, Package],
    ["في الطريق", data.tasks.filter((task) => task.status === "out_for_delivery").length, Truck],
    ["تم تسليمها", data.tasks.filter((task) => task.status === "delivered").length, CheckCheck],
    ["تعذّر التسليم", data.tasks.filter((task) => task.status === "failed").length, AlertTriangle],
  ] as const;
  const active =
    data.tasks.find((task) => task.status === "out_for_delivery") ??
    data.tasks.find((task) => task.status === "accepted") ??
    data.tasks.find((task) => task.status === "assigned");
  const completed = data.tasks.filter((task) => task.status === "delivered").length;
  return (
    <div className="space-y-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="rounded-2xl bg-forest-gradient p-6 text-forest-foreground">
          <p className="mb-2 text-xs opacity-70">جولة العرض · 20 أكتوبر 2026</p>
          <h2 className="text-2xl !text-forest-foreground">
            أهلاً، {data.profile.name || "مندوب التوصيل"}
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 opacity-80">
            راجع مهامك، افحص الكميات، واتبع رحلة التسليم خطوة بخطوة.
          </p>
          <Link to="/courier/tasks" className="btn btn-rose mt-5 !h-10 !px-5 text-sm">
            عرض مهام الجولة <ArrowLeft className="size-4" />
          </Link>
        </div>
        <div className="flex flex-col justify-center rounded-2xl border bg-card p-6">
          <p className="text-xs text-muted-foreground">تقدّم الجولة التجريبية</p>
          <div className="mt-4 flex items-end gap-2">
            <strong className="text-4xl text-forest">{completed}</strong>
            <span className="pb-1 text-sm text-muted-foreground">من {data.tasks.length} مهام</span>
          </div>
          <div
            className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-label="تقدم تسليم الجولة"
            aria-valuenow={completed}
            aria-valuemin={0}
            aria-valuemax={data.tasks.length}
          >
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${data.tasks.length ? (completed / data.tasks.length) * 100 : 0}%` }}
            />
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">الطلبات المسلّمة فقط تُحتسب هنا</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {stats.map(([label, count, Icon]) => (
          <div key={label} className="flex items-center gap-3 rounded-2xl border bg-card p-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
              <Icon className="size-5" />
            </span>
            <div>
              <p className="text-[11px] text-muted-foreground">{label}</p>
              <strong className="mt-1 block text-2xl text-forest">{count}</strong>
            </div>
          </div>
        ))}
      </div>
      {active ? (
        <section className="overflow-hidden rounded-2xl border bg-card shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-5">
            <h3 className="text-base">المهمة التالية في جولتك</h3>
            <TaskBadge status={active.status} />
          </div>
          <div className="flex flex-wrap items-start gap-6 p-5">
            <div className="min-w-44 flex-1">
              <p className="mb-2 text-xs text-muted-foreground">
                <bdi>{active.id}</bdi> · <bdi>{active.orderId}</bdi>
              </p>
              <h4 className="text-lg">{active.customer}</h4>
              <p className="mt-3 flex gap-2 text-sm text-muted-foreground">
                <MapPin className="size-4 shrink-0 text-rose" />
                {active.city}، {active.district}، {active.street}
              </p>
            </div>
            <div className="space-y-3 text-xs">
              <p className="flex items-center gap-2">
                <Clock3 className="size-4 text-primary" />
                <bdi>{active.slot}</bdi>
              </p>
              <p>{taskCount(active)}</p>
              <Link
                to="/courier/map"
                search={{ task: active.id }}
                className="btn btn-primary !h-10 !px-4 text-xs"
              >
                فتح المهمة والمسار
              </Link>
            </div>
          </div>
        </section>
      ) : (
        <div className="rounded-2xl border bg-card p-8 text-center">
          <CheckCheck className="mx-auto mb-3 size-9 text-primary" />
          <h3 className="text-xl">لا توجد مهام نشطة</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            يمكنك مراجعة سجل الجولة أو إعادة بيانات العرض.
          </p>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed p-5">
        <p className="text-xs leading-6 text-muted-foreground">
          بيانات المندوب منفصلة عن حساب العميل. إعادة الجولة لا تمس الملف أو مسودات الدعم.
        </p>
        <button
          disabled={saving}
          onClick={() => {
            if (
              window.confirm(
                "إعادة حالات مهام العرض إلى بدايتها؟ سيتم الاحتفاظ بملف المندوب ومسودات الدعم.",
              )
            )
              void save({ ...data, tasks: demoCourierData().tasks });
          }}
          className="text-xs font-bold text-primary underline"
        >
          إعادة مهام العرض
        </button>
      </div>
    </div>
  );
}
