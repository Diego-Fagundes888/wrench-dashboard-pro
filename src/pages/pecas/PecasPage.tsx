
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2,
  AlertCircle,
  Package
} from 'lucide-react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Schema for part validation
const partSchema = z.object({
  name: z.string().min(2, { message: 'Nome deve ter pelo menos 2 caracteres' }),
  description: z.string().optional(),
  price: z.string().min(1, { message: 'Informe o preço' }),
  quantity: z.string().min(1, { message: 'Informe a quantidade' }),
  minQuantity: z.string().optional(),
});

type PartType = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  quantity: number;
  min_quantity: number | null;
};

const PecasPage = () => {
  const [parts, setParts] = useState<PartType[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPart, setEditingPart] = useState<PartType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [partToDelete, setPartToDelete] = useState<string | null>(null);

  // Setup form
  const form = useForm<z.infer<typeof partSchema>>({
    resolver: zodResolver(partSchema),
    defaultValues: {
      name: '',
      description: '',
      price: '',
      quantity: '',
      minQuantity: '5',
    }
  });

  // Fetch parts from Supabase
  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('parts')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setParts(data || []);
    } catch (error) {
      console.error('Error fetching parts:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as peças',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter parts
  const partsFiltradas = parts.filter(part =>
    part.name.toLowerCase().includes(filtro.toLowerCase()) ||
    (part.description && part.description.toLowerCase().includes(filtro.toLowerCase()))
  );

  // Add new part
  const handleAddPart = async (values: z.infer<typeof partSchema>) => {
    try {
      const newPart = {
        name: values.name,
        description: values.description || null,
        price: parseFloat(values.price.replace(',', '.')),
        quantity: parseInt(values.quantity),
        min_quantity: values.minQuantity ? parseInt(values.minQuantity) : 5,
      };

      const { data, error } = await supabase
        .from('parts')
        .insert([newPart])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Peça adicionada com sucesso',
      });
      
      setDialogOpen(false);
      form.reset();
      fetchParts();
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a peça',
        variant: 'destructive'
      });
    }
  };

  // Update part
  const handleUpdatePart = async (values: z.infer<typeof partSchema>) => {
    if (!editingPart) return;

    try {
      const updatedPart = {
        name: values.name,
        description: values.description || null,
        price: parseFloat(values.price.replace(',', '.')),
        quantity: parseInt(values.quantity),
        min_quantity: values.minQuantity ? parseInt(values.minQuantity) : 5,
      };

      const { error } = await supabase
        .from('parts')
        .update(updatedPart)
        .eq('id', editingPart.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Peça atualizada com sucesso',
      });
      
      setDialogOpen(false);
      setEditingPart(null);
      form.reset();
      fetchParts();
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a peça',
        variant: 'destructive'
      });
    }
  };

  // Delete part
  const handleDeletePart = async () => {
    if (!partToDelete) return;

    try {
      const { error } = await supabase
        .from('parts')
        .delete()
        .eq('id', partToDelete);

      if (error) {
        throw error;
      }

      toast({
        title: 'Sucesso',
        description: 'Peça removida com sucesso',
      });
      
      setDeleteDialogOpen(false);
      setPartToDelete(null);
      fetchParts();
    } catch (error) {
      console.error('Error deleting part:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível remover a peça',
        variant: 'destructive'
      });
    }
  };

  // Edit part
  const openEditDialog = (part: PartType) => {
    setEditingPart(part);
    form.reset({
      name: part.name,
      description: part.description || '',
      price: part.price.toString(),
      quantity: part.quantity.toString(),
      minQuantity: part.min_quantity ? part.min_quantity.toString() : '5',
    });
    setDialogOpen(true);
  };

  // Open delete confirmation
  const openDeleteDialog = (id: string) => {
    setPartToDelete(id);
    setDeleteDialogOpen(true);
  };

  // Open add dialog
  const openAddDialog = () => {
    setEditingPart(null);
    form.reset({
      name: '',
      description: '',
      price: '',
      quantity: '',
      minQuantity: '5',
    });
    setDialogOpen(true);
  };

  // Format price in BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Estoque de Peças</h1>
        <Button className="flex items-center gap-2" onClick={openAddDialog}>
          <Plus className="h-4 w-4" /> Nova Peça
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Gerenciar Peças</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Pesquisar peças..." 
              className="pl-8"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Carregando...</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    <TableHead className="text-right">Qtd. Mínima</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                    <TableHead className="w-[120px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {partsFiltradas.length > 0 ? (
                    partsFiltradas.map((part) => (
                      <TableRow key={part.id} className="hover-scale">
                        <TableCell className="font-medium">{part.name}</TableCell>
                        <TableCell>{part.description || "-"}</TableCell>
                        <TableCell className="text-right">{formatPrice(part.price)}</TableCell>
                        <TableCell className="text-right">{part.quantity}</TableCell>
                        <TableCell className="text-right">{part.min_quantity || 5}</TableCell>
                        <TableCell className="text-right">
                          {part.quantity <= (part.min_quantity || 5) ? (
                            <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                              Baixo Estoque
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                              Estoque OK
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openEditDialog(part)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => openDeleteDialog(part.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Package className="h-10 w-10 mb-2" />
                          <p>Nenhuma peça encontrada</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para adicionar/editar peça */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPart ? 'Editar Peça' : 'Nova Peça'}
            </DialogTitle>
            <DialogDescription>
              {editingPart 
                ? 'Edite as informações da peça selecionada.' 
                : 'Adicione uma nova peça ao estoque.'}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form 
              onSubmit={form.handleSubmit(editingPart ? handleUpdatePart : handleAddPart)} 
              className="space-y-4 py-2"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Peça</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome da peça" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite uma descrição" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço (R$)</FormLabel>
                    <FormControl>
                      <Input placeholder="0,00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min="0" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="minQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade Mínima</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} min="0" />
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
                  onClick={() => setDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingPart ? 'Atualizar' : 'Adicionar'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta peça? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center p-3 mt-2 bg-amber-50 text-amber-800 rounded-md">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="text-sm">
              Excluir uma peça pode afetar ordens de serviço existentes.
            </p>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePart}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PecasPage;
