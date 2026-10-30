import { createFileRoute, Outlet } from "@tanstack/react-router";

// Layout route: the list lives in admin.clients.index.tsx and the details page
// in admin.clients.$clientId.tsx renders here as a sibling leaf.
export const Route = createFileRoute("/admin/clients")({ component: () => <Outlet /> });
