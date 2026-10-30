import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Check, Snowflake, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { productImages, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";
import { useClientTier, calculateTierPrice, CLIENT_TIERS } from "@/features/b2b/tier-pricing";
import { getProductInventorySummary } from "@/features/inventory/batches";
import { ImageSlider } from "./ImageSlider";

export function QtyStepper({
  value,
  onChange,
  min = 1,
  className = "",
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  className?: string;
}) {
  return (
    <div className={`inline-flex h-9 items-center justify-between rounded-full border border-border/80 bg-surface px-1.5 shadow-2xs ${className}`}>
      <button
        type="button"
        aria-label="إنقاص"
        disabled={value <= min}
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.max(min, value - 1));
        }}
        className="grid size-6 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-25 active:scale-90"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="min-w-6 px-1 text-center text-xs font-bold font-mono text-foreground">{value}</span>
      <button
        type="button"
        aria-label="زيادة"
        disabled={value >= 9999}
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.min(9999, value + 1));
        }}
        className="grid size-6 place-items-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-25 active:scale-90"
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}

export function ProductCard({
  p,
  layout = "grid",
}: {
  p: Product;
  layout?: "grid" | "list";
}) {
  const { add } = useCart();
  const [tier] = useClientTier();
  const tierPrice = calculateTierPrice(p.price, tier);
  const tierConfig = CLIENT_TIERS[tier];
  const inv = getProductInventorySummary(p.slug);

  const [qty, setQty] = useState(p.moq || 1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(p.slug, qty);
    setIsAdded(true);
    toast.success(`تمت إضافة ${qty} ${p.unit} من ${p.name} إلى السلة`);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    toast(isLiked ? "تمت الإزالة من المفضلة" : "تمت الإضافة إلى المفضلة");
  };

  if (layout === "list") {
    return (
      <article className="group relative flex flex-col sm:flex-row overflow-hidden rounded-2xl border border-border/70 bg-card p-3 shadow-xs transition-all duration-300 hover:shadow-soft hover:border-rose/30">
        <div className="relative block aspect-square sm:w-48 sm:shrink-0 overflow-hidden rounded-xl bg-muted">
          <ImageSlider images={productImages(p)} alt={p.name} slug={p.slug} />
          {p.badge && (
            <span
              className={`absolute top-2.5 start-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${
                p.badge === "الأكثر مبيعاً"
                  ? "bg-rose text-white"
                  : p.badge === "جديد"
                  ? "bg-emerald-600 text-white"
                  : "bg-indigo-600 text-white"
              }`}
            >
              {p.badge}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-between p-3 sm:px-5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <Link to="/products/$slug" params={{ slug: p.slug }}>
                <h3 className="text-base font-bold text-foreground transition group-hover:text-rose">
                  {p.name}
                </h3>
              </Link>
              <p className="mt-1 text-xs text-muted-foreground">
                المنشأ: {p.origin} {p.stem && p.stem !== "—" ? `| الطول: ${p.stem}` : ""}
              </p>
              <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5">
                  <Snowflake className="size-3 text-primary" /> {inv.freshnessLabel}
                </span>
                <span>المخزون المتاح: <strong className="text-forest">{inv.available} {p.unit}</strong></span>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleWishlist}
              aria-label="إضافة للمفضلة"
              className="grid size-8 place-items-center rounded-full bg-surface shadow-xs transition hover:scale-110"
            >
              <Heart
                className={`size-4 transition-colors ${
                  isLiked ? "fill-rose text-rose" : "text-muted-foreground hover:text-rose"
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-3">
            <div className="flex flex-col">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-rose">{tierPrice} ر.س</span>
                {tierPrice < p.price && (
                  <del className="text-xs text-muted-foreground">{p.price} ر.س</del>
                )}
                <span className="text-xs text-muted-foreground">/ {p.priceUnit}</span>
                {tierConfig.discountPercent > 0 && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                    خصم {tierConfig.discountPercent}%
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground">
                الحد الأدنى للطلب: <strong>{p.moq} {p.unit}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <QtyStepper value={qty} onChange={setQty} min={p.moq || 1} />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!p.available || inv.available < (p.moq || 1)}
                className="btn btn-rose !h-9 !px-4 text-xs font-bold"
              >
                {isAdded ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
                {isAdded ? "تمت الإضافة" : "أضف إلى السلة"}
              </button>
            </div>
          </div>
        </div>
      </article>
    );
  }

  // Grid layout
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-2.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-rose/30 hover:shadow-soft">
      {/* Top Image Box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <ImageSlider images={productImages(p)} alt={p.name} slug={p.slug} />

        {/* Badge (Top Right in RTL) */}
        {p.badge && (
          <span
            className={`absolute top-2.5 end-2.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${
              p.badge === "الأكثر مبيعاً"
                ? "bg-rose text-white"
                : p.badge === "جديد"
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {p.badge}
          </span>
        )}

        {/* Tier Discount Badge */}
        {tierConfig.discountPercent > 0 && (
          <span className="absolute bottom-2.5 end-2.5 rounded-md bg-forest/90 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs backdrop-blur">
            خصم {tierConfig.discountPercent}%
          </span>
        )}

        {/* Wishlist Button (Top Left in RTL) */}
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label="إضافة للمفضلة"
          className="absolute top-2.5 start-2.5 grid size-7 place-items-center rounded-full bg-white/95 shadow-sm backdrop-blur transition hover:scale-110"
        >
          <Heart
            className={`size-3.5 transition-colors ${
              isLiked ? "fill-rose text-rose" : "text-muted-foreground hover:text-rose"
            }`}
          />
        </button>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col pt-3 pb-1 px-1">
        <Link to="/products/$slug" params={{ slug: p.slug }}>
          <h3 className="line-clamp-1 text-sm font-bold text-foreground transition group-hover:text-rose">
            {p.name}
          </h3>
        </Link>

        <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">
          المنشأ: {p.origin} {p.stem && p.stem !== "—" ? `| ${p.stem}` : ""}
        </p>

        {/* Price Row */}
        <div className="mt-2 flex items-baseline justify-between gap-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-rose">{tierPrice} ر.س</span>
            {tierPrice < p.price && (
              <del className="text-[11px] text-muted-foreground">{p.price}</del>
            )}
            <span className="text-[11px] text-muted-foreground">/ {p.priceUnit}</span>
          </div>
          <span className="text-[10px] rounded-md bg-primary/10 px-1.5 py-0.5 text-primary font-bold">
            متاح {inv.available}
          </span>
        </div>

        {/* MOQ & Freshness indicator */}
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>الحد الأدنى: <strong className="text-foreground">{p.moq} {p.unit}</strong></span>
          <span className="text-emerald-700 font-medium">متبقي {inv.daysRemaining} أيام</span>
        </div>

        {/* Action Row: Stepper + Circular Cart Button */}
        <div className="mt-2.5 flex items-center justify-between gap-2 pt-2 border-t border-border/50">
          <div className="flex-1 min-w-0">
            <QtyStepper value={qty} onChange={setQty} min={p.moq || 1} className="w-full" />
          </div>
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!p.available || inv.available < (p.moq || 1)}
            aria-label="أضف إلى السلة"
            title="أضف إلى السلة"
            className="size-9 shrink-0 aspect-square rounded-full bg-rose text-white grid place-items-center shadow-xs transition-all duration-200 hover:bg-rose/90 hover:scale-105 active:scale-90 disabled:opacity-40"
          >
            {isAdded ? (
              <Check className="size-4 animate-in zoom-in-75 duration-150" />
            ) : (
              <ShoppingCart className="size-4" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}
