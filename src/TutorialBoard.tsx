import { useState } from 'react'
import type { BoardProps } from 'boardgame.io/react'
import type { GameState } from './game/types'
import { Board } from './Board'
import { lessonFor } from './tutorial/lesson'

/** boardgame.io board wrapper that owns tutorial coach dismiss state. */
export function TutorialBoard(props: BoardProps<GameState>) {
  const [dismissedReview, setDismissedReview] = useState<string | null>(null)
  const myID = props.playerID ?? '0'
  const lesson = lessonFor(props.G, props.ctx, myID, dismissedReview)
  const reviewToken = lesson.reviewKey ?? null
  return (
    <Board
      {...props}
      guided
      guide={lesson.gate}
      coach={lesson}
      onDismissReview={() => {
        if (reviewToken) setDismissedReview(reviewToken)
      }}
    />
  )
}
