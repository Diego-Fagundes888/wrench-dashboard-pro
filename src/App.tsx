
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgendaPage from "./pages/agenda/AgendaPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import CriarOSPage from "./pages/ordens-servico/CriarOSPage";
import HistoricoPage from "./pages/historico/HistoricoPage";
import FinanceiroPage from "./pages/financeiro/FinanceiroPage";
import PecasPage from "./pages/pecas/PecasPage";
import ConfiguracoesPage from "./pages/configuracoes/ConfiguracoesPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <SonnerToaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
          <Route path="/agenda" element={<Layout><AgendaPage /></Layout>} />
          <Route path="/criar-os" element={<Layout><CriarOSPage /></Layout>} />
          <Route path="/historico" element={<Layout><HistoricoPage /></Layout>} />
          <Route path="/financeiro" element={<Layout><FinanceiroPage /></Layout>} />
          <Route path="/pecas" element={<Layout><PecasPage /></Layout>} />
          <Route path="/configuracoes" element={<Layout><ConfiguracoesPage /></Layout>} />
          {/* Rota de fallback para páginas não encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
