import { describe, expect, it } from "vitest";
import {
  calculateMessageCost,
  canDispatchMarketing,
  detectCountryFromPhone,
  evaluateBudgetStatus,
  isCustomerServiceWindowOpen,
  DEFAULT_BUDGET_SETTINGS,
} from "../features/whatsapp/budget-engine";
import { whatsAppHubStore } from "../features/whatsapp/service";
import type { WhatsAppCostLedgerEntry } from "../features/whatsapp/types";

describe("WhatsApp Business Hub - Budget & Policy Safety Tests", () => {
  it("detects country correctly from phone number prefix", () => {
    expect(detectCountryFromPhone("+201007419344")).toBe("EG");
    expect(detectCountryFromPhone("01012345678")).toBe("EG");
    expect(detectCountryFromPhone("+966501234567")).toBe("SA");
    expect(detectCountryFromPhone("0559876543")).toBe("SA");
    expect(detectCountryFromPhone("+14155552671")).toBe("DEFAULT");
  });

  it("calculates message cost in target currency", () => {
    const egMarketing = calculateMessageCost("MARKETING", "+201007419344", "EGP");
    expect(egMarketing.costUsd).toBe(0.0644);
    expect(egMarketing.costLocal).toBe(3.22); // 0.0644 * 50

    const saMarketing = calculateMessageCost("MARKETING", "+966501234567", "SAR");
    expect(saMarketing.costUsd).toBe(0.0465);
    expect(saMarketing.costLocal).toBe(0.17); // 0.0465 * 3.75

    // Free tier service message costs 0
    const freeService = calculateMessageCost("SERVICE", "+966501234567", "SAR", true);
    expect(freeService.costLocal).toBe(0);
    expect(freeService.costUsd).toBe(0);
  });

  it("evaluates budget health levels and hard stop at 100%", () => {
    // 0% spend
    const status0 = evaluateBudgetStatus(0, 2000);
    expect(status0.alertLevel).toBe("OK");
    expect(status0.isHardStopTriggered).toBe(false);
    expect(status0.remainingBudget).toBe(2000);

    // 50% warning
    const status50 = evaluateBudgetStatus(1000, 2000);
    expect(status50.alertLevel).toBe("WARNING_50");
    expect(status50.isHardStopTriggered).toBe(false);

    // 85% alert
    const status85 = evaluateBudgetStatus(1700, 2000);
    expect(status85.alertLevel).toBe("ALERT_80");
    expect(status85.isHardStopTriggered).toBe(false);

    // 100% HARD STOP
    const status100 = evaluateBudgetStatus(2000, 2000);
    expect(status100.alertLevel).toBe("HARD_STOP_100");
    expect(status100.isHardStopTriggered).toBe(true);
    expect(status100.remainingBudget).toBe(0);

    // Over budget HARD STOP
    const statusOver = evaluateBudgetStatus(2100, 2000);
    expect(statusOver.alertLevel).toBe("HARD_STOP_100");
    expect(statusOver.isHardStopTriggered).toBe(true);
  });

  it("strictly blocks marketing campaigns exceeding budget cap", () => {
    const mockLedger: WhatsAppCostLedgerEntry[] = [
      {
        id: "1",
        account_id: "acc1",
        category: "MARKETING",
        country_code: "EG",
        currency: "EGP",
        base_cost_usd: 0.0644,
        final_cost: 1950,
        is_free_tier: false,
        recipient_phone: "+201007419344",
        description: "Past campaigns",
        created_at: new Date().toISOString(),
      },
    ];

    // Trying to spend 100 when current is 1950 and cap is 2000
    const checkBlocked = canDispatchMarketing(100, mockLedger, DEFAULT_BUDGET_SETTINGS);
    expect(checkBlocked.allowed).toBe(false);
    expect(checkBlocked.reason).toContain("ستتجاوز المتبقي من الميزانية");

    // Trying to spend 30 when current is 1950 (total 1980 <= 2000) -> Allowed!
    const checkAllowed = canDispatchMarketing(30, mockLedger, DEFAULT_BUDGET_SETTINGS);
    expect(checkAllowed.allowed).toBe(true);
  });

  it("calculates 24-hour customer service window accurately", () => {
    // 2 hours ago -> OPEN
    const recentTime = new Date(Date.now() - 2 * 3600 * 1000).toISOString();
    const openCheck = isCustomerServiceWindowOpen(recentTime);
    expect(openCheck.isOpen).toBe(true);
    expect(openCheck.hoursRemaining).toBeGreaterThan(21);

    // 26 hours ago -> CLOSED
    const oldTime = new Date(Date.now() - 26 * 3600 * 1000).toISOString();
    const closedCheck = isCustomerServiceWindowOpen(oldTime);
    expect(closedCheck.isOpen).toBe(false);
    expect(closedCheck.hoursRemaining).toBe(0);
  });

  it("rejects sending to opted-out contacts in store", () => {
    // Contact 03 is opted-out
    const contact03 = whatsAppHubStore.contacts.find((c) => c.id === "contact-03");
    expect(contact03?.opt_in_status).toBe("OPTED_OUT");

    // Trying to send directly to contact-03
    const testConvId = "conv-test-optout";
    whatsAppHubStore.conversations.push({
      id: testConvId,
      account_id: "waba-atyab-01",
      phone_number_id: "phone-atyab-01",
      contact_id: "contact-03",
      category: "SERVICE",
      status: "OPEN",
      last_message_at: new Date().toISOString(),
      is_free_tier: true,
      unread_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const res = whatsAppHubStore.sendMessage({
      conversationId: testConvId,
      type: "TEXT",
      body: "رسالة تجريبية",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("ألغت اشتراكها (Opted-Out)");
  });

  it("automatically triggers order confirmation automation when enabled", () => {
    whatsAppHubStore.updateSettings({ is_enabled: true, automations_enabled: true });

    const res = whatsAppHubStore.triggerAutomation("ORDER_PLACED", {
      recipientPhone: "+966509988776",
      clientName: "مؤسسة الزهور الراقية",
      orderId: "ORD-TEST-100",
      totalAmount: 1250,
    });

    expect(res.success).toBe(true);
    expect(res.message?.content.template_variables?.["1"]).toBe("مؤسسة الزهور الراقية");
  });

  it("handles inbound STOP keyword to opt-out user immediately", () => {
    const phone = "+201099887766";
    const inboundRes = whatsAppHubStore.receiveInboundMessage(phone, "إلغاء");

    expect(inboundRes.contact.opt_in_status).toBe("OPTED_OUT");
    expect(inboundRes.contact.opt_out_at).toBeDefined();

    const consent = whatsAppHubStore.consentEvents.find((e) => e.phone_e164 === phone);
    expect(consent?.event_type).toBe("OPT_OUT");
  });

  it("respects ON/OFF switches for master switch and feature flags", () => {
    // 1. Turn Master switch OFF
    whatsAppHubStore.updateSettings({ is_enabled: false });

    const resDisabled = whatsAppHubStore.sendMessage({
      conversationId: "conv-01",
      type: "TEXT",
      body: "رسالة أثناء التعطيل",
    });
    expect(resDisabled.success).toBe(false);
    expect(resDisabled.error).toContain("معطلة حالياً بالكامل");

    // Re-enable master, disable campaigns
    whatsAppHubStore.updateSettings({ is_enabled: true, campaigns_enabled: false });
    const campRes = whatsAppHubStore.launchCampaign("camp-02", "أحمد");
    expect(campRes.success).toBe(false);
    expect(campRes.error).toContain("تم تعطيل إرسال الحملات التسويقية");

    // Re-enable campaigns
    whatsAppHubStore.updateSettings({ campaigns_enabled: true });
  });

  it("enforces daily message send limit", () => {
    whatsAppHubStore.updateSettings({ is_enabled: true, daily_send_limit: 10 });
    whatsAppHubStore.todaySendsCount = 10; // Already at limit

    const res = whatsAppHubStore.sendMessage({
      conversationId: "conv-01",
      type: "TEXT",
      body: "رسالة بعد بلوغ الحد اليومي",
    });

    expect(res.success).toBe(false);
    expect(res.error).toContain("تم تجاوز الحد الأقصى اليومي");

    // Restore limit
    whatsAppHubStore.updateSettings({ daily_send_limit: 1000 });
    whatsAppHubStore.todaySendsCount = 25;
  });

  it("updates and persists API inputs and credentials", () => {
    const updated = whatsAppHubStore.updateSettings({
      meta_app_id: "998877665544",
      phone_number_id: "112233445566",
      monthly_marketing_budget_cap: 3500,
      currency: "SAR",
    });

    expect(updated.meta_app_id).toBe("998877665544");
    expect(updated.monthly_marketing_budget_cap).toBe(3500);
    expect(updated.currency).toBe("SAR");
    expect(whatsAppHubStore.phone.phone_number_id).toBe("112233445566");

    // Restore default
    whatsAppHubStore.updateSettings({
      monthly_marketing_budget_cap: 2000,
      currency: "EGP",
    });
  });
});
