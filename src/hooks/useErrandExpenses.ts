import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateExpenseInput } from '@/types/types'

interface CreateExpenseWithExplanationPayload extends CreateExpenseInput {
  overspendExplanation?: string
}

export function useErrandExpenses(errandId: string) {
  const queryClient = useQueryClient()

  const addExpenseMutation = useMutation({
    mutationFn: async (data: CreateExpenseWithExplanationPayload) => {
      if (!errandId || errandId === 'undefined') {
        throw new Error('Errand ID is required to log expenses')
      }

      const res = await fetch(`/api/errands/${errandId}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const payload = await res.json()
        throw new Error(payload.error || 'Failed to submit expense entry')
      }

      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['errand', errandId],
      })
    },
  })

  return {
    addExpense: addExpenseMutation.mutateAsync,
    isAdding: addExpenseMutation.isPending,
    error: addExpenseMutation.error,
  }
}
