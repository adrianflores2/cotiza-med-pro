
import React from "react";
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';

interface OptimizedSupplierCardProps {
  supplier: any;
  canEdit: boolean;
  onEdit: (supplier: any) => void;
}

export const OptimizedSupplierCard = React.memo(({ 
  supplier, 
  canEdit, 
  onEdit 
}: OptimizedSupplierCardProps) => {
  const handleEdit = React.useCallback(() => {
    onEdit(supplier);
  }, [supplier, onEdit]);

  const contactName = React.useMemo(() => {
    if (supplier.nombre_contacto) {
      return `${supplier.nombre_contacto} ${supplier.apellido_contacto || ''}`.trim();
    }
    return 'Sin contacto';
  }, [supplier.nombre_contacto, supplier.apellido_contacto]);

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">{supplier.razon_social}</h3>
            {canEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEdit}
                title="Editar proveedor"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-sm text-muted-foreground">RUC: {supplier.ruc}</p>
          {supplier.pais && (
            <p className="text-sm text-muted-foreground">País: {supplier.pais}</p>
          )}
          {supplier.email_contacto && (
            <p className="text-sm text-muted-foreground">{supplier.email_contacto}</p>
          )}
          {supplier.telefono_contacto && (
            <p className="text-sm text-muted-foreground">Tel: {supplier.telefono_contacto}</p>
          )}
          <div className="flex items-center justify-between pt-2">
            <Badge variant="outline">
              {contactName}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

OptimizedSupplierCard.displayName = 'OptimizedSupplierCard';
