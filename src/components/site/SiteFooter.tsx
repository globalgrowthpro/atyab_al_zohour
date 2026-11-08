import { Link } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import logo from "@/assets/logo.png";
import { useStoreSettings, formatWhatsAppUrl, formatMessengerUrl } from "@/features/settings/store";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  );
}

function MessengerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.093.303 2.25.464 3.443.464 6.627 0 12-4.975 12-11.111C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26 6.559-6.963 3.13 3.259 5.889-3.259-6.56 6.963z"/>
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

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

          {/* Social Media & Chat Channels as Icons */}
          <div className="pt-2">
            <span className="block text-xs font-bold text-gold mb-3">
              قنوات التواصل والمحادثة المباشرة:
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-xl bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-sm transition-all hover:scale-110 active:scale-95 hover:shadow-emerald-600/30"
                  title="واتساب"
                  aria-label="تواصل عبر واتساب"
                >
                  <WhatsAppIcon className="size-5" />
                </a>
              )}

              {messengerUrl && (
                <a
                  href={messengerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white shadow-sm transition-all hover:scale-110 active:scale-95 hover:shadow-blue-600/30"
                  title="فيسبوك ماسنجر"
                  aria-label="تواصل عبر فيسبوك ماسنجر"
                >
                  <MessengerIcon className="size-5" />
                </a>
              )}

              {social.facebook_url && (
                <a
                  href={social.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-xl bg-white/10 hover:bg-[#1877F2] text-white shadow-sm transition-all hover:scale-110 active:scale-95 hover:shadow-[#1877F2]/30"
                  title="صفحة فيسبوك"
                  aria-label="صفحة فيسبوك"
                >
                  <FacebookIcon className="size-5" />
                </a>
              )}

              {social.instagram_url && (
                <a
                  href={social.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-xl bg-white/10 hover:bg-gradient-to-tr hover:from-[#f09433] hover:via-[#dc2743] hover:to-[#bc1888] text-white shadow-sm transition-all hover:scale-110 active:scale-95 hover:shadow-[#dc2743]/30"
                  title="حساب إنستغرام"
                  aria-label="حساب إنستغرام"
                >
                  <InstagramIcon className="size-5" />
                </a>
              )}

              {social.twitter_url && (
                <a
                  href={social.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-10 place-items-center rounded-xl bg-white/10 hover:bg-black border border-transparent hover:border-white/20 text-white shadow-sm transition-all hover:scale-110 active:scale-95 hover:shadow-black/30"
                  title="منصة إكس / تويتر"
                  aria-label="منصة إكس / تويتر"
                >
                  <XIcon className="size-4" />
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
