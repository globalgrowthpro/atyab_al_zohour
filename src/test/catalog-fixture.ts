// Fixed catalogue isolates cart rules from ongoing merchandising edits.
export const products = [
  {
    slug: "pink-rose",
    name: "ورد وردي للاختبار",
    sku: "TEST-ROSE",
    moq: 10,
    unit: "باقة",
    available: true,
  },
  {
    slug: "florist-supplies-kit",
    name: "مستلزمات للاختبار",
    sku: "TEST-KIT",
    moq: 1,
    unit: "كرتون",
    available: true,
  },
  {
    slug: "seasonal-peony-tulip",
    name: "صنف غير متاح",
    sku: "TEST-OFF",
    moq: 5,
    unit: "باقة",
    available: false,
  },
];
export const productImage = () => "/test-image.jpg";
