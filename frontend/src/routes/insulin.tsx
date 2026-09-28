import { createFileRoute } from "@tanstack/react-router";
import { Insulin, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/insulin")({
  head: () => titleMeta("Insulin awareness", "Keep your recorded insulin timing in view without dosing advice."),
  component: () => <Insulin />,
});
