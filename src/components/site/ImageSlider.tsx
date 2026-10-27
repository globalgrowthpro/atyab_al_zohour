import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

const STEP_MS = 3200;

export function ImageSlider({ images, alt, slug }: { images: string[]; alt: string; slug: string }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [onScreen, setOnScreen] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [nonce, setNonce] = useState(0);
  const n = images.length;

  const go = (d: number, e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setI((v) => (v + d + n) % n);
    setNonce((v) => v + 1);
  };

  // Only autoplay sliders the visitor can actually see.
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((en) => en.isIntersecting)),
      { rootMargin: "120px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Never auto-move for people who ask the system to reduce motion.
  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.("change", on);
    return () => mq.removeEventListener?.("change", on);
  }, []);

  // Advance on its own, starting at a different moment per product.
  useEffect(() => {
    if (n < 2 || paused || !onScreen || reduced) return;
    let tick: ReturnType<typeof setInterval> | undefined;
    const offset = (slug.length * 357 + (slug.charCodeAt(0) || 0) * 41) % STEP_MS;
    const kick = setTimeout(() => {
      tick = setInterval(() => setI((v) => (v + 1) % n), STEP_MS);
    }, offset);
    return () => {
      clearTimeout(kick);
      if (tick) clearInterval(tick);
    };
  }, [n, paused, onScreen, reduced, slug, nonce]);

  return (
    <div
      ref={boxRef}
      className="relative size-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => {
        touchX.current = e.touches[0]?.clientX ?? null;
        setPaused(true);
      }}
      onTouchEnd={(e) => {
        if (touchX.current != null) {
          const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? -1 : 1);
          touchX.current = null;
        }
        setTimeout(() => setPaused(false), 2500);
      }}
    >
      <Link to="/products/$slug" params={{ slug }} className="block size-full overflow-hidden">
        <div
          className="flex size-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(${i * 100}%)` }}
        >
          {images.map((src, k) => (
            <img
              key={src}
              src={src}
              alt={`${alt} — صورة ${k + 1}`}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.src = "/flowers/red-rose.jpg";
              }}
              className="size-full shrink-0 object-cover"
            />
          ))}
        </div>
      </Link>

      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="الصورة السابقة"
            onClick={(e) => go(-1, e)}
            className="absolute start-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100 max-md:opacity-100"
          >
            <ChevronRight className="size-4" />
          </button>
          <button
            type="button"
            aria-label="الصورة التالية"
            onClick={(e) => go(1, e)}
            className="absolute end-2 top-1/2 grid size-7 -translate-y-1/2 place-items-center rounded-full bg-card/90 text-foreground opacity-0 shadow-sm transition group-hover:opacity-100 focus:opacity-100 max-md:opacity-100"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label={paused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"}
            title={paused ? "تشغيل العرض التلقائي" : "إيقاف العرض التلقائي"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPaused((v) => !v);
            }}
            className="absolute top-2 end-2 grid size-6 place-items-center rounded-full bg-card/85 text-muted-foreground shadow-sm backdrop-blur transition hover:text-rose focus:opacity-100 max-md:opacity-100 max-md:hidden"
          >
            {paused ? <Play className="size-3" /> : <Pause className="size-3" />}
          </button>
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {images.map((src, k) => (
              <button
                key={src}
                type="button"
                aria-label={`عرض الصورة ${k + 1}`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setI(k);
                  setNonce((v) => v + 1);
                }}
                className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-rose" : "w-1.5 bg-card/80"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
