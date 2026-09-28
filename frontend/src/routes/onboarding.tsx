import { createFileRoute } from "@tanstack/react-router";
import { Onboarding, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/onboarding")({
  head: () => titleMeta("Onboarding", "Personalize your DiaSynapse experience."),
  component: () => <Onboarding />,
});
