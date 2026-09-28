import { createFileRoute } from "@tanstack/react-router";
import { Progress, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/progress")({
  head: () => titleMeta("Progress", "Explore your recorded glucose and meal trends over time."),
  component: () => <Progress />,
});
