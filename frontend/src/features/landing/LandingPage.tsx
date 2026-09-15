import { useState } from 'react'
import { Activity, Info, Pill, Stethoscope } from 'lucide-react'
import { ChatWidget } from '../../components/widget/ChatWidget'
import { diagnosisContent, symptomsContent, treatmentContent, whatIsContent } from './content'
import { ContentSection } from './sections/ContentSection'
import { FooterSection } from './sections/FooterSection'
import { HeroSection } from './sections/HeroSection'
import { TrustSection } from './sections/TrustSection'

export function LandingPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)

  return (
    <div className="font-sans">
      <main className="pt-16">
        <HeroSection onOpenChat={() => setIsChatOpen(true)} />
        <ContentSection
          id="o-que-e"
          title={whatIsContent.title}
          paragraphs={whatIsContent.paragraphs}
          icon={<Info className="h-6 w-6" aria-hidden="true" />}
        />
        <ContentSection
          id="sintomas"
          title={symptomsContent.title}
          paragraphs={symptomsContent.paragraphs}
          icon={<Activity className="h-6 w-6" aria-hidden="true" />}
          align="right"
        />
        <ContentSection
          id="diagnostico"
          title={diagnosisContent.title}
          paragraphs={diagnosisContent.paragraphs}
          icon={<Stethoscope className="h-6 w-6" aria-hidden="true" />}
        />
        <ContentSection
          id="tratamento"
          title={treatmentContent.title}
          paragraphs={treatmentContent.paragraphs}
          icon={<Pill className="h-6 w-6" aria-hidden="true" />}
          align="right"
        />
        <TrustSection />
      </main>
      <FooterSection />
      <ChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </div>
  )
}
