import { useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { Send } from 'lucide-react'
import { IconButton } from '../../components/dark/IconButton'
import { TextArea } from '../../components/dark/TextArea'

interface SharedComposerProps {
  onSubmit: (question: string) => void
  disabled: boolean
}

export function SharedComposer({ onSubmit, disabled }: SharedComposerProps) {
  const [question, setQuestion] = useState('')

  function submit() {
    if (!question.trim() || disabled) return
    onSubmit(question)
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
    <form
      onSubmit={handleSubmit}
      className="absolute bottom-6 left-1/2 w-[min(92%,640px)] -translate-x-1/2 rounded-2xl border border-white/10 bg-zinc-900/80 px-4 py-3 shadow-[0_8px_40px_-8px_rgba(0,0,0,0.7)] backdrop-blur-xl"
    >
      <div className="flex items-end gap-2">
        <TextArea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite uma pergunta para comparar as duas respostas..."
          rows={1}
          disabled={disabled}
          className="max-h-32 min-h-[44px] border-white/10 bg-white/5"
        />
        <IconButton
          type="submit"
          icon={<Send className="h-4 w-4" aria-hidden="true" />}
          aria-label="Enviar pergunta"
          disabled={disabled || !question.trim()}
          className="h-11 w-11 shrink-0 bg-accent text-accent-fg hover:bg-accent-hover disabled:opacity-40"
        />
      </div>
      {disabled ? <p className="mt-2 text-center text-xs text-text-muted">Aguardando as duas respostas…</p> : null}
    </form>
  )
}
