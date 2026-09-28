import { createFileRoute } from "@tanstack/react-router";
import { Auth, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/login")({
  head: () => titleMeta("Log in", "Log in to DiaSynapse."),
  component: () => <Auth mode="login" />,
});
