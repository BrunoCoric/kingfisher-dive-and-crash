import type { GameState } from '../game/types'
import { kingfisher, species } from '../lib/presentation'
import { cueWinSfx } from '../lib/sfx'
import { recordMatchOnce } from '../profile/store'
import { summarizeMatch } from '../profile/summarize'
import { UNLOCK_META } from '../profile/unlocks'
import type { UnlockId } from '../profile/types'
import styles from './GameOver.module.css'

function maybeRecord(game: GameState, playOrder: string[]): UnlockId[] {
  if (game.tutorial || game.humanSeats.length !== 1 || game.winner === null) return []
  const seat = game.humanSeats[0]
  const matchKey = `${game.winner}:${seat}:${game.round}:${game.players[seat].score}`
  return recordMatchOnce(matchKey, summarizeMatch(game, playOrder, seat))
}

export function GameOver({ game, playOrder, onMenu }: { game: GameState; playOrder: string[]; onMenu: () => void }) {
  if (game.winner === null) return null
  cueWinSfx(game.winner)
  const newlyUnlocked = maybeRecord(game, playOrder)
  const winner = kingfisher(Number(game.winner))
  const standings = [...playOrder].sort((a, b) => {
    const scoreDiff = game.players[b].score - game.players[a].score
    return scoreDiff || game.players[b].fishCount - game.players[a].fishCount
  })
  return (
    <div className={styles.backdrop} data-gameover>
      <div className={styles.panel}>
        <p className={styles.kicker}>The river rests</p>
        <h2 className={styles.title}>Game Over</h2>
        <div className={styles.winnerCard} style={{ ['--win-accent' as string]: winner.accent }}>
          <img className={styles.winnerSprite} src={winner.sprite} alt="" />
          <p className={styles.winner}>
            <strong>{species(Number(game.winner))}</strong> wins with{' '}
            <strong>{game.players[game.winner].score}</strong> points!
          </p>
        </div>
        <ol className={styles.standings}>
          {standings.map((pid, i) => {
            const p = game.players[pid]
            return (
              <li key={pid} style={{ ['--row-accent' as string]: kingfisher(Number(pid)).accent }}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.rowName}>{species(Number(pid))}</span>
                <span className={styles.rowScore}>{p.score} pts</span>
                <span className={styles.rowFish}>{p.fishCount} fish</span>
              </li>
            )
          })}
        </ol>
        {newlyUnlocked.length > 0 && (
          <ul className={styles.unlocks} aria-label="New nest unlocks">
            {newlyUnlocked.map((id) => (
              <li key={id}>
                <span className={styles.unlockLabel}>Unlocked</span>
                <strong>{UNLOCK_META[id].name}</strong>
                <span className={styles.unlockFlavor}>{UNLOCK_META[id].flavor}</span>
              </li>
            ))}
          </ul>
        )}
        <button className={styles.reset} onClick={onMenu}>
          Main menu
        </button>
      </div>
    </div>
  )
}
