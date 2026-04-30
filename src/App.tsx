import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Invite from "./pages/Invite";
import GuestGuide from "./pages/GuestGuide";
import SuperAdmin from "./pages/SuperAdmin";
import DashboardHome from "./pages/dashboard/DashboardHome";
import PropertiesList from "./pages/dashboard/PropertiesList";
import PropertyNew from "./pages/dashboard/PropertyNew";
import PropertyDetail from "./pages/dashboard/PropertyDetail";
import PageEditor from "./pages/dashboard/PageEditor";
import Settings from "./pages/dashboard/Settings";
import Billing from "./pages/dashboard/Billing";
import Integrations from "./pages/dashboard/Integrations";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/invite/:token" element={<Invite />} />
            <Route path="/g/:slug" element={<GuestGuide />} />

            <Route path="/app" element={<RequireAuth><AppShell /></RequireAuth>}>
              <Route index element={<DashboardHome />} />
              <Route path="properties" element={<PropertiesList />} />
              <Route path="properties/new" element={<PropertyNew />} />
              <Route path="properties/:id" element={<PropertyDetail />} />
              <Route path="properties/:id/pages/:pageKey" element={<PageEditor />} />
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="integrations" element={<Integrations />} />
            </Route>

            <Route path="/admin" element={<RequireAuth><AppShell /></RequireAuth>}>
              <Route index element={<SuperAdmin />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
