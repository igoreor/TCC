import { Link } from 'react-router-dom'
import { buttonClasses } from '../../../components/dark/buttonClasses'
import { heroContent } from '../content'

interface HeroSectionProps {
  onOpenChat: () => void
}

export function HeroSection({ onOpenChat }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-24 md:pt-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(45,212,191,0.14),transparent)]"
      />
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 text-center motion-safe:animate-fade-in-up">
        <span className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-accent">
          {heroContent.eyebrow}
        </span>
        <h1 className="text-balance bg-gradient-to-r from-white to-zinc-400 bg-clip-text font-display text-4xl font-bold leading-tight text-transparent md:text-5xl">
          {heroContent.title}
        </h1>
        <p className="max-w-xl text-balance text-sm text-text-secondary md:text-base">{heroContent.subtitle}</p>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <button type="button" className={buttonClasses('primary')} onClick={onOpenChat}>
            {heroContent.primaryCta}
          </button>
          <Link to="/comparacao" className={buttonClasses('secondary', 'no-underline')}>
            {heroContent.secondaryCta}
          </Link>
        </div>
      </div>
    </section>
  )
}
