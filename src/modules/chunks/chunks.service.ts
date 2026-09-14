import { SearchFilters } from '../../shared/types';
import { KnowledgeRepository } from '../knowledge/knowledge.repository';

export class ChunksService {
  constructor(private readonly repository: KnowledgeRepository) {}

  async list(filters: SearchFilters, page: number, pageSize: number) {
    const skip = (page - 1) * pageSize;
    const [items, total] = await Promise.all([
      this.repository.findChunks(filters, skip, pageSize),
      this.repository.countChunks(filters)
    ]);

    return {
      items,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    };
  }

  findByChunkId(chunkId: string) {
    return this.repository.findChunkByChunkId(chunkId);
  }
}
