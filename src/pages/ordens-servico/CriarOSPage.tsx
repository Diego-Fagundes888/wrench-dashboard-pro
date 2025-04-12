
import React, { useState } from 'react';
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Trash, Save, CheckCircle2 } from 'lucide-react';
import { generateUniqueId } from '@/lib/utils';
import { toast } from 'sonner';

// Mock de peças
const pecasDisponiveis = [
  { id: '1', nome: 'Óleo de Motor 5W30', preco: 35.90 },
  { id: '2', nome: 'Filtro de Óleo', preco: 25.50 },
  { id: '3', nome: 'Filtro de Ar', preco: 45.00 },
  { id: '4', nome: 'Pastilha de Freio', preco: 120.00 },
  { id: '5', nome: 'Amortecedor Dianteiro', preco: 350.00 },
];

// Schema de validação
const osFormSchema = z.object({
  cliente: z.string().min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  veiculo: z.string().min(3, { message: 'Veículo deve ter pelo menos 3 caracteres' }),
  placa: z.string().min(7, { message: 'Placa inválida' }),
  ano: z.string().min(4, { message: 'Ano inválido' }),
  tipoServico: z.string().min(1, { message: 'Selecione o tipo de serviço' }),
  descricao: z.string(),
  valorMaoDeObra: z.string().min(1, { message: 'Informe o valor da mão de obra' }),
});

const CriarOSPage = () => {
  const form = useForm<z.infer<typeof osFormSchema>>({
    resolver: zodResolver(osFormSchema),
    defaultValues: {
      cliente: '',
      telefone: '',
      veiculo: '',
      placa: '',
      ano: '',
      tipoServico: '',
      descricao: '',
      valorMaoDeObra: '',
    },
  });

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
  
  const adicionarPeca = () => {
    if (!pecaSelecionada) {
      toast.error('Selecione uma peça');
      return;
    }
    
    const peca = pecasDisponiveis.find(p => p.id === pecaSelecionada);
    if (!peca) return;
    
    const novaPeca = {
      id: generateUniqueId(),
      pecaId: peca.id,
      nome: peca.nome,
      quantidade,
      preco: peca.preco
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
    
    const maoDeObra = parseFloat(valorMaoDeObra) || 0;
    setTotalOS(totalPecas + maoDeObra);
  };
  
  const onSubmit = (data: z.infer<typeof osFormSchema>) => {
    // Aqui implementaria a lógica para salvar a OS
    const maoDeObraFloat = parseFloat(data.valorMaoDeObra);
    
    // Exemplo do objeto completo de OS
    const ordemServico = {
      ...data,
      valorMaoDeObra: maoDeObraFloat,
      pecas: pecasSelecionadas,
      totalPecas,
      totalOS,
      data: new Date(),
      status: 'Aberta',
      id: generateUniqueId()
    };
    
    console.log('Ordem de Serviço criada:', ordemServico);
    
    // Simulação de sucesso
    toast.success('Ordem de serviço criada com sucesso!');
  };
  
  const handleMaoDeObraChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valor = e.target.value;
    form.setValue('valorMaoDeObra', valor);
    calcularTotais(pecasSelecionadas, valor);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Nova Ordem de Serviço</h1>
      </div>

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
                      <FormLabel>Nome do Cliente</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
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
              </div>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="veiculo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veículo</FormLabel>
                      <FormControl>
                        <Input placeholder="Modelo do veículo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                  <FormField
                    control={form.control}
                    name="ano"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ano</FormLabel>
                        <FormControl>
                          <Input placeholder="2022" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
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
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de serviço" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="revisao">Revisão</SelectItem>
                          <SelectItem value="manutencao">Manutenção</SelectItem>
                          <SelectItem value="reparo">Reparo</SelectItem>
                          <SelectItem value="troca_oleo">Troca de Óleo</SelectItem>
                          <SelectItem value="freios">Sistema de Freios</SelectItem>
                          <SelectItem value="suspensao">Suspensão</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
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
                          {peca.nome} - R$ {peca.preco.toFixed(2)}
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

              {pecasSelecionadas.length > 0 && (
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
                          <TableCell>R$ {peca.preco.toFixed(2)}</TableCell>
                          <TableCell>R$ {(peca.preco * peca.quantidade).toFixed(2)}</TableCell>
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
              )}

              <div className="flex justify-end space-x-4 font-medium">
                <div>Total de Peças: R$ {totalPecas.toFixed(2)}</div>
                <div>Total da OS: R$ {totalOS.toFixed(2)}</div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-end space-x-4">
              <Button type="button" variant="outline">Cancelar</Button>
              <Button type="submit" variant="outline" className="bg-primary/20">
                <Save className="mr-2 h-4 w-4" /> Salvar OS
              </Button>
              <Button type="submit" className="animate-pulse">
                <CheckCircle2 className="mr-2 h-4 w-4" /> Finalizar OS
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
};

export default CriarOSPage;
