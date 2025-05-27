
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useMasterEquipment } from './useMasterEquipment';
import { useAssignmentRules } from './useAssignmentRules';
import { useUsers } from './useUsers';
import { useImprovedEquipmentMatching } from './useImprovedEquipmentMatching';
import type { MasterEquipment } from '@/types/database';

export const useEquipmentMatching = () => {
  const { equipment } = useMasterEquipment();
  const { findQuoterByRules } = useAssignmentRules();
  const { users } = useUsers();
  const queryClient = useQueryClient();
  const { findOrCreateEquipmentWithValidation } = useImprovedEquipmentMatching();

  const createEquipmentMutation = useMutation({
    mutationFn: async (equipmentData: {
      codigo: string;
      nombre_equipo: string;
      grupo_generico: string;
      cotizador_predeterminado_id?: string;
    }) => {
      const { data, error } = await supabase
        .from('master_equipment')
        .insert(equipmentData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master-equipment'] });
    },
  });

  const findOrCreateEquipment = async (
    codigo: string,
    nombre: string,
    grupo: string = 'General',
    cotizadorSugerido?: string
  ): Promise<MasterEquipment> => {
    console.log('Finding or creating equipment with improved matching:', { codigo, nombre, grupo, cotizadorSugerido });
    
    try {
      // Use the improved matching system
      const result = await findOrCreateEquipmentWithValidation(codigo, nombre, grupo, cotizadorSugerido);
      
      // Log validation results for monitoring
      if (result.validation.needsReview) {
        console.warn('Equipment created/found but needs review:', {
          equipment: result.equipment.codigo,
          issues: result.validation.issues,
          suggestions: result.validation.suggestions,
          wasCreated: result.wasCreated
        });
      }
      
      return result.equipment;
    } catch (error) {
      console.error('Error in improved equipment matching, falling back to legacy method:', error);
      
      // Fallback to legacy method if improved matching fails
      return findOrCreateEquipmentLegacy(codigo, nombre, grupo, cotizadorSugerido);
    }
  };

  // Legacy method as fallback
  const findOrCreateEquipmentLegacy = async (
    codigo: string,
    nombre: string,
    grupo: string = 'General',
    cotizadorSugerido?: string
  ): Promise<MasterEquipment> => {
    console.log('Using legacy equipment matching for:', { codigo, nombre, grupo, cotizadorSugerido });
    
    // Buscar por código exacto primero
    let existingEquipment = equipment.find(eq => 
      eq.codigo.toLowerCase() === codigo.toLowerCase()
    );
    
    // Si no encuentra por código, buscar por nombre similar
    if (!existingEquipment) {
      existingEquipment = equipment.find(eq => {
        const nombreSimilar = eq.nombre_equipo.toLowerCase().includes(nombre.toLowerCase()) ||
                             nombre.toLowerCase().includes(eq.nombre_equipo.toLowerCase());
        const grupoSimilar = eq.grupo_generico.toLowerCase() === grupo.toLowerCase();
        return nombreSimilar && grupoSimilar;
      });
    }

    if (existingEquipment) {
      console.log('Found existing equipment:', existingEquipment);
      
      // Si existe pero no tiene cotizador asignado, intentar asignar uno
      if (!existingEquipment.cotizador_predeterminado_id) {
        const cotizadorId = determineCotizador(codigo, nombre, grupo, cotizadorSugerido);
        if (cotizadorId) {
          console.log('Updating existing equipment with cotizador:', cotizadorId);
          const { data: updatedEquipment, error } = await supabase
            .from('master_equipment')
            .update({ cotizador_predeterminado_id: cotizadorId })
            .eq('id', existingEquipment.id)
            .select()
            .single();
          
          if (!error && updatedEquipment) {
            queryClient.invalidateQueries({ queryKey: ['master-equipment'] });
            return updatedEquipment;
          }
        }
      }
      
      return existingEquipment;
    }

    // Crear nuevo equipo con cotizador asignado
    const cotizadorId = determineCotizador(codigo, nombre, grupo, cotizadorSugerido);
    
    console.log('Creating new equipment with cotizador:', cotizadorId);
    return new Promise((resolve, reject) => {
      createEquipmentMutation.mutate(
        {
          codigo: codigo || `AUTO-${Date.now()}`,
          nombre_equipo: nombre,
          grupo_generico: grupo,
          cotizador_predeterminado_id: cotizadorId,
        },
        {
          onSuccess: (data) => {
            console.log('Equipment created:', data);
            resolve(data);
          },
          onError: (error) => {
            console.error('Error creating equipment:', error);
            reject(error);
          },
        }
      );
    });
  };

  const determineCotizador = (
    codigo: string, 
    nombre: string, 
    grupo: string, 
    cotizadorSugerido?: string
  ): string | undefined => {
    // 1. Si viene cotizador sugerido del Excel, buscar por nombre o email
    if (cotizadorSugerido && cotizadorSugerido.trim()) {
      const cotizadorFound = users.find(user => 
        user.roles?.includes('cotizador') && (
          user.nombre.toLowerCase().includes(cotizadorSugerido.toLowerCase()) ||
          user.email.toLowerCase().includes(cotizadorSugerido.toLowerCase())
        )
      );
      if (cotizadorFound) {
        console.log('Found cotizador from Excel suggestion:', cotizadorFound.nombre);
        return cotizadorFound.id;
      }
    }

    // 2. Aplicar reglas de asignación automática
    const ruleBasedCotizador = findQuoterByRules(codigo, nombre, grupo);
    if (ruleBasedCotizador) {
      console.log('Found cotizador from rules:', ruleBasedCotizador);
      return ruleBasedCotizador;
    }

    // 3. No se encontró asignación automática
    console.log('No automatic cotizador assignment found');
    return undefined;
  };

  return {
    findOrCreateEquipment,
    isCreating: createEquipmentMutation.isPending,
  };
};
