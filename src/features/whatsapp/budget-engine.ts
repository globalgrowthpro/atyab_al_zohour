/**
 * Atyab Al Zohour - WhatsApp Business Hub
 * Budget & Rate-Card Engine (Section 16 Specification)
 * Strictly enforces monthly marketing caps (default: EGP 2,000 / SAR 200)
 * with 50%, 80% alerts and 100% hard stop.
 */

import type { WhatsAppConversationCategory, WhatsAppCostLedgerEntry, WhatsAppSettings } from './types';

// Meta Conversation Rates (Estimated Reference Rates in USD)
export const META_RATES_USD = {
  EG: {
    MARKETING: 0.0644,
    UTILITY: 0.0036,
    AUTHENTICATION: 0.0160,
    SERVICE: 0.0036, // after 1,000 free service messages
  },
  SA: {
    MARKETING: 0.0465,
    UTILITY: 0.0176,
    AUTHENTICATION: 0.0240,
    SERVICE: 0.0176, // after 1,000 free service messages
  },
  DEFAULT: {
    MARKETING: 0.0550,
    UTILITY: 0.0150,
    AUTHENTICATION: 0.0200,
    SERVICE: 0.0150,
  },
} as const;

// Conversion rates to local currencies
export const FX_RATES_TO_USD = {
  EGP: 50.0, // 1 USD ~ 50 EGP
  SAR: 3.75, // 1 USD ~ 3.75 SAR
};

export const DEFAULT_BUDGET_SETTINGS: WhatsAppSettings = {
  id: 'setting-atyab-main',
  account_id: 'waba-atyab-01',

  // Master switches (ON / OFF)
  is_enabled: true,
  campaigns_enabled: true,
  automations_enabled: true,
  sandbox_mode: true,
  strict_24h_window_enforced: true,

  // API credentials inputs
  meta_app_id: '891029481928374',
  meta_app_secret: '8f92a10c84b14d2e9871fa2841938501',
  meta_waba_id: '109845729184512',
  phone_number_id: '102938475610293',
  system_user_token: 'EAAG8a910...atyab_al_zohour_secret_token',
  webhook_verify_token: 'atyab_meta_wh_secure_token_2026',
  webhook_callback_url: 'https://atyabalzohour.com/api/webhooks/whatsapp',

  // Limits
  monthly_marketing_budget_cap: 2000, // 2,000 EGP as specified
  daily_send_limit: 1000,
  rate_limit_per_minute: 80,
  currency: 'EGP',

  // Alerts & Thresholds
  alert_threshold_50_sent: false,
  alert_threshold_80_sent: false,
  alert_threshold_100_sent: false,
  default_country_code: 'EG',
  opt_out_keywords: ['STOP', 'إلغاء', 'قف', 'خروج', 'UNSUBSCRIBE', 'إيقاف'],
  compliance_notification_phone: '+201007419344',
  auto_resolve_inactive_hours: 48,
  updated_at: new Date().toISOString(),
};

/**
 * Detect Country ISO code from E.164 phone string
 */
export function detectCountryFromPhone(phoneE164: string): 'EG' | 'SA' | 'DEFAULT' {
  const clean = phoneE164.replace(/[^\d+]/g, '');
  if (clean.startsWith('+20') || clean.startsWith('20') || clean.startsWith('01')) return 'EG';
  if (clean.startsWith('+966') || clean.startsWith('966') || clean.startsWith('05')) return 'SA';
  return 'DEFAULT';
}

/**
 * Calculate single message cost in target currency (EGP or SAR)
 */
export function calculateMessageCost(
  category: WhatsAppConversationCategory,
  recipientPhone: string,
  targetCurrency: 'EGP' | 'SAR' = 'EGP',
  isFreeTierDelivered: boolean = false
): { costUsd: number; costLocal: number } {
  if (category === 'SERVICE' && isFreeTierDelivered) {
    return { costUsd: 0, costLocal: 0 };
  }

  const country = detectCountryFromPhone(recipientPhone);
  const countryRates = META_RATES_USD[country] || META_RATES_USD.DEFAULT;
  const costUsd = countryRates[category];
  const fx = FX_RATES_TO_USD[targetCurrency] || 50.0;
  const costLocal = Number((costUsd * fx).toFixed(2));

  return { costUsd, costLocal };
}

/**
 * Estimate Campaign Cost
 */
export function estimateCampaignCost(
  recipientsCount: number,
  category: WhatsAppConversationCategory,
  sampleCountry: 'EG' | 'SA' = 'EG',
  currency: 'EGP' | 'SAR' = 'EGP'
): { totalLocal: number; perMessageLocal: number; totalUsd: number } {
  const rateUsd = META_RATES_USD[sampleCountry][category];
  const fx = FX_RATES_TO_USD[currency];
  const perMessageLocal = Number((rateUsd * fx).toFixed(2));
  const totalLocal = Number((perMessageLocal * recipientsCount).toFixed(2));
  const totalUsd = Number((rateUsd * recipientsCount).toFixed(2));

  return { totalLocal, perMessageLocal, totalUsd };
}

/**
 * Compute current month marketing expenditure from ledger
 */
export function calculateCurrentMonthMarketingSpend(
  ledger: WhatsAppCostLedgerEntry[],
  currentDate: Date = new Date()
): number {
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  return ledger
    .filter((entry) => {
      if (entry.category !== 'MARKETING') return false;
      const entryDate = new Date(entry.created_at);
      return entryDate.getFullYear() === currentYear && entryDate.getMonth() === currentMonth;
    })
    .reduce((sum, entry) => sum + entry.final_cost, 0);
}

export type BudgetAlertLevel = 'OK' | 'WARNING_50' | 'ALERT_80' | 'HARD_STOP_100';

export interface BudgetStatus {
  budgetCap: number;
  currentSpend: number;
  remainingBudget: number;
  usagePercentage: number;
  alertLevel: BudgetAlertLevel;
  isHardStopTriggered: boolean;
  canSendNextAmount: (amount: number) => boolean;
}

/**
 * Evaluate Budget Health & Alert Status
 */
export function evaluateBudgetStatus(
  currentSpend: number,
  budgetCap: number = 2000
): BudgetStatus {
  const usagePercentage = budgetCap > 0 ? (currentSpend / budgetCap) * 100 : 100;
  const remainingBudget = Math.max(0, budgetCap - currentSpend);

  let alertLevel: BudgetAlertLevel = 'OK';
  if (usagePercentage >= 100) {
    alertLevel = 'HARD_STOP_100';
  } else if (usagePercentage >= 80) {
    alertLevel = 'ALERT_80';
  } else if (usagePercentage >= 50) {
    alertLevel = 'WARNING_50';
  }

  const isHardStopTriggered = usagePercentage >= 100;

  return {
    budgetCap,
    currentSpend: Number(currentSpend.toFixed(2)),
    remainingBudget: Number(remainingBudget.toFixed(2)),
    usagePercentage: Number(usagePercentage.toFixed(1)),
    alertLevel,
    isHardStopTriggered,
    canSendNextAmount: (amount: number) => currentSpend + amount <= budgetCap,
  };
}

/**
 * Gate check for dispatching a marketing message or campaign
 */
export function canDispatchMarketing(
  additionalCost: number,
  ledger: WhatsAppCostLedgerEntry[],
  settings: WhatsAppSettings = DEFAULT_BUDGET_SETTINGS
): { allowed: boolean; reason?: string; status: BudgetStatus } {
  const currentSpend = calculateCurrentMonthMarketingSpend(ledger);
  const status = evaluateBudgetStatus(currentSpend, settings.monthly_marketing_budget_cap);

  if (status.isHardStopTriggered) {
    return {
      allowed: false,
      reason: `تم تجاوز السقف الشهري للميزانية التسويقية بالكامل (${status.currentSpend} / ${status.budgetCap} ${settings.currency}). تم الإيقاف الإجباري لحماية الرصيد.`,
      status,
    };
  }

  if (currentSpend + additionalCost > settings.monthly_marketing_budget_cap) {
    return {
      allowed: false,
      reason: `تكلفة الإرسال الإضافية (${additionalCost} ${settings.currency}) ستتجاوز المتبقي من الميزانية (${status.remainingBudget} ${settings.currency}). يرجى زيادة السقف أولاً للمتابعة.`,
      status,
    };
  }

  return { allowed: true, status };
}

/**
 * Check 24-hour Customer Service Window
 * Free-form text can only be sent if window is open; otherwise only templates are allowed.
 */
export function isCustomerServiceWindowOpen(lastIncomingAt?: string): {
  isOpen: boolean;
  hoursRemaining: number;
  expiresAt?: string;
} {
  if (!lastIncomingAt) {
    return { isOpen: false, hoursRemaining: 0 };
  }

  const incomingTime = new Date(lastIncomingAt).getTime();
  const now = Date.now();
  const windowDurationMs = 24 * 60 * 60 * 1000;
  const diffMs = now - incomingTime;

  if (diffMs > windowDurationMs || diffMs < 0) {
    return { isOpen: false, hoursRemaining: 0 };
  }

  const remainingMs = windowDurationMs - diffMs;
  const hoursRemaining = Number((remainingMs / (1000 * 60 * 60)).toFixed(1));
  const expiresAt = new Date(incomingTime + windowDurationMs).toISOString();

  return { isOpen: true, hoursRemaining, expiresAt };
}
