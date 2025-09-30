import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { TourRoomInventory, TourRoomInventoryWithDetails } from '@/types/database.types'

export function useInventory(tourId?: string) {
  return useQuery({
    queryKey: ['inventory', tourId],
    queryFn: async (): Promise<TourRoomInventoryWithDetails[]> => {
      let query = supabase
        .from('tour_room_inventory')
        .select(`
          *,
          tour:tours(*),
          hotel:hotels(*),
          rates:room_rates(*)
        `)
      
      if (tourId) {
        query = query.eq('tour_id', tourId)
      }
      
      const { data, error } = await query.order('check_in_date')
      
      if (error) throw error
      return data || []
    }
  })
}

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id],
    queryFn: async (): Promise<TourRoomInventoryWithDetails | null> => {
      const { data, error } = await supabase
        .from('tour_room_inventory')
        .select(`
          *,
          tour:tours(*),
          hotel:hotels(*),
          rates:room_rates(*)
        `)
        .eq('inventory_id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateInventory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (inventory: Omit<TourRoomInventory, 'created_at' | 'updated_at' | 'number_of_nights' | 'quantity_available'>) => {
      const { data, error } = await supabase
        .from('tour_room_inventory')
        .insert(inventory)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    }
  })
}

export function useUpdateInventory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ inventory_id, ...updates }: Partial<TourRoomInventory> & { inventory_id: string }) => {
      const { data, error } = await supabase
        .from('tour_room_inventory')
        .update(updates)
        .eq('inventory_id', inventory_id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
      queryClient.invalidateQueries({ queryKey: ['inventory', variables.inventory_id] })
    }
  })
}

export function useDeleteInventory() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (inventory_id: string) => {
      const { error } = await supabase
        .from('tour_room_inventory')
        .delete()
        .eq('inventory_id', inventory_id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] })
    }
  })
}
