import { Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageSlider({ images, alt, slug }: { images: string[]; alt: string; slug: string }) {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const n = images.length;
  const go = (d: number, e?: React.SyntheticEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setI((v) => (v + d + n) % n);
  };

  return (
    <div
      className="relative size-full"
      onTouchStart={(e) => (touchX.current = e.touches[0]?.clientX ?? null)}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? -1 : 1);
        touchX.current = null;
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
