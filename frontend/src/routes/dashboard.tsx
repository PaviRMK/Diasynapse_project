import { createFileRoute } from "@tanstack/react-router";
import { Dashboard, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/dashboard")({
  head: () => titleMeta("Dashboard", "View your recorded glucose, meal and insulin timing information."),
  component: () => <Dashboard />,
});
