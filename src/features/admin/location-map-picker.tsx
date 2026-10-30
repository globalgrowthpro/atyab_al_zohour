import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";

declare global {
  interface Window {
    initAdminLocationMap?: () => void;
    google?: any;
  }
}

const DEFAULT_CENTER = { lat: 24.7136, lng: 46.6753 }; // الرياض

type Props = {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
};

export function LocationMapPicker({ lat, lng, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<any>(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const browserKey = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_BROWSER_KEY"] as string | undefined;
  const channel = import.meta.env["VITE_LOVABLE_CONNECTOR_GOOGLE_MAPS_TRACKING_ID"] as string | undefined;

  useEffect(() => {
    if (!browserKey) return;
    const start = () => setReady(true);
    if (window.google?.maps) { start(); return; }
    window.initAdminLocationMap = start;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${browserKey}&loading=async&callback=initAdminLocationMap${channel ? `&channel=${channel}` : ""}&language=ar&region=SA`;
    script.async = true;
    script.onerror = () => setFailed(true);
    document.head.appendChild(script);
  }, [browserKey, channel]);

  useEffect(() => {
    if (!ready || !containerRef.current || !window.google?.maps) return;
    const initial = {
      lat: parseFloat(lat) || DEFAULT_CENTER.lat,
      lng: parseFloat(lng) || DEFAULT_CENTER.lng,
    };
    const map = new window.google.maps.Map(containerRef.current, {
      center: initial,
      zoom: 12,
      clickableIcons: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });
    const marker = new window.google.maps.Marker({
      map,
      position: initial,
      draggable: true,
      title: "موقع المتجر",
    });
    markerRef.current = marker;
    const apply = (pos: any) => {
      if (!pos) return;
      onChangeRef.current(pos.lat().toFixed(6), pos.lng().toFixed(6));
    };
    marker.addListener("dragend", () => apply(marker.getPosition()));
    map.addListener("click", (e: any) => {
      marker.setPosition(e.latLng);
      apply(e.latLng);
    });
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // حرّك الدبوس عند تعديل الإحداثيات يدوياً
  useEffect(() => {
    const la = parseFloat(lat);
    const ln = parseFloat(lng);
    if (!markerRef.current || Number.isNaN(la) || Number.isNaN(ln)) return;
    markerRef.current.setPosition({ lat: la, lng: ln });
    markerRef.current.getMap()?.panTo({ lat: la, lng: ln });
  }, [lat, lng]);

  if (!browserKey) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
        تظهر الخريطة بعد ربط خرائط Google بالمشروع.
      </div>
    );
  }
  if (failed) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40 p-4 text-center text-sm text-muted-foreground">
        تعذّر تحميل الخريطة. تحقق من اتصال الإنترنت أو صلاحيات مفتاح الخرائط.
      </div>
    );
  }
  return (
    <div className="relative">
      <div ref={containerRef} className="h-64 w-full rounded-xl border border-border" />
      <div className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-card/95 px-3 py-1.5 text-xs font-bold text-forest shadow-sm">
        <MapPin className="size-3.5 text-rose" />
        انقر على الخريطة أو اسحب الدبوس لتحديد الموقع
      </div>
    </div>
  );
}
