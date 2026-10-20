import { Link } from "@tanstack/react-router";
import { PackageOpen } from "lucide-react";
import { orderStatus, type ClientOrder } from "./data";
export function StatusBadge({ status }: { status: ClientOrder["status"] }) {
  const colors = {
    received: "border-border bg-muted/50 text-muted-foreground",
    preparing: "border-[#d7bc76]/35 bg-[#fbf5e5] text-[#89671c]",
    ready: "border-primary/20 bg-accent/70 text-primary",
    shipping: "border-rose/15 bg-blush/70 text-[#a93361]",
    delivered: "border-primary/10 bg-primary/10 text-primary",
    cancelled: "border-border bg-muted text-muted-foreground",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${colors[status]}`}
    >
      <span className="size-1.5 rounded-full bg-current" />
      {orderStatus[status]}
    </span>
  );
}
export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-3xl border bg-card p-10 text-center shadow-soft">
      <PackageOpen className="mx-auto mb-4 size-10 text-primary" />
      <h2 className="text-xl">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-muted-foreground">{text}</p>
      <Link to="/products" className="btn btn-outline mt-6">
        تصفح المنتجات
      </Link>
    </div>
  );
}
