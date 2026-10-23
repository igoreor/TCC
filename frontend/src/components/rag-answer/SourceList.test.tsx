import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { SourceCitation } from '../../api/types'
import { figureExample } from '../../features/landing/content'
import { parseAnswer } from './parseAnswer'
import { SourceList } from './SourceList'

const [pcdtSource] = figureExample.sources

const whoSource: SourceCitation = {
  ...pcdtSource,
  index: 2,
  chunk_id: 'oms-reacoes-incapacidades-2020:0011',
  document_id: 'oms-reacoes-incapacidades-2020',
  title: '1.3 Type 1 reactions and neuritis',
  page_label: '6–7',
  document: {
    ...pcdtSource.document!,
    title: 'Leprosy/Hansen disease: management of reactions and prevention of disabilities. Technical guidance',
    short_title: 'Manejo das reações e prevenção de incapacidades (OMS)',
    institution: 'Organização Mundial da Saúde (OMS)',
    year: 2020,
    language: 'en',
    jurisdiction: 'internacional',
  },
  verified: false,
}

describe('lista de fontes', () => {
  it('mostra a referência documental, e não o identificador interno do trecho', () => {
    render(<SourceList sources={[pcdtSource]} variant="cited" idPrefix="f" />)

    expect(screen.getByText('PCDT da Hanseníase')).toBeTruthy()
    expect(screen.getByText('Ministério da Saúde (Brasil) · 2022 · diretriz brasileira')).toBeTruthy()
    expect(screen.getByText(/7\.2 Baciloscopia direta/)).toBeTruthy()
    expect(screen.getByText('· p. 44–45')).toBeTruthy()
    expect(screen.queryByText(pcdtSource.chunk_id)).toBeNull()

    const link = screen.getByRole('link', { name: /Abrir no documento/ })
    expect(link.getAttribute('href')).toMatch(/#page=46$/)
  })

  it('exibe o trecho original sob demanda', () => {
    render(<SourceList sources={[pcdtSource]} variant="cited" idPrefix="f" />)

    expect(screen.queryByText(/absolutamente não exclui/)).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Ver trecho' }))
    expect(screen.getByText(/absolutamente não exclui/)).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ocultar trecho' }).getAttribute('aria-expanded')).toBe('true')
  })

  it('avisa sobre documento em inglês e citação não confirmada automaticamente', () => {
    render(<SourceList sources={[whoSource]} variant="cited" idPrefix="f" />)

    expect(screen.getByText('Organização Mundial da Saúde (OMS) · 2020 · recomendação internacional')).toBeTruthy()
    expect(screen.getByText(/Documento em inglês/)).toBeTruthy()
    expect(screen.getByText(/não foi confirmada automaticamente/)).toBeTruthy()
  })
})

describe('texto da resposta', () => {
  it('reconhece subtítulos e tabelas em Markdown, com citações nas células', () => {
    const blocks = parseAnswer(
      'Resposta direta [1].\n\n### Esquemas\n| Peso | Rifampicina |\n|---|---|\n| Acima de 50 kg | 600 mg [1] |',
      [pcdtSource],
    )

    expect(blocks.map((block) => block.kind)).toEqual(['paragraph', 'heading', 'table'])
    const table = blocks[2]
    if (table.kind !== 'table') throw new Error('tabela esperada')
    expect(table.header).toHaveLength(2)
    expect(table.rows[0][1]).toContainEqual({ kind: 'citation', index: 1 })
  })
})
