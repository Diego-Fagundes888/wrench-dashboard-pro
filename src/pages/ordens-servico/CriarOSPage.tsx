
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash, Save, CheckCircle2, Loader2, UserPlus, Car } from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from 'react-router-dom';

// Schema para cliente
const clienteSchema = z.object({
  nome: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }).optional(),
  email: z.string().email({ message: 'Email inválido' }).optional().or(z.literal('')),
  endereco: z.string().optional(),
});

// Schema para veículo
const veiculoSchema = z.object({
  modelo: z.string().min(3, { message: 'Modelo deve ter pelo menos 3 caracteres' }),
  placa: z.string().min(7, { message: 'Placa inválida' }),
  ano: z.string().optional(),
  cor: z.string().optional(),
});

// Schema de validação
const osFormSchema = z.object({
  cliente: z.string().min(1, { message: 'Selecione um cliente' }),
  veiculo: z.string().min(1, { message: 'Selecione um veículo' }),
  tipoServico: z.string().min(1, { message: 'Selecione o tipo de serviço' }),
  descricao: z.string().optional(),
  valorMaoDeObra: z.string().min(1, { message: 'Informe o valor da mão de obra' }),
});

// Tipos
interface Cliente {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

interface Veiculo {
  id: string;
  model: string;
  plate: string;
  year: string | null;
  color: string | null;
  client_id: string;
}

interface Peca {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const CriarOSPage = () => {
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof osFormSchema>>({
    resolver: zodResolver(osFormSchema),
    defaultValues: {
      cliente: '',
      veiculo: '',
      tipoServico: '',
      descricao: '',
      valorMaoDeObra: '',
    },
  });

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [veiculosDoCliente, setVeiculosDoCliente] = useState<Veiculo[]>([]);
  const [pecasDisponiveis, setPecasDisponiveis] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddClienteDialog, setShowAddClienteDialog] = useState(false);
  const [showAddVeiculoDialog, setShowAddVeiculoDialog] = useState(false);
  
  const [pecasSelecionadas, setPecasSelecionadas] = useState<Array<{
    id: string;
    pecaId: string;
    nome: string;
    quantidade: number;
    preco: number;
  }>>([]);
  
  const [pecaSelecionada, setPecaSelecionada] = useState('');
  const [quantidade, setQuantidade] = useState(1);
  const [totalPecas, setTotalPecas] = useState(0);
  const [totalOS, setTotalOS] = useState(0);

  // Forms para adicionar cliente e veículo
  const clienteForm = useForm<z.infer<typeof clienteSchema>>({
    resolver: zodResolver(clienteSchema),
    defaultValues: {
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
    }
  });

  const veiculoForm = useForm<z.infer<typeof veiculoSchema>>({
    resolver: zodResolver(veiculoSchema),
    defaultValues: {
      modelo: '',
      placa: '',
      ano: '',
      cor: '',
    }
  });
  
  // Carregar dados iniciais
  useEffect(() => {
    fetchClientes();
    fetchVeiculos();
    fetchPecas();
  }, []);

  // Observar mudanças no cliente selecionado
  useEffect(() => {
    const clienteId = form.watch('cliente');
    if (clienteId) {
      const veiculosFiltrados = veiculos.filter(v => v.client_id === clienteId);
      setVeiculosDoCliente(veiculosFiltrados);
      // Limpar o veículo selecionado se o cliente mudar
      form.setValue('veiculo', '');
    } else {
      setVeiculosDoCliente([]);
    }
  }, [form.watch('cliente'), veiculos]);

  // Buscar clientes
  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Buscar veículos
  const fetchVeiculos = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('model');

      if (error) throw error;
      setVeiculos(data || []);
    } catch (error) {
      console.error('Erro ao buscar veículos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os veículos",
        variant: "destructive",
      });
    }
  };

  // Buscar peças
  const fetchPecas = async () => {
    try {
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name');

      if (error) throw error;
      setPecasDisponiveis(data || []);
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as peças",
        variant: "destructive",
      });
    }
  };

  // Adicionar cliente
  const handleAddCliente = async (data: z.infer<typeof clienteSchema>) => {
    try {
      const novoCliente = {
        name: data.nome,
        phone: data.telefone || null,
        email: data.email || null,
        address: data.endereco || null,
      };

      const { data: clienteInserido, error } = await supabase
        .from('clients')
        .insert([novoCliente])
        .select();

      if (error) throw error;

      toast({
        title: "Cliente adicionado",
        description: "Cliente cadastrado com sucesso",
      });

      setClientes([...clientes, clienteInserido[0]]);
      form.setValue('cliente', clienteInserido[0].id);
      setShowAddClienteDialog(false);
      clienteForm.reset();
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o cliente",
        variant: "destructive",
      });
    }
  };

  // Adicionar veículo
  const handleAddVeiculo = async (data: z.infer<typeof veiculoSchema>) => {
    try {
      const clienteId = form.getValues().cliente;
      
      if (!clienteId) {
        toast({
          title: "Erro",
          description: "Selecione um cliente primeiro",
          variant: "destructive",
        });
        return;
      }

      const novoVeiculo = {
        client_id: clienteId,
        model: data.modelo,
        plate: data.placa,
        year: data.ano || null,
        color: data.cor || null,
      };

      const { data: veiculoInserido, error } = await supabase
        .from('vehicles')
        .insert([novoVeiculo])
        .select();

      if (error) throw error;

      toast({
        title: "Veículo adicionado",
        description: "Veículo cadastrado com sucesso",
      });

      setVeiculos([...veiculos, veiculoInserido[0]]);
      setVeiculosDoCliente([...veiculosDoCliente, veiculoInserido[0]]);
      form.setValue('veiculo', veiculoInserido[0].id);
      setShowAddVeiculoDialog(false);
      veiculoForm.reset();
    } catch (error) {
      console.error('Erro ao adicionar veículo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o veículo",
        variant: "destructive",
      });
    }
  };
  
  const adicionarPeca = () => {
    if (!pecaSelecionada) {
      toast({
        title: "Erro",
        description: "Selecione uma peça",
        variant: "destructive",
      });
      return;
    }
    
    const peca = pecasDisponiveis.find(p => p.id === pecaSelecionada);
    if (!peca) return;

    // Verificar se há estoque suficiente
    if (peca.quantity < quantidade) {
      toast({
        title: "Estoque insuficiente",
        description: `Disponível: ${peca.quantity} unidades`,
        variant: "destructive",
      });
      return;
    }
    
    // Verificar se a peça já foi adicionada
    const pecaExistente = pecasSelecionadas.find(p => p.pecaId === peca.id);
    if (pecaExistente) {
      toast({
        title: "Peça já adicionada",
        description: "Ajuste a quantidade ou remova a peça para adicionar novamente",
        variant: "destructive",
      });
      return;
    }
    
    const novaPeca = {
      id: crypto.randomUUID(),
      pecaId: peca.id,
      nome: peca.name,
      quantidade,
      preco: peca.price
    };
    
    setPecasSelecionadas([...pecasSelecionadas, novaPeca]);
    setPecaSelecionada('');
    setQuantidade(1);
    
    calcularTotais([...pecasSelecionadas, novaPeca], form.getValues().valorMaoDeObra);
  };
  
  const removerPeca = (id: string) => {
    const novasPecas = pecasSelecionadas.filter(p => p.id !== id);
    setPecasSelecionadas(novasPecas);
    calcularTotais(novasPecas, form.getValues().valorMaoDeObra);
  };
  
  const calcularTotais = (pecas: typeof pecasSelecionadas, valorMaoDeObra: string) => {
    const totalPecas = pecas.reduce((soma, peca) => soma + (peca.preco * peca.quantidade), 0);
    setTotalPecas(totalPecas);
    
    const maoDeObra = parseFloat(valorMaoDeObra.replace(',', '.')) || 0;
    setTotalOS(totalPecas + maoDeObra);
  };
  
  const handleMaoDeObraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    form.setValue('valorMaoDeObra', valor);
    calcularTotais(pecasSelecionadas, valor);
  };

  // Criar OS
  const onSubmit = async (data: z.infer<typeof osFormSchema>) => {
    try {
      setSubmitting(true);
      const valorMaoDeObra = parseFloat(data.valorMaoDeObra.replace(',', '.')) || 0;
      
      // Criar a OS principal
      const { data: ordemInserida, error: ordemError } = await supabase
        .from('service_orders')
        .insert([{
          client_id: data.cliente,
          vehicle_id: data.veiculo,
          service_type: data.tipoServico,
          description: data.descricao,
          labor_cost: valorMaoDeObra,
          parts_cost: totalPecas,
          total_cost: totalOS,
          status: 'open'
        }])
        .select();

      if (ordemError) throw ordemError;

      // Se houver peças, inserir as peças da OS
      if (pecasSelecionadas.length > 0) {
        const pecasParaInserir = pecasSelecionadas.map(peca => ({
          service_order_id: ordemInserida[0].id,
          part_id: peca.pecaId,
          quantity: peca.quantidade,
          price: peca.preco,
          subtotal: peca.preco * peca.quantidade
        }));

        const { error: pecasError } = await supabase
          .from('service_order_parts')
          .insert(pecasParaInserir);

        if (pecasError) throw pecasError;
      }

      toast({
        title: "Ordem de Serviço criada",
        description: `OS #${ordemInserida[0].number} criada com sucesso`,
      });

      // Redirecionamento após criação bem-sucedida
      navigate('/historico');
    } catch (error) {
      console.error('Erro ao criar OS:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a ordem de serviço",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Formatação de moeda
  const formatarReais = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente e Veículo</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Selecione um cliente" />
                              </SelectTrigger>
                              <SelectContent>
                                {clientes.map(cliente => (
                                  <SelectItem key={cliente.id} value={cliente.id}>
                                    {cliente.name} {cliente.phone ? `- ${cliente.phone}` : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <Button 
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowAddClienteDialog(true)}
                          >
                            <UserPlus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="veiculo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Veículo</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <Select onValueChange={field.onChange} value={field.value} disabled={!form.getValues().cliente}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder={form.getValues().cliente ? "Selecione um veículo" : "Selecione um cliente primeiro"} />
                              </SelectTrigger>
                              <SelectContent>
                                {veiculosDoCliente.map(veiculo => (
                                  <SelectItem key={veiculo.id} value={veiculo.id}>
                                    {veiculo.model} - {veiculo.plate}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <Button 
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setShowAddVeiculoDialog(true)}
                            disabled={!form.getValues().cliente}
                          >
                            <Car className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Serviço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="tipoServico"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Serviço</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo de serviço" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Revisão">Revisão</SelectItem>
                            <SelectItem value="Manutenção">Manutenção</SelectItem>
                            <SelectItem value="Reparo">Reparo</SelectItem>
                            <SelectItem value="Troca de Óleo">Troca de Óleo</SelectItem>
                            <SelectItem value="Sistema de Freios">Sistema de Freios</SelectItem>
                            <SelectItem value="Suspensão">Suspensão</SelectItem>
                            <SelectItem value="Sistema Elétrico">Sistema Elétrico</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="valorMaoDeObra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mão de Obra (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="0,00" {...field} onChange={handleMaoDeObraChange} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Serviço</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva os detalhes do serviço a ser realizado..." 
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peças Utilizadas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <FormLabel>Peça</FormLabel>
                    <Select
                      value={pecaSelecionada}
                      onValueChange={setPecaSelecionada}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma peça" />
                      </SelectTrigger>
                      <SelectContent>
                        {pecasDisponiveis.map(peca => (
                          <SelectItem key={peca.id} value={peca.id}>
                            {peca.name} - {formatarReais(peca.price)} - Estoque: {peca.quantity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <FormLabel>Quantidade</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={quantidade}
                      onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <Button 
                    type="button" 
                    onClick={adicionarPeca} 
                    className="flex items-center"
                  >
                    <Plus className="mr-1 h-4 w-4" /> Adicionar
                  </Button>
                </div>

                {pecasSelecionadas.length > 0 ? (
                  <div className="border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Peça</TableHead>
                          <TableHead>Quantidade</TableHead>
                          <TableHead>Preço Unit.</TableHead>
                          <TableHead>Subtotal</TableHead>
                          <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pecasSelecionadas.map((peca) => (
                          <TableRow key={peca.id} className="hover-scale">
                            <TableCell>{peca.nome}</TableCell>
                            <TableCell>{peca.quantidade}</TableCell>
                            <TableCell>{formatarReais(peca.preco)}</TableCell>
                            <TableCell>{formatarReais(peca.preco * peca.quantidade)}</TableCell>
                            <TableCell>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => removerPeca(peca.id)}
                              >
                                <Trash className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4 border border-dashed rounded-md">
                    Nenhuma peça adicionada
                  </div>
                )}

                <div className="flex justify-end space-x-4 font-medium">
                  <div>Total de Peças: {formatarReais(totalPecas)}</div>
                  <div>Total da OS: {formatarReais(totalOS)}</div>
                </div>
              </CardContent>

              <CardFooter className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => navigate('/historico')}>Cancelar</Button>
                <Button 
                  type="submit" 
                  variant="outline" 
                  className="bg-primary/20"
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Salvando</>
                  ) : (
                    <><Save className="mr-2 h-4 w-4" /> Salvar OS</>
                  )}
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando</>
                  ) : (
                    <><CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar OS</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      )}

      {/* Dialog para adicionar cliente */}
      <Dialog open={showAddClienteDialog} onOpenChange={setShowAddClienteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados do cliente para cadastrá-lo no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...clienteForm}>
            <form onSubmit={clienteForm.handleSubmit(handleAddCliente)} className="space-y-4 py-4">
              <FormField
                control={clienteForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={clienteForm.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={clienteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={clienteForm.control}
                name="endereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Endereço completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddClienteDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Cliente</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para adicionar veículo */}
      <Dialog open={showAddVeiculoDialog} onOpenChange={setShowAddVeiculoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Veículo</DialogTitle>
            <DialogDescription>
              Preencha os dados do veículo para o cliente selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...veiculoForm}>
            <form onSubmit={veiculoForm.handleSubmit(handleAddVeiculo)} className="space-y-4 py-4">
              <FormField
                control={veiculoForm.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Modelo do veículo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={veiculoForm.control}
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={veiculoForm.control}
                  name="ano"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ano (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="2022" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={veiculoForm.control}
                  name="cor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor (opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Cor do veículo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddVeiculoDialog(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Veículo</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CriarOSPage;
