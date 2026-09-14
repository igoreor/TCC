import { keepPreviousData, useQuery } from '@tanstack/react-query'
import type { ChunkListParams } from '../api/chunks'
import { listChunks } from '../api/chunks'
import { queryKeys } from '../api/queryKeys'

export function useChunks(params: ChunkListParams) {
  return useQuery({
    queryKey: queryKeys.chunks(params),
    queryFn: () => listChunks(params),
    placeholderData: keepPreviousData,
  })
}
