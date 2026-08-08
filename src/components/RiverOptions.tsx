import {
  MAX_DECK,
  MAX_ZONES,
  MIN_DECK,
  MIN_ZONES,
  deckTotalFor,
  riverZonesFor,
} from '../game/fish'
import {
  MAX_SPECIAL_ZONES,
  MIN_SPECIAL_ZONES,
  clampSpecialZones,
} from '../game/zones'
import { playSfx } from '../lib/sfx'
import styles from './CreateGame.module.css'

const SPECIAL_HINT: Record<number, string> = {
  0: 'Classic flat water',
  1: '1 random special (Clear, Eddy, or Rapids), random seat',
  2: '2 of 3 specials, random seats',
  3: 'All three specials, random seats',
}

export function RiverOptions({
  playerCount,
  zoneCount,
  deckSize,
  specialZones,
  onZoneCount,
  onDeckSize,
  onSpecialZones,
  disabled = false,
}: {
  playerCount: number
  zoneCount: number
  deckSize: number
  specialZones: number
  onZoneCount: (n: number) => void
  onDeckSize: (n: number) => void
  onSpecialZones: (n: number) => void
  disabled?: boolean
}) {
  const defaultZones = riverZonesFor(playerCount)
  const defaultDeck = deckTotalFor(playerCount)
  const maxSpecial = clampSpecialZones(MAX_SPECIAL_ZONES, zoneCount)
  const special = clampSpecialZones(specialZones, zoneCount)
  const customized =
    zoneCount !== defaultZones || deckSize !== defaultDeck || special !== MIN_SPECIAL_ZONES

  return (
    <div className={styles.field}>
      <span>River table</span>
      <p className={styles.optionHint}>
        Defaults: {defaultZones} zones · {defaultDeck} fish · 0 specials. Try fewer zones or a
        shorter deck.
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
        <div className={styles.stepper}>
          <span>Special zones ({special})</span>
          <div className={styles.slotActions}>
            <button
              type="button"
              className={styles.secondary}
              disabled={disabled || special <= MIN_SPECIAL_ZONES}
              onClick={() => {
                playSfx('card_select')
                onSpecialZones(special - 1)
              }}
            >
              −
            </button>
            <button
              type="button"
              className={styles.secondary}
              disabled={disabled || special >= maxSpecial}
              onClick={() => {
                playSfx('card_select')
                onSpecialZones(special + 1)
              }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <p className={styles.optionHint}>{SPECIAL_HINT[special] ?? SPECIAL_HINT[0]}</p>
      {customized && (
        <button
          type="button"
          className={styles.resetLink}
          disabled={disabled}
          onClick={() => {
            playSfx('card_select')
            onZoneCount(defaultZones)
            onDeckSize(defaultDeck)
            onSpecialZones(MIN_SPECIAL_ZONES)
          }}
        >
          Reset to {playerCount}p defaults
        </button>
      )}
    </div>
  )
}
