import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RoomRate, RoomRateWithDetails } from '@/types/database.types'

export function useRates(inventoryId?: string) {
  return useQuery({
    queryKey: ['rates', inventoryId],
    queryFn: async (): Promise<RoomRateWithDetails[]> => {
      let query = supabase
        .from('room_rates')
        .select(`
          *,
          inventory:tour_room_inventory(
            *,
            tour:tours(*),
            hotel:hotels(*)
          )
        `)
      
      if (inventoryId) {
        query = query.eq('inventory_id', inventoryId)
      }
      
      const { data, error } = await query.order('occupancy_type')
      
      if (error) throw error
      return data || []
    }
  })
}

export function useRate(id: string) {
  return useQuery({
    queryKey: ['rates', id],
    queryFn: async (): Promise<RoomRateWithDetails | null> => {
      const { data, error } = await supabase
        .from('room_rates')
        .select(`
          *,
          inventory:tour_room_inventory(
            *,
            tour:tours(*),
            hotel:hotels(*)
          )
        `)
        .eq('rate_id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateRate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rate: Omit<RoomRate, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('room_rates')
        .insert(rate)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    }
  })
}

export function useUpdateRate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ rate_id, ...updates }: Partial<RoomRate> & { rate_id: string }) => {
      const { data, error } = await supabase
        .from('room_rates')
        .update(updates)
        .eq('rate_id', rate_id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
      queryClient.invalidateQueries({ queryKey: ['rates', variables.rate_id] })
    }
  })
}

export function useDeleteRate() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (rate_id: string) => {
      const { error } = await supabase
        .from('room_rates')
        .delete()
        .eq('rate_id', rate_id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    }
  })
}
