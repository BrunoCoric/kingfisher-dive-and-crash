import type { TutorialLesson } from '../tutorial/types'
import styles from './TutorialCoach.module.css'

interface Props {
  lesson: TutorialLesson
  onDismissReview: () => void
}

export function TutorialCoach({ lesson, onDismissReview }: Props) {
  if (!lesson.title) return null
  return (
    <aside className={styles.coach} aria-live="polite">
      <div className={styles.copy}>
        <strong className={styles.title}>{lesson.title}</strong>
        <p className={styles.body}>{lesson.body}</p>
      </div>
      {lesson.reviewKey && (
        <button type="button" className={styles.gotIt} onClick={onDismissReview}>
          Got it
        </button>
      )}
    </aside>
  )
}
