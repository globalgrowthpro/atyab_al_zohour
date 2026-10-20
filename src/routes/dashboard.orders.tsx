import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useClientData } from "@/features/client/context";
import { OrdersView } from "@/features/client/orders-view";
import { OrderDrawer } from "@/features/client/order-drawer";
export const Route = createFileRoute("/dashboard/orders")({
  validateSearch: (search: Record<string, unknown>): { order?: string | undefined } => ({
    order: typeof search["order"] === "string" ? search["order"] : undefined,
  }),
  component: Orders,
});
function Orders() {
  const { data } = useClientData();
  const { order: selected } = Route.useSearch();
  const navigate = useNavigate();
  return (
    <>
      <OrdersView
        orders={data.orders}
        onDetails={(order) =>
          void navigate({
            to: "/dashboard/orders",
            search: { order: order.id },
            resetScroll: false,
          })
        }
      />
      <OrderDrawer
        order={data.orders.find((order) => order.id === selected)}
        open={Boolean(selected)}
        onClose={() =>
          void navigate({ to: "/dashboard/orders", search: {}, replace: true, resetScroll: false })
        }
      />
    </>
  );
}
