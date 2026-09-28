import { createFileRoute } from "@tanstack/react-router";
import { Wellness, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/wellness")({
  head: () => titleMeta("Wellness", "Explore gentle everyday wellness ideas."),
  component: () => <Wellness />,
});
