
import React, { useState } from 'react';
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
  Download
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { generateUniqueId } from '@/lib/utils';
import { toast } from 'sonner';

// Mock de transações financeiras
const mockTransacoes = [
  {
    id: '1',
    tipo: 'receita',
    categoria: 'Serviço',
    descricao: 'OS #123 - Troca de Óleo',
    valor: 150.00,
    data: new Date('2023-04-10')
  },
  {
    id: '2',
    tipo: 'receita',
    categoria: 'Serviço',
    descricao: 'OS #124 - Revisão Completa',
    valor: 350.00,
    data: new Date('2023-04-09')
  },
  {
    id: '3',
    tipo: 'despesa',
    categoria: 'Fornecedor',
    descricao: 'Compra de peças - Auto Parts LTDA',
    valor: 500.00,
    data: new Date('2023-04-08')
  },
  {
    id: '4',
    tipo: 'receita',
    categoria: 'Serviço',
    descricao: 'OS #125 - Troca de Pastilhas de Freio',
    valor: 220.00,
    data: new Date('2023-04-08')
  },
  {
    id: '5',
    tipo: 'despesa',
    categoria: 'Funcionários',
    descricao: 'Pagamento de salários',
    valor: 3500.00,
    data: new Date('2023-04-05')
  },
  {
    id: '6',
    tipo: 'despesa',
    categoria: 'Aluguel',
    descricao: 'Aluguel do mês',
    valor: 1200.00,
    data: new Date('2023-04-05')
  },
  {
    id: '7',
    tipo: 'receita',
    categoria: 'Serviço',
    descricao: 'OS #126 - Reparo no sistema elétrico',
    valor: 380.00,
    data: new Date('2023-04-07')
  }
];

// Resumo financeiro
const calcularResumo = () => {
  const receitas = mockTransacoes
    .filter(t => t.tipo === 'receita')
    .reduce((acc, t) => acc + t.valor, 0);
  
  const despesas = mockTransacoes
    .filter(t => t.tipo === 'despesa')
    .reduce((acc, t) => acc + t.valor, 0);
  
  return {
    receitas,
    despesas,
    saldo: receitas - despesas
  };
};

// Formatar valor em reais
const formatarReais = (valor: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

// Schema de transação
const transacaoFormSchema = z.object({
  tipo: z.enum(['receita', 'despesa']),
  categoria: z.string().min(1, { message: 'Selecione uma categoria' }),
  descricao: z.string().min(3, { message: 'A descrição deve ter pelo menos 3 caracteres' }),
  valor: z.string().min(1, { message: 'Informe o valor' }),
  data: z.string().min(1, { message: 'Selecione uma data' })
});

// Categorias
const categoriasPorTipo = {
  receita: ['Serviço', 'Venda de Peças', 'Outros'],
  despesa: ['Fornecedor', 'Funcionários', 'Aluguel', 'Contas', 'Impostos', 'Outros']
};

const FinanceiroPage = () => {
  const resumo = calcularResumo();
  const [filtroTipo, setFiltroTipo] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const form = useForm<z.infer<typeof transacaoFormSchema>>({
    resolver: zodResolver(transacaoFormSchema),
    defaultValues: {
      tipo: 'receita',
      categoria: '',
      descricao: '',
      valor: '',
      data: format(new Date(), 'yyyy-MM-dd')
    }
  });

  // Filtrar transações
  const transacoesFiltradas = filtroTipo 
    ? mockTransacoes.filter(t => t.tipo === filtroTipo)
    : mockTransacoes;
  
  // Ordenar por data (mais recente primeiro)
  const transacoesOrdenadas = [...transacoesFiltradas].sort((a, b) => 
    b.data.getTime() - a.data.getTime()
  );

  // Adicionar nova transação
  const onSubmit = (data: z.infer<typeof transacaoFormSchema>) => {
    const valorNumerico = parseFloat(data.valor.replace(',', '.'));
    
    if (isNaN(valorNumerico)) {
      toast.error('Valor inválido');
      return;
    }
    
    // Aqui seria a lógica para adicionar a transação
    const novaTransacao = {
      id: generateUniqueId(),
      tipo: data.tipo,
      categoria: data.categoria,
      descricao: data.descricao,
      valor: valorNumerico,
      data: new Date(data.data)
    };
    
    console.log('Nova transação:', novaTransacao);
    toast.success(`${data.tipo === 'receita' ? 'Receita' : 'Despesa'} adicionada com sucesso!`);
    setDialogOpen(false);
    form.reset();
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
                              className={`flex-1 flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/30 ${field.value === 'receita' ? 'bg-primary/10 border-primary' : ''}`}
                              onClick={() => field.onChange('receita')}
                            >
                              <ArrowUpCircle className={`h-5 w-5 ${field.value === 'receita' ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span>Receita</span>
                            </div>
                            <div 
                              className={`flex-1 flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-muted/30 ${field.value === 'despesa' ? 'bg-destructive/10 border-destructive' : ''}`}
                              onClick={() => field.onChange('despesa')}
                            >
                              <ArrowDownCircle className={`h-5 w-5 ${field.value === 'despesa' ? 'text-destructive' : 'text-muted-foreground'}`} />
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
              +15% em relação ao mês anterior
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
              +8% em relação ao mês anterior
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
              {resumo.saldo >= 0 ? '+22% em relação ao mês anterior' : '-10% em relação ao mês anterior'}
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
                      variant={filtroTipo === 'receita' ? "default" : "outline"}
                      onClick={() => setFiltroTipo('receita')}
                    >
                      <ArrowUpCircle className="h-4 w-4 mr-1 text-green-500" /> Receitas
                    </Button>
                    <Button 
                      variant={filtroTipo === 'despesa' ? "default" : "outline"}
                      onClick={() => setFiltroTipo('despesa')}
                    >
                      <ArrowDownCircle className="h-4 w-4 mr-1 text-destructive" /> Despesas
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Período:</span>
                    <Select defaultValue="mes">
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
                      {transacoesOrdenadas.map(transacao => (
                        <TableRow key={transacao.id} className="hover-scale">
                          <TableCell className="font-medium">
                            {format(transacao.data, 'dd/MM/yyyy', { locale: ptBR })}
                          </TableCell>
                          <TableCell>{transacao.descricao}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-muted/50">
                              {transacao.categoria}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={`font-medium ${transacao.tipo === 'receita' ? 'text-green-500' : 'text-destructive'}`}>
                              {transacao.tipo === 'despesa' ? '- ' : '+ '}
                              {formatarReais(transacao.valor)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {transacoesOrdenadas.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                            Nenhuma transação encontrada para o filtro selecionado
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
