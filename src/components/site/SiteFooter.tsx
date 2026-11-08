import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone, MessageCircle, MessageSquare, ExternalLink } from "lucide-react";
import logo from "@/assets/logo.png";
import { useStoreSettings, formatWhatsAppUrl, formatMessengerUrl } from "@/features/settings/store";

export function SiteFooter() {
  const { social, general } = useStoreSettings();

  const whatsappUrl =
    social.whatsapp_url ||
    formatWhatsAppUrl(social.whatsapp, social.whatsapp_prefill);

  const messengerUrl = formatMessengerUrl(social.facebook_messenger);

  return (
    <footer className="hidden md:block bg-forest text-forest-foreground">
      <div className="gold-rule" />
      <div className="container-x grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand & Description */}
        <div className="lg:col-span-2 space-y-4">
          <div className="inline-block rounded-2xl bg-cream p-3">
            <img src={logo} alt="أطيب الزهور" className="h-20 w-auto" loading="lazy" />
          </div>
          <p className="max-w-sm leading-8 opacity-85">
            أطيب الزهور — توريد الورود الطبيعية بالجملة للمحلات والفنادق والشركات ومنظمي المناسبات في المملكة العربية السعودية مع سلسلة تبريد قياسية.
          </p>

          {/* Social Media & Chat Channels */}
          <div className="pt-2">
            <span className="block text-xs font-bold text-gold mb-2.5">
              قنوات التواصل والمحادثة المباشرة:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                  aria-label="تواصل عبر واتساب"
                >
                  <MessageCircle className="size-3.5" />
                  <span>واتساب</span>
                </a>
              )}

              {messengerUrl && (
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white px-3 py-1.5 text-xs font-bold transition-all shadow-xs"
                  aria-label="تواصل عبر فيسبوك ماسنجر"
                >
                  <MessageSquare className="size-3.5" />
                  <span>ماسنجر</span>
                </a>
              )}

              {social.facebook_url && (
                <a
                  href={social.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-medium transition-all"
                  aria-label="صفحة فيسبوك"
                >
                  <span>فيسبوك</span>
                  <ExternalLink className="size-3 opacity-60" />
                </a>
              )}

              {social.instagram_url && (
                <a
                  href={social.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-medium transition-all"
                  aria-label="حساب إنستغرام"
                >
                  <span>إنستغرام</span>
                  <ExternalLink className="size-3 opacity-60" />
                </a>
              )}

              {social.twitter_url && (
                <a
                  href={social.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 text-xs font-medium transition-all"
                  aria-label="منصة إكس / تويتر"
                >
                  <span>X / تويتر</span>
                  <ExternalLink className="size-3 opacity-60" />
                </a>
              )}
            </div>
          </div>
        </div>

        <FooterCol
          title="روابط سريعة"
          links={[
            ["/", "الرئيسية"],
            ["/products", "المنتجات"],
            ["/offers", "عروض الجملة"],
            ["/about", "من نحن"],
            ["/contact", "تواصل معنا"],
          ]}
        />

        <FooterCol
          title="خدماتنا"
          links={[
            ["/services", "توريد الجملة"],
            ["/services", "حلول الفنادق والمطاعم"],
            ["/services", "المناسبات والأعراس"],
            ["/quote", "طلب عرض سعر"],
            ["/register", "حساب شركة"],
          ]}
        />

        <div>
          <h4 className="mb-4 text-lg !text-gold">تواصل معنا</h4>
          <ul className="space-y-3 opacity-90">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-gold shrink-0" />
              <span>{general.location}</span>
            </li>
            {general.phone && (
              <li className="flex items-center gap-2" dir="ltr">
                <Phone className="size-4 text-gold shrink-0" />
                <a href={`tel:${general.phone}`} className="hover:text-gold transition-colors">
                  {general.phone}
                </a>
              </li>
            )}
            {general.email && (
              <li className="flex items-center gap-2">
                <Mail className="size-4 text-gold shrink-0" />
                <a href={`mailto:${general.email}`} className="hover:text-gold transition-colors">
                  {general.email}
                </a>
              </li>
            )}
            <li>
              <Link to="/contact" className="underline underline-offset-4 hover:text-gold">
                نموذج التواصل السريع
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-forest-foreground/15">
        <div className="container-x flex flex-col gap-3 py-5 text-sm opacity-80 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} أطيب الزهور. جميع الحقوق محفوظة.</p>
          <div className="flex flex-wrap gap-4">
            <span>سياسة الخصوصية</span>
            <span>الشروط والأحكام</span>
            <span>سياسة التوصيل</span>
            <span>سياسة الإرجاع والمطالبات</span>
            <Link to="/admin" className="hover:text-gold">
              لوحة الإدارة
            </Link>
            <Link to="/courier" className="hover:text-gold">
              لوحة المندوب
            </Link>
          </div>
          <p dir="ltr">Developed by {general.developer}</p>
        </div>
      </div>
    </footer>
  );
}

type To = "/" | "/products" | "/offers" | "/about" | "/contact" | "/services" | "/quote" | "/register";
function FooterCol({ title, links }: { title: string; links: [To, string][] }) {
  return (
    <div>
      <h4 className="mb-4 text-lg !text-gold">{title}</h4>
      <ul className="space-y-2.5 opacity-90">
        {links.map(([to, l]) => (
          <li key={l}>
            <Link to={to} className="hover:text-gold transition-colors">
              {l}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
