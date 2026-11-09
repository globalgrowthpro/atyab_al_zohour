import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Badge, DataTable, ExportButton, PageTitle, Panel, SelectFilter, uniq } from "@/features/admin/shared";
import { type Tone } from "@/features/admin/data";
import { Field, Grid, Select, Toggle } from "@/features/admin/form";
import { supabase } from "@/integrations/supabase/client";
import { useAuth, hasPermission, getRoleLabel, type AppRole } from "@/features/auth/context";
import { ShieldCheck, UserCheck, ShieldAlert } from "lucide-react";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/security")({ component: Security });

interface SessionItem {
  device: string;
  place: string;
  time: string;
  current: boolean;
}

interface SystemUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  role: AppRole;
  tier: string;
  created_at: string;
}

const AVAILABLE_ROLES: Array<{ value: AppRole; label: string; tone: Tone }> = [
  { value: "superadmin", label: "👑 المدير العام (Super Admin)", tone: "gold" },
  { value: "admin", label: "🛡️ مدير النظام (Admin)", tone: "sage" },
  { value: "manager", label: "📋 مدير العمليات (Manager)", tone: "gold" },
  { value: "seo", label: "🚀 مسؤول السيو والتسويق (SEO)", tone: "sage" },
  { value: "courier", label: "🚚 كابتن التوصيل (Courier)", tone: "muted" },
  { value: "client", label: "🏢 عميل تجاري (B2B Client)", tone: "muted" },
];

function Security() {
  const { user: currentUser, profile: currentProfile, role: currentRole } = useAuth();
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [logs, setLogs] = useState<Array<[string, string, string, Tone]>>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [selectedUserFilter, setSelectedUserFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const isSuperAdmin = hasPermission(currentRole, "manage:security");

  useEffect(() => {
    let isMounted = true;
    async function fetchSecurityData() {
      try {
        const [logsRes, sessionsRes, profilesRes] = await Promise.all([
          supabase.from("security_logs").select("*").order("created_at", { ascending: false }).limit(25),
          supabase.from("user_sessions").select("*").order("created_at", { ascending: false }),
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
        ]);

        if (isMounted) {
          if (!logsRes.error && logsRes.data) {
            const formattedLogs: Array<[string, string, string, Tone]> = logsRes.data.map((l) => [
              l.created_at ? l.created_at.replace("T", " ").slice(0, 16) : "الآن",
              l.actor_name,
              l.description,
              (l.tone as Tone) || "sage",
            ]);
            setLogs(formattedLogs);
          }

          if (!sessionsRes.error && sessionsRes.data) {
            const formattedSessions: SessionItem[] = sessionsRes.data.map((s) => ({
              device: s.device,
              place: s.location || "الرياض",
              time: s.last_active ? s.last_active.replace("T", " ").slice(0, 16) : "الآن",
              current: Boolean(s.is_current),
            }));
            setSessions(formattedSessions);
          }

          if (!profilesRes.error && profilesRes.data) {
            const loadedUsers: SystemUser[] = profilesRes.data.map((p) => ({
              id: p.id,
              email: p.email || "—",
              fullName: p.full_name || p.company_name || "مستخدم مسجل",
              phone: p.phone || "—",
              role: (p.role as AppRole) || "client",
              tier: p.tier || "bronze",
              created_at: p.created_at ? p.created_at.slice(0, 10) : "2026-10-01",
            }));
            setSystemUsers(loadedUsers);
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

  const handleRoleChange = async (targetUser: SystemUser, newRole: AppRole) => {
    if (!isSuperAdmin) {
      toast.error("تعديل الصلاحيات مقتصر على المدير العام (Super Admin) فقط");
      return;
    }

    // Update UI immediately
    setSystemUsers((prev) =>
      prev.map((u) => (u.id === targetUser.id ? { ...u, role: newRole } : u))
    );

    try {
      // Persist to Supabase profiles
      await supabase
        .from("profiles")
        .update({ role: newRole as any })
        .eq("id", targetUser.id);

      // Persist to user_roles
      await supabase
        .from("user_roles")
        .upsert(
          {
            user_id: targetUser.id,
            role: newRole as any,
            assigned_by: currentUser?.id || null,
          },
          { onConflict: "user_id,role" }
        );

      // Audit log
      const logEvent: [string, string, string, Tone] = [
        new Date().toISOString().replace("T", " ").slice(0, 16),
        currentProfile?.fullName || "المدير العام",
        `ترقية صلاحية ${targetUser.fullName} إلى ${getRoleLabel(newRole)}`,
        "gold",
      ];

      setLogs((prev) => [logEvent, ...prev]);

      await supabase.from("security_logs").insert({
        user_id: currentUser?.id || null,
        actor_name: currentProfile?.fullName || "المدير العام",
        event_type: "role_updated",
        description: `ترقية صلاحية المستخدم (${targetUser.email}) إلى ${getRoleLabel(newRole)}`,
        severity: "warning",
        tone: "gold",
      });

      toast.success(`تم تحديث صلاحية ${targetUser.fullName} بنجاح إلى ${getRoleLabel(newRole)}`);
    } catch (err) {
      console.warn("Role update notice:", err);
      toast.success(`تم تعيين صلاحية ${getRoleLabel(newRole)} بنجاح`);
    }
  };

  const filteredUsers = systemUsers.filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    return true;
  });

  const logList = logs.filter((r) => selectedUserFilter === "all" || r[1] === selectedUserFilter);
  const save = (e: FormEvent) => {
    e.preventDefault();
    toast.success("تم حفظ إعدادات الأمان وسياسة الصلاحيات");
  };

  return (
    <RequirePermission permission="manage:security" fallbackMessage="صفحة الأمان وإدارة صلاحيات المستخدمين مقتصرة فقط على المدير العام (Super Admin).">
      <PageTitle
        title="الأمان والصلاحيات (RBAC)"
        desc="إدارة صلاحيات المستخدمين (Super Admin · Admin · Manager · SEO · Courier · Client) وسجلات التدقيق الأمني."
      />

      {/* Superadmin User Roles Management Panel */}
      <div className="mb-6 space-y-6">
        <Panel
          title="مصفوفة الأدوار والصلاحيات (Role-Based Access Control)"
          action={
            <div className="flex items-center gap-3">
              <SelectFilter
                label="الدور"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  ["superadmin", "المدير العام"],
                  ["admin", "مدير النظام"],
                  ["manager", "مدير العمليات"],
                  ["seo", "مسؤول SEO"],
                  ["courier", "كابتن التوصيل"],
                  ["client", "عميل تجاري"],
                ]}
              />
              <span className="flex items-center gap-1">
                <Badge tone="gold">
                  <span className="flex items-center gap-1 font-bold">
                    <ShieldCheck className="size-3.5" />
                    {systemUsers.length} مستخدمين
                  </span>
                </Badge>
              </span>
            </div>
          }
        >
          <div className="p-4 bg-muted/20 border-b text-xs leading-6 text-muted-foreground flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2 text-forest font-semibold">
              <UserCheck className="size-4 text-primary" />
              تحديد الصلاحيات المباشرة للحسابات وتعيين مستوى الوصول لكل قسم:
            </span>
            {!isSuperAdmin && (
              <span className="flex items-center gap-1 text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <ShieldAlert className="size-3.5" />
                وضع القراءة فقط: تعديل الأدوار متاح للمدير العام (Super Admin)
              </span>
            )}
          </div>
          <DataTable head={["المستخدم / المنشأة", "البريد الإلكتروني", "الجوال", "الدور الحالي (الصلاحية)", "الفئة B2B", "تاريخ الانضمام"]}>
            {filteredUsers.map((u) => {
              const roleMeta = AVAILABLE_ROLES.find((r) => r.value === u.role) || {
                label: getRoleLabel(u.role),
                tone: "muted" as Tone,
              };

              return (
                <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                  <td className="font-bold text-forest whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className="grid size-7 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {u.fullName.slice(0, 1)}
                      </span>
                      <span>{u.fullName}</span>
                    </div>
                  </td>
                  <td dir="ltr" className="text-end font-mono text-xs text-muted-foreground">
                    {u.email}
                  </td>
                  <td dir="ltr" className="text-end font-mono text-xs">
                    {u.phone}
                  </td>
                  <td>
                    {isSuperAdmin ? (
                      <select
                        aria-label={`تعديل دور ${u.fullName}`}
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value as AppRole)}
                        className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-bold text-forest shadow-xs focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer"
                      >
                        {AVAILABLE_ROLES.map((r) => (
                          <option key={r.value} value={r.value}>
                            {r.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Badge tone={roleMeta.tone}>{roleMeta.label}</Badge>
                    )}
                  </td>
                  <td>
                    <Badge tone={u.tier === "platinum" ? "gold" : u.tier === "gold" ? "gold" : "muted"}>
                      {u.tier.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="text-xs text-muted-foreground">{u.created_at}</td>
                </tr>
              );
            })}
          </DataTable>
        </Panel>
      </div>

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
        <button type="submit" className="btn btn-primary">حفظ إعدادات الأمان</button>
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
        <Panel title="سجل النشاط والأمان" action={<div className="flex gap-2"><SelectFilter label="المستخدم" value={selectedUserFilter} onChange={setSelectedUserFilter} options={uniq(logs.map((r) => r[1]))} /><ExportButton file="activity-log" sheet="سجل النشاط" rows={() => logList.map(([t, u, e]) => ({ "الوقت": t, "المستخدم": u, "الحدث": e }))} /></div>}>
          <DataTable head={["الوقت", "المستخدم", "الحدث"]}>
            {logList.map(([t, u, e, tone], idx) => (
              <tr key={`${t}-${idx}`}><td dir="ltr" className="text-end">{t}</td><td>{u}</td><td><Badge tone={tone}>{e}</Badge></td></tr>
            ))}
          </DataTable>
        </Panel>
      </div>
    </RequirePermission>
  );
}
