
import React from "react";
import { OptimizedSupplierCard } from './OptimizedSupplierCard';

interface OptimizedSupplierGridProps {
  suppliers: any[];
  canEditSuppliers: boolean;
  onEditSupplier: (supplier: any) => void;
}

export const OptimizedSupplierGrid = React.memo(({ 
  suppliers, 
  canEditSuppliers, 
  onEditSupplier 
}: OptimizedSupplierGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <OptimizedSupplierCard
          key={supplier.id}
          supplier={supplier}
          canEdit={canEditSuppliers}
          onEdit={onEditSupplier}
        />
      ))}
    </div>
  );
});

OptimizedSupplierGrid.displayName = 'OptimizedSupplierGrid';
