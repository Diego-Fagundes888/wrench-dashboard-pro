
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { 
  Eye, 
  Edit2, 
  Trash2, 
  Search,
  Calendar,
  FileText,
  Download
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Interface para serviços
interface ServiceOrder {
  id: string;
  client_name: string;
  vehicle_model: string;
  vehicle_plate: string;
  created_at: string;
  service_type: string;
  total_cost: number;
  status: string;
  number: number;
}

// Interface para detalhes da ordem
interface DetalhesOrdem {
  id: string;
  number: number;
  client_name: string;
  client_phone?: string;
  vehicle_model: string;
  vehicle_plate: string;
  vehicle_year?: string;
  service_type: string;
  description?: string;
  parts?: Array<{id: string, name: string, quantity: number, price: number, subtotal: number}>;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  created_at: string;
  status: string;
}

const HistoricoPage = () => {
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('cliente');
  const [ordemDetalhada, setOrdemDetalhada] = useState<DetalhesOrdem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);
  const [serviceOrders, setServiceOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  // Carregar ordens de serviço
  useEffect(() => {
    fetchServiceOrders();
  }, []);

  const fetchServiceOrders = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('service_orders')
        .select(`
          id,
          number,
          service_type,
          total_cost,
          status,
          created_at,
          clients!inner(name),
          vehicles!inner(model, plate)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedOrders: ServiceOrder[] = data.map(order => ({
        id: order.id,
        number: order.number,
        client_name: order.clients.name,
        vehicle_model: order.vehicles.model,
        vehicle_plate: order.vehicles.plate,
        created_at: order.created_at,
        service_type: order.service_type,
        total_cost: order.total_cost,
        status: order.status
      }));

      setServiceOrders(formattedOrders);
    } catch (error) {
      console.error('Error fetching service orders:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as ordens de serviço',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrar ordens
  const ordensFiltradas = serviceOrders.filter(ordem => {
    // Filtro por texto
    let matchesTextFilter = true;
    if (filtro) {
      const termo = filtro.toLowerCase();
      if (tipoFiltro === 'cliente') {
        matchesTextFilter = ordem.client_name.toLowerCase().includes(termo);
      } else if (tipoFiltro === 'veiculo') {
        matchesTextFilter = ordem.vehicle_model.toLowerCase().includes(termo);
      } else if (tipoFiltro === 'placa') {
        matchesTextFilter = ordem.vehicle_plate.toLowerCase().includes(termo);
      }
    }

    // Filtro por data
    let matchesDateFilter = true;
    if (dataInicial || dataFinal) {
      const orderDate = new Date(ordem.created_at);
      
      if (dataInicial) {
        const initialDate = new Date(dataInicial);
        initialDate.setHours(0, 0, 0, 0);
        if (orderDate < initialDate) {
          matchesDateFilter = false;
        }
      }
      
      if (dataFinal) {
        const finalDate = new Date(dataFinal);
        finalDate.setHours(23, 59, 59, 999);
        if (orderDate > finalDate) {
          matchesDateFilter = false;
        }
      }
    }

    return matchesTextFilter && matchesDateFilter;
  });

  // Ver detalhes da OS
  const verDetalhes = async (id: string) => {
    try {
      // Get basic order info
      const { data: orderData, error: orderError } = await supabase
        .from('service_orders')
        .select(`
          *,
          clients!inner(*),
          vehicles!inner(*)
        `)
        .eq('id', id)
        .single();

      if (orderError) throw orderError;

      // Get parts for this order
      const { data: partsData, error: partsError } = await supabase
        .from('service_order_parts')
        .select(`
          *,
          parts!inner(name)
        `)
        .eq('service_order_id', id);

      if (partsError) throw partsError;

      // Format parts data
      const formattedParts = partsData.map((part) => ({
        id: part.id,
        name: part.parts.name,
        quantity: part.quantity,
        price: part.price,
        subtotal: part.subtotal
      }));

      // Create detailed order object
      const detalhes: DetalhesOrdem = {
        id: orderData.id,
        number: orderData.number,
        client_name: orderData.clients.name,
        client_phone: orderData.clients.phone || '-',
        vehicle_model: orderData.vehicles.model,
        vehicle_plate: orderData.vehicles.plate,
        vehicle_year: orderData.vehicles.year || '-',
        service_type: orderData.service_type,
        description: orderData.description || '-',
        parts: formattedParts,
        labor_cost: orderData.labor_cost,
        parts_cost: orderData.parts_cost,
        total_cost: orderData.total_cost,
        created_at: orderData.created_at,
        status: orderData.status
      };
      
      setOrdemDetalhada(detalhes);
      setDialogOpen(true);
    } catch (error) {
      console.error('Error fetching order details:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os detalhes da OS',
        variant: 'destructive'
      });
    }
  };

  // Editar OS
  const editarOS = (id: string) => {
    toast({
      title: 'Em breve',
      description: 'Funcionalidade de edição será implementada em breve',
    });
  };

  // Excluir OS
  const confirmarExclusao = (id: string) => {
    setOrdemSelecionada(id);
    setDialogDeleteOpen(true);
  };

  const excluirOS = async () => {
    if (!ordemSelecionada) return;
    
    try {
      // Delete parts from service order first (foreign key constraint)
      const { error: partsError } = await supabase
        .from('service_order_parts')
        .delete()
        .eq('service_order_id', ordemSelecionada);

      if (partsError) throw partsError;

      // Delete financial transactions associated with this order
      const { error: transactionsError } = await supabase
        .from('financial_transactions')
        .delete()
        .eq('service_order_id', ordemSelecionada);

      if (transactionsError) throw transactionsError;

      // Delete the service order
      const { error } = await supabase
        .from('service_orders')
        .delete()
        .eq('id', ordemSelecionada);

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: 'OS excluída com sucesso!',
      });
      
      // Refresh the list
      fetchServiceOrders();
    } catch (error) {
      console.error('Error deleting service order:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a OS',
        variant: 'destructive'
      });
    } finally {
      setDialogDeleteOpen(false);
      setOrdemSelecionada(null);
    }
  };

  // Limpar filtros
  const limparFiltros = () => {
    setFiltro('');
    setTipoFiltro('cliente');
    setDataInicial('');
    setDataFinal('');
  };

  // Formato de moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Status label
  const getStatusLabel = (status: string) => {
    const statusMap: Record<string, string> = {
      'open': 'Em aberto',
      'in_progress': 'Em andamento',
      'completed': 'Concluído',
      'canceled': 'Cancelado'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Histórico de Serviços</h1>
        <Button className="flex items-center gap-2">
          <Download className="h-4 w-4" /> Exportar Relatório
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtrar Ordens de Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <Select
                value={tipoFiltro}
                onValueChange={setTipoFiltro}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="veiculo">Veículo</SelectItem>
                  <SelectItem value="placa">Placa</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar..." 
                  value={filtro} 
                  onChange={e => setFiltro(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Data Inicial:</span>
              <Input 
                type="date" 
                className="max-w-[180px]" 
                value={dataInicial}
                onChange={e => setDataInicial(e.target.value)}
              />
              <span className="text-sm text-muted-foreground">até</span>
              <Input 
                type="date" 
                className="max-w-[180px]" 
                value={dataFinal}
                onChange={e => setDataFinal(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                variant="outline"
                onClick={limparFiltros}
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ordens de Serviço</CardTitle>
          <span className="text-muted-foreground text-sm">
            {ordensFiltradas.length} resultados encontrados
          </span>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Carregando ordens de serviço...</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>OS #</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Placa</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ordensFiltradas.length > 0 ? (
                    ordensFiltradas.map(ordem => (
                      <TableRow key={ordem.id} className="hover-scale">
                        <TableCell className="font-medium">{ordem.number}</TableCell>
                        <TableCell>
                          {format(new Date(ordem.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                        </TableCell>
                        <TableCell>{ordem.client_name}</TableCell>
                        <TableCell>{ordem.vehicle_model}</TableCell>
                        <TableCell>{ordem.vehicle_plate}</TableCell>
                        <TableCell>{ordem.service_type}</TableCell>
                        <TableCell>{formatCurrency(ordem.total_cost)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            ordem.status === 'completed' ? 
                              'bg-green-100 text-green-800' : 
                              ordem.status === 'canceled' ?
                                'bg-red-100 text-red-800' :
                                'bg-blue-100 text-blue-800'
                          }`}>
                            {getStatusLabel(ordem.status)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => verDetalhes(ordem.id)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => editarOS(ordem.id)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => confirmarExclusao(ordem.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-10">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <FileText className="h-10 w-10 mb-2" />
                          <p>Nenhuma ordem de serviço encontrada</p>
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

      {/* Dialog de detalhes da OS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço #{ordemDetalhada?.number}</DialogTitle>
            <DialogDescription>
              {ordemDetalhada && format(new Date(ordemDetalhada.created_at), "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          {ordemDetalhada && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                  <p className="text-sm">Nome: <span className="font-medium">{ordemDetalhada.client_name}</span></p>
                  <p className="text-sm">Telefone: <span className="font-medium">{ordemDetalhada.client_phone}</span></p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Veículo</h3>
                  <p className="text-sm">Modelo: <span className="font-medium">{ordemDetalhada.vehicle_model}</span></p>
                  <p className="text-sm">Placa: <span className="font-medium">{ordemDetalhada.vehicle_plate}</span></p>
                  <p className="text-sm">Ano: <span className="font-medium">{ordemDetalhada.vehicle_year}</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Serviço</h3>
                <p className="text-sm">Tipo: <span className="font-medium">{ordemDetalhada.service_type}</span></p>
                <p className="text-sm">Descrição: <span className="font-medium">{ordemDetalhada.description}</span></p>
                <p className="text-sm">Status: <span className={`font-medium ${
                  ordemDetalhada.status === 'completed' ? 'text-green-600' : 
                  ordemDetalhada.status === 'canceled' ? 'text-red-600' : 'text-blue-600'
                }`}>
                  {getStatusLabel(ordemDetalhada.status)}
                </span></p>
              </div>
              
              {ordemDetalhada.parts && ordemDetalhada.parts.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Peças Utilizadas</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Peça</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Valor Unitário</TableHead>
                        <TableHead>Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordemDetalhada.parts.map((peca) => (
                        <TableRow key={peca.id}>
                          <TableCell>{peca.name}</TableCell>
                          <TableCell>{peca.quantity}</TableCell>
                          <TableCell>{formatCurrency(peca.price)}</TableCell>
                          <TableCell>{formatCurrency(peca.subtotal)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="flex flex-col items-end space-y-1 pt-4">
                <p className="text-sm">Valor das Peças: <span className="font-medium">{formatCurrency(ordemDetalhada.parts_cost)}</span></p>
                <p className="text-sm">Valor da Mão de Obra: <span className="font-medium">{formatCurrency(ordemDetalhada.labor_cost)}</span></p>
                <p className="text-base font-bold">Valor Total: <span>{formatCurrency(ordemDetalhada.total_cost)}</span></p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Fechar</Button>
            <Button onClick={() => {
              setDialogOpen(false);
              editarOS(ordemDetalhada?.id || '');
            }}>Editar OS</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para confirmar exclusão */}
      <Dialog open={dialogDeleteOpen} onOpenChange={setDialogDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta ordem de serviço? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogDeleteOpen(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={excluirOS}>Confirmar Exclusão</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HistoricoPage;
