import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { QuotePage } from "@/routes/quote";
vi.mock("@/lib/catalog", () => import("./catalog-fixture"));

vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("quote request journey", () => {
  it("offers a catalogue link for an empty cart", () => {
    render(
      <CartProvider>
        <QuotePage />
      </CartProvider>,
    );
    expect(screen.getByText("سلة طلبك فارغة")).toBeTruthy();
  });
  it("validates customer details, reviews quantities and downloads without claiming submission", async () => {
    localStorage.setItem(
      "atyab-cart",
      JSON.stringify([
        { slug: "pink-rose", qty: 20 },
        { slug: "florist-supplies-kit", qty: 2 },
      ]),
    );
    render(
      <CartProvider>
        <QuotePage />
      </CartProvider>,
    );
    fireEvent.click(await screen.findByText("متابعة لبيانات الطلب"));
    expect(screen.getByRole("heading", { name: /^بيانات العميل$/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("الاسم الكامل *"), { target: { value: "أحمد" } });
    expect(screen.queryByText("بيانات العميل والتوريد")).toBeNull();
    expect(screen.queryByLabelText(/اسم المنشأة/)).toBeNull();
    expect(screen.queryByLabelText(/تاريخ التوريد/)).toBeNull();
    fireEvent.change(screen.getByLabelText("المدينة *"), { target: { value: "الرياض" } });
    fireEvent.change(screen.getByLabelText("الحي *"), { target: { value: "الورود" } });
    fireEvent.change(screen.getByLabelText("الشارع *"), { target: { value: "شارع الزهور" } });
    fireEvent.change(screen.getByLabelText("رقم الجوال *"), { target: { value: "invalid" } });
    fireEvent.submit(document.getElementById("quote-details")!);
    expect(screen.getByRole("alert").textContent).toContain("رقم جوال");
    fireEvent.change(screen.getByLabelText("رقم الجوال *"), { target: { value: "+966501234567" } });
    fireEvent.submit(document.getElementById("quote-details")!);
    expect(screen.getByText("مراجعة طلب عرض السعر")).toBeTruthy();
    expect(screen.getByText("20 باقة، 2 كرتون")).toBeTruthy();
    const create = vi.fn((blob: Blob) => {
      expect(blob.size).toBeGreaterThan(0);
      return "blob:test";
    });
    Object.defineProperty(URL, "createObjectURL", { configurable: true, value: create });
    Object.defineProperty(URL, "revokeObjectURL", { configurable: true, value: vi.fn() });
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    fireEvent.click(screen.getByText("تحميل طلب عرض السعر"));
    expect(create).toHaveBeenCalledOnce();
    const exported = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(create.mock.calls[0]![0]);
    });
    expect(exported).toContain("الحي: الورود");
    expect(exported).toContain("الشارع: شارع الزهور");
    expect(exported).not.toContain("اسم المنشأة");
    expect(exported).not.toContain("تاريخ التوريد");
    expect(screen.getByRole("status").textContent).toContain("لم يُرسل للشركة");
    fireEvent.click(screen.getByText("تعديل البيانات"));
    expect((screen.getByLabelText("الاسم الكامل *") as HTMLInputElement).value).toBe("أحمد");
  });
});
