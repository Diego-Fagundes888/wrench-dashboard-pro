
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AgendaPage from "./pages/agenda/AgendaPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout><Index /></Layout>} />
          <Route path="/agenda" element={<Layout><AgendaPage /></Layout>} />
          {/* Adicionar outras rotas aqui quando implementadas */}
          <Route path="/criar-os" element={<Layout><div className="p-4">Página de Criação de OS em desenvolvimento</div></Layout>} />
          <Route path="/historico" element={<Layout><div className="p-4">Página de Histórico em desenvolvimento</div></Layout>} />
          <Route path="/financeiro" element={<Layout><div className="p-4">Página Financeira em desenvolvimento</div></Layout>} />
          <Route path="/pecas" element={<Layout><div className="p-4">Página de Peças em desenvolvimento</div></Layout>} />
          <Route path="/configuracoes" element={<Layout><div className="p-4">Configurações em desenvolvimento</div></Layout>} />
          {/* Rota de fallback para páginas não encontradas */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
