import { useState } from 'react'
import type { FormEvent } from 'react'
import type { UserType } from '../../api/types'
import { Button } from '../../components/ui/Button'
import { Select } from '../../components/ui/Select'
import { TextArea } from '../../components/ui/TextArea'
import { userTypeOptions } from '../../lib/constants'
import styles from './Chat.module.css'

interface ChatComposerProps {
  onSend: (question: string, userType: UserType) => void
  onNewConversation: () => void
  isSending: boolean
}

export function ChatComposer({ onSend, onNewConversation, isSending }: ChatComposerProps) {
  const [question, setQuestion] = useState('')
  const [userType, setUserType] = useState<UserType>('Profissional de saúde')

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!question.trim() || isSending) return
    onSend(question, userType)
    setQuestion('')
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <TextArea
        label="Pergunta"
        value={question}
        onChange={(event) => setQuestion(event.target.value)}
        placeholder="Ex: Baciloscopia negativa exclui hanseníase?"
        rows={3}
      />
      <div className={styles.composerActions}>
        <Select
          label="Perfil do usuário"
          value={userType}
          onChange={(event) => setUserType(event.target.value as UserType)}
          options={userTypeOptions.map((value) => ({ value, label: value }))}
        />
        <div className={styles.composerButtons}>
          <Button type="button" variant="secondary" onClick={onNewConversation} disabled={isSending}>
            Nova conversa
          </Button>
          <Button type="submit" disabled={isSending || !question.trim()}>
            {isSending ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </div>
    </form>
  )
}
