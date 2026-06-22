import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { ScreenLoginPage } from "./pages/ScreenLoginPage";
import { router } from "./router";
import "@yancao/ui-tokens/screen.css";
import "./styles/global.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false
    }
  }
});

function ScreenApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(localStorage.getItem("YANCAO_SCREEN_TOKEN")));

  if (!isAuthenticated) {
    return <ScreenLoginPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return <RouterProvider router={router} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ScreenApp />
    </QueryClientProvider>
  </StrictMode>
);
