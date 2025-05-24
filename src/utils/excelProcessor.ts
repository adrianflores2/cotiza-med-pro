
import * as XLSX from 'xlsx';

export interface ExcelRow {
  numero_item: number;
  codigo_equipo: string;
  nombre_equipo: string;
  grupo_generico: string;
  cantidad: number;
  requiere_accesorios: boolean;
  observaciones?: string;
  cotizador_sugerido?: string; // Nueva propiedad para asignación automática
}

export const processExcelFile = (file: File): Promise<ExcelRow[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Convertir a JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (jsonData.length < 2) {
          throw new Error('El archivo Excel debe tener al menos una fila de encabezados y una fila de datos');
        }

        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];

        console.log('Excel headers:', headers);
        console.log('Excel rows sample:', rows.slice(0, 3));

        // Mapear columnas (flexibilidad en nombres de columnas)
        const getColumnIndex = (possibleNames: string[]) => {
          return headers.findIndex(header => 
            possibleNames.some(name => 
              header?.toLowerCase().includes(name.toLowerCase())
            )
          );
        };

        const columnMapping = {
          numero_item: getColumnIndex(['item', 'número', 'numero', '#']),
          codigo_equipo: getColumnIndex(['código', 'codigo', 'code', 'cod']),
          nombre_equipo: getColumnIndex(['nombre', 'equipo', 'descripción', 'descripcion', 'equipment']),
          grupo_generico: getColumnIndex(['grupo', 'categoría', 'categoria', 'tipo', 'group']),
          cantidad: getColumnIndex(['cantidad', 'qty', 'quantity', 'cant']),
          requiere_accesorios: getColumnIndex(['accesorios', 'accessories', 'acc']),
          observaciones: getColumnIndex(['observaciones', 'notas', 'comments', 'obs']),
          cotizador_sugerido: getColumnIndex(['cotizador', 'responsable', 'asignado', 'quoter', 'assigned']),
        };

        console.log('Column mapping:', columnMapping);

        const processedRows: ExcelRow[] = [];

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          
          // Saltar filas vacías
          if (!row || row.every(cell => !cell)) continue;

          try {
            const processedRow: ExcelRow = {
              numero_item: columnMapping.numero_item >= 0 ? 
                (Number(row[columnMapping.numero_item]) || i + 1) : i + 1,
              codigo_equipo: columnMapping.codigo_equipo >= 0 ? 
                String(row[columnMapping.codigo_equipo] || '').trim() : `AUTO-${i + 1}`,
              nombre_equipo: columnMapping.nombre_equipo >= 0 ? 
                String(row[columnMapping.nombre_equipo] || '').trim() : 'Equipo sin nombre',
              grupo_generico: columnMapping.grupo_generico >= 0 ? 
                String(row[columnMapping.grupo_generico] || '').trim() : 'General',
              cantidad: columnMapping.cantidad >= 0 ? 
                Math.max(1, Number(row[columnMapping.cantidad]) || 1) : 1,
              requiere_accesorios: columnMapping.requiere_accesorios >= 0 ? 
                Boolean(row[columnMapping.requiere_accesorios]) : false,
              observaciones: columnMapping.observaciones >= 0 ? 
                String(row[columnMapping.observaciones] || '').trim() : undefined,
              cotizador_sugerido: columnMapping.cotizador_sugerido >= 0 ? 
                String(row[columnMapping.cotizador_sugerido] || '').trim() : undefined,
            };

            // Validar que tenga al menos nombre
            if (processedRow.nombre_equipo && processedRow.nombre_equipo !== 'Equipo sin nombre') {
              processedRows.push(processedRow);
            }
          } catch (error) {
            console.warn(`Error processing row ${i + 1}:`, error);
          }
        }

        console.log('Processed rows:', processedRows);

        if (processedRows.length === 0) {
          throw new Error('No se pudieron procesar datos válidos del archivo Excel');
        }

        resolve(processedRows);
      } catch (error) {
        console.error('Error processing Excel file:', error);
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsArrayBuffer(file);
  });
};
