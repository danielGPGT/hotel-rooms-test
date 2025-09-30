import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Tour } from '@/types/database.types'

export function useTours() {
  return useQuery({
    queryKey: ['tours'],
    queryFn: async (): Promise<Tour[]> => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .order('start_date', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })
}

export function useTour(id: string) {
  return useQuery({
    queryKey: ['tours', id],
    queryFn: async (): Promise<Tour | null> => {
      const { data, error } = await supabase
        .from('tours')
        .select('*')
        .eq('tour_id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateTour() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tour: Omit<Tour, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('tours')
        .insert(tour)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
    }
  })
}

export function useUpdateTour() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ tour_id, ...updates }: Partial<Tour> & { tour_id: string }) => {
      const { data, error } = await supabase
        .from('tours')
        .update(updates)
        .eq('tour_id', tour_id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
      queryClient.invalidateQueries({ queryKey: ['tours', variables.tour_id] })
    }
  })
}

export function useDeleteTour() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (tour_id: string) => {
      const { error } = await supabase
        .from('tours')
        .delete()
        .eq('tour_id', tour_id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] })
    }
  })
}
