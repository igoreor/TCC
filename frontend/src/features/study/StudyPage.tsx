import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getStudyStatus, studyKeys } from '../../api/study'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorState } from '../../components/ui/ErrorState'
import { Spinner } from '../../components/ui/Spinner'
import { StudyLive } from './StudyLive'
import { StudyResults } from './StudyResults'
import styles from './Study.module.css'

type Tab = 'results' | 'live'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'results', label: 'Resultados do experimento' },
  { id: 'live', label: 'Comparação ao vivo' },
]

/**
 * Estudo de expansão semântica de consultas (TCC de Nathan Dalbert). As respostas vêm do harness
 * do experimento (`software/rag-study`), com corpus, índice e modelos próprios; não passam pelo
 * pipeline, pelo banco nem pela avaliação de 0 a 10 do NexoHansen.
 */
export function StudyPage() {
  const [tab, setTab] = useState<Tab>('results')
  const status = useQuery({ queryKey: studyKeys.status, queryFn: getStudyStatus })

  return (
    <div className={styles.page}>
      <div>
        <h2>Expansão semântica de consultas</h2>
        <p className={styles.intro}>
          Compara a resposta sem RAG, com RAG e com RAG após reescrever a pergunta, gerar palavras-chave ou gerar um
          pseudodocumento. As respostas vêm do harness do experimento (corpus de documentos oficiais, BGE-M3, Claude e
          GPT pela assinatura), não do pipeline do NexoHansen, e não entram na avaliação das respostas.
        </p>
      </div>

      {status.isPending ? <Spinner label="Conectando ao serviço do estudo..." /> : null}
      {status.isError ? <ErrorState error={status.error} /> : null}
      {status.data && !status.data.available ? (
        <EmptyState
          title="Serviço do estudo indisponível"
          description={`${status.data.reason} Ele só roda na instância local: inicie o rag-study serve e defina STUDY_SERVICE_URL no backend.`}
        />
      ) : null}

      {status.data?.available ? (
        <>
          <div className={styles.tabs} role="tablist">
            {TABS.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={tab === item.id}
                className={tab === item.id ? styles.tabActive : styles.tab}
                onClick={() => setTab(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {tab === 'results' ? <StudyResults /> : <StudyLive service={status.data.service} />}
        </>
      ) : null}
    </div>
  )
}
