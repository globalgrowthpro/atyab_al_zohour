import { createFileRoute } from "@tanstack/react-router";
import type { FormEvent } from "react";
import { toast } from "sonner";
import { Badge, DataTable, PageTitle, Panel } from "@/features/admin/shared";
import { Field, Grid, Select, Toggle } from "@/features/admin/form";

export const Route = createFileRoute("/admin/security")({ component: Security });

const sessions = [
  { device: "Chrome · Windows", place: "الرياض", time: "الآن", current: true },
  { device: "Safari · iPhone", place: "جدة", time: "منذ ساعتين", current: false },
  { device: "Edge · Windows", place: "الدمام", time: "أمس", current: false },
];
const log = [
  ["2026-10-21 10:12", "مدير النظام", "تسجيل دخول ناجح", "sage"],
  ["2026-10-21 09:40", "—", "محاولة دخول فاشلة (3 مرات)", "danger"],
  ["2026-10-20 18:05", "مدير النظام", "تعديل قائمة أسعار فئة أ", "gold"],
  ["2026-10-20 14:22", "مشرف الطلبات", "تغيير حالة ORD-1046", "muted"],
] as const;

function Security() {
  const save = (e: FormEvent) => { e.preventDefault(); toast.success("تم حفظ إعدادات الأمان (تجريبي)"); };
  return (
    <>
      <PageTitle title="الأمان" desc="الدخول والصلاحيات والجلسات وسجل النشاط." />
      <form onSubmit={save} className="space-y-6">
        <Panel title="الدخول والتحقق">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            <Toggle label="التحقق بخطوتين للإدارة" desc="رمز إضافي عند تسجيل الدخول" defaultChecked />
            <Toggle label="قفل الحساب بعد محاولات فاشلة" desc="بعد 5 محاولات لمدة 15 دقيقة" defaultChecked />
            <Toggle label="تنبيه بالبريد عند دخول من جهاز جديد" defaultChecked />
            <Toggle label="إلزام HTTPS" desc="تحويل كل الزيارات إلى اتصال آمن" defaultChecked />
          </div>
        </Panel>
        <Panel title="سياسة كلمات المرور والجلسات">
          <Grid>
            <Field label="أقل طول لكلمة المرور" type="number" defaultValue={10} />
            <Select label="انتهاء الجلسة بعد" defaultValue="60" options={[["30", "30 دقيقة"], ["60", "ساعة"], ["480", "8 ساعات"], ["1440", "يوم"]]} />
            <Toggle label="أحرف كبيرة وأرقام ورموز" defaultChecked />
            <Toggle label="منع إعادة استخدام آخر 5 كلمات مرور" />
          </Grid>
        </Panel>
        <Panel title="حماية النماذج">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            <Toggle label="تحقق ضد الروبوتات (CAPTCHA)" desc="في التسجيل وطلب عرض السعر والتواصل" defaultChecked />
            <Toggle label="تحديد عدد الطلبات" desc="منع الإرسال المتكرر من نفس العنوان" defaultChecked />
          </div>
          <div className="px-5 pb-5"><Field label="عناوين IP مسموحة للوحة الإدارة" placeholder="اتركه فارغاً للسماح للجميع" dir="ltr" /></div>
        </Panel>
        <button type="submit" className="btn btn-primary">حفظ الإعدادات</button>
      </form>

      <div className="mt-6 space-y-6">
        <Panel title="الجلسات النشطة" action={<button type="button" onClick={() => toast.success("تم إنهاء الجلسات الأخرى (تجريبي)")} className="text-xs font-bold text-destructive">إنهاء الجلسات الأخرى</button>}>
          <DataTable head={["الجهاز", "الموقع", "آخر نشاط", ""]}>
            {sessions.map((s) => (
              <tr key={s.device}><td dir="ltr" className="text-end font-bold">{s.device}</td><td>{s.place}</td><td>{s.time}</td>
                <td>{s.current ? <Badge tone="sage">الجلسة الحالية</Badge> : <button type="button" onClick={() => toast.success("تم إنهاء الجلسة")} className="text-xs font-bold text-destructive">إنهاء</button>}</td></tr>
            ))}
          </DataTable>
        </Panel>
        <Panel title="سجل النشاط">
          <DataTable head={["الوقت", "المستخدم", "الحدث"]}>
            {log.map(([t, u, e, tone]) => (
              <tr key={t + e}><td dir="ltr" className="text-end">{t}</td><td>{u}</td><td><Badge tone={tone}>{e}</Badge></td></tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}
