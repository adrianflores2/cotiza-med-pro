
import { useState } from "react";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserPlus, UserMinus, Users, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // Estados para crear usuario
  const [newUserData, setNewUserData] = useState({
    nombre: "",
    email: "",
    password: "",
    role: "" as UserRole | ""
  });
  
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

  const handleCreateUser = async () => {
    if (!newUserData.nombre || !newUserData.email || !newUserData.password) {
      toast({
        title: "Error",
        description: "Completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      console.log('UserManagement: Creating user:', newUserData.email);
      
      // Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: newUserData.email,
        password: newUserData.password,
        email_confirm: true,
        user_metadata: {
          nombre: newUserData.nombre
        }
      });

      if (authError) {
        console.error('UserManagement: Auth error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      console.log('UserManagement: User created in auth:', authData.user.id);

      // Crear registro en la tabla users
      const { error: userError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          nombre: newUserData.nombre,
          email: newUserData.email
        });

      if (userError) {
        console.error('UserManagement: User table error:', userError);
        throw userError;
      }

      // Asignar rol si se especificó
      if (newUserData.role) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: newUserData.role
          });

        if (roleError) {
          console.error('UserManagement: Role assignment error:', roleError);
          // No lanzamos error aquí, el usuario se creó correctamente
          toast({
            title: "Usuario creado",
            description: "Usuario creado correctamente, pero hubo un problema asignando el rol. Puedes asignarlo manualmente.",
            variant: "destructive",
          });
        }
      }

      toast({
        title: "Usuario creado",
        description: "El usuario ha sido creado exitosamente",
      });

      // Limpiar formulario y cerrar diálogo
      setNewUserData({ nombre: "", email: "", password: "", role: "" });
      setIsCreateDialogOpen(false);
      
      // Recargar datos
      window.location.reload();

    } catch (error: any) {
      console.error('UserManagement: Error creating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el usuario",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-6 h-6" />
          <h1 className="text-2xl font-bold">Gestión de Usuarios</h1>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Completa los datos para crear un nuevo usuario en el sistema.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input
                  id="nombre"
                  value={newUserData.nombre}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Nombre del usuario"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Contraseña *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserData.password}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Contraseña del usuario"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Rol inicial (opcional)</Label>
                <Select 
                  value={newUserData.role} 
                  onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value as UserRole }))}
                >
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
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCreateUser}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Crear Usuario
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
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
      
      {users.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay usuarios</h3>
          <p className="text-gray-600">Crea el primer usuario del sistema.</p>
        </div>
      )}
    </div>
  );
};
