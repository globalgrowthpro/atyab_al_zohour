import { createFileRoute, redirect } from "@tanstack/react-router";

export { PRICING_STORAGE_KEY } from "./admin.products";

export const Route = createFileRoute("/admin/pricing")({
  beforeLoad: () => {
    throw redirect({
      to: "/admin/products",
      search: { tab: "pricing" },
    });
  },
  component: () => null,
});

