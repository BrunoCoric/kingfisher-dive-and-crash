import { playSfx } from '../lib/sfx'
import { kingfisher } from '../lib/presentation'
import surface from './menuSurface.module.css'
import styles from './GameLobby.module.css'

export function GameLobby({
  onCreate,
  onBack,
}: {
  onCreate: () => void
  onBack: () => void
}) {
  const deco = kingfisher(0)
  return (
    <main className={surface.shell}>
      <button
        type="button"
        className={surface.back}
        onClick={() => {
          playSfx('card_select')
          onBack()
        }}
      >
        Back
      </button>

      <img className={styles.deco} src={deco.sprite} alt="" aria-hidden />
      <p className={surface.kicker}>Local river</p>
      <h1 className={surface.title}>Games</h1>
      <p className={surface.lede}>Open tables will show here. For now, host one yourself.</p>

      <div className={surface.panel}>
        <ul className={styles.list} aria-label="Available games">
          <li className={styles.empty}>
            <span className={styles.emptyMark} aria-hidden>
              ~
            </span>
            No games yet — the water is quiet.
          </li>
        </ul>
        <button
          type="button"
          className={surface.primary}
          onClick={() => {
            playSfx('card_select')
            onCreate()
          }}
        >
          Create game
        </button>
      </div>
    </main>
  )
}
