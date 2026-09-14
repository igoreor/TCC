import { useQuery } from '@tanstack/react-query'
import { listEvaluationQuestions } from '../api/evaluation'
import { queryKeys } from '../api/queryKeys'

export function useEvaluationQuestions() {
  return useQuery({
    queryKey: queryKeys.evaluationQuestions,
    queryFn: listEvaluationQuestions,
  })
}
