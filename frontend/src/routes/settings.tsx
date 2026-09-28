import { createFileRoute } from "@tanstack/react-router";
import { Profile, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/settings")({
  head: () => titleMeta("Settings", "Manage your DiaSynapse preferences."),
  component: () => <Profile settings />,
});
