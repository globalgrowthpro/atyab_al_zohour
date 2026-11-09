import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  adminClients,
  clientStatusLabel,
  clientStatusTone,
  tierLabel,
  type AdminClient,
  type ClientStatus,
  type PriceTier,
} from "@/features/admin/data";
import {
  Badge,
  DataTable,
  FilterChips,
  Meter,
  PageTitle,
  Panel,
  Toolbar,
  ExportButton,
  SelectFilter,
  uniq,
} from "@/features/admin/shared";
import { supabase } from "@/integrations/supabase/client";
import { RequirePermission } from "@/features/admin/guard";

export const Route = createFileRoute("/admin/clients/")({ component: Clients });

function mapDbTierToPriceTier(tier?: string | null): PriceTier {
  if (!tier) return "C";
  const upper = tier.toUpperCase();
  if (upper === "A" || upper === "GOLD" || upper === "VIP" || upper === "PLATINUM") return "A";
  if (upper === "B" || upper === "SILVER") return "B";
  return "C";
}

function Clients() {
  const [clients, setClients] = useState<AdminClient[]>(adminClients);
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ClientStatus | "all">("all");
  const [city, setCity] = useState("all");
  const [type, setType] = useState("all");
  const [tier, setTier] = useState("all");

  // Load live registered clients from Supabase
  useEffect(() => {
    let isMounted = true;

    async function loadClients() {
      try {
        const [profilesRes, clientsRes, ordersRes] = await Promise.all([
          supabase.from("profiles").select("*").order("created_at", { ascending: false }),
          supabase.from("clients").select("*").order("created_at", { ascending: false }),
          supabase.from("orders").select("client_phone, total"),
        ]);

        if (isMounted) {
          const remoteClients: AdminClient[] = [];

          // 1. Process profiles (users registered via portal)
          if (!profilesRes.error && profilesRes.data) {
            for (const p of profilesRes.data) {
              if (p.role === "client" || !p.role) {
                const ordersCount = ordersRes.data
                  ? ordersRes.data.filter((o) => o.client_phone === p.phone).length
                  : 0;

                remoteClients.push({
                  id: p.id,
                  name: p.company_name || p.full_name || "عميل تجاري",
                  type: p.company_name ? "منشأة تجارية" : "محل ورد",
                  city: p.city || "الرياض",
                  cr: p.commercial_register || "1010xxxxxx",
                  orders: ordersCount,
                  tier: mapDbTierToPriceTier(p.tier),
                  status: p.is_verified ? "active" : "pending",
                  joined: p.created_at ? p.created_at.split("T")[0]! : "2026-11-09",
                });
              }
            }
          }

          // 2. Process clients table
          if (!clientsRes.error && clientsRes.data) {
            for (const c of clientsRes.data) {
              if (!remoteClients.some((rc) => rc.id === c.id || rc.name === c.name)) {
                remoteClients.push({
                  id: c.id,
                  name: c.company || c.name,
                  type: c.company ? "شركة معتمدة" : "محل ورد",
                  city: c.city || "الرياض",
                  cr: c.cr_number || "1010xxxxxx",
                  orders: 0,
                  tier: mapDbTierToPriceTier(c.tier),
                  status: "active",
                  joined: c.created_at ? c.created_at.split("T")[0]! : "2026-11-09",
                });
              }
            }
          }

          if (remoteClients.length > 0) {
            const remoteIds = new Set(remoteClients.map((rc) => rc.id));
            const uniqueDemo = adminClients.filter((dc) => !remoteIds.has(dc.id));
            setClients([...remoteClients, ...uniqueDemo]);
          }
        }
      } catch (err) {
        console.warn("Clients Supabase fetch notice:", err);
      }
    }

    void loadClients();
    return () => {
      isMounted = false;
    };
  }, []);

  const patch = async (id: string, v: Partial<AdminClient>, msg: string) => {
    // 1. Optimistic UI update
    setClients((all) => all.map((c) => (c.id === id ? { ...c, ...v } : c)));
    toast.success(msg);

    // 2. Persist to Supabase
    try {
      if (v.status !== undefined) {
        const isVerified = v.status === "active";
        await supabase
          .from("profiles")
          .update({ is_verified: isVerified, updated_at: new Date().toISOString() })
          .eq("id", id);
      }

      if (v.tier !== undefined) {
        await supabase
          .from("profiles")
          .update({ tier: v.tier, updated_at: new Date().toISOString() })
          .eq("id", id);
      }

      // 3. Security Audit Log
      await supabase.from("security_logs").insert({
        actor_name: "مدير النظام",
        event_type: "client_updated",
        severity: "info",
        tone: "forest",
        description: `تم تحديث العميل (${id}): ${msg}`,
      });
    } catch (err) {
      console.warn("Client status database sync error:", err);
    }
  };

  const list = clients.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      (city === "all" || c.city === city) &&
      (type === "all" || c.type === type) &&
      (tier === "all" || c.tier === tier) &&
      (c.name + c.city + c.type).includes(q.trim()),
  );

  const tiers = (Object.keys(tierLabel) as PriceTier[]).map((t) => ({
    t,
    n: clients.filter((c) => c.tier === t).length,
  }));
  const maxTier = Math.max(1, ...tiers.map((x) => x.n));

  return (
    <RequirePermission permission="manage:clients" fallbackMessage="إدارة وتفعيل حسابات العملاء التجاريين مقتصرة على موظفي الإدارة والعمليات.">
      <PageTitle title="حسابات العملاء" desc="وافق على الحسابات الجديدة وحدد فئة السعر لكل عميل." />
      <div className="mb-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">إجمالي الحسابات</p>
          <p className="mt-1 text-xl font-extrabold text-forest">{clients.length}</p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">مفعّلة</p>
          <p className="mt-1 text-xl font-extrabold text-primary">
            {clients.filter((c) => c.status === "active").length}
          </p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="text-xs text-muted-foreground">بانتظار الموافقة</p>
          <p className="mt-1 text-xl font-extrabold text-rose">
            {clients.filter((c) => c.status === "pending").length}
          </p>
        </div>
        <div className="rounded-2xl border bg-admin-panel p-4 shadow-soft">
          <p className="mb-2 text-xs text-muted-foreground">توزيع فئات الأسعار</p>
          <div className="space-y-2">
            {tiers.map(({ t, n }) => (
              <Meter
                key={t}
                label={`فئة ${t}`}
                value={String(n)}
                pct={n / maxTier}
                tone={t === "A" ? "bg-gold" : t === "B" ? "bg-rose" : "bg-primary"}
              />
            ))}
          </div>
        </div>
      </div>
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث باسم المنشأة أو المدينة">
          <FilterChips
            value={status}
            onChange={setStatus}
            options={[["all", "الكل"], ...(Object.entries(clientStatusLabel) as [ClientStatus, string][])]}
          />
          <SelectFilter label="النوع" value={type} onChange={setType} options={uniq(clients.map((c) => c.type))} />
          <SelectFilter label="المدينة" value={city} onChange={setCity} options={uniq(clients.map((c) => c.city))} />
          <SelectFilter label="الفئة" value={tier} onChange={setTier} options={Object.entries(tierLabel)} />
          <ExportButton
            file="clients"
            sheet="العملاء"
            rows={() =>
              list.map((c) => ({
                الرقم: c.id,
                المنشأة: c.name,
                "السجل التجاري": c.cr,
                النوع: c.type,
                المدينة: c.city,
                الطلبات: c.orders,
                "فئة السعر": tierLabel[c.tier],
                الحالة: clientStatusLabel[c.status],
              }))
            }
          />
        </Toolbar>
        <DataTable head={["المنشأة", "النوع", "المدينة", "الطلبات", "فئة السعر", "الحالة", ""]} empty={list.length === 0}>
          {list.map((c) => (
            <tr
              key={c.id}
              onClick={() => navigate({ to: "/admin/clients/$clientId", params: { clientId: c.id } })}
              className="cursor-pointer transition hover:bg-admin-head/60"
            >
              <td>
                <p className="font-bold text-forest underline-offset-4 group-hover:underline">{c.name}</p>
                <p className="text-xs text-muted-foreground" dir="ltr">
                  {c.id} · CR {c.cr}
                </p>
              </td>
              <td>{c.type}</td>
              <td>{c.city}</td>
              <td>{c.orders}</td>
              <td onClick={(e) => e.stopPropagation()}>
                <select
                  aria-label={`فئة ${c.name}`}
                  value={c.tier}
                  onChange={(e) =>
                    void patch(c.id, { tier: e.target.value as PriceTier }, `تم تحديث فئة السعر لـ ${c.name}`)
                  }
                  className="h-9 rounded-lg border bg-surface px-2 text-xs"
                >
                  {(Object.keys(tierLabel) as PriceTier[]).map((t) => (
                    <option key={t} value={t}>
                      {tierLabel[t]}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <Badge tone={clientStatusTone[c.status]}>{clientStatusLabel[c.status]}</Badge>
              </td>
              <td className="whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                {c.status === "pending" && (
                  <>
                    <button
                      onClick={() => void patch(c.id, { status: "active" }, `تم تفعيل حساب ${c.name}`)}
                      className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition"
                    >
                      موافقة
                    </button>
                    <button
                      onClick={() => void patch(c.id, { status: "suspended" }, `تم رفض حساب ${c.name}`)}
                      className="ms-2 text-xs font-bold text-destructive hover:underline"
                    >
                      رفض
                    </button>
                  </>
                )}
                {c.status === "active" && (
                  <button
                    onClick={() => void patch(c.id, { status: "suspended" }, `تم إيقاف حساب ${c.name}`)}
                    className="text-xs font-bold text-destructive hover:underline"
                  >
                    إيقاف
                  </button>
                )}
                {c.status === "suspended" && (
                  <button
                    onClick={() => void patch(c.id, { status: "active" }, `تم إعادة تفعيل حساب ${c.name}`)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    إعادة تفعيل
                  </button>
                )}
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </RequirePermission>
  );
}
