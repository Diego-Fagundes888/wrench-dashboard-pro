
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Plus,
  PieChart,
  Calendar,
  Download,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Schema de transação
const transacaoFormSchema = z.object({
  tipo: z.enum(['income', 'expense']),
  categoria: z.string().min(1, { message: 'Selecione uma categoria' }),
  descricao: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
  valor: z.string().min(1, { message: 'Informe o valor' }),
  data: z.string().min(1, { message: 'Selecione uma data' })
});

// Interface para transações
interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string | null;
  amount: number;
  date: string;
  created_at: string;
  service_order_id: string | null;
}

// Categorias
const categoriasPorTipo = {
  income: ['Serviço', 'Venda de Peças', 'Outros'],
  expense: ['Fornecedor', 'Funcionários', 'Aluguel', 'Contas', 'Impostos', 'Outros']
};

const FinanceiroPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState('mes');
  
  const form = useForm<z.infer<typeof transacaoFormSchema>>({
    resolver: zodResolver(transacaoFormSchema),
    defaultValues: {
      tipo: 'income',
      categoria: '',
      descricao: '',
      valor: '',
      data: format(new Date(), 'yyyy-MM-dd')
    }
  });

  // Fetch transactions when component loads
  useEffect(() => {
    fetchTransactions();
  }, []);

  // Fetch transactions from Supabase
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('financial_transactions')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        throw error;
      }

      // Convert string type to 'income' or 'expense' type
      const typedData = data?.map(item => ({
        ...item,
        type: item.type === 'income' ? 'income' : 'expense'
      } as Transaction)) || [];

      setTransactions(typedData);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as transações',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate financial summary
  const calcularResumo = () => {
    const periodoFiltrado = filtrarTransacoesPorPeriodo(transactions, periodo);
    
    const receitas = periodoFiltrado
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
    
    const despesas = periodoFiltrado
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
    
    return {
      receitas,
      despesas,
      saldo: receitas - despesas
    };
  };

  const resumo = calcularResumo();

  // Filter transactions by period
  const filtrarTransacoesPorPeriodo = (transacoes: Transaction[], periodo: string) => {
    const hoje = new Date();
    const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    
    return transacoes.filter(transacao => {
      const dataTransacao = new Date(transacao.date);
      
      switch (periodo) {
        case 'hoje':
          return dataTransacao >= inicioHoje;
        case 'semana': {
          const inicioSemana = new Date(hoje);
          inicioSemana.setDate(hoje.getDate() - hoje.getDay());
          inicioSemana.setHours(0, 0, 0, 0);
          return dataTransacao >= inicioSemana;
        }
        case 'mes': {
          const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
          return dataTransacao >= inicioMes;
        }
        case 'trimestre': {
          const inicioTrimestre = new Date(hoje.getFullYear(), Math.floor(hoje.getMonth() / 3) * 3, 1);
          return dataTransacao >= inicioTrimestre;
        }
        case 'ano': {
          const inicioAno = new Date(hoje.getFullYear(), 0, 1);
          return dataTransacao >= inicioAno;
        }
        default:
          return true;
      }
    });
  };

  // Filter by type
  const transacoesFiltradas = filtroTipo 
    ? transactions.filter(t => t.type === filtroTipo)
    : transactions;
  
  // Filter by period
  const transacoesPorPeriodo = filtrarTransacoesPorPeriodo(transacoesFiltradas, periodo);
  
  // Ordenar por data (mais recente primeiro)
  const transacoesOrdenadas = [...transacoesPorPeriodo];

  // Add new transaction
  const onSubmit = async (data: z.infer<typeof transacaoFormSchema>) => {
    try {
      const valorNumerico = parseFloat(data.valor.replace(',', '.'));
      
      if (isNaN(valorNumerico)) {
        toast({
          title: 'Erro',
          description: 'Valor inválido',
          variant: 'destructive'
        });
        return;
      }
      
      const novaTransacao = {
        type: data.tipo,
        category: data.categoria,
        description: data.descricao,
        amount: valorNumerico,
        date: data.data
      };
      
      const { error } = await supabase
        .from('financial_transactions')
        .insert([novaTransacao]);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: `${data.tipo === 'income' ? 'Receita' : 'Despesa'} adicionada com sucesso!`
      });
      
      setDialogOpen(false);
      form.reset();
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a transação',
        variant: 'destructive'
      });
    }
  };

  // Format currency in BRL
  const formatarReais = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <div className="flex space-x-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Transação Financeira</DialogTitle>
                <DialogDescription>
                  Adicione uma nova receita ou despesa ao sistema.
                </DialogDescription>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                  <FormField
                    control={form.control}
                    name="tipo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <FormControl>
                          <div className="flex gap-4">
                            <div 
                              className={`flex-1 flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/30 ${field.value === 'income' ? 'bg-primary/10 border-primary' : ''}`}
                              onClick={() => field.onChange('income')}
                            >
                              <ArrowUpCircle className={`h-5 w-5 ${field.value === 'income' ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span>Receita</span>
                            </div>
                            <div 
                              className={`flex-1 flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/30 ${field.value === 'expense' ? 'bg-destructive/10 border-destructive' : ''}`}
                              onClick={() => field.onChange('expense')}
                            >
                              <ArrowDownCircle className={`h-5 w-5 ${field.value === 'expense' ? 'text-destructive' : 'text-muted-foreground'}`} />
                              <span>Despesa</span>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="categoria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categoria</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma categoria" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categoriasPorTipo[form.watch('tipo') as keyof typeof categoriasPorTipo].map(cat => (
                              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Input placeholder="Descreva a transação" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="0,00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="data"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Salvar Transação</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de Receitas */}
        <Card className="animate-fade-in card-transition delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{formatarReais(resumo.receitas)}</div>
            <p className="text-xs text-muted-foreground">
              {periodo === 'mes' ? 'Neste mês' : periodo === 'semana' ? 'Nesta semana' : periodo === 'hoje' ? 'Hoje' : 
                periodo === 'trimestre' ? 'Neste trimestre' : 'Neste ano'}
            </p>
          </CardContent>
        </Card>

        {/* Card de Despesas */}
        <Card className="animate-fade-in card-transition delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
            <ArrowDownCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatarReais(resumo.despesas)}</div>
            <p className="text-xs text-muted-foreground">
              {periodo === 'mes' ? 'Neste mês' : periodo === 'semana' ? 'Nesta semana' : periodo === 'hoje' ? 'Hoje' : 
                periodo === 'trimestre' ? 'Neste trimestre' : 'Neste ano'}
            </p>
          </CardContent>
        </Card>

        {/* Card de Lucro */}
        <Card className="animate-fade-in card-transition delay-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${resumo.saldo >= 0 ? 'text-green-500' : 'text-destructive'}`}>
              {formatarReais(resumo.saldo)}
            </div>
            <p className="text-xs text-muted-foreground">
              {periodo === 'mes' ? 'Neste mês' : periodo === 'semana' ? 'Nesta semana' : periodo === 'hoje' ? 'Hoje' : 
                periodo === 'trimestre' ? 'Neste trimestre' : 'Neste ano'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Visão Financeira</CardTitle>
          <CardDescription>Visualize suas receitas e despesas por período</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="transacoes" className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="transacoes" className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Transações
              </TabsTrigger>
              <TabsTrigger value="mensal" className="flex items-center gap-1">
                <TrendingUp className="h-4 w-4" /> Visão Mensal
              </TabsTrigger>
              <TabsTrigger value="graficos" className="flex items-center gap-1">
                <PieChart className="h-4 w-4" /> Gráficos
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transacoes">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="space-x-2">
                    <Button 
                      variant={filtroTipo === null ? "default" : "outline"}
                      onClick={() => setFiltroTipo(null)}
                    >
                      Todas
                    </Button>
                    <Button 
                      variant={filtroTipo === 'income' ? "default" : "outline"}
                      onClick={() => setFiltroTipo('income')}
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1 text-green-500" /> Receitas
                    </Button>
                    <Button 
                      variant={filtroTipo === 'expense' ? "default" : "outline"}
                      onClick={() => setFiltroTipo('expense')}
                    >
                      <ArrowDownCircle className="h-4 w-4 mr-1 text-destructive" /> Despesas
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <Select 
                      defaultValue={periodo}
                      onValueChange={setPeriodo}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Selecione o período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hoje">Hoje</SelectItem>
                        <SelectItem value="semana">Esta Semana</SelectItem>
                        <SelectItem value="mes">Este Mês</SelectItem>
                        <SelectItem value="trimestre">Último Trimestre</SelectItem>
                        <SelectItem value="ano">Este Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Data</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Categoria</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {transacoesOrdenadas.length > 0 ? (
                          transacoesOrdenadas.map(transacao => (
                            <TableRow key={transacao.id} className="hover-scale">
                              <TableCell className="font-medium">
                                {format(new Date(transacao.date), 'dd/MM/yyyy', { locale: ptBR })}
                              </TableCell>
                              <TableCell>{transacao.description || '-'}</TableCell>
                              <TableCell>
                                <span className="px-2 py-1 text-xs rounded-full bg-muted/50">
                                  {transacao.category}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span className={`font-medium ${transacao.type === 'income' ? 'text-green-500' : 'text-destructive'}`}>
                                  {transacao.type === 'expense' ? '- ' : '+ '}
                                  {formatarReais(transacao.amount)}
                                </span>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                              Nenhuma transação encontrada para o filtro selecionado
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="mensal">
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Gráfico de visão mensal será exibido aqui
              </div>
            </TabsContent>
            
            <TabsContent value="graficos">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-[300px] border rounded-md p-4 flex flex-col">
                  <h3 className="text-sm font-medium pb-2">Receitas por Categoria</h3>
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Gráfico de pizza será exibido aqui
                  </div>
                </div>
                
                <div className="h-[300px] border rounded-md p-4 flex flex-col">
                  <h3 className="text-sm font-medium pb-2">Despesas por Categoria</h3>
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    Gráfico de pizza será exibido aqui
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceiroPage;
