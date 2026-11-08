import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/catalog";

export interface SocialSettings {
  whatsapp: string;
  whatsapp_url: string;
  whatsapp_prefill: string;
  facebook_url: string;
  facebook_messenger: string;
  instagram_url: string;
  twitter_url: string;
  enable_floating_chat: boolean;
}

export interface GeneralStoreSettings {
  store_name: string;
  phone: string;
  email: string;
  location: string;
  map_lat: string;
  map_lng: string;
  developer: string;
}

export const defaultSocialSettings: SocialSettings = {
  whatsapp: "+201007419344",
  whatsapp_url: "https://wa.me/201007419344",
  whatsapp_prefill: "مرحباً أطيب الزهور، أود الاستفسار عن توريد الزهور بالجملة",
  facebook_url: "https://facebook.com/atyabalzohour",
  facebook_messenger: "https://m.me/atyabalzohour",
  instagram_url: "https://instagram.com/atyabalzohour",
  twitter_url: "https://x.com/atyabalzohour",
  enable_floating_chat: true,
};

export const defaultGeneralSettings: GeneralStoreSettings = {
  store_name: "أطيب الزهور",
  phone: siteConfig.phone || "+201007419344",
  email: siteConfig.email || "info@atyabalzohour.com",
  location: siteConfig.location || "الرياض، حي السلي، مخرج 16",
  map_lat: "24.6877",
  map_lng: "46.8229",
  developer: "Mr. Hafez Rahim (+201007419344)",
};

let cachedSocial: SocialSettings = { ...defaultSocialSettings };
let cachedGeneral: GeneralStoreSettings = { ...defaultGeneralSettings };
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((listener) => listener());
}

/**
 * Clean phone number for WhatsApp wa.me links
 */
export function formatWhatsAppUrl(phone: string, prefill?: string): string {
  if (!phone) return "";
  if (phone.startsWith("http://") || phone.startsWith("https://")) {
    return phone;
  }
  const digits = phone.replace(/[^\d]/g, "");
  const base = `https://wa.me/${digits}`;
  return prefill ? `${base}?text=${encodeURIComponent(prefill)}` : base;
}

/**
 * Clean Facebook Messenger URL
 */
export function formatMessengerUrl(linkOrUser: string): string {
  if (!linkOrUser) return "";
  if (linkOrUser.startsWith("http://") || linkOrUser.startsWith("https://")) {
    return linkOrUser;
  }
  const clean = linkOrUser.replace(/^@/, "").replace(/^\/+/, "");
  return `https://m.me/${clean}`;
}

export function useStoreSettings() {
  const [social, setSocial] = useState<SocialSettings>(cachedSocial);
  const [general, setGeneral] = useState<GeneralStoreSettings>(cachedGeneral);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const update = () => {
      setSocial({ ...cachedSocial });
      setGeneral({ ...cachedGeneral });
    };
    listeners.add(update);

    let isMounted = true;
    async function load() {
      if (typeof window === "undefined" || import.meta.env["TEST"]) return;
      try {
        setIsLoading(true);
        const { supabase } = await import("@/integrations/supabase/client");
        const { data, error } = await supabase
          .from("store_settings")
          .select("key, value")
          .in("key", ["social_media", "general"]);

        if (!error && data && isMounted) {
          data.forEach((row) => {
            const val: any = row.value;
            if (!val || typeof val !== "object") return;

            if (row.key === "social_media") {
              cachedSocial = {
                whatsapp: val["whatsapp"] || defaultSocialSettings.whatsapp,
                whatsapp_url:
                  val["whatsapp_url"] ||
                  formatWhatsAppUrl(
                    val["whatsapp"] || defaultSocialSettings.whatsapp,
                    val["whatsapp_prefill"]
                  ),
                whatsapp_prefill:
                  val["whatsapp_prefill"] || defaultSocialSettings.whatsapp_prefill,
                facebook_url: val["facebook_url"] || defaultSocialSettings.facebook_url,
                facebook_messenger:
                  val["facebook_messenger"] || defaultSocialSettings.facebook_messenger,
                instagram_url: val["instagram_url"] || defaultSocialSettings.instagram_url,
                twitter_url: val["twitter_url"] || defaultSocialSettings.twitter_url,
                enable_floating_chat:
                  val["enable_floating_chat"] !== undefined
                    ? Boolean(val["enable_floating_chat"])
                    : true,
              };
            } else if (row.key === "general") {
              cachedGeneral = {
                store_name: val["store_name"] || defaultGeneralSettings.store_name,
                phone: val["phone"] || defaultGeneralSettings.phone,
                email: val["email"] || defaultGeneralSettings.email,
                location: val["location"] || defaultGeneralSettings.location,
                map_lat: val["map_lat"] || defaultGeneralSettings.map_lat,
                map_lng: val["map_lng"] || defaultGeneralSettings.map_lng,
                developer: val["developer"] || defaultGeneralSettings.developer,
              };
            }
          });
          notify();
        }
      } catch (err) {
        console.warn("Notice loading store settings:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void load();

    return () => {
      isMounted = false;
      listeners.delete(update);
    };
  }, []);

  return { social, general, isLoading };
}

