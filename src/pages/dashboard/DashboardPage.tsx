
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart3, 
  Wrench, 
  TrendingUp, 
  Calendar, 
  Car,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronRight,
  CheckSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';

// Types for the data
type ServiceOrderSummary = {
  id: string;
  client_name: string;
  vehicle_model: string;
  service_type: string;
  status: string;
  created_at: string;
  total_cost: number;
};

type FinancialSummary = {
  total_income: number;
  total_expense: number;
  balance: number;
  income_percent_change: number;
};

const statusIcons: Record<string, JSX.Element> = {
  'completed': <CheckCircle className="h-5 w-5 text-green-500" />,
  'in_progress': <Clock className="h-5 w-5 text-amber-500" />,
  'open': <AlertCircle className="h-5 w-5 text-blue-500" />,
};

const statusLabels: Record<string, string> = {
  'completed': 'Concluído',
  'in_progress': 'Em andamento',
  'open': 'Em aberto',
};

const DashboardPage = () => {
  const [todayServices, setTodayServices] = useState<ServiceOrderSummary[]>([]);
  const [serviceCount, setServiceCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary>({
    total_income: 0,
    total_expense: 0,
    balance: 0,
    income_percent_change: 0,
  });
  const [loading, setLoading] = useState(true);
  const [finalizingService, setFinalizingService] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchTodayServices(),
        fetchServiceCount(),
        fetchAppointmentCount(),
        fetchFinancialSummary(),
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayServices = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { data, error } = await supabase
      .from('service_orders')
      .select(`
        id,
        service_type,
        status,
        created_at,
        total_cost,
        clients!inner(name),
        vehicles!inner(model)
      `)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(3);

    if (error) {
      throw error;
    }

    setTodayServices(data.map(item => ({
      id: item.id,
      client_name: item.clients.name,
      vehicle_model: item.vehicles.model,
      service_type: item.service_type,
      status: item.status,
      created_at: item.created_at,
      total_cost: parseFloat(String(item.total_cost))
    })) || []);
  };

  const fetchServiceCount = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const { count, error } = await supabase
      .from('service_orders')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', today.toISOString());

    if (error) {
      throw error;
    }

    setServiceCount(count || 0);
  };

  const fetchAppointmentCount = async () => {
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);
    
    const { count, error } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', threeDaysLater.toISOString());

    if (error) {
      throw error;
    }

    setAppointmentCount(count || 0);
  };

  const fetchFinancialSummary = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Get today's income
    const { data: incomeData, error: incomeError } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'income')
      .eq('date', today.toISOString().split('T')[0]);

    if (incomeError) {
      throw incomeError;
    }

    // Calculate today's income
    const todayIncome = incomeData?.reduce((sum, item) => sum + parseFloat(String(item.amount)), 0) || 0;

    // Get today's expenses
    const { data: expenseData, error: expenseError } = await supabase
      .from('financial_transactions')
      .select('amount')
      .eq('type', 'expense')
      .eq('date', today.toISOString().split('T')[0]);

    if (expenseError) {
      throw expenseError;
    }

    // Calculate today's expenses
    const todayExpense = expenseData?.reduce((sum, item) => sum + parseFloat(String(item.amount)), 0) || 0;

    // Calculate balance
    const balance = todayIncome - todayExpense;

    // Simulate percent change (would normally compare with previous period)
    const incomePercentChange = 12; // Dummy value for now

    setFinancialSummary({
      total_income: todayIncome,
      total_expense: todayExpense,
      balance: balance,
      income_percent_change: incomePercentChange,
    });
  };

  // Function to finalize a service
  const finalizeService = async (serviceId: string, totalCost: number) => {
    try {
      setFinalizingService(serviceId);
      
      // Update service status to completed and set completed_at date
      const { error: updateError } = await supabase
        .from('service_orders')
        .update({ 
          status: 'completed', 
          completed_at: new Date().toISOString() 
        })
        .eq('id', serviceId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Create financial transaction record
      const today = new Date().toISOString().split('T')[0];
      
      const { error: financialError } = await supabase
        .from('financial_transactions')
        .insert([{
          type: 'income',
          category: 'Serviço',
          description: 'Serviço finalizado via dashboard',
          amount: totalCost,
          date: today,
          service_order_id: serviceId
        }]);
      
      if (financialError) {
        throw financialError;
      }
      
      // Update local state to reflect changes
      setTodayServices(prevServices => 
        prevServices.map(service => 
          service.id === serviceId 
            ? { ...service, status: 'completed' } 
            : service
        )
      );
      
      // Refresh financial data
      await fetchFinancialSummary();
      
      toast({
        title: 'Serviço finalizado',
        description: 'O serviço foi finalizado e adicionado ao faturamento',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error finalizing service:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível finalizar o serviço',
        variant: 'destructive'
      });
    } finally {
      setFinalizingService(null);
    }
  };

  // Format currency in BRL
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Format time from ISO string
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={fetchDashboardData}>Atualizar Dados</Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Carregando dados do dashboard...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card de Serviços do Dia */}
            <Card className="animate-fade-in card-transition delay-100">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-sm font-medium">Serviços do Dia</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{serviceCount}</div>
                <p className="text-xs text-muted-foreground">
                  Ordens de serviço abertas hoje
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
                <div className="text-2xl font-bold">{formatCurrency(financialSummary.total_income)}</div>
                <p className="text-xs text-muted-foreground">
                  +{financialSummary.income_percent_change}% em relação à semana anterior
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
                <div className="text-2xl font-bold">{appointmentCount}</div>
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
              {todayServices.length > 0 ? (
                <div className="space-y-4">
                  {todayServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover-scale"
                    >
                      <div className="flex items-center space-x-4">
                        <Car className="h-8 w-8 text-primary" />
                        <div>
                          <div className="font-medium">{service.client_name}</div>
                          <div className="text-sm text-muted-foreground">{service.vehicle_model}</div>
                          <div className="text-xs text-muted-foreground">{service.service_type}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          {statusIcons[service.status] || <AlertCircle className="h-5 w-5 text-blue-500" />}
                          <span className="ml-2 text-sm">{statusLabels[service.status] || service.status}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">{formatTime(service.created_at)}</span>
                        
                        {service.status !== 'completed' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="ml-2 flex items-center gap-1 text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700"
                            onClick={() => finalizeService(service.id, service.total_cost)}
                            disabled={finalizingService === service.id}
                          >
                            {finalizingService === service.id ? (
                              <>Finalizando...</>
                            ) : (
                              <>
                                <CheckSquare className="h-4 w-4" />
                                Finalizar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
                  <Wrench className="h-10 w-10 mb-2" />
                  <p>Nenhum serviço registrado hoje</p>
                </div>
              )}
              
              <div className="mt-4 flex justify-end">
                <Link to="/historico">
                  <Button variant="outline" className="flex items-center hover:bg-primary hover:text-primary-foreground">
                    Ver todos os serviços <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos e estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="animate-fade-in delay-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5" /> Resumo Financeiro
                </CardTitle>
                <CardDescription>Resumo das receitas e despesas diárias</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Receitas:</div>
                    <div className="font-medium text-green-600">{formatCurrency(financialSummary.total_income)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">Despesas:</div>
                    <div className="font-medium text-red-600">{formatCurrency(financialSummary.total_expense)}</div>
                  </div>
                  <div className="border-t pt-2 flex justify-between items-center">
                    <div className="font-medium">Saldo:</div>
                    <div className={`font-bold ${financialSummary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(financialSummary.balance)}
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <Link to="/financeiro">
                      <Button variant="link" className="flex items-center p-0">
                        Ver detalhes <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-in delay-200">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" /> Peças com Estoque Baixo
                </CardTitle>
                <CardDescription>Peças que precisam de reposição</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                  Esta funcionalidade será implementada em breve
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPage;
