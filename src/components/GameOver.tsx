import type { GameState } from '../game/types'
import { kingfisher, species } from '../lib/presentation'
import { cueWinSfx } from '../lib/sfx'
import styles from './GameOver.module.css'

export function GameOver({ game, playOrder, onReset }: { game: GameState; playOrder: string[]; onReset: () => void }) {
  if (game.winner === null) return null
  cueWinSfx(game.winner)
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
        <button className={styles.reset} onClick={onReset}>
          Play again
        </button>
      </div>
    </div>
  )
}
