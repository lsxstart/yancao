import { createRootRoute, createRoute, createRouter, Navigate } from "@tanstack/react-router";
import { TobaccoScreenPage } from "./pages/TobaccoScreenPage";

const rootRoute = createRootRoute();

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <Navigate to="/screen" />
});

const screenRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/screen",
  component: TobaccoScreenPage
});

const routeTree = rootRoute.addChildren([indexRoute, screenRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
