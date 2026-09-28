import { createFileRoute } from "@tanstack/react-router";
import { Meal, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/meal")({
  head: () => titleMeta("Meal analysis", "Upload a meal photo and explore meal context."),
  component: () => <Meal />,
});
