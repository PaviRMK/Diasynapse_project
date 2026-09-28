import { createFileRoute } from "@tanstack/react-router";
import { Profile, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/profile")({
  head: () => titleMeta("Profile", "Manage your personal diabetes profile."),
  component: () => <Profile />,
});
