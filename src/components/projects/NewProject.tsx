
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Upload, 
  FileSpreadsheet, 
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NewProjectProps {
  onBack: () => void;
}

export const NewProject = ({ onBack }: NewProjectProps) => {
  const [formData, setFormData] = useState({
    name: "",
    client: "",
    description: "",
    excelFile: null as File | null,
    pdfFile: null as File | null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Proyecto creado exitosamente",
        description: "El proyecto ha sido creado y está listo para la asignación de ítems.",
      });
      setIsSubmitting(false);
      onBack();
    }, 2000);
  };

  const isFormValid = formData.name && formData.client && formData.excelFile;

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Nuevo Proyecto</h3>
          <p className="text-gray-600">Crea un nuevo proyecto de cotización médica</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Nombre del Proyecto *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Ej: Hospital San Juan - UCI"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="client">Cliente *</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => handleInputChange("client", e.target.value)}
                  placeholder="Ej: Hospital San Juan"
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Descripción detallada del proyecto..."
                  className="mt-1"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Archivos del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Lista de Ítems (Excel) *</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => handleFileChange("excelFile", e.target.files?.[0] || null)}
                    className="hidden"
                    id="excel-upload"
                  />
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <FileSpreadsheet className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {formData.excelFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          {formData.excelFile.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-1">
                          Haz clic para cargar archivo Excel
                        </p>
                        <p className="text-xs text-gray-400">
                          Debe contener: Nº, Código, Grupo, Nombre, Cantidad
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <Label>Requerimientos Técnicos (PDF)</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileChange("pdfFile", e.target.files?.[0] || null)}
                    className="hidden"
                    id="pdf-upload"
                  />
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    {formData.pdfFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-green-600 font-medium">
                          {formData.pdfFile.name}
                        </span>
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-1">
                          Haz clic para cargar archivo PDF
                        </p>
                        <p className="text-xs text-gray-400">
                          Especificaciones técnicas del proyecto
                        </p>
                      </>
                    )}
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {!isFormValid && (
          <div className="flex items-center space-x-2 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <p className="text-sm text-orange-700">
              Completa todos los campos obligatorios (*) para continuar.
            </p>
          </div>
        )}

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={!isFormValid || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <Upload className="w-4 h-4 mr-2 animate-spin" />
                Creando Proyecto...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Crear Proyecto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
