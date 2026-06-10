import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import RequireAuth from "@/components/auth/RequireAuth";
import VersionWatcher from "@/components/VersionWatcher";
import GoogleAnalyticsTracker from "@/components/analytics/GoogleAnalyticsTracker";
import MetaPixelTracker from "@/components/analytics/MetaPixelTracker";

import NotFound from "./pages/NotFound";

const LpAnuncio = lazy(() => import("./pages/LpAnuncio"));
const WelcomeHubLanding = lazy(() => import("./pages/WelcomeHubLanding"));

// Lazy-loaded routes — keep landing page (/) eager, split everything else.
const AppShell = lazy(() => import("@/components/layout/AppShell"));
const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Invite = lazy(() => import("./pages/Invite"));
const GuestGuide = lazy(() => import("./pages/GuestGuide"));
const SuperAdmin = lazy(() => import("./pages/SuperAdmin"));
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const PropertiesList = lazy(() => import("./pages/dashboard/PropertiesList"));
const PropertyNew = lazy(() => import("./pages/dashboard/PropertyNew"));
const PropertyDetail = lazy(() => import("./pages/dashboard/PropertyDetail"));
const PageEditor = lazy(() => import("./pages/dashboard/PageEditor"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Billing = lazy(() => import("./pages/dashboard/Billing"));
const Integrations = lazy(() => import("./pages/dashboard/Integrations"));
const Templates = lazy(() => import("./pages/dashboard/Templates"));
const Catalog = lazy(() => import("./pages/dashboard/Catalog"));
const PublicCatalog = lazy(() => import("./pages/PublicCatalog"));
const Help = lazy(() => import("./pages/dashboard/Help"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));

const SeoLandings = {
  GuiaDigitalAirbnb: lazy(() => import("./pages/seo/landings").then(m => ({ default: m.GuiaDigitalAirbnb }))),
  ManualDigitalAirbnb: lazy(() => import("./pages/seo/landings").then(m => ({ default: m.ManualDigitalAirbnb }))),
  AppParaAnfitriao: lazy(() => import("./pages/seo/landings").then(m => ({ default: m.AppParaAnfitriao }))),
  HubDeBoasVindas: lazy(() => import("./pages/seo/landings").then(m => ({ default: m.HubDeBoasVindas }))),
  GuestAppAirbnb: lazy(() => import("./pages/seo/landings").then(m => ({ default: m.GuestAppAirbnb }))),
  GuiaDoHospede: lazy(() => import("./pages/seo/landings").then(m => ({ default: m.GuiaDoHospede }))),
};
const SeoClusters = {
  CheckInDigitalAirbnb: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.CheckInDigitalAirbnb }))),
  QrCodeParaHospedes: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.QrCodeParaHospedes }))),
  ManualDaCasaAirbnb: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.ManualDaCasaAirbnb }))),
  AppParaHospedes: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.AppParaHospedes }))),
  ExperienciaDoHospede: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.ExperienciaDoHospede }))),
  ComoReduzirPerguntasNoWhatsApp: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.ComoReduzirPerguntasNoWhatsApp }))),
  ComoMelhorarAvaliacoesAirbnb: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.ComoMelhorarAvaliacoesAirbnb }))),
  ComoOrganizarCheckInAirbnb: lazy(() => import("./pages/seo/clusters").then(m => ({ default: m.ComoOrganizarCheckInAirbnb }))),
};
const SeoExtras = {
  IntegracaoHostaway: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.IntegracaoHostaway }))),
  IntegracaoStays: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.IntegracaoStays }))),
  IntegracaoAirbnb: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.IntegracaoAirbnb }))),
  CheckinComQrCode: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.CheckinComQrCode }))),
  ManualDigitalPousada: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.ManualDigitalPousada }))),
  ManualDigitalParaAirbnb: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.ManualDigitalParaAirbnb }))),
  WifiPorQrCode: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.WifiPorQrCode }))),
  CentralDoHospede: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.CentralDoHospede }))),
  CheckInAutonomoAirbnb: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.CheckInAutonomoAirbnb }))),
  ComoModernizarSuaHospedagem: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.ComoModernizarSuaHospedagem }))),
  ChecklistInspecao5EstrelasAirbnb: lazy(() => import("./pages/seo/extras").then(m => ({ default: m.ChecklistInspecao5EstrelasAirbnb }))),
};

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
        <GoogleAnalyticsTracker />
        <MetaPixelTracker />
        <AuthProvider>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<LpAnuncio />} />
              <Route path="/lp" element={<WelcomeHubLanding />} />
              <Route path="/welcome-hub" element={<Index />} />
              <Route path="/guia-digital-airbnb" element={<SeoLandings.GuiaDigitalAirbnb />} />
              <Route path="/manual-digital-airbnb" element={<SeoLandings.ManualDigitalAirbnb />} />
              <Route path="/app-para-anfitriao" element={<SeoLandings.AppParaAnfitriao />} />
              <Route path="/hub-de-boas-vindas" element={<SeoLandings.HubDeBoasVindas />} />
              <Route path="/guest-app-airbnb" element={<SeoLandings.GuestAppAirbnb />} />
              <Route path="/guia-do-hospede" element={<SeoLandings.GuiaDoHospede />} />
              <Route path="/check-in-digital-airbnb" element={<SeoClusters.CheckInDigitalAirbnb />} />
              <Route path="/qr-code-para-hospedes" element={<SeoClusters.QrCodeParaHospedes />} />
              <Route path="/manual-da-casa-airbnb" element={<SeoClusters.ManualDaCasaAirbnb />} />
              <Route path="/app-para-hospedes" element={<SeoClusters.AppParaHospedes />} />
              <Route path="/experiencia-do-hospede" element={<SeoClusters.ExperienciaDoHospede />} />
              <Route path="/como-reduzir-perguntas-no-whatsapp" element={<SeoClusters.ComoReduzirPerguntasNoWhatsApp />} />
              <Route path="/como-melhorar-avaliacoes-airbnb" element={<SeoClusters.ComoMelhorarAvaliacoesAirbnb />} />
              <Route path="/como-organizar-check-in-airbnb" element={<SeoClusters.ComoOrganizarCheckInAirbnb />} />
              <Route path="/integracao-hostaway" element={<SeoExtras.IntegracaoHostaway />} />
              <Route path="/integracao-stays" element={<SeoExtras.IntegracaoStays />} />
              <Route path="/integracao-airbnb" element={<SeoExtras.IntegracaoAirbnb />} />
              <Route path="/checkin-com-qr-code" element={<SeoExtras.CheckinComQrCode />} />
              <Route path="/manual-digital-pousada" element={<SeoExtras.ManualDigitalPousada />} />
              <Route path="/manual-digital-para-airbnb" element={<SeoExtras.ManualDigitalParaAirbnb />} />
              <Route path="/wifi-por-qr-code" element={<SeoExtras.WifiPorQrCode />} />
              <Route path="/central-do-hospede" element={<SeoExtras.CentralDoHospede />} />
              <Route path="/check-in-autonomo-airbnb" element={<SeoExtras.CheckInAutonomoAirbnb />} />
              <Route path="/como-modernizar-sua-hospedagem" element={<SeoExtras.ComoModernizarSuaHospedagem />} />
              <Route path="/checklist-inspecao-5-estrelas-airbnb" element={<SeoExtras.ChecklistInspecao5EstrelasAirbnb />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/invite/:token" element={<Invite />} />
              <Route path="/g/:slug" element={<GuestGuide />} />
              <Route path="/c/:tenantSlug" element={<PublicCatalog />} />
              <Route path="/termos" element={<Terms />} />
              <Route path="/privacidade" element={<Privacy />} />
              <Route path="/unsubscribe" element={<Unsubscribe />} />

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
                <Route path="catalog" element={<Catalog />} />
                <Route path="help" element={<Help />} />
              </Route>

              <Route path="/admin" element={<RequireAuth><AppShell /></RequireAuth>}>
                <Route index element={<SuperAdmin />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
