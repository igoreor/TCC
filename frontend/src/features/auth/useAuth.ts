import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, login, logout } from '../../api/auth'
import { queryKeys } from '../../api/queryKeys'
import { clearStoredChatSessions } from '../../lib/chatStorage'

/** `undefined` enquanto verifica, `null` sem sessão, ou o usuário autenticado. */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    retry: false,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: login,
    meta: { authRequest: true },
    onSuccess: (user) => queryClient.setQueryData(queryKeys.currentUser, user),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  return useMutation({
    mutationFn: logout,
    meta: { authRequest: true },
    // Mesmo se a API não responder, nada do usuário anterior fica neste navegador.
    onSettled: () => {
      clearStoredChatSessions()
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== queryKeys.currentUser[0] })
      queryClient.setQueryData(queryKeys.currentUser, null)
      navigate('/login', { replace: true })
    },
  })
}
