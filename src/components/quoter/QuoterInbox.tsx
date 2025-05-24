
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Edit,
  Calendar
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockAssignedItems = [
  {
    id: 1,
    project: "Hospital San Juan - UCI",
    itemNumber: "001",
    code: "EQ-001",
    name: "Monitor de signos vitales",
    quantity: 5,
    status: "Pendiente",
    dueDate: "2024-02-15",
    priority: "Alta",
    quotationsCount: 0
  },
  {
    id: 2,
    project: "Hospital San Juan - UCI",
    itemNumber: "002",
    code: "EQ-002",
    name: "Electrocardiógrafo",
    quantity: 2,
    status: "En progreso",
    dueDate: "2024-02-20",
    priority: "Media",
    quotationsCount: 2
  },
  {
    id: 3,
    project: "Clínica Norte - Quirófanos",
    itemNumber: "015",
    code: "EQ-015",
    name: "Desfibrilador",
    quantity: 1,
    status: "Completado",
    dueDate: "2024-02-10",
    priority: "Alta",
    quotationsCount: 3
  },
  {
    id: 4,
    project: "Centro Médico Sur - Laboratorio",
    itemNumber: "008",
    code: "LAB-008",
    name: "Microscopio binocular",
    quantity: 4,
    status: "Pendiente",
    dueDate: "2024-02-25",
    priority: "Baja",
    quotationsCount: 0
  },
];

const statusColors = {
  "Pendiente": "bg-orange-100 text-orange-800",
  "En progreso": "bg-blue-100 text-blue-800",
  "Completado": "bg-green-100 text-green-800",
};

const priorityColors = {
  "Alta": "bg-red-100 text-red-800",
  "Media": "bg-yellow-100 text-yellow-800",
  "Baja": "bg-gray-100 text-gray-800",
};

export const QuoterInbox = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredItems = mockAssignedItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.project.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const pendingCount = mockAssignedItems.filter(item => item.status === "Pendiente").length;
  const inProgressCount = mockAssignedItems.filter(item => item.status === "En progreso").length;
  const completedCount = mockAssignedItems.filter(item => item.status === "Completado").length;

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Mi Bandeja de Cotización</h3>
          <p className="text-gray-600">Gestiona los ítems asignados para cotización</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                <p className="text-sm text-gray-600">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Edit className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                <p className="text-sm text-gray-600">En progreso</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedCount}</p>
                <p className="text-sm text-gray-600">Completados</p>
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="Pendiente">Pendiente</SelectItem>
            <SelectItem value="En progreso">En progreso</SelectItem>
            <SelectItem value="Completado">Completado</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Prioridad" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las prioridades</SelectItem>
            <SelectItem value="Alta">Alta</SelectItem>
            <SelectItem value="Media">Media</SelectItem>
            <SelectItem value="Baja">Baja</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {filteredItems.map((item) => {
          const daysUntilDue = getDaysUntilDue(item.dueDate);
          const isOverdue = daysUntilDue < 0;
          const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

          return (
            <Card key={item.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="font-semibold text-gray-900">{item.name}</h4>
                      <Badge className={statusColors[item.status as keyof typeof statusColors]}>
                        {item.status}
                      </Badge>
                      <Badge className={priorityColors[item.priority as keyof typeof priorityColors]}>
                        {item.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.project}</p>
                    <p className="text-sm text-gray-500">
                      Código: {item.code} | Cantidad: {item.quantity} unidades
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Ver
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Cotizar
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Vence: {item.dueDate}</span>
                      {isOverdue && (
                        <AlertTriangle className="w-4 h-4 text-red-500 ml-1" />
                      )}
                      {isDueSoon && !isOverdue && (
                        <Clock className="w-4 h-4 text-orange-500 ml-1" />
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {item.quotationsCount} cotización(es) registrada(s)
                    </div>
                  </div>
                  
                  <div className="text-sm">
                    {isOverdue ? (
                      <span className="text-red-600 font-medium">
                        Vencido ({Math.abs(daysUntilDue)} días)
                      </span>
                    ) : isDueSoon ? (
                      <span className="text-orange-600 font-medium">
                        Vence en {daysUntilDue} día(s)
                      </span>
                    ) : (
                      <span className="text-gray-600">
                        {daysUntilDue} días restantes
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <CheckCircle2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay ítems que coincidan</h3>
          <p className="text-gray-600">Intenta ajustar los filtros de búsqueda.</p>
        </div>
      )}
    </div>
  );
};
