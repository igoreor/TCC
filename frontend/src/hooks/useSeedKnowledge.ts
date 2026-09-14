import { useMutation, useQueryClient } from '@tanstack/react-query'
import { seedKnowledgeBase } from '../api/knowledge'
import { queryKeys } from '../api/queryKeys'

export function useSeedKnowledge() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: seedKnowledgeBase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.documents })
      queryClient.invalidateQueries({ queryKey: ['chunks'] })
    },
  })
}
