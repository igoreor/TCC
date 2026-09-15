import { useCallback, useState } from 'react'
import { useRagConversation } from '../../hooks/useRagConversation'
import type { UserType } from '../../api/types'
import { useGenericConversation } from './useGenericConversation'

export function useComparisonSession(userType: UserType = 'Profissional de saúde') {
  const rag = useRagConversation()
  const generic = useGenericConversation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = useCallback(
    async (question: string) => {
      const trimmed = question.trim()
      if (!trimmed || isSubmitting) return
      setIsSubmitting(true)
      await Promise.allSettled([rag.send(trimmed, userType), generic.send(trimmed)])
      setIsSubmitting(false)
    },
    [rag, generic, userType, isSubmitting],
  )

  return { rag, generic, submit, disabled: isSubmitting || rag.isPending || generic.isPending }
}
