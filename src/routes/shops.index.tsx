import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowDownUp, ArrowLeft, ArrowRight, BadgeCheck, Flame, MapPin, Search, ShieldCheck, SlidersHorizontal, Star, Store } from "lucide-react";
import { useMemo, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMarketplace } from "@/lib/marketplace-context";
import { getShopDiscount, type Shop } from "@/lib/marketplace";

export const Route = createFileRoute("/shops/")({
  validateSearch: (search: Record<string, unknown>) => ({
    location: typeof search["location"] === "string" ? search["location"] : "",
  }),
  head: () => ({
    meta: [
      { title: "Nearby Firecracker Shops | Firework Lane" },
      { name: "description", content: "Browse licensed firecracker shops by area, distance and local discounts." },
      { property: "og:title", content: "Nearby Firecracker Shops | Firework Lane" },
      { property: "og:description", content: "Compare local firecracker shop offers and pick your favourite." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NearbyShops,
});

function NearbyShops() {
  const { location: queryLocation } = Route.useSearch();
  const { state } = useMarketplace();
  const [locationInput, setLocationInput] = useState(queryLocation);
  const [location, setLocation] = useState(queryLocation);
  const [maxDistance, setMaxDistance] = useState("10");
  const [minimumDiscount, setMinimumDiscount] = useState("0");
  const [sortBy, setSortBy] = useState("nearest");
  const [notice, setNotice] = useState("");

  const shops = useMemo(() => {
    const term = location.trim().toLocaleLowerCase();
    return state.shops.filter((shop) => shop.status === "Approved")
      .filter((shop) => shop.distanceKm <= Number(maxDistance))
      .filter((shop) => getShopDiscount(shop.id, state.products) >= Number(minimumDiscount))
      .filter((shop) => !term || [shop.area, shop.address, shop.pincode, shop.name].some((value) => value.toLocaleLowerCase().includes(term)))
      .sort((first, second) => sortBy === "discount" ? getShopDiscount(second.id, state.products) - getShopDiscount(first.id, state.products) : first.distanceKm - second.distanceKm);
  }, [location, maxDistance, minimumDiscount, sortBy, state.products, state.shops]);

  const submitLocation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = locationInput.trim();
    if (!value) { setNotice("Enter an area or PIN code to find shops."); return; }
    setLocation(value);
    setNotice("");
  };

  return <main className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-md"><div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-8"><Link to="/" className="flex items-center gap-2.5"><span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground"><Flame className="size-5" /></span><span className="font-display text-lg font-bold">Firework Lane</span></Link><Button asChild variant="ghost" size="sm"><Link to="/seller">I'm a Shopkeeper <Store /></Link></Button></div></header>
    <section className="mx-auto max-w-7xl px-4 pb-12 pt-6 sm:px-8 sm:pb-16 sm:pt-10">
      <Button asChild variant="ghost" className="mb-4 h-9 px-2 text-xs text-muted-foreground"><Link to="/"><ArrowLeft /> Back to home</Link></Button>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="inline-flex items-center gap-1.5 text-xs font-bold uppercase text-primary"><ShieldCheck className="size-4" /> Licensed shops · local pickup</p><h1 className="mt-2 font-display text-3xl font-bold sm:text-5xl">Nearby shops</h1><p className="mt-2 text-sm text-muted-foreground">Find local favourites and compare their festive offers.</p></div>{location && <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold"><MapPin className="size-3.5 text-primary" /> {location}</span>}</div>
      <form onSubmit={submitLocation} className="mt-6 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]"><div className="flex min-w-0 items-center gap-3 rounded-lg border border-border bg-card px-3"><MapPin className="size-4 shrink-0 text-primary" /><Input aria-label="Area or PIN code" value={locationInput} onChange={(event) => setLocationInput(event.target.value)} placeholder="Area or PIN code" className="h-11 min-w-0 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0" /></div><Button type="submit" variant="festive" className="h-11"><Search /> Search shops</Button></form>
      {notice && <p role="status" className="mt-2 text-xs font-medium text-destructive">{notice}</p>}
      <div className="sticky top-16 z-20 -mx-4 mt-5 border-y border-border bg-background/95 px-4 py-3 backdrop-blur-md sm:static sm:mx-0 sm:mt-7 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"><div className="flex items-center gap-2 overflow-x-auto"><span className="mr-1 inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground"><SlidersHorizontal className="size-3.5" /> Filter</span><Select value={maxDistance} onValueChange={setMaxDistance}><SelectTrigger aria-label="Maximum distance" className="h-9 w-[120px] shrink-0 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1">Within 1 km</SelectItem><SelectItem value="3">Within 3 km</SelectItem><SelectItem value="5">Within 5 km</SelectItem><SelectItem value="10">Within 10 km</SelectItem></SelectContent></Select><Select value={minimumDiscount} onValueChange={setMinimumDiscount}><SelectTrigger aria-label="Minimum discount" className="h-9 w-[132px] shrink-0 bg-card text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0">Any offer</SelectItem><SelectItem value="10">10% or more</SelectItem><SelectItem value="20">20% or more</SelectItem><SelectItem value="30">30% or more</SelectItem><SelectItem value="40">40% or more</SelectItem></SelectContent></Select><Select value={sortBy} onValueChange={setSortBy}><SelectTrigger aria-label="Sort shops" className="h-9 w-[138px] shrink-0 bg-card text-xs"><ArrowDownUp className="mr-1 size-3.5 shrink-0" /><SelectValue /></SelectTrigger><SelectContent><SelectItem value="nearest">Nearest first</SelectItem><SelectItem value="discount">Best offers</SelectItem></SelectContent></Select><span className="ml-auto shrink-0 text-xs text-muted-foreground">{shops.length} shops</span></div></div>
      {!location && <p className="mt-7 rounded-lg bg-accent/50 px-4 py-3 text-sm text-accent-foreground">Search by area or PIN code to narrow down your neighbourhood.</p>}
      {shops.length ? <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{shops.map((shop, index) => <NearbyShopCard key={shop.id} shop={shop} discount={getShopDiscount(shop.id, state.products)} index={index} location={location} />)}</div> : <div className="mt-6 grid justify-items-center rounded-xl border border-dashed border-border px-5 py-14 text-center"><span className="grid size-12 place-items-center rounded-full bg-muted text-muted-foreground"><Search /></span><h2 className="mt-3 font-display text-lg font-bold">No shops match these filters</h2><p className="mt-1 text-sm text-muted-foreground">Try another area or widen your distance.</p><Button variant="outline" className="mt-4" onClick={() => { setLocation(""); setLocationInput(""); setMaxDistance("10"); setMinimumDiscount("0"); }}>Show all nearby shops</Button></div>}
    </section>
    <footer className="border-t border-border bg-navy text-primary-foreground"><div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"><Link to="/" className="font-display text-lg font-bold">Firework Lane</Link><p className="max-w-2xl text-xs leading-5 text-primary-foreground/75">Sale and use of firecrackers are subject to local laws and regulations. Only licensed sellers may list products.</p></div></footer>
  </main>;
}

function NearbyShopCard({ shop, discount, index, location }: { shop: Shop; discount: number; index: number; location: string }) {
  return <article className="rise-in group overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-[var(--shadow-card)]"><Link to="/shops/$shopSlug" params={{ shopSlug: shop.slug }} search={{ location }} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><div className="relative h-40 overflow-hidden bg-muted sm:h-44"><img src={shop.photo} alt={`${shop.name} storefront`} width={1536} height={1024} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" /><span className="absolute left-3 top-3 rounded-md bg-success px-2.5 py-1.5 text-xs font-bold text-success-foreground">Up to {discount}% off</span><span className={`absolute right-3 top-3 rounded-md px-2 py-1 text-[10px] font-semibold ${shop.isOpen ? "bg-card text-success" : "bg-foreground/85 text-background"}`}>{shop.isOpen ? "Open" : "Closed"}</span></div><div className="p-4 sm:p-5"><h2 className="font-display text-lg font-bold leading-tight">{shop.name}</h2><p className="mt-2 flex gap-1.5 text-xs leading-5 text-muted-foreground"><MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />{shop.address}</p><div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3"><span className="inline-flex items-center gap-1 text-xs font-semibold"><Star className="size-3.5 fill-secondary text-secondary-foreground" /> {shop.rating} <span className="font-normal text-muted-foreground">({shop.reviews} reviews)</span></span><span className="text-xs font-medium text-muted-foreground">{shop.distanceKm.toFixed(1)} km away</span></div></div></Link><div className="px-4 pb-4 sm:px-5 sm:pb-5"><Button asChild variant="festiveOutline" className="h-10 w-full justify-between"><Link to="/shops/$shopSlug" params={{ shopSlug: shop.slug }} search={{ location }}>Visit shop <ArrowRight /></Link></Button></div></article>;
}