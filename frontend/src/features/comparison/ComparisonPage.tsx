import { useState } from 'react'
import { QuestionComposer } from '../../components/composer/QuestionComposer'
import { CONSULTATION_USER_TYPE } from '../../components/layout/consultation'
import { Button } from '../../components/primitives/Button'
import { metaLabel } from '../../components/primitives/classes'
import { PendingNote } from '../../components/primitives/PendingNote'
import { RagEntryBody } from '../../components/rag-answer/RagEntryBody'
import { toEntries } from '../../lib/conversation'
import { cx } from '../../lib/cx'
import { ComparisonColumn } from './ComparisonColumn'
import { GenericAnswer } from './GenericAnswer'
import { useComparisonSession } from './useComparisonSession'

// Exercitam os comportamentos do sistema: resposta com fontes (ou recusa por evidência
// insuficiente, conforme a configuração), recusa por prescrição e recusa por tema.
const EXAMPLE_QUESTIONS = [
  'Baciloscopia negativa exclui hanseníase?',
  'Qual dose de rifampicina devo prescrever?',
  'Como tratar diabetes tipo 2?',
]

const COLUMNS = {
  rag: {
    id: 'coluna-nexohansen',
    title: 'NexoHansen',
    meta: 'consulta à base · regras de segurança',
    shortMeta: 'com fontes e limites',
  },
  generic: {
    id: 'coluna-generica',
    title: 'Modelo genérico',
    meta: 'simulação local · sem fontes',
    shortMeta: 'simulação, sem fontes',
  },
}

type ColumnKey = keyof typeof COLUMNS

export function ComparisonPage() {
  const { rag, generic, submit, disabled } = useComparisonSession(CONSULTATION_USER_TYPE)
  const [mobileColumn, setMobileColumn] = useState<ColumnKey>('rag')
  const ragEntries = toEntries(rag.messages)
  const genericEntries = toEntries(generic.messages)
  const isEmpty = ragEntries.length === 0 && genericEntries.length === 0
  const latestRag = ragEntries.at(-1)
  const latestGeneric = genericEntries.at(-1)
  const pending: Record<ColumnKey, boolean> = { rag: rag.isPending, generic: generic.isPending }

  function ask(question: string) {
    void submit(question)
  }

  function clear() {
    rag.reset()
    generic.reset()
  }

  return (
    <main id="conteudo" tabIndex={-1} className="fixed inset-x-0 bottom-0 top-16 flex flex-col outline-none">
      <div className="border-b border-rule">
        <div className="mx-auto flex max-w-site items-end justify-between gap-6 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <p className={cx(metaLabel, 'text-accent')}>Comparação acadêmica</p>
            <h1 className="mt-1 font-serif text-subheading font-medium text-ink md:text-heading">
              A mesma pergunta, duas respostas
            </h1>
          </div>
          {!isEmpty ? (
            <Button variant="quiet" size="sm" onClick={clear} disabled={disabled}>
              Limpar
            </Button>
          ) : null}
        </div>
      </div>

      <div role="group" aria-label="Coluna exibida" className="grid grid-cols-2 border-b border-rule md:hidden">
        {(Object.keys(COLUMNS) as ColumnKey[]).map((key) => {
          const selected = mobileColumn === key
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              aria-controls={COLUMNS[key].id}
              onClick={() => setMobileColumn(key)}
              className={cx(
                '-mb-px flex min-w-0 flex-col items-start gap-0.5 border-b-2 px-4 py-2.5 text-left transition-colors duration-150',
                selected ? 'border-ink bg-paper-raised' : 'border-transparent hover:bg-paper-sunken',
              )}
            >
              <span className={cx('font-serif text-ui font-semibold', selected ? 'text-ink' : 'text-ink-soft')}>
                {COLUMNS[key].title}
              </span>
              <span className="w-full truncate font-mono text-micro text-ink-faint">
                {pending[key] ? 'aguardando resposta…' : COLUMNS[key].shortMeta}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex min-h-0 flex-1 flex-col md:flex-row">
        <ComparisonColumn
          id={COLUMNS.rag.id}
          variant="rag"
          title={COLUMNS.rag.title}
          meta={COLUMNS.rag.meta}
          hiddenOnMobile={mobileColumn !== 'rag'}
          emptyNote="Deste lado aparece a resposta do NexoHansen, com os trechos citados, ou a recusa com o motivo."
          scrollSignal={`${ragEntries.length}:${latestRag?.answer ? 'a' : ''}:${rag.isPending ? 'p' : ''}:${rag.error ? 'e' : ''}`}
          entries={ragEntries.map((entry, index) => ({
            key: entry.question.id,
            question: entry.question.content,
            content: (
              <RagEntryBody
                answer={entry.answer}
                isLatest={index === ragEntries.length - 1}
                isPending={rag.isPending}
                error={rag.error}
                onRetry={() => void rag.retry()}
              />
            ),
          }))}
        />
        <ComparisonColumn
          id={COLUMNS.generic.id}
          variant="generic"
          title={COLUMNS.generic.title}
          meta={COLUMNS.generic.meta}
          hiddenOnMobile={mobileColumn !== 'generic'}
          emptyNote="Deste lado aparece uma resposta genérica, simulada no próprio navegador, sem consulta a fontes nem regras de segurança. Serve só para evidenciar a diferença de apresentação."
          scrollSignal={`${genericEntries.length}:${latestGeneric?.answer ? 'a' : ''}:${generic.isPending ? 'p' : ''}`}
          entries={genericEntries.map((entry, index) => ({
            key: entry.question.id,
            question: entry.question.content,
            content: entry.answer ? (
              <GenericAnswer content={entry.answer.content} />
            ) : index === genericEntries.length - 1 && generic.isPending ? (
              <PendingNote label="Gerando resposta simulada" />
            ) : null,
          }))}
        />
      </div>

      <div className="border-t border-rule bg-paper-raised">
        <div className="mx-auto max-w-3xl px-4 pb-3 pt-4 sm:px-6">
          {isEmpty ? (
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className={cx(metaLabel, 'mr-1 text-ink-faint')}>Experimente</span>
              {EXAMPLE_QUESTIONS.map((question) => (
                <button
                  key={question}
                  type="button"
                  disabled={disabled}
                  onClick={() => ask(question)}
                  className="rounded-xs border border-rule px-2.5 py-1 text-left text-small text-ink-soft transition-colors duration-150 hover:border-rule-control hover:text-ink"
                >
                  {question}
                </button>
              ))}
            </div>
          ) : null}
          <QuestionComposer
            id="pergunta-comparacao"
            onSubmit={ask}
            isBusy={disabled}
            placeholder="Escreva uma pergunta para enviar aos dois lados"
            submitLabel="Comparar"
            status={disabled ? 'Aguardando as duas respostas…' : undefined}
          />
        </div>
      </div>
    </main>
  )
}
