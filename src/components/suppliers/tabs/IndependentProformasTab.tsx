
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { ProformaForm } from '../ProformaForm';
import { IndependentProformasView } from '../IndependentProformasView';

interface IndependentProformasTabProps {
  proformas: any[];
  isLoading: boolean;
  isEquipmentsLoading: boolean;
}

export const IndependentProformasTab = ({
  proformas,
  isLoading,
  isEquipmentsLoading
}: IndependentProformasTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold">Proformas Independientes</h2>
          <p className="text-muted-foreground">
            Gestiona proformas no ligadas a proyectos específicos
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={isEquipmentsLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {isEquipmentsLoading ? 'Cargando...' : 'Nueva Proforma'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Proforma Independiente</DialogTitle>
            </DialogHeader>
            <ProformaForm />
          </DialogContent>
        </Dialog>
      </div>

      <IndependentProformasView 
        proformas={proformas} 
        isLoading={isLoading} 
      />
    </div>
  );
};
