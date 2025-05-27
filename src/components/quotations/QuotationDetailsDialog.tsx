
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "@/components/ui/alert-dialog";
import {
  FileText,
  Calendar,
  User,
  Package,
  DollarSign,
  Clock,
  Building,
  Trash2,
  Edit,
  MapPin
} from "lucide-react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuotationManagement } from '@/hooks/useQuotationManagement';

interface QuotationDetailsDialogProps {
  quotation: any;
  isOpen: boolean;
  onClose: () => void;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: (quotationId: string) => void;
  availableQuotations?: any[];
  onQuotationSelect?: (quotation: any) => void;
}

export const QuotationDetailsDialog = ({ 
  quotation, 
  isOpen, 
  onClose, 
  showActions = false,
  onEdit,
  onDelete,
  availableQuotations = [],
  onQuotationSelect
}: QuotationDetailsDialogProps) => {
  const [accessories, setAccessories] = useState(quotation?.accessories || []);
  const { deleteQuotation, isDeleting } = useQuotationManagement();

  if (!quotation) return null;

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'bg-green-100 text-green-800';
      case 'vencida':
        return 'bg-red-100 text-red-800';
      case 'seleccionada':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (estado: string) => {
    switch (estado) {
      case 'vigente':
        return 'Vigente';
      case 'vencida':
        return 'Vencida';
      case 'seleccionada':
        return 'Seleccionada';
      default:
        return 'Desconocido';
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(quotation.id);
    } else {
      deleteQuotation(quotation.id);
      onClose();
    }
  };

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return `${currency} ${price.toLocaleString()}`;
  };

  // Get accessories from quotation data
  const currentAccessories = quotation.accessories || quotation.quotation_accessories || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Detalle de Cotización</span>
            </DialogTitle>
            <div className="flex items-center space-x-3">
              <Badge className={getStatusColor(quotation.estado)}>
                {getStatusText(quotation.estado)}
              </Badge>
              {showActions && (
                <div className="flex space-x-2">
                  {onEdit && (
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      <Edit className="w-4 h-4 mr-2" />
                      Editar
                    </Button>
                  )}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Eliminar
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar cotización?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará la cotización y todos sus accesorios asociados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? 'Eliminando...' : 'Eliminar'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Quotation selector if multiple quotations available */}
        {availableQuotations.length > 1 && onQuotationSelect && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar cotización ({availableQuotations.length} disponibles)
            </label>
            <Select 
              value={quotation.id} 
              onValueChange={(value) => {
                const selectedQuotation = availableQuotations.find(q => q.id === value);
                if (selectedQuotation) {
                  onQuotationSelect(selectedQuotation);
                }
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Seleccionar cotización" />
              </SelectTrigger>
              <SelectContent>
                {availableQuotations.map((q, index) => (
                  <SelectItem key={q.id} value={q.id}>
                    {`${index + 1}. ${q.marca} ${q.modelo} - ${q.moneda} ${q.precio_unitario?.toLocaleString()}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-4">
          {/* Información General Compacta */}
          <Card>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="text-gray-600">Fecha:</span>
                    <p className="font-medium">
                      {quotation.fecha_cotizacion ? format(new Date(quotation.fecha_cotizacion), 'd/M/yyyy', { locale: es }) : 'No especificada'}
                    </p>
                  </div>
                </div>
                
                {quotation.fecha_vencimiento && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Vencimiento:</span>
                      <p className="font-medium">
                        {format(new Date(quotation.fecha_vencimiento), 'd/M/yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                )}

                {quotation.cotizador && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <div>
                      <span className="text-gray-600">Cotizador:</span>
                      <p className="font-medium">{quotation.cotizador.nombre}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información Principal en dos columnas */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Producto */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Package className="w-4 h-4 text-gray-500" />
                  <h3 className="font-semibold">Producto</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Marca:</span>
                    <span className="font-medium">{quotation.marca || 'No especificada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Modelo:</span>
                    <span className="font-medium">{quotation.modelo || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Procedencia:</span>
                    <span className="font-medium">{quotation.procedencia || 'No especificada'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tipo:</span>
                    <span className="font-medium">{quotation.tipo_cotizacion || 'Nacional'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proveedor */}
            {quotation.supplier && (
              <Card>
                <CardContent className="pt-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Building className="w-4 h-4 text-gray-500" />
                    <h3 className="font-semibold">Proveedor</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Razón Social:</span>
                      <span className="font-medium">{quotation.supplier.razon_social}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">RUC:</span>
                      <span className="font-medium">{quotation.supplier.ruc}</span>
                    </div>
                    {quotation.supplier.pais && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">País:</span>
                        <span className="font-medium">{quotation.supplier.pais}</span>
                      </div>
                    )}
                    {quotation.supplier.tipo_proveedor && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tipo:</span>
                        <span className="font-medium capitalize">{quotation.supplier.tipo_proveedor}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Información Comercial */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center space-x-2 mb-3">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <h3 className="font-semibold">Información Comercial</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Precio Unitario:</span>
                  <p className="font-bold text-lg text-green-600">
                    {quotation.moneda} {quotation.precio_unitario?.toLocaleString() || '0'}
                  </p>
                </div>
                {quotation.tiempo_entrega && (
                  <div>
                    <span className="text-gray-600">Tiempo de Entrega:</span>
                    <p className="font-medium">{quotation.tiempo_entrega}</p>
                  </div>
                )}
                {quotation.incoterm && (
                  <div>
                    <span className="text-gray-600">Incoterm:</span>
                    <p className="font-medium">{quotation.incoterm}</p>
                  </div>
                )}
                {quotation.tipo_cambio && (
                  <div>
                    <span className="text-gray-600">Tipo de Cambio:</span>
                    <p className="font-medium">{quotation.tipo_cambio}</p>
                  </div>
                )}
              </div>

              {quotation.condiciones && (
                <div className="mt-3">
                  <span className="text-sm text-gray-600">Condiciones:</span>
                  <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                    {quotation.condiciones}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accesorios */}
          {currentAccessories && currentAccessories.length > 0 && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-3">Accesorios Cotizados</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="font-semibold">Nombre</TableHead>
                        <TableHead className="font-semibold text-center">Cant.</TableHead>
                        <TableHead className="font-semibold text-right">Precio Unit.</TableHead>
                        <TableHead className="font-semibold text-center">Incluido</TableHead>
                        <TableHead className="font-semibold">Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentAccessories.map((accessory: any, index: number) => (
                        <TableRow key={index} className="text-sm">
                          <TableCell className="font-medium">{accessory.nombre}</TableCell>
                          <TableCell className="text-center">{accessory.cantidad}</TableCell>
                          <TableCell className="text-right">
                            {accessory.precio_unitario 
                              ? formatPrice(accessory.precio_unitario, accessory.moneda)
                              : 'No definido'
                            }
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={accessory.incluido_en_proforma ? "default" : "secondary"} className="text-xs">
                              {accessory.incluido_en_proforma ? 'Sí' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-gray-600">
                            {accessory.observaciones || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          {quotation.observaciones && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">Observaciones</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {quotation.observaciones}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Archivos adjuntos */}
          {quotation.proforma_url && (
            <Card>
              <CardContent className="pt-4">
                <h3 className="font-semibold mb-2">Archivos</h3>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-sm">Proforma</p>
                      <p className="text-xs text-gray-600">Archivo de cotización</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Ver archivo
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
