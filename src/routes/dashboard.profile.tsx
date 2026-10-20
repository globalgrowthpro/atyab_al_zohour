import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useClientData } from "@/features/client/context";
import { profileSchema } from "@/features/client/data";
export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });
export function ProfilePage() {
  const { data, save, saving } = useClientData();
  const [profile, setProfile] = useState(data.profile);
  const [error, setError] = useState("");
  async function submit(event: FormEvent) {
    event.preventDefault();
    const result = profileSchema.safeParse(profile);
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "راجع البيانات المدخلة");
      return;
    }
    setError("");
    await save({ ...data, profile: result.data });
  }
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl">الملف الشخصي</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          بيانات التجربة محفوظة في هذا المتصفح. هذا النموذج لا ينشئ حساباً ولا يغيّر بيانات حساب
          فعلي.
        </p>
      </div>
      <form
        onSubmit={(e) => void submit(e)}
        className="space-y-6 rounded-3xl border bg-card p-6 shadow-soft"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {(
            [
              ["name", "الاسم الكامل", "text", "name"],
              ["company", "اسم المنشأة", "text", "organization"],
              ["phone", "رقم الجوال", "tel", "tel"],
              ["email", "البريد الإلكتروني (اختياري)", "email", "email"],
              ["city", "المدينة", "text", "address-level2"],
              ["district", "الحي", "text", "address-level3"],
            ] as const
          ).map(([key, label, type, autoComplete]) => (
            <label key={key} className="block space-y-2">
              <span>{label}</span>
              <input
                className="field"
                required={key !== "email"}
                type={type}
                autoComplete={autoComplete}
                maxLength={key === "phone" ? 25 : 160}
                value={profile[key]}
                onChange={(e) => setProfile((p) => ({ ...p, [key]: e.target.value }))}
              />
            </label>
          ))}
        </div>
        <label className="block space-y-2">
          <span>تفاصيل العنوان (اختياري)</span>
          <textarea
            className="field !h-auto py-3"
            autoComplete="street-address"
            rows={3}
            maxLength={500}
            value={profile.address}
            onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
          />
        </label>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button disabled={saving} className="btn btn-primary" type="submit">
            {saving ? "جارٍ الحفظ…" : "حفظ البيانات محلياً"}
          </button>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setProfile(data.profile);
              setError("");
            }}
          >
            إلغاء التعديلات
          </button>
        </div>
      </form>
    </div>
  );
}
