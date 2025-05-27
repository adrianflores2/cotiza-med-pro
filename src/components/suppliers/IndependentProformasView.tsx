
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, ExternalLink, Trash2 } from 'lucide-react';
import { useIndependentProformas } from '@/hooks/useIndependentProformas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface IndependentProforma {
  id: string;
  supplier_equipment_id: string;
  archivo_url?: string;
  fecha_proforma: string;
  precio_unitario?: number;
  moneda?: string;
  tiempo_entrega?: string;
  condiciones?: string;
  observaciones?: string;
  vigente: boolean;
  supplier_equipments?: {
    marca: string;
    modelo: string;
    master_equipment?: {
      codigo: string;
      nombre_equipo: string;
      grupo_generico: string;
    };
    suppliers?: {
      razon_social: string;
      ruc?: string;
    };
  };
}

interface IndependentProformasViewProps {
  proformas: IndependentProforma[];
  isLoading?: boolean;
}

export const IndependentProformasView = ({ proformas, isLoading }: IndependentProformasViewProps) => {
  const { deleteProforma, isDeleting } = useIndependentProformas();

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE');
  };

  const handleDeleteProforma = (proformaId: string) => {
    deleteProforma(proformaId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando proformas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (proformas.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No hay proformas independientes registradas</p>
            <p className="text-sm text-gray-400 mt-2">
              Las proformas aparecerán aquí cuando se creen desde el botón "Nueva Proforma"
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Proformas Independientes ({proformas.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Marca/Modelo</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Tiempo Entrega</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proformas.map((proforma) => (
                <TableRow key={proforma.id}>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(proforma.fecha_proforma)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium text-sm">
                        {proforma.supplier_equipments?.master_equipment?.nombre_equipo || 'Equipo no especificado'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {proforma.supplier_equipments?.master_equipment?.codigo}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {proforma.supplier_equipments?.marca || 'N/A'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {proforma.supplier_equipments?.modelo || 'N/A'}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">
                        {proforma.supplier_equipments?.suppliers?.razon_social || 'Proveedor no especificado'}
                      </div>
                      {proforma.supplier_equipments?.suppliers?.ruc && (
                        <div className="text-xs text-muted-foreground">
                          RUC: {proforma.supplier_equipments.suppliers.ruc}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {formatPrice(proforma.precio_unitario, proforma.moneda)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {proforma.tiempo_entrega || 'No especificado'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={proforma.vigente ? "default" : "secondary"}>
                      {proforma.vigente ? 'Vigente' : 'Vencida'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {proforma.archivo_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          title="Ver archivo"
                        >
                          <a href={proforma.archivo_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={isDeleting}
                            title="Eliminar proforma"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar proforma?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción no se puede deshacer. La proforma será eliminada permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteProforma(proforma.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {proformas.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Mostrando {proformas.length} proforma{proformas.length !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
