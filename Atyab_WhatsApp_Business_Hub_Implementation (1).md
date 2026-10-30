# Atyab Al Zohour — WhatsApp Business Hub
## Complete Implementation Specification for Gravity / AI Coding Agent

**Project:** Atyab Al Zohour B2B flower commerce platform  
**Developer / Product owner:** Mr. Hafez Rahim  
**Integration:** Meta WhatsApp Cloud API directly, not a third-party BSP  
**Document date:** 2026-10-30  
**Status:** Implementation-ready specification; inspect existing project before coding.

> **Instruction to Gravity:** Implement a production-quality WhatsApp module *inside the existing Atyab Al Zohour codebase*. First inspect the repository, database schema, auth/roles, order flow, existing integration patterns and deployed infrastructure. Adapt this specification to the actual stack; do not replace the current framework, create a second authentication system or break existing B2B features. Produce migrations, secure backend services, UX screens, tests and an environment configuration guide. Do not ask for or hardcode live credentials. Complete the whole feature set using modular delivery and feature flags. Mark Meta capabilities that are unavailable or account-ineligible as disabled, with explanation, rather than spoofing or scraping WhatsApp Web.

## 1. Business goals

Build a reusable WhatsApp Business Hub for Atyab Al Zohour supporting two-way customer conversation, team inbox, customer profiles, consent-controlled marketing, message templates, order and invoice notifications, catalogue/product flows, chatbot/optional AI assistance, Flows where eligible, campaign analytics, cost visibility and operational safeguards. Support Arabic RTL and English LTR. Architecture must support multiple phone-number IDs/WABAs and possible future reuse on other projects, while enforcing per-tenant data separation.

## 2. Non-negotiable compliance and technical constraints

1. Use official Meta Graph / WhatsApp Cloud API only. Do not use unofficial WhatsApp Web bots, QR-session libraries, browser automation, number rotation, sender spoofing, anti-detection tactics, or bought/scraped contact lists.
2. Always obtain and record valid opt-in for outbound business-initiated marketing. Allow easy opt-out, process STOP-like replies, and maintain suppression lists. Do not infer marketing opt-in from making a purchase.
3. Never guarantee deliverability, zero bans, or unlimited throughput. Enforce dynamic Meta account quality, messaging limits, rate limits, template pacing and policy status.
4. Pricing and free-message allowances can change. Never hardcode price schedules or service allowance rules in billing logic. Store versioned rates, effective dates, source URLs, free allowance parameters and country-specific pricing; track **estimated** cost separately from Meta-confirmed charges and statements. The starting October 2026 rates in Section 14 must be revalidated against Meta billing before go-live.
5. Store all Meta API access tokens only server-side, encrypted using a secrets manager; least privilege, rotated credentials and no token leakage to frontend, logs or error payloads.
6. Never send a message when a customer has opted out, a template lacks approval, policy bans a use case, an account is restricted or a spending cap would be breached.
7. Do not assume a specific Graph API version; use a supported pinned version configured by environment, with official API compatibility verification.
8. Treat webhook events as untrusted until signature verification succeeds. Accept events idempotently; Meta may retry and events may arrive out of order.
9. Recognize 24-hour customer service window and applicable conversation entry rules. For outside-window business initiation, use an approved template. **Free-text service-message billing and allowances must be validated against the Meta account's current pricing rules**.
10. Do not confuse accepted by API, sent, delivered, read and billed. These are different states.

## 3. Functional modules and required UI

**Main navigation** (Arabic / English): Dashboard; Inbox; Contacts; Templates; Campaigns; Automation; Chatbot; Product Catalogue; WhatsApp Orders; Flows; Media; Analytics; Billing; Team & Routing; Numbers & WABAs; Webhooks & Logs; Settings.

### 3.1 Dashboard
- Messages sent/delivered/read/failed, open conversations, unassigned tickets, response times, account and template quality, audience opt-ins, costs by category and day, campaign results.
- Drill down by date, phone number, agent, campaign, customer and message category.
- Timezone Africa/Cairo; store timestamps as UTC.

### 3.2 Shared Inbox / Live Chat
- Two-way text/media and supported interactive message formats using capabilities available to connected account.
- Real-time updates via the project's existing realtime/websocket/event infrastructure, with polling fallback.
- Conversation assignment, ownership, queues, internal notes, tags, priority, search and filters, starred/snoozed conversations, SLA timers, transfer, close/reopen, activity timeline and delivery/read statuses.
- Show 24-hour window countdown and prevent unsupported free-text outside window; offer eligible approved template instead.
- Safe agent attachments: upload allowlist, file size validation, antivirus scanning where possible, signed media retrieval links, expiration-aware cache.
- Prevent duplicate sends on double-click using client request IDs and server idempotency keys.

### 3.3 Contacts / CRM
- Merge with existing Atyab customer IDs; normalized E.164 phone numbers; maintain WhatsApp display/contact name separately.
- Opt-in evidence (source, wording, version, timestamp, IP when appropriate, scope); unsubscribe state; channel preferences; language; account owner; order history and relevant customer context.
- Import: validate, dedupe, consent check, dry-run and clear rejected rows. Never mass message imported contacts lacking opt-in.
- Export with role restrictions; deletion/retention process and audit logs.

### 3.4 Templates
- Create, submit, preview and synchronize templates with Meta (where management endpoints and permissions permit).
- Category marketing/utility/authentication (as defined by Meta); language variants, variables and examples, image/video/document headers, buttons when available.
- Store approval, rejection, paused, disabled and quality states. Version content and disable sending unapproved/paused templates.
- Approval outcomes are Meta-controlled; never promise immediate approval or automatic category assignment.

### 3.5 Campaigns
- Draft → validation → estimated cost → approval → scheduled → running → paused/completed/failed/cancelled.
- Audience segments from customer data, opt-in only, suppress opted-out/unreachable, deduplicate E.164 recipients within a campaign.
- Template selection, personalization preview, sample-send, timezone-aware schedule, budget cap, frequency caps, quality checks, daily sends, pause/resume/cancel and outcome analytics.
- Per-campaign send rate must respect current Meta limits and dynamically back off on throttling; never use evasion strategies to bypass limits.
- Automatically pause on concerning quality, elevated user blocks/reports (when surfaced), spending limit, repeated delivery failures or template/account restriction.

### 3.6 Automation and Commerce
- Trigger on order placed, confirmed, packed, dispatched, delivered, cancelled, invoice generated, payment confirmed/failed, quote created/approved and support case update.
- Use approved utility templates when appropriate; category depends on actual content and Meta classification. No promotions in service/utility notifications.
- Trigger payload maps to order ID, customer ID, amount, currency, line items, delivery ETA, invoice short-lived secure URL. Prevent double-notifying via `(trigger_type, business_event_id, recipient, template)` uniqueness.
- Retry transient failures only, with queue dedupe and maximum attempts; store notification history in order timeline.

### 3.7 Chatbot, AI and Human Handoff
- Rule-based menus and FAQ first; handle order lookup securely after user verification, product inquiry and agent handoff.
- Optional AI behind feature flag, separately priced, with clear escalation, access boundaries and prompt-injection defenses.
- Never make unsupported stock, delivery, discount or payment claims. Query current catalogue/order database; do not expose another customer's order details.
- Human agent can take over, stopping bot replies; audit every automation decision.

### 3.8 Catalogue, Commerce and Flows
- Integrate existing flower catalogue and inventory; synchronize Meta product catalogue if eligible and supported.
- Product share / interactive commerce only where account, product and country support it. Inventory and final prices must be verified server-side.
- Implement WhatsApp Flows management and submissions where eligible; verify encrypted/decrypted payload handling according to Meta's current specifications.
- Calling, groups and other special features are **not** guaranteed Cloud API baseline functions. Expose only after official capability discovery/eligibility validation and separate implementation review; never simulate via unofficial endpoints.

### 3.9 Team, Reporting, Billing and Settings
- Roles: Owner/Super Admin, WhatsApp Admin, Manager, Agent, Marketing Editor, Finance Viewer, Read-only Auditor.
- Permissions per phone number, inbox, contact, campaign, template, automation, export, billing, configuration and delete.
- Export CSV/XLSX for campaign, message and cost reporting with access logs; default aggregate or mask PII.
- Manage API connection health, token expiry/revocation, WABA and phone-number identity, webhook subscriptions, policy status, Meta identifiers and event audit log.

## 4. Suggested relational data model

Adapt names to existing conventions and use database migrations. All cross-tenant queries require tenant/org scoping and row-level authorization where available.

| Entity | Key fields |
|---|---|
| whatsapp_accounts | id, organization_id, waba_id, business_id, name, status, quality_snapshot, created_at |
| whatsapp_phone_numbers | id, account_id, phone_number_id, display_phone, verified_name, quality_rating, messaging_limit, enabled |
| whatsapp_credentials | id, account_id, secret_reference, scope_metadata, rotated_at, revoked_at; **no plaintext tokens** |
| whatsapp_contacts | id, organization_id, customer_id, e164, display_name, locale, marketing_opt_in, service_preferences, opted_out_at |
| whatsapp_consent_events | id, contact_id, category, action, source, consent_text_version, evidence, occurred_at |
| whatsapp_conversations | id, org_id, phone_number_id, contact_id, assignee_id, team_id, state, last_customer_message_at, service_window_expires_at, unread_count |
| whatsapp_messages | id, org_id, conversation_id, meta_message_id UNIQUE nullable, client_request_id UNIQUE nullable, direction, type, template_id, campaign_id, payload_metadata, status, error_code, created_at |
| whatsapp_message_events | id, message_id, provider_event_id/dedup_hash UNIQUE, status, event_timestamp, raw_payload_reference |
| whatsapp_templates | id, account_id, meta_name, language, category, content_json, meta_status, version, quality, last_synced_at |
| whatsapp_campaigns | id, org_id, phone_number_id, template_id, audience_snapshot_id, status, schedule_at, spend_cap_egp, approved_by |
| whatsapp_campaign_recipients | id, campaign_id, contact_id, dedupe_key UNIQUE, state, message_id, attempts, error_code |
| whatsapp_automations | id, org_id, trigger_name, rule_json, template_id, enabled, version |
| whatsapp_automation_runs | id, automation_id, business_event_key UNIQUE, status, message_id, error |
| whatsapp_media | id, org_id, media_type, meta_media_id, storage_key, checksum, expires_at, scan_status |
| whatsapp_webhook_events | id, account_id, digest UNIQUE, event_type, body_encrypted_or_ref, received_at, processing_state |
| whatsapp_pricing | id, country_code, category, price_usd, effective_from, effective_to, source_url, rule_json |
| whatsapp_cost_ledger | id, message_id, country_code, category, pricing_version_id, estimated_usd, confirmed_usd nullable, fx_rate, estimated_egp, billing_status |
| whatsapp_audit_logs | id, org_id, actor_id, action, entity_type, entity_id, changed_fields_redacted, occurred_at |
| whatsapp_settings | org_id, max_daily_budget_egp, max_campaign_budget_egp, quiet_hours, retention_days, timezone, features_json |

Suggested indexes: `(org_id, created_at)` messages, `(org_id, e164)` contacts unique, `(conversation_id, created_at)` messages, `(phone_number_id, status, created_at)` outbound jobs. Use foreign keys, immutable event history and partition/retention strategy for high-volume tables.

## 5. Backend architecture

Frontend -> authenticated application API -> domain service -> durable queue/worker -> Meta Graph API.
Meta Webhooks -> public HTTPS endpoint -> signature verification -> durable event receipt -> fast HTTP 200 -> async processor -> database -> real-time UI + business events.

- Build integration as a bounded module using existing app infrastructure and framework.
- Queue transport: existing production queue if available; otherwise choose durable DB job queue or Redis-backed queue appropriately; no fire-and-forget in HTTP request thread.
- Outbound worker shall validate consent, service window, template approval, phone/account health, caps, recipient E.164, retry budget and content before calling Meta.
- Use **adaptive rate limiting** by WABA/phone/sender and any additional relevant scopes, backpressure and per-recipient pacing. Configure safe initial concurrency then tune only using documented limits and actual API feedback.
- Retry transient HTTP 429/5xx/network timeouts with bounded exponential backoff + jitter and `Retry-After` where present. Never blindly retry auth, revoked permission, policy, invalid number or malformed template errors.
- Implement circuit breakers per account, bounded retries, dead-letter jobs, dashboards and manual safe reprocessing.
- Idempotency: client_request_id, automation event keys, campaign-recipient identity and inbound event digest. Handle Meta acceptance followed by delayed delivery updates without duplicate outbound send.
- Monitoring: queue age, p95 dispatch latency, webhook lag, send success, failures by code, delivery/read rate, template paused, account disconnected, spend and suppression rate.
- Alerts when quality degrades, service fails, token revokes, messages are retried excessively, webhooks lag or budgets run low.

## 6. Integration security and environment configuration

Environment values (placeholders; never commit secrets):

```dotenv
META_GRAPH_API_VERSION=vXX.X
META_APP_ID=...
META_APP_SECRET=...                # server-side secret only
META_WEBHOOK_VERIFY_TOKEN=...     # server-side secret only
META_SYSTEM_USER_TOKEN_SECRET_REF=...
WHATSAPP_DEFAULT_WABA_ID=...
WHATSAPP_DEFAULT_PHONE_NUMBER_ID=...
WHATSAPP_WEBHOOK_PUBLIC_URL=https://your-domain.example/api/integrations/whatsapp/webhook
WHATSAPP_SEND_ENABLED=false
WHATSAPP_CAMPAIGNS_ENABLED=false
WHATSAPP_AI_ENABLED=false
WHATSAPP_MAX_ESTIMATED_DAILY_EGP=500
WHATSAPP_MAX_ESTIMATED_CAMPAIGN_EGP=1000
WHATSAPP_MAX_ESTIMATED_MARKETING_MONTHLY_EGP=2000
WHATSAPP_MARKETING_WARN_THRESHOLDS=0.50,0.80
WHATSAPP_MARKETING_FAIL_CLOSED_ON_UNKNOWN_PRICE=true
WHATSAPP_FX_USD_EGP=56.00         # initial display estimate, refresh automatically
```

- Meta handshake GET: return `hub.challenge` only for matching configured verify token.
- Meta POST webhook: verify `X-Hub-Signature-256` HMAC SHA256 of raw request body using app secret with constant-time comparison; reject missing/invalid signature. Test signature before JSON interpretation.
- Use HTTPS, restricted admin endpoints, secrets vault, token rotation, security logs, PII masking, encryption at rest and relevant Egyptian privacy requirements.
- Offer signed and expiring media URLs; do not publicly expose confidential invoices or customer conversations.
- Security review: CSRF/CORS, RBAC, payload schema validation, XSS sanitization, attachment scanning, SSRF prevention, audit retention and backup restore tests.

## 7. Internal API contract (illustrative; adapt actual framework)

`GET /api/whatsapp/overview` dashboard metrics; `GET /api/whatsapp/conversations` paginated inbox; `GET /api/whatsapp/conversations/:id/messages` paginated timeline; `POST /api/whatsapp/conversations/:id/messages` send permitted reply/template; `PATCH /api/whatsapp/conversations/:id/assignment`; `POST /api/whatsapp/conversations/:id/notes`; `GET/POST /api/whatsapp/contacts`; `POST /api/whatsapp/contacts/:id/consent`; `GET/POST /api/whatsapp/templates`; `POST /api/whatsapp/templates/:id/submit`; `POST /api/whatsapp/templates/sync`; `GET/POST /api/whatsapp/campaigns`; `POST /api/whatsapp/campaigns/:id/estimate`; `POST /api/whatsapp/campaigns/:id/approve`; `POST /api/whatsapp/campaigns/:id/start`; `POST /api/whatsapp/campaigns/:id/pause`; `GET/POST /api/whatsapp/automations`; `GET /api/whatsapp/billing`; `GET /api/whatsapp/system-health`; `GET/POST /api/integrations/whatsapp/webhook` (public Meta-only verified); internal order-event trigger handler.

All endpoints require application auth + granular RBAC except validated webhook endpoint. Document pagination, sorting, request schemas and error semantics in OpenAPI.

## 8. Event workflows

**Inbound:** customer message -> verify webhook signature -> write deduplicated event -> resolve number/contact -> upsert conversation -> update 24h window -> persist message -> notify assigned agent -> optional automation rules -> handoff if required.

**Outbound agent reply:** permission check -> validate service window/type -> apply opt-out/policy -> create pending message with idempotency key -> enqueue -> send Meta -> store Meta message ID and accepted status -> webhook status updates -> billing ledger and UI.

**Campaign:** validated approved template -> opted-in audience snapshot -> deduplication -> price preview & spend cap -> manager approval -> enqueue in safe chunks -> worker re-checks consent/caps/quality at dispatch time -> send with adaptive pacing -> aggregate final statuses -> reconcile costs.

**Order event:** order event -> deterministic dedupe key -> resolve contact -> check legal eligibility -> approved utility template -> enqueue -> invoice/order timeline updated -> failure reported to staff without breaking order checkout.

**Opt-out:** customer sends unsubscribe or uses preference center -> immediate suppression across campaigns -> confirmation only where allowed -> log evidence; resume marketing only on a new explicit opt-in.

## 9. Failure modes and recovery

| Failure | Expected response |
|---|---|
| API 429 / throttling | honor Retry-After, lower concurrency, bounded exponential backoff |
| Meta app token revoked | stop outbound for affected number, alert owner, show reconnect state |
| Template paused/rejected | do not send; alert admin; offer alternative approved template |
| Account quality declines | reduce/stop campaigns according to policy safeguards, notify manager |
| Duplicate webhook | acknowledge, ignore duplicate side effect, preserve audit trace |
| Out-of-order delivered/read statuses | status precedence/event-time tracking; never revert from read to sent |
| Meta accepts message but HTTP times out | reconcile before resend; avoid duplicate dispatch |
| Customer opts out during campaign | re-check immediately before each send; skip and log |
| Queue outage | durable jobs survive restart; DLQ for exhausted jobs |
| Database outage | fail closed for outbound compliance checks; alert and recover |
| Foreign number | charge country-specific rate, not Egypt list price |
| Price feed stale | mark estimates stale; require finance review before high-budget campaign |

## 10. UI/UX requirements

- Responsive professional dashboard and mobile-friendly inbox; consistent Atyab brand tokens from the existing codebase.
- Arabic RTL with proper bidirectional phone number, dates, currency and English-template handling; English LTR.
- Accessible tables, status pills, search, keyboard shortcuts, loading skeletons, meaningful empty/error states.
- Clear status distinctions: Queued, Accepted, Sent, Delivered, Read, Failed, Suppressed, Expired.
- Campaign creation wizard: audience -> template -> preview -> compliance -> estimate EGP/USD -> approval -> schedule -> monitoring.
- Show costs as **estimate** until provider reconciliation; support EGP display and USD raw charge.

## 11. Acceptance tests (must pass)

1. A opted-in customer receives an order utility notification exactly once after repeated order-event delivery.
2. No marketing send to an opted-out or non-consenting contact, including when consent changes mid-campaign.
3. An outside-24h free-form agent reply is blocked and an approved template option is shown.
4. Invalid webhook signature returns rejection; valid duplicate webhook does not duplicate the message.
5. Burst of 1,000 campaign recipients enqueues reliably and respects throttling without HTTP request timeout or duplicate messages.
6. HTTP 429 backs off correctly; template rejection never auto-retries; repeated transient failures enter DLQ.
7. Message delivery/read status reconciles after delayed/out-of-order webhook events.
8. Multi-number RBAC prevents Agent A from reading or sending on unauthorized number/team.
9. Sending with an expired token fails safely with an actionable admin alert and no secret leakage.
10. Promotional wording cannot be disguised as a utility template; Meta classification/status remains authoritative.
11. Importing CSV with repeated/invalid/no-consent numbers produces a dry-run report and no unsolicited sends.
12. Budget cap blocks sends before cap would be exceeded based on conservative estimated pricing.
13. Arabic inbox, contact and campaigns are usable in RTL on desktop/mobile.
14. B2B sales orders, carts, inventory and payment checkout work unchanged if WhatsApp API is down.
15. Audit trail stores campaign approval, actor and template version; exports exclude unnecessary PII.

## 12. Build instructions for Gravity

1. Audit repository and document current architecture, auth and order hooks; identify missing dependencies and Meta capability gating.
2. Implement database migrations, RBAC and settings behind feature flags.
3. Implement secure Meta connector, test webhook signature/verification and connection health.
4. Implement inbound pipeline, shared inbox, contacts, assignment and message status.
5. Implement templates, preview/approval/status sync and safe outbound queue.
6. Implement opt-in/out, marketing campaigns with approval, budgets and segmentation.
7. Implement commerce triggers, invoice secure links and order timeline.
8. Implement automations, chatbot and optional AI feature flag.
9. Implement catalog, flows and any eligible advanced features using current Meta docs.
10. Implement analytics, estimated cost ledger, rate configuration and Meta reconciliation support.
11. Add operational monitoring, documentation, CI checks, unit/integration/e2e tests, staging mock Meta webhook and release checklist.
12. Produce an implementation report with completed features, repository locations, DB migrations, required Meta console steps, env vars, known limitations, and evidence of tests. No unsupported claims that every feature works without actual Meta credentials and permissions.

## 13. Operations and no-ban risk reduction

- Official platform only; build marketing only around unambiguous opt-ins and approved templates.
- Observe Meta account quality and message limits, adapt throughput, no bulk blasting or number rotation.
- Monitor spam/blocks where metrics are available; low engagement or bad feedback should pause campaigns.
- Customer preference center and easy opt-out; apply frequency and quiet-hour constraints.
- Use bounded retries, queue durability, circuit breaker, monitoring, budget hard stops and manually reviewable failures.
- Apply separate campaign caps by organization/phone, and never place marketing promotions in transaction confirmations.
- Conduct staged pilot using opted-in internal/test contacts, then gradually expand under verified capacity. No sending to 1,000 people automatically on deployment.

## 14. Egypt message cost explanation as of 2026-10-30

**Illustrative rate-card estimates**, based on published October 2026 Egypt recipient prices: marketing `$0.0644`, utility `$0.0036`, authentication `$0.0036` per billable delivered message. Illustration uses **1 USD = 56 EGP** (market reference around 2026-10-30); bank FX and taxes vary. Rates must be verified against Meta's current rate card and WABA billing.

| Message type | USD each | EGP each @ 56 | 1,000 delivered messages USD | 1,000 delivered messages EGP |
|---|---:|---:|---:|---:|
| Marketing | 0.0644 | 3.6064 | 64.40 | **3,606.40** |
| Utility | 0.0036 | 0.2016 | 3.60 | **201.60** |
| Authentication | 0.0036 | 0.2016 | 3.60 | **201.60** |

**Meaning of '1,000 numbers':** one billable message sent to each of 1,000 distinct Egyptian WhatsApp numbers = 1,000 messages. Two messages to each of those numbers can generate 2,000 billable messages. Delivery, template category, allowances and pricing rules determine actual charges. Service/free-form replies must follow the current Meta pricing policy configured in the billing engine; third-party sites describe first 1,000 monthly service replies free then `$0.0036`, but do not promise that without account-level official confirmation.

**Illustrative marketing volumes:** 100 messages = EGP 360.64; 500 = EGP 1,803.20; 1,000 = EGP 3,606.40; 5,000 = EGP 18,032.00; 10,000 = EGP 36,064.00 (excluding tax, discounts and failed/unbillable messages).

**Example Atyab monthly mixed billing:** 1,000 marketing + 1,000 utility = $68.00 = **EGP 3,808.00**, excluding tax, platform hosting, AI usage and applicable non-message costs.

Implement a pricing estimator that outputs:

```
estimated_usd = sum(billable_message_count_by_category_and_country * effective_rate_usd)
estimated_egp = estimated_usd * fx_usd_egp
```

Apply the **actual rate version**, tier rules and verified free-message allowances before calculation; show a warning for unknown billability and do not infer charges merely from submitted sends. Store actual Meta reconciliation separately.

### References to verify prior to production
- Official Meta docs: https://developers.facebook.com/docs/whatsapp/cloud-api/
- Official Meta pricing: https://developers.facebook.com/docs/whatsapp/pricing/
- Official Meta business policy: https://business.whatsapp.com/policy
- October 2026 Egypt market rate reference: https://www.calypso.so/whatsapp-api-pricing/egypt
- October 2026 Egypt reference: https://karobar.io/tools/whatsapp-api-pricing-calculator/egypt
- Currency reference 2026-10-30: https://www.poundsterlinglive.com/history/USD-EGP-2026

**Definition of done:** Fully integrated secure module, full user-facing management experience, stable queued sending, compliant campaigns, working webhook receiving, detailed test coverage, operational monitoring, clearly labeled estimates and documented gating of Meta-ineligible features. Never claim a guarantee against blocks or policy enforcement.


## 16. Gravity mandatory addendum — owner-approved budget control and stability (2026-10-30)

**Owner decision:** Build the **complete** WhatsApp Business Hub in the current Atyab Al Zohour application. Use Meta Cloud API direct. **Default monthly marketing budget = EGP 2,000**; default marketing warnings at 50% and 80%. Marketing campaigns remain OFF until an administrator intentionally enables them and an authorized manager approves each campaign. These are initial configuration defaults, not Meta subscription tiers or promises about the final invoice.

### 16.1 Separate spend envelopes

- `marketing`: hard internal cap of EGP 2,000 per business timezone calendar month, including already confirmed charges, conservatively estimated sends already accepted but not reconciled, and reservations for pending/queued recipients. Never let multiple workers overrun a cap by racing.
- `transactional`: independent budget for Utility, Authentication and order/invoice notices. Show warnings and allow owner-configured caps. Do **not** silently stop critical order notices due to marketing spending, but respect any owner-configured global cap and explicitly show failures.
- `service`: customer replies tracked independently, with the monthly 1,000 free **delivered service messages per business phone number** effective 2026-10-01. Subsequent service messages are potentially billable at the applicable destination-country rate. Count service allowances per sending business number and billing cycle, **not** per customer, not per conversation, and not per company. Read Meta billing/webhook data to reconcile; no implicit zero-price assumption.
- `global`: optional strict overall organization cap, disabled until the owner sets it deliberately. No system can guarantee the Meta statement exactly equals an internal forecast. Show estimates vs confirmed charges, pending reconciliation, FX variance, taxes and any external costs separately.

### 16.2 Atomic dispatch-level cap algorithm

1. Validate normalized recipient number and destination-country tariff, policy eligibility, customer marketing opt-in, template approval/category, current 24-hour conversation window, account quality and send limits.
2. Before adding recipients to a marketing campaign, compute preview = eligible distinct recipients × conservative expected cost, including FX safety margin; flag unknown rates and prevent campaign activation until reviewed.
3. On worker dispatch, lock a per-organization/per-phone/budget-cycle spend record (database transaction or distributed lock). Sum **confirmed + accepted/unreconciled estimates + reserved queued messages**. If `sum + reserved_next_cost > cap`, release job without sending and atomically pause campaign as `BUDGET_LIMIT_REACHED`.
4. Reserve cost atomically before sending. On Meta acceptance, shift reservation to unreconciled estimated ledger. On definitive failed/nonbillable outcome, release reservation; reconcile confirmed billed amount and exchange-rate difference from provider records without double counting.
5. Retry transient failures with bounded exponential backoff + jitter and rate-limit signals; never retry permanent policy/template/invalid-number errors. Use idempotency at campaign-recipient, automation-event and message level. In an uncertain timeout after API dispatch, **do not blindly resend**—investigate status and reconcile first.
6. When reaching 50% and 80% marketing cap, create persistent in-app alert and notify authorized owners once per crossing. At 100%, pause all marketing sends. Re-enabling requires a new explicit manager approval and sufficient remaining budget or an audited cap change.
7. Forecast foreign-recipient numbers (e.g. +966) using **Saudi rates**, not Egyptian rates, regardless of flower delivery destination. Display customer country, rate version and USD→EGP conversion used.

### 16.3 Required admin pages and controls

- **Spending Control:** cards for marketing cap EGP 2,000, confirmed charges, pending accepted charges, reserved sends, remaining headroom, warnings, calendar-month reset, and last successful Meta reconciliation timestamp.
- **Campaign Approval:** audience count, per-country rates, recipient opt-in, template classification, estimated worst-case EGP total, manager approval, and confirm-send action. A preview is never an automatic launch.
- **Number Health:** per-number quality/limits, webhook delay, failed sends, template restrictions and explicit STOP/opt-out rate; automatic campaign pause when restricted. Do not claim zero-ban protection.
- **Order Notifications:** separate transaction budget and service-window rule; show confirmed delivered and estimated cost for each order-linked message.
- **Customer Chat:** show a discreet `service free allowance remaining` count, only when validated for that phone and billing period; customer inbound messages are not charged. Do not show a fictitious free limit in unrelated contexts.
- **Audit and Operations:** record all budget edits, campaign approvals, job cancellation, worker failures, webhook signature failures, reconciliation differences and manual restarts.

### 16.4 Default configurations

```env
WHATSAPP_MARKETING_ENABLED=false
WHATSAPP_MONTHLY_MARKETING_CAP_EGP=2000
WHATSAPP_CAMPAIGN_APPROVAL_REQUIRED=true
WHATSAPP_BUDGET_ALERT_LEVELS=50,80,100
WHATSAPP_FAIL_CLOSED_IF_RATE_UNVERIFIED=true
WHATSAPP_REQUIRE_OPT_IN=true
WHATSAPP_DEFAULT_CURRENCY=EGP
WHATSAPP_ESTIMATED_USD_TO_EGP=56.00  # illustrative fallback only; show timestamp; never treat as live FX
```

### 16.5 Acceptance tests Gravity must pass

1. Queuing 1,000 marketing sends to Egypt with rate `$0.0644` and illustrative FX `56` forecasts EGP `3,606.40`: **block the campaign under the default EGP 2,000 marketing cap**, with a clear explanation and no send.
2. Two parallel workers each attempt the final budget slot: **only one** acquires a reservation; no excess marketing sends occur.
3. A campaign pauses if account/template quality becomes restricted or a contact opts out between scheduling and actual dispatch.
4. A Meta request timeout after potential acceptance never generates a duplicate billable send during automatic retry.
5. Existing customer orders, checkout, B2B pricing, invoices, customer accounts and existing authentication remain unaffected by WhatsApp module installation.
6. 1,000 free service sends/month are counted only for eligible **delivered** service messages per business number, and excess estimated using the market rate; month reset and delayed webhooks work without double counting.
7. Distinguish **Meta billed**, **internal cost estimates**, **external hosting**, **AI token fees**, **tax**, and **FX**; never claim the internal budget can retroactively cap charges already accepted by Meta.
8. Marketing remains off on first deployment; launch requires a live verified business number, webhook validation, current Meta rate verification, opt-ins, template approval, a test send, and manager approval.

**Gravity completion requirement:** Deliver source code, migrations, unit/integration/load tests, deployment settings, rollback steps, and an operator walkthrough in the existing repository. Do not implement only a mock UI; do not trigger live messages during tests or migration. Provide a checklist of any human-dependent Meta setup before enabling production traffic.
