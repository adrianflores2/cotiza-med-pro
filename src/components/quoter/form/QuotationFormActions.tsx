
import { Button } from "@/components/ui/button";
import { Save, Send, Upload } from "lucide-react";

interface QuotationFormActionsProps {
  onSaveDraft: () => void;
  onSubmit: () => void;
  isCreating: boolean;
}

export const QuotationFormActions = ({ onSaveDraft, onSubmit, isCreating }: QuotationFormActionsProps) => {
  return (
    <div className="space-y-6">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-2">
          Subir proforma (PDF, máximo 10MB)
        </p>
        <Button variant="outline" size="sm">
          Seleccionar archivo
        </Button>
      </div>

      <div className="flex justify-end space-x-4 pt-4">
        <Button 
          variant="outline" 
          onClick={onSaveDraft}
          disabled={isCreating}
        >
          <Save className="w-4 h-4 mr-2" />
          Guardar borrador
        </Button>
        <Button 
          onClick={onSubmit}
          disabled={isCreating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Send className="w-4 h-4 mr-2" />
          {isCreating ? 'Enviando...' : 'Enviar cotización'}
        </Button>
      </div>
    </div>
  );
};
