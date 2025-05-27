
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
  Edit
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
}

export const QuotationDetailsDialog = ({ 
  quotation, 
  isOpen, 
  onClose, 
  showActions = false,
  onEdit 
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
    deleteQuotation(quotation.id);
    onClose();
  };

  const formatPrice = (price: number | null, currency: string = 'USD') => {
    if (!price) return 'No definido';
    return `${currency} ${price.toLocaleString()}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Detalle de Cotización</span>
            </DialogTitle>
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
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y información básica */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Información General</CardTitle>
                <Badge className={getStatusColor(quotation.estado)}>
                  {getStatusText(quotation.estado)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Fecha:</span>
                  <span className="font-medium">
                    {quotation.fecha_cotizacion ? format(new Date(quotation.fecha_cotizacion), 'd/M/yyyy', { locale: es }) : 'No especificada'}
                  </span>
                </div>
                
                {quotation.fecha_vencimiento && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Vencimiento:</span>
                    <span className="font-medium">
                      {format(new Date(quotation.fecha_vencimiento), 'd/M/yyyy', { locale: es })}
                    </span>
                  </div>
                )}

                {quotation.cotizador && (
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">Cotizador:</span>
                    <span className="font-medium">{quotation.cotizador.nombre}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Información del producto */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Producto</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Marca:</span>
                  <p className="font-medium">{quotation.marca || 'No especificada'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Modelo:</span>
                  <p className="font-medium">{quotation.modelo || 'No especificado'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Procedencia:</span>
                  <p className="font-medium">{quotation.procedencia || 'No especificada'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Tipo:</span>
                  <p className="font-medium">{quotation.tipo_cotizacion || 'Nacional'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información del proveedor */}
          {quotation.supplier && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Building className="w-5 h-5" />
                  <span>Proveedor</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Razón Social:</span>
                    <p className="font-medium">{quotation.supplier.razon_social}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">RUC:</span>
                    <p className="font-medium">{quotation.supplier.ruc}</p>
                  </div>
                  {quotation.supplier.pais && (
                    <div>
                      <span className="text-sm text-gray-600">País:</span>
                      <p className="font-medium">{quotation.supplier.pais}</p>
                    </div>
                  )}
                  {quotation.supplier.tipo_proveedor && (
                    <div>
                      <span className="text-sm text-gray-600">Tipo:</span>
                      <p className="font-medium capitalize">{quotation.supplier.tipo_proveedor}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información comercial */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Información Comercial</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Precio Unitario:</span>
                  <p className="font-medium text-lg">
                    {quotation.moneda} {quotation.precio_unitario?.toLocaleString() || '0'}
                  </p>
                </div>
                {quotation.tipo_cambio && (
                  <div>
                    <span className="text-sm text-gray-600">Tipo de Cambio:</span>
                    <p className="font-medium">{quotation.tipo_cambio}</p>
                  </div>
                )}
                {quotation.tiempo_entrega && (
                  <div>
                    <span className="text-sm text-gray-600">Tiempo de Entrega:</span>
                    <p className="font-medium">{quotation.tiempo_entrega}</p>
                  </div>
                )}
                {quotation.incoterm && (
                  <div>
                    <span className="text-sm text-gray-600">Incoterm:</span>
                    <p className="font-medium">{quotation.incoterm}</p>
                  </div>
                )}
              </div>

              {quotation.condiciones && (
                <div>
                  <span className="text-sm text-gray-600">Condiciones:</span>
                  <p className="font-medium bg-gray-50 p-3 rounded-lg mt-1">
                    {quotation.condiciones}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Accesorios */}
          {accessories && accessories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Accesorios</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Incluido</TableHead>
                        <TableHead>Observaciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accessories.map((accessory: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{accessory.nombre}</TableCell>
                          <TableCell>{accessory.cantidad}</TableCell>
                          <TableCell>
                            {accessory.precio_unitario 
                              ? formatPrice(accessory.precio_unitario, accessory.moneda)
                              : 'No definido'
                            }
                          </TableCell>
                          <TableCell>
                            <Badge variant={accessory.incluido_en_proforma ? "default" : "secondary"}>
                              {accessory.incluido_en_proforma ? 'Sí' : 'No'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
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
              <CardHeader>
                <CardTitle className="text-lg">Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                  {quotation.observaciones}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Archivos adjuntos */}
          {quotation.proforma_url && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Archivos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Proforma</p>
                      <p className="text-sm text-gray-600">Archivo de cotización</p>
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
