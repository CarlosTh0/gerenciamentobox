import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { 
  SidebarProvider,
  Sidebar, 
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarRail,
  SidebarInset,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Truck, RefreshCw, PanelLeftClose, PanelLeft, History, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { getCurrentUser, logout as authLogout } from "@/lib/auth";
import ApiIntegration from "@/components/ApiIntegration";
import UserRegister from "@/components/UserRegister";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function AppLayout() {
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const isMobile = useIsMobile();
  const user = getCurrentUser();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Esconder sidebar automaticamente em mobile
    if (isMobile) {
      setSidebarVisible(false);
    } else {
      setSidebarVisible(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Recuperar o estado da barra lateral do localStorage
    const savedSidebarState = localStorage.getItem('sidebar-visible');
    if (savedSidebarState) {
      setSidebarVisible(savedSidebarState === 'true');
    } else if (isMobile) {
      // Por padrão, esconder a barra lateral em dispositivos móveis
      setSidebarVisible(false);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [isMobile]);

  const handleSync = () => {
    if (isOnline) {
      // Trigger a sync by accessing localStorage
      const data = localStorage.getItem('cargo-management-data');
      if (data) {
        localStorage.setItem('cargo-management-data', data);
        setLastSync(new Date());
      }
    }
  };

  const toggleSidebar = () => {
    const newState = !sidebarVisible;
    setSidebarVisible(newState);
    localStorage.setItem('sidebar-visible', String(newState));
  };

  return (
    <SidebarProvider defaultOpen={sidebarVisible} open={sidebarVisible} onOpenChange={setSidebarVisible}>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="flex h-14 sm:h-16 items-center border-b px-3 sm:px-6 justify-between">
            <span className="text-sm sm:text-lg font-semibold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Sistema de Agendamento
            </span>
            {user && (
              <span className="text-xs text-muted-foreground hidden sm:inline">{user.name} ({user.role})</span>
            )}
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navegação</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/'}
                  >
                    <Link to="/" className="flex items-center gap-3">
                      <Truck className="h-4 w-4" />
                      <span>Gerenciamento</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/rampas'}
                  >
                    <Link to="/rampas" className="flex items-center gap-3">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2 18 L8 12 L22 12 L22 18 Z" stroke="currentColor" strokeWidth="1" fill="currentColor"/>
                        <path d="M8 12 L16 18" stroke="white" strokeWidth="1.5"/>
                        <rect x="16" y="15" width="3" height="3" fill="white"/>
                      </svg>
                      <span>Rampas</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/alteracoes'}
                  >
                    <Link to="/alteracoes" className="flex items-center gap-3">
                      <History className="h-4 w-4" />
                      <span>Alterações</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
            {user?.role === "admin" && (
              <>
                <SidebarGroup>
                  <SidebarGroupLabel>Administração</SidebarGroupLabel>
                  <div className="flex flex-col gap-2 p-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full mb-1">Configurar API Externa</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>URL da API externa</DialogTitle>
                        </DialogHeader>
                        <ApiIntegration onImport={() => {}} />
                      </DialogContent>
                    </Dialog>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full">Cadastrar Novo Usuário</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Cadastrar Novo Usuário</DialogTitle>
                        </DialogHeader>
                        <UserRegister />
                      </DialogContent>
                    </Dialog>
                  </div>
                </SidebarGroup>
              </>
            )}
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1">
                <div className="text-xs text-muted-foreground flex items-center justify-between">
                  <span>{isOnline ? 'Online' : 'Offline'}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleSync}
                    disabled={!isOnline}
                    className="h-6 px-2"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Sincronizar
                  </Button>
                </div>
                {lastSync && (
                  <div className="text-xs text-muted-foreground">
                    Última sincronização: {lastSync.toLocaleTimeString()}
                  </div>
                )}
              </div>
              {/* Espaço extra antes do botão de sair */}
              <div className="mt-6">
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => { authLogout(); window.location.reload(); }}
                >
                  Sair
                </Button>
              </div>
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="w-full overflow-auto">
          <div className="p-4 sm:p-6 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSidebar}
              className="mb-4"
            >
              {sidebarVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
              <span className="ml-2">{sidebarVisible ? 'Esconder Menu' : 'Mostrar Menu'}</span>
            </Button>
            <div className="w-full">
              <Outlet />
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}