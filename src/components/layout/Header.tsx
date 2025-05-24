
import { Bell, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  userRole: string;
  onRoleChange: (role: string) => void;
  currentView: string;
}

const roleLabels = {
  coordinador: "Coordinador",
  cotizador: "Cotizador",
  comercial: "Comercial",
  admin: "Administrador",
};

const viewTitles = {
  dashboard: "Dashboard",
  projects: "Gestión de Proyectos",
  "new-project": "Nuevo Proyecto",
  "item-assignment": "Asignación de Ítems",
  "quoter-inbox": "Bandeja de Cotizador",
  "quotation-comparison": "Comparación de Cotizaciones",
  settings: "Configuración",
};

export const Header = ({ userRole, onRoleChange, currentView }: HeaderProps) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {viewTitles[currentView as keyof typeof viewTitles] || "MediMatic"}
          </h2>
          <p className="text-gray-500">
            Sistema de cotizaciones para equipos médicos
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Usuario Demo</p>
                  <p className="text-xs text-gray-500">{roleLabels[userRole as keyof typeof roleLabels]}</p>
                </div>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onRoleChange("coordinador")}>
                Cambiar a Coordinador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("cotizador")}>
                Cambiar a Cotizador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("comercial")}>
                Cambiar a Comercial
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onRoleChange("admin")}>
                Cambiar a Admin
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
