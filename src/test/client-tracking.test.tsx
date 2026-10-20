import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { demonstrationOrders, progressIndex } from "@/features/client/data";
import { DeliveryStepper } from "@/features/client/tracking";
import { orderMapState } from "@/features/client/order-presentation";
afterEach(cleanup);
describe("order tracking state", () => {
  it("keeps sample states aligned with the delivery sequence", () => {
    expect(
      demonstrationOrders()
        .map((o) => progressIndex(o.status))
        .sort(),
    ).toEqual([0, 1, 2, 3, 4]);
    expect(progressIndex("cancelled")).toBe(-1);
  });
  it("marks prior steps complete, highlights the courier and leaves receipt pending", () => {
    const order = demonstrationOrders()[0]!;
    render(
      <>
        <DeliveryStepper order={order} />
      </>,
    );
    expect(screen.getAllByText("مكتملة ✓")).toHaveLength(3);
    expect(screen.getByText("الخطوة الحالية").parentElement?.textContent).toContain(
      "مع مندوب التوصيل",
    );
    expect(screen.getAllByText("في انتظار الخطوة التالية")).toHaveLength(1);
    const map = orderMapState(order);
    expect(map.index).toBeGreaterThan(0);
    expect(map.index).toBeLessThan(map.route.length - 1);
  });
  it("completes all steps and places a delivered order at the receiving point", () => {
    const order = demonstrationOrders().find((o) => o.status === "delivered")!;
    render(
      <>
        <DeliveryStepper order={order} />
      </>,
    );
    expect(screen.getAllByText("مكتملة ✓")).toHaveLength(5);
    const map = orderMapState(order);
    expect(map.position).toEqual(map.route.at(-1));
  });
});
