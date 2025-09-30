import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { HotelContract, HotelWithContracts } from '@/types/database.types'

export function useContracts() {
  return useQuery({
    queryKey: ['contracts'],
    queryFn: async (): Promise<HotelContract[]> => {
      const { data, error } = await supabase
        .from('hotel_contracts')
        .select(`
          *,
          hotel:hotels(name, city, country)
        `)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data || []
    }
  })
}

export function useContract(id: string) {
  return useQuery({
    queryKey: ['contracts', id],
    queryFn: async (): Promise<HotelContract | null> => {
      const { data, error } = await supabase
        .from('hotel_contracts')
        .select(`
          *,
          hotel:hotels(*)
        `)
        .eq('contract_id', id)
        .single()
      
      if (error) throw error
      return data
    },
    enabled: !!id
  })
}

export function useCreateContract() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contract: Omit<HotelContract, 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('hotel_contracts')
        .insert(contract)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    }
  })
}

export function useUpdateContract() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ contract_id, ...updates }: Partial<HotelContract> & { contract_id: string }) => {
      const { data, error } = await supabase
        .from('hotel_contracts')
        .update(updates)
        .eq('contract_id', contract_id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.contract_id] })
    }
  })
}

export function useDeleteContract() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (contract_id: string) => {
      const { error } = await supabase
        .from('hotel_contracts')
        .delete()
        .eq('contract_id', contract_id)
      
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    }
  })
}
