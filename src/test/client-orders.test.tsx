import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { demonstrationOrders } from "@/features/client/data";
import { OrdersView } from "@/features/client/orders-view";
import { OrderDrawer } from "@/features/client/order-drawer";
vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
afterEach(cleanup);
describe("orders browsing", () => {
  it("switches table and grid views and preserves filtering", () => {
    render(<OrdersView orders={demonstrationOrders()} onDetails={() => {}} />);
    expect(screen.getByRole("table")).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "حالة الطلب" }), {
      target: { value: "shipping" },
    });
    expect(screen.getAllByRole("row")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "كروت" }));
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "تفاصيل الطلب DEMO-1003" })).toBeTruthy();
  });
  it("opens the selected order as a visible dialog with address, items and tracking", () => {
    const order = demonstrationOrders()[0]!;
    const details = vi.fn();
    render(<OrdersView orders={[order]} onDetails={details} />);
    fireEvent.click(screen.getByRole("button", { name: "تفاصيل الطلب DEMO-1003" }));
    expect(details).toHaveBeenCalledWith(order);
    cleanup();
    render(<OrderDrawer order={order} open onClose={() => {}} />);
    expect(screen.getByRole("dialog", { name: "DEMO-1003" })).toBeTruthy();
    expect(screen.getByText("طريق الملك عبدالله")).toBeTruthy();
    expect(screen.getByText("20 باقة")).toBeTruthy();
    expect(screen.getByRole("link", { name: "تتبّع هذا الطلب" })).toBeTruthy();
    expect(screen.getByText("بانتظار التسعير")).toBeTruthy();
  });
});
