import { footerContent } from '../content'

export function FooterSection() {
  return (
    <footer className="border-t border-border px-6 py-10">
      <div className="mx-auto max-w-5xl text-center text-xs text-text-muted">
        <p>{footerContent.note}</p>
      </div>
    </footer>
  )
}
