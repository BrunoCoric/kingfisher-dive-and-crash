import {
  MAX_DECK,
  MAX_ZONES,
  MIN_DECK,
  MIN_ZONES,
  deckTotalFor,
  riverZonesFor,
} from '../game/fish'
import { playSfx } from '../lib/sfx'
import styles from './CreateGame.module.css'

export function RiverOptions({
  playerCount,
  zoneCount,
  deckSize,
  onZoneCount,
  onDeckSize,
  disabled = false,
}: {
  playerCount: number
  zoneCount: number
  deckSize: number
  onZoneCount: (n: number) => void
  onDeckSize: (n: number) => void
  disabled?: boolean
}) {
  const defaultZones = riverZonesFor(playerCount)
  const defaultDeck = deckTotalFor(playerCount)
  const customized = zoneCount !== defaultZones || deckSize !== defaultDeck

  return (
    <div className={styles.field}>
      <span>River table</span>
      <p className={styles.optionHint}>
        Defaults: {defaultZones} zones · {defaultDeck} fish. Try fewer zones or a shorter deck.
      </p>
      <div className={styles.steppers}>
        <div className={styles.stepper}>
          <span>Water zones ({zoneCount})</span>
          <div className={styles.slotActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={disabled || zoneCount <= MIN_ZONES}
              onClick={() => {
                playSfx('card_select')
                onZoneCount(zoneCount - 1)
              }}
            >
              −
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={disabled || zoneCount >= MAX_ZONES}
              onClick={() => {
                playSfx('card_select')
                onZoneCount(zoneCount + 1)
              }}
            >
              +
            </button>
          </div>
        </div>
        <div className={styles.stepper}>
          <span>Fish in deck ({deckSize})</span>
          <div className={styles.slotActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={disabled || deckSize <= Math.max(MIN_DECK, zoneCount)}
              onClick={() => {
                playSfx('card_select')
                onDeckSize(deckSize - 1)
              }}
            >
              −
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={disabled || deckSize >= MAX_DECK}
              onClick={() => {
                playSfx('card_select')
                onDeckSize(deckSize + 1)
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      {customized && (
        <button
          type="button"
          className={styles.resetLink}
          disabled={disabled}
          onClick={() => {
            playSfx('card_select')
            onZoneCount(defaultZones)
            onDeckSize(defaultDeck)
          }}
        >
          Reset to {playerCount}p defaults
        </button>
      )}
    </div>
  )
}
