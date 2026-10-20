import { useEffect, useRef, useState } from "react";
import { LocateFixed, MapPin, Truck, Warehouse } from "lucide-react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";
import { type ClientOrder } from "./data";
import { orderMapState, type Coordinate } from "./order-presentation";

const symbols = {
  warehouse: '<path d="M3 21V8l9-5 9 5v13M8 21v-8h8v8M3 10h18M10 16h4"/>',
  destination: '<path d="m3 10 9-7 9 7v10H3zM9 20v-7h6v7"/>',
  courier:
    '<path d="M3 6h11v12H3zM14 10h4l3 4v4h-7M6 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4M18 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4"/>',
};
export function DeliveryMap({
  order,
  route,
}: {
  order: ClientOrder;
  route?: Coordinate[] | undefined;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [retry, setRetry] = useState(0);
  const tracking = orderMapState(order, route);
  const { id, status, city } = order;
  useEffect(() => {
    let disposed = false;
    let map: LeafletMap | undefined;
    let observer: ResizeObserver | undefined;
    let loaded = false;
    setState("loading");
    const timer = window.setTimeout(() => {
      if (!disposed && !loaded) setState("error");
    }, 12000);
    async function initialize() {
      try {
        const L = await import("leaflet");
        if (disposed || !container.current) return;
        const model = orderMapState({ city, status }, route);
        map = L.map(container.current, {
          zoomControl: false,
          scrollWheelZoom: false,
          attributionControl: true,
        });
        mapRef.current = map;
        L.control.zoom({ position: "bottomleft" }).addTo(map);
        const layer = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors',
        });
        layer.on("tileload", () => {
          if (!disposed) {
            loaded = true;
            setState("ready");
            window.clearTimeout(timer);
          }
        });
        layer.addTo(map);
        L.polyline(model.route, { color: "#ffffff", weight: 10, opacity: 0.95 }).addTo(map);
        L.polyline(model.route, {
          color: "#7e8b86",
          weight: 4,
          dashArray: "6 9",
          opacity: 0.9,
        }).addTo(map);
        if (model.traveled.length > 1)
          L.polyline(model.traveled, { color: "#176244", weight: 5, lineCap: "round" }).addTo(map);
        function marker(
          point: [number, number],
          type: keyof typeof symbols,
          label: string,
          color: string,
        ) {
          if (!map) return;
          const element = document.createElement("span");
          element.textContent = label;
          const icon = L.divIcon({
            className: "client-map-marker",
            html: `<span style="background:${color}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${symbols[type]}</svg></span>`,
            iconSize: [40, 40],
            iconAnchor: [20, 20],
          });
          L.marker(point, { icon, title: label })
            .bindTooltip(element, { direction: "top", offset: [0, -18] })
            .addTo(map);
        }
        marker(model.route[0]!, "warehouse", "مركز التجهيز — موقع تجريبي", "#174d38");
        marker(
          model.route[model.route.length - 1]!,
          "destination",
          "عنوان الاستلام — موقع تجريبي",
          "#4a5852",
        );
        if (model.stage === 3)
          marker(model.position, "courier", "مندوب التوصيل — موقع تمثيلي", "#cf4d7d");
        if (model.stage >= 4)
          L.circleMarker(model.position, {
            radius: 25,
            color: "#176244",
            fillColor: "#176244",
            fillOpacity: 0.1,
            weight: 2,
          }).addTo(map);
        map.fitBounds(L.latLngBounds(model.route), { padding: [55, 55], maxZoom: 14 });
        if (typeof ResizeObserver !== "undefined") {
          observer = new ResizeObserver(() => map?.invalidateSize());
          observer.observe(container.current);
        }
      } catch {
        if (!disposed) setState("error");
      }
    }
    void initialize();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
      observer?.disconnect();
      map?.remove();
      mapRef.current = null;
    };
  }, [id, status, city, retry, route]);
  if (tracking.stage < 0) return null;
  return (
    <section className="overflow-hidden rounded-2xl border bg-card" aria-label="خريطة مسار الطلب">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
        <div>
          <h3 className="text-base">مسار التوصيل</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {order.city} · {tracking.location}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-blush/60 px-3 py-1.5 text-[11px] font-bold text-forest">
          <span className="size-1.5 rounded-full bg-rose" />
          موقع تجريبي · ليس مباشراً
        </span>
      </div>
      <div className="relative isolate">
        <div
          ref={container}
          role="img"
          aria-label={`خريطة جغرافية توضيحية للطلب ${order.id}: ${tracking.location}`}
          className="z-0 h-[320px] w-full bg-[#e9ede7] sm:h-[390px]"
          dir="ltr"
        />
        {state === "loading" && (
          <div
            role="status"
            className="pointer-events-none absolute inset-x-0 top-4 z-10 mx-auto w-fit rounded-xl border bg-card/95 px-4 py-2 text-xs shadow-sm"
          >
            جارٍ تحميل الخريطة…
          </div>
        )}
        {state === "error" && (
          <div
            role="alert"
            className="absolute inset-x-4 top-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card/95 p-4 text-xs shadow-sm"
          >
            <span>تعذّر تحميل الخريطة. تحقق من اتصال الإنترنت.</span>
            <button
              onClick={() => setRetry((value) => value + 1)}
              className="font-bold text-primary underline"
            >
              إعادة المحاولة
            </button>
          </div>
        )}
        <button
          type="button"
          aria-label="إظهار المسار بالكامل"
          className="absolute end-3 top-3 z-[5] grid size-10 place-items-center rounded-xl border bg-card text-primary shadow-sm"
          onClick={() => {
            void import("leaflet")
              .then((L) =>
                mapRef.current?.fitBounds(L.latLngBounds(tracking.route), {
                  padding: [55, 55],
                  maxZoom: 14,
                }),
              )
              .catch(() => setState("error"));
          }}
        >
          <LocateFixed className="size-5" />
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t px-5 py-3 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Warehouse className="size-3.5 text-primary" />
          مركز التجهيز
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="size-3.5 text-rose" />
          المندوب
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="size-3.5" />
          الاستلام
        </span>
        <span className="ms-auto">خريطة فعلية · المسار والمواقع أمثلة ثابتة</span>
      </div>
    </section>
  );
}
