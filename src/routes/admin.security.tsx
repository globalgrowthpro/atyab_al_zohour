import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge, DataTable, ExportButton, PageTitle, Panel, SelectFilter, uniq } from "@/features/admin/shared";
import { type Tone } from "@/features/admin/data";
import { Field, Grid, Select, Toggle } from "@/features/admin/form";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/security")({ component: Security });

interface SessionItem {
  device: string;
  place: string;
  time: string;
  current: boolean;
}

const initialSessions: SessionItem[] = [
  { device: "Chrome · Windows", place: "الرياض", time: "الآن", current: true },
  { device: "Safari · iPhone", place: "جدة", time: "منذ ساعتين", current: false },
  { device: "Edge · Windows", place: "الدمام", time: "أمس", current: false },
];

const initialLog: Array<[string, string, string, Tone]> = [
  ["2026-10-21 10:12", "مدير النظام", "تسجيل دخول ناجح", "sage"],
  ["2026-10-21 09:40", "—", "محاولة دخول فاشلة (3 مرات)", "danger"],
  ["2026-10-20 18:05", "مدير النظام", "تعديل قائمة أسعار فئة أ", "gold"],
  ["2026-10-20 14:22", "مشرف الطلبات", "تغيير حالة ORD-1046", "muted"],
];

function Security() {
  const [sessions, setSessions] = useState<SessionItem[]>(initialSessions);
  const [logs, setLogs] = useState<Array<[string, string, string, Tone]>>(initialLog);
  const [user, setUser] = useState("all");

  useEffect(() => {
    let isMounted = true;
    async function fetchSecurityData() {
      try {
        const [logsRes, sessionsRes] = await Promise.all([
          supabase.from("security_logs").select("*").order("created_at", { ascending: false }).limit(20),
          supabase.from("user_sessions").select("*").order("created_at", { ascending: false }),
        ]);

        if (isMounted) {
          if (!logsRes.error && logsRes.data && logsRes.data.length > 0) {
            const formattedLogs: Array<[string, string, string, Tone]> = logsRes.data.map((l) => [
              l.created_at ? l.created_at.replace("T", " ").slice(0, 16) : "الآن",
              l.actor_name,
              l.description,
              (l.tone as Tone) || "sage",
            ]);
            setLogs(formattedLogs);
          }

          if (!sessionsRes.error && sessionsRes.data && sessionsRes.data.length > 0) {
            const formattedSessions: SessionItem[] = sessionsRes.data.map((s) => ({
              device: s.device,
              place: s.location || "الرياض",
              time: s.last_active ? s.last_active.replace("T", " ").slice(0, 16) : "الآن",
              current: Boolean(s.is_current),
            }));
            setSessions(formattedSessions);
          }
        }
      } catch (err) {
        console.warn("Security data Supabase load notice:", err);
      }
    }

    void fetchSecurityData();
    return () => {
      isMounted = false;
    };
  }, []);

  const logList = logs.filter((r) => user === "all" || r[1] === user);
  const save = (e: FormEvent) => { e.preventDefault(); toast.success("تم حفظ إعدادات الأمان"); };

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
        <Panel title="الجلسات النشطة" action={<button type="button" onClick={() => toast.success("تم إنهاء الجلسات الأخرى")} className="text-xs font-bold text-destructive">إنهاء الجلسات الأخرى</button>}>
          <DataTable head={["الجهاز", "الموقع", "آخر نشاط", ""]}>
            {sessions.map((s, idx) => (
              <tr key={`${s.device}-${idx}`}><td dir="ltr" className="text-end font-bold">{s.device}</td><td>{s.place}</td><td>{s.time}</td>
                <td>{s.current ? <Badge tone="sage">الجلسة الحالية</Badge> : <button type="button" onClick={() => toast.success("تم إنهاء الجلسة")} className="text-xs font-bold text-destructive">إنهاء</button>}</td></tr>
            ))}
          </DataTable>
        </Panel>
        <Panel title="سجل النشاط" action={<div className="flex gap-2"><SelectFilter label="المستخدم" value={user} onChange={setUser} options={uniq(logs.map((r) => r[1]))} /><ExportButton file="activity-log" sheet="سجل النشاط" rows={() => logList.map(([t, u, e]) => ({ "الوقت": t, "المستخدم": u, "الحدث": e }))} /></div>}>
          <DataTable head={["الوقت", "المستخدم", "الحدث"]}>
            {logList.map(([t, u, e, tone], idx) => (
              <tr key={`${t}-${idx}`}><td dir="ltr" className="text-end">{t}</td><td>{u}</td><td><Badge tone={tone}>{e}</Badge></td></tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </>
  );
}
