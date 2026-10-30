import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { sar } from "@/features/admin/data";

export type ClientTier = "bronze" | "silver" | "gold" | "vip";

export type TierConfig = {
  id: ClientTier;
  label: string;
  en: string;
  discountPercent: number;
  minOrderSar: number; // الحد الأدنى المالي للطلب بالريال السعودي
  description: string;
  badgeTone: "muted" | "sage" | "gold" | "rose";
};

export const CLIENT_TIERS: Record<ClientTier, TierConfig> = {
  bronze: {
    id: "bronze",
    label: "البرونزية — محلات وبدايات",
    en: "Bronze / Retail Florist",
    discountPercent: 0,
    minOrderSar: 500,
    description: "الأسعار القياسية لتجار الجملة المبتدئين والمحلات الصغيرة. الحد الأدنى للطلب 500 ر.س.",
    badgeTone: "muted",
  },
  silver: {
    id: "silver",
    label: "الفضية — محلات ورد دائمة",
    en: "Silver / Regular Partner",
    discountPercent: 10,
    minOrderSar: 1000,
    description: "خصم 10% لمحلات الورد ذات السحب الأسبوعي المستمر. الحد الأدنى للطلب 1,000 ر.س.",
    badgeTone: "sage",
  },
  gold: {
    id: "gold",
    label: "الذهبية — سلاسل ومنظمو فعاليات",
    en: "Gold / Chains & Event Planners",
    discountPercent: 18,
    minOrderSar: 2500,
    description: "خصم 18% مع أولوية تخصيص الشحنات الطازجة. الحد الأدنى للطلب 2,500 ر.س.",
    badgeTone: "gold",
  },
  vip: {
    id: "vip",
    label: "عقود خاصة — فنادق وقاعات VIP",
    en: "VIP / Hotels & Large Venues",
    discountPercent: 25,
    minOrderSar: 5000,
    description: "خصم 25% مع جداول توريد مبردة مجدولة وتسهيلات دفع. الحد الأدنى للطلب 5,000 ر.س.",
    badgeTone: "rose",
  },
};

const TIER_STORAGE_KEY = "atyab-client-tier";
let currentTier: ClientTier = "silver"; // default preview tier for florists

if (typeof window !== "undefined") {
  try {
    const saved = localStorage.getItem(TIER_STORAGE_KEY) as ClientTier;
    if (saved && CLIENT_TIERS[saved]) {
      currentTier = saved;
    }
  } catch {
    /* storage unavailable */
  }
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function setGlobalClientTier(tier: ClientTier) {
  currentTier = tier;
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(TIER_STORAGE_KEY, tier);
    } catch {
      /* ignore */
    }
  }
  listeners.forEach((l) => l());
}

export function useClientTier(): [ClientTier, (tier: ClientTier) => void] {
  const tier = useSyncExternalStore(subscribe, () => currentTier, () => "silver" as ClientTier);
  const setTier = useCallback((next: ClientTier) => {
    setGlobalClientTier(next);
  }, []);
  return [tier, setTier];
}

/**
 * يحسب سعر الجملة المخصص حسب شريحة العميل مع التقريب لأقرب ريال
 */
export function calculateTierPrice(basePrice: number, tier: ClientTier): number {
  const discount = CLIENT_TIERS[tier]?.discountPercent ?? 0;
  if (discount <= 0) return basePrice;
  return Math.round(basePrice * (1 - discount / 100));
}

/**
 * يتحقق من توافق السلة مع قواعد الحد الأدنى للطلب (MOQ)
 */
export type MoqValidationResult = {
  isValid: boolean;
  minOrderSar: number;
  currentSubtotal: number;
  remainingSar: number;
  itemErrors: { slug: string; name: string; currentQty: number; moq: number; unit: string }[];
};

export function validateMoq(
  items: { slug: string; name: string; qty: number; unit: string; moq: number; basePrice: number }[],
  tier: ClientTier = currentTier
): MoqValidationResult {
  const config = CLIENT_TIERS[tier];
  const minOrderSar = config.minOrderSar;

  const itemErrors: MoqValidationResult["itemErrors"] = [];
  let currentSubtotal = 0;

  for (const item of items) {
    const unitPrice = calculateTierPrice(item.basePrice, tier);
    currentSubtotal += unitPrice * item.qty;

    if (item.qty < item.moq) {
      itemErrors.push({
        slug: item.slug,
        name: item.name,
        currentQty: item.qty,
        moq: item.moq,
        unit: item.unit,
      });
    }
  }

  const remainingSar = Math.max(0, minOrderSar - currentSubtotal);
  const isValid = itemErrors.length === 0 && remainingSar === 0;

  return {
    isValid,
    minOrderSar,
    currentSubtotal,
    remainingSar,
    itemErrors,
  };
}

