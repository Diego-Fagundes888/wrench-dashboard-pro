
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Form,
  FormControl,
  FormDescription,
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
import { Switch } from "@/components/ui/switch";
import {
  Settings,
  User,
  Building2,
  Palette,
  Bell,
  Download,
  Shield,
  FileText
} from 'lucide-react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from 'sonner';

// Schema para formulário da empresa
const empresaFormSchema = z.object({
  nomeEmpresa: z.string().min(3, { message: 'O nome da empresa é obrigatório' }),
  cnpj: z.string().min(14, { message: 'CNPJ inválido' }),
  telefone: z.string().min(10, { message: 'Telefone inválido' }),
  email: z.string().email({ message: 'Email inválido' }),
  endereco: z.string().min(5, { message: 'Endereço inválido' }),
  cidade: z.string().min(2, { message: 'Cidade inválida' }),
  estado: z.string().length(2, { message: 'Estado inválido' }),
  cep: z.string().min(8, { message: 'CEP inválido' }),
});

// Schema para formulário de usuário
const usuarioFormSchema = z.object({
  nome: z.string().min(3, { message: 'O nome é obrigatório' }),
  email: z.string().email({ message: 'Email inválido' }),
  senha: z.string().min(6, { message: 'A senha deve ter pelo menos 6 caracteres' }),
  confirmSenha: z.string().min(6, { message: 'Confirme sua senha' }),
}).refine((data) => data.senha === data.confirmSenha, {
  message: "As senhas não coincidem",
  path: ["confirmSenha"],
});

const ConfiguracoesPage = () => {
  const empresaForm = useForm<z.infer<typeof empresaFormSchema>>({
    resolver: zodResolver(empresaFormSchema),
    defaultValues: {
      nomeEmpresa: 'Oficina Mecânica XYZ',
      cnpj: '12.345.678/0001-90',
      telefone: '(11) 1234-5678',
      email: 'contato@oficinaxyz.com.br',
      endereco: 'Rua Exemplo, 123',
      cidade: 'São Paulo',
      estado: 'SP',
      cep: '01234-567',
    }
  });

  const usuarioForm = useForm<z.infer<typeof usuarioFormSchema>>({
    resolver: zodResolver(usuarioFormSchema),
    defaultValues: {
      nome: 'Administrador',
      email: 'admin@oficinaxyz.com.br',
      senha: '',
      confirmSenha: '',
    }
  });

  // Salvar configurações da empresa
  const onEmpresaSubmit = (data: z.infer<typeof empresaFormSchema>) => {
    console.log('Dados da empresa:', data);
    toast.success('Dados da empresa salvos com sucesso!');
  };

  // Salvar configurações do usuário
  const onUsuarioSubmit = (data: z.infer<typeof usuarioFormSchema>) => {
    console.log('Dados do usuário:', data);
    toast.success('Dados do usuário salvos com sucesso!');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Configurações</h1>
      </div>

      <Tabs defaultValue="empresa" className="w-full">
        <TabsList className="grid grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="empresa" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="usuario" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Usuários
          </TabsTrigger>
          <TabsTrigger value="sistema" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Sistema
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Backup
          </TabsTrigger>
        </TabsList>

        {/* Configurações da Empresa */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Configure as informações da sua oficina que aparecerão nos relatórios e documentos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...empresaForm}>
                <form onSubmit={empresaForm.handleSubmit(onEmpresaSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={empresaForm.control}
                      name="nomeEmpresa"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Empresa</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={empresaForm.control}
                      name="cnpj"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNPJ</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={empresaForm.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={empresaForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={empresaForm.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <FormField
                      control={empresaForm.control}
                      name="cidade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={empresaForm.control}
                      name="estado"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input maxLength={2} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={empresaForm.control}
                      name="cep"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Logotipo</CardTitle>
              <CardDescription>
                Configurar o logotipo da sua empresa para documentos e relatórios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-start gap-6">
                <div className="flex items-center justify-center w-32 h-32 bg-muted rounded-md">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                </div>
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Faça upload do seu logotipo para ser usado em documentos e relatórios. 
                    Recomendamos uma imagem de pelo menos 300x300 pixels em formato PNG ou JPG.
                  </p>
                  
                  <div className="flex gap-2">
                    <Button variant="outline">Escolher Arquivo</Button>
                    <Button variant="ghost" className="text-destructive hover:text-destructive">Remover</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Usuário */}
        <TabsContent value="usuario">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciar Usuários</CardTitle>
              <CardDescription>
                Configure os usuários que terão acesso ao sistema.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Usuários Cadastrados</h3>
                <div className="border rounded-md p-4 mb-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Admin</p>
                      <p className="text-sm text-muted-foreground">admin@oficinaxyz.com.br</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                    </div>
                  </div>
                </div>
              </div>

              <h3 className="text-lg font-medium mb-4">Adicionar/Editar Usuário</h3>
              <Form {...usuarioForm}>
                <form onSubmit={usuarioForm.handleSubmit(onUsuarioSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={usuarioForm.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={usuarioForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={usuarioForm.control}
                      name="senha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={usuarioForm.control}
                      name="confirmSenha"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div>
                    <FormLabel>Nível de Acesso</FormLabel>
                    <Select defaultValue="admin">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o nível de acesso" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="gerente">Gerente</SelectItem>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="atendente">Atendente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="submit">Salvar Usuário</Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações do Sistema */}
        <TabsContent value="sistema">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="mr-2 h-5 w-5" /> Aparência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Tema Escuro</h4>
                      <p className="text-sm text-muted-foreground">
                        Ativar tema escuro para o sistema
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Tema de Cores</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-10 bg-blue-500 rounded-md cursor-pointer border-2 border-primary"></div>
                      <div className="h-10 bg-green-500 rounded-md cursor-pointer"></div>
                      <div className="h-10 bg-purple-500 rounded-md cursor-pointer"></div>
                      <div className="h-10 bg-red-500 rounded-md cursor-pointer"></div>
                      <div className="h-10 bg-amber-500 rounded-md cursor-pointer"></div>
                      <div className="h-10 bg-teal-500 rounded-md cursor-pointer"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" /> Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertas de Estoque Baixo</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações quando peças estiverem abaixo do estoque mínimo
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertas de OS Pendentes</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre ordens de serviço pendentes
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alertas de Agendamentos</h4>
                      <p className="text-sm text-muted-foreground">
                        Receber notificações sobre novos agendamentos
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" /> Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Autenticação de Dois Fatores</h4>
                      <p className="text-sm text-muted-foreground">
                        Adiciona uma camada extra de segurança para acesso ao sistema
                      </p>
                    </div>
                    <Switch />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Tempo de Sessão (minutos)</h4>
                      <p className="text-sm text-muted-foreground">
                        Tempo até o sistema encerrar automaticamente a sessão por inatividade
                      </p>
                    </div>
                    <Input type="number" defaultValue="30" className="w-20" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Histórico de Acesso</h4>
                      <p className="text-sm text-muted-foreground">
                        Registrar histórico de acesso ao sistema
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Backup e Restauração */}
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup e Restauração</CardTitle>
              <CardDescription>
                Gerencie os backups do sistema e dados da oficina.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Backup Manual</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Crie um backup completo dos dados do sistema para download.
                </p>
                <Button className="flex items-center gap-2">
                  <Download className="h-4 w-4" /> Gerar Backup
                </Button>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Backups Automáticos</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure a frequência dos backups automáticos.
                </p>
                
                <div className="flex items-center space-x-2 mb-4">
                  <Switch id="auto-backup" />
                  <label htmlFor="auto-backup" className="text-sm font-medium">
                    Ativar Backups Automáticos
                  </label>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Frequência</label>
                    <Select defaultValue="diario">
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diario">Diário</SelectItem>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Horário</label>
                    <Input type="time" defaultValue="03:00" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">Restaurar Backup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Restaure o sistema a partir de um arquivo de backup.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    Escolher Arquivo
                  </Button>
                  <Button variant="secondary">
                    Restaurar Sistema
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConfiguracoesPage;
