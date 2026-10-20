import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  clientRepository,
  CLIENT_STORAGE_KEY,
  emptyClientData,
  demonstrationOrders,
  profileSchema,
  withDemonstrationData,
} from "@/features/client/data";
import { ClientProvider } from "@/features/client/context";
import { ProfilePage } from "@/routes/dashboard.profile";
import { SupportPage } from "@/routes/dashboard.support";

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});
describe("client local data adapter", () => {
  it("starts with clearly marked demo records and merges without replacing local data", async () => {
    expect((await clientRepository.load()).orders).toHaveLength(5);
    expect(demonstrationOrders().every((o) => o.id.startsWith("DEMO-"))).toBe(true);
    const data = { ...emptyClientData(), orders: demonstrationOrders() };
    await clientRepository.save(data);
    expect(await clientRepository.load()).toEqual(data);
    const merged = withDemonstrationData(data);
    expect(withDemonstrationData(merged)).toEqual(merged);
    const edited = {
      ...merged,
      profile: { ...merged.profile, name: "عميل محلي" },
      orders: merged.orders.map((order) => ({ ...order, city: "مدينة معدلة" })),
    };
    expect(withDemonstrationData(edited).profile.name).toBe("عميل محلي");
    expect(
      withDemonstrationData(edited).orders.every((order) => order.city === "مدينة معدلة"),
    ).toBe(true);
  });
  it("rejects malformed storage instead of showing false customer data", async () => {
    localStorage.setItem(CLIENT_STORAGE_KEY, '{"version":1,"orders":"invalid"}');
    await expect(clientRepository.load()).rejects.toThrow();
  });
  it("validates phone numbers and required profile fields", () => {
    expect(profileSchema.safeParse(emptyClientData().profile).success).toBe(false);
    expect(
      profileSchema.safeParse({
        name: "أحمد",
        company: "زهور",
        phone: "letters",
        email: "",
        city: "الرياض",
        address: "",
      }).success,
    ).toBe(false);
  });
});
describe("client local forms", () => {
  it("saves and restores the city and district while retaining the company field", async () => {
    const view = render(
      <ClientProvider>
        <ProfilePage />
      </ClientProvider>,
    );
    fireEvent.change(await screen.findByLabelText("الاسم الكامل"), {
      target: { value: "عميل تجريبي" },
    });
    fireEvent.change(screen.getByLabelText("اسم المنشأة"), { target: { value: "زهور تجريبية" } });
    fireEvent.change(screen.getByLabelText("رقم الجوال"), { target: { value: "0500000000" } });
    fireEvent.change(screen.getByLabelText("المدينة"), { target: { value: "الرياض" } });
    fireEvent.change(screen.getByLabelText("الحي"), { target: { value: "الورود" } });
    fireEvent.click(screen.getByText("حفظ البيانات محلياً"));
    await waitFor(() =>
      expect(JSON.parse(localStorage.getItem(CLIENT_STORAGE_KEY)!).profile.district).toBe("الورود"),
    );
    view.unmount();
    render(
      <ClientProvider>
        <ProfilePage />
      </ClientProvider>,
    );
    expect(((await screen.findByLabelText("المدينة")) as HTMLInputElement).value).toBe("الرياض");
    expect((screen.getByLabelText("الحي") as HTMLInputElement).value).toBe("الورود");
    expect((screen.getByLabelText("اسم المنشأة") as HTMLInputElement).value).toBe("زهور تجريبية");
  });
  it("saves a support draft locally without claiming it was sent", async () => {
    render(
      <ClientProvider>
        <SupportPage />
      </ClientProvider>,
    );
    fireEvent.change(await screen.findByLabelText("عنوان الاستفسار"), {
      target: { value: "استفسار تجريبي" },
    });
    fireEvent.change(screen.getByLabelText("تفاصيل الاستفسار"), {
      target: { value: "أحتاج تفاصيل إضافية عن التوصيل" },
    });
    fireEvent.click(screen.getByText("حفظ مسودة محلية"));
    await screen.findByText("مسودة محلية · لم تُرسل");
    const saved = await clientRepository.load();
    expect(saved.tickets[0]?.status).toBe("draft");
    expect(saved.tickets[0]?.message).toContain("التوصيل");
  });
  it("keeps profile edits visible when local storage fails", async () => {
    render(
      <ClientProvider>
        <ProfilePage />
      </ClientProvider>,
    );
    fireEvent.change(await screen.findByLabelText("الاسم الكامل"), { target: { value: "أحمد" } });
    fireEvent.change(screen.getByLabelText("اسم المنشأة"), { target: { value: "زهور" } });
    fireEvent.change(screen.getByLabelText("رقم الجوال"), { target: { value: "0500000000" } });
    fireEvent.change(screen.getByLabelText("المدينة"), { target: { value: "الرياض" } });
    fireEvent.change(screen.getByLabelText("الحي"), { target: { value: "الورود" } });
    vi.spyOn(clientRepository, "save").mockRejectedValue(new Error("quota"));
    fireEvent.click(screen.getByText("حفظ البيانات محلياً"));
    await waitFor(() => expect(clientRepository.save).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect((screen.getByLabelText("الاسم الكامل") as HTMLInputElement).value).toBe("أحمد"),
    );
    expect(localStorage.getItem(CLIENT_STORAGE_KEY)).toBeNull();
  });
});
