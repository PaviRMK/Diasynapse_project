import { createFileRoute } from "@tanstack/react-router";
import { Glucose, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/glucose")({
  head: () => titleMeta("Glucose forecast", "Explore an estimated 30-minute glucose forecast from your recorded data."),
  component: () => <Glucose />,
});
