import { fireEvent, render, screen, cleanup, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { CartProvider } from "@/lib/cart";
import { QuotePage } from "@/routes/quote";
import { CLIENT_STORAGE_KEY } from "@/features/client/data";

vi.mock("@/lib/catalog", () => import("./catalog-fixture"));

vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to, search }: { children: ReactNode; to: string; search?: Record<string, string> }) => (
    <a href={`${to}${search?.["order"] ? `?order=${search["order"]}` : ""}`}>{children}</a>
  ),
}));

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("frontend order completion flow", () => {
  it("completes checkout, saves order to client dashboard, clears cart, and displays success receipt", async () => {
    // 1. Seed cart
    localStorage.setItem(
      "atyab-cart",
      JSON.stringify([
        { slug: "pink-rose", qty: 25 },
        { slug: "florist-supplies-kit", qty: 2 },
      ]),
    );

    render(
      <CartProvider>
        <QuotePage />
      </CartProvider>,
    );

    // 2. Step 0: Cart Review & MOQ -> Advance to Step 1
    const proceedBtn = await screen.findByText("متابعة لبيانات الطلب");
    fireEvent.click(proceedBtn);

    // 3. Step 1: Customer Details
    expect(screen.getByRole("heading", { name: /^بيانات العميل$/ })).toBeTruthy();
    fireEvent.change(screen.getByLabelText("الاسم الكامل *"), { target: { value: "سارة العتيبي" } });
    fireEvent.change(screen.getByLabelText("رقم الجوال *"), { target: { value: "0501234567" } });
    fireEvent.change(screen.getByLabelText("المدينة *"), { target: { value: "الرياض" } });
    fireEvent.change(screen.getByLabelText("الحي *"), { target: { value: "الملقا" } });
    fireEvent.change(screen.getByLabelText("الشارع *"), { target: { value: "طريق الملك سلمان" } });

    // Submit details to reach Step 2
    fireEvent.submit(document.getElementById("quote-details")!);

    // 4. Step 2: Review, Delivery & Payment Selection
    expect(screen.getByText("مراجعة طلب عرض السعر")).toBeTruthy();
    expect(screen.getByText("سارة العتيبي")).toBeTruthy();
    expect(screen.getByText("طريقة الاستلام والتوصيل المبرد")).toBeTruthy();
    expect(screen.getByText("طريقة الدفع وتأكيد الحجز")).toBeTruthy();

    // Select Apple Pay
    const applePayOption = screen.getByText("Apple Pay");
    fireEvent.click(applePayOption);

    // Click confirm & complete order
    const submitOrderBtn = screen.getByRole("button", { name: /تأكيد وإتمام الطلب/ });
    fireEvent.click(submitOrderBtn);

    // 5. Step 3: Success Completion Screen
    await waitFor(() => {
      expect(screen.getByText("تم تأكيد وحجز الطلب بنجاح")).toBeTruthy();
    });

    // Check order details on confirmation screen
    expect(screen.getByText(/رقم الطلب المرجعي/)).toBeTruthy();
    expect(screen.getByText(/ORD-2026-/)).toBeTruthy();
    expect(screen.getAllByText(/سارة العتيبي/).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Apple Pay/)).toBeTruthy();
    expect(screen.getByText(/تتبع مسار الطلب المباشر/)).toBeTruthy();
    expect(screen.getByText(/عرض الطلب في حسابي/)).toBeTruthy();

    // Verify Professional Tax Invoice & PDF Receipt UI
    expect(screen.getByText("فاتورة ضريبية رسمية وإيصال استلام PDF معتمد")).toBeTruthy();
    expect(screen.getByText("معاينة الفاتورة")).toBeTruthy();
    expect(screen.getByText("تحميل وطباعة PDF")).toBeTruthy();
    expect(screen.getByText("تنزيل مستند")).toBeTruthy();

    // Open Official Receipt Preview Modal
    fireEvent.click(screen.getByText("معاينة الفاتورة"));
    expect(screen.getByText("إيصال الطلب الرسمي والفاتورة الضريبية")).toBeTruthy();
    expect(screen.getByText("1010724918")).toBeTruthy();
    expect(screen.getByText("310293847500003")).toBeTruthy();
    expect(screen.getByText("رمز التحقق الإلكتروني (ZATCA QR)")).toBeTruthy();
    expect(screen.getByText("تحميل / حفظ كـ PDF")).toBeTruthy();

    // Verify localStorage has persisted the order
    const clientDataRaw = localStorage.getItem(CLIENT_STORAGE_KEY);
    expect(clientDataRaw).not.toBeNull();
    const clientData = JSON.parse(clientDataRaw!);
    expect(clientData.orders.length).toBeGreaterThan(0);
    const savedOrder = clientData.orders[0];
    expect(savedOrder.id).toContain("ORD-2026-");
    expect(savedOrder.city).toBe("الرياض");
    expect(savedOrder.address.district).toBe("الملقا");
    expect(clientData.profile.name).toBe("سارة العتيبي");

    // Verify cart was cleared
    const cartRaw = localStorage.getItem("atyab-cart");
    const cart = cartRaw ? JSON.parse(cartRaw) : [];
    expect(cart.length).toBe(0);
  });
});
