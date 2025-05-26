
import { 
  LayoutDashboard, 
  FolderOpen, 
  ListChecks, 
  Inbox, 
  GitCompare,
  Settings,
  Building2,
  Users,
  Sliders,
  Package
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AppSidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userRole: string;
}

const menuItems = {
  coordinador: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Proyectos", icon: FolderOpen },
    { id: "item-assignment", label: "Asignar Ítems", icon: ListChecks },
    { id: "quotation-comparison", label: "Comparar Cotizaciones", icon: GitCompare },
    { id: "supplier-management", label: "Panel de Proveedores", icon: Package },
    { id: "settings", label: "Configuración", icon: Settings },
  ],
  cotizador: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quoter-inbox", label: "Mi Bandeja", icon: Inbox },
    { id: "projects", label: "Ver Proyectos", icon: FolderOpen },
    { id: "supplier-management", label: "Panel de Proveedores", icon: Package },
  ],
  comercial: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quotation-comparison", label: "Comparar Cotizaciones", icon: GitCompare },
    { id: "projects", label: "Proyectos", icon: FolderOpen },
    { id: "supplier-management", label: "Panel de Proveedores", icon: Package },
  ],
  admin: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Proyectos", icon: FolderOpen },
    { id: "item-assignment", label: "Asignar Ítems", icon: ListChecks },
    { id: "quoter-inbox", label: "Bandejas", icon: Inbox },
    { id: "quotation-comparison", label: "Comparar Cotizaciones", icon: GitCompare },
    { id: "supplier-management", label: "Panel de Proveedores", icon: Package },
    { id: "user-management", label: "Gestión de Usuarios", icon: Users },
    { id: "assignment-rules", label: "Reglas de Asignación", icon: Sliders },
    { id: "settings", label: "Administración", icon: Settings },
  ],
};

export function AppSidebar({ currentView, onViewChange, userRole }: AppSidebarProps) {
  const items = menuItems[userRole as keyof typeof menuItems] || menuItems.coordinador;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center space-x-3 p-4">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <h1 className="font-bold text-gray-900">MediMatic</h1>
            <p className="text-sm text-gray-500">Cotizaciones</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      isActive={currentView === item.id}
                      onClick={() => onViewChange(item.id)}
                      tooltip={item.label}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex items-center justify-center group-data-[collapsible=icon]:hidden">
          <SidebarTrigger />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
