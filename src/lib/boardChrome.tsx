import type { CardType } from '../game/types'

interface PendingSelection {
  card: CardType
}

export function statusHintFor(opts: {
  pending: PendingSelection | null
  canAct: boolean
  canHover: boolean
  noLegalStepMove: boolean
  hoverPeekAvailable?: boolean
}): string | undefined {
  if (opts.canHover) return 'Tap a highlighted perch, or stay'
  if (opts.noLegalStepMove) return 'No legal action — skip this step'
  if (opts.pending && opts.canAct) {
    if (opts.pending.card === 'Hover') {
      return opts.hoverPeekAvailable
        ? 'Tap one face-down card to peek'
        : 'No face-down cards left — skip peek'
    }
    return `${opts.pending.card} — tap a highlighted zone`
  }
  return undefined
}

export function statusActionsFor(opts: {
  pending: PendingSelection | null
  canAct: boolean
  canHover: boolean
  canContinue?: boolean
  noLegalStepMove: boolean
  hoverPeekAvailable?: boolean
  onSkipPeek: () => void
  onCancel: () => void
  onStay: () => void
  onSkip: () => void
  onContinue?: () => void
}) {
  if (opts.canContinue && opts.onContinue) {
    return (
      <button type="button" data-primary data-action="continue-round" onClick={opts.onContinue}>
        Next round
      </button>
    )
  }
  if (opts.canHover) {
    return (
      <button type="button" data-primary data-action="hover-stay" onClick={opts.onStay}>
        Stay
      </button>
    )
  }
  if (opts.noLegalStepMove) {
    return (
      <button type="button" data-primary data-action="skip-turn" onClick={opts.onSkip}>
        Skip
      </button>
    )
  }
  if (opts.pending && opts.canAct) {
    if (opts.pending.card === 'Hover') {
      return (
        <>
          {!opts.hoverPeekAvailable && (
            <button type="button" data-primary data-action="skip-peek" onClick={opts.onSkipPeek}>
              Skip peek
            </button>
          )}
          <button type="button" data-secondary onClick={opts.onCancel}>
            Cancel
          </button>
        </>
      )
    }
    return (
      <button type="button" data-secondary onClick={opts.onCancel}>
        Cancel
      </button>
    )
  }
  return undefined
}
