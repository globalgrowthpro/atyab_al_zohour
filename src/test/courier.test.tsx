import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import {
  COURIER_STORAGE_KEY,
  courierRepository,
  demoCourierData,
  taskAsOrder,
  transitionTask,
} from "@/features/courier/data";
import { CourierProvider, useCourier } from "@/features/courier/context";
import { TaskActions } from "@/features/courier/task-actions";
import { TaskList } from "@/features/courier/task-list";
import { courierRoute } from "@/features/courier/routes";
import { orderMapState } from "@/features/client/order-presentation";
vi.mock("@tanstack/react-router", async (original) => ({
  ...(await original<typeof import("@tanstack/react-router")>()),
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("courier task lifecycle", () => {
  it("requires task acceptance and departure before delivery", () => {
    const task = demoCourierData().tasks.find((task) => task.status === "assigned")!;
    expect(() => transitionTask(task, { type: "depart" })).toThrow();
    const accepted = transitionTask(task, { type: "accept" });
    const departed = transitionTask(accepted, { type: "depart" });
    expect(taskAsOrder(departed).status).toBe("shipping");
    expect(() =>
      transitionTask(departed, { type: "deliver", recipient: "", verified: true, note: "" }),
    ).toThrow();
    expect(() =>
      transitionTask(departed, {
        type: "deliver",
        recipient: "مستلم تجريبي",
        verified: false,
        note: "",
      }),
    ).toThrow();
    const delivered = transitionTask(departed, {
      type: "deliver",
      recipient: "مستلم تجريبي",
      verified: true,
      note: "الكميات كاملة",
    });
    expect(delivered.status).toBe("delivered");
    expect(delivered.events.at(-1)?.note).toContain("الكميات كاملة");
    expect(() => transitionTask(delivered, { type: "retry" })).toThrow();
  });
  it("requires a reason and note for failure, and records a retry without losing history", () => {
    const task = demoCourierData().tasks.find((task) => task.status === "out_for_delivery")!;
    expect(() => transitionTask(task, { type: "fail", reason: "unavailable", note: "" })).toThrow();
    const failed = transitionTask(task, {
      type: "fail",
      reason: "unavailable",
      note: "لم يتوفر المستلم في المكان",
    });
    expect(failed.failureReason).toBe("unavailable");
    const retried = transitionTask(failed, { type: "retry" });
    expect(retried.status).toBe("out_for_delivery");
    expect(retried.failureReason).toBeUndefined();
    expect(retried.events).toHaveLength(task.events.length + 2);
  });
  it("uses distinct demo routes and moves the delivered task to its destination", () => {
    const tasks = demoCourierData().tasks;
    expect(courierRoute(tasks[0]!)).not.toEqual(courierRoute(tasks[1]!));
    const delivered = tasks.find((task) => task.status === "delivered")!;
    const map = orderMapState(taskAsOrder(delivered), courierRoute(delivered));
    expect(map.position).toEqual(courierRoute(delivered).at(-1));
  });
  it("persists courier changes without touching customer data and rejects malformed storage", async () => {
    localStorage.setItem("atyab-client-demo-v1", "customer-data");
    const data = demoCourierData();
    data.tasks[1] = transitionTask(data.tasks[1]!, { type: "accept" });
    await courierRepository.save(data);
    expect((await courierRepository.load()).tasks[1]?.status).toBe("accepted");
    expect(localStorage.getItem("atyab-client-demo-v1")).toBe("customer-data");
    localStorage.setItem(COURIER_STORAGE_KEY, '{"version":1,"tasks":"broken"}');
    await expect(courierRepository.load()).rejects.toThrow();
  });
});
describe("courier actions and views", () => {
  function ActionProbe() {
    const { data, error } = useCourier();
    const task = data.tasks.find((task) => task.id === "TASK-201")!;
    return (
      <>
        <TaskActions task={task} />
        <span data-testid="task-status">{task.status}</span>
        {error && <p role="alert">{error}</p>}
      </>
    );
  }
  it("confirms recipient and quantities before saving a delivery", async () => {
    render(
      <CourierProvider>
        <ActionProbe />
      </CourierProvider>,
    );
    fireEvent.click(await screen.findByText("تأكيد التسليم"));
    fireEvent.change(screen.getByLabelText("اسم المستلم"), { target: { value: "مستلم تجريبي" } });
    fireEvent.submit(screen.getByText("حفظ تأكيد التسليم محلياً").closest("form")!);
    expect(screen.getByTestId("task-status").textContent).toBe("out_for_delivery");
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByText("حفظ تأكيد التسليم محلياً").closest("form")!);
    await waitFor(() => expect(screen.getByTestId("task-status").textContent).toBe("delivered"));
    expect((await courierRepository.load()).tasks[0]?.recipient).toBe("مستلم تجريبي");
  });
  it("keeps the delivery form and task state when persistence fails", async () => {
    render(
      <CourierProvider>
        <ActionProbe />
      </CourierProvider>,
    );
    fireEvent.click(await screen.findByText("تأكيد التسليم"));
    fireEvent.change(screen.getByLabelText("اسم المستلم"), { target: { value: "مستلم تجريبي" } });
    fireEvent.click(screen.getByRole("checkbox"));
    vi.spyOn(courierRepository, "save").mockRejectedValue(new Error("quota"));
    fireEvent.submit(screen.getByText("حفظ تأكيد التسليم محلياً").closest("form")!);
    await screen.findByRole("alert");
    expect(screen.getByTestId("task-status").textContent).toBe("out_for_delivery");
    expect((screen.getByLabelText("اسم المستلم") as HTMLInputElement).value).toBe("مستلم تجريبي");
  });
  it("filters tasks and switches table and cards", () => {
    const details = vi.fn();
    render(<TaskList tasks={demoCourierData().tasks} onDetails={details} />);
    expect(screen.getByRole("table")).toBeTruthy();
    fireEvent.change(screen.getByRole("combobox", { name: "حالة المهمة" }), {
      target: { value: "assigned" },
    });
    expect(screen.getAllByRole("row")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "كروت" }));
    expect(screen.getAllByRole("article")).toHaveLength(2);
    fireEvent.click(screen.getByRole("button", { name: "تفاصيل المهمة TASK-202" }));
    expect(details).toHaveBeenCalledWith(expect.objectContaining({ id: "TASK-202" }));
  });
});
