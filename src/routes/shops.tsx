import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/shops")({
  component: ShopsLayout,
});

function ShopsLayout() {
  return <Outlet />;
}