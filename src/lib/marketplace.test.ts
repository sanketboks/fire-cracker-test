import { describe, it } from "node:test";
import assert from "node:assert/strict";

import { addShopCartQuantity, appendCustomProductPhoto, calculateOrderTotals, createInitialMarketplace, createPickupCode, getDirectionsUrl, getProductDiscount, PICKUP_HOLD_HOURS } from "@/lib/marketplace";

describe("marketplace customer rules", () => {
  it("keeps baskets to one shop", () => {
    const existingCart = { "shop-a-product": 2 };
    const result = addShopCartQuantity(existingCart, "shop-a", "shop-b", "other-product");

    assert.equal(result.status, "shop-conflict");
    assert.deepEqual(result.cart, existingCart);
    assert.equal(addShopCartQuantity(existingCart, "shop-a", "shop-a", "shop-a-product").cart["shop-a-product"], 3);
  });

  it("calculates totals and savings from quantities and prices", () => {
    const totals = calculateOrderTotals([
      { productId: "one", name: "Sparkler", quantity: 2, mrp: 100, price: 80 },
      { productId: "two", name: "Flower pot", quantity: 1, mrp: 200, price: 150 },
    ]);

    assert.deepEqual(totals, { subtotal: 310, savings: 90, total: 310 });
  });

  it("limits custom products to three photos", () => {
    const existingPhotos = ["photo-a", "photo-b", "photo-c"];

    assert.deepEqual(appendCustomProductPhoto(existingPhotos, "photo-d"), existingPhotos);
    assert.deepEqual(appendCustomProductPhoto(existingPhotos.slice(0, 2), "photo-c"), existingPhotos);
  });

  it("provides six demo shops with 10–45% discounts", () => {
    const marketplace = createInitialMarketplace();

    assert.equal(marketplace.shops.length, 6);
    assert.equal(marketplace.products.every((product) => {
      const discount = getProductDiscount(product);
      return discount >= 10 && discount <= 45;
    }), true);
  });

  it("holds pickup reservations for 24 hours with a 6-character code", () => {
    assert.equal(PICKUP_HOLD_HOURS, 24);
    assert.match(createPickupCode(), /^[A-Z0-9]{6}$/);
  });

  it("builds a Google Maps directions link from the shop address", () => {
    const url = getDirectionsUrl({ name: "Deepam", address: "8 Market Lane", pincode: "626124" });
    assert.equal(url, "https://www.google.com/maps/dir/?api=1&destination=Deepam%2C%208%20Market%20Lane%2C%20626124");
  });
});
