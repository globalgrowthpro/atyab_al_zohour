import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { MapPin, Plus, Trash2, CheckCircle2, Building2 } from "lucide-react";
import { useClientData } from "@/features/client/context";
import {
  profileSchema,
  clientAddressSchema,
  upsertClientAddress,
  deleteClientAddress,
  type ClientAddress,
} from "@/features/client/data";
import { toast } from "sonner";

export const Route = createFileRoute("/dashboard/profile")({ component: ProfilePage });

export function ProfilePage() {
  const { loading } = useClientData();
  if (loading) {
    return <p className="text-sm text-muted-foreground">جارٍ تحميل البيانات…</p>;
  }
  return (
    <div className="space-y-10">
      <ProfileForm />
      <AddressBook />
    </div>
  );
}

function ProfileForm() {
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
        <h2 className="text-2xl">الملف الشخصي للمنشأة</h2>
        <p className="mt-2 text-sm leading-7 text-muted-foreground">
          إدارة بيانات المنشأة وعناوين التوريد والتوصيل المعتمدة لطلبات الجملة.
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

function AddressBook() {
  const { data, save } = useClientData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<ClientAddress>>({
    label: "",
    city: data.profile.city || "الرياض",
    district: "",
    street: "",
    building: "",
    notes: "",
    isDefault: false,
  });
  const [formError, setFormError] = useState("");

  const addresses = data.addresses || [];

  const handleAddAddress = async (e: FormEvent) => {
    e.preventDefault();
    const newId = `ADDR-${Math.floor(1000 + Math.random() * 9000)}`;
    const parsed = clientAddressSchema.safeParse({
      ...addressForm,
      id: newId,
      isDefault: addresses.length === 0 ? true : Boolean(addressForm.isDefault),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message || "راجع بيانات العنوان");
      return;
    }

    setFormError("");
    const newAddress = parsed.data;
    let updatedList = [...addresses, newAddress];
    if (newAddress.isDefault) {
      updatedList = updatedList.map((a) =>
        a.id === newAddress.id ? a : { ...a, isDefault: false }
      );
    }

    await upsertClientAddress(newAddress, data.profile.phone || "0500000000");
    await save({ ...data, addresses: updatedList });
    toast.success("تمت إضافة عنوان التوريد بنجاح ومزامنته سحابياً");
    setShowAddForm(false);
    setAddressForm({
      label: "",
      city: data.profile.city || "الرياض",
      district: "",
      street: "",
      building: "",
      notes: "",
      isDefault: false,
    });
  };

  const handleDeleteAddress = async (id: string) => {
    const confirm = window.confirm("هل أنت متأكد من حذف هذا العنوان؟");
    if (!confirm) return;

    await deleteClientAddress(id);
    const updated = addresses.filter((a) => a.id !== id);
    await save({ ...data, addresses: updated });
    toast.success("تم حذف العنوان بنجاح");
  };

  const handleSetDefault = async (id: string) => {
    const target = addresses.find((a) => a.id === id);
    if (!target) return;
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    await upsertClientAddress({ ...target, isDefault: true }, data.profile.phone || "0500000000");
    await save({ ...data, addresses: updated });
    toast.success(`تم تعيين "${target.label}" كعنوان توريد رئيسي`);
  };

  return (
    <div className="space-y-6 pt-4 border-t">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl flex items-center gap-2">
            <Building2 className="size-6 text-rose" />
            دليل الفروع وعناوين الاستلام المتعددة
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            أضف فروعك ومستودعاتك لتحديد جهة التسليم مباشرة بضغطة زر عند الطلب.
          </p>
        </div>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="btn btn-outline flex items-center gap-2 text-sm"
          >
            <Plus className="size-4" />
            إضافة عنوان فرع جديد
          </button>
        )}
      </div>

      {showAddForm && (
        <form
          onSubmit={(e) => void handleAddAddress(e)}
          className="space-y-4 rounded-3xl border-2 border-primary/20 bg-card p-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">بيانات العنوان / الفرع الجديد</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-muted-foreground hover:underline"
            >
              إلغاء
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-1">
              <span className="text-xs font-medium">اسم الفرع / التسمية *</span>
              <input
                className="field text-sm"
                required
                placeholder="مثال: الفرع الرئيسي - العليا"
                value={addressForm.label}
                onChange={(e) => setAddressForm((f) => ({ ...f, label: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">المدينة *</span>
              <input
                className="field text-sm"
                required
                value={addressForm.city}
                onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">الحي *</span>
              <input
                className="field text-sm"
                required
                placeholder="مثال: الورود"
                value={addressForm.district}
                onChange={(e) => setAddressForm((f) => ({ ...f, district: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">الشارع *</span>
              <input
                className="field text-sm"
                required
                placeholder="مثال: طريق الملك فهد"
                value={addressForm.street}
                onChange={(e) => setAddressForm((f) => ({ ...f, street: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">رقم المبنى / المحل (اختياري)</span>
              <input
                className="field text-sm"
                placeholder="مثال: عمارة رقم 14 - محل زهور"
                value={addressForm.building}
                onChange={(e) => setAddressForm((f) => ({ ...f, building: e.target.value }))}
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">ملاحظات التوصيل وسلسلة التبريد</span>
              <input
                className="field text-sm"
                placeholder="مثال: الدخول من البوابة الخلفية للمبرد"
                value={addressForm.notes}
                onChange={(e) => setAddressForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </label>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-2">
            <input
              type="checkbox"
              className="rounded border-input size-4 text-primary"
              checked={Boolean(addressForm.isDefault)}
              onChange={(e) => setAddressForm((f) => ({ ...f, isDefault: e.target.checked }))}
            />
            <span className="text-sm">تعيين هذا العنوان كعنوان رئيسي مفضل</span>
          </label>

          {formError && <p className="text-xs text-destructive">{formError}</p>}

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn btn-primary text-sm">
              حفظ وتثبيت العنوان
            </button>
            <button
              type="button"
              className="btn btn-outline text-sm"
              onClick={() => setShowAddForm(false)}
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed p-6 text-center text-muted-foreground">
          <MapPin className="mx-auto size-8 opacity-40 mb-2" />
          <p className="text-sm">لا توجد عناوين فرعية مسجلة حالياً. يُستخدم العنوان المسجل في ملف المنشأة كعنوان افتراضي.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`rounded-2xl border p-5 shadow-soft relative transition-all ${
                addr.isDefault ? "bg-forest/5 border-forest/30" : "bg-card border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-forest/10 px-2 py-0.5 text-xs font-bold text-forest">
                        <CheckCircle2 className="size-3" />
                        رئيسي
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {addr.city} · {addr.district}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {addr.street} {addr.building ? `· ${addr.building}` : ""}
                  </p>
                  {addr.notes && (
                    <p className="mt-2 text-xs text-muted-foreground/80 bg-background/50 p-2 rounded-lg border">
                      {addr.notes}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteAddress(addr.id)}
                  className="text-muted-foreground hover:text-destructive p-1 rounded-lg transition-colors"
                  title="حذف هذا العنوان"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>

              {!addr.isDefault && (
                <div className="mt-4 pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => void handleSetDefault(addr.id)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    تعيين كعنوان رئيسي
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
