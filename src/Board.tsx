import { useState } from 'react'
import type { BoardProps } from 'boardgame.io/react'
import type { CardType, GameState, StepSelection } from './game/types'
import { reachableZones, openHoverPerches } from './game/reach'
import { hasLegalStepMove } from './game/enumerate'
import { hasHoverPeekTarget, isHoverPeekTarget } from './game/hoverPeek'
import { kingfisher, playerColor } from './lib/presentation'
import { playerReactions, zoneActions, zoneOutcomes } from './lib/stepFeedback'
import { statusActionsFor, statusHintFor } from './lib/boardChrome'
import { cueRoundAdvanceSfx, playSfx } from './lib/sfx'
import { cueStepSfx } from './lib/stepSfx'
import { RiverBoard, type PerchOccupant } from './components/RiverBoard'
import { Hand } from './components/Hand'
import { RosterButton } from './components/RosterButton'
import { RosterSheet } from './components/RosterSheet'
import { StatusLine } from './components/StatusLine'
import { GameOver } from './components/GameOver'
import { RulesCheatsheet } from './components/RulesCheatsheet'
import { OutcomeSplash } from './components/OutcomeSplash'
import { TutorialCoach } from './components/TutorialCoach'
import type { TutorialGate, TutorialLesson } from './tutorial/types'
import styles from './Board.module.css'

interface PendingSelection {
  card: CardType
}

export type BoardExtra = {
  /** When true, only `guide` targets are clickable (tutorial sandbox). */
  guided?: boolean
  guide?: TutorialGate | null
  coach?: TutorialLesson | null
  onDismissReview?: () => void
  onMenu?: () => void
}

export function Board(props: BoardProps<GameState> & BoardExtra) {
  const { G, ctx, moves, playerID, isActive, guided, guide, coach, onDismissReview, onMenu } = props
  const [pending, setPending] = useState<PendingSelection | null>(null)
  const [rosterOpen, setRosterOpen] = useState(false)
  const [drifting, setDrifting] = useState(false)

  const myID = playerID ?? ''
  const me = myID === '' ? undefined : G.players[myID]
  const placing = G.currentPhase === 'placement'
  const hopping = G.currentPhase.startsWith('hover')
  const cleaning = G.currentPhase === 'cleanup'
  const showStepFeedback = !placing && !drifting
  const locked = me !== undefined && G.selections[myID] !== undefined
  const guideOk = !guided || guide != null
  const canAct =
    guideOk && isActive && me !== undefined && !locked && !placing && !hopping && !cleaning
  const canPlace = guideOk && isActive && me !== undefined && placing && G.locked[myID] !== true
  const canHover = guideOk && isActive && me !== undefined && hopping
  const canContinue =
    guideOk && cleaning && isActive && !drifting && (!guided || guide?.action === 'continue')
  const noLegalStepMove = canAct && !hasLegalStepMove(G, myID)
  const hoverPeekAvailable = myID !== '' && hasHoverPeekTarget(G, myID)

  const beginDrift = () => {
    if (!canContinue || drifting) return
    playSfx('fish_drift')
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      moves.continueRound()
      cueRoundAdvanceSfx()
      return
    }
    setDrifting(true)
  }
  const finishDrift = () => {
    if (!drifting) return
    moves.continueRound()
    cueRoundAdvanceSfx()
    setDrifting(false)
  }

  const myPerch = me ? G.perches.find((p) => p.id === me.perch) : undefined
  const reach = myPerch ? reachableZones(myPerch.zone, myPerch.level, G.zones.length) : []
  const sightLineOpen =
    placing &&
    isActive &&
    guideOk &&
    me !== undefined &&
    myPerch !== undefined &&
    myPerch.level === 'low' &&
    G.sightlinePeek[myID] === undefined
  const occupiedIds = new Set(Object.values(G.players).map((p) => p.perch).filter(Boolean))
  const hoverOpenPerches =
    me !== undefined
      ? openHoverPerches(G.perches, me.perch, occupiedIds).map((p) => p.id)
      : []
  const hoverRelocateAvailable = hoverOpenPerches.length > 0
  // Relocate targets light during pending Hover (step); hover phase auto-applies.
  let movablePerches =
    placing && canPlace
      ? G.perches.filter((perch) => !occupiedIds.has(perch.id)).map((p) => p.id)
      : pending?.card === 'Hover' && canAct
        ? hoverOpenPerches
        : []
  if (guided && guide?.perchId) {
    movablePerches = movablePerches.filter((id) => id === guide.perchId)
  } else if (guided && placing) {
    movablePerches = []
  } else if (guided && pending?.card === 'Hover' && guide?.zoneId !== undefined) {
    // Scout lesson: only the coached zone; hide Relocate perches.
    movablePerches = []
  }

  const reactions = showStepFeedback ? playerReactions(G) : {}
  const actionsByZone = showStepFeedback ? zoneActions(G) : {}
  const outcomesByZone = showStepFeedback ? zoneOutcomes(G) : {}
  const feedbackKey = `${G.round}-${G.step}-${G.outcomeLog.length}`
  if (showStepFeedback) cueStepSfx(feedbackKey, G)

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
    if (guided && guide?.zoneId !== undefined && zone.id !== guide.zoneId) {
      // Tutorial: only the coached zone lights; others stay neutral (not dimmed).
      targetStates[zone.id] = null
      continue
    }
    if (guided && guide?.perchId && guide.zoneId === undefined && pending?.card === 'Hover') {
      // Relocate lesson: dim zones so only the coached perch is the target.
      targetStates[zone.id] = 'illegal'
      continue
    }
    if (pending && canAct) {
      if (guided && guide?.card && pending.card !== guide.card) {
        targetStates[zone.id] = null
      } else if (pending.card === 'Hover') {
        // Peek targets glow green; everything else dims so reach is obvious.
        targetStates[zone.id] = isHoverPeekTarget(G, myID, zone.id) ? 'peek' : 'illegal'
      } else if (reach.includes(zone.id)) {
        const legal = pending.card !== 'Dive' || zone.fish !== null
        targetStates[zone.id] = legal ? 'legal' : 'illegal'
      } else {
        // Out of perch reach — dim so legal Splash/Drop/Dive lanes pop.
        targetStates[zone.id] = 'illegal'
      }
    } else if (sightLineOpen) {
      targetStates[zone.id] = reach.includes(zone.id) ? 'peek' : 'illegal'
    } else {
      targetStates[zone.id] = null
    }
  }

  const commit = (sel: StepSelection) => {
    if (pending) {
      playSfx('card_lock')
      if (sel.card === 'Hover' && sel.peek !== undefined) playSfx('peek', 80)
      if (sel.card === 'Hover' && sel.moveTo !== undefined) playSfx('bird_move', 80)
      moves.selectCard(pending.card, sel)
    }
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
        hoverRelocateAvailable,
      })
  const rawActions = statusActionsFor({
    pending,
    canAct,
    canHover: false,
    canContinue,
    noLegalStepMove,
    hoverPeekAvailable,
    hoverRelocateAvailable,
    onSkipPeek: () => commit({ card: 'Hover' }),
    onCancel: cancel,
    onStay: () => moves.hoverMove(undefined),
    onSkip: () => moves.skipTurn(),
    onContinue: beginDrift,
  })
  const statusActions =
    guided && guide?.action === 'continue'
      ? rawActions
      : guided && !guide?.action
        ? // Hide stray Skip / Cancel noise during gated card play; keep Cancel if pending
          pending && canAct
            ? statusActionsFor({
                pending,
                canAct,
                canHover: false,
                canContinue: false,
                noLegalStepMove: false,
                hoverPeekAvailable,
                hoverRelocateAvailable,
                onSkipPeek: () => commit({ card: 'Hover' }),
                onCancel: cancel,
                onStay: () => undefined,
                onSkip: () => undefined,
              })
            : undefined
        : rawActions
  const lockedCard = G.selections[myID]?.card ?? null

  const selectCard = (card: CardType) => {
    if (guided && guide?.card && card !== guide.card) return
    if (pending?.card === card) {
      cancel()
      return
    }
    playSfx('card_select')
    setPending({ card })
  }

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

      {coach && <TutorialCoach lesson={coach} onDismissReview={() => onDismissReview?.()} />}

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
            onSelect={selectCard}
          />
        )}
        <RulesCheatsheet />
        {myID !== '' && showStepFeedback && G.outcomeLog.length > 0 && (
          <OutcomeSplash key={`${feedbackKey}:${myID}`} G={G} playerID={myID} />
        )}
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
              if (guided && guide?.zoneId !== undefined && id !== guide.zoneId) return
              if (sightLineOpen && reach.includes(id)) {
                playSfx('peek')
                moves.peekSightline(id)
                return
              }
              if (!canAct || !pending) return
              if (guided && guide?.card && pending.card !== guide.card) return
              if (pending.card === 'Hover') {
                if (isHoverPeekTarget(G, myID, id)) commit({ card: 'Hover', peek: id })
              } else if (reach.includes(id) && (pending.card !== 'Dive' || G.zones[id].fish !== null)) {
                commit({ card: pending.card, target: id })
              }
            }}
            onPerchClick={(id) => {
              if (guided && guide?.perchId && id !== guide.perchId) return
              if (pending?.card === 'Hover' && canAct && movablePerches.includes(id)) {
                commit({ card: 'Hover', moveTo: id })
              } else if (canPlace && movablePerches.includes(id)) {
                if (!me?.perch || id !== me.perch) playSfx('bird_move')
                moves.placePawn(id)
              }
            }}
          />
        </div>
      </div>

      {onMenu && <GameOver game={G} playOrder={ctx.playOrder as string[]} onMenu={onMenu} />}
    </div>
  )
}
