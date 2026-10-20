import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Heart, Minus, Plus, ShoppingCart, Check } from "lucide-react";
import { toast } from "sonner";
import { productImage, type Product } from "@/lib/catalog";
import { useCart } from "@/lib/cart";

export function QtyStepper({
  value,
  onChange,
  min = 1,
}: {
  value: number;
  onChange: (n: number) => void;
  min?: number;
}) {
  return (
    <div className="inline-flex h-9 items-center rounded-lg border border-border/80 bg-surface px-1 shadow-xs">
      <button
        type="button"
        aria-label="إنقاص"
        disabled={value <= min}
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.max(min, value - 1));
        }}
        className="grid size-7 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
      >
        <Minus className="size-3.5" />
      </button>
      <span className="w-7 text-center text-xs font-bold text-foreground">{value}</span>
      <button
        type="button"
        aria-label="زيادة"
        disabled={value >= 9999}
        onClick={(e) => {
          e.stopPropagation();
          onChange(Math.min(9999, value + 1));
        }}
        className="grid size-7 place-items-center rounded text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-30"
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
  const [qty, setQty] = useState(p.moq || 1);
  const [isLiked, setIsLiked] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    add(p.slug, qty);
    setIsAdded(true);
    toast.success(`تمت إضافة ${p.name} إلى السلة`);
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
        <Link
          to="/products/$slug"
          params={{ slug: p.slug }}
          className="relative block aspect-square sm:w-48 sm:shrink-0 overflow-hidden rounded-xl bg-muted"
        >
          <img
            src={productImage(p)}
            alt={p.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/flowers/red-rose.jpg";
            }}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
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
        </Link>

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
            <div className="flex items-baseline gap-1">
              <span className="text-lg font-black text-rose">{p.price} ر.س</span>
              <span className="text-xs text-muted-foreground">/ {p.priceUnit}</span>
            </div>

            <div className="flex items-center gap-2">
              <QtyStepper value={qty} onChange={setQty} min={p.moq || 1} />
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!p.available}
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

  // Grid layout (exact match with mockup)
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-card p-2.5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:border-rose/30 hover:shadow-soft">
      {/* Top Image Box */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
        <Link to="/products/$slug" params={{ slug: p.slug }} className="block size-full">
          <img
            src={productImage(p)}
            alt={p.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = "/flowers/red-rose.jpg";
            }}
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
        </Link>

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
          المنشأ: {p.origin} {p.stem && p.stem !== "—" ? `| الطول: ${p.stem}` : ""}
        </p>

        {/* Price Row */}
        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-base font-black text-rose">{p.price} ر.س</span>
          <span className="text-[11px] text-muted-foreground">/ {p.priceUnit}</span>
        </div>

        {/* Action Row: Stepper + Add to Cart */}
        <div className="mt-3 flex items-center gap-1.5 pt-2 border-t border-border/50">
          <QtyStepper value={qty} onChange={setQty} min={p.moq || 1} />
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!p.available}
            className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-rose px-2.5 text-xs font-bold text-white transition hover:bg-rose/90 hover:shadow-xs active:scale-95 disabled:opacity-40"
          >
            {isAdded ? <Check className="size-3.5" /> : <ShoppingCart className="size-3.5" />}
            <span>{isAdded ? "تمت" : "أضف إلى السلة"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

