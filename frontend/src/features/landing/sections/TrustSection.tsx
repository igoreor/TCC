import { BookOpen, ShieldCheck, TriangleAlert, UserCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { trustPillars } from '../content'

const icons: Record<string, LucideIcon> = { ShieldCheck, TriangleAlert, UserCheck, BookOpen }

export function TrustSection() {
  return (
    <section className="border-y border-border bg-surface-1/60 px-6 py-16 md:py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-center font-display text-2xl font-semibold text-text-primary">
          Por que este assistente é diferente
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {trustPillars.map((pillar) => {
            const Icon = icons[pillar.icon]
            return (
              <div
                key={pillar.title}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-5 motion-safe:animate-fade-in-up"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-display text-sm font-semibold text-text-primary">{pillar.title}</h3>
                <p className="text-xs leading-relaxed text-text-secondary">{pillar.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
