import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Check, ChevronLeft, Clock3, CreditCard, ImagePlus, LocateFixed, MapPin, PackageCheck, Plus, Save, ShieldCheck, Sparkles, Store, Trash2, Upload, X } from "lucide-react";
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useMarketplace } from "@/lib/marketplace-context";
import { appendCustomProductPhoto, categories, getProductDiscount, sellerProductTemplates, slugifyShopName, type OrderStatus, type Product, type ProductCategory, type RegistrationDraft, type Shop } from "@/lib/marketplace";

export const Route = createFileRoute("/seller")({
  head: () => ({
    meta: [
      { title: "List Your Shop | Firework Lane" },
      { name: "description", content: "Register a licensed local firecracker shop, add products, and manage pickup orders with Firework Lane." },
      { property: "og:title", content: "List Your Shop | Firework Lane" },
      { property: "og:description", content: "Register your fireworks shop and manage festive products and pickup orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SellerHome,
});

const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });
function SellerHome() {
  const { state, setState } = useMarketplace();
  const currentShop = state.shops.find((shop) => shop.id === state.sellerShopId);
  const [step, setStep] = useState(1);
  const [verified, setVerified] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [activeTab, setActiveTab] = useState("orders");
  const [selectedTemplates, setSelectedTemplates] = useState<Record<number, boolean>>({});
  const [templatePrices, setTemplatePrices] = useState<Record<number, { mrp: string; price: string }>>({});
  const [bulkDiscount, setBulkDiscount] = useState("20");
  const [customFormOpen, setCustomFormOpen] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customCategory, setCustomCategory] = useState<Exclude<ProductCategory, "All">>("Custom");
  const [customDescription, setCustomDescription] = useState("");
  const [customPack, setCustomPack] = useState("");
  const [customMrp, setCustomMrp] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [customStock, setCustomStock] = useState("10");
  const [shopPhotoPreview, setShopPhotoPreview] = useState("");

  const shopProducts = currentShop ? state.products.filter((product) => product.shopId === currentShop.id) : [];
  const orders = currentShop ? state.orders.filter((order) => order.shopId === currentShop.id) : [];

  const patchRegistration = (patch: Partial<RegistrationDraft>) => {
    setState((current) => ({ ...current, registration: { ...current.registration, ...patch } }));
  };

  const handlePhoto = (file: File, onRead: (dataUrl: string) => void) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a JPG, PNG or WEBP photo.");
      return;
    }
    if (file.size > 2_000_000) {
      toast.error("Choose a photo smaller than 2 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => toast.error("This photo could not be opened.");
    reader.onload = () => {
      const original = typeof reader.result === "string" ? reader.result : "";
      const image = new Image();
      image.onerror = () => toast.error("This photo could not be resized.");
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 960 / Math.max(image.width, image.height));
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        const context = canvas.getContext("2d");
        if (!context) { toast.error("This photo could not be prepared."); return; }
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const compressed = canvas.toDataURL("image/jpeg", 0.7);
        if (compressed.length > 650_000) { toast.error("Choose a smaller photo under 2 MB."); return; }
        onRead(compressed);
      };
      image.src = original;
    };
    reader.readAsDataURL(file);
  };

  const handleShopPhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    handlePhoto(file, (dataUrl) => {
      setShopPhotoPreview(dataUrl);
      patchRegistration({ photoName: file.name, photoData: dataUrl });
    });
    event.currentTarget.value = "";
  };

  const startOtp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setVerified(false);
    setStep(1.5);
  };

  const verifyDemoOtp = () => {
    if (!/^\d{6}$/.test(demoOtp)) {
      toast.error("Enter any six-digit sample code to continue.");
      return;
    }
    setVerified(true);
    setStep(2);
    toast.success("Demo number verified");
  };

  const submitRegistration = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const draft = state.registration;
    if (!draft.photoData) {
      toast.error("Upload a photo of your shop to continue.");
      return;
    }
    if (!verified) {
      toast.error("Verify your phone number to continue.");
      return;
    }
    const id = `seller-${slugifyShopName(draft.shopName)}-${Date.now().toString().slice(-4)}`;
    const shop: Shop = {
      id,
      slug: slugifyShopName(draft.shopName),
      name: draft.shopName.trim(),
      ownerName: draft.ownerName.trim(),
      phone: draft.phone.trim(),
      email: "",
      address: draft.address.trim(),
      area: draft.area.trim(),
      pincode: draft.pincode.trim(),
      distanceKm: 1.1,
      rating: 0,
      reviews: 0,
      license: draft.license.trim(),
      photo: draft.photoData || "",
      isOpen: false,
      status: "Pending approval",
      description: "Local licensed firecracker shop.",
    };
    setState((current) => ({ ...current, shops: [...current.shops.filter((item) => item.id !== id), shop], sellerShopId: id }));
    setActiveTab("products");
    toast.success("Shop profile submitted for review");
  };

  const useDemoShop = () => {
    const demo = state.shops.find((shop) => shop.id === "shop-gurukrupa");
    if (!demo) return;
    setState((current) => ({ ...current, sellerShopId: demo.id }));
    setActiveTab("orders");
  };

  const updateOrder = (orderId: string, status: OrderStatus) => {
    setState((current) => ({ ...current, orders: current.orders.map((order) => order.id === orderId ? { ...order, status } : order) }));
    toast.success(`Order marked ${status.toLowerCase()}`);
  };

  const selectTemplate = (index: number, checked: boolean | "indeterminate") => {
    const selected = checked === true;
    setSelectedTemplates((current) => ({ ...current, [index]: selected }));
    if (selected && !templatePrices[index]) {
      const template = sellerProductTemplates[index];
      if (!template) return;
      const mrp = template.mrp;
      setTemplatePrices((current) => ({ ...current, [index]: { mrp: String(mrp), price: String(Math.round((mrp * 0.8) / 5) * 5) } }));
    }
  };

  const setTemplatePrice = (index: number, field: "mrp" | "price", value: string) => {
    const template = sellerProductTemplates[index];
    if (!template) return;
    setTemplatePrices((current) => ({
      ...current,
      [index]: {
        mrp: field === "mrp" ? value : current[index]?.mrp ?? String(template.mrp),
        price: field === "price" ? value : current[index]?.price ?? String(template.mrp),
      },
    }));
  };

  const applyBulkDiscount = () => {
    const percentage = Math.max(0, Math.min(90, Number(bulkDiscount) || 0));
    setTemplatePrices((current) => {
      const next = { ...current };
      sellerProductTemplates.forEach((template, index) => {
        if (!selectedTemplates[index]) return;
        const mrp = Number(current[index]?.mrp) || template.mrp;
        next[index] = { mrp: String(mrp), price: String(Math.max(1, Math.round((mrp * (100 - percentage)) / 100 / 5) * 5)) };
      });
      return next;
    });
    toast.success(`${percentage}% discount applied`);
  };

  const saveTemplates = () => {
    if (!currentShop) return;
    const selected = sellerProductTemplates.flatMap((template, index) => {
      if (!selectedTemplates[index]) return [];
      const values = templatePrices[index];
      const mrp = Number(values?.mrp);
      const price = Number(values?.price);
      if (!mrp || !price || price >= mrp) return [];
        const existingProduct = shopProducts.find((item) => item.name === template.name);
        return [{
        id: existingProduct?.id ?? `${currentShop.id}-template-${index}`,
        shopId: currentShop.id,
        name: template.name,
        category: template.category,
        description: template.description || `A festive favourite from ${currentShop.name}.`,
        pack: template.pack,
        mrp,
        price,
        stock: 10,
          image: existingProduct?.image ?? currentShop.photo,
      } satisfies Product];
    });
    if (!selected.length) {
      toast.error("Choose products and set a price below the MRP.");
      return;
    }
    setState((current) => {
      const selectedIds = new Set(selected.map((product) => product.id));
      const retained = current.products.filter((product) => product.shopId !== currentShop.id || !selectedIds.has(product.id));
      return { ...current, products: [...retained, ...selected] };
    });
    setActiveTab("products");
    toast.success(`${selected.length} products added to your shop`);
  };

  const applyShopProfile = (patch: Partial<Shop>) => {
    if (!currentShop) return;
    setState((current) => ({ ...current, shops: current.shops.map((shop) => shop.id === currentShop.id ? { ...shop, ...patch } : shop) }));
    toast.success("Shop profile updated");
  };

  const catalogCount = useMemo(() => sellerProductTemplates.length, []);

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:h-[72px] sm:px-8"><Link to="/" className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Store className="size-5" /></span><span className="font-display text-lg font-bold">Firework Lane</span></Link><div className="flex items-center gap-2"><Button asChild variant="ghost" size="sm" className="hidden text-xs sm:inline-flex"><Link to="/">I'm a Customer</Link></Button><span className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground">Shopkeeper</span></div></div></header>

      {!currentShop ? <section className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-12"><Button asChild variant="ghost" className="mb-5 h-9 px-2 text-muted-foreground"><Link to="/"><ArrowLeft /> Browse shops</Link></Button><div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]"><div className="lg:sticky lg:top-28 lg:self-start"><span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-foreground"><Sparkles className="size-3.5" /> Shopkeeper registration</span><h1 className="mt-4 max-w-lg font-display text-3xl font-bold leading-tight sm:text-5xl">Bring your shop to the festive map.</h1><p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">Create your shop profile, share licensed products and keep local pickup orders organised.</p><div className="mt-7 space-y-4"><Benefit icon={<ShieldCheck />} title="Licensed shop profiles" text="Display your licence details and a real shop photo." /><Benefit icon={<PackageCheck />} title="A catalogue built for crackers" text={`${catalogCount} ready-to-price festive products, plus your own items.`} /><Benefit icon={<CreditCard />} title="One place for orders" text="See each pickup request and keep customers in the loop." /></div><Button type="button" variant="link" className="mt-8 h-auto px-0 text-xs text-muted-foreground" onClick={useDemoShop}>Preview the Gurukrupa demo shop instead</Button></div>

        <div className="rounded-xl border border-border bg-card px-4 py-5 shadow-[var(--shadow-card)] sm:px-7 sm:py-7"><div className="mb-6"><div className="flex items-center justify-between text-xs font-semibold"><span>Shop registration</span><span className="text-muted-foreground">Step {step === 1.5 ? 1 : Math.min(3, step)} of 3</span></div><div className="mt-3 grid grid-cols-3 gap-2" aria-label="Registration progress">{[1, 2, 3].map((number) => <div key={number} className={`h-1.5 rounded-full ${step >= number ? "bg-primary" : "bg-muted"}`} />)}</div></div>

          {step === 1 && <form className="space-y-4" onSubmit={startOtp}><div><h2 className="font-display text-xl font-bold">Let's meet your shop</h2><p className="mt-1 text-sm text-muted-foreground">Start with the person behind the counter.</p></div><Field label="Owner name"><Input required minLength={2} autoComplete="name" value={state.registration.ownerName} onChange={(event) => patchRegistration({ ownerName: event.target.value })} placeholder="Full name" /></Field><Field label="Shop name"><Input required minLength={2} value={state.registration.shopName} onChange={(event) => patchRegistration({ shopName: event.target.value })} placeholder="How customers know your shop" /></Field><Field label="Phone number"><Input required type="tel" pattern="[0-9]{8,16}" autoComplete="tel" value={state.registration.phone} onChange={(event) => patchRegistration({ phone: event.target.value })} placeholder="Your mobile number" /></Field><Field label="Email address"><Input required type="email" autoComplete="email" value={state.registration.email} onChange={(event) => patchRegistration({ email: event.target.value })} placeholder="you@example.com" /></Field><Button type="submit" variant="festive" className="h-11 w-full">Continue to verification <ArrowRight /></Button></form>}

          {step === 1.5 && <div><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><ChevronLeft className="size-4" /> Edit details</button><span className="mx-auto mt-8 grid size-14 place-items-center rounded-full bg-accent text-primary"><ShieldCheck className="size-6" /></span><h2 className="mt-4 text-center font-display text-xl font-bold">Verify this number</h2><p className="mt-2 text-center text-sm text-muted-foreground">Enter the sample code sent to {state.registration.phone}.</p><div className="mx-auto mt-5 flex max-w-xs items-center gap-3"><Input aria-label="Demo verification code" inputMode="numeric" maxLength={6} value={demoOtp} onChange={(event) => setDemoOtp(event.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" className="h-12 text-center text-lg" /></div><p className="mt-2 text-center text-xs text-muted-foreground">Demo verification — any six digits work.</p><Button variant="festive" className="mt-5 h-11 w-full" onClick={verifyDemoOtp}>Verify & continue <ArrowRight /></Button></div>}

          {step === 2 && <form className="space-y-4" onSubmit={(event) => { event.preventDefault(); setStep(3); }}><button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><ChevronLeft className="size-4" /> Contact</button><div><h2 className="font-display text-xl font-bold">Where can customers find you?</h2><p className="mt-1 text-sm text-muted-foreground">Verified number · {verified ? "Ready" : "Demo verified"}</p></div><Field label="Street address"><Input required value={state.registration.address} onChange={(event) => patchRegistration({ address: event.target.value })} placeholder="Shop, street and landmark" /></Field><Field label="Area or town"><Input required value={state.registration.area} onChange={(event) => patchRegistration({ area: event.target.value })} placeholder="Your neighbourhood" /></Field><Field label="PIN code"><Input required pattern="[0-9]{6}" inputMode="numeric" value={state.registration.pincode} onChange={(event) => patchRegistration({ pincode: event.target.value })} placeholder="Six-digit PIN code" /></Field><div className="relative flex min-h-32 items-center justify-center overflow-hidden rounded-lg border border-border marketplace-map"><div className="rounded-md bg-card px-4 py-3 text-center shadow-[var(--shadow-card)]"><span className="mx-auto grid size-8 place-items-center rounded-full bg-accent text-primary"><MapPin className="size-4" /></span><p className="mt-1 text-xs font-semibold">{state.registration.area || "Your shop location"}</p><p className="text-[10px] text-muted-foreground">{state.registration.pincode || "Select your PIN code"}</p></div><Button type="button" variant="outline" size="sm" className="absolute bottom-2 right-2 h-8 text-xs" onClick={() => { if (!state.registration.area) patchRegistration({ area: "Sivakasi" }); if (!state.registration.pincode) patchRegistration({ pincode: "626123" }); toast.success("Sample map pin placed"); }}><LocateFixed /> Detect location</Button></div><Button type="submit" variant="festive" className="h-11 w-full">Add licence details <ArrowRight /></Button></form>}

          {step === 3 && <form className="space-y-4" onSubmit={submitRegistration}><button type="button" onClick={() => setStep(2)} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground"><ChevronLeft className="size-4" /> Shop address</button><div><h2 className="font-display text-xl font-bold">One last thing</h2><p className="mt-1 text-sm text-muted-foreground">Add a licence number and a photo customers recognise.</p></div><Field label="Firecracker licence number"><Input required minLength={5} value={state.registration.license} onChange={(event) => patchRegistration({ license: event.target.value })} placeholder="For example, state licence no." /></Field><div><Label htmlFor="shop-photo" className="mb-2 block">Shop photo</Label><label htmlFor="shop-photo" className="flex min-h-[120px] cursor-pointer items-center gap-4 rounded-lg border border-dashed border-border p-4 hover:bg-muted/60">{shopPhotoPreview ? <img src={shopPhotoPreview} alt="Shop preview" className="size-20 rounded-md object-cover" /> : <span className="grid size-12 place-items-center rounded-md bg-accent text-primary"><ImagePlus /></span>}<span><span className="block text-sm font-semibold">{state.registration.photoName || "Upload a shop photo"}</span><span className="mt-1 block text-xs text-muted-foreground">JPG, PNG or WEBP · shown to nearby customers</span></span><input id="shop-photo" type="file" accept="image/*" className="sr-only" onChange={handleShopPhoto} /></label></div><div className="rounded-lg bg-accent/60 p-3 text-xs leading-5 text-accent-foreground"><ShieldCheck className="mr-1 inline size-4" /> Your listing will appear after the licence details are reviewed.</div><Button type="submit" variant="festive" className="h-11 w-full">Submit for approval <ArrowRight /></Button></form>}
        </div></div></section> : <SellerDashboard shop={currentShop} products={shopProducts} orders={orders} state={state} setState={setState} activeTab={activeTab} setActiveTab={setActiveTab} onApprove={() => { if (currentShop) { setState((current) => ({ ...current, shops: current.shops.map((shop) => shop.id === currentShop.id ? { ...shop, status: "Approved" } : shop) })); toast.success("Demo shop approved"); } }} onSelectTemplate={selectTemplate} selectedTemplates={selectedTemplates} templatePrices={templatePrices} setTemplatePrice={setTemplatePrice} bulkDiscount={bulkDiscount} setBulkDiscount={setBulkDiscount} applyBulkDiscount={applyBulkDiscount} saveTemplates={saveTemplates} customFormOpen={customFormOpen} setCustomFormOpen={setCustomFormOpen} customName={customName} setCustomName={setCustomName} customCategory={customCategory} setCustomCategory={setCustomCategory} customDescription={customDescription} setCustomDescription={setCustomDescription} customPack={customPack} setCustomPack={setCustomPack} customMrp={customMrp} setCustomMrp={setCustomMrp} customPrice={customPrice} setCustomPrice={setCustomPrice} customStock={customStock} setCustomStock={setCustomStock} handlePhoto={handlePhoto} onUpdateOrder={updateOrder} onShopPhoto={(file) => handlePhoto(file, (dataUrl) => applyShopProfile({ photo: dataUrl }))} onShopProfile={applyShopProfile} />}

      <footer className="border-t border-border bg-navy text-primary-foreground"><div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link to="/" className="font-display font-bold">Firework Lane</Link><p className="max-w-xl text-xs leading-5 text-primary-foreground/75">Sale and use of firecrackers are subject to local laws and regulations. Only licensed sellers may list products.</p></div></footer>
    </main>
  );
}

function Benefit({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="flex items-start gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-primary">{icon}</span><div><p className="text-sm font-semibold">{title}</p><p className="mt-0.5 max-w-xs text-xs leading-5 text-muted-foreground">{text}</p></div></div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-2"><Label className="text-xs font-semibold">{label}</Label>{children}</div>;
}

type SellerDashboardProps = {
  shop: Shop;
  products: Product[];
  orders: ReturnType<typeof useMarketplace>["state"]["orders"];
  state: ReturnType<typeof useMarketplace>["state"];
  setState: ReturnType<typeof useMarketplace>["setState"];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onApprove: () => void;
  onSelectTemplate: (index: number, checked: boolean | "indeterminate") => void;
  selectedTemplates: Record<number, boolean>;
  templatePrices: Record<number, { mrp: string; price: string }>;
  setTemplatePrice: (index: number, field: "mrp" | "price", value: string) => void;
  bulkDiscount: string;
  setBulkDiscount: (value: string) => void;
  applyBulkDiscount: () => void;
  saveTemplates: () => void;
  customFormOpen: boolean;
  setCustomFormOpen: (open: boolean) => void;
  customName: string;
  setCustomName: (value: string) => void;
  customCategory: Exclude<ProductCategory, "All">;
  setCustomCategory: (value: Exclude<ProductCategory, "All">) => void;
  customDescription: string;
  setCustomDescription: (value: string) => void;
  customPack: string;
  setCustomPack: (value: string) => void;
  customMrp: string;
  setCustomMrp: (value: string) => void;
  customPrice: string;
  setCustomPrice: (value: string) => void;
  customStock: string;
  setCustomStock: (value: string) => void;
  handlePhoto: (file: File, onRead: (dataUrl: string) => void) => void;
  onUpdateOrder: (id: string, status: OrderStatus) => void;
  onShopPhoto: (file: File) => void;
  onShopProfile: (patch: Partial<Shop>) => void;
};

function SellerDashboard(props: SellerDashboardProps) {
  const { shop, products, orders, state, setState, activeTab, setActiveTab } = props;
  const [catalogOpen, setCatalogOpen] = useState(false);
  const [newProductPhotos, setNewProductPhotos] = useState<string[]>([]);
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const selectedCount = Object.values(props.selectedTemplates).filter(Boolean).length;
  const pendingOrders = orders.filter((order) => ["New", "Confirmed", "Ready for Pickup"].includes(order.status)).length;

  const updateProduct = (productId: string, patch: Partial<Product>) => {
    setState((current) => ({ ...current, products: current.products.map((product) => product.id === productId ? { ...product, ...patch } : product) }));
  };

  const addCustomProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const mrp = Number(props.customMrp);
    const price = Number(props.customPrice);
    const stock = Number(props.customStock);
    if (!mrp || price <= 0 || price >= mrp || !stock) { toast.error("Add a valid price, discount and available stock."); return; }
    const product: Product = {
      id: `${shop.id}-custom-${Date.now()}`,
      shopId: shop.id,
      name: props.customName.trim(),
      category: props.customCategory,
      description: props.customDescription.trim(),
      pack: props.customPack.trim() || "1 pack",
      mrp,
      price,
      stock,
      image: newProductPhotos[0] || products[0]?.image || shop.photo,
      ...(newProductPhotos.length ? { images: newProductPhotos } : {}),
      isCustom: true,
    };
    setState((current) => ({ ...current, products: [...current.products, product] }));
    props.setCustomName(""); props.setCustomDescription(""); props.setCustomPack(""); props.setCustomMrp(""); props.setCustomPrice(""); props.setCustomStock("10"); props.setCustomFormOpen(false); setNewProductPhotos([]);
    toast.success("Custom cracker added");
  };

  const readCustomPhotos = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    const remaining = Math.max(0, 3 - newProductPhotos.length);
    if (files.length > remaining) toast.error("Choose up to 3 photos for a custom item.");
    files.slice(0, remaining).forEach((file) => props.handlePhoto(file, (dataUrl) => setNewProductPhotos((current) => appendCustomProductPhoto(current, dataUrl))));
    event.currentTarget.value = "";
  };

  return <section className="mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary">Shopkeeper workspace</p><h1 className="mt-1 font-display text-2xl font-bold sm:text-4xl">{shop.name}</h1><p className="mt-1 text-xs text-muted-foreground">{shop.area} · {shop.phone}</p></div><div className="flex flex-wrap gap-2"><Button asChild size="sm" variant="outline"><Link to="/">Preview customer shops <ArrowRight /></Link></Button><Button size="sm" variant="ghost" onClick={() => setState((current) => ({ ...current, sellerShopId: null }))}>Switch shop</Button></div></div>

    {shop.status === "Pending approval" && <div className="mt-5 flex flex-col gap-3 rounded-xl border border-secondary bg-accent/45 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Clock3 className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-bold">Shop profile pending approval</p><p className="mt-1 text-xs text-muted-foreground">Your licence details are saved. Approve instantly to preview this demo listing.</p></div></div><Button variant="festive" size="sm" onClick={props.onApprove}>Approve instantly</Button></div>}

    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6"><TabsList className="grid h-11 w-full grid-cols-3 sm:max-w-md"><TabsTrigger value="orders" className="gap-1.5 text-xs sm:text-sm">Orders {pendingOrders > 0 && <span className="grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{pendingOrders}</span>}</TabsTrigger><TabsTrigger value="products" className="text-xs sm:text-sm">Products <span className="ml-1 text-[10px] text-muted-foreground">{products.length}</span></TabsTrigger><TabsTrigger value="profile" className="text-xs sm:text-sm">Shop profile</TabsTrigger></TabsList>

      <TabsContent value="orders" className="mt-6"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Pickup orders</h2><p className="mt-1 text-xs text-muted-foreground">Every customer reservation from your shop.</p></div><span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">{orders.length} total</span></div>{orders.length ? <div className="mt-4 grid gap-3 sm:grid-cols-2">{orders.map((order) => <article key={order.id} className="rounded-xl border border-border bg-card p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-bold">{order.customerName}</p><p className="mt-0.5 text-xs text-muted-foreground">Order {order.id} · {new Date(order.placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div><span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold text-accent-foreground">Code {order.pickupCode ?? "—"}</span></div><div className="mt-3 space-y-1.5 border-y border-border py-3">{order.lines.map((line) => <div key={line.productId} className="flex justify-between gap-2 text-xs"><span>{line.name} × {line.quantity}</span><span className="font-semibold">{money.format(line.price * line.quantity)}</span></div>)}</div><div className="mt-3 flex items-center justify-between gap-2"><div><p className="text-[10px] uppercase text-muted-foreground">Total</p><p className="font-bold">{money.format(order.total)}</p><a className="mt-1 inline-block text-xs text-primary" href={`tel:${order.phone}`}>{order.phone}</a></div><select aria-label={`Update status for order ${order.id}`} value={order.status} onChange={(event) => props.onUpdateOrder(order.id, event.target.value as OrderStatus)} className="max-w-[165px] rounded-md border border-input bg-background px-2 py-2 text-xs font-semibold"><option value="New">New</option><option value="Confirmed">Confirmed</option><option value="Ready for Pickup">Ready for pickup</option><option value="Collected">Collected</option><option value="Cancelled">Cancelled</option></select></div></article>)}</div> : <EmptyState icon={<PackageCheck />} title="Your orders will arrive here" description="Customer pickup requests at your shop show up as soon as they place an order." action={<Button asChild variant="festive"><Link to="/">Visit the customer marketplace <ArrowRight /></Link></Button>} />}</TabsContent>

      <TabsContent value="products" className="mt-6"><div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-xl font-bold">Your product list</h2><p className="mt-1 text-xs text-muted-foreground">Update prices, available stock and festive offers.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => setCatalogOpen((open) => !open)}><PackageCheck /> Browse {sellerProductTemplates.length} templates</Button><Button variant="festive" size="sm" onClick={() => props.setCustomFormOpen(!props.customFormOpen)}><Plus /> Custom product</Button></div></div>

        {catalogOpen && <div className="mt-4 rounded-xl border border-border bg-card p-4 sm:p-5"><div className="flex flex-wrap items-end justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Festive product catalogue</h3><p className="mt-1 text-xs text-muted-foreground">Select products, enter prices and the discount updates live.</p></div><span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">{selectedCount} selected</span></div><div className="mt-4 flex flex-wrap items-end gap-2 rounded-lg bg-muted/60 p-3"><Field label="Discount to apply"><div className="flex items-center gap-2"><Input aria-label="Bulk discount percentage" type="number" min="0" max="90" value={props.bulkDiscount} onChange={(event) => props.setBulkDiscount(event.target.value)} className="h-9 w-24" /><span className="text-sm text-muted-foreground">%</span><Button variant="outline" size="sm" onClick={props.applyBulkDiscount}>Apply to selected</Button></div></Field></div><div className="mt-3 max-h-[540px] divide-y divide-border overflow-auto rounded-lg border border-border">{sellerProductTemplates.map((product, index) => { const prices = props.templatePrices[index] ?? { mrp: String(product.mrp), price: String(Math.round((product.mrp * 0.8) / 5) * 5) }; const discount = Number(prices.mrp) > 0 ? Math.round((1 - Number(prices.price) / Number(prices.mrp)) * 100) : 0; return <div key={`${product.name}-${index}`} className="grid grid-cols-[24px_minmax(0,1fr)] items-center gap-3 px-3 py-3 sm:grid-cols-[24px_minmax(0,1fr)_90px_110px_72px]"><Checkbox checked={props.selectedTemplates[index] ?? false} onCheckedChange={(checked) => props.onSelectTemplate(index, checked)} aria-label={`I sell ${product.name}`} /><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="text-[10px] text-muted-foreground">{product.category} · {product.pack}</p></div><label className="hidden text-[10px] text-muted-foreground sm:block">MRP<input aria-label={`${product.name} MRP`} disabled={!props.selectedTemplates[index]} value={prices.mrp} onChange={(event) => props.setTemplatePrice(index, "mrp", event.target.value)} type="number" min="1" className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground disabled:opacity-50" /></label><label className="hidden text-[10px] text-muted-foreground sm:block">Sale price<input aria-label={`${product.name} sale price`} disabled={!props.selectedTemplates[index]} value={prices.price} onChange={(event) => props.setTemplatePrice(index, "price", event.target.value)} type="number" min="1" className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground disabled:opacity-50" /></label><span className="hidden text-right text-xs font-semibold text-success sm:block">{discount > 0 ? `${discount}% off` : "—"}</span><div className="col-span-2 grid grid-cols-2 gap-2 sm:hidden"><Input aria-label={`${product.name} MRP`} disabled={!props.selectedTemplates[index]} value={prices.mrp} onChange={(event) => props.setTemplatePrice(index, "mrp", event.target.value)} type="number" min="1" className="h-8 text-xs disabled:opacity-50" placeholder="MRP" /><Input aria-label={`${product.name} sale price`} disabled={!props.selectedTemplates[index]} value={prices.price} onChange={(event) => props.setTemplatePrice(index, "price", event.target.value)} type="number" min="1" className="h-8 text-xs disabled:opacity-50" placeholder="Sale price" /><span className="col-span-2 text-xs font-semibold text-success">{discount > 0 ? `${discount}% discount` : "Set a discounted price"}</span></div></div>; })}</div><div className="mt-4 flex justify-end"><Button variant="festive" onClick={props.saveTemplates} disabled={!selectedCount}>Add {selectedCount || "selected"} products <ArrowRight /></Button></div></div>}

        {props.customFormOpen && <form onSubmit={addCustomProduct} className="mt-4 rounded-xl border border-primary/20 bg-card p-4 sm:p-5"><div className="flex items-center justify-between gap-3"><div><h3 className="font-display text-lg font-bold">Create a custom product</h3><p className="mt-1 text-xs text-muted-foreground">Share a cracker that’s special to your shop.</p></div><Button type="button" variant="ghost" size="icon" aria-label="Close custom product form" onClick={() => props.setCustomFormOpen(false)}><X /></Button></div><div className="mt-4 grid gap-3 sm:grid-cols-2"><Field label="Product name"><Input required maxLength={80} value={props.customName} onChange={(event) => props.setCustomName(event.target.value)} placeholder="e.g. Diwali family combo" /></Field><Field label="Category"><select aria-label="Product category" value={props.customCategory} onChange={(event) => props.setCustomCategory(event.target.value as Exclude<ProductCategory, "All">)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">{categories.filter((category) => category !== "All").map((category) => <option key={category}>{category}</option>)}</select></Field><Field label="What's in the pack?"><Input value={props.customPack} onChange={(event) => props.setCustomPack(event.target.value)} placeholder="10 pieces" /></Field><Field label="Available quantity"><Input required type="number" min="1" value={props.customStock} onChange={(event) => props.setCustomStock(event.target.value)} /></Field><Field label="MRP (₹)"><Input required type="number" min="1" value={props.customMrp} onChange={(event) => props.setCustomMrp(event.target.value)} placeholder="Original price" /></Field><Field label="Your price (₹)"><Input required type="number" min="1" value={props.customPrice} onChange={(event) => props.setCustomPrice(event.target.value)} placeholder="Discounted price" /></Field><div className="sm:col-span-2"><Field label="Description"><Textarea maxLength={240} value={props.customDescription} onChange={(event) => props.setCustomDescription(event.target.value)} placeholder="What makes this pack a favourite?" /></Field></div><div className="sm:col-span-2"><Label htmlFor="custom-product-photos" className="mb-2 block text-xs font-semibold">Photos · up to 3</Label><label htmlFor="custom-product-photos" className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-semibold"><Upload className="size-4" /> Choose photos<input id="custom-product-photos" type="file" accept="image/*" multiple className="sr-only" onChange={readCustomPhotos} /></label><div className="mt-2 flex flex-wrap gap-2">{newProductPhotos.map((photo, index) => <div key={photo} className="relative"><img src={photo} alt={`Custom product photo ${index + 1}`} className="size-16 rounded-md object-cover" /><Button type="button" size="icon" variant="secondary" className="absolute -right-1 -top-1 size-6 rounded-full" aria-label={`Remove photo ${index + 1}`} onClick={() => setNewProductPhotos((current) => current.filter((item) => item !== photo))}><X /></Button></div>)}</div></div></div><div className="mt-4 flex justify-end"><Button type="submit" variant="festive">Add to shop <Plus /></Button></div></form>}

        {products.length ? <div className="mt-4 space-y-2">{products.map((product) => <article key={product.id} className="grid grid-cols-[52px_minmax(0,1fr)] items-center gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[60px_minmax(0,1fr)_repeat(3,minmax(90px,130px))_auto]"><img src={product.image} alt="" width={60} height={60} className="size-[52px] rounded-md object-cover sm:size-[60px]" /><div className="min-w-0"><p className="truncate text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-[10px] text-muted-foreground">{product.category} · {getProductDiscount(product)}% discount</p><p className="text-[10px] text-muted-foreground">{product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}</p></div><label className="hidden text-[10px] text-muted-foreground sm:block">MRP<input aria-label={`${product.name} MRP`} type="number" min="1" value={product.mrp} onChange={(event) => updateProduct(product.id, { mrp: Number(event.target.value) || 0 })} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground" /></label><label className="hidden text-[10px] text-muted-foreground sm:block">Sale price<input aria-label={`${product.name} sale price`} type="number" min="1" max={product.mrp - 1} value={product.price} onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) || 0 })} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground" /></label><label className="hidden text-[10px] text-muted-foreground sm:block">Stock<input aria-label={`${product.name} stock`} type="number" min="0" value={product.stock} onChange={(event) => updateProduct(product.id, { stock: Number(event.target.value) || 0 })} className="mt-1 h-8 w-full rounded border border-input bg-background px-2 text-xs text-foreground" /></label><Button aria-label={`Delete ${product.name}`} variant="ghost" size="icon" className="col-start-2 h-8 w-8 justify-self-end text-muted-foreground hover:text-destructive sm:col-start-auto" onClick={() => setState((current) => ({ ...current, products: current.products.filter((item) => item.id !== product.id) }))}><Trash2 /></Button><div className="col-span-2 grid grid-cols-[1fr_1fr_auto] items-center gap-2 sm:hidden"><Input aria-label={`${product.name} sale price`} type="number" min="1" max={product.mrp - 1} value={product.price} onChange={(event) => updateProduct(product.id, { price: Number(event.target.value) || 0 })} className="h-8 text-xs" /><Input aria-label={`${product.name} stock`} type="number" min="0" value={product.stock} onChange={(event) => updateProduct(product.id, { stock: Number(event.target.value) || 0 })} className="h-8 text-xs" /><Switch checked={product.stock > 0} onCheckedChange={(checked) => updateProduct(product.id, { stock: checked ? Math.max(1, product.stock) : 0 })} aria-label={`Toggle stock for ${product.name}`} /></div><div className="hidden justify-end sm:flex"><Switch checked={product.stock > 0} onCheckedChange={(checked) => updateProduct(product.id, { stock: checked ? Math.max(1, product.stock) : 0 })} aria-label={`Toggle stock for ${product.name}`} /></div></article>)}</div> : !catalogOpen && <EmptyState icon={<PackageCheck />} title="Build your festive collection" description="Choose products from the catalogue or create a cracker pack that’s all your own." action={<Button variant="festive" onClick={() => setCatalogOpen(true)}><Plus /> Pick products</Button>} />}</TabsContent>

      <TabsContent value="profile" className="mt-6"><ProfilePanel shop={shop} onSave={props.onShopProfile} onPhoto={props.onShopPhoto} /></TabsContent>
    </Tabs></section>;
}

function ProfilePanel({ shop, onSave, onPhoto }: { shop: Shop; onSave: (patch: Partial<Shop>) => void; onPhoto: (file: File) => void }) {
  const [name, setName] = useState(shop.name);
  const [address, setAddress] = useState(shop.address);
  const [area, setArea] = useState(shop.area);
  const [phone, setPhone] = useState(shop.phone);
  const [license, setLicense] = useState(shop.license);
  const [saved, setSaved] = useState(false);
  return <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(220px,.7fr)]"><form onSubmit={(event) => { event.preventDefault(); onSave({ name, address, area, phone, license }); setSaved(true); }} className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"><div><h2 className="font-display text-xl font-bold">Your shop details</h2><p className="mt-1 text-xs text-muted-foreground">Keep your public listing current.</p></div><Field label="Shop name"><Input required value={name} onChange={(event) => setName(event.target.value)} /></Field><Field label="Full address"><Input required value={address} onChange={(event) => setAddress(event.target.value)} /></Field><div className="grid gap-3 sm:grid-cols-2"><Field label="Area"><Input required value={area} onChange={(event) => setArea(event.target.value)} /></Field><Field label="Phone number"><Input required value={phone} onChange={(event) => setPhone(event.target.value)} /></Field></div><Field label="Firecracker licence"><Input required value={license} onChange={(event) => setLicense(event.target.value)} /></Field><Button type="submit" variant="festive"><Save /> {saved ? "Saved" : "Save shop details"}</Button></form><div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5"><div><h2 className="font-display text-xl font-bold">Shop status</h2><p className="mt-1 text-xs text-muted-foreground">Choose whether you’re accepting local orders.</p></div><label className="flex items-center justify-between gap-3 rounded-lg bg-muted/60 p-3"><span className="flex items-center gap-2 text-sm font-semibold"><span className={`size-2.5 rounded-full ${shop.isOpen ? "bg-success" : "bg-muted-foreground"}`} /> {shop.isOpen ? "Open to orders" : "Closed for orders"}</span><Switch checked={shop.isOpen} onCheckedChange={(isOpen) => onSave({ isOpen })} aria-label="Open or close your shop" /></label><div><Label htmlFor="profile-photo" className="mb-2 block text-xs font-semibold">Shop photo</Label><img src={shop.photo} alt={`${shop.name} storefront`} className="h-32 w-full rounded-lg object-cover" /><label htmlFor="profile-photo" className="mt-3 flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md border border-border text-xs font-semibold"><Upload className="size-4" /> Replace photo<input id="profile-photo" type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) onPhoto(file); event.currentTarget.value = ""; }} /></label></div><p className="flex items-start gap-2 text-xs leading-5 text-muted-foreground"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-success" /> {shop.status === "Approved" ? `Licence ${shop.license} · approved demo listing` : "Your licence and shop details are awaiting approval."}</p></div></div>;
}

function EmptyState({ icon, title, description, action }: { icon: React.ReactNode; title: string; description: string; action: React.ReactNode }) {
  return <div className="grid justify-items-center rounded-xl border border-dashed border-border px-5 py-12 text-center"><span className="grid size-12 place-items-center rounded-full bg-muted text-primary">{icon}</span><h3 className="mt-3 font-display text-lg font-bold">{title}</h3><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{description}</p><div className="mt-4">{action}</div></div>;
}