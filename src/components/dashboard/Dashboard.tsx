
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  FolderOpen, 
  ListChecks, 
  Clock, 
  TrendingUp,
  Users,
  FileText,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface DashboardProps {
  userRole: string;
}

export const Dashboard = ({ userRole }: DashboardProps) => {
  const getStatsForRole = () => {
    switch (userRole) {
      case "coordinador":
        return [
          { title: "Proyectos Activos", value: "12", icon: FolderOpen, color: "text-blue-600" },
          { title: "Ítems Pendientes", value: "245", icon: ListChecks, color: "text-orange-600" },
          { title: "Cotizadores Asignados", value: "8", icon: Users, color: "text-green-600" },
          { title: "Cotizaciones Completadas", value: "156", icon: CheckCircle2, color: "text-emerald-600" },
        ];
      case "cotizador":
        return [
          { title: "Ítems Asignados", value: "32", icon: ListChecks, color: "text-blue-600" },
          { title: "Cotizaciones Pendientes", value: "18", icon: Clock, color: "text-orange-600" },
          { title: "Completadas Hoy", value: "5", icon: CheckCircle2, color: "text-green-600" },
          { title: "Vencen Esta Semana", value: "7", icon: AlertCircle, color: "text-red-600" },
        ];
      case "comercial":
        return [
          { title: "Cotizaciones para Revisar", value: "24", icon: FileText, color: "text-blue-600" },
          { title: "Propuestas Finalizadas", value: "89", icon: CheckCircle2, color: "text-green-600" },
          { title: "Margen Promedio", value: "28%", icon: TrendingUp, color: "text-emerald-600" },
          { title: "Valor Total Cotizado", value: "$2.4M", icon: TrendingUp, color: "text-purple-600" },
        ];
      default:
        return [
          { title: "Total Proyectos", value: "28", icon: FolderOpen, color: "text-blue-600" },
          { title: "Usuarios Activos", value: "15", icon: Users, color: "text-green-600" },
          { title: "Cotizaciones Mes", value: "342", icon: FileText, color: "text-orange-600" },
          { title: "Eficiencia", value: "94%", icon: TrendingUp, color: "text-emerald-600" },
        ];
    }
  };

  const stats = getStatsForRole();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Hospital San Juan - UCI", status: "En cotización", items: 45 },
                { name: "Clínica Norte - Quirófanos", status: "Asignación", items: 78 },
                { name: "Centro Médico Sur - Laboratorio", status: "Comparación", items: 23 },
              ].map((project, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{project.name}</p>
                    <p className="text-sm text-gray-500">{project.items} ítems</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { action: "Nueva cotización", item: "Ventilador mecánico", time: "Hace 2 horas" },
                { action: "Ítem asignado", item: "Monitor de signos vitales", time: "Hace 4 horas" },
                { action: "Cotización aprobada", item: "Mesa quirúrgica", time: "Hace 6 horas" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.item}</p>
                    <p className="text-xs text-gray-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
