export type Category = {
  slug: string;
  name: string;
  emoji: string;
  tone: string;
};

export const categories: Category[] = [
  {
    slug: "birthday",
    name: "Birthday Cake",
    emoji: "🎂",
    tone: "bg-strawberry-100",
  },
  { slug: "cupcake", name: "Cupcake", emoji: "🧁", tone: "bg-butter-100" },
  { slug: "pastry", name: "Pastry", emoji: "🥐", tone: "bg-pistachio-100" },
  {
    slug: "custom",
    name: "Custom Cake",
    emoji: "🍰",
    tone: "bg-blueberry-100",
  },
];

export type Product = {
  name: string;
  description: string;
  /** Harga dalam rupiah penuh, format tampilannya lewat formatPrice(). */
  price: number;
  category: string;
  emoji: string;
  tone: string;
  bestSeller?: boolean;
};

export const products: Product[] = [
  {
    name: "Strawberry Shortcake",
    description: "Sponge lembut, krim segar, dan stroberi pilihan.",
    price: 185000,
    category: "birthday",
    emoji: "🍰",
    tone: "bg-strawberry-100",
    bestSeller: true,
  },
  {
    name: "Rainbow Birthday Cake",
    description: "Enam lapis warna dengan buttercream vanilla.",
    price: 250000,
    category: "birthday",
    emoji: "🎂",
    tone: "bg-blueberry-100",
  },
  {
    name: "Choco Fudge Cake",
    description: "Cokelat pekat dengan ganache yang lumer.",
    price: 195000,
    category: "birthday",
    emoji: "🍫",
    tone: "bg-cream-300",
  },
  {
    name: "Vanilla Cupcake",
    description: "Cupcake klasik dengan topping buttercream.",
    price: 25000,
    category: "cupcake",
    emoji: "🧁",
    tone: "bg-butter-100",
    bestSeller: true,
  },
  {
    name: "Red Velvet Cupcake",
    description: "Red velvet lembut dengan cream cheese frosting.",
    price: 30000,
    category: "cupcake",
    emoji: "🧁",
    tone: "bg-strawberry-100",
  },
  {
    name: "Butter Croissant",
    description: "Berlapis-lapis, renyah di luar, lembut di dalam.",
    price: 22000,
    category: "pastry",
    emoji: "🥐",
    tone: "bg-butter-200",
  },
  {
    name: "Matcha Roll Cake",
    description: "Gulung matcha Jepang dengan krim susu.",
    price: 150000,
    category: "pastry",
    emoji: "🍵",
    tone: "bg-pistachio-100",
    bestSeller: true,
  },
  {
    name: "Cinnamon Roll",
    description: "Roti manis kayu manis dengan glaze gula.",
    price: 28000,
    category: "pastry",
    emoji: "🍩",
    tone: "bg-cream-300",
  },
  {
    name: "Blueberry Cheesecake",
    description: "Cheesecake panggang dengan saus blueberry.",
    price: 210000,
    category: "custom",
    emoji: "🫐",
    tone: "bg-blueberry-100",
    bestSeller: true,
  },
  {
    name: "Custom Photo Cake",
    description: "Cetak foto favorit kamu di atas kue.",
    price: 320000,
    category: "custom",
    emoji: "🎨",
    tone: "bg-pistachio-100",
  },
];

/**
 * Format manual (bukan Intl) supaya hasilnya identik di server dan browser,
 * jadi tidak memicu hydration mismatch.
 */
export function formatPrice(value: number) {
  return `Rp ${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
