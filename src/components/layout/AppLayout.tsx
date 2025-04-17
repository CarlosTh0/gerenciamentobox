
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
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
import { Sun, Moon, LayoutDashboard, Truck, RefreshCw, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout() {
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

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
      <div className={`min-h-screen flex w-full ${theme === 'dark' ? 'dark' : ''}`}>
        <Sidebar>
          <SidebarHeader className="flex h-14 items-center border-b px-6">
            <span className="text-lg font-semibold">Sistema de Cargas</span>
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
                    <Link to="/">
                      <Truck size={18} />
                      <span>Gerenciamento</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === '/dashboard'}
                  >
                    <Link to="/dashboard">
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                  <span className="ml-2">{theme === 'dark' ? 'Claro' : 'Escuro'}</span>
                </Button>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-muted-foreground">
                  {isOnline ? 'Online' : 'Offline'}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSync}
                  disabled={!isOnline}
                >
                  <RefreshCw size={16} className="mr-1" />
                  Sincronizar
                </Button>
              </div>
              {lastSync && (
                <div className="text-xs text-muted-foreground">
                  Última sincronização: {lastSync.toLocaleTimeString()}
                </div>
              )}
            </div>
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
        <SidebarInset className="w-full overflow-auto">
          <div className="p-2 sm:p-4 w-full">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={toggleSidebar}
              className="mb-4"
            >
              {sidebarVisible ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
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
