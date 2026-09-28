import { createFileRoute } from "@tanstack/react-router";
import { About, titleMeta } from "@/components/DiaSynapse";

export const Route = createFileRoute("/about")({
  head: () => titleMeta("About", "Learn about the connected DiaSynapse workflow and its safety boundaries."),
  component: () => <About />,
});
