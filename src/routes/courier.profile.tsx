import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { UserRound } from "lucide-react";
import { useCourier } from "@/features/courier/context";
import { courierProfileSchema } from "@/features/courier/data";
export const Route = createFileRoute("/courier/profile")({ component: CourierProfile });
export function CourierProfile() {
  const { data, save, saving } = useCourier();
  const [profile, setProfile] = useState(data.profile);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const parsed = courierProfileSchema.safeParse(profile);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "راجع البيانات");
      return;
    }
    setError("");
    await save({ ...data, profile: parsed.data });
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">ملفي الشخصي</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          بيانات المندوب في هذه التجربة، محفوظة على المتصفح فقط.
        </p>
      </div>
      <form
        onSubmit={(event) => void submit(event)}
        className="space-y-6 rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="flex items-center gap-4 border-b pb-5">
          <span className="grid size-14 place-items-center rounded-2xl bg-accent text-primary">
            <UserRound className="size-7" />
          </span>
          <div>
            <h3 className="text-lg">{data.profile.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">مندوب توصيل · عرض تجريبي</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["name", "اسم المندوب", "text", "name"],
              ["phone", "رقم الجوال", "tel", "tel"],
              ["city", "مدينة الجولة", "text", "address-level2"],
              ["vehicle", "المركبة (اختياري)", "text", "off"],
            ] as const
          ).map(([key, label, type, autoComplete]) => (
            <label key={key} className="block space-y-2 text-sm">
              <span>{label}</span>
              <input
                className="field"
                type={type}
                autoComplete={autoComplete}
                required={key !== "vehicle"}
                maxLength={key === "phone" ? 25 : 120}
                value={profile[key]}
                onChange={(event) =>
                  setProfile((current) => ({ ...current, [key]: event.target.value }))
                }
              />
            </label>
          ))}
        </div>
        <p className="rounded-xl bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
          تغيير مدينة الملف لا ينقل المهام أو يعيد إسنادها؛ عناوين المهام تبقى كما هي.
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? "جارٍ الحفظ…" : "حفظ البيانات محلياً"}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => {
              setProfile(data.profile);
              setError("");
            }}
            className="btn btn-outline"
          >
            إلغاء التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}
