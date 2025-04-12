
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Wrench, 
  TrendingUp, 
  Calendar, 
  Car,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data
const todayServices = [
  { id: '1', client: 'João Silva', vehicle: 'Honda Civic 2020', service: 'Troca de Óleo', status: 'Concluído', time: '09:30' },
  { id: '2', client: 'Maria Oliveira', vehicle: 'Toyota Corolla 2018', service: 'Revisão Completa', status: 'Em andamento', time: '10:15' },
  { id: '3', client: 'Carlos Pereira', vehicle: 'Volkswagen Gol 2015', service: 'Alinhamento e Balanceamento', status: 'Aguardando', time: '14:00' },
];

const statusIcons: Record<string, JSX.Element> = {
  'Concluído': <CheckCircle className="h-5 w-5 text-green-500" />,
  'Em andamento': <Clock className="h-5 w-5 text-amber-500" />,
  'Aguardando': <AlertCircle className="h-5 w-5 text-blue-500" />,
};

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Serviços do Dia */}
        <Card className="animate-fade-in card-transition delay-100">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Serviços do Dia</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayServices.length}</div>
            <p className="text-xs text-muted-foreground">
              +5% em relação à semana anterior
            </p>
          </CardContent>
        </Card>

        {/* Card de Faturamento Diário */}
        <Card className="animate-fade-in card-transition delay-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Faturamento Diário</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 1.250,00</div>
            <p className="text-xs text-muted-foreground">
              +12% em relação à semana anterior
            </p>
          </CardContent>
        </Card>

        {/* Card de Agendamentos */}
        <Card className="animate-fade-in card-transition delay-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Agendamentos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Próximos 3 dias
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Serviços em Andamento */}
      <Card className="animate-fade-in">
        <CardHeader>
          <CardTitle>Serviços em Andamento</CardTitle>
          <CardDescription>
            Acompanhe o status dos serviços de hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayServices.map((service) => (
              <div
                key={service.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-scale"
              >
                <div className="flex items-center space-x-4">
                  <Car className="h-8 w-8 text-primary" />
                  <div>
                    <div className="font-medium">{service.client}</div>
                    <div className="text-sm text-muted-foreground">{service.vehicle}</div>
                    <div className="text-xs text-muted-foreground">{service.service}</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {statusIcons[service.status]}
                    <span className="ml-2 text-sm">{service.status}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{service.time}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="hover:bg-primary hover:text-primary-foreground">
              Ver todos os serviços
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gráficos e estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="animate-fade-in delay-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" /> Resumo Semanal
            </CardTitle>
            <CardDescription>Resumo dos serviços da semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Dados do gráfico serão carregados aqui
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-in delay-200">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5" /> Faturamento Mensal
            </CardTitle>
            <CardDescription>Visão geral do faturamento mensal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Dados do gráfico serão carregados aqui
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
