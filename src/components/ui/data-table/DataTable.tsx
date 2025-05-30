
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { LoadingState } from "../states/LoadingState";
import { EmptyState } from "../states/EmptyState";

export interface Column<T> {
  key: string;
  header: string;
  accessor?: keyof T | ((item: T) => React.ReactNode);
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyDescription?: string;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    column: string;
    direction: 'asc' | 'desc';
    onSort: (column: string) => void;
  };
  rowKey: keyof T | ((item: T) => string);
  onRowClick?: (item: T) => void;
  selectedRows?: Set<string>;
  onRowSelect?: (itemKey: string, selected: boolean) => void;
  className?: string;
}

export function DataTable<T>({
  data,
  columns,
  isLoading = false,
  emptyMessage = "No hay datos disponibles",
  emptyDescription = "No se encontraron elementos que mostrar",
  pagination,
  sorting,
  rowKey,
  onRowClick,
  selectedRows,
  onRowSelect,
  className = ""
}: DataTableProps<T>) {
  const getRowKey = React.useCallback((item: T): string => {
    if (typeof rowKey === 'function') {
      return rowKey(item);
    }
    return String(item[rowKey]);
  }, [rowKey]);

  const handleSort = React.useCallback((column: string) => {
    if (sorting?.onSort) {
      sorting.onSort(column);
    }
  }, [sorting]);

  const renderCell = React.useCallback((item: T, column: Column<T>) => {
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(item);
      }
      return String(item[column.accessor]);
    }
    return '';
  }, []);

  if (isLoading) {
    return <LoadingState message="Cargando datos..." />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} description={emptyDescription} />;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              {selectedRows && onRowSelect && (
                <TableHead className="w-12">
                  <input
                    type="checkbox"
                    className="rounded"
                    onChange={(e) => {
                      data.forEach(item => {
                        const key = getRowKey(item);
                        onRowSelect(key, e.target.checked);
                      });
                    }}
                    checked={data.length > 0 && data.every(item => selectedRows.has(getRowKey(item)))}
                    indeterminate={data.some(item => selectedRows.has(getRowKey(item))) && !data.every(item => selectedRows.has(getRowKey(item)))}
                  />
                </TableHead>
              )}
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className={column.sortable ? "cursor-pointer hover:bg-gray-50" : ""}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.header}</span>
                    {sorting && sorting.column === column.key && (
                      <span className="text-xs">
                        {sorting.direction === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => {
              const key = getRowKey(item);
              const isSelected = selectedRows?.has(key) || false;
              
              return (
                <TableRow
                  key={key}
                  className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} ${
                    isSelected ? 'bg-blue-50' : ''
                  }`}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectedRows && onRowSelect && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        className="rounded"
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          onRowSelect(key, e.target.checked);
                        }}
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td key={column.key} className="py-3 px-4">
                      {renderCell(item, column)}
                    </td>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Mostrando {(pagination.page - 1) * pagination.pageSize + 1} a{' '}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} de{' '}
            {pagination.total} elementos
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>
            <span className="text-sm">
              Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
