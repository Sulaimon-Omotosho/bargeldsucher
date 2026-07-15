import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query'

export interface SelectableErrand {
  id: string
  title: string
  amountReceived: number
  totalSpent: number
}

interface ExpenseStreamFilters {
  search: string
  fromAmount: string
  toAmount: string
  timeline: string
}

// Infinite scrolling hook for Selecting Errands
export function useSelectableErrands(search: string, enabled = true) {
  return useInfiniteQuery({
    queryKey: ['selectable-errands', search],
    queryFn: async ({ pageParam }) => {
      const params = new URLSearchParams({
        search,
        limit: '15',
        ...(pageParam ? { cursor: pageParam } : {}),
      })
      const res = await fetch(`/api/errands/selectable?${params.toString()}`)
      if (!res.ok) throw new Error('Failed to load errands')
      return res.json() as Promise<{
        items: SelectableErrand[]
        nextCursor?: string
      }>
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled,
  })
}

// Mutation to create expenses
export function useCreateExpense(errandId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Something went wrong')
      }

      return res.json()
    },
    onSuccess: (_, variables) => {
      const targetId = errandId || variables.errandId
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['errand', targetId] })
      }
      queryClient.invalidateQueries({ queryKey: ['expenses'] })
      queryClient.invalidateQueries({ queryKey: ['selectable-errands'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Infinite Scrolling Expenses
export function useExpenseStream(filters: ExpenseStreamFilters) {
  return useInfiniteQuery({
    queryKey: ['expenses-stream', filters],
    queryFn: async ({ pageParam }) => {
      const queryParams = new URLSearchParams({
        search: filters.search,
        timeline: filters.timeline,
        limit: '30',
        ...(filters.fromAmount ? { from: filters.fromAmount } : {}),
        ...(filters.toAmount ? { to: filters.toAmount } : {}),
        ...(pageParam ? { cursor: pageParam } : {}),
      })

      const res = await fetch(`/api/expenses/stream?${queryParams.toString()}`)
      if (!res.ok) throw new Error('Failed to stream items')
      return res.json()
    },
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  })
}
