import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import AppShell from "@/components/layout/AppShell";
import VersionWatcher from "@/components/VersionWatcher";

import Index from "./pages/Index";
import WelcomeHubLanding from "./pages/WelcomeHubLanding";
import Auth from "./pages/Auth";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
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
import Templates from "./pages/dashboard/Templates";
import Help from "./pages/dashboard/Help";
import NotFound from "./pages/NotFound";
import {
  GuiaDigitalAirbnb,
  ManualDigitalAirbnb,
  AppParaAnfitriao,
  HubDeBoasVindas,
  GuestAppAirbnb,
  GuiaDoHospede,
} from "./pages/seo/landings";
import {
  CheckInDigitalAirbnb,
  QrCodeParaHospedes,
  ManualDaCasaAirbnb,
  AppParaHospedes,
  ExperienciaDoHospede,
  ComoReduzirPerguntasNoWhatsApp,
  ComoMelhorarAvaliacoesAirbnb,
  ComoOrganizarCheckInAirbnb,
} from "./pages/seo/clusters";
import {
  IntegracaoHostaway,
  IntegracaoStays,
  IntegracaoAirbnb,
  CheckinComQrCode,
  ManualDigitalPousada,
  ManualDigitalParaAirbnb,
  WifiPorQrCode,
  CentralDoHospede,
  CheckInAutonomoAirbnb,
  ComoModernizarSuaHospedagem,
} from "./pages/seo/extras";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false } },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <VersionWatcher />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<WelcomeHubLanding />} />
            <Route path="/welcome-hub" element={<Index />} />
            <Route path="/guia-digital-airbnb" element={<GuiaDigitalAirbnb />} />
            <Route path="/manual-digital-airbnb" element={<ManualDigitalAirbnb />} />
            <Route path="/app-para-anfitriao" element={<AppParaAnfitriao />} />
            <Route path="/hub-de-boas-vindas" element={<HubDeBoasVindas />} />
            <Route path="/guest-app-airbnb" element={<GuestAppAirbnb />} />
            <Route path="/guia-do-hospede" element={<GuiaDoHospede />} />
            <Route path="/check-in-digital-airbnb" element={<CheckInDigitalAirbnb />} />
            <Route path="/qr-code-para-hospedes" element={<QrCodeParaHospedes />} />
            <Route path="/manual-da-casa-airbnb" element={<ManualDaCasaAirbnb />} />
            <Route path="/app-para-hospedes" element={<AppParaHospedes />} />
            <Route path="/experiencia-do-hospede" element={<ExperienciaDoHospede />} />
            <Route path="/como-reduzir-perguntas-no-whatsapp" element={<ComoReduzirPerguntasNoWhatsApp />} />
            <Route path="/como-melhorar-avaliacoes-airbnb" element={<ComoMelhorarAvaliacoesAirbnb />} />
            <Route path="/como-organizar-check-in-airbnb" element={<ComoOrganizarCheckInAirbnb />} />
            <Route path="/integracao-hostaway" element={<IntegracaoHostaway />} />
            <Route path="/integracao-stays" element={<IntegracaoStays />} />
            <Route path="/integracao-airbnb" element={<IntegracaoAirbnb />} />
            <Route path="/checkin-com-qr-code" element={<CheckinComQrCode />} />
            <Route path="/manual-digital-pousada" element={<ManualDigitalPousada />} />
            <Route path="/manual-digital-para-airbnb" element={<ManualDigitalParaAirbnb />} />
            <Route path="/wifi-por-qr-code" element={<WifiPorQrCode />} />
            <Route path="/central-do-hospede" element={<CentralDoHospede />} />
            <Route path="/check-in-autonomo-airbnb" element={<CheckInAutonomoAirbnb />} />
            <Route path="/como-modernizar-sua-hospedagem" element={<ComoModernizarSuaHospedagem />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="templates" element={<Templates />} />
              <Route path="help" element={<Help />} />
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
