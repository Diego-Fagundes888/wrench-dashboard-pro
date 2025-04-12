
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { generateUniqueId } from '@/lib/utils';
import { toast } from 'sonner';

// Mock de peças
const mockPecas = [
  { 
    id: '1', 
    codigo: 'OLT-5W30', 
    nome: 'Óleo de Motor 5W30', 
    categoria: 'Lubrificantes', 
    precoCompra: 25.90, 
    precoVenda: 35.90, 
    estoque: 15,
    estoqueMinimo: 5
  },
  { 
    id: '2', 
    codigo: 'FO-123', 
    nome: 'Filtro de Óleo', 
    categoria: 'Filtros', 
    precoCompra: 18.50, 
    precoVenda: 25.50, 
    estoque: 8,
    estoqueMinimo: 3
  },
  { 
    id: '3', 
    codigo: 'FA-456', 
    nome: 'Filtro de Ar', 
    categoria: 'Filtros', 
    precoCompra: 32.00, 
    precoVenda: 45.00, 
    estoque: 6,
    estoqueMinimo: 2
  },
  { 
    id: '4', 
    codigo: 'PF-789', 
    nome: 'Pastilha de Freio', 
    categoria: 'Freios', 
    precoCompra: 85.00, 
    precoVenda: 120.00, 
    estoque: 12,
    estoqueMinimo: 4
  },
  { 
    id: '5', 
    codigo: 'AMD-01', 
    nome: 'Amortecedor Dianteiro', 
    categoria: 'Suspensão', 
    precoCompra: 250.00, 
    precoVenda: 350.00, 
    estoque: 2,
    estoqueMinimo: 1
  },
  { 
    id: '6', 
    codigo: 'VLA-01', 
    nome: 'Vela de Ignição', 
    categoria: 'Elétrica', 
    precoCompra: 12.00, 
    precoVenda: 18.00, 
    estoque: 20,
    estoqueMinimo: 8
  },
  { 
    id: '7', 
    codigo: 'BAT-60', 
    nome: 'Bateria 60A', 
    categoria: 'Elétrica', 
    precoCompra: 280.00, 
    precoVenda: 350.00, 
    estoque: 4,
    estoqueMinimo: 2
  }
];

// Categorias de peças
const categorias = [
  'Todas',
  'Lubrificantes',
  'Filtros',
  'Freios',
  'Suspensão',
  'Elétrica',
  'Motor',
  'Transmissão',
  'Arrefecimento',
  'Outros'
];

// Schema do formulário
const pecaFormSchema = z.object({
  codigo: z.string().min(1, { message: 'O código é obrigatório' }),
  nome: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  categoria: z.string().min(1, { message: 'Selecione uma categoria' }),
  precoCompra: z.string().min(1, { message: 'Informe o preço de compra' }),
  precoVenda: z.string().min(1, { message: 'Informe o preço de venda' }),
  estoque: z.string().min(1, { message: 'Informe a quantidade em estoque' }),
  estoqueMinimo: z.string().min(1, { message: 'Informe o estoque mínimo' }),
});

type SortField = 'nome' | 'codigo' | 'estoque' | 'precoVenda';
type SortDirection = 'asc' | 'desc';

const PecasPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFiltro, setCategoriaFiltro] = useState('Todas');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [pecaParaExcluir, setPecaParaExcluir] = useState<string | null>(null);
  const [editandoPeca, setEditandoPeca] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const form = useForm<z.infer<typeof pecaFormSchema>>({
    resolver: zodResolver(pecaFormSchema),
    defaultValues: {
      codigo: '',
      nome: '',
      categoria: '',
      precoCompra: '',
      precoVenda: '',
      estoque: '',
      estoqueMinimo: ''
    }
  });
  
  // Filtrar e ordenar peças
  const pecasFiltradas = [...mockPecas]
    .filter(peca => {
      // Filtro por texto de pesquisa
      const matchesSearch = 
        peca.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        peca.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por categoria
      const matchesCategoria = categoriaFiltro === 'Todas' || peca.categoria === categoriaFiltro;
      
      return matchesSearch && matchesCategoria;
    })
    .sort((a, b) => {
      // Ordenação
      if (sortField === 'nome') {
        return sortDirection === 'asc' 
          ? a.nome.localeCompare(b.nome)
          : b.nome.localeCompare(a.nome);
      } else if (sortField === 'codigo') {
        return sortDirection === 'asc' 
          ? a.codigo.localeCompare(b.codigo)
          : b.codigo.localeCompare(a.codigo);
      } else if (sortField === 'estoque') {
        return sortDirection === 'asc' 
          ? a.estoque - b.estoque
          : b.estoque - a.estoque;
      } else if (sortField === 'precoVenda') {
        return sortDirection === 'asc' 
          ? a.precoVenda - b.precoVenda
          : b.precoVenda - a.precoVenda;
      }
      return 0;
    });
  
  // Alternar ordenação
  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Peças com estoque baixo
  const pecasComEstoqueBaixo = mockPecas
    .filter(peca => peca.estoque <= peca.estoqueMinimo)
    .length;
  
  // Editar peça
  const editarPeca = (id: string) => {
    const peca = mockPecas.find(p => p.id === id);
    if (!peca) return;
    
    form.reset({
      codigo: peca.codigo,
      nome: peca.nome,
      categoria: peca.categoria,
      precoCompra: peca.precoCompra.toString(),
      precoVenda: peca.precoVenda.toString(),
      estoque: peca.estoque.toString(),
      estoqueMinimo: peca.estoqueMinimo.toString()
    });
    
    setEditandoPeca(id);
    setDialogOpen(true);
  };
  
  // Confirmar exclusão
  const confirmarExclusao = (id: string) => {
    setPecaParaExcluir(id);
    setAlertDialogOpen(true);
  };
  
  // Excluir peça
  const excluirPeca = () => {
    // Aqui seria a lógica para excluir
    toast.success('Peça excluída com sucesso!');
    setAlertDialogOpen(false);
    setPecaParaExcluir(null);
  };
  
  // Salvar peça
  const onSubmit = (data: z.infer<typeof pecaFormSchema>) => {
    const precoCompra = parseFloat(data.precoCompra.replace(',', '.'));
    const precoVenda = parseFloat(data.precoVenda.replace(',', '.'));
    const estoque = parseInt(data.estoque);
    const estoqueMinimo = parseInt(data.estoqueMinimo);
    
    if (isNaN(precoCompra) || isNaN(precoVenda) || isNaN(estoque) || isNaN(estoqueMinimo)) {
      toast.error('Valores inválidos');
      return;
    }
    
    // Aqui seria a lógica para salvar
    if (editandoPeca) {
      // Lógica de edição
      toast.success('Peça atualizada com sucesso!');
    } else {
      // Lógica de adição
      const novaPeca = {
        id: generateUniqueId(),
        codigo: data.codigo,
        nome: data.nome,
        categoria: data.categoria,
        precoCompra,
        precoVenda,
        estoque,
        estoqueMinimo
      };
      
      console.log('Nova peça:', novaPeca);
      toast.success('Peça adicionada com sucesso!');
    }
    
    setDialogOpen(false);
    setEditandoPeca(null);
    form.reset();
  };
  
  // Abrir formulário para nova peça
  const novaPeca = () => {
    setEditandoPeca(null);
    form.reset({
      codigo: '',
      nome: '',
      categoria: '',
      precoCompra: '',
      precoVenda: '',
      estoque: '',
      estoqueMinimo: ''
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Controle de Peças</h1>
        <Button onClick={novaPeca} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Nova Peça
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Total de Peças */}
        <Card className="animate-fade-in card-transition delay-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Peças</CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPecas.length}</div>
            <p className="text-xs text-muted-foreground">
              {mockPecas.reduce((acc, peca) => acc + peca.estoque, 0)} itens em estoque
            </p>
          </CardContent>
        </Card>

        {/* Card de Peças com Estoque Baixo */}
        <Card className="animate-fade-in card-transition delay-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{pecasComEstoqueBaixo}</div>
            <p className="text-xs text-muted-foreground">
              Peças abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Inventário de Peças</CardTitle>
          <CardDescription>
            Gerencie seu estoque de peças e componentes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="flex-1 flex items-center relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar peças..." 
                className="pl-8"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select 
                value={categoriaFiltro} 
                onValueChange={setCategoriaFiltro}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setCategoriaFiltro('Todas');
              }}>
                Limpar Filtros
              </Button>
            </div>
          </div>
          
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer w-[100px]" 
                    onClick={() => toggleSort('codigo')}
                  >
                    <div className="flex items-center">
                      Código
                      {sortField === 'codigo' ? (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      ) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer" 
                    onClick={() => toggleSort('nome')}
                  >
                    <div className="flex items-center">
                      Nome
                      {sortField === 'nome' ? (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      ) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead className="text-right">Preço Compra</TableHead>
                  <TableHead 
                    className="text-right cursor-pointer" 
                    onClick={() => toggleSort('precoVenda')}
                  >
                    <div className="flex items-center justify-end">
                      Preço Venda
                      {sortField === 'precoVenda' ? (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      ) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="text-center cursor-pointer" 
                    onClick={() => toggleSort('estoque')}
                  >
                    <div className="flex items-center justify-center">
                      Estoque
                      {sortField === 'estoque' ? (
                        sortDirection === 'asc' ? <ArrowUp className="ml-1 h-3 w-3" /> : <ArrowDown className="ml-1 h-3 w-3" />
                      ) : <ArrowUpDown className="ml-1 h-3 w-3" />}
                    </div>
                  </TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pecasFiltradas.map(peca => (
                  <TableRow key={peca.id} className="hover-scale">
                    <TableCell className="font-medium">{peca.codigo}</TableCell>
                    <TableCell>{peca.nome}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs rounded-full bg-muted/50">
                        {peca.categoria}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {peca.precoCompra.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {peca.precoVenda.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className={`
                        px-2 py-1 text-xs rounded-full 
                        ${peca.estoque <= peca.estoqueMinimo ? 
                          'bg-destructive/10 text-destructive font-medium' : 
                          'bg-green-100 text-green-800'}
                      `}>
                        {peca.estoque}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => editarPeca(peca.id)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmarExclusao(peca.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                
                {pecasFiltradas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      Nenhuma peça encontrada com os filtros atuais
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar peça */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editandoPeca ? 'Editar Peça' : 'Adicionar Nova Peça'}
            </DialogTitle>
            <DialogDescription>
              {editandoPeca
                ? 'Edite as informações da peça selecionada.'
                : 'Preencha as informações para adicionar uma nova peça ao estoque.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input placeholder="Código da peça" {...field} />
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
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categorias.filter(cat => cat !== 'Todas').map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Peça</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo da peça" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="precoCompra"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Compra (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="precoVenda"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço de Venda (R$)</FormLabel>
                      <FormControl>
                        <Input placeholder="0,00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="estoque"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade em Estoque</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estoqueMinimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estoque Mínimo</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editandoPeca ? 'Salvar Alterações' : 'Adicionar Peça'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta peça? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={excluirPeca} className="bg-destructive text-destructive-foreground">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PecasPage;
