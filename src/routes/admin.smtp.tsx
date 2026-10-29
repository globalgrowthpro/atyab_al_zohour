import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/smtp")({
  beforeLoad: () => {
    throw redirect({ to: "/admin/settings", hash: "smtp" });
  },
});
