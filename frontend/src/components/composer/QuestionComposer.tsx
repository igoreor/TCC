import { useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactNode, Ref } from 'react'
import { Button } from '../primitives/Button'

interface QuestionComposerProps {
  id: string
  onSubmit: (question: string) => void
  /** Bloqueia o envio (requisição em andamento) sem impedir que a próxima pergunta seja escrita. */
  isBusy?: boolean
  placeholder: string
  submitLabel: string
  status?: ReactNode
  textareaRef?: Ref<HTMLTextAreaElement>
  className?: string
}

export function QuestionComposer({
  id,
  onSubmit,
  isBusy = false,
  placeholder,
  submitLabel,
  status,
  textareaRef,
  className,
}: QuestionComposerProps) {
  const [question, setQuestion] = useState('')
  const canSubmit = question.trim().length > 0 && !isBusy

  function submit() {
    if (!canSubmit) return
    onSubmit(question.trim())
    setQuestion('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    submit()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      submit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <label htmlFor={id} className="sr-only">
        Pergunta
      </label>
      <div className="flex items-end gap-2 rounded-xs border border-rule-control bg-paper-raised p-1.5 transition-colors duration-150 focus-within:border-ink focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
        <textarea
          id={id}
          ref={textareaRef}
          rows={1}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="max-h-40 min-h-11 w-full resize-none border-0 bg-transparent px-2.5 py-2.5 text-ui text-ink placeholder:text-ink-faint focus:outline-none [field-sizing:content]"
        />
        <Button type="submit" disabled={!canSubmit}>
          {submitLabel}
        </Button>
      </div>
      <p className="mt-2 font-mono text-micro text-ink-faint">{status ?? 'Enter envia · Shift + Enter quebra a linha'}</p>
    </form>
  )
}
