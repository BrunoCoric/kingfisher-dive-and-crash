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
  hoverRelocateAvailable?: boolean
}): string | undefined {
  if (opts.canHover) return 'Hover resolving…'
  if (opts.noLegalStepMove) return 'No legal action — skip this step'
  if (opts.pending && opts.canAct) {
    if (opts.pending.card === 'Hover') {
      const scout = opts.hoverPeekAvailable
      const relocate = opts.hoverRelocateAvailable
      if (scout && relocate) return 'Scout a face-down fish, or relocate to a highlighted perch'
      if (scout) return 'Tap one face-down card to Scout'
      if (relocate) return 'Tap a highlighted perch to Relocate'
      return 'No Scout or Relocate targets — lock Hover to stay'
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
  hoverRelocateAvailable?: boolean
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
    // Hover phase auto-applies declared Scout/Relocate; Stay is race fallback only.
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
      const canSkip =
        !opts.hoverPeekAvailable && !opts.hoverRelocateAvailable
      return (
        <>
          {canSkip && (
            <button type="button" data-primary data-action="skip-peek" onClick={opts.onSkipPeek}>
              Stay put
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
