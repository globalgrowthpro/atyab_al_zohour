import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { categories, products } from "@/lib/catalog";
import { sar, tierDiscount, tierLabel, type PriceTier } from "@/features/admin/data";
import { DataTable, ExportButton, PageTitle, Panel, SelectFilter, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/pricing")({ component: Pricing });

const tiers: PriceTier[] = ["A", "B", "C"];

function Pricing() {
  const [disc, setDisc] = useState(tierDiscount);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const list = products.filter((p) => (cat === "all" || p.category === cat) && (p.name + p.sku).toLowerCase().includes(q.trim().toLowerCase()));
  const price = (base: number, t: PriceTier) => Math.round(base * (1 - disc[t] / 100));
  return (
    <>
      <PageTitle title="قوائم الأسعار" desc="حدد نسبة الخصم لكل فئة عملاء، وتُحسب أسعار الجملة تلقائياً." />
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {tiers.map((t) => (
          <div key={t} className="rounded-2xl border bg-admin-panel p-5 shadow-soft">
            <p className="font-bold text-forest">{tierLabel[t]}</p>
            <label className="mt-3 flex items-center gap-2 text-sm">
              نسبة الخصم
              <input type="number" min={0} max={50} value={disc[t]}
                onChange={(e) => setDisc((d) => ({ ...d, [t]: Math.min(50, Math.max(0, Number(e.target.value) || 0)) }))}
                className="h-9 w-20 rounded-lg border bg-surface px-2 text-center" />%
            </label>
          </div>
        ))}
      </div>
      <Panel title="معاينة الأسعار" action={<button onClick={() => toast.success("تم حفظ قوائم الأسعار (تجريبي)")} className="btn btn-primary !h-9 !px-4 text-xs">حفظ</button>}>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث عن منتج">
          <SelectFilter label="التصنيف" value={cat} onChange={setCat} options={categories.map((c) => [c.slug, c.name] as [string, string])} />
          <ExportButton file="price-lists" sheet="قوائم الأسعار" rows={() => list.map((p) => ({ "المنتج": p.name, "الرمز": p.sku, "الأساسي": p.price, "فئة أ": price(p.price, "A"), "فئة ب": price(p.price, "B"), "فئة ج": price(p.price, "C") }))} />
        </Toolbar>
        <DataTable head={["المنتج", "الأساسي", "فئة أ", "فئة ب", "فئة ج"]} empty={list.length === 0}>
          {list.map((p) => (
            <tr key={p.slug}>
              <td className="font-bold text-forest">{p.name}</td>
              <td className="whitespace-nowrap text-muted-foreground">{sar(p.price)}</td>
              {tiers.map((t) => <td key={t} className="whitespace-nowrap">{sar(price(p.price, t))}</td>)}
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
