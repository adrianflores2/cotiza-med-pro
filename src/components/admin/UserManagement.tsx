
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, UserMinus, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { UserRole } from "@/types/database";

const roleLabels = {
  admin: "Administrador",
  coordinador: "Coordinador",
  cotizador: "Cotizador",
  comercial: "Comercial",
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  coordinador: "bg-blue-100 text-blue-800",
  cotizador: "bg-green-100 text-green-800",
  comercial: "bg-purple-100 text-purple-800",
};

export const UserManagement = () => {
  const { users, isLoading, assignRole, removeRole, isAssigning, isRemoving } = useUsers();
  const [selectedRole, setSelectedRole] = useState<UserRole | "">("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const { toast } = useToast();

  const handleAssignRole = () => {
    if (!selectedUser || !selectedRole) {
      toast({
        title: "Error",
        description: "Selecciona un usuario y un rol",
        variant: "destructive",
      });
      return;
    }

    assignRole(
      { userId: selectedUser, role: selectedRole as UserRole },
      {
        onSuccess: () => {
          toast({
            title: "Rol asignado",
            description: "El rol ha sido asignado correctamente",
          });
          setSelectedUser("");
          setSelectedRole("");
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo asignar el rol",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleRemoveRole = (userId: string, role: UserRole) => {
    removeRole(
      { userId, role },
      {
        onSuccess: () => {
          toast({
            title: "Rol removido",
            description: "El rol ha sido removido correctamente",
          });
        },
        onError: () => {
          toast({
            title: "Error",
            description: "No se pudo remover el rol",
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando usuarios...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Users className="w-6 h-6" />
        <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Asignar Rol</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar usuario" />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.nombre} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(roleLabels).map(([role, label]) => (
                  <SelectItem key={role} value={role}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handleAssignRole}
              disabled={!selectedUser || !selectedRole || isAssigning}
              className="w-full"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Asignar Rol
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{user.nombre}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <p className="text-xs text-gray-400">
                    Registrado: {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <div key={role} className="flex items-center gap-1">
                        <Badge className={roleColors[role]}>
                          {roleLabels[role]}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveRole(user.id, role)}
                          disabled={isRemoving}
                          className="h-6 w-6 p-0"
                        >
                          <UserMinus className="w-3 h-3" />
                        </Button>
                      </div>
                    ))
                  ) : (
                    <Badge variant="secondary">Sin roles</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
