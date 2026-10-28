import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, ChevronRight, Clock3, Flame, MapPin, Minus, Navigation, Phone, Plus, Search, ShoppingBag, Sparkles, Star, X } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useMarketplace } from "@/lib/marketplace-context";
import { addShopCartQuantity, calculateOrderTotals, categories, createPickupCode, getDirectionsUrl, getProductDiscount, PICKUP_HOLD_HOURS, type DemoOrder, type Shop, type Product, type ProductCategory } from "@/lib/marketplace";

const PRICE_NOTE = "Prices are indicative. Final price and availability confirmed at the shop. Payment is made at the shop.";
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

export const Route = createFileRoute("/shops/$shopSlug")({
  validateSearch: (search: Record<string, unknown>) => ({
    location: typeof search["location"] === "string" ? search["location"] : "",
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${formatShopTitle(params.shopSlug)} | Firework Lane` },
      { name: "description", content: `Discover festive firecracker offers and shop for pickup at ${formatShopTitle(params.shopSlug)}.` },
      { property: "og:title", content: `${formatShopTitle(params.shopSlug)} | Firework Lane` },
      { property: "og:description", content: "Compare festive prices from your local licensed fireworks shop." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ShopStorefront,
});

function formatShopTitle(slug: string) {
  return slug.split("-").filter(Boolean).map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`).join(" ");
}

function ShopStorefront() {
  const { shopSlug } = Route.useParams();
  const { location: returnLocation } = Route.useSearch();
  const { state, setState } = useMarketplace();
  const shop = state.shops.find((item) => item.slug === shopSlug);
  const [category, setCategory] = useState<ProductCategory>("All");
  const [search, setSearch] = useState("");
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOrder, setSuccessOrder] = useState<DemoOrder | null>(null);
  const [shopConflictOpen, setShopConflictOpen] = useState(false);
  const [replaceCartOpen, setReplaceCartOpen] = useState(false);
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  const shopProducts = useMemo(() => {
    if (!shop) return [];
    return state.products.filter((product) => product.shopId === shop.id && product.stock > 0);
  }, [shop, state.products]);
  const products = shopProducts.filter((product) => (category === "All" || product.category === category) && product.name.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  const cartProducts = state.products.filter((product) => product.shopId === state.cartShopId && (state.cart[product.id] ?? 0) > 0);
  const itemCount = Object.values(state.cart).reduce((sum, quantity) => sum + quantity, 0);
  const lines = cartProducts.map((product) => ({ productId: product.id, name: product.name, quantity: state.cart[product.id] ?? 0, mrp: product.mrp, price: product.price }));
  const totals = calculateOrderTotals(lines);

  const addProduct = (productId: string) => {
    if (!shop) return;
    const product = shopProducts.find((item) => item.id === productId);
    if (!product || (state.cart[productId] ?? 0) >= product.stock) {
      toast.error("That’s all the available stock for now.");
      return;
    }
    const result = addShopCartQuantity(state.cart, state.cartShopId, shop.id, productId);
    if (result.status === "shop-conflict") {
      setPendingProductId(productId);
      setShopConflictOpen(true);
      return;
    }
    setState((current) => ({ ...current, cartShopId: shop.id, cart: result.cart }));
    toast.success("Added to your basket");
  };

  const changeQuantity = (productId: string, change: number) => {
    setState((current) => {
      const next = Math.max(0, (current.cart[productId] ?? 0) + change);
      const cart = { ...current.cart };
      if (next === 0) delete cart[productId];
      else cart[productId] = next;
      return { ...current, cartShopId: Object.values(cart).some((quantity) => quantity > 0) ? current.cartShopId : null, cart };
    });
  };

  if (!shop) {
    return <main className="grid min-h-screen place-items-center bg-background px-5 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-primary"><Flame /></span><h1 className="mt-4 font-display text-2xl font-bold">We couldn't find that shop</h1><p className="mt-2 text-sm text-muted-foreground">Try searching for a different shop near you.</p><Button asChild variant="festive" className="mt-5"><Link to="/">Browse local shops</Link></Button></div></main>;
  }

  return (
    <main className="min-h-screen bg-background pb-28">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-8"><Button asChild size="icon" variant="ghost" className="size-10" aria-label="Back to nearby shops"><Link to="/shops" search={{ location: returnLocation }}><ArrowLeft /></Link></Button><Link to="/" className="font-display text-lg font-bold">Firework Lane</Link><Button variant="outline" size="icon" className="relative size-10" onClick={() => setCartOpen(true)} aria-label={`Open cart with ${itemCount} items`}><ShoppingBag />{itemCount > 0 && <span className="absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">{itemCount}</span>}</Button></div></header>

      <section className="relative overflow-hidden border-b border-border bg-card"><div className="relative mx-auto min-h-[240px] max-w-7xl sm:min-h-[320px]"><img src={shop.photo} alt={`${shop.name} local fireworks store`} width={1536} height={1024} className="absolute inset-0 size-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent" /><div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-6 pt-16 text-primary-foreground sm:px-8 sm:pb-8"><p className="inline-flex items-center gap-1.5 text-xs font-semibold"><Link to="/" className="hover:underline">Nearby shops</Link><ChevronRight className="size-3" /> Storefront</p><h1 className="mt-3 font-display text-3xl font-bold leading-tight sm:text-5xl">{shop.name}</h1><div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs sm:text-sm"><span className="inline-flex items-center gap-1"><MapPin className="size-4" /> {shop.address}</span><span className="inline-flex items-center gap-1"><Star className="size-4 fill-secondary text-secondary" /> {shop.rating} ({shop.reviews})</span><span className="inline-flex items-center gap-1"><Clock3 className="size-4" /> {shop.isOpen ? "Open now" : "Closed today"}</span></div></div><span className="absolute right-4 top-4 rounded-md bg-success px-3 py-1.5 text-xs font-bold text-success-foreground">Licensed seller</span></div></section>

      <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-8 sm:pt-8"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-primary">Choose your celebration</p><h2 className="mt-1 font-display text-2xl font-bold sm:text-3xl">The festive collection</h2><p className="mt-1 text-xs text-muted-foreground">Local pickup · Prices and availability from {shop.area}</p></div><div className="relative w-full sm:max-w-xs"><Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input aria-label="Search products" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the shop" className="h-10 pl-9" /></div></div>

        <div className="sticky top-16 z-20 -mx-4 mt-5 border-y border-border bg-background/95 px-4 py-2.5 backdrop-blur-md sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"><div className="flex gap-2 overflow-x-auto">{categories.map((item) => <Button key={item} size="sm" variant={category === item ? "festive" : "outline"} className="h-9 shrink-0 px-3 text-xs" onClick={() => setCategory(item)}>{item}</Button>)}</div></div>

          {products.length ? <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">{products.map((product, index) => <ProductCard key={product.id} product={product} quantity={state.cart[product.id] ?? 0} onAdd={() => addProduct(product.id)} onChange={(change) => changeQuantity(product.id, change)} index={index} />)}</div> : <div className="grid justify-items-center px-5 py-16 text-center"><span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Search /></span><p className="mt-3 font-semibold">No matching crackers found</p><p className="mt-1 text-sm text-muted-foreground">Try another category or search.</p><Button variant="outline" className="mt-4" onClick={() => { setCategory("All"); setSearch(""); }}>Show everything</Button></div>}
      </section>

      {itemCount > 0 && <div className="fixed inset-x-3 bottom-3 z-40 sm:inset-x-auto sm:right-8 sm:w-[380px]"><Button variant="festive" className="h-14 w-full justify-between px-5 shadow-lg" onClick={() => setCartOpen(true)}><span className="inline-flex items-center gap-2"><ShoppingBag className="size-4" /> {itemCount} {itemCount === 1 ? "item" : "items"}</span><span>View basket · {money.format(totals.total)}</span></Button></div>}

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} products={cartProducts} cart={state.cart} totals={totals} onChange={changeQuantity} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true); }} />
      <CheckoutDialog open={checkoutOpen} onOpenChange={setCheckoutOpen} shopId={shop.id} shopName={shop.name} lines={lines} totals={totals} onOrdered={(order) => { setSuccessOrder(order); setCheckoutOpen(false); setState((current) => ({ ...current, orders: [order, ...current.orders], cartShopId: null, cart: {} })); }} />
      <OrderSuccess order={successOrder} shop={shop} onClose={() => setSuccessOrder(null)} />
      <Dialog open={shopConflictOpen} onOpenChange={setShopConflictOpen}><DialogContent className="max-w-sm"><DialogHeader><DialogTitle>One shop per basket</DialogTitle><DialogDescription>Your basket has products from another shop. Would you like to replace it with this shop's items?</DialogDescription></DialogHeader><DialogFooter><Button variant="outline" onClick={() => { setPendingProductId(null); setShopConflictOpen(false); }}>Keep my basket</Button><Button variant="festive" onClick={() => { if (pendingProductId && shop) setState((current) => ({ ...current, cartShopId: shop.id, cart: { [pendingProductId]: 1 } })); setPendingProductId(null); setShopConflictOpen(false); setCartOpen(false); toast.success("Your basket is now from this shop"); }}>Start a new basket</Button></DialogFooter></DialogContent></Dialog>
    </main>
  );
}

function ProductCard({ product, quantity, onAdd, onChange, index }: { product: Product; quantity: number; onAdd: () => void; onChange: (change: number) => void; index: number }) {
  const discount = getProductDiscount(product);
  return <article className="rise-in flex min-w-0 flex-col overflow-hidden rounded-lg border border-border bg-card"><div className="relative aspect-square overflow-hidden bg-muted"><img src={product.image} alt={product.name} width={768} height={768} loading="lazy" className="size-full object-cover transition-transform duration-300 hover:scale-[1.03]" /><span className="absolute left-2 top-2 rounded-md bg-success px-2 py-1 text-[10px] font-bold text-success-foreground">{discount}% off</span><span className="absolute right-2 top-2 rounded-md bg-card/90 px-2 py-1 text-[10px] font-medium text-foreground">{product.stock} left</span></div><div className="flex flex-1 flex-col p-3 sm:p-4"><p className="text-[10px] font-semibold uppercase text-muted-foreground">{product.pack} · {product.category}</p><h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-bold leading-5 text-foreground">{product.name}</h3><p className="mt-1 line-clamp-2 text-xs leading-4 text-muted-foreground">{product.description}</p><div className="mt-auto pt-3"><div className="flex flex-wrap items-baseline gap-x-2"><span className="text-lg font-extrabold text-foreground">{money.format(product.price)}</span><span className="text-xs text-muted-foreground line-through">{money.format(product.mrp)}</span></div>{quantity > 0 ? <QuantityControl quantity={quantity} onMinus={() => onChange(-1)} onPlus={() => onChange(1)} /> : <Button variant="festive" className="mt-3 h-10 w-full" onClick={onAdd}><Plus /> Add</Button>}</div></div></article>;
}

function QuantityControl({ quantity, onMinus, onPlus }: { quantity: number; onMinus: () => void; onPlus: () => void }) {
  return <div className="mt-3 grid h-10 grid-cols-[2.5rem_1fr_2.5rem] overflow-hidden rounded-md border border-primary/50"><Button variant="ghost" size="icon" className="h-10 w-10 rounded-none text-primary" onClick={onMinus} aria-label="Decrease quantity"><Minus /></Button><span className="grid place-items-center border-x border-primary/30 text-sm font-bold" aria-live="polite">{quantity}</span><Button variant="ghost" size="icon" className="h-10 w-10 rounded-none text-primary" onClick={onPlus} aria-label="Increase quantity"><Plus /></Button></div>;
}

function CartSheet({ open, onOpenChange, products, cart, totals, onChange, onCheckout }: { open: boolean; onOpenChange: (open: boolean) => void; products: Product[]; cart: Record<string, number>; totals: { subtotal: number; savings: number; total: number }; onChange: (productId: string, change: number) => void; onCheckout: () => void }) {
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="flex w-[min(94vw,430px)] flex-col p-0"><SheetHeader className="border-b border-border px-5 py-5 text-left"><SheetTitle className="font-display text-2xl">Your basket</SheetTitle><SheetDescription>{products.length ? "One shop · local pickup" : "Choose a favourite to get started"}</SheetDescription></SheetHeader>{products.length === 0 ? <div className="grid flex-1 place-items-center px-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-full bg-muted text-primary"><ShoppingBag /></span><p className="mt-4 font-bold">Your basket is empty</p><p className="mt-1 text-sm text-muted-foreground">Add a festive favourite from this shop.</p><Button variant="festive" className="mt-5" onClick={() => onOpenChange(false)}>Browse products</Button></div></div> : <><div className="flex-1 overflow-y-auto px-5 py-3">{products.map((product) => <div key={product.id} className="flex gap-3 border-b border-border py-4"><img src={product.image} alt="" width={72} height={72} className="size-[68px] rounded-md object-cover" /><div className="min-w-0 flex-1"><p className="font-bold leading-5">{product.name}</p><p className="mt-1 text-sm font-semibold text-primary">{money.format(product.price)}</p><div className="mt-2 flex items-center gap-2"><Button variant="outline" size="icon" className="size-8" onClick={() => onChange(product.id, -1)} aria-label={`Decrease ${product.name}`}><Minus /></Button><span className="w-5 text-center text-sm font-bold">{cart[product.id]}</span><Button variant="outline" size="icon" className="size-8" onClick={() => onChange(product.id, 1)} aria-label={`Increase ${product.name}`}><Plus /></Button></div></div><span className="text-sm font-bold">{money.format(product.price * (cart[product.id] ?? 0))}</span></div>)}</div><div className="border-t border-border bg-muted/50 p-5"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal</span><span className="font-semibold">{money.format(totals.subtotal)}</span></div><div className="mt-2 flex justify-between text-sm"><span className="text-success">You saved</span><span className="font-semibold text-success">−{money.format(totals.savings)}</span></div><div className="mt-3 flex items-baseline justify-between border-t border-border pt-3"><span className="font-bold">Total</span><strong className="font-display text-2xl text-primary">{money.format(totals.total)}</strong></div><Button variant="festive" className="mt-4 h-12 w-full" onClick={onCheckout}>Continue to reserve <ChevronRight /></Button><p className="mt-2 text-center text-xs text-muted-foreground">{PRICE_NOTE}</p></div></>}</SheetContent></Sheet>;
}

function CheckoutDialog({ open, onOpenChange, shopId, shopName, lines, totals, onOrdered }: { open: boolean; onOpenChange: (open: boolean) => void; shopId: string; shopName: string; lines: DemoOrder["lines"]; totals: { subtotal: number; savings: number; total: number }; onOrdered: (order: DemoOrder) => void }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const ready = customerName.trim().length >= 2 && /^[0-9]{8,16}$/.test(phone.trim());

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const order: DemoOrder = { id: `FL-${Date.now().toString().slice(-7)}`, shopId, customerName: customerName.trim(), phone: phone.trim(), pickupCode: createPickupCode(), status: "New", lines, ...totals, placedAt: new Date().toISOString() };
    onOrdered(order);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Reserve at {shopName}</DialogTitle>
          <DialogDescription>Pickup reservation · {lines.reduce((sum, line) => sum + line.quantity, 0)} items · {money.format(totals.total)}</DialogDescription>
        </DialogHeader>
        <form onSubmit={placeOrder} className="space-y-4">
          <label className="block text-sm font-medium">Your name<Input required minLength={2} autoComplete="name" value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="mt-2 h-11" placeholder="Enter your name" /></label>
          <label className="block text-sm font-medium">Phone number<Input required type="tel" inputMode="numeric" pattern="[0-9]{8,16}" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className="mt-2 h-11" placeholder="Enter your phone number" /></label>
          <p className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">{PRICE_NOTE}</p>
          <div className="flex items-center justify-between border-t border-border pt-3 text-sm"><span className="font-semibold">Estimated total</span><strong className="text-lg text-primary">{money.format(totals.total)}</strong></div>
          {ready && <Button type="submit" variant="festive" className="h-12 w-full"><Check /> Reserve &amp; Pick Up</Button>}
        </form>
      </DialogContent>
    </Dialog>
  );
}

function OrderSuccess({ order, shop, onClose }: { order: DemoOrder | null; shop: Shop; onClose: () => void }) {
  return <Dialog open={!!order} onOpenChange={(open) => { if (!open) onClose(); }}><DialogContent className="max-h-[90vh] max-w-sm overflow-y-auto text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-success/10 text-success"><Check className="size-7" /></div><DialogHeader className="text-center"><DialogTitle className="font-display text-2xl">Reserved for pickup!</DialogTitle><DialogDescription>Order {order?.id}</DialogDescription></DialogHeader>{order && <div className="space-y-3 text-left text-sm"><div className="rounded-lg border-2 border-dashed border-primary/50 p-4 text-center"><p className="text-xs font-semibold uppercase text-muted-foreground">Pickup code</p><p className="mt-1 font-display text-3xl font-extrabold tracking-[0.25em] text-primary">{order.pickupCode}</p><p className="mt-1 text-xs text-muted-foreground">Show this code at the counter</p></div><div className="rounded-lg bg-muted p-4"><p className="font-semibold">{shop.name}</p><p className="mt-2 flex gap-2 text-xs text-muted-foreground"><MapPin className="size-4 shrink-0 text-primary" />{shop.address}, {shop.pincode}</p><a href={`tel:${shop.phone.replace(/\s/g, "")}`} className="mt-2 flex gap-2 text-xs font-medium text-foreground"><Phone className="size-4 shrink-0 text-primary" />{shop.phone}</a><Button asChild variant="festiveOutline" className="mt-3 h-10 w-full"><a href={getDirectionsUrl(shop)} target="_blank" rel="noreferrer"><Navigation /> Get directions</a></Button></div><p className="flex gap-2 rounded-lg bg-accent p-3 text-xs text-accent-foreground"><Clock3 className="size-4 shrink-0" />Your items are held for {PICKUP_HOLD_HOURS} hours. Payment is made at the shop.</p><div className="flex justify-between border-t border-border pt-3"><span>Estimated total</span><strong>{money.format(order.total)}</strong></div></div>}<DialogFooter className="sm:justify-center"><Button variant="festive" onClick={onClose}>Done</Button></DialogFooter></DialogContent></Dialog>;
}
