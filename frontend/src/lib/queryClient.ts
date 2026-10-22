import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '../api/client'
import { queryKeys } from '../api/queryKeys'

/**
 * Qualquer 401 (sessão expirada ou encerrada em outra aba) devolve a interface ao estado sem login.
 * As chamadas do próprio login marcam `meta.authRequest` para tratar o 401 como credencial inválida.
 */
export function createQueryClient() {
  const queryClient: QueryClient = new QueryClient({
    queryCache: new QueryCache({ onError: (error) => handleUnauthorized(error) }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _onMutateResult, mutation) => {
        if (!mutation.meta?.authRequest) handleUnauthorized(error)
      },
    }),
  })

  function handleUnauthorized(error: unknown) {
    if (error instanceof ApiError && error.status === 401) queryClient.setQueryData(queryKeys.currentUser, null)
  }

  return queryClient
}
