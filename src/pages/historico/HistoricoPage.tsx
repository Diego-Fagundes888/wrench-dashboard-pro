
import React, { useState } from 'react';
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
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

// Mock data para ordens de serviço
const mockOrdens = [
  {
    id: '1',
    cliente: 'João Silva',
    veiculo: 'Honda Civic 2020',
    placa: 'ABC-1234',
    data: new Date('2023-04-10'),
    servico: 'Troca de Óleo',
    valor: 120.5,
    status: 'Concluído'
  },
  {
    id: '2',
    cliente: 'Maria Oliveira',
    veiculo: 'Toyota Corolla 2018',
    placa: 'DEF-5678',
    data: new Date('2023-04-09'),
    servico: 'Revisão Completa',
    valor: 350.0,
    status: 'Concluído'
  },
  {
    id: '3',
    cliente: 'Carlos Pereira',
    veiculo: 'Volkswagen Gol 2015',
    placa: 'GHI-9012',
    data: new Date('2023-04-08'),
    servico: 'Alinhamento e Balanceamento',
    valor: 150.0,
    status: 'Concluído'
  },
  {
    id: '4',
    cliente: 'Ana Souza',
    veiculo: 'Fiat Uno 2017',
    placa: 'JKL-3456',
    data: new Date('2023-04-07'),
    servico: 'Troca de Pastilhas de Freio',
    valor: 280.0,
    status: 'Concluído'
  },
  {
    id: '5',
    cliente: 'Roberto Alves',
    veiculo: 'Chevrolet Onix 2019',
    placa: 'MNO-7890',
    data: new Date('2023-04-06'),
    servico: 'Reparo no Sistema de Arrefecimento',
    valor: 420.0,
    status: 'Cancelado'
  }
];

// Interface para detalhes da ordem
interface DetalhesOrdem {
  id: string;
  cliente: string;
  telefone?: string;
  veiculo: string;
  placa: string;
  ano?: string;
  servico: string;
  descricao?: string;
  pecas?: Array<{nome: string, quantidade: number, preco: number}>;
  valorPecas?: number;
  valorMaoDeObra?: number;
  valorTotal: number;
  data: Date;
  status: string;
}

const HistoricoPage = () => {
  const [filtro, setFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('cliente');
  const [ordemDetalhada, setOrdemDetalhada] = useState<DetalhesOrdem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogDeleteOpen, setDialogDeleteOpen] = useState(false);
  const [ordemSelecionada, setOrdemSelecionada] = useState<string | null>(null);

  // Filtrar ordens
  const ordensFiltradas = mockOrdens.filter(ordem => {
    if (!filtro) return true;
    
    const termo = filtro.toLowerCase();
    if (tipoFiltro === 'cliente') {
      return ordem.cliente.toLowerCase().includes(termo);
    } else if (tipoFiltro === 'veiculo') {
      return ordem.veiculo.toLowerCase().includes(termo);
    } else if (tipoFiltro === 'placa') {
      return ordem.placa.toLowerCase().includes(termo);
    }
    return true;
  });

  // Ver detalhes da OS
  const verDetalhes = (id: string) => {
    const ordem = mockOrdens.find(os => os.id === id);
    if (!ordem) return;
    
    // Simular detalhes completos
    const detalhes: DetalhesOrdem = {
      ...ordem,
      telefone: '(11) 99999-8888',
      ano: '2020',
      descricao: 'Troca de óleo com filtro e verificação geral.',
      pecas: [
        { nome: 'Óleo Motor 5W30', quantidade: 4, preco: 35.90 },
        { nome: 'Filtro de Óleo', quantidade: 1, preco: 25.50 },
        { nome: 'Filtro de Ar', quantidade: 1, preco: 45.00 }
      ],
      valorPecas: 168.10,
      valorMaoDeObra: 50.00,
      valorTotal: ordem.valor
    };
    
    setOrdemDetalhada(detalhes);
    setDialogOpen(true);
  };

  // Editar OS
  const editarOS = (id: string) => {
    toast.info('Redirecionando para edição da OS...');
    // Aqui iria redirecionar para tela de edição
  };

  // Excluir OS
  const confirmarExclusao = (id: string) => {
    setOrdemSelecionada(id);
    setDialogDeleteOpen(true);
  };

  const excluirOS = () => {
    if (!ordemSelecionada) return;
    
    // Aqui seria a lógica real para excluir
    toast.success('OS excluída com sucesso!');
    setDialogDeleteOpen(false);
    setOrdemSelecionada(null);
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
              <Input type="date" className="max-w-[180px]" />
              <span className="text-sm text-muted-foreground">até</span>
              <Input type="date" className="max-w-[180px]" />
            </div>

            <div className="flex justify-end">
              <Button variant="outline">Limpar Filtros</Button>
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
                {ordensFiltradas.map(ordem => (
                  <TableRow key={ordem.id} className="hover-scale">
                    <TableCell className="font-medium">{ordem.id}</TableCell>
                    <TableCell>
                      {format(ordem.data, 'dd/MM/yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>{ordem.cliente}</TableCell>
                    <TableCell>{ordem.veiculo}</TableCell>
                    <TableCell>{ordem.placa}</TableCell>
                    <TableCell>{ordem.servico}</TableCell>
                    <TableCell>R$ {ordem.valor.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        ordem.status === 'Concluído' ? 
                          'bg-green-100 text-green-800' : 
                          'bg-red-100 text-red-800'
                      }`}>
                        {ordem.status}
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
                ))}
                {ordensFiltradas.length === 0 && (
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
        </CardContent>
      </Card>

      {/* Dialog de detalhes da OS */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Ordem de Serviço #{ordemDetalhada?.id}</DialogTitle>
            <DialogDescription>
              {ordemDetalhada && format(ordemDetalhada.data, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </DialogDescription>
          </DialogHeader>
          
          {ordemDetalhada && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Cliente</h3>
                  <p className="text-sm">Nome: <span className="font-medium">{ordemDetalhada.cliente}</span></p>
                  <p className="text-sm">Telefone: <span className="font-medium">{ordemDetalhada.telefone}</span></p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-2">Veículo</h3>
                  <p className="text-sm">Modelo: <span className="font-medium">{ordemDetalhada.veiculo}</span></p>
                  <p className="text-sm">Placa: <span className="font-medium">{ordemDetalhada.placa}</span></p>
                  <p className="text-sm">Ano: <span className="font-medium">{ordemDetalhada.ano}</span></p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2">Serviço</h3>
                <p className="text-sm">Tipo: <span className="font-medium">{ordemDetalhada.servico}</span></p>
                <p className="text-sm">Descrição: <span className="font-medium">{ordemDetalhada.descricao}</span></p>
              </div>
              
              {ordemDetalhada.pecas && ordemDetalhada.pecas.length > 0 && (
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
                      {ordemDetalhada.pecas.map((peca, index) => (
                        <TableRow key={index}>
                          <TableCell>{peca.nome}</TableCell>
                          <TableCell>{peca.quantidade}</TableCell>
                          <TableCell>R$ {peca.preco.toFixed(2)}</TableCell>
                          <TableCell>R$ {(peca.quantidade * peca.preco).toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
              
              <div className="flex flex-col items-end space-y-1 pt-4">
                <p className="text-sm">Valor das Peças: <span className="font-medium">R$ {ordemDetalhada.valorPecas?.toFixed(2)}</span></p>
                <p className="text-sm">Valor da Mão de Obra: <span className="font-medium">R$ {ordemDetalhada.valorMaoDeObra?.toFixed(2)}</span></p>
                <p className="text-base font-bold">Valor Total: <span>R$ {ordemDetalhada.valorTotal.toFixed(2)}</span></p>
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
