import { useState } from "react";
import { MessageCircle, MessageSquare, X, ArrowUpRight } from "lucide-react";
import {
  useStoreSettings,
  formatWhatsAppUrl,
  formatMessengerUrl,
} from "@/features/settings/store";

export function FloatingChat() {
  const { social } = useStoreSettings();
  const [isOpen, setIsOpen] = useState(false);

  if (!social.enable_floating_chat) {
    return null;
  }

  const whatsappUrl =
    social.whatsapp_url ||
    formatWhatsAppUrl(social.whatsapp, social.whatsapp_prefill);

  const messengerUrl = formatMessengerUrl(social.facebook_messenger);

  return (
    <aside aria-label="قنوات المحادثة الفورية" className="fixed bottom-20 md:bottom-6 left-6 z-40">
      {/* Expanded Popup Menu */}
      {isOpen && (
        <div
          role="region"
          aria-label="خيارات المحادثة الفورية"
          className="mb-3 w-72 rounded-3xl border border-white/80 bg-white/95 dark:bg-card/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <div>
              <span className="text-[10px] font-bold text-primary eyebrow !m-0 !gap-1">
                خدمة العملاء B2B
              </span>
              <p className="text-sm font-bold text-forest">تحدث معنا مباشرة</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-muted-foreground hover:bg-muted"
              aria-label="إغلاق قائمة المحادثة"
            >
              <X className="size-4" />
            </button>
          </div>

          <p className="text-xs leading-5 text-muted-foreground mb-3">
            فريق المبيعات والعمليات متاح لمساعدتكم في طلبات الجملة وعروض الأسعار:
          </p>

          <div className="space-y-2">
            {/* WhatsApp Button */}
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white p-3 text-xs font-bold transition-all shadow-sm hover:shadow group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid size-7 place-items-center rounded-xl bg-white/20">
                    <MessageCircle className="size-4" />
                  </div>
                  <span>واتساب (WhatsApp)</span>
                </div>
                <ArrowUpRight className="size-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}

            {/* Facebook Messenger Button */}
            {messengerUrl && (
              <a
                href={messengerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-2xl bg-blue-600 hover:bg-blue-700 text-white p-3 text-xs font-bold transition-all shadow-sm hover:shadow group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="grid size-7 place-items-center rounded-xl bg-white/20">
                    <MessageSquare className="size-4" />
                  </div>
                  <span>فيسبوك ماسنجر (Messenger)</span>
                </div>
                <ArrowUpRight className="size-4 opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 rounded-full bg-forest text-white px-4 py-3 shadow-2xl hover:bg-forest/90 border border-gold/40 transition-all hover:scale-105 active:scale-95"
        aria-label="تواصل معنا عبر واتساب وماسنجر"
      >
        <span className="relative flex size-3">
          <span className="animate-ping absolute inline-flex size-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full size-3 bg-emerald-500" />
        </span>
        <MessageCircle className="size-5 text-gold" />
        <span className="text-xs font-bold hidden sm:inline">تواصل فوري</span>
      </button>
    </aside>
  );
}

