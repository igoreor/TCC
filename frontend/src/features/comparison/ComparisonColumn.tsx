import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import { MessageSquare, ShieldCheck } from 'lucide-react'
import { ErrorInline } from '../../components/dark/ErrorInline'
import { Skeleton } from '../../components/dark/Skeleton'

interface ComparisonColumnProps {
  variant: 'rag' | 'generic'
  title: string
  subtitle: string
  isEmpty: boolean
  isPending: boolean
  error?: unknown
  onRetry?: () => void
  children: ReactNode
}

export function ComparisonColumn({
  variant,
  title,
  subtitle,
  isEmpty,
  isPending,
  error,
  onRetry,
  children,
}: ComparisonColumnProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' })
  })

  const Icon = variant === 'rag' ? ShieldCheck : MessageSquare

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <header className="flex items-center gap-3 border-b border-white/5 px-4 py-3">
        <div
          className={
            variant === 'rag' ? 'rounded-lg bg-emerald-950/50 p-1.5 text-emerald-400' : 'rounded-lg bg-zinc-800/50 p-1.5 text-zinc-500'
          }
        >
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold text-text-primary">{title}</h2>
          <p className="text-xs text-text-muted">{subtitle}</p>
        </div>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {isEmpty && !isPending ? (
          <div className="flex h-full items-center justify-center text-center text-sm text-text-muted">
            Faça uma pergunta abaixo para comparar as respostas.
          </div>
        ) : (
          <>
            {children}
            {isPending ? (
              variant === 'rag' ? (
                <div className="w-fit rounded-2xl border border-border bg-surface-2 px-4 py-3">
                  <Skeleton className="h-3 w-40" />
                </div>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg bg-surface-1/60 p-4">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-5/6" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              )
            ) : null}
            {error ? <ErrorInline error={error} onRetry={onRetry} /> : null}
          </>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  )
}
