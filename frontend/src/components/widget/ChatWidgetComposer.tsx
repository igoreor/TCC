import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { IconButton } from '../dark/IconButton'
import { TextArea } from '../dark/TextArea'

interface ChatWidgetComposerProps {
  onSend: (question: string) => void
  isSending: boolean
}

export function ChatWidgetComposer({ onSend, isSending }: ChatWidgetComposerProps) {
  const [question, setQuestion] = useState('')

  function submit() {
    if (!question.trim() || isSending) return
    onSend(question)
    setQuestion('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-white/10 p-3">
      <div className="flex items-end gap-2">
        <TextArea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua pergunta..."
          rows={1}
          className="max-h-32 min-h-[44px] border-white/10 bg-white/5"
        />
        <IconButton
          type="submit"
          icon={<Send className="h-4 w-4" aria-hidden="true" />}
          aria-label="Enviar pergunta"
          disabled={isSending || !question.trim()}
          className="h-11 w-11 shrink-0 bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-40"
        />
      </div>
    </form>
  )
}
