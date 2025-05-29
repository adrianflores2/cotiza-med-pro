
import { SupplierCard } from './SupplierCard';

interface SupplierGridProps {
  suppliers: any[];
  canEditSuppliers: boolean;
  onEditSupplier: (supplier: any) => void;
}

export const SupplierGrid = ({ suppliers, canEditSuppliers, onEditSupplier }: SupplierGridProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((supplier) => (
        <SupplierCard
          key={supplier.id}
          supplier={supplier}
          canEdit={canEditSuppliers}
          onEdit={onEditSupplier}
        />
      ))}
    </div>
  );
};
