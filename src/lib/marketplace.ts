import chakriImage from "@/assets/chakri.jpg.asset.json";
import familyImage from "@/assets/family-pack.jpg.asset.json";
import flowerPotsImage from "@/assets/flower-pots.jpg.asset.json";
import bombsImage from "@/assets/lakshmi-bombs.jpg.asset.json";
import marketImage from "@/assets/firecracker-market.jpg";
import rocketsImage from "@/assets/rockets.jpg.asset.json";
import sparklersImage from "@/assets/sparklers.jpg.asset.json";

export const categories = [
  "All",
  "Sparklers",
  "Flower Pots",
  "Rockets",
  "Ground Chakras",
  "Sky Shots",
  "Gift Boxes",
  "Custom",
] as const;

export type ProductCategory = (typeof categories)[number];
export type ShopStatus = "Pending approval" | "Approved";
export type OrderStatus = "New" | "Confirmed" | "Ready for Pickup" | "Collected" | "Cancelled";

export type Product = {
  id: string;
  shopId: string;
  name: string;
  category: Exclude<ProductCategory, "All">;
  description: string;
  pack: string;
  mrp: number;
  price: number;
  stock: number;
  image: string;
  images?: string[];
  isCustom?: boolean;
};

export type Shop = {
  id: string;
  slug: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  pincode: string;
  distanceKm: number;
  rating: number;
  reviews: number;
  license: string;
  photo: string;
  isOpen: boolean;
  status: ShopStatus;
  description: string;
};

export type OrderLine = {
  productId: string;
  name: string;
  quantity: number;
  mrp: number;
  price: number;
};

export type DemoOrder = {
  id: string;
  shopId: string;
  customerName: string;
  phone: string;
  pickupCode: string;
  status: OrderStatus;
  lines: OrderLine[];
  subtotal: number;
  savings: number;
  total: number;
  placedAt: string;
};

export type RegistrationDraft = {
  ownerName: string;
  shopName: string;
  phone: string;
  email: string;
  address: string;
  area: string;
  pincode: string;
  license: string;
  photoName: string;
  photoData: string;
};

export type MarketplaceState = {
  shops: Shop[];
  products: Product[];
  orders: DemoOrder[];
  cartShopId: string | null;
  cart: Record<string, number>;
  confirmationOrder: DemoOrder | null;
  sellerShopId: string | null;
  registration: RegistrationDraft;
};

const imageSet = [
  sparklersImage.url,
  flowerPotsImage.url,
  chakriImage.url,
  rocketsImage.url,
  bombsImage.url,
  familyImage.url,
];

const shopSeeds = [
  {
    id: "shop-gurukrupa",
    slug: "gurukrupa-fire-crackers",
    name: "Gurukrupa Fire Crackers",
    ownerName: "Sanket Bokade",
    phone: "98765 43210",
    email: "hello@gurukrupafirecrackers.in",
    address: "21 Main Bazaar Road, Sivakasi West",
    area: "Sivakasi West",
    pincode: "626123",
    distanceKm: 0.8,
    rating: 4.9,
    reviews: 128,
    license: "TN-FW-2026-001",
    image: imageSet[5],
    isOpen: true,
    description: "A family-run favourite for thoughtful festive bundles and friendly local service.",
  },
  {
    id: "shop-sri-murugan",
    slug: "sri-murugan-crackers",
    name: "Sri Murugan Crackers",
    ownerName: "R. Murugan",
    phone: "98765 32011",
    email: "murugan@example.in",
    address: "4 Temple Street, Thiruthangal",
    area: "Thiruthangal",
    pincode: "626130",
    distanceKm: 2.4,
    rating: 4.7,
    reviews: 86,
    license: "TN-FW-2026-002",
    image: imageSet[1],
    isOpen: true,
    description: "Handpicked classics, neatly packed and ready for the whole family.",
  },
  {
    id: "shop-velavan",
    slug: "velavan-fireworks",
    name: "Velavan Fireworks",
    ownerName: "M. Velavan",
    phone: "98765 32022",
    email: "velavan@example.in",
    address: "16 Sivakasi–Sattur Road, Sattur",
    area: "Sattur",
    pincode: "626203",
    distanceKm: 4.1,
    rating: 4.8,
    reviews: 74,
    license: "TN-FW-2026-003",
    image: imageSet[3],
    isOpen: true,
    description: "An excellent pick for colourful sky shots and the season’s most-loved crackers.",
  },
  {
    id: "shop-deepam",
    slug: "deepam-crackers",
    name: "Deepam Crackers",
    ownerName: "P. Deepa",
    phone: "98765 32033",
    email: "deepam@example.in",
    address: "8 Market Lane, Vilampatti",
    area: "Vilampatti",
    pincode: "626124",
    distanceKm: 5.6,
    rating: 4.6,
    reviews: 63,
    license: "TN-FW-2026-004",
    image: imageSet[0],
    isOpen: true,
    description: "Bright, reliable festive essentials with cheerful prices for every celebration.",
  },
  {
    id: "shop-annanagar",
    slug: "anna-nagar-fireworks",
    name: "Anna Nagar Fireworks",
    ownerName: "K. Selvam",
    phone: "98765 32044",
    email: "annanagar@example.in",
    address: "32 Bazaar Street, Anna Nagar",
    area: "Anna Nagar",
    pincode: "626125",
    distanceKm: 7.3,
    rating: 4.5,
    reviews: 52,
    license: "TN-FW-2026-005",
    image: imageSet[2],
    isOpen: false,
    description: "Shop family packs and traditional favourites at one easy neighbourhood stop.",
  },
  {
    id: "shop-sivakasi-central",
    slug: "sivakasi-central-crackers",
    name: "Sivakasi Central Crackers",
    ownerName: "A. Arul",
    phone: "98765 32055",
    email: "central@example.in",
    address: "5 Bus Stand Road, Sivakasi Central",
    area: "Sivakasi Central",
    pincode: "626123",
    distanceKm: 9.2,
    rating: 4.8,
    reviews: 97,
    license: "TN-FW-2026-006",
    image: imageSet[4],
    isOpen: true,
    description: "A trusted central stop with colourful selections and custom gift bundles.",
  },
];

const productSeeds: Array<{
  name: string;
  category: Exclude<ProductCategory, "All">;
  description: string;
  pack: string;
  mrp: number;
}> = [
  { name: "Electric Sparklers 10 cm", category: "Sparklers", description: "A bright, classic sparkle for the little moments.", pack: "10 pieces", mrp: 100 },
  { name: "Colour Sparklers 15 cm", category: "Sparklers", description: "Brilliant festive colour in every stick.", pack: "10 pieces", mrp: 160 },
  { name: "Green Sparklers 10 cm", category: "Sparklers", description: "Colourful, family-favourite festive sparkles.", pack: "10 pieces", mrp: 150 },
  { name: "Flower Pots (Small)", category: "Flower Pots", description: "A fountain of golden light, ready to brighten your evening.", pack: "5 pieces", mrp: 200 },
  { name: "Flower Pots (Big)", category: "Flower Pots", description: "A bigger, brighter flower of light for the festivities.", pack: "5 pieces", mrp: 350 },
  { name: "Colour Koti", category: "Flower Pots", description: "A colourful fountain-style favourite.", pack: "5 pieces", mrp: 475 },
  { name: "Ground Chakkar", category: "Ground Chakras", description: "The classic spin that turns the ground into a celebration.", pack: "10 pieces", mrp: 190 },
  { name: "Special Ground Chakkar", category: "Ground Chakras", description: "Traditional colour and a wonderfully lively spin.", pack: "10 pieces", mrp: 280 },
  { name: "Ashoka Chakkar", category: "Ground Chakras", description: "A bright traditional favourite for festive nights.", pack: "10 pieces", mrp: 240 },
  { name: "Bijili Crackers", category: "Custom", description: "A timeless sound cracker in a convenient packet.", pack: "1 packet", mrp: 180 },
  { name: "Lakshmi Crackers", category: "Custom", description: "A festive household favourite in a ready-to-go pack.", pack: "1 packet", mrp: 245 },
  { name: "Red Bijili Special", category: "Custom", description: "A popular local classic in a family-sized pack.", pack: "1 packet", mrp: 320 },
  { name: "Red Star Sky Shots", category: "Sky Shots", description: "A beautiful burst of colour against the night sky.", pack: "5 shots", mrp: 650 },
  { name: "Five Shot Sky Shots", category: "Sky Shots", description: "A little succession of colourful sky-high moments.", pack: "5 shots", mrp: 480 },
  { name: "Rocket Bombs", category: "Rockets", description: "A classic upward flight for the big festive moment.", pack: "5 pieces", mrp: 360 },
  { name: "Baby Rockets", category: "Rockets", description: "Small, cheerful rockets for a little extra sparkle.", pack: "10 pieces", mrp: 290 },
  { name: "Mini Celebration Gift Box", category: "Gift Boxes", description: "A carefully picked mix of classic festive favourites.", pack: "12 assorted items", mrp: 899 },
  { name: "Family Celebration Gift Box", category: "Gift Boxes", description: "A generous assortment for the whole family.", pack: "25 assorted items", mrp: 1599 },
];

const defaultRegistration: RegistrationDraft = {
  ownerName: "",
  shopName: "",
  phone: "",
  email: "",
  address: "",
  area: "",
  pincode: "",
  license: "",
  photoName: "",
  photoData: "",
};

function makeShopProducts(shopId: string, shopIndex: number): Product[] {
  return productSeeds.map((item, index) => {
    const mrp = item.mrp + shopIndex * 9 + ((index + shopIndex) % 3) * 10;
    const discountPercent = 10 + ((shopIndex * 7 + index * 3) % 36);
    const price = Math.max(1, Math.floor((mrp * (100 - discountPercent)) / 100));
    return {
      id: `${shopId}-product-${index + 1}`,
      shopId,
      name: item.name,
      category: item.category,
      description: item.description,
      pack: item.pack,
      mrp,
      price,
      stock: 12 + ((index + shopIndex) % 18),
      image: imageSet[(index + shopIndex) % imageSet.length] ?? marketImage,
    };
  });
}

export const DEMO_STORAGE_KEY = "gurukrupa-marketplace-demo-v1";
export const demoShopPhoto = marketImage;
export const initialRegistration: RegistrationDraft = defaultRegistration;

export function createInitialMarketplace(): MarketplaceState {
  const shops: Shop[] = shopSeeds.map(({ image, ...shop }) => ({
    ...shop,
    photo: image ?? marketImage,
    status: "Approved",
  }));
  return {
    shops,
    products: shops.flatMap((shop, index) => makeShopProducts(shop.id, index)),
    orders: [],
    cartShopId: null,
    cart: {},
    confirmationOrder: null,
    sellerShopId: null,
    registration: { ...defaultRegistration },
  };
}

export const sellerProductTemplates = productSeeds.concat([
  { name: "Silver Rain Sparklers", category: "Sparklers" as const, description: "", pack: "5 pieces", mrp: 200 },
  { name: "Pencil Fountains", category: "Flower Pots" as const, description: "", pack: "10 pieces", mrp: 260 },
  { name: "Cock Brand Flower Pots", category: "Flower Pots" as const, description: "", pack: "5 pieces", mrp: 390 },
  { name: "Sivakasi Special Chakkar", category: "Ground Chakras" as const, description: "", pack: "10 pieces", mrp: 350 },
  { name: "Peacock Sky Shots", category: "Sky Shots" as const, description: "", pack: "10 shots", mrp: 880 },
  { name: "Twinkling Star Shots", category: "Sky Shots" as const, description: "", pack: "10 shots", mrp: 720 },
  { name: "Classic Flower Rockets", category: "Rockets" as const, description: "", pack: "10 pieces", mrp: 450 },
  { name: "Whistling Rockets", category: "Rockets" as const, description: "", pack: "10 pieces", mrp: 560 },
  { name: "Grand Festival Gift Box", category: "Gift Boxes" as const, description: "", pack: "35 assorted items", mrp: 2299 },
  { name: "Children’s Celebration Box", category: "Gift Boxes" as const, description: "", pack: "20 assorted items", mrp: 1199 },
  { name: "Classic Sound Crackers", category: "Custom" as const, description: "", pack: "1 packet", mrp: 250 },
  { name: "Gold Lakshmi Crackers", category: "Custom" as const, description: "", pack: "1 packet", mrp: 390 },
]);

export function getProductDiscount(product: Pick<Product, "mrp" | "price">): number {
  return product.mrp > 0 ? Math.round((1 - product.price / product.mrp) * 100) : 0;
}

export function getShopDiscount(shopId: string, products: Product[]): number {
  return products
    .filter((product) => product.shopId === shopId)
    .reduce((maximum, product) => Math.max(maximum, getProductDiscount(product)), 0);
}

export function slugifyShopName(name: string): string {
  return name
    .toLocaleLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function addShopCartQuantity(
  cart: Record<string, number>,
  currentShopId: string | null,
  targetShopId: string,
  productId: string,
): { status: "added" | "shop-conflict"; cart: Record<string, number> } {
  const hasItems = Object.values(cart).some((quantity) => quantity > 0);
  if (hasItems && currentShopId !== targetShopId) return { status: "shop-conflict", cart };
  return {
    status: "added",
    cart: { ...cart, [productId]: (cart[productId] ?? 0) + 1 },
  };
}

export function calculateOrderTotals(lines: OrderLine[]): { subtotal: number; savings: number; total: number } {
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const savings = lines.reduce((sum, line) => sum + (line.mrp - line.price) * line.quantity, 0);
  return { subtotal, savings, total: subtotal };
}

export function appendCustomProductPhoto(photos: string[], photo: string): string[] {
  return photos.length >= 3 ? photos : [...photos, photo];
}
export const PICKUP_HOLD_HOURS = 24;

export function createPickupCode(random: () => number = Math.random): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => alphabet[Math.floor(random() * alphabet.length)] ?? "X").join("");
}

export function getDirectionsUrl(shop: Pick<Shop, "name" | "address" | "pincode">): string {
  const destination = `${shop.name}, ${shop.address}, ${shop.pincode}`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
}
