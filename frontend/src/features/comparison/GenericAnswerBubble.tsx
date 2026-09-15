interface GenericAnswerBubbleProps {
  content: string
}

export function GenericAnswerBubble({ content }: GenericAnswerBubbleProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-surface-1/60 p-4">
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{content}</p>
      <p className="text-xs italic text-text-muted">Resposta genérica simulada, sem consulta à base de conhecimento.</p>
    </div>
  )
}
