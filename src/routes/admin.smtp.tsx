import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge, PageTitle, Panel } from "@/features/admin/shared";
import { Field, Grid, Select, Toggle } from "@/features/admin/form";

export const Route = createFileRoute("/admin/smtp")({ component: Smtp });

const templates = [
  ["تأكيد استلام الطلب", "يُرسل للعميل عند إنشاء طلب جديد"],
  ["تحديث حالة الطلب", "عند تغيير الحالة إلى قيد التجهيز أو مع المندوب أو تم التسليم"],
  ["عرض سعر جديد", "عند إرسال عرض سعر للعميل"],
  ["تفعيل الحساب", "عند موافقة الإدارة على حساب عميل جديد"],
  ["إعادة تعيين كلمة المرور", "رابط إعادة التعيين للمستخدم"],
  ["تنبيه نفاد المخزون", "يُرسل للإدارة عند نفاد منتج"],
] as const;

function Smtp() {
  const [testTo, setTestTo] = useState("");
  const save = (e: FormEvent) => { e.preventDefault(); toast.success("تم حفظ إعدادات البريد (تجريبي)"); };
  const test = () => (testTo ? toast.success(`تم إرسال رسالة تجريبية إلى ${testTo} (تجريبي)`) : toast.error("أدخل بريداً لإرسال الرسالة التجريبية"));
  return (
    <>
      <PageTitle title="البريد الإلكتروني (SMTP)" desc="خادم إرسال الرسائل وقوالب الإشعارات." action={<Badge tone="muted">غير متصل</Badge>} />
      <form onSubmit={save} className="space-y-6">
        <Panel title="خادم الإرسال">
          <Grid>
            <Field label="خادم SMTP" placeholder="smtp.example.com" dir="ltr" />
            <Field label="المنفذ" type="number" defaultValue={587} dir="ltr" />
            <Select label="التشفير" defaultValue="tls" options={[["tls", "STARTTLS"], ["ssl", "SSL/TLS"], ["none", "بدون"]]} />
            <Field label="اسم المستخدم" dir="ltr" autoComplete="off" />
            <Field label="كلمة المرور" type="password" dir="ltr" autoComplete="new-password" hint="تُحفظ بشكل آمن عند ربط الخادم." />
          </Grid>
        </Panel>
        <Panel title="بيانات المرسل">
          <Grid>
            <Field label="اسم المرسل" defaultValue="أطيب الزهور" />
            <Field label="بريد المرسل" type="email" placeholder="لم يُضف بعد" dir="ltr" />
            <Field label="بريد الرد" type="email" placeholder="لم يُضف بعد" dir="ltr" />
            <Field label="نسخة مخفية للإدارة" type="email" placeholder="اختياري" dir="ltr" />
          </Grid>
        </Panel>
        <Panel title="قوالب الإشعارات">
          <div className="grid gap-3 p-5 md:grid-cols-2">
            {templates.map(([t, d]) => <Toggle key={t} label={t} desc={d} defaultChecked />)}
          </div>
        </Panel>
        <Panel title="رسالة تجريبية">
          <div className="flex flex-wrap items-end gap-3 p-5">
            <div className="min-w-[240px] flex-1"><Field label="أرسل إلى" type="email" dir="ltr" value={testTo} onChange={(e) => setTestTo(e.target.value)} /></div>
            <button type="button" onClick={test} className="btn btn-outline">إرسال تجربة</button>
          </div>
        </Panel>
        <button type="submit" className="btn btn-primary">حفظ الإعدادات</button>
      </form>
    </>
  );
}
