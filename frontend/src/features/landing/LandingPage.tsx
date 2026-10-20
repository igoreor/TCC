import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { useConsultation } from '../../components/layout/consultation'
import { ChatWidgetFab } from '../../components/widget/ChatWidgetFab'
import { useInView } from '../../hooks/useInView'
import { scrollBehavior } from '../../lib/motion'
import { ClosingSection } from './sections/ClosingSection'
import { FooterSection } from './sections/FooterSection'
import { HeroSection } from './sections/HeroSection'
import { KnowledgeBaseSection } from './sections/KnowledgeBaseSection'
import { LimitsSection } from './sections/LimitsSection'
import { MethodSection } from './sections/MethodSection'

export function LandingPage() {
  const { isOpen, open } = useConsultation()
  const heroCtaRef = useRef<HTMLButtonElement>(null)
  const closingActionsRef = useRef<HTMLUListElement>(null)
  const heroCtaInView = useInView(heroCtaRef, '-64px 0px 0px 0px')
  const closingActionsInView = useInView(closingActionsRef)
  const { hash, key } = useLocation()

  // Os links de seção (#como-funciona, #limites, #base) também chegam de outras páginas.
  useEffect(() => {
    if (!hash) return
    document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({ behavior: scrollBehavior() })
  }, [hash, key])

  return (
    <>
      <main id="conteudo" tabIndex={-1} className="outline-none">
        <HeroSection ctaRef={heroCtaRef} onOpenConsultation={open} />
        <MethodSection />
        <LimitsSection />
        <KnowledgeBaseSection />
        <ClosingSection actionsRef={closingActionsRef} onOpenConsultation={() => open()} />
      </main>
      <FooterSection />
      <ChatWidgetFab visible={!heroCtaInView && !closingActionsInView && !isOpen} onOpen={() => open()} />
    </>
  )
}
