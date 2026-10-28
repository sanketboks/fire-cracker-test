# Move the marketplace to Lovable Cloud

## What changes for people
- **Customers** stay guests. They see real shops sorted by true distance from their location (browser location, or a typed area/PIN as a fallback). Reservations are saved to the cloud, so the shop sees them on any device.
- **Shopkeepers** sign in with their phone number and a one-time SMS code. Each shopkeeper sees and edits only their own shop, products and reservations.
- Shop and product photos are uploaded to cloud storage instead of being kept in the browser.
- The six demo shops and their products are added once as real starting data, so the first screen isn't empty.

## Steps
1. Turn on Lovable Cloud and phone sign-in. Phone sign-in needs an SMS provider (for example Twilio). You will need to add its details in Cloud settings before real codes can be sent.
2. Create the database: shops (with a map location), products, reservations, reservation items, and photo storage.
3. Turn on PostGIS and add a "nearby shops" search that returns shops with distance in km, filtered by radius and minimum discount.
4. Add security rules (details below).
5. Replace browser-storage demo state with cloud reads and writes on the home page, shop directory, storefront, checkout and seller pages. The cart stays in the browser (it is personal to the guest).
6. Seller page: phone sign-in screen, then registration (creates the shop as "Pending approval"), product management with photo upload, and the reservations list with the existing statuses.
7. Test the full flow: guest reserves at a shop, the shopkeeper signs in and sees it and changes its status; another shopkeeper cannot see it.

## Technical details
- Tables: `shops` (owner_id -> auth user, location `geography(Point,4326)`, status, is_open, licence, photo_path), `products` (shop_id, mrp, price, stock, images[]), `reservations` (shop_id, customer_name, phone, pickup_code, status enum New/Confirmed/Ready for Pickup/Collected/Cancelled, totals), `reservation_items`.
- RLS:
  - Public (guest) can read approved shops and their products only.
  - Shopkeeper: select/insert/update/delete own shop (`owner_id = auth.uid()`), own products and own reservations through a security-definer `owns_shop(shop_id)` helper.
  - Guests never read reservations directly. Placing a reservation goes through a server function that validates input, recomputes prices from the database, generates the pickup code and inserts with the admin client; it returns only that reservation's confirmation.
  - Storage bucket `shop-photos`: public read; writes only under the uploader's own `shop_id/` folder.
- PostGIS: `nearby_shops(lat, lng, radius_km, min_discount)` SQL function using `ST_DWithin` and `ST_Distance`, exposed as a public read. Seed shops get coordinates around Sivakasi; new shops set their location from the browser or a map pin during registration.
- Shop approval: new shops start pending; for the demo, the existing "approve for demo" button stays available to the owner. A real admin approval can come later.
- Shared `MarketplaceProvider` is kept as the single source for screens, now backed by cloud queries so customer and seller views stay in sync.
- Existing rule tests stay; add tests for pickup code, price recalculation and the 24-hour hold.
