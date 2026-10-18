import roses from "@/assets/cat-roses.jpg";
import lilies from "@/assets/cat-lilies.jpg";
import carnations from "@/assets/cat-carnations.jpg";
import chrys from "@/assets/cat-chrysanthemums.jpg";
import gyps from "@/assets/cat-gypsophila.jpg";
import greenery from "@/assets/cat-greenery.jpg";
import seasonal from "@/assets/cat-seasonal.jpg";
import supplies from "@/assets/cat-supplies.jpg";

// Contact details come from configuration. Leave empty until the owner provides them —
// never invent phone numbers or addresses.
export const siteConfig = {
  phone: "",
  email: "",
  location: "المملكة العربية السعودية",
  developer: "Mr. Hafez Rahim",
};

export type Category = { slug: string; name: string; en: string; image: string };

export const categories: Category[] = [
  { slug: "roses", name: "الورود", en: "Roses", image: roses },
  { slug: "lilies", name: "الزنابق", en: "Lilies", image: lilies },
  { slug: "carnations", name: "القرنفل", en: "Carnations", image: carnations },
  { slug: "chrysanthemums", name: "الأقحوان", en: "Chrysanthemums", image: chrys },
  { slug: "gypsophila", name: "الجبسوفيلا", en: "Gypsophila", image: gyps },
  { slug: "greenery", name: "أوراق الزينة", en: "Greenery", image: greenery },
  { slug: "seasonal", name: "الزهور الموسمية", en: "Seasonal", image: seasonal },
  { slug: "supplies", name: "مستلزمات التنسيق", en: "Floral Supplies", image: supplies },
];

export type Product = {
  slug: string;
  sku: string;
  name: string;
  en: string;
  category: string;
  origin: string;
  grade: string;
  stem: string;
  color: string;
  unit: string;
  moq: number;
  stemsPerBunch?: number;
  bunchesPerCarton?: number;
  available: boolean;
  description: string;
  storage: string;
};

// Catalogue reference data only. Prices are intentionally absent: wholesale prices are
// account-specific and must come from the pricing system, never hardcoded.
export const products: Product[] = [
  { slug: "red-naomi-rose", sku: "RS-001", name: "ورد أحمر فاخر", en: "Red Naomi Rose", category: "roses", origin: "كينيا", grade: "ممتاز A", stem: "50 – 60 سم", color: "أحمر", unit: "باقة", moq: 10, stemsPerBunch: 20, bunchesPerCarton: 15, available: true, description: "ورد أحمر بزهرة كبيرة وساق قوية، مناسب لمحلات الورد والمناسبات الفاخرة.", storage: "يُحفظ بين 2 و 4 درجات مئوية مع قص السيقان وتغيير الماء يومياً." },
  { slug: "pink-rose", sku: "RS-002", name: "ورد وردي", en: "Pink Rose", category: "roses", origin: "كينيا", grade: "ممتاز A", stem: "50 – 60 سم", color: "وردي", unit: "باقة", moq: 10, stemsPerBunch: 20, bunchesPerCarton: 15, available: true, description: "ورد وردي ناعم مثالي لتنسيقات الأعراس والفنادق.", storage: "يُحفظ بين 2 و 4 درجات مئوية بعيداً عن الفواكه." },
  { slug: "white-oriental-lily", sku: "LL-001", name: "زنبق أبيض", en: "White Oriental Lily", category: "lilies", origin: "هولندا", grade: "ممتاز A", stem: "70 – 80 سم", color: "أبيض", unit: "باقة", moq: 5, stemsPerBunch: 10, bunchesPerCarton: 10, available: true, description: "زنبق شرقي أبيض برائحة عطرة وبراعم متعددة على الساق.", storage: "يُحفظ بين 2 و 5 درجات مئوية وتُزال حبوب اللقاح عند التفتح." },
  { slug: "pink-carnation", sku: "CR-001", name: "قرنفل وردي", en: "Pink Carnation", category: "carnations", origin: "كولومبيا", grade: "ممتاز", stem: "60 سم", color: "وردي", unit: "باقة", moq: 10, stemsPerBunch: 25, bunchesPerCarton: 20, available: true, description: "قرنفل يدوم طويلاً، اقتصادي ومناسب للطلبات المتكررة.", storage: "يُحفظ بين 2 و 4 درجات مئوية." },
  { slug: "mixed-chrysanthemum", sku: "CH-001", name: "أقحوان مشكّل", en: "Mixed Chrysanthemum", category: "chrysanthemums", origin: "هولندا", grade: "ممتاز", stem: "70 سم", color: "أصفر وأبيض", unit: "باقة", moq: 10, stemsPerBunch: 10, bunchesPerCarton: 20, available: true, description: "أقحوان بأزهار متعددة على الساق الواحدة لتنسيقات ممتلئة.", storage: "يُحفظ بين 2 و 5 درجات مئوية." },
  { slug: "gypsophila-xlence", sku: "GY-001", name: "جبسوفيلا بيضاء", en: "Gypsophila Xlence", category: "gypsophila", origin: "الإكوادور", grade: "ممتاز", stem: "70 – 80 سم", color: "أبيض", unit: "باقة", moq: 10, stemsPerBunch: 10, bunchesPerCarton: 20, available: true, description: "زهور سحابية بيضاء تُستخدم كحشوة أساسية في الباقات.", storage: "يُحفظ بين 2 و 4 درجات مئوية." },
  { slug: "eucalyptus", sku: "GR-001", name: "أوراق الأوكالبتوس", en: "Eucalyptus", category: "greenery", origin: "هولندا", grade: "ممتاز", stem: "60 سم", color: "أخضر", unit: "ربطة", moq: 10, available: true, description: "أوراق زينة عطرية تضيف لمسة طبيعية لأي تنسيق.", storage: "يُحفظ في ماء بارد بين 4 و 6 درجات مئوية." },
  { slug: "seasonal-peony-tulip", sku: "SN-001", name: "مزيج موسمي (توليب وفاوانيا)", en: "Seasonal Mix", category: "seasonal", origin: "هولندا", grade: "ممتاز A", stem: "40 – 50 سم", color: "متعدد", unit: "باقة", moq: 5, available: false, description: "تشكيلة موسمية محدودة تتوفر حسب الموسم.", storage: "يُحفظ بين 1 و 3 درجات مئوية." },
  { slug: "florist-supplies-kit", sku: "SP-001", name: "مستلزمات التغليف", en: "Wrapping Supplies", category: "supplies", origin: "متعدد", grade: "—", stem: "—", color: "متعدد", unit: "كرتون", moq: 1, available: true, description: "ورق كرافت وأشرطة ساتان وإسفنج زهور للمحلات.", storage: "يُحفظ في مكان جاف." },
];

export const categoryOf = (slug: string) => categories.find((c) => c.slug === slug);
export const productImage = (p: Product) => categoryOf(p.category)?.image ?? roses;
