import { createFileRoute } from "@tanstack/react-router";
import { Auth, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/signup")({
  head: () => titleMeta("Create account", "Create your DiaSynapse account."),
  component: () => <Auth mode="signup" />,
});
