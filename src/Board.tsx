import { useState } from 'react'
import type { BoardProps } from 'boardgame.io/react'
import type { CardType, GameState, StepSelection } from './game/types'
import { reachableZones, openHoverPerches } from './game/reach'
import { hasLegalStepMove } from './game/enumerate'
import { hasHoverPeekTarget, isHoverPeekTarget } from './game/hoverPeek'
import { kingfisher, playerColor } from './lib/presentation'
import { playerReactions, zoneActions, zoneOutcomes } from './lib/stepFeedback'
import { statusActionsFor, statusHintFor } from './lib/boardChrome'
import { RiverBoard, type PerchOccupant } from './components/RiverBoard'
import { Hand } from './components/Hand'
import { RosterButton } from './components/RosterButton'
import { RosterSheet } from './components/RosterSheet'
import { StatusLine } from './components/StatusLine'
import { GameOver } from './components/GameOver'
import { RulesCheatsheet } from './components/RulesCheatsheet'
import styles from './Board.module.css'

interface PendingSelection {
  card: CardType
}

export function Board(props: BoardProps<GameState>) {
  const { G, ctx, moves, playerID, isActive, reset } = props
  const [pending, setPending] = useState<PendingSelection | null>(null)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [drifting, setDrifting] = useState(false)

  const myID = playerID ?? ''
  const me = myID === '' ? undefined : G.players[myID]
  const placing = G.currentPhase === 'placement'
  const hopping = G.currentPhase.startsWith('hover')
  const cleaning = G.currentPhase === 'cleanup'
  // Keep step-3 chips/outcomes through the cleanup review beat (cleared on Continue).
  const showStepFeedback = !placing && !drifting
  const locked = me !== undefined && G.selections[myID] !== undefined
  const canAct = isActive && me !== undefined && !locked && !placing && !hopping && !cleaning
  const canPlace = isActive && me !== undefined && placing && G.locked[myID] !== true
  const canHover = isActive && me !== undefined && hopping
  const canContinue = cleaning && isActive && !drifting
  const noLegalStepMove = canAct && !hasLegalStepMove(G, myID)
  const hoverPeekAvailable = myID !== '' && hasHoverPeekTarget(G, myID)

  const beginDrift = () => {
    if (!canContinue || drifting) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      moves.continueRound()
      return
    }
    setDrifting(true)
  }
  const finishDrift = () => {
    if (!drifting) return
    moves.continueRound()
    setDrifting(false)
  }

  const myPerch = me ? G.perches.find((p) => p.id === me.perch) : undefined
  const reach = myPerch ? reachableZones(myPerch.zone, myPerch.level, G.zones.length) : []
  const sightLineOpen =
    placing &&
    isActive &&
    me !== undefined &&
    myPerch !== undefined &&
    myPerch.level === 'low' &&
    G.sightlinePeek[myID] === undefined
  const occupiedIds = new Set(Object.values(G.players).map((p) => p.perch).filter(Boolean))
  const movablePerches =
    placing && canPlace
      ? G.perches.filter((perch) => !occupiedIds.has(perch.id) || perch.id === me.perch).map((p) => p.id)
      : canHover && me
        ? openHoverPerches(G.perches, me.perch, occupiedIds).map((p) => p.id)
        : []

  const reactions = showStepFeedback ? playerReactions(G) : {}
  const actionsByZone = showStepFeedback ? zoneActions(G) : {}
  const outcomesByZone = showStepFeedback ? zoneOutcomes(G) : {}
  const feedbackKey = `${G.round}-${G.step}-${G.outcomeLog.length}`

  const occupants: Record<string, PerchOccupant> = {}
  for (const pid of ctx.playOrder) {
    const p = G.players[pid]
    if (!p.perch) continue
    occupants[p.perch] = {
      id: pid,
      color: playerColor(Number(pid)),
      isFirst: pid === G.firstPlayer,
      sprite: kingfisher(Number(pid)).sprite,
      facing: kingfisher(Number(pid)).facing,
      reaction: reactions[pid],
      feedbackKey: reactions[pid] ? feedbackKey : undefined,
    }
  }

  const targetStates: Record<number, 'legal' | 'illegal' | 'peek' | null> = {}
  for (const zone of G.zones) {
    if (pending && canAct) {
      if (pending.card === 'Hover') {
        targetStates[zone.id] = isHoverPeekTarget(G, myID, zone.id) ? 'peek' : null
      } else if (reach.includes(zone.id)) {
        const legal = pending.card !== 'Dive' || zone.fish !== null
        targetStates[zone.id] = legal ? 'legal' : 'illegal'
      } else {
        targetStates[zone.id] = null
      }
    } else if (sightLineOpen && reach.includes(zone.id)) {
      targetStates[zone.id] = 'peek'
    } else {
      targetStates[zone.id] = null
    }
  }

  const commit = (sel: StepSelection) => {
    if (pending) moves.selectCard(pending.card, sel)
    setPending(null)
  }
  const cancel = () => setPending(null)

  const showReveals = showStepFeedback && Object.keys(G.lastReveals).length > 0
  const statusActive = placing
    ? canPlace || sightLineOpen
    : hopping
      ? canHover
      : cleaning
        ? canContinue
        : canAct
  const statusHint = drifting
    ? 'Fish drift downstream…'
    : statusHintFor({
        pending,
        canAct,
        canHover,
        noLegalStepMove,
        hoverPeekAvailable,
      })
  const statusActions = statusActionsFor({
    pending,
    canAct,
    canHover,
    canContinue,
    noLegalStepMove,
    hoverPeekAvailable,
    onSkipPeek: () => commit({ card: 'Hover' }),
    onCancel: cancel,
    onStay: () => moves.hoverMove(undefined),
    onSkip: () => moves.skipTurn(),
    onContinue: beginDrift,
  })
  const lockedCard = G.selections[myID]?.card ?? null

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.logo}>
          Kingfisher
          <span className={styles.logoSub}>dive &amp; crash</span>
        </span>
        <span className={styles.headerRight}>
          <RosterButton
            G={G}
            playOrder={ctx.playOrder as string[]}
            myID={myID}
            placing={placing}
            onOpen={() => setRosterOpen(true)}
          />
          <span className={styles.meta}>
            <span>Round {G.round}</span>
            <span className={styles.metaMuted}>·</span>
            <span>
              {placing ? 'Place' : cleaning ? 'Review' : hopping ? 'Hover' : `Step ${G.step + 1}`}
            </span>
          </span>
        </span>
      </header>

      {rosterOpen && (
        <RosterSheet
          G={G}
          playOrder={ctx.playOrder as string[]}
          myID={myID}
          placing={placing}
          showReveals={showReveals}
          reactions={reactions}
          onClose={() => setRosterOpen(false)}
        />
      )}

      {myID !== '' && (
        <StatusLine
          G={G}
          isActive={statusActive}
          isSighting={sightLineOpen}
          showStory={showStepFeedback && !statusHint}
          hint={statusHint}
          actions={statusActions}
        />
      )}

      <div className={styles.riverStage}>
        {!placing && !hopping && !cleaning && (
          <Hand
            hand={me ? me.hand : []}
            locked={locked}
            canAct={canAct}
            selectedCard={pending?.card ?? lockedCard}
            onSelect={(card) => {
              if (pending?.card === card) {
                cancel()
                return
              }
              setPending({ card })
            }}
          />
        )}
        <RulesCheatsheet />
        <div className={styles.boardWrap}>
          <RiverBoard
            zones={G.zones}
            perches={G.perches}
            splashes={drifting ? [] : G.splashes}
            occupants={occupants}
            movablePerches={movablePerches}
            targetStates={targetStates}
            zoneActions={actionsByZone}
            zoneOutcomes={outcomesByZone}
            drifting={drifting}
            onDriftEnd={finishDrift}
            onZoneClick={(id) => {
              if (sightLineOpen && reach.includes(id)) {
                moves.peekSightline(id)
                return
              }
              if (!canAct || !pending) return
              if (pending.card === 'Hover') {
                if (isHoverPeekTarget(G, myID, id)) commit({ card: 'Hover', peek: id })
              } else if (reach.includes(id) && (pending.card !== 'Dive' || G.zones[id].fish !== null)) {
                commit({ card: pending.card, target: id })
              }
            }}
            onPerchClick={(id) => {
              if (canHover && movablePerches.includes(id)) {
                moves.hoverMove(id)
              } else if (canPlace && movablePerches.includes(id)) {
                moves.placePawn(id)
              }
            }}
          />
        </div>
      </div>

      <GameOver game={G} playOrder={ctx.playOrder as string[]} onReset={reset} />
    </div>
  )
}
