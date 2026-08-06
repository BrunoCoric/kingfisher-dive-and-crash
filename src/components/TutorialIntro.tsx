import { TUTORIAL_INTRO } from '../tutorial/intro'
import styles from './TutorialIntro.module.css'

interface Props {
  index: number
  onBack: () => void
  onNext: () => void
  onSkip: () => void
}

export function TutorialIntro({ index, onBack, onNext, onSkip }: Props) {
  const slide = TUTORIAL_INTRO[index]
  const last = index >= TUTORIAL_INTRO.length - 1
  if (!slide) return null

  return (
    <main className={styles.shell}>
      <p className={styles.kicker}>
        Before you dive · {index + 1}/{TUTORIAL_INTRO.length}
      </p>
      <h1 className={styles.title}>{slide.title}</h1>
      <p className={styles.body}>{slide.body}</p>
      {slide.bullets && (
        <ul className={styles.list}>
          {slide.bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}
      <div className={styles.actions}>
        {index > 0 ? (
          <button type="button" className={styles.secondary} onClick={onBack}>
            Back
          </button>
        ) : (
          <button type="button" className={styles.secondary} onClick={onSkip}>
            Skip intro
          </button>
        )}
        <button type="button" className={styles.primary} onClick={onNext}>
          {last ? 'Start practice' : 'Next'}
        </button>
      </div>
    </main>
  )
}
