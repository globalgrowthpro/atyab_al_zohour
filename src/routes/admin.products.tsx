import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { categoryOf, productImage, products } from "@/lib/catalog";
import { sar } from "@/features/admin/data";
import { Badge, DataTable, PageTitle, Panel, Toolbar } from "@/features/admin/shared";

export const Route = createFileRoute("/admin/products")({ component: Products });

function Products() {
  const [items, setItems] = useState(() => products.map((p) => ({ ...p })));
  const [q, setQ] = useState("");
  const list = useMemo(() => items.filter((p) => (p.name + p.sku + p.en).toLowerCase().includes(q.trim().toLowerCase())), [items, q]);
  const patch = (slug: string, v: Partial<(typeof items)[number]>) => setItems((all) => all.map((p) => (p.slug === slug ? { ...p, ...v } : p)));

  return (
    <>
      <PageTitle title="المنتجات والمخزون" desc={`${items.length} منتج · ${items.filter((p) => !p.available).length} غير متوفر`}
        action={<button onClick={() => toast("إضافة المنتجات ستتوفر عند ربط النظام")} className="btn btn-primary !h-10 !px-5 text-sm">إضافة منتج</button>} />
      <Panel>
        <Toolbar q={q} setQ={setQ} placeholder="ابحث بالاسم أو رمز المنتج" />
        <DataTable head={["المنتج", "التصنيف", "الحد الأدنى", "السعر الأساسي", "التوفر"]} empty={list.length === 0}>
          {list.map((p) => (
            <tr key={p.slug}>
              <td>
                <div className="flex items-center gap-3">
                  <img src={productImage(p)} alt="" className="size-11 rounded-lg object-cover" loading="lazy" />
                  <div><p className="font-bold text-forest">{p.name}</p><p className="text-xs text-muted-foreground" dir="ltr">{p.sku}</p></div>
                </div>
              </td>
              <td>{categoryOf(p.category)?.name ?? p.category}</td>
              <td>{p.moq} {p.unit}</td>
              <td className="whitespace-nowrap">{sar(p.price)}</td>
              <td>
                <button onClick={() => { patch(p.slug, { available: !p.available }); toast.success("تم تحديث التوفر"); }} aria-label={`تبديل توفر ${p.name}`}>
                  <Badge tone={p.available ? "sage" : "danger"}>{p.available ? "متوفر" : "غير متوفر"}</Badge>
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </Panel>
    </>
  );
}
