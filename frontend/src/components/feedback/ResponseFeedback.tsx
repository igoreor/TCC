import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Check, X } from 'lucide-react'
import { ApiError } from '../../api/client'
import { sendFeedback } from '../../api/feedback'
import { cx } from '../../lib/cx'
import type { FeedbackState } from '../../lib/feedback'
import { COMMENT_MAX_LENGTH, RATING_MAX, RATING_MIN } from '../../lib/feedback'
import { Button } from '../primitives/Button'
import { IconButton } from '../primitives/IconButton'
import { metaLabel } from '../primitives/classes'

const SCORES = Array.from({ length: RATING_MAX - RATING_MIN + 1 }, (_, index) => RATING_MIN + index)

interface ResponseFeedbackProps {
  messageId: string
  state?: FeedbackState
  onStateChange: (state: FeedbackState | undefined) => void
  className?: string
}

const isDuplicate = (error: unknown) => error instanceof ApiError && error.status === 409

/**
 * Avaliação de uma resposta da IA para a pesquisa: nota de 0 a 10 e comentário opcional.
 * O comentário só aparece depois da nota, para o bloco ocupar pouco espaço sob a resposta.
 */
export function ResponseFeedback({ messageId, state, onStateChange, className }: ResponseFeedbackProps) {
  const id = useId()
  const [score, setScore] = useState<number | null>(null)
  const [comment, setComment] = useState('')
  // Callbacks no próprio useMutation: valem mesmo se a gaveta fechar durante o envio.
  const mutation = useMutation({
    mutationFn: sendFeedback,
    onSuccess: (result) => onStateChange({ status: 'submitted', rating: result.rating }),
    onError: (error) => {
      if (isDuplicate(error)) onStateChange({ status: 'duplicate' })
    },
  })

  if (state?.status === 'submitted' || state?.status === 'duplicate') {
    return (
      <p role="status" className={cx('flex items-center gap-2 text-small text-ink-soft', className)}>
        <Check aria-hidden="true" className="size-4 shrink-0 text-accent" />
        {state.status === 'submitted'
          ? `Avaliação registrada: nota ${state.rating}. Obrigado.`
          : 'Esta resposta já tinha sido avaliada por você.'}
      </p>
    )
  }

  if (state?.status === 'dismissed') {
    return (
      <button
        type="button"
        onClick={() => onStateChange(undefined)}
        className={cx(
          'text-small text-ink-faint underline decoration-rule-strong underline-offset-3 transition-colors hover:text-ink',
          className,
        )}
      >
        Avaliar esta resposta
      </button>
    )
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (score === null || mutation.isPending) return
    mutation.mutate({ messageId, rating: score, comment: comment.trim() || undefined })
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-labelledby={`${id}-titulo`}
      className={cx('border border-rule bg-paper-raised px-4 pb-4 pt-2', className)}
    >
      <div className="flex items-center justify-between gap-3">
        <p id={`${id}-titulo`} className={cx(metaLabel, 'text-ink-faint')}>
          Avalie esta resposta
        </p>
        <IconButton
          aria-label="Dispensar avaliação"
          icon={<X className="size-4" aria-hidden="true" />}
          onClick={() => onStateChange({ status: 'dismissed' })}
          className="-mr-2 h-8 w-8"
        />
      </div>

      <fieldset className="m-0 mt-1 min-w-0 border-0 p-0">
        <legend className="sr-only">
          Nota de {RATING_MIN} a {RATING_MAX}, em que {RATING_MIN} é a pior avaliação e {RATING_MAX} a melhor
        </legend>
        <div className="grid grid-cols-11 gap-1">
          {SCORES.map((value) => (
            <label key={value} className="min-w-0">
              <input
                type="radio"
                name={`${id}-nota`}
                value={value}
                checked={score === value}
                onChange={() => setScore(value)}
                className="peer sr-only"
              />
              <span className="flex h-9 cursor-pointer items-center justify-center rounded-xs border border-rule font-mono text-small text-ink-soft transition-colors duration-150 hover:border-rule-control hover:text-ink peer-checked:border-ink peer-checked:bg-ink peer-checked:text-paper peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent">
                {value}
              </span>
            </label>
          ))}
        </div>
        <p aria-hidden="true" className="mt-1.5 flex justify-between font-mono text-micro text-ink-faint">
          <span>{RATING_MIN} · pior</span>
          <span>{RATING_MAX} · melhor</span>
        </p>
      </fieldset>

      {score !== null ? (
        <div className="mt-4">
          <label htmlFor={`${id}-comentario`} className="text-small text-ink-soft">
            O que estava errado ou incomodou? <span className="text-ink-faint">(opcional)</span>
          </label>
          <textarea
            id={`${id}-comentario`}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            maxLength={COMMENT_MAX_LENGTH}
            rows={2}
            placeholder="Ex.: informação incorreta, fonte inadequada, resposta confusa"
            className="mt-1.5 block w-full resize-y rounded-xs border border-rule-control bg-paper px-3 py-2 text-small text-ink placeholder:text-ink-faint focus:border-ink focus:outline-2 focus:outline-offset-2 focus:outline-accent"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <span className="font-mono text-micro text-ink-faint">
              {comment.length}/{COMMENT_MAX_LENGTH}
            </span>
            <Button type="submit" size="sm" disabled={mutation.isPending}>
              {mutation.isPending ? 'Enviando…' : 'Enviar avaliação'}
            </Button>
          </div>
        </div>
      ) : null}

      {mutation.isError && !isDuplicate(mutation.error) ? (
        <p role="alert" className="mt-3 border-l-2 border-critical bg-critical-soft/60 py-2 pl-3 pr-2 text-small text-ink">
          Não foi possível registrar a avaliação. Tente enviar novamente.
        </p>
      ) : null}
    </form>
  )
}
