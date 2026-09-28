import { createFileRoute } from "@tanstack/react-router";
import { Food, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/food")({
  head: () => titleMeta("South Indian food guide", "Explore everyday South Indian foods with simple food context."),
  component: () => <Food />,
});
