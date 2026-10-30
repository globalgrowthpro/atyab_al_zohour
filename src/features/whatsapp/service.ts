/**
 * Atyab Al Zohour - WhatsApp Business Hub Service Layer
 * Native Meta Cloud API Manager with Supabase fallbacks and full offline-first resilience.
 */

import {
  type WhatsAppAccount,
  type WhatsAppPhoneNumber,
  type WhatsAppContact,
  type WhatsAppConsentEvent,
  type WhatsAppConversation,
  type WhatsAppMessage,
  type WhatsAppTemplate,
  type WhatsAppCampaign,
  type WhatsAppAutomation,
  type WhatsAppCostLedgerEntry,
  type WhatsAppSettings,
} from './types';
import {
  DEFAULT_BUDGET_SETTINGS,
  calculateMessageCost,
  canDispatchMarketing,
  evaluateBudgetStatus,
  calculateCurrentMonthMarketingSpend,
  isCustomerServiceWindowOpen,
  estimateCampaignCost,
} from './budget-engine';

// --- Sample / Initial Mock Seed Data ---
export const initialWhatsAppAccount: WhatsAppAccount = {
  id: 'waba-atyab-01',
  meta_waba_id: '109845729184512',
  name: 'أطياب الزهور للتجارة والتوريدات',
  timezone: 'Asia/Riyadh',
  default_currency: 'EGP',
  status: 'ACTIVE',
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-10-30T10:00:00.000Z',
};

export const initialWhatsAppPhone: WhatsAppPhoneNumber = {
  id: 'phone-atyab-01',
  account_id: 'waba-atyab-01',
  phone_number_id: '102938475610293',
  display_phone_number: '+20 100 741 9344',
  verified_name: 'Atyab Al Zohour Flowers',
  quality_rating: 'GREEN',
  messaging_limit_tier: 'TIER_10K',
  status: 'CONNECTED',
  webhook_active: true,
  free_service_messages_used: 142, // out of 1,000 monthly free tier
  created_at: '2026-01-15T10:00:00.000Z',
  updated_at: '2026-10-30T10:00:00.000Z',
};

export const initialTemplates: WhatsAppTemplate[] = [
  {
    id: 'tpl-order-confirm',
    account_id: 'waba-atyab-01',
    meta_template_id: 'meta_tpl_901',
    name: 'order_confirmation_v2',
    category: 'UTILITY',
    language: 'ar',
    status: 'APPROVED',
    header_format: 'TEXT',
    body_text: 'مرحباً {{1}} 🌸 تم تأكيد طلبك رقم #{{2}} بقيمة {{3}} ر.س بنجاح. جاري تجهيز باقات الزهور بعناية.',
    footer_text: 'أطياب الزهور · الجودة والنضارة',
    buttons: [
      { type: 'URL', text: 'تتبع الطلب', url: 'https://atyabalzohour.com/orders/{{2}}' },
      { type: 'QUICK_REPLY', text: 'تحدث مع خدمة العملاء' },
    ],
    synced_at: '2026-10-30T12:00:00Z',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-10-30T12:00:00Z',
  },
  {
    id: 'tpl-b2b-quote-ready',
    account_id: 'waba-atyab-01',
    meta_template_id: 'meta_tpl_902',
    name: 'b2b_quote_ready_with_batch',
    category: 'UTILITY',
    language: 'ar',
    status: 'APPROVED',
    header_format: 'DOCUMENT',
    body_text: 'عزيزنا العميل في {{1}}، تم تجهيز عرض سعر الجملة الخاص بك رقم #{{2}} لشحنة زهور (LOT: {{3}}). صالح حتى {{4}}.',
    footer_text: 'إدارة مبيعات الجملة والفنادق',
    buttons: [
      { type: 'URL', text: 'عرض واعتماد التسعير', url: 'https://atyabalzohour.com/quote' },
      { type: 'PHONE_NUMBER', text: 'اتصال بمدير الحسابات', phone_number: '+201007419344' },
    ],
    synced_at: '2026-10-30T12:00:00Z',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-10-30T12:00:00Z',
  },
  {
    id: 'tpl-flower-arrival',
    account_id: 'waba-atyab-01',
    meta_template_id: 'meta_tpl_903',
    name: 'fresh_flower_batch_arrival',
    category: 'MARKETING',
    language: 'ar',
    status: 'APPROVED',
    header_format: 'IMAGE',
    body_text: 'وصول شحنة زهور هولندية وإكوادورية طازجة اليوم! أصناف فاخرة (جوري هولندي، بيبي روز، أوركيد) متاحة الآن لعملاء الجملة.',
    footer_text: 'أرسل "قف" لإلغاء الاشتراك',
    buttons: [
      { type: 'URL', text: 'تصفح الأصناف وحجز الكميات', url: 'https://atyabalzohour.com/catalog' },
    ],
    synced_at: '2026-10-30T12:00:00Z',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-10-30T12:00:00Z',
  },
  {
    id: 'tpl-seasonal-offer',
    account_id: 'waba-atyab-01',
    meta_template_id: 'meta_tpl_904',
    name: 'seasonal_vip_discount',
    category: 'MARKETING',
    language: 'ar',
    status: 'APPROVED',
    header_format: 'TEXT',
    body_text: 'عرض خاص لشركائنا الفنادق وقاعات المناسبات: خصم يصل إلى {{1}}% على عقود التوريد الأسبوعية للزهور الطبيعية عند الطلب قبل {{2}}.',
    footer_text: 'أرسل "إلغاء" لإيقاف العروض',
    buttons: [
      { type: 'QUICK_REPLY', text: 'طلب تفاصيل العقد' },
      { type: 'URL', text: 'تنزيل الكتالوج', url: 'https://atyabalzohour.com' },
    ],
    synced_at: '2026-10-30T12:00:00Z',
    created_at: '2026-02-15T10:00:00Z',
    updated_at: '2026-10-30T12:00:00Z',
  },
];

export const initialContacts: WhatsAppContact[] = [
  {
    id: 'contact-01',
    account_id: 'waba-atyab-01',
    phone_e164: '+966501234567',
    name: 'فندق الفيصلية الرياض',
    company_name: 'قسم الفعاليات والمشتريات',
    client_tier: 'VIP',
    language_code: 'ar',
    opt_in_status: 'OPTED_IN',
    opt_in_source: 'WEB_CHECKOUT',
    opt_in_at: '2026-02-01T10:00:00Z',
    last_incoming_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    last_outgoing_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    tags: ['فنادق', 'VIP', 'توريد_أسبوعي'],
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'contact-02',
    account_id: 'waba-atyab-01',
    phone_e164: '+966559876543',
    name: 'محل زهور البنفسج - جدة',
    company_name: 'مؤسسة البنفسج للتجارة',
    client_tier: 'GOLD',
    language_code: 'ar',
    opt_in_status: 'OPTED_IN',
    opt_in_source: 'QUOTE_REQUEST',
    opt_in_at: '2026-02-10T10:00:00Z',
    last_incoming_at: new Date(Date.now() - 40 * 3600 * 1000).toISOString(),
    last_outgoing_at: new Date(Date.now() - 38 * 3600 * 1000).toISOString(),
    tags: ['محلات_زهور', 'جملة'],
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'contact-03',
    account_id: 'waba-atyab-01',
    phone_e164: '+201012345678',
    name: 'شركة تنظيم الحفلات الملكية',
    company_name: 'القاهرة للفعاليات',
    client_tier: 'SILVER',
    language_code: 'ar',
    opt_in_status: 'OPTED_OUT',
    opt_in_source: 'INBOUND_KEYWORD',
    opt_out_at: '2026-10-25T14:30:00Z',
    tags: ['حفلات', 'قائمة_حظر'],
    created_at: '2026-01-20T10:00:00Z',
    updated_at: '2026-10-25T14:30:00Z',
  },
  {
    id: 'contact-04',
    account_id: 'waba-atyab-01',
    phone_e164: '+966540112233',
    name: 'مطعم لوسين سنتريا',
    company_name: 'مجموعة المأكولات الراقية',
    client_tier: 'GOLD',
    language_code: 'ar',
    opt_in_status: 'OPTED_IN',
    opt_in_source: 'WEB_CHECKOUT',
    opt_in_at: '2026-02-15T11:00:00Z',
    last_incoming_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    tags: ['مطاعم', 'طاولات_يومية'],
    created_at: '2026-02-15T11:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
];

export const initialConversations: WhatsAppConversation[] = [
  {
    id: 'conv-01',
    account_id: 'waba-atyab-01',
    phone_number_id: 'phone-atyab-01',
    contact_id: 'contact-01',
    contact: initialContacts[0]!,
    category: 'SERVICE',
    status: 'OPEN',
    assigned_to: 'حافظ رحيم',
    last_message_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    is_free_tier: true,
    unread_count: 0,
    last_message_preview: 'تم تأكيد وصول شحنة الورد الإكوادوري الأحمر، سيتم التسليم صباح الغد بإذن الله.',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'conv-02',
    account_id: 'waba-atyab-01',
    phone_number_id: 'phone-atyab-01',
    contact_id: 'contact-02',
    contact: initialContacts[1]!,
    category: 'UTILITY',
    status: 'PENDING',
    assigned_to: 'خدمة العملاء',
    last_message_at: new Date(Date.now() - 38 * 3600 * 1000).toISOString(),
    is_free_tier: false,
    unread_count: 1,
    last_message_preview: 'هل متوفر لديكم توليب أبيض لشحنة الأسبوع القادم؟',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-10-29T10:00:00Z',
  },
  {
    id: 'conv-04',
    account_id: 'waba-atyab-01',
    phone_number_id: 'phone-atyab-01',
    contact_id: 'contact-04',
    contact: initialContacts[3]!,
    category: 'SERVICE',
    status: 'OPEN',
    assigned_to: 'حافظ رحيم',
    last_message_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    is_free_tier: true,
    unread_count: 0,
    last_message_preview: 'نود تجديد عقد تزيين الطاولات لشهر نوفمبر، فضلاً إرسال الأسعار المحدثة.',
    created_at: '2026-02-15T11:00:00Z',
    updated_at: '2026-10-30T09:00:00Z',
  },
];

export const initialMessages: WhatsAppMessage[] = [
  {
    id: 'msg-01',
    conversation_id: 'conv-01',
    meta_msg_id: 'wamid.HBgLMjAxM...AA==',
    direction: 'INBOUND',
    type: 'TEXT',
    content: { body: 'مساء الخير، هل وصلت شحنة الورد الإكوادوري الخاصة بحفل نهاية الأسبوع؟' },
    status: 'READ',
    created_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-02',
    conversation_id: 'conv-01',
    meta_msg_id: 'wamid.HBgLMjAxM...BB==',
    direction: 'OUTBOUND',
    type: 'TEXT',
    content: { body: 'أهلاً بحضرتك! نعم وصلت الشحنة اليوم إلى مستودع التبريد (LOT: LOT-2026-EC802). الزهور بحالة ممتازة وبنضارة تامة.' },
    status: 'READ',
    sent_by: 'حافظ رحيم',
    created_at: new Date(Date.now() - 2.5 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2.4 * 3600 * 1000).toISOString(),
  },
  {
    id: 'msg-03',
    conversation_id: 'conv-01',
    meta_msg_id: 'wamid.HBgLMjAxM...CC==',
    direction: 'OUTBOUND',
    type: 'TEXT',
    content: { body: 'تم تأكيد وصول شحنة الورد الإكوادوري الأحمر، سيتم التسليم صباح الغد بإذن الله.' },
    status: 'DELIVERED',
    sent_by: 'حافظ رحيم',
    created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
  },
];

export const initialCampaigns: WhatsAppCampaign[] = [
  {
    id: 'camp-01',
    account_id: 'waba-atyab-01',
    name: 'حملة وصول شحنات زهور هولندا الأسبوعية',
    template_id: 'tpl-flower-arrival',
    status: 'COMPLETED',
    estimated_recipients: 120,
    estimated_cost: 386.4,
    actual_sent: 118,
    actual_delivered: 115,
    actual_read: 98,
    actual_cost: 379.96,
    currency: 'EGP',
    created_by: 'مدير التسويق',
    approved_by: 'حافظ رحيم',
    approved_at: '2026-10-20T10:00:00Z',
    target_tags: ['جملة', 'فنادق'],
    created_at: '2026-10-19T14:00:00Z',
    updated_at: '2026-10-20T18:00:00Z',
  },
  {
    id: 'camp-02',
    account_id: 'waba-atyab-01',
    name: 'عروض خصومات عقود الشتاء للفنادق',
    template_id: 'tpl-seasonal-offer',
    status: 'PENDING_APPROVAL',
    estimated_recipients: 80,
    estimated_cost: 257.6,
    actual_sent: 0,
    actual_delivered: 0,
    actual_read: 0,
    actual_cost: 0,
    currency: 'EGP',
    created_by: 'محرر الحملات',
    target_tags: ['فنادق', 'VIP'],
    created_at: '2026-10-29T16:00:00Z',
    updated_at: '2026-10-29T16:00:00Z',
  },
];

export const initialAutomations: WhatsAppAutomation[] = [
  {
    id: 'auto-01',
    account_id: 'waba-atyab-01',
    name: 'إشعار تأكيد الطلب الفوري',
    trigger_event: 'ORDER_PLACED',
    template_id: 'tpl-order-confirm',
    is_active: true,
    max_daily_sends: 200,
    today_sends: 18,
    description: 'إرسال رسالة واتساب للعميل فور إتمام عملية الشراء بنجاح مع رابط التتبع.',
    created_at: '2026-02-01T10:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'auto-02',
    account_id: 'waba-atyab-01',
    name: 'إشعار جاهزية عرض سعر الجملة مع رقم الشحنة',
    trigger_event: 'QUOTE_READY',
    template_id: 'tpl-b2b-quote-ready',
    is_active: true,
    max_daily_sends: 100,
    today_sends: 6,
    description: 'إشعار فوري لمسؤولي مشتريات الفنادق والشركات فور مراجعة وتجهيز عرض السعر متضمناً رقم LOT وتاريخ الصلاحية.',
    created_at: '2026-02-05T10:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
  {
    id: 'auto-03',
    account_id: 'waba-atyab-01',
    name: 'تنبيه وصول شحنة زهور طازجة من المطار',
    trigger_event: 'FLOWER_BATCH_ARRIVAL',
    template_id: 'tpl-flower-arrival',
    is_active: true,
    max_daily_sends: 50,
    today_sends: 1,
    description: 'تنبيه عملاء الشريحة الذهبية والـ VIP فور وصول دفعة زهور جديدة من هولندا أو الإكوادور.',
    created_at: '2026-02-10T10:00:00Z',
    updated_at: '2026-10-30T10:00:00Z',
  },
];

export const initialCostLedger: WhatsAppCostLedgerEntry[] = [
  {
    id: 'ledg-01',
    account_id: 'waba-atyab-01',
    campaign_id: 'camp-01',
    category: 'MARKETING',
    country_code: 'EG',
    currency: 'EGP',
    base_cost_usd: 0.0644,
    final_cost: 3.22,
    is_free_tier: false,
    recipient_phone: '+201012345678',
    description: 'حملة وصول شحنات زهور هولندا',
    created_at: '2026-10-20T10:05:00Z',
  },
  {
    id: 'ledg-02',
    account_id: 'waba-atyab-01',
    campaign_id: 'camp-01',
    category: 'MARKETING',
    country_code: 'SA',
    currency: 'EGP',
    base_cost_usd: 0.0465,
    final_cost: 2.33,
    is_free_tier: false,
    recipient_phone: '+966501234567',
    description: 'حملة وصول شحنات زهور هولندا',
    created_at: '2026-10-20T10:06:00Z',
  },
  {
    id: 'ledg-03',
    account_id: 'waba-atyab-01',
    message_id: 'msg-02',
    category: 'SERVICE',
    country_code: 'SA',
    currency: 'EGP',
    base_cost_usd: 0,
    final_cost: 0,
    is_free_tier: true,
    recipient_phone: '+966501234567',
    description: 'محادثة خدمة عملاء (ضمن الـ 1000 رسالة المجانية شهرياً)',
    created_at: '2026-10-30T07:30:00Z',
  },
];

class WhatsAppHubStore {
  account: WhatsAppAccount = initialWhatsAppAccount;
  phone: WhatsAppPhoneNumber = initialWhatsAppPhone;
  contacts: WhatsAppContact[] = [...initialContacts];
  consentEvents: WhatsAppConsentEvent[] = [];
  conversations: WhatsAppConversation[] = [...initialConversations];
  messages: WhatsAppMessage[] = [...initialMessages];
  templates: WhatsAppTemplate[] = [...initialTemplates];
  campaigns: WhatsAppCampaign[] = [...initialCampaigns];
  automations: WhatsAppAutomation[] = [...initialAutomations];
  costLedger: WhatsAppCostLedgerEntry[] = [...initialCostLedger];
  settings: WhatsAppSettings = { ...DEFAULT_BUDGET_SETTINGS };
  todaySendsCount: number = 25;

  getDashboardMetrics() {
    const currentMarketingSpend = calculateCurrentMonthMarketingSpend(this.costLedger);
    const budgetStatus = evaluateBudgetStatus(currentMarketingSpend, this.settings.monthly_marketing_budget_cap);
    const openConversations = this.conversations.filter((c) => c.status === 'OPEN').length;
    const totalContacts = this.contacts.length;
    const optedInContacts = this.contacts.filter((c) => c.opt_in_status === 'OPTED_IN').length;
    const freeServiceRemaining = Math.max(0, 1000 - this.phone.free_service_messages_used);

    return {
      budgetStatus,
      openConversations,
      totalContacts,
      optedInContacts,
      freeServiceMessagesUsed: this.phone.free_service_messages_used,
      freeServiceRemaining,
      phoneQualityRating: this.phone.quality_rating,
      phoneStatus: this.phone.status,
      displayPhoneNumber: this.phone.display_phone_number,
      settings: this.settings,
      todaySendsCount: this.todaySendsCount,
    };
  }

  /**
   * Handle incoming message from webhook
   */
  receiveInboundMessage(fromPhone: string, text: string): {
    contact: WhatsAppContact;
    conversation: WhatsAppConversation;
    message: WhatsAppMessage;
  } {
    const trimmed = text.trim();
    const isOptOut = this.settings.opt_out_keywords.some(
      (kw) => kw.toLowerCase() === trimmed.toLowerCase()
    );

    let foundContact = this.contacts.find((c) => c.phone_e164 === fromPhone);
    let contact: WhatsAppContact;

    if (!foundContact) {
      contact = {
        id: `contact-${Date.now()}`,
        account_id: this.account.id,
        phone_e164: fromPhone,
        name: fromPhone,
        language_code: 'ar',
        opt_in_status: isOptOut ? 'OPTED_OUT' : 'OPTED_IN',
        opt_in_source: 'INBOUND_KEYWORD',
        opt_in_at: new Date().toISOString(),
        opt_out_at: isOptOut ? new Date().toISOString() : undefined,
        tags: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.contacts.push(contact);
    } else {
      contact = foundContact;
      if (isOptOut) {
        contact.opt_in_status = 'OPTED_OUT';
        contact.opt_out_at = new Date().toISOString();
        contact.updated_at = new Date().toISOString();
      }
    }

    contact.last_incoming_at = new Date().toISOString();

    if (isOptOut) {
      this.consentEvents.push({
        id: `consent-${Date.now()}`,
        contact_id: contact.id,
        phone_e164: fromPhone,
        event_type: 'OPT_OUT',
        source: 'INBOUND_KEYWORD',
        reason: `Matched keyword: ${trimmed}`,
        created_at: new Date().toISOString(),
      });
    }

    let foundConversation = this.conversations.find((c) => c.contact_id === contact.id);
    let conversation: WhatsAppConversation;

    if (!foundConversation) {
      conversation = {
        id: `conv-${Date.now()}`,
        account_id: this.account.id,
        phone_number_id: this.phone.id,
        contact_id: contact.id,
        contact,
        category: 'SERVICE',
        status: 'OPEN',
        last_message_at: new Date().toISOString(),
        is_free_tier: this.phone.free_service_messages_used < 1000,
        unread_count: 1,
        last_message_preview: text,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.conversations.unshift(conversation);
    } else {
      conversation = foundConversation;
      conversation.status = 'OPEN';
      conversation.last_message_at = new Date().toISOString();
      conversation.unread_count += 1;
      conversation.last_message_preview = text;
    }

    const msg: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: conversation.id,
      meta_msg_id: `wamid.inbound_${Date.now()}`,
      direction: 'INBOUND',
      type: 'TEXT',
      content: { body: text },
      status: 'DELIVERED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.messages.push(msg);

    return { contact, conversation, message: msg };
  }

  /**
   * Send an Outbound Message
   */
  sendMessage(params: {
    conversationId: string;
    type: 'TEXT' | 'TEMPLATE';
    body?: string | undefined;
    templateId?: string | undefined;
    templateVariables?: Record<string, string> | undefined;
    senderName?: string | undefined;
  }): { success: boolean; message?: WhatsAppMessage | undefined; error?: string | undefined } {
    if (!this.settings.is_enabled) {
      return {
        success: false,
        error: 'خدمة الواتساب معطلة حالياً بالكامل من لوحة الإعدادات (WhatsApp Switch is OFF).',
      };
    }

    if (this.todaySendsCount >= this.settings.daily_send_limit) {
      return {
        success: false,
        error: `تم تجاوز الحد الأقصى اليومي للإرسال (${this.settings.daily_send_limit} رسالة/اليوم). يرجى زيادة الحد من الإعدادات للمتابعة.`,
      };
    }

    const conv = this.conversations.find((c) => c.id === params.conversationId);
    if (!conv) return { success: false, error: 'المحادثة غير موجودة' };

    const contact = this.contacts.find((c) => c.id === conv.contact_id);
    if (!contact) return { success: false, error: 'جهة الاتصال غير موجودة' };

    if (contact.opt_in_status === 'OPTED_OUT') {
      return {
        success: false,
        error: 'لا يمكن الإرسال: جهة الاتصال ألغت اشتراكها (Opted-Out) بموجب سياسات خصوصية Meta.',
      };
    }

    if (this.settings.strict_24h_window_enforced) {
      const windowStatus = isCustomerServiceWindowOpen(contact.last_incoming_at);
      if (params.type === 'TEXT' && !windowStatus.isOpen) {
        return {
          success: false,
          error: 'نافذة خدمة العملاء (24 ساعة) مغلقة. يجب إرسال قالب معتمد (Template) لبدء المحادثة.',
        };
      }
    }

    let category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE' = 'SERVICE';
    let bodyText = params.body || '';

    if (params.type === 'TEMPLATE' && params.templateId) {
      const template = this.templates.find((t) => t.id === params.templateId);
      if (!template) return { success: false, error: 'القالب غير معتمد أو غير موجود' };
      category = template.category;

      bodyText = template.body_text;
      if (params.templateVariables) {
        Object.entries(params.templateVariables).forEach(([key, val]) => {
          bodyText = bodyText.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
        });
      }
    }

    if (category === 'MARKETING') {
      const { costLocal } = calculateMessageCost(category, contact.phone_e164, this.settings.currency);
      const budgetCheck = canDispatchMarketing(costLocal, this.costLedger, this.settings);
      if (!budgetCheck.allowed) {
        return { success: false, error: budgetCheck.reason || 'تجاوز سقف الميزانية' };
      }
    }

    const isFree = category === 'SERVICE' && this.phone.free_service_messages_used < 1000;
    const { costUsd, costLocal } = calculateMessageCost(category, contact.phone_e164, this.settings.currency, isFree);

    if (isFree) {
      this.phone.free_service_messages_used += 1;
    }

    this.todaySendsCount += 1;

    const newMessage: WhatsAppMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: conv.id,
      meta_msg_id: `wamid.out_${Date.now()}`,
      direction: 'OUTBOUND',
      type: params.type,
      content: {
        body: bodyText,
        template_name: params.templateId,
        template_variables: params.templateVariables,
      },
      status: 'DELIVERED',
      sent_by: params.senderName || 'حافظ رحيم',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.messages.push(newMessage);

    conv.last_message_at = new Date().toISOString();
    conv.last_message_preview = bodyText;
    conv.category = category;
    contact.last_outgoing_at = new Date().toISOString();

    this.costLedger.unshift({
      id: `ledg-${Date.now()}`,
      account_id: this.account.id,
      conversation_id: conv.id,
      message_id: newMessage.id,
      category,
      country_code: contact.phone_e164.startsWith('+966') ? 'SA' : 'EG',
      currency: this.settings.currency,
      base_cost_usd: costUsd,
      final_cost: costLocal,
      is_free_tier: isFree,
      recipient_phone: contact.phone_e164,
      description: params.type === 'TEMPLATE' ? `قالب: ${params.templateId}` : 'رسالة حرة (خدمة عملاء)',
      created_at: new Date().toISOString(),
    });

    return { success: true, message: newMessage };
  }

  /**
   * Launch a WhatsApp Marketing Campaign
   */
  launchCampaign(campaignId: string, approvedBy: string): { success: boolean; error?: string | undefined; campaign?: WhatsAppCampaign | undefined } {
    if (!this.settings.is_enabled) {
      return { success: false, error: 'خدمة الواتساب معطلة حالياً بالكامل في الإعدادات.' };
    }

    if (!this.settings.campaigns_enabled) {
      return { success: false, error: 'تم تعطيل إرسال الحملات التسويقية في الإعدادات (Campaigns Switch is OFF).' };
    }

    const campaign = this.campaigns.find((c) => c.id === campaignId);
    if (!campaign) return { success: false, error: 'الحملة غير موجودة' };

    const template = this.templates.find((t) => t.id === campaign.template_id);
    if (!template) return { success: false, error: 'قالب الحملة غير معتمد' };

    const eligibleContacts = this.contacts.filter((c) => {
      if (c.opt_in_status !== 'OPTED_IN') return false;
      if (campaign.target_tags && campaign.target_tags.length > 0) {
        return campaign.target_tags.some((tag) => c.tags.includes(tag));
      }
      return true;
    });

    if (eligibleContacts.length === 0) {
      return { success: false, error: 'لا يوجد جهات اتصال مشتركة ومؤهلة لهذه الحملة.' };
    }

    const { totalLocal } = estimateCampaignCost(
      eligibleContacts.length,
      template.category,
      'EG',
      this.settings.currency
    );

    const budgetCheck = canDispatchMarketing(totalLocal, this.costLedger, this.settings);
    if (!budgetCheck.allowed) {
      campaign.status = 'STOPPED';
      campaign.rejection_reason = budgetCheck.reason;
      return { success: false, error: budgetCheck.reason || 'الميزانية غير كافية' };
    }

    campaign.status = 'COMPLETED';
    campaign.approved_by = approvedBy;
    campaign.approved_at = new Date().toISOString();
    campaign.actual_sent = eligibleContacts.length;
    campaign.actual_delivered = Math.floor(eligibleContacts.length * 0.98);
    campaign.actual_read = Math.floor(eligibleContacts.length * 0.85);
    campaign.actual_cost = totalLocal;
    this.todaySendsCount += eligibleContacts.length;

    eligibleContacts.forEach((contact) => {
      const { costUsd, costLocal } = calculateMessageCost(
        template.category,
        contact.phone_e164,
        this.settings.currency
      );

      this.costLedger.unshift({
        id: `ledg-camp-${Date.now()}-${contact.id}`,
        account_id: this.account.id,
        campaign_id: campaign.id,
        category: template.category,
        country_code: contact.phone_e164.startsWith('+966') ? 'SA' : 'EG',
        currency: this.settings.currency,
        base_cost_usd: costUsd,
        final_cost: costLocal,
        is_free_tier: false,
        recipient_phone: contact.phone_e164,
        description: `حملة: ${campaign.name}`,
        created_at: new Date().toISOString(),
      });
    });

    return { success: true, campaign };
  }

  /**
   * Trigger WhatsApp Automation
   */
  triggerAutomation(
    trigger: 'ORDER_PLACED' | 'QUOTE_READY' | 'FLOWER_BATCH_ARRIVAL',
    data: { recipientPhone: string; clientName: string; orderId?: string | undefined; totalAmount?: number | undefined; batchLot?: string | undefined }
  ): {
    success: boolean;
    executed: boolean;
    message?: WhatsAppMessage | undefined;
    error?: string | undefined;
    reason?: string | undefined;
  } {
    if (!this.settings.is_enabled || !this.settings.automations_enabled) {
      return {
        success: false,
        executed: false,
        error: 'الأتمتة التلقائية معطلة حالياً في الإعدادات (Automations Switch is OFF)',
        reason: 'الأتمتة التلقائية معطلة حالياً في الإعدادات (Automations Switch is OFF)',
      };
    }

    const automation = this.automations.find((a) => a.trigger_event === trigger && a.is_active);
    if (!automation) {
      return {
        success: false,
        executed: false,
        error: 'الأتمتة غير مفعلة',
        reason: 'الأتمتة غير مفعلة',
      };
    }

    let conv = this.conversations.find((c) => c.contact?.phone_e164 === data.recipientPhone);
    let contact = this.contacts.find((c) => c.phone_e164 === data.recipientPhone);

    if (!contact) {
      contact = {
        id: `contact-${Date.now()}`,
        account_id: this.account.id,
        phone_e164: data.recipientPhone,
        name: data.clientName,
        language_code: 'ar',
        opt_in_status: 'OPTED_IN',
        opt_in_source: trigger === 'QUOTE_READY' ? 'QUOTE_REQUEST' : 'WEB_CHECKOUT',
        tags: [trigger === 'QUOTE_READY' ? 'عرض_سعر' : 'عميل_متجر'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.contacts.push(contact);
    }

    if (!conv) {
      conv = {
        id: `conv-${Date.now()}`,
        account_id: this.account.id,
        phone_number_id: this.phone.id,
        contact_id: contact.id,
        contact,
        category: 'UTILITY',
        status: 'OPEN',
        last_message_at: new Date().toISOString(),
        is_free_tier: false,
        unread_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      this.conversations.unshift(conv);
    }

    const variables: Record<string, string> = {
      '1': data.clientName,
      '2': data.orderId || 'Q-2026',
      '3': data.batchLot || (data.totalAmount ? String(data.totalAmount) : '500'),
      '4': 'خلال 48 ساعة',
    };

    automation.today_sends += 1;

    const res = this.sendMessage({
      conversationId: conv.id,
      type: 'TEMPLATE',
      templateId: automation.template_id,
      templateVariables: variables,
      senderName: 'النظام الآلي (Meta Cloud API)',
    });

    return {
      success: res.success,
      executed: true,
      message: res.message,
      error: res.error,
    };
  }

  /**
   * Update budget cap and API configuration settings
   */
  updateSettings(patch: Partial<WhatsAppSettings>) {
    this.settings = { ...this.settings, ...patch, updated_at: new Date().toISOString() };
    if (patch.phone_number_id) {
      this.phone.phone_number_id = patch.phone_number_id;
    }
    return this.settings;
  }
}

// Export singleton instance
export const whatsAppHubStore = new WhatsAppHubStore();
