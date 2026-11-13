import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CmsSection {
  title: string;
  description: string;
  icon?: string;
  image?: string;
}

export interface CmsPageData {
  slug: string;
  title: string;
  subtitle: string;
  content: string;
  sections: CmsSection[];
  metaTitle?: string;
  metaDescription?: string;
}

export const defaultCmsPages: Record<string, CmsPageData> = {
  about: {
    slug: "about",
    title: "أطياب الزهور — الريادة في استيراد وتوريد الزهور الطبيعية",
    subtitle: "شريككم الأول في المملكة العربية السعودية لأجود أنواع الزهور الهولندية والأكوادورية المبردة.",
    content: "تأسست أطياب الزهور لتوفير سلاسل إمداد مبردة فائقة الدقة لمحلات الزهور، منظمي الحفلات، والفنادق والمؤسسات الكبرى.",
    sections: [
      {
        title: "سلسلة تبريد صارمة 2°C - 4°C",
        description: "مستودعات مجهزة وأسطول شاحنات مبردة بأحدث أنظمة تتبع درجات الحرارة لضمان نضارة الزهور لأطول عمر مزهري.",
      },
      {
        title: "شراكات حصرية مع مزارع عالمية",
        description: "استيراد مباشر من كبرى مزارع هولندا، كينيا، والإكوادور دون وسطاء لضمان أعلى جودة بأفضل سعر جملة.",
      },
      {
        title: "التزام كامل بمواصفات وزارة البيئة والمياه والزراعة",
        description: "فحص بيئي ومخبري فوري لكافة الشحنات الواردة لضمان خلوها من الآفات وسلامتها التامة.",
      },
    ],
  },
  services: {
    slug: "services",
    title: "خدمات التوريد والخدمات اللوجستية المبردة",
    subtitle: "حلول شاملة متكاملة مصممة لقطاع الأعمال والشركات في المملكة.",
    content: "نقدم باقة متكاملة من الخدمات التي تغطي كل متطلبات محلات التنسيق والمناسبات الكبرى.",
    sections: [
      {
        title: "عقود التوريد الدورية المجدولة",
        description: "توصيل أسبوعي أو يومي لزهور طازجة مع خصومات كميات تصاعدية وتسهيلات دفع معتمدة.",
      },
      {
        title: "تجهيز وتوريد المناسبات الضخمة والمؤتمرات",
        description: "توفير آلاف الباقات والأغصان النادرة في وقت قياسي وبأعلى معايير التنسيق والسلامة.",
      },
      {
        title: "التوصيل المبرد الفوري داخل المدن الرئيسية",
        description: "تغطية كاملة لمدينة الرياض، جدة، والمنطقة الشرقية مع سائقين مدربين على التعامل مع الزهور.",
      },
    ],
  },
  categories: {
    slug: "categories",
    title: "أقسام وتصنيفات الزهور",
    subtitle: "تصفح تشكيلاتنا الواسعة من الزهور الطبيعية، الخضاريات، وإكسسوارات التنسيق الفاخرة.",
    content: "تشكيلة متكاملة تناسب جميع أذواق التنسيق العصري والكلاسيكي.",
    sections: [
      {
        title: "الورد الهولندي الفاخر (Roses)",
        description: "ألوان كلاسيكية وأصناف هجينة نادرة ذات رؤوس عريضة وسيقان قوية.",
      },
      {
        title: "الليليوم والزنبق (Lilies)",
        description: "زهور عطرية ملكية فواحة تناسب كبرى قاعات الأفراح والاحتفالات الرسمية.",
      },
      {
        title: "الأقحوان والجيربيرا (Chrysanthemums & Gerberas)",
        description: "حيوية فائقة وألوان زاهية مبهجة متعددة تدوم طويلاً.",
      },
    ],
  },
  offers: {
    slug: "offers",
    title: "العروض الحصرية وحزم الجملة الأسبوعية",
    subtitle: "وفر أكثر مع باقات الكميات والتوريد الفندقي الخاص بأصحاب المنشآت.",
    content: "عروض متجددة أسبوعياً تضمن لك أعلى ربحية لنشاطك التجاري.",
    sections: [
      {
        title: "خصم الشحنات المباشرة من المطار",
        description: "خصومات تصل إلى 25% عند استلام كراتين الزهور مباشرة فور وصول شحنة الطيران المبردة.",
      },
      {
        title: "حزم التأسيس لمحلات الزهور الجديدة",
        description: "دعم المنشآت الناشئة بأسعار تفضيلية وفترات سداد ميسرة للشهرين الأولين.",
      },
    ],
  },
};

/**
 * Hook to retrieve CMS Page Data from Supabase with instant local fallback.
 */
export function useCmsPage(slug: string): { page: CmsPageData; loading: boolean } {
  const fallback = defaultCmsPages[slug] || {
    slug,
    title: "أطياب الزهور للتجارة",
    subtitle: "",
    content: "",
    sections: [],
  };

  const [page, setPage] = useState<CmsPageData>(fallback);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function fetchPage() {
      if (typeof window === "undefined" || import.meta.env["TEST"]) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("cms_pages")
          .select("*")
          .eq("slug", slug)
          .maybeSingle();

        if (isMounted) {
          if (!error && data) {
            setPage({
              slug: data.slug,
              title: data.title || fallback.title,
              subtitle: data.subtitle || fallback.subtitle,
              content: data.content || fallback.content,
              sections: Array.isArray(data.sections) && data.sections.length > 0
                ? data.sections
                : fallback.sections,
              metaTitle: data.meta_title,
              metaDescription: data.meta_description,
            });
          }
          setLoading(false);
        }
      } catch {
        if (isMounted) setLoading(false);
      }
    }

    fetchPage();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  return { page, loading };
}

