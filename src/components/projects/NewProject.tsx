
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload, FileSpreadsheet, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProjectsData } from "@/hooks/useProjectsData";
import { useEquipmentMatching } from "@/hooks/useEquipmentMatching";
import { processExcelFile, type ExcelRow } from "@/utils/excelProcessor";
import { useAuth } from "@/hooks/useAuth";

interface NewProjectProps {
  onBack: () => void;
}

export const NewProject = ({ onBack }: NewProjectProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    observaciones: "",
    fecha_vencimiento: "",
  });
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelData, setExcelData] = useState<ExcelRow[]>([]);
  const [isProcessingExcel, setIsProcessingExcel] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { createProject, isCreating } = useProjectsData();
  const { findOrCreateEquipment } = useEquipmentMatching();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo Excel válido (.xlsx o .xls)",
        variant: "destructive",
      });
      return;
    }

    setExcelFile(file);
    setIsProcessingExcel(true);

    try {
      const processedData = await processExcelFile(file);
      setExcelData(processedData);
      toast({
        title: "Archivo procesado",
        description: `Se procesaron ${processedData.length} ítems del Excel`,
      });
    } catch (error) {
      console.error('Error processing Excel:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al procesar el archivo Excel",
        variant: "destructive",
      });
      setExcelFile(null);
    } finally {
      setIsProcessingExcel(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nombre.trim()) {
      toast({
        title: "Error",
        description: "El nombre del proyecto es requerido",
        variant: "destructive",
      });
      return;
    }

    if (excelData.length === 0) {
      toast({
        title: "Error",
        description: "Debes cargar un archivo Excel con los ítems del proyecto",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Processing project items...');
      const projectItems = [];

      for (const row of excelData) {
        try {
          const equipment = await findOrCreateEquipment(
            row.codigo_equipo,
            row.nombre_equipo,
            row.grupo_generico
          );

          projectItems.push({
            numero_item: row.numero_item,
            equipment_id: equipment.id,
            cantidad: row.cantidad,
            requiere_accesorios: row.requiere_accesorios,
            observaciones: row.observaciones,
          });
        } catch (error) {
          console.error(`Error processing item ${row.numero_item}:`, error);
          toast({
            title: "Advertencia",
            description: `No se pudo procesar el ítem ${row.numero_item}: ${row.nombre_equipo}`,
            variant: "destructive",
          });
        }
      }

      if (projectItems.length === 0) {
        throw new Error('No se pudieron procesar los ítems del proyecto');
      }

      const projectData = {
        nombre: formData.nombre.trim(),
        observaciones: formData.observaciones.trim() || undefined,
        fecha_vencimiento: formData.fecha_vencimiento || undefined,
        responsable_id: user?.id,
        items: projectItems,
      };

      console.log('Creating project with data:', projectData);

      createProject(projectData, {
        onSuccess: () => {
          toast({
            title: "Proyecto creado",
            description: `El proyecto "${formData.nombre}" ha sido creado exitosamente con ${projectItems.length} ítems`,
          });
          onBack();
        },
        onError: (error) => {
          console.error('Error creating project:', error);
          toast({
            title: "Error",
            description: "No se pudo crear el proyecto. Intenta nuevamente.",
            variant: "destructive",
          });
        },
      });

    } catch (error) {
      console.error('Error in project creation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al crear el proyecto",
        variant: "destructive",
      });
    }
  };

  const isLoading = isCreating || isProcessingExcel;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
        <h1 className="text-2xl font-bold">Nuevo Proyecto</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="nombre">Nombre del Proyecto *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Ej: Equipamiento Hospital Central"
                required
              />
            </div>

            <div>
              <Label htmlFor="fecha_vencimiento">Fecha de Vencimiento</Label>
              <Input
                id="fecha_vencimiento"
                type="date"
                value={formData.fecha_vencimiento}
                onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="observaciones">Observaciones</Label>
              <Textarea
                id="observaciones"
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                placeholder="Observaciones adicionales del proyecto..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileSpreadsheet className="w-5 h-5" />
              <span>Archivo Excel con Ítems</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="excel">Cargar archivo Excel *</Label>
              <div className="mt-2">
                <Input
                  id="excel"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={isProcessingExcel}
                />
              </div>
              {isProcessingExcel && (
                <div className="flex items-center space-x-2 mt-2 text-sm text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Procesando archivo Excel...</span>
                </div>
              )}
            </div>

            {excelData.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 text-green-800">
                  <Upload className="w-4 h-4" />
                  <span className="font-medium">Archivo procesado exitosamente</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Se encontraron {excelData.length} ítems en el archivo
                </p>
                <div className="mt-2 max-h-32 overflow-y-auto">
                  <div className="text-xs text-green-600">
                    Primeros ítems: {excelData.slice(0, 3).map(item => item.nombre_equipo).join(', ')}
                    {excelData.length > 3 && '...'}
                  </div>
                </div>
              </div>
            )}

            <div className="text-sm text-gray-600">
              <p><strong>Formato esperado del Excel:</strong></p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Primera fila: Encabezados de columnas</li>
                <li>Columnas esperadas: Item/Número, Código, Nombre/Equipo, Grupo/Categoría, Cantidad</li>
                <li>Columnas opcionales: Accesorios, Observaciones</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={isLoading || excelData.length === 0}
            className="min-w-[120px]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              'Crear Proyecto'
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
