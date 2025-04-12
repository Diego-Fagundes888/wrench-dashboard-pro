
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Clock, 
  DollarSign, 
  Database, 
  Calendar, 
  Settings, 
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface LayoutProps {
  children: React.ReactNode;
}

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  active?: boolean;
}

const SidebarItem = ({ icon, text, to, active }: SidebarItemProps) => {
  return (
    <Link to={to}>
      <div 
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md transition-all",
          active 
            ? "bg-mechanic-700 text-white" 
            : "text-gray-100 hover:bg-mechanic-800 hover:text-white"
        )}
      >
        {icon}
        <span className="text-sm font-medium">{text}</span>
      </div>
    </Link>
  );
};

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const menuItems = [
    { icon: <LayoutDashboard size={20} />, text: "Dashboard", to: "/" },
    { icon: <FileText size={20} />, text: "Criar OS", to: "/criar-os" },
    { icon: <Clock size={20} />, text: "Histórico", to: "/historico" },
    { icon: <DollarSign size={20} />, text: "Financeiro", to: "/financeiro" },
    { icon: <Database size={20} />, text: "Peças", to: "/pecas" },
    { icon: <Calendar size={20} />, text: "Agenda", to: "/agenda" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-mechanic-900 text-white">
        <div className="p-4">
          <h1 className="text-xl font-bold">Oficina Mecânica</h1>
          <p className="text-sm text-gray-300">Sistema de Gestão</p>
        </div>
        
        <div className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              icon={item.icon} 
              text={item.text} 
              to={item.to} 
              active={location.pathname === item.to}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <SidebarItem 
            icon={<Settings size={20} />} 
            text="Configurações" 
            to="/configuracoes"
            active={location.pathname === "/configuracoes"}
          />
        </div>
      </aside>
      
      {/* Sidebar móvel */}
      <div 
        className={cn(
          "fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity",
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
      />
      
      <aside 
        className={cn(
          "fixed left-0 top-0 bottom-0 w-64 bg-mechanic-900 text-white z-50 md:hidden transition-transform",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold">Oficina Mecânica</h1>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:text-white hover:bg-mechanic-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </Button>
        </div>
        
        <div className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem 
              key={item.to} 
              icon={item.icon} 
              text={item.text} 
              to={item.to} 
              active={location.pathname === item.to}
            />
          ))}
        </div>
        
        <div className="p-4 border-t border-gray-700">
          <SidebarItem 
            icon={<Settings size={20} />} 
            text="Configurações" 
            to="/configuracoes"
            active={location.pathname === "/configuracoes"}
          />
        </div>
      </aside>
      
      {/* Área principal */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b shadow-sm">
          <div className="flex items-center justify-between px-4 py-3">
            <Button 
              variant="ghost" 
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu size={24} />
            </Button>
            
            <div className="flex items-center space-x-2 md:ml-auto">
              <span className="text-sm text-gray-600">Usuário Admin</span>
              <div className="bg-mechanic-700 w-8 h-8 rounded-full flex items-center justify-center text-white">
                A
              </div>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
