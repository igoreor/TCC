import { useQuery } from '@tanstack/react-query'
import { getChunk } from '../api/chunks'
import { queryKeys } from '../api/queryKeys'

export function useChunk(chunkId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.chunk(chunkId ?? ''),
    queryFn: () => getChunk(chunkId as string),
    enabled: Boolean(chunkId),
    retry: false,
  })
}
