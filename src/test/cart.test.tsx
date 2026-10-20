import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CartProvider, normalizeCart, useCart } from "@/lib/cart";
vi.mock("@/lib/catalog", () => import("./catalog-fixture"));

describe("quote cart", () => {
  it("rejects damaged, unknown and unavailable saved products", () => {
    expect(normalizeCart({})).toEqual([]);
    expect(
      normalizeCart([
        null,
        { slug: "missing", qty: 10 },
        { slug: "seasonal-peony-tulip", qty: 5 },
        { slug: "pink-rose", qty: -1 },
      ]),
    ).toEqual([]);
  });
  it("enforces minimum quantities, merges duplicates and caps totals", () => {
    expect(
      normalizeCart([
        { slug: "pink-rose", qty: 1 },
        { slug: "pink-rose", qty: 5 },
      ]),
    ).toEqual([{ slug: "pink-rose", qty: 15 }]);
    expect(normalizeCart([{ slug: "pink-rose", qty: 20000 }])).toEqual([
      { slug: "pink-rose", qty: 9999 },
    ]);
  });
  it("restores saved quantities and persists edits without overwriting the saved cart on mount", async () => {
    localStorage.setItem("atyab-cart", JSON.stringify([{ slug: "pink-rose", qty: 20 }]));
    let cart: ReturnType<typeof useCart>;
    function Probe() {
      cart = useCart();
      return <span>{cart.count}</span>;
    }
    const view = render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
    await waitFor(() => expect(screen.getByText("20")).toBeTruthy());
    act(() => cart.setQty("pink-rose", 2));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem("atyab-cart")!)).toEqual([
        { slug: "pink-rose", qty: 10 },
      ]),
    );
    act(() => cart.remove("pink-rose"));
    await waitFor(() => expect(localStorage.getItem("atyab-cart")).toBe("[]"));
    view.unmount();
  });
});
