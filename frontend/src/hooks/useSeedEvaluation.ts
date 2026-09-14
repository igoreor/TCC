import { useMutation, useQueryClient } from '@tanstack/react-query'
import { seedEvaluation } from '../api/evaluation'
import { queryKeys } from '../api/queryKeys'

export function useSeedEvaluation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: seedEvaluation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluationQuestions })
    },
  })
}
