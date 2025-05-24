
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Filter,
  Save,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const mockProjects = [
  { id: 1, name: "Hospital San Juan - UCI", items: 45 },
  { id: 2, name: "Clínica Norte - Quirófanos", items: 78 },
  { id: 3, name: "Centro Médico Sur - Laboratorio", items: 23 },
];

const mockQuoters = [
  { id: 1, name: "María González", specialty: "Equipos de diagnóstico" },
  { id: 2, name: "Carlos Rodríguez", specialty: "Mobiliario médico" },
  { id: 3, name: "Ana López", specialty: "Instrumental quirúrgico" },
  { id: 4, name: "Pedro Martín", specialty: "Equipos de laboratorio" },
];

const mockItems = [
  { 
    id: 1, 
    number: "001", 
    code: "EQ-001", 
    group: "Equipos de diagnóstico", 
    name: "Monitor de signos vitales", 
    quantity: 5,
    assignedTo: null
  },
  { 
    id: 2, 
    number: "002", 
    code: "EQ-002", 
    group: "Equipos de diagnóstico", 
    name: "Electrocardiógrafo", 
    quantity: 2,
    assignedTo: 1
  },
  { 
    id: 3, 
    number: "003", 
    code: "MOB-001", 
    group: "Mobiliario", 
    name: "Cama hospitalaria eléctrica", 
    quantity: 10,
    assignedTo: 2
  },
  { 
    id: 4, 
    number: "004", 
    code: "INS-001", 
    group: "Instrumental", 
    name: "Set básico de cirugía", 
    quantity: 3,
    assignedTo: null
  },
];

export const ItemAssignment = () => {
  const [selectedProject, setSelectedProject] = useState("1");
  const [items, setItems] = useState(mockItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGroup = groupFilter === "all" || item.group === groupFilter;
    return matchesSearch && matchesGroup;
  });

  const uniqueGroups = [...new Set(items.map(item => item.group))];
  const unassignedCount = items.filter(item => !item.assignedTo).length;
  const assignedCount = items.filter(item => item.assignedTo).length;

  const handleAssignment = (itemId: number, quoterId: string) => {
    setItems(prev => prev.map(item => 
      item.id === itemId 
        ? { ...item, assignedTo: quoterId === "unassigned" ? null : parseInt(quoterId) }
        : item
    ));
  };

  const handleSaveAssignments = async () => {
    setIsSaving(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Asignaciones guardadas",
        description: "Las asignaciones de ítems han sido guardadas exitosamente.",
      });
      setIsSaving(false);
    }, 1500);
  };

  const getQuoterName = (quoterId: number | null) => {
    if (!quoterId) return null;
    return mockQuoters.find(q => q.id === quoterId)?.name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Asignación de Ítems</h3>
          <p className="text-gray-600">Asigna ítems del proyecto a cotizadores específicos</p>
        </div>
        <Button 
          onClick={handleSaveAssignments}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          {isSaving ? (
            <>
              <Save className="w-4 h-4 mr-2 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Guardar Asignaciones
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Seleccionar Proyecto</CardTitle>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-80">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                {mockProjects.map(project => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>{project.name}</span>
                      <Badge variant="secondary">{project.items} ítems</Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{unassignedCount}</p>
                <p className="text-sm text-gray-600">Ítems sin asignar</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{assignedCount}</p>
                <p className="text-sm text-gray-600">Ítems asignados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{mockQuoters.length}</p>
                <p className="text-sm text-gray-600">Cotizadores disponibles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar ítems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-full sm:w-64">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grupos</SelectItem>
            {uniqueGroups.map(group => (
              <SelectItem key={group} value={group}>{group}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Ítems</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Nº</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Código</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Grupo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Nombre del Equipo</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Cantidad</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">Asignado a</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{item.number}</td>
                    <td className="py-3 px-4 text-sm font-mono">{item.code}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">
                        {item.group}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm font-medium">{item.name}</td>
                    <td className="py-3 px-4 text-sm">{item.quantity}</td>
                    <td className="py-3 px-4">
                      <Select 
                        value={item.assignedTo?.toString() || "unassigned"}
                        onValueChange={(value) => handleAssignment(item.id, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Sin asignar" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">
                            <span className="text-gray-500">Sin asignar</span>
                          </SelectItem>
                          {mockQuoters.map(quoter => (
                            <SelectItem key={quoter.id} value={quoter.id.toString()}>
                              <div className="flex flex-col">
                                <span>{quoter.name}</span>
                                <span className="text-xs text-gray-500">{quoter.specialty}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
