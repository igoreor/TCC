import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { StudyConditionResult } from '../../api/study'
import { mockApi, renderWithProviders, respondTo, TEST_USER } from '../../test/helpers'
import { StudyPage } from './StudyPage'

const SERVICE = {
  experiment_id: 'demo-live-v1',
  dry_run: false,
  corpus_dir: 'research/corpus/hanseniase-v2',
  corpus_snapshot_sha256: '4c88c18d',
  k: 5,
  arms: [
    { arm: 'openai', provider: 'codex_cli', model: 'gpt-6.1-sol' },
    { arm: 'anthropic', provider: 'claude_cli', model: 'claude-sonnet-5-5' },
  ],
  conditions: [
    { code: 'D', label: 'Sem RAG' },
    { code: 'R0', label: 'RAG' },
    { code: 'R1', label: 'RAG + reescrita' },
  ],
}

function result(overrides: Partial<StudyConditionResult>): StudyConditionResult {
  return {
    condition: 'R0',
    label: 'RAG',
    provider: 'claude_cli',
    model: 'claude-sonnet-5-5',
    returned_model: 'claude-sonnet-5-5',
    status: 'success',
    error: null,
    answer: 'Resposta com **RAG** [chunk:p51-c0001; chunk:fora-do-top5].',
    retrieval_query: 'Quem faz o qPCR?',
    expansion_status: 'not_applicable',
    latency_ms: 12000,
    output_tokens: 300,
    sources: [
      {
        rank: 1,
        chunk_id: 'p51-c0001',
        document_id: 'BR-MS-SCTIE-PORTARIA-51-2026',
        score: 0.71234,
        section: 'Portaria 51',
        page_start: 1,
        page_end: 1,
        excerpt: 'Incorpora o teste de qPCR.',
      },
    ],
    ...overrides,
  }
}

const COMPARE = {
  question_id: 'live-1',
  question: 'Quem faz o qPCR?',
  arm: 'anthropic',
  provider: 'claude_cli',
  model: 'claude-sonnet-5-5',
  dry_run: false,
  log: 'live-20261024T000000Z.jsonl',
  results: [
    result({ condition: 'D', label: 'Sem RAG', retrieval_query: null, sources: [], answer: 'Resposta sem RAG.' }),
    result({}),
    result({
      condition: 'R1',
      label: 'RAG + reescrita',
      retrieval_query: 'indicação do qPCR em casos suspeitos de hanseníase',
      expansion_status: 'ok',
    }),
  ],
}

describe('estudo de expansão semântica', () => {
  it('explica quando o serviço local não está disponível', async () => {
    mockApi(respondTo('GET', '/api/study/status', { status: 200, body: { available: false, reason: 'Serviço do estudo não configurado nesta instância.' } }))
    renderWithProviders(<StudyPage />, { user: TEST_USER })

    expect(await screen.findByText('Serviço do estudo indisponível')).toBeTruthy()
    expect(screen.queryByRole('tab')).toBeNull()
  })

  it('mostra as respostas registradas por lote, agrupadas por modelo', async () => {
    mockApi(
      respondTo('GET', '/api/study/status', { status: 200, body: { available: true, service: SERVICE } }),
      respondTo('GET', '/api/study/results', {
        status: 200,
        body: {
          batches: [
            {
              id: 'e2-cli-smoke-claude/20261023T015057Z',
              experiment_id: 'e2-cli-smoke-claude',
              batch_id: '20261023T015057Z',
              label: 'Teste funcional: Claude',
              note: 'sem valor analítico',
              status: 'completed',
              dry_run: false,
              corpus_dir: 'research/corpus/pcdt2022-v1',
              conditions: ['D', 'R0', 'R1'],
              models: { anthropic: 'claude-sonnet-5-5' },
              n_questions: 1,
              n_records: 3,
            },
          ],
        },
      }),
      respondTo('GET', '/api/study/results/e2-cli-smoke-claude/20261023T015057Z', {
        status: 200,
        body: {
          batch: {},
          questions: [{ question_id: 'smoke-001', question: 'Quem faz o qPCR?', results: COMPARE.results }],
        },
      }),
    )
    renderWithProviders(<StudyPage />, { user: TEST_USER })

    expect(await screen.findByRole('heading', { name: 'claude-sonnet-5-5 (Claude Code)' })).toBeTruthy()
    expect(screen.getByText(/sem valor analítico/)).toBeTruthy()
    const expanded = screen.getByRole('article', { name: 'RAG + reescrita' })
    expect(within(expanded).getByText('indicação do qPCR em casos suspeitos de hanseníase')).toBeTruthy()
    expect(within(expanded).getByText('expansão aplicada')).toBeTruthy()
    expect(within(expanded).getByText('Portaria 51/2026')).toBeTruthy()
    const direct = screen.getByRole('article', { name: 'Sem RAG' })
    expect(within(direct).getByText(/Sem recuperação/)).toBeTruthy()
  })

  it('envia a pergunta ao vivo com o modelo e as condições escolhidas', async () => {
    const api = mockApi(
      respondTo('GET', '/api/study/status', { status: 200, body: { available: true, service: SERVICE } }),
      respondTo('GET', '/api/study/results', { status: 200, body: { batches: [] } }),
      respondTo('POST', '/api/study/compare', { status: 200, body: COMPARE }),
    )
    renderWithProviders(<StudyPage />, { user: TEST_USER })

    fireEvent.click(await screen.findByRole('tab', { name: 'Comparação ao vivo' }))
    // três condições: D e R0 fazem uma chamada cada; a expansão faz duas
    expect(screen.getByText(/4 chamadas ao modelo/)).toBeTruthy()
    fireEvent.change(screen.getByRole('textbox', { name: 'Pergunta' }), { target: { value: 'Quem faz o qPCR?' } })
    fireEvent.change(screen.getByRole('combobox', { name: 'Modelo' }), { target: { value: 'anthropic' } })
    fireEvent.click(screen.getByRole('checkbox', { name: 'RAG + reescrita' }))
    expect(screen.getByText(/2 chamadas ao modelo/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Comparar' }))

    expect(await screen.findByText('Resposta sem RAG.')).toBeTruthy()
    expect(api.calls.find((call) => call.method === 'POST')?.body).toEqual({
      question: 'Quem faz o qPCR?',
      arm: 'anthropic',
      conditions: ['D', 'R0'],
    })
    expect(screen.getByText(/live-20261024T000000Z.jsonl/)).toBeTruthy()
    const rag = screen.getByRole('article', { name: 'RAG' })
    expect(within(rag).getByText('RAG', { selector: 'strong' })).toBeTruthy()
    // citação numerada pela posição do trecho; trecho não recuperado aparece destacado
    expect(within(rag).getByText('[1]').getAttribute('title')).toBe('p51-c0001')
    expect(within(rag).getByText('[fora do contexto]')).toBeTruthy()
  })
})
