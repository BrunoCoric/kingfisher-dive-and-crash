import { useState } from 'react'
import type { BoardProps } from 'boardgame.io/react'
import type { GameState } from './game/types'
import { Board, type BoardExtra } from './Board'
import { lessonFor } from './tutorial/lesson'

/** boardgame.io board wrapper that owns tutorial coach dismiss state. */
export function TutorialBoard(props: BoardProps<GameState> & Pick<BoardExtra, 'onMenu'>) {
  const [dismissedReviews, setDismissedReviews] = useState<ReadonlySet<string>>(() => new Set())
  const myID = props.playerID ?? '0'
  const lesson = lessonFor(props.G, props.ctx, myID, dismissedReviews)
  const reviewToken = lesson.reviewKey ?? null
  return (
    <Board
      {...props}
      guided
      guide={lesson.gate}
      coach={lesson}
      onMenu={props.onMenu}
      onDismissReview={() => {
        if (!reviewToken) return
        setDismissedReviews((prev) => {
          if (prev.has(reviewToken)) return prev
          const next = new Set(prev)
          next.add(reviewToken)
          return next
        })
      }}
    />
  )
}
