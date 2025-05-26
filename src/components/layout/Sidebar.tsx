
import { cn } from "@/lib/utils";
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

interface SidebarProps {
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
    { id: "supplier-management", label: "Gestión de Proveedores", icon: Package },
    { id: "settings", label: "Configuración", icon: Settings },
  ],
  cotizador: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quoter-inbox", label: "Mi Bandeja", icon: Inbox },
    { id: "projects", label: "Ver Proyectos", icon: FolderOpen },
    { id: "supplier-management", label: "Gestión de Proveedores", icon: Package },
  ],
  comercial: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "quotation-comparison", label: "Comparar Cotizaciones", icon: GitCompare },
    { id: "projects", label: "Proyectos", icon: FolderOpen },
    { id: "supplier-management", label: "Gestión de Proveedores", icon: Package },
  ],
  admin: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "projects", label: "Proyectos", icon: FolderOpen },
    { id: "item-assignment", label: "Asignar Ítems", icon: ListChecks },
    { id: "quoter-inbox", label: "Bandejas", icon: Inbox },
    { id: "quotation-comparison", label: "Comparar Cotizaciones", icon: GitCompare },
    { id: "supplier-management", label: "Gestión de Proveedores", icon: Package },
    { id: "user-management", label: "Gestión de Usuarios", icon: Users },
    { id: "assignment-rules", label: "Reglas de Asignación", icon: Sliders },
    { id: "settings", label: "Administración", icon: Settings },
  ],
};

export const Sidebar = ({ currentView, onViewChange, userRole }: SidebarProps) => {
  const items = menuItems[userRole as keyof typeof menuItems] || menuItems.coordinador;

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">MediMatic</h1>
            <p className="text-sm text-gray-500">Cotizaciones</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors",
                currentView === item.id
                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
