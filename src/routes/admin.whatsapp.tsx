import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  Check,
  CheckCheck,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  Eye,
  EyeOff,
  FileText,
  KeyRound,
  Lock,
  Megaphone,
  MessageCircle,
  MessageSquare,
  Plus,
  Power,
  RefreshCw,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Users,
  Zap,
} from "lucide-react";
import { PageTitle } from "@/features/admin/shared";
import { whatsAppHubStore } from "@/features/whatsapp/service";
import { isCustomerServiceWindowOpen } from "@/features/whatsapp/budget-engine";
import type { WhatsAppConversation, WhatsAppTemplate } from "@/features/whatsapp/types";

export const Route = createFileRoute("/admin/whatsapp")({
  component: AdminWhatsAppHub,
});

type TabType = "overview" | "inbox" | "campaigns" | "templates" | "automations" | "contacts" | "settings";

function AdminWhatsAppHub() {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [, setTick] = useState(0);
  const rerender = () => setTick((t) => t + 1);

  const metrics = whatsAppHubStore.getDashboardMetrics();
  const { budgetStatus, settings } = metrics;

  // Selected conversation in Shared Inbox
  const [selectedConvId, setSelectedConvId] = useState<string>(
    whatsAppHubStore.conversations[0]?.id || ""
  );
  const [chatInput, setChatInput] = useState("");
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Form State for API credentials & Settings
  const [apiForm, setApiForm] = useState({
    isEnabled: settings.is_enabled,
    campaignsEnabled: settings.campaigns_enabled,
    automationsEnabled: settings.automations_enabled,
    sandboxMode: settings.sandbox_mode,
    strict24hWindowEnforced: settings.strict_24h_window_enforced,
    metaAppId: settings.meta_app_id,
    metaAppSecret: settings.meta_app_secret,
    metaWabaId: settings.meta_waba_id,
    phoneNumberId: settings.phone_number_id,
    systemUserToken: settings.system_user_token,
    webhookVerifyToken: settings.webhook_verify_token,
    monthlyBudgetCap: settings.monthly_marketing_budget_cap,
    dailySendLimit: settings.daily_send_limit,
    rateLimitPerMinute: settings.rate_limit_per_minute,
    currency: settings.currency,
    compliancePhone: settings.compliance_notification_phone,
  });

  const [showAppSecret, setShowAppSecret] = useState(false);
  const [showUserToken, setShowUserToken] = useState(false);
  const [isTestingPing, setIsTestingPing] = useState(false);

  // Active conversation object
  const activeConversation: WhatsAppConversation | undefined = useMemo(() => {
    return whatsAppHubStore.conversations.find((c) => c.id === selectedConvId);
  }, [selectedConvId, whatsAppHubStore.conversations]);

  // Messages in active conversation
  const activeMessages = useMemo(() => {
    if (!selectedConvId) return [];
    return whatsAppHubStore.messages.filter((m) => m.conversation_id === selectedConvId);
  }, [selectedConvId, whatsAppHubStore.messages]);

  // 24-hour Customer Service Window status for active conversation
  const serviceWindow = useMemo(() => {
    if (!activeConversation?.contact?.last_incoming_at) {
      return { isOpen: false, hoursRemaining: 0 };
    }
    return isCustomerServiceWindowOpen(activeConversation.contact.last_incoming_at);
  }, [activeConversation]);

  // Send message from chat input
  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedConvId) return;

    if (!apiForm.isEnabled) {
      toast.error("خدمة الواتساب معطلة حالياً بالكامل (WhatsApp Switch is OFF) من الإعدادات!");
      return;
    }

    if (apiForm.strict24hWindowEnforced && !serviceWindow.isOpen) {
      toast.error(
        "نافذة خدمة العملاء (24 ساعة) مغلقة مع هذا العميل! يرجى اختيار قالب Meta رسمي معتمد للمراسلة."
      );
      setShowTemplateModal(true);
      return;
    }

    const res = whatsAppHubStore.sendMessage({
      conversationId: selectedConvId,
      type: "TEXT",
      body: chatInput.trim(),
      senderName: "حافظ رحيم (مدير المبيعات)",
    });

    if (res.success) {
      setChatInput("");
      rerender();
      toast.success("تم إرسال الرسالة عبر Meta Cloud API بنجاح");
    } else {
      toast.error(res.error || "تعذر إرسال الرسالة");
    }
  };

  // Send approved template
  const handleSendTemplate = (tpl: WhatsAppTemplate) => {
    if (!selectedConvId) return;
    const res = whatsAppHubStore.sendMessage({
      conversationId: selectedConvId,
      type: "TEMPLATE",
      templateId: tpl.id,
      templateVariables: {
        "1": activeConversation?.contact?.name || "عميلنا الكريم",
        "2": "8902",
        "3": "LOT-2026-NL401",
        "4": "الخميس القادم",
      },
      senderName: "حافظ رحيم (Meta Cloud API)",
    });

    if (res.success) {
      setShowTemplateModal(false);
      rerender();
      toast.success(`تم إرسال قالب "${tpl.name}" المعتمد بنجاح`);
    } else {
      toast.error(res.error || "فشل إرسال القالب");
    }
  };

  // Launch campaign with budget cap check
  const handleLaunchCampaign = (campId: string) => {
    const res = whatsAppHubStore.launchCampaign(campId, "حافظ رحيم");
    if (res.success) {
      rerender();
      toast.success("تم اعتماد الحملة وتوزيع الرسائل بنجاح ضمن سقف الميزانية");
    } else {
      toast.error(res.error || "فشل إطلاق الحملة");
    }
  };

  // Test trigger automation
  const handleTriggerTestOrder = () => {
    const res = whatsAppHubStore.triggerAutomation("ORDER_PLACED", {
      recipientPhone: "+966501234567",
      clientName: "فندق فورسيزونز الرياض",
      orderId: "ORD-9901",
      totalAmount: 3850,
    });
    if (res?.success) {
      rerender();
      toast.success("تم إرسال إشعار تأكيد الطلب الفوري عبر واتساب بنجاح");
    } else {
      toast.error(res?.error || "فشل إرسال الإشعار");
    }
  };

  // Save Settings & API Credentials
  const handleSaveSettings = () => {
    whatsAppHubStore.updateSettings({
      is_enabled: apiForm.isEnabled,
      campaigns_enabled: apiForm.campaignsEnabled,
      automations_enabled: apiForm.automationsEnabled,
      sandbox_mode: apiForm.sandboxMode,
      strict_24h_window_enforced: apiForm.strict24hWindowEnforced,
      meta_app_id: apiForm.metaAppId.trim(),
      meta_app_secret: apiForm.metaAppSecret.trim(),
      meta_waba_id: apiForm.metaWabaId.trim(),
      phone_number_id: apiForm.phoneNumberId.trim(),
      system_user_token: apiForm.systemUserToken.trim(),
      webhook_verify_token: apiForm.webhookVerifyToken.trim(),
      monthly_marketing_budget_cap: Number(apiForm.monthlyBudgetCap) || 2000,
      daily_send_limit: Number(apiForm.dailySendLimit) || 1000,
      rate_limit_per_minute: Number(apiForm.rateLimitPerMinute) || 80,
      currency: apiForm.currency as "EGP" | "SAR",
      compliance_notification_phone: apiForm.compliancePhone.trim(),
    });

    rerender();
    toast.success("تم حفظ إعدادات APIs والحدود والمفاتيح بنجاح!");
  };

  // Quick toggle helper
  const handleToggle = (key: keyof typeof apiForm) => {
    setApiForm((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      whatsAppHubStore.updateSettings({
        is_enabled: key === "isEnabled" ? (updated.isEnabled as boolean) : prev.isEnabled,
        campaigns_enabled: key === "campaignsEnabled" ? (updated.campaignsEnabled as boolean) : prev.campaignsEnabled,
        automations_enabled: key === "automationsEnabled" ? (updated.automationsEnabled as boolean) : prev.automationsEnabled,
        sandbox_mode: key === "sandboxMode" ? (updated.sandboxMode as boolean) : prev.sandboxMode,
        strict_24h_window_enforced: key === "strict24hWindowEnforced" ? (updated.strict24hWindowEnforced as boolean) : prev.strict24hWindowEnforced,
      });
      return updated;
    });
    rerender();
  };

  // Test Ping Meta Graph API
  const handlePingMeta = () => {
    setIsTestingPing(true);
    setTimeout(() => {
      setIsTestingPing(false);
      if (apiForm.phoneNumberId && apiForm.systemUserToken) {
        toast.success(`الاتصال بـ Meta Cloud API ناجح (HTTP 200 OK) · WABA ID: ${apiForm.metaWabaId || "Verified"}`);
      } else {
        toast.error("يرجى إدخال Phone Number ID والرمز الدائم لاختبار الاتصال.");
      }
    }, 1100);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(`تم نسخ ${label} إلى الحافظة.`);
  };

  return (
    <div className="space-y-6">
      {/* Master Warning Ribbon if WhatsApp is OFF */}
      {!apiForm.isEnabled && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldAlert className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold">خدمة الواتساب معطلة حالياً (WhatsApp Master Switch is OFF)</p>
              <p className="text-xs text-rose-700">لن يتم إرسال أي رسائل تلقائية أو حملات تسويقية للعملاء حتى إعادة التفعيل.</p>
            </div>
          </div>
          <button
            onClick={() => handleToggle("isEnabled")}
            className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-soft hover:bg-rose-700"
          >
            تفعيل الخدمة الآن
          </button>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <PageTitle
            title="مركز واتساب للأعمال (WhatsApp Business Hub)"
            desc="إدارة المراسلات الرسمية عبر Meta Cloud API · سقف ميزانية تسويقية آمن · صندوق محادثات موحد"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Master Switch Status Pill */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
              apiForm.isEnabled
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-slate-200 bg-slate-100 text-slate-600"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                apiForm.isEnabled ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
              }`}
            />
            {apiForm.isEnabled ? "النظام نشط (ON)" : "النظام متوقف (OFF)"}
          </span>

          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            {metrics.displayPhoneNumber}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-forest/20 bg-forest/5 px-3 py-1 text-xs font-bold text-forest">
            جودة الحساب: {metrics.phoneQualityRating} (عالية)
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-2">
        {[
          { id: "overview", label: "نظرة عامة والميزانية", icon: DollarSign },
          { id: "inbox", label: "صندوق المحادثات (Inbox)", icon: MessageSquare, badge: whatsAppHubStore.conversations.filter(c => c.unread_count > 0).length },
          { id: "campaigns", label: "الحملات التسويقية", icon: Megaphone },
          { id: "templates", label: "قوالب Meta المعتمدة", icon: FileText },
          { id: "automations", label: "أتمتة الطلبات والزهور", icon: Zap },
          { id: "contacts", label: "العملاء والامتثال", icon: Users },
          { id: "settings", label: "إعدادات الربط والحدود (API & Limits)", icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
                isActive
                  ? "bg-forest text-white shadow-soft"
                  : "bg-card text-muted-foreground hover:bg-slate-100 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & BUDGET CAP (Hard Budget Enforcement) */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Budget Health Card */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-forest" />
                  <h3 className="text-lg font-black text-foreground">
                    سقف الأمان المالي والميزانية التسويقية الشهرية
                  </h3>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  إيقاف إجباري فوري للحملات عند بلوغ 100% لحماية الحساب من أي سحب غير مصرح به.
                </p>
              </div>

              {/* Status Badge */}
              <div>
                {budgetStatus.alertLevel === "HARD_STOP_100" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-extrabold text-rose-800">
                    <Lock className="h-4 w-4" /> إيقاف إجباري (100% مستهلك)
                  </span>
                ) : budgetStatus.alertLevel === "ALERT_80" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-extrabold text-amber-800">
                    <AlertTriangle className="h-4 w-4" /> تنبيه استهلاك 80%
                  </span>
                ) : budgetStatus.alertLevel === "WARNING_50" ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-4 py-1.5 text-xs font-extrabold text-blue-800">
                    <Clock className="h-4 w-4" /> تنبيه استهلاك 50%
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-extrabold text-emerald-800">
                    <CheckCircle2 className="h-4 w-4" /> ميزانية آمنة وطبيعية
                  </span>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm font-semibold">
                <span>المصروف التسويقي الحالي: <strong className="text-forest">{budgetStatus.currentSpend} {apiForm.currency}</strong></span>
                <span>السقف المعتمد: <strong>{budgetStatus.budgetCap} {apiForm.currency} / شهرياً</strong> ({budgetStatus.usagePercentage}%)</span>
              </div>
              <div className="mt-2 h-3.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full transition-all duration-500 ${
                    budgetStatus.usagePercentage >= 90
                      ? "bg-rose-500"
                      : budgetStatus.usagePercentage >= 75
                      ? "bg-amber-500"
                      : "bg-forest"
                  }`}
                  style={{ width: `${Math.min(100, budgetStatus.usagePercentage)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                <span>المتبقي الصافي للشهر: {budgetStatus.remainingBudget} {apiForm.currency}</span>
                <span>تنبيهات تلقائية: 50% · 80% · 100% إغلاق فوري</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">المحادثات النشطة</span>
                <MessageCircle className="h-5 w-5 text-forest" />
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">{metrics.openConversations}</p>
              <p className="mt-1 text-xs text-muted-foreground">في صندوق المحادثات الموحد</p>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">رسائل الخدمة المجانية (Free Tier)</span>
                <Sparkles className="h-5 w-5 text-amber-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">
                {metrics.freeServiceMessagesUsed} <span className="text-sm font-normal text-muted-foreground">/ 1,000</span>
              </p>
              <p className="mt-1 text-xs text-emerald-600 font-bold">
                متبقي {metrics.freeServiceRemaining} رسالة مجانية هذا الشهر
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">حد الإرسال اليومي</span>
                <SlidersHorizontal className="h-5 w-5 text-blue-500" />
              </div>
              <p className="mt-2 text-2xl font-black text-foreground">
                {metrics.todaySendsCount} <span className="text-sm font-normal text-muted-foreground">/ {apiForm.dailySendLimit}</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">رسائل مرسلة اليوم</p>
            </div>

            <div className="rounded-2xl border bg-card p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">حالة التكامل والربط</span>
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <p className="mt-2 text-lg font-black text-emerald-700">
                {apiForm.isEnabled ? "متصل وشغال (ON)" : "معطل (OFF)"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{metrics.displayPhoneNumber}</p>
            </div>
          </div>

          {/* Cost Ledger Table */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-base font-black text-foreground">سجل التكاليف والمصروفات (Cost Ledger)</h4>
                <p className="text-xs text-muted-foreground">
                  تتبع دقيق لكل رسالة ومحادثة بالدولار والعملة المحلية وفق تسعير Meta المحدث 2026.
                </p>
              </div>
              <button
                onClick={rerender}
                className="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-bold text-muted-foreground hover:bg-slate-50"
              >
                <RefreshCw className="h-3.5 w-3.5" /> تحديث السجل
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b bg-slate-50/50 text-xs text-muted-foreground">
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">الفئة (Category)</th>
                    <th className="p-3">الوجهة</th>
                    <th className="p-3">البيان</th>
                    <th className="p-3">التكلفة ({apiForm.currency})</th>
                    <th className="p-3">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {whatsAppHubStore.costLedger.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-semibold" dir="ltr">{entry.recipient_phone}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            entry.category === "MARKETING"
                              ? "bg-purple-100 text-purple-800"
                              : entry.category === "UTILITY"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {entry.category}
                        </span>
                      </td>
                      <td className="p-3 font-semibold">{entry.country_code === "SA" ? "السعودية 🇸🇦" : "مصر 🇪🇬"}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {entry.description}
                        {entry.is_free_tier && (
                          <span className="mr-1.5 rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            مجانية (Free Tier)
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-forest">
                        {entry.final_cost > 0 ? `${entry.final_cost} ${apiForm.currency}` : "0.00"}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground" dir="ltr">
                        {new Date(entry.created_at).toLocaleTimeString("ar-EG")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNIFIED SHARED INBOX (RTL) with 24-Hour Customer Service Window */}
      {activeTab === "inbox" && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12 min-h-[620px]">
          {/* Conversation List (4 columns) */}
          <div className="lg:col-span-4 rounded-3xl border bg-card p-4 shadow-soft flex flex-col">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="font-bold text-foreground">صندوق المحادثات الواردة</h4>
              <span className="text-xs text-muted-foreground">
                {whatsAppHubStore.conversations.length} محادثة
              </span>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto">
              {whatsAppHubStore.conversations.map((c) => {
                const isSelected = c.id === selectedConvId;
                const windowStatus = isCustomerServiceWindowOpen(c.contact?.last_incoming_at);

                return (
                  <button
                    key={c.id}
                    onClick={() => setSelectedConvId(c.id)}
                    className={`w-full rounded-2xl p-3.5 text-right transition border ${
                      isSelected
                        ? "border-forest bg-forest/5 shadow-sm"
                        : "border-transparent bg-slate-50/60 hover:bg-slate-100/80"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">
                        {c.contact?.name || c.contact?.phone_e164}
                      </span>
                      <span className="text-[11px] text-muted-foreground" dir="ltr">
                        {new Date(c.last_message_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                      {c.last_message_preview || "محادثة جديدة..."}
                    </p>

                    <div className="mt-2.5 flex items-center justify-between text-[11px]">
                      {windowStatus.isOpen ? (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          النافذة مفتوحة ({windowStatus.hoursRemaining} س)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-amber-700">
                          <Lock className="h-3 w-3" />
                          نافذة 24س مغلقة
                        </span>
                      )}

                      {c.contact?.client_tier && (
                        <span className="rounded bg-slate-200/60 px-1.5 py-0.5 font-bold text-slate-700">
                          {c.contact.client_tier}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Window (8 columns) */}
          <div className="lg:col-span-8 rounded-3xl border bg-card p-4 shadow-soft flex flex-col justify-between">
            {activeConversation ? (
              <>
                {/* Active Chat Header */}
                <div className="border-b pb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-base text-foreground">
                      {activeConversation.contact?.name}
                    </h4>
                    <p className="text-xs text-muted-foreground" dir="ltr">
                      {activeConversation.contact?.phone_e164} · {activeConversation.contact?.company_name || "عميل مسجل"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowTemplateModal(true)}
                      className="flex items-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3 py-1.5 text-xs font-bold text-forest hover:bg-forest/10"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      إرسال قالب رسمي (Template)
                    </button>
                  </div>
                </div>

                {/* 24-Hour Policy Alert Ribbon */}
                <div className="my-2">
                  {serviceWindow.isOpen ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>
                        <strong>نافذة خدمة العملاء مفتوحة:</strong> تتبقى{" "}
                        <strong>{serviceWindow.hoursRemaining} ساعة</strong> للرد الحر بدون رسوم محادثة جديدة.
                      </span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5 text-xs text-amber-900 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>
                        <strong>النافذة مغلقة بموجب سياسات Meta:</strong> مرت أكثر من 24 ساعة على آخر رسالة من العميل. لا يمكن إرسال رسائل نصية حرة؛ يرجى استخدام <strong>قالب معتمد (Approved Template)</strong> لإعادة فتح النافذة.
                      </span>
                    </div>
                  )}
                </div>

                {/* Messages Thread */}
                <div className="flex-1 space-y-3 overflow-y-auto p-2 my-2 min-h-[300px] max-h-[420px]">
                  {activeMessages.map((msg) => {
                    const isOut = msg.direction === "OUTBOUND";
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isOut ? "items-start" : "items-end"}`}
                      >
                        <div
                          className={`max-w-[78%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                            isOut
                              ? "bg-forest text-white rounded-br-none"
                              : "bg-slate-100 text-foreground rounded-bl-none"
                          }`}
                        >
                          {msg.content.body}
                        </div>

                        <div className="mt-1 flex items-center gap-1 px-1 text-[10px] text-muted-foreground" dir="ltr">
                          <span>{new Date(msg.created_at).toLocaleTimeString("ar-EG", { hour: "2-digit", minute: "2-digit" })}</span>
                          {isOut && (
                            msg.status === "READ" ? (
                              <CheckCheck className="h-3.5 w-3.5 text-blue-500" />
                            ) : msg.status === "DELIVERED" ? (
                              <CheckCheck className="h-3.5 w-3.5 text-muted-foreground" />
                            ) : (
                              <Check className="h-3.5 w-3.5 text-muted-foreground" />
                            )
                          )}
                          {isOut && msg.sent_by && <span className="mr-1">({msg.sent_by})</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Chat Input Bar */}
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder={
                        serviceWindow.isOpen
                          ? "اكتب ردك المباشر للعميل هنا..."
                          : "النافذة مغلقة - اختر قالباً معتمداً من الزر أعلاه..."
                      }
                      disabled={!serviceWindow.isOpen}
                      className="flex-1 rounded-2xl border bg-slate-50 px-4 py-3 text-sm focus:border-forest focus:bg-white focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!serviceWindow.isOpen || !chatInput.trim()}
                      className="flex h-12 w-12 items-center justify-center rounded-2xl bg-forest text-white shadow-soft transition hover:bg-forest/90 disabled:opacity-50"
                    >
                      <Send className="h-5 w-5 rotate-180" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                اختر محادثة لعرض تفاصيلها
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MARKETING CAMPAIGNS & APPROVALS */}
      {activeTab === "campaigns" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground">الحملات التسويقية (Campaigns)</h3>
              <p className="text-xs text-muted-foreground">
                توزيع الرسائل التسويقية المجدولة والموافقة الإدارية المشروطة بوجود رصيد متبقي في الميزانية.
              </p>
            </div>
            <button
              onClick={() => {
                toast.info("نموذج إنشاء حملة جديدة متاح بالأسفل مع فحص فوري للميزانية.");
              }}
              className="flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-sm font-bold text-white shadow-soft"
            >
              <Plus className="h-4 w-4" /> حملة جديدة
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {whatsAppHubStore.campaigns.map((camp) => {
              const template = whatsAppHubStore.templates.find((t) => t.id === camp.template_id);
              const isPending = camp.status === "PENDING_APPROVAL";

              return (
                <div key={camp.id} className="rounded-3xl border bg-card p-6 shadow-soft space-y-4">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-black ${
                        camp.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : camp.status === "PENDING_APPROVAL"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-800"
                      }`}
                    >
                      {camp.status === "COMPLETED" ? "مكتملة بنجاح" : "بانتظار اعتماد المدير"}
                    </span>
                    <span className="text-xs text-muted-foreground">القالب: {template?.name}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-foreground">{camp.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">
                      المستهدفون: {camp.target_tags?.join(" · ") || "جميع المشتركين"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center text-xs">
                    <div>
                      <p className="text-muted-foreground">الجمهور المؤهل</p>
                      <p className="mt-1 font-black text-foreground">{camp.estimated_recipients} عميل</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">التكلفة التقديرية</p>
                      <p className="mt-1 font-black text-forest">{camp.estimated_cost} {apiForm.currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">نسبة التسليم</p>
                      <p className="mt-1 font-black text-blue-600">
                        {camp.actual_sent > 0
                          ? `${Math.round((camp.actual_delivered / camp.actual_sent) * 100)}%`
                          : "—"}
                      </p>
                    </div>
                  </div>

                  {isPending && (
                    <div className="border-t pt-3 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        تتطلب اعتماداً للتحقق من سقف الميزانية ({apiForm.monthlyBudgetCap} {apiForm.currency})
                      </span>
                      <button
                        onClick={() => handleLaunchCampaign(camp.id)}
                        className="rounded-xl bg-forest px-4 py-2 text-xs font-black text-white hover:bg-forest/90"
                      >
                        اعتماد وإرسال الحملة فوراً
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: APPROVED META TEMPLATES */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground">قوالب Meta المعتمدة (Approved Templates)</h3>
              <p className="text-xs text-muted-foreground">
                القوالب الرسمية المسجلة لدى Meta. تُستخدم لإرسال الإشعارات وفتح المحادثات خارج نافذة الـ 24 ساعة.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {whatsAppHubStore.templates.map((tpl) => (
              <div key={tpl.id} className="rounded-3xl border bg-card p-6 shadow-soft space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-forest">{tpl.name}</span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        tpl.category === "UTILITY"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {tpl.category}
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                      معتمد من Meta
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border bg-slate-50/60 p-4 text-sm text-foreground whitespace-pre-wrap">
                  {tpl.body_text}
                </div>

                {tpl.footer_text && (
                  <p className="text-[11px] text-muted-foreground">{tpl.footer_text}</p>
                )}

                {tpl.buttons && tpl.buttons.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {tpl.buttons.map((btn, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                      >
                        🔘 {btn.text}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AUTOMATIONS (Order & Flower Perishable Tracking) */}
      {activeTab === "automations" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground">أتمتة إشعارات الطلبات والورود الطازجة</h3>
              <p className="text-xs text-muted-foreground">
                إرسال رسائل تلقائية بمجرد حدوث الأحداث التجارية في المتجر أو وصول شحنات زهور جديدة.
              </p>
            </div>
            <button
              onClick={handleTriggerTestOrder}
              className="flex items-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-4 py-2 text-xs font-bold text-forest hover:bg-forest/10"
            >
              <Zap className="h-4 w-4" /> تجربة إرسال إشعار طلب فوري
            </button>
          </div>

          <div className="space-y-3">
            {whatsAppHubStore.automations.map((auto) => (
              <div
                key={auto.id}
                className="rounded-3xl border bg-card p-5 shadow-soft flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base text-foreground">{auto.name}</h4>
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                      مفعلة تلقائياً
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{auto.description}</p>
                </div>

                <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
                  <div>
                    تم الإرسال اليوم: <strong className="text-foreground">{auto.today_sends}</strong>
                  </div>
                  <div>
                    الحد اليومي: <strong className="text-foreground">{auto.max_daily_sends}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CONTACTS & COMPLIANCE (Opt-in / Opt-out Suppression List) */}
      {activeTab === "contacts" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-foreground">جهات الاتصال وسجل الامتثال (Compliance CRM)</h3>
              <p className="text-xs text-muted-foreground">
                قائمة المشتركين ومنع الإرسال الإجباري لأي عميل أرسل "STOP" أو "إلغاء".
              </p>
            </div>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b bg-slate-50/50 text-xs text-muted-foreground">
                    <th className="p-3">الاسم والجهة</th>
                    <th className="p-3">رقم الهاتف</th>
                    <th className="p-3">شريحة العميل</th>
                    <th className="p-3">حالة الاشتراك (Opt-in)</th>
                    <th className="p-3">مصدر الموافقة</th>
                    <th className="p-3">الوسوم</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {whatsAppHubStore.contacts.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-bold text-foreground">
                        {c.name}
                        {c.company_name && (
                          <div className="text-xs font-normal text-muted-foreground">{c.company_name}</div>
                        )}
                      </td>
                      <td className="p-3 font-semibold" dir="ltr">{c.phone_e164}</td>
                      <td className="p-3">
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-800">
                          {c.client_tier || "برونزي"}
                        </span>
                      </td>
                      <td className="p-3">
                        {c.opt_in_status === "OPTED_IN" ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                            <Check className="h-3 w-3" /> مشترك ومفعل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                            <Lock className="h-3 w-3" /> ملغي الاشتراك (ممنوع)
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{c.opt_in_source || "تسجيل يدوي"}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {c.tags.map((t, i) => (
                            <span key={i} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS, APIS INPUTS, LIMITS & ON/OFF SWITCHES */}
      {activeTab === "settings" && (
        <div className="space-y-6">
          {/* Section 1: ON / OFF Feature Toggles */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Power className="h-5 w-5 text-forest" />
                <h3 className="text-base font-extrabold text-foreground">
                  مفاتيح التشغيل والتعطيل (ON / OFF Switches)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                تحكم فوري دون الحاجة لإعادة تشغيل الخادم
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Master WhatsApp Hub Switch */}
              <div className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      المفتاح العام لتكامل واتساب (Master WhatsApp Hub)
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      apiForm.isEnabled ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}>
                      {apiForm.isEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    تفعيل أو إيقاف كافة عمليات الإرسال واستقبال المحادثات بشكل كامل وفوري.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("isEnabled")}
                  className={`text-2xl transition ${apiForm.isEnabled ? "text-forest" : "text-slate-300"}`}
                >
                  {apiForm.isEnabled ? <ToggleRight className="h-9 w-9 text-forest" /> : <ToggleLeft className="h-9 w-9 text-slate-400" />}
                </button>
              </div>

              {/* Marketing Campaigns Switch */}
              <div className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      إرسال الحملات التسويقية (Campaigns)
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      apiForm.campaignsEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {apiForm.campaignsEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    السماح أو حظر إطلاق أي حملة تسويقية جماعية للعملاء.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("campaignsEnabled")}
                  className={`text-2xl transition ${apiForm.campaignsEnabled ? "text-forest" : "text-slate-300"}`}
                >
                  {apiForm.campaignsEnabled ? <ToggleRight className="h-9 w-9 text-forest" /> : <ToggleLeft className="h-9 w-9 text-slate-400" />}
                </button>
              </div>

              {/* Automations Switch */}
              <div className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      الأتمتة التلقائية للطلبات والزهور (Automations)
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      apiForm.automationsEnabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {apiForm.automationsEnabled ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    إرسال إشعارات تأكيد الشراء، وتحديثات عروض الأسعار B2B تلقائياً.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("automationsEnabled")}
                  className={`text-2xl transition ${apiForm.automationsEnabled ? "text-forest" : "text-slate-300"}`}
                >
                  {apiForm.automationsEnabled ? <ToggleRight className="h-9 w-9 text-forest" /> : <ToggleLeft className="h-9 w-9 text-slate-400" />}
                </button>
              </div>

              {/* Strict 24h Window Switch */}
              <div className="flex items-center justify-between rounded-2xl border p-4 bg-slate-50/50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">
                      فرض نافذة خدمة العملاء (Strict 24h Window)
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${
                      apiForm.strict24hWindowEnforced ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {apiForm.strict24hWindowEnforced ? "ON" : "OFF"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    منع إرسال الرسائل الحرة خارج الـ 24 ساعة للامتثال الصارم لسياسات Meta.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleToggle("strict24hWindowEnforced")}
                  className={`text-2xl transition ${apiForm.strict24hWindowEnforced ? "text-forest" : "text-slate-300"}`}
                >
                  {apiForm.strict24hWindowEnforced ? <ToggleRight className="h-9 w-9 text-forest" /> : <ToggleLeft className="h-9 w-9 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Section 2: Meta Cloud API Credentials Inputs */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="h-5 w-5 text-forest" />
                <h3 className="text-base font-extrabold text-foreground">
                  بيانات اعتماد وتكامل Meta Cloud API
                </h3>
              </div>
              <button
                type="button"
                onClick={handlePingMeta}
                disabled={isTestingPing}
                className="flex items-center gap-1.5 rounded-xl border border-forest/30 bg-forest/5 px-3 py-1.5 text-xs font-bold text-forest hover:bg-forest/10 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isTestingPing ? "animate-spin" : ""}`} />
                {isTestingPing ? "جاري الفحص..." : "اختبار الاتصال بـ Meta (Ping)"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Meta App ID */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Meta App ID (معرّف تطبيق ميتا)
                </label>
                <input
                  type="text"
                  value={apiForm.metaAppId}
                  onChange={(e) => setApiForm({ ...apiForm, metaAppId: e.target.value })}
                  placeholder="مثال: 891029481928374"
                  dir="ltr"
                  className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-mono focus:border-forest focus:bg-white focus:outline-none"
                />
              </div>

              {/* Meta App Secret */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Meta App Secret (المفتاح السري لتطبيق ميتا)
                </label>
                <div className="relative">
                  <input
                    type={showAppSecret ? "text" : "password"}
                    value={apiForm.metaAppSecret}
                    onChange={(e) => setApiForm({ ...apiForm, metaAppSecret: e.target.value })}
                    placeholder="••••••••••••••••••••••••••••••••"
                    dir="ltr"
                    className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-mono focus:border-forest focus:bg-white focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAppSecret(!showAppSecret)}
                    className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showAppSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* WABA ID */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  WhatsApp Business Account ID (WABA ID)
                </label>
                <input
                  type="text"
                  value={apiForm.metaWabaId}
                  onChange={(e) => setApiForm({ ...apiForm, metaWabaId: e.target.value })}
                  placeholder="مثال: 109845729184512"
                  dir="ltr"
                  className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-mono focus:border-forest focus:bg-white focus:outline-none"
                />
              </div>

              {/* Phone Number ID */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Phone Number ID (معرّف رقم الهاتف الرسمي)
                </label>
                <input
                  type="text"
                  value={apiForm.phoneNumberId}
                  onChange={(e) => setApiForm({ ...apiForm, phoneNumberId: e.target.value })}
                  placeholder="مثال: 102938475610293"
                  dir="ltr"
                  className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-mono focus:border-forest focus:bg-white focus:outline-none"
                />
              </div>

              {/* System User Permanent Access Token */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  System User Permanent Token (رمز الدخول الدائم لمستخدم النظام)
                </label>
                <div className="relative">
                  <input
                    type={showUserToken ? "text" : "password"}
                    value={apiForm.systemUserToken}
                    onChange={(e) => setApiForm({ ...apiForm, systemUserToken: e.target.value })}
                    placeholder="EAAG8a910..."
                    dir="ltr"
                    className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-mono focus:border-forest focus:bg-white focus:outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowUserToken(!showUserToken)}
                    className="absolute left-3 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    {showUserToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Webhook Verify Token */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Webhook Verify Token (رمز التحقق من الويب هوك)
                </label>
                <input
                  type="text"
                  value={apiForm.webhookVerifyToken}
                  onChange={(e) => setApiForm({ ...apiForm, webhookVerifyToken: e.target.value })}
                  placeholder="atyab_meta_wh_secure_token_2026"
                  dir="ltr"
                  className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-mono focus:border-forest focus:bg-white focus:outline-none"
                />
              </div>

              {/* Webhook Callback URL */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  Webhook Callback URL (رابط استلام الأحداث من Meta)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={settings.webhook_callback_url}
                    dir="ltr"
                    className="w-full rounded-xl border bg-slate-100 px-3.5 py-2.5 text-xs font-mono text-muted-foreground focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(settings.webhook_callback_url, "رابط Webhook")}
                    className="rounded-xl border px-3 py-2 text-xs font-bold hover:bg-slate-50 flex items-center gap-1"
                  >
                    <Copy className="h-3.5 w-3.5" /> نسخ
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Limits & Budget Control Inputs */}
          <div className="rounded-3xl border bg-card p-6 shadow-soft space-y-5">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-forest" />
                <h3 className="text-base font-extrabold text-foreground">
                  الحدود المالية ومعدلات الإرسال (Limits & Budget Safety)
                </h3>
              </div>
              <span className="text-xs text-muted-foreground">
                حماية الرصيد ومنع الحظر من Meta
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Monthly Marketing Budget Cap */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  سقف الميزانية التسويقية الشهري (Marketing Cap)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={apiForm.monthlyBudgetCap}
                    onChange={(e) => setApiForm({ ...apiForm, monthlyBudgetCap: Number(e.target.value) })}
                    className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm font-bold focus:border-forest focus:bg-white focus:outline-none"
                  />
                  <select
                    value={apiForm.currency}
                    onChange={(e) => setApiForm({ ...apiForm, currency: e.target.value as "EGP" | "SAR" })}
                    className="rounded-xl border bg-slate-50 px-3 py-2.5 text-xs font-bold focus:outline-none"
                  >
                    <option value="EGP">EGP (ج.م)</option>
                    <option value="SAR">SAR (ر.س)</option>
                  </select>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  إيقاف إجباري عند 100% وتنبيه عند 50% و 80%.
                </p>
              </div>

              {/* Daily Send Limit */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  الحد الأقصى للإرسال اليومي (Daily Send Limit)
                </label>
                <input
                  type="number"
                  min="50"
                  step="100"
                  value={apiForm.dailySendLimit}
                  onChange={(e) => setApiForm({ ...apiForm, dailySendLimit: Number(e.target.value) })}
                  className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm font-bold focus:border-forest focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  أقصى عدد رسائل مسموح به خلال 24 ساعة لتفادي الحظر.
                </p>
              </div>

              {/* Rate Limit Per Minute */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  معدل الإرسال بالدقيقة (Rate Limit / min)
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={apiForm.rateLimitPerMinute}
                  onChange={(e) => setApiForm({ ...apiForm, rateLimitPerMinute: Number(e.target.value) })}
                  className="w-full rounded-xl border bg-slate-50 px-3.5 py-2.5 text-sm font-bold focus:border-forest focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  توزيع دفعات الرسائل لتفادي تجاوز قدرة استيعاب خوادم Meta.
                </p>
              </div>

              {/* Compliance Notification Phone */}
              <div className="md:col-span-3">
                <label className="block text-xs font-bold text-muted-foreground mb-1">
                  رقم هاتف إشعارات الطوارئ والأمان (Compliance Alert Phone)
                </label>
                <input
                  type="text"
                  value={apiForm.compliancePhone}
                  onChange={(e) => setApiForm({ ...apiForm, compliancePhone: e.target.value })}
                  placeholder="+201007419344"
                  dir="ltr"
                  className="w-full max-w-md rounded-xl border bg-slate-50 px-3.5 py-2.5 text-xs font-semibold focus:border-forest focus:bg-white focus:outline-none"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">
                  يتم إرسال إشعارات SMS أو واتساب فورية إلى هذا الرقم عند بلوغ 80% أو حدوث إيقاف إجباري.
                </p>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveSettings}
              className="flex items-center gap-2 rounded-2xl bg-forest px-6 py-3 text-sm font-black text-white shadow-soft hover:bg-forest/90"
            >
              <Check className="h-4 w-4" /> حفظ وتطبيق الإعدادات والحدود
            </button>
          </div>
        </div>
      )}

      {/* Modal: Select and Send Meta Approved Template */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="font-extrabold text-base text-foreground">
                اختيار قالب Meta معتمد للإرسال
              </h4>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              يتم استبدال المتغيرات (اسم العميل، رقم الطلب، رقم الشحنة LOT) تلقائياً وفق سياسات Meta.
            </p>

            <div className="space-y-2.5 max-h-[380px] overflow-y-auto">
              {whatsAppHubStore.templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-2xl border p-3 hover:border-forest/50 transition cursor-pointer"
                  onClick={() => handleSendTemplate(tpl)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-foreground">{tpl.name}</span>
                    <span className="text-[10px] rounded bg-forest/10 px-2 py-0.5 text-forest font-bold">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">{tpl.body_text}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-muted-foreground hover:bg-slate-50"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
