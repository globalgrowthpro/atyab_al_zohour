/**
 * Atyab Al Zohour - WhatsApp Business Hub
 * Official Meta WhatsApp Cloud API Domain Models & TypeScript Schema
 * Compatible with exactOptionalPropertyTypes: true
 */

export type WhatsAppConversationCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION' | 'SERVICE';
export type WhatsAppConversationStatus = 'OPEN' | 'PENDING' | 'RESOLVED' | 'CLOSED';
export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';
export type WhatsAppMessageType = 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'TEMPLATE' | 'INTERACTIVE';
export type WhatsAppMessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
export type WhatsAppCampaignStatus =
  | 'DRAFT'
  | 'PENDING_APPROVAL'
  | 'APPROVED'
  | 'SCHEDULED'
  | 'SENDING'
  | 'COMPLETED'
  | 'STOPPED'
  | 'REJECTED';
export type WhatsAppOptInStatus = 'OPTED_IN' | 'OPTED_OUT' | 'PENDING';
export type WhatsAppQualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export interface WhatsAppAccount {
  id: string;
  meta_waba_id: string;
  name: string;
  timezone: string;
  default_currency: 'EGP' | 'SAR' | 'USD';
  status: 'ACTIVE' | 'SUSPENDED' | 'PENDING_VERIFICATION';
  created_at: string;
  updated_at: string;
}

export interface WhatsAppPhoneNumber {
  id: string;
  account_id: string;
  phone_number_id: string;
  display_phone_number: string;
  verified_name: string;
  quality_rating: WhatsAppQualityRating;
  messaging_limit_tier: 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';
  status: 'CONNECTED' | 'DISCONNECTED' | 'FLAGGED';
  cert_expiry?: string | undefined;
  webhook_active: boolean;
  free_service_messages_used: number; // 1,000 free per month
  created_at: string;
  updated_at: string;
}

export interface WhatsAppContact {
  id: string;
  account_id: string;
  phone_e164: string;
  name: string;
  company_name?: string | undefined;
  client_tier?: 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP' | undefined;
  language_code: string;
  opt_in_status: WhatsAppOptInStatus;
  opt_in_source?: string | undefined;
  opt_in_at?: string | undefined;
  opt_out_at?: string | undefined;
  last_incoming_at?: string | undefined;
  last_outgoing_at?: string | undefined;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface WhatsAppConsentEvent {
  id: string;
  contact_id: string;
  phone_e164: string;
  event_type: 'OPT_IN' | 'OPT_OUT' | 'REVOKED';
  source: 'WEB_CHECKOUT' | 'QUOTE_REQUEST' | 'INBOUND_KEYWORD' | 'ADMIN_OVERRIDE';
  reason?: string | undefined;
  raw_payload?: Record<string, unknown> | undefined;
  actor_id?: string | undefined;
  created_at: string;
}

export interface WhatsAppConversation {
  id: string;
  account_id: string;
  phone_number_id: string;
  contact_id: string;
  contact?: WhatsAppContact | undefined;
  category: WhatsAppConversationCategory;
  status: WhatsAppConversationStatus;
  assigned_to?: string | undefined;
  window_expires_at?: string | undefined; // 24h Customer Service Window limit
  last_message_at: string;
  is_free_tier: boolean;
  unread_count: number;
  last_message_preview?: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessage {
  id: string;
  conversation_id: string;
  meta_msg_id?: string | undefined;
  direction: WhatsAppMessageDirection;
  type: WhatsAppMessageType;
  content: {
    body?: string | undefined;
    media_url?: string | undefined;
    caption?: string | undefined;
    filename?: string | undefined;
    template_name?: string | undefined;
    template_variables?: Record<string, string> | undefined;
  };
  status: WhatsAppMessageStatus;
  failure_reason?: string | undefined;
  sent_by?: string | undefined;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppMessageEvent {
  id: string;
  message_id: string;
  meta_msg_id: string;
  event_type: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  timestamp: string;
  error_code?: string | undefined;
  error_message?: string | undefined;
  created_at: string;
}

export interface WhatsAppTemplate {
  id: string;
  account_id: string;
  meta_template_id: string;
  name: string;
  category: WhatsAppConversationCategory;
  language: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED' | 'PAUSED';
  header_format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'NONE' | undefined;
  body_text: string;
  footer_text?: string | undefined;
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER';
    text: string;
    url?: string | undefined;
    phone_number?: string | undefined;
  }> | undefined;
  synced_at: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppCampaign {
  id: string;
  account_id: string;
  name: string;
  template_id: string;
  template?: WhatsAppTemplate | undefined;
  status: WhatsAppCampaignStatus;
  estimated_recipients: number;
  estimated_cost: number;
  actual_sent: number;
  actual_delivered: number;
  actual_read: number;
  actual_cost: number;
  currency: 'EGP' | 'SAR';
  scheduled_for?: string | undefined;
  created_by: string;
  approved_by?: string | undefined;
  approved_at?: string | undefined;
  rejection_reason?: string | undefined;
  target_tags?: string[] | undefined;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppAutomation {
  id: string;
  account_id: string;
  name: string;
  trigger_event: 'ORDER_PLACED' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'QUOTE_READY' | 'FLOWER_BATCH_ARRIVAL' | 'ABANDONED_CART';
  template_id: string;
  is_active: boolean;
  max_daily_sends: number;
  today_sends: number;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface WhatsAppCostLedgerEntry {
  id: string;
  account_id: string;
  conversation_id?: string | undefined;
  message_id?: string | undefined;
  campaign_id?: string | undefined;
  category: WhatsAppConversationCategory;
  country_code: string; // 'EG' | 'SA'
  currency: 'EGP' | 'SAR';
  base_cost_usd: number;
  final_cost: number;
  is_free_tier: boolean;
  recipient_phone: string;
  description: string;
  created_at: string;
}

export interface WhatsAppSettings {
  id: string;
  account_id: string;

  // Master on/off switches
  is_enabled: boolean;
  campaigns_enabled: boolean;
  automations_enabled: boolean;
  sandbox_mode: boolean;
  strict_24h_window_enforced: boolean;

  // API credentials inputs
  meta_app_id: string;
  meta_app_secret: string;
  meta_waba_id: string;
  phone_number_id: string;
  system_user_token: string;
  webhook_verify_token: string;
  webhook_callback_url: string;

  // Limits
  monthly_marketing_budget_cap: number;
  daily_send_limit: number;
  rate_limit_per_minute: number;
  currency: 'EGP' | 'SAR';

  // Alerts & Thresholds
  alert_threshold_50_sent: boolean;
  alert_threshold_80_sent: boolean;
  alert_threshold_100_sent: boolean;
  default_country_code: string;
  opt_out_keywords: string[];
  compliance_notification_phone: string;
  auto_resolve_inactive_hours: number;
  updated_at: string;
}
