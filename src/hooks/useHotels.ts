import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Hotel, HotelWithContracts } from '@/types/database.types'

export function useHotels() {
  return useQuery({
    queryKey: ['hotels'],
    queryFn: async (): Promise<Hotel[]> => {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data || []
    }
  })
}

export function useHotel(id: string) {
  return useQuery({
    queryKey: ['hotels', id],
    queryFn: async (): Promise<Hotel | null> => {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateHotel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (hotel: Omit<Hotel, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hotels')
        .insert(hotel)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
    }
  })
}

export function useUpdateHotel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Hotel> & { id: string }) => {
      const { data, error } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
      queryClient.invalidateQueries({ queryKey: ['hotels', variables.id] })
    }
  })
}

export function useDeleteHotel() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hotels'] })
    }
  })
}
