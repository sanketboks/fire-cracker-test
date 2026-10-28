import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowDownUp, ArrowRight, ArrowUpRight, BadgeCheck, Flame, LocateFixed, MapPin, Search, ShieldCheck, SlidersHorizontal, Sparkles, Star, Store } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarketplace } from "@/lib/marketplace-context";
import { getShopDiscount, type Shop } from "@/lib/marketplace";
import marketImage from "@/assets/firecracker-market.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Find Local Firecracker Shops | Firework Lane" },
      { name: "description", content: "Find licensed firecracker shops nearby, compare local discounts, and order for pickup." },
      { property: "og:title", content: "Find Local Firecracker Shops | Firework Lane" },
      { property: "og:description", content: "Discover nearby licensed festive shops and local offers." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketplaceHome,
});

function MarketplaceHome() {
  const navigate = useNavigate();
  const { state } = useMarketplace();
  const [locationInput, setLocationInput] = useState("");
  const [location, setLocation] = useState("");
  const [maxDistance, setMaxDistance] = useState("10");
  const [minimumDiscount, setMinimumDiscount] = useState("0");
  const [sortBy, setSortBy] = useState("nearest");
  const [locationNotice, setLocationNotice] = useState("");

  const shops = useMemo(() => {
    const normalizedLocation = location.trim().toLocaleLowerCase();
    const candidates = state.shops
      .filter((shop) => shop.status === "Approved")
      .filter((shop) => shop.distanceKm <= Number(maxDistance))
      .filter((shop) => getShopDiscount(shop.id, state.products) >= Number(minimumDiscount))
      .filter((shop) => !normalizedLocation || [shop.area, shop.address, shop.pincode, shop.name].some((value) => value.toLocaleLowerCase().includes(normalizedLocation)));
    return candidates.sort((first, second) => sortBy === "discount"
      ? getShopDiscount(second.id, state.products) - getShopDiscount(first.id, state.products)
      : first.distanceKm - second.distanceKm);
  }, [location, maxDistance, minimumDiscount, sortBy, state.products, state.shops]);

  const useCurrentLocation = () => {
    setLocationInput("Sivakasi");
    setLocation("Sivakasi");
    setLocationNotice("Showing sample shops near Sivakasi");
    void navigate({ to: "/shops", search: { location: "Sivakasi" } });
  };

  const submitLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = locationInput.trim();
    if (!value) {
      setLocationNotice("Enter an area or PIN code to find shops.");
      return;
    }
    setLocation(value);
    setLocationNotice(`Showing sample shops near ${value}`);
    void navigate({ to: "/shops", search: { location: value } });
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:h-[72px] sm:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label="Firework Lane home">
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-5" /></span>
            <span className="min-w-0"><span className="block truncate font-display text-lg font-bold leading-none text-foreground sm:text-xl">Firework Lane</span><span className="mt-1 block text-[10px] font-semibold uppercase text-muted-foreground">Local festive shops</span></span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-border p-1">
            <Button size="sm" variant="secondary" className="h-8 rounded-full px-3 text-xs">Customer</Button>
            <Button asChild size="sm" variant="ghost" className="h-8 rounded-full px-2 text-xs sm:px-3"><Link to="/seller">Shopkeeper</Link></Button>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-8 px-4 pb-10 pt-8 sm:px-8 sm:pb-16 sm:pt-12 lg:grid-cols-[1.02fr_.98fr] lg:gap-12">
        <div className="order-2 lg:order-1">
          <div className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-primary"><span className="grid size-7 place-items-center rounded-full bg-accent"><MapPin className="size-4" /></span> Your local firecracker guide</div>
          <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.08] text-foreground sm:text-6xl">Find your festive favourites, <span className="text-primary">closer.</span></h1>
          <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">Compare licensed shops, find the right offers and put together a celebration that feels like yours.</p>

          <form onSubmit={submitLocation} className="mt-7 grid gap-2 rounded-xl border border-border bg-card p-2 shadow-[var(--shadow-card)] sm:grid-cols-[minmax(0,1fr)_auto]">
            <div className="flex min-w-0 items-center gap-3 px-2">
              <MapPin className="size-5 shrink-0 text-primary" aria-hidden="true" />
              <Input aria-label="Area or PIN code" value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="Enter area or PIN code" className="h-12 min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" />
            </div>
            <Button type="submit" variant="festive" className="h-12 px-5"><Search className="size-4" /> Find shops</Button>
          </form>
          <Button variant="ghost" className="mt-2 h-10 px-2 text-sm text-muted-foreground" onClick={useCurrentLocation}><LocateFixed className="size-4" /> Use my current location</Button>
          {locationNotice && <p role="status" className="mt-1 text-xs font-medium text-primary">{locationNotice}</p>}
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><ShieldCheck className="size-4 text-success" /> Licensed sellers</span><span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-success" /> Local offers</span><span className="inline-flex items-center gap-1.5"><Store className="size-4 text-success" /> Easy pickup</span></div>
        </div>

        <div className="relative order-1 h-56 overflow-hidden rounded-xl border border-border sm:h-80 lg:order-2 lg:h-[390px]">
          <img src={marketImage} alt="A local fireworks shop decorated for the festive season" width={1536} height={1024} fetchPriority="high" className="h-full w-full object-cover object-center" />
          <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-2 rounded-lg bg-card/95 p-3 shadow-[var(--shadow-card)] backdrop-blur-sm sm:inset-x-5 sm:bottom-5 sm:p-4">
            <div className="flex min-w-0 items-center gap-2.5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent text-primary"><Flame className="size-4" /></span><div className="min-w-0"><p className="truncate text-sm font-bold">Your neighbourhood, lit up</p><p className="text-xs text-muted-foreground">Shops for every kind of celebration</p></div></div>
            <span className="shrink-0 rounded-md bg-success/10 px-2.5 py-1.5 text-xs font-bold text-success">{state.shops.filter((shop) => shop.status === "Approved").length} nearby</span>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card" aria-label="How it works">
        <div className="mx-auto grid max-w-7xl grid-cols-3 gap-3 px-4 py-5 sm:px-8 sm:py-6">
          {[["01", "Enter your area"], ["02", "Pick a licensed shop"], ["03", "Order for pickup"]].map(([number, label]) => <div key={number} className="flex items-center gap-2.5 sm:gap-3.5"><span className="font-display text-lg font-bold text-primary sm:text-2xl">{number}</span><span className="text-[11px] font-semibold leading-4 text-foreground sm:text-sm">{label}</span></div>)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-9 sm:px-8 sm:py-12" aria-labelledby="shops-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div><p className="text-xs font-bold uppercase text-primary">Independent shops · locally loved</p><h2 id="shops-heading" className="mt-1 font-display text-2xl font-bold text-foreground sm:text-3xl">Find your favourite nearby</h2></div>
          {location ? <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-foreground"><MapPin className="size-3.5 text-primary" /> {location}</span> : <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">Enter a location to see shops</span>}
        </div>

        {location ? <>
          <div className="sticky top-16 z-20 -mx-4 mt-5 border-y border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-6 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 sm:flex-wrap">
              <span className="mr-1 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground"><SlidersHorizontal className="size-3.5" /> Filter</span>
              <Select value={maxDistance} onValueChange={setMaxDistance}><SelectTrigger aria-label="Maximum distance" className="h-9 w-[120px] shrink-0 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Within 1 km</SelectItem><SelectItem value="3">Within 3 km</SelectItem><SelectItem value="5">Within 5 km</SelectItem><SelectItem value="10">Within 10 km</SelectItem></SelectContent></Select>
              <Select value={minimumDiscount} onValueChange={setMinimumDiscount}><SelectTrigger aria-label="Minimum discount" className="h-9 w-[132px] shrink-0 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Any offer</SelectItem><SelectItem value="10">10% or more</SelectItem><SelectItem value="20">20% or more</SelectItem><SelectItem value="30">30% or more</SelectItem><SelectItem value="40">40% or more</SelectItem></SelectContent></Select>
              <Select value={sortBy} onValueChange={setSortBy}><SelectTrigger aria-label="Sort shops" className="h-9 w-[138px] shrink-0 bg-card text-xs"><ArrowDownUp className="mr-1 size-3.5 shrink-0" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nearest">Nearest first</SelectItem><SelectItem value="discount">Best offers</SelectItem></SelectContent></Select>
              <span className="ml-auto shrink-0 text-xs text-muted-foreground">{shops.length} {shops.length === 1 ? "shop" : "shops"}</span>
            </div>
          </div>

          {shops.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shops.map((shop, index) => <ShopCard key={shop.id} shop={shop} discount={getShopDiscount(shop.id, state.products)} index={index} />)}
          </div> : <div className="mt-5 grid justify-items-center rounded-xl border border-dashed border-border px-6 py-12 text-center"><span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Search className="size-5" /></span><h3 className="mt-3 font-bold">No shops match these filters</h3><p className="mt-1 text-sm text-muted-foreground">Try widening your distance or lowering the minimum offer.</p><Button variant="outline" className="mt-4" onClick={() => { setMaxDistance("10"); setMinimumDiscount("0"); }}>Reset filters</Button></div>}
        </> : <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-label="Shop previews">
          {state.shops.filter((shop) => shop.status === "Approved").slice(0, 3).map((shop, index) => <ShopCard key={shop.id} shop={shop} discount={getShopDiscount(shop.id, state.products)} index={index} preview />)}
        </div>}
      </section>

      <footer className="border-t border-border bg-navy text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link to="/" className="font-display text-lg font-bold">Firework Lane</Link><p className="max-w-2xl text-xs leading-5 text-primary-foreground/75">Sale and use of firecrackers are subject to local laws and regulations. Only licensed sellers may list products.</p></div></footer>
    </main>
  );
}

function ShopCard({ shop, discount, index, preview = false }: { shop: Shop; discount: number; index: number; preview?: boolean }) {
  return (
    <article className="rise-in group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-[var(--shadow-card)]">
      <Link to="/shops/$shopSlug" params={{ shopSlug: shop.slug }} search={{ location: "" }} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
        <div className="relative h-40 overflow-hidden bg-muted sm:h-44"><img src={shop.photo} alt={`${shop.name} storefront`} width={1536} height={1024} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 rounded-md bg-success px-2.5 py-1.5 text-xs font-bold text-success-foreground">Up to {discount}% off</span><span className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-semibold ${shop.isOpen ? "bg-card text-success" : "bg-foreground/85 text-background"}`}>{shop.isOpen ? "Open" : "Closed"}</span></div>
        <div className="p-4 sm:p-5"><div className="flex items-start justify-between gap-2"><h3 className="font-display text-lg font-bold leading-tight text-foreground">{shop.name}</h3><ArrowUpRight className="mt-0.5 size-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" /></div><p className="mt-2 flex items-start gap-1.5 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" /> <span>{shop.address}</span></p><div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3"><span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground"><Star className="size-3.5 fill-secondary text-secondary-foreground" /> {shop.rating} <span className="font-normal text-muted-foreground">({shop.reviews} reviews)</span></span><span className="text-xs font-medium text-muted-foreground">{shop.distanceKm.toFixed(1)} km away</span></div>{preview && <span className="sr-only">Enter an area or PIN code to search nearby shops.</span>}</div>
      </Link>
      <div className="px-4 pb-4 sm:px-5 sm:pb-5"><Button asChild variant="festiveOutline" className="h-10 w-full justify-between"><Link to="/shops/$shopSlug" params={{ shopSlug: shop.slug }} search={{ location: "" }}>View shop <ArrowRight /></Link></Button></div>
    </article>
  );
}