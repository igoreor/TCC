import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { sendFeedback } from '../../api/feedback'
import { Button } from '../../components/ui/Button'
import { ErrorState } from '../../components/ui/ErrorState'
import { TextArea } from '../../components/ui/TextArea'
import styles from './Chat.module.css'

interface FeedbackWidgetProps {
  messageId: string
}

export function FeedbackWidget({ messageId }: FeedbackWidgetProps) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [showComment, setShowComment] = useState(false)
  const mutation = useMutation({ mutationFn: sendFeedback })

  function handleRate(value: number) {
    setRating(value)
    mutation.mutate({ messageId, rating: value })
  }

  function handleSendComment() {
    mutation.mutate({ messageId, rating: rating || 5, comment })
    setShowComment(false)
  }

  if (mutation.isSuccess && !showComment) {
    return <p className={styles.feedbackDone}>Obrigado pelo feedback!</p>
  }

  return (
    <div className={styles.feedback}>
      <div className={styles.feedbackStars}>
        <span>Avaliar resposta:</span>
        {[1, 2, 3, 4, 5].map((value) => (
          <button
            key={value}
            type="button"
            className={value <= rating ? styles.starActive : styles.star}
            onClick={() => handleRate(value)}
            aria-label={`Nota ${value}`}
          >
            ★
          </button>
        ))}
        <button type="button" className={styles.feedbackCommentToggle} onClick={() => setShowComment((v) => !v)}>
          {showComment ? 'ocultar comentário' : 'comentar'}
        </button>
      </div>
      {showComment ? (
        <div className={styles.feedbackCommentBox}>
          <TextArea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Comentário opcional"
            rows={2}
          />
          <Button variant="secondary" onClick={handleSendComment}>
            Enviar comentário
          </Button>
        </div>
      ) : null}
      {mutation.isError ? <ErrorState error={mutation.error} /> : null}
    </div>
  )
}
