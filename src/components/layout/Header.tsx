
import { Bell, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  userRole: string;
  currentView: string;
}

const viewTitles = {
  dashboard: "Dashboard",
  projects: "Gestión de Proyectos",
  "new-project": "Nuevo Proyecto",
  "item-assignment": "Asignación de Ítems",
  "quoter-inbox": "Bandeja de Cotizador",
  "quotation-comparison": "Comparación de Cotizaciones",
  "supplier-management": "Panel de Proveedores",
  "user-management": "Gestión de Usuarios",
  "assignment-rules": "Reglas de Asignación",
  settings: "Configuración",
};

export const Header = ({ userRole, currentView }: HeaderProps) => {
  const { user, signOut } = useAuth();
  
  const currentTitle = viewTitles[currentView as keyof typeof viewTitles] || "MediMatic";

  const getRoleDisplayName = (role: string) => {
    const roleNames = {
      admin: "Administrador",
      coordinador: "Coordinador",
      cotizador: "Cotizador",
      comercial: "Comercial",
    };
    return roleNames[role as keyof typeof roleNames] || role;
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="h-16 border-b border-gray-200 bg-white px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{currentTitle}</h1>
          <p className="text-sm text-gray-500">Sistema de cotizaciones para equipos médicos</p>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar..."
            className="pl-10 w-64"
          />
        </div>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 bg-red-500">
            3
          </Badge>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center space-x-3 h-auto p-2">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  <User className="w-4 h-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden md:block">
                <p className="text-sm font-medium">{user?.email}</p>
                <p className="text-xs text-gray-500">{getRoleDisplayName(userRole)}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Mi Perfil</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
