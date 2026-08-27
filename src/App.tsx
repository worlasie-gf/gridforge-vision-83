import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DemandFlexibility from "./pages/DemandFlexibility";
import Login from "./pages/Login";
import ConnectPge from "./pages/ConnectPge";
import PgeCallback from "./pages/PgeCallback";
import AdminDataConnections from "./pages/AdminDataConnections";
import { AuthProvider } from "./lib/auth-context";
import { RequireAuth, RequireAdmin } from "./components/RouteGuards";

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/demand-flexibility" element={<DemandFlexibility />} />

            {/* Private operational routes — not linked from public navigation */}
            <Route path="/login" element={<Login />} />
            <Route
              path="/connect/pge"
              element={
                <RequireAuth>
                  <ConnectPge />
                </RequireAuth>
              }
            />
            <Route
              path="/oauth/pge/callback"
              element={
                <RequireAuth>
                  <PgeCallback />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/data-connections"
              element={
                <RequireAdmin>
                  <AdminDataConnections />
                </RequireAdmin>
              }
            />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
