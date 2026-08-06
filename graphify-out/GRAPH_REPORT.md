# Graph Report - kingfisher-dive-and-crash  (2026-08-06)

## Corpus Check
- 89 files · ~76,487 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 584 nodes · 1474 edges · 26 communities (25 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c1e8c132`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VISUALS.md — Kingfisher: Dive & Crash
- App.tsx
- package.json
- compilerOptions
- presentation.ts
- StatusLine.tsx
- compilerOptions
- types.ts
- resolution.ts
- WildTracks — Agent Rules
- Progress
- tsconfig.json
- GameState
- RiverBoard.tsx
- legacy.ts
- bot.ts
- stepFeedback.ts
- lesson.ts
- RosterSheet.tsx
- Perch.tsx
- WaterPuddleSvg.tsx
- game/types.ts
- stepFeedback.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 46 edges
2. `CardType` - 28 edges
3. `Board()` - 21 edges
4. `playSfx()` - 19 edges
5. `KingfisherID` - 17 edges
6. `compilerOptions` - 17 edges
7. `scoreMove()` - 16 edges
8. `openHoverTargets()` - 15 edges
9. `seatKingfisher()` - 15 edges
10. `compilerOptions` - 15 edges

## Surprising Connections (you probably didn't know these)
- `fresh()` --calls--> `setup()`  [EXTRACTED]
  _powers_smoke.mts → src/game/Game.ts
- `main()` --calls--> `setup()`  [EXTRACTED]
  _powers_smoke.mts → src/game/Game.ts
- `main()` --calls--> `hasPower()`  [EXTRACTED]
  _powers_smoke.mts → src/game/powers.ts
- `main()` --calls--> `openHoverTargets()`  [EXTRACTED]
  _powers_smoke.mts → src/game/powers.ts
- `main()` --calls--> `reachLevel()`  [EXTRACTED]
  _powers_smoke.mts → src/game/powers.ts

## Import Cycles
- None detected.

## Communities (26 total, 1 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.15
Nodes (22): GameLobby(), FLOCK, TitleDiorama(), kingfisher(), buffers, cueRoundAdvanceSfx(), cueWinSfx(), ensureCtx() (+14 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (26): boardgame.io, dependencies, boardgame.io, react, react-dom, devDependencies, @types/react, @types/react-dom (+18 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 4 - "presentation.ts"
Cohesion: 0.15
Nodes (18): PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, Hand(), HandProps, PRIORITY (+10 more)

### Community 5 - "StatusLine.tsx"
Cohesion: 0.11
Nodes (40): CreateGame(), maybeRecord(), FLOCK, NestPanel(), KingfisherID, KINGFISHERS, buildSpeciesBySeat(), SPECIES_POWERS (+32 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.08
Nodes (51): assert(), fresh(), main(), App(), BotsGame(), BotsMode, Mode, TutorialGame() (+43 more)

### Community 8 - "resolution.ts"
Cohesion: 0.14
Nodes (27): bestPlayer(), drawOne(), driftFish(), driftPeeked(), endOfRoundCleanup(), handReset(), nextPlayer(), restock() (+19 more)

### Community 9 - "WildTracks — Agent Rules"
Cohesion: 0.20
Nodes (9): CSS / Styling, Data, File Structure & Size, Game Logic (boardgame.io), graphify, React & Components, Tracking Progress, TypeScript (+1 more)

### Community 10 - "Progress"
Cohesion: 0.20
Nodes (9): Clarified Rules (2026-08-06), Core Types, Implementation Notes, Kingfisher: Dive & Crash — Design & Progress, Progress, Project Structure, Scaffolding, Tech Stack (+1 more)

### Community 15 - "GameState"
Cohesion: 0.14
Nodes (20): GameOver(), OutcomeSplash(), prefersReducedMotion(), Props, RosterButton(), RosterButtonProps, calloutFor(), phaseText() (+12 more)

### Community 16 - "RiverBoard.tsx"
Cohesion: 0.18
Nodes (15): RiverBoard(), RiverBoardProps, BankFoliageSvg(), BankFoliageSvgProps, MossTuftSvg(), MossTuftSvgProps, RiverChannelSvg(), BADGE_CLASS (+7 more)

### Community 17 - "legacy.ts"
Cohesion: 0.09
Nodes (55): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+47 more)

### Community 18 - "bot.ts"
Cohesion: 0.28
Nodes (7): beforeHover, ev(), mm(), order, phaseLog, reducer, state

### Community 19 - "stepFeedback.ts"
Cohesion: 0.07
Nodes (40): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+32 more)

### Community 20 - "lesson.ts"
Cohesion: 0.13
Nodes (23): BoardExtra, Props, TutorialCoach(), actionLesson(), cleanupReviewKey(), lessonFor(), outcomeKinds(), reviewLesson() (+15 more)

### Community 21 - "RosterSheet.tsx"
Cohesion: 0.18
Nodes (10): FishCard(), FishCardBack(), FishIcon(), FishIconProps, RevealLine(), FishCard, FishType, FISH_LABEL (+2 more)

### Community 22 - "Perch.tsx"
Cohesion: 0.19
Nodes (10): Perch(), PerchProps, REACTION_CLASS, PerchOccupant, RosterSheetProps, BranchSvg(), BranchSvgProps, ReedSvg() (+2 more)

### Community 23 - "WaterPuddleSvg.tsx"
Cohesion: 0.29
Nodes (6): WaterPuddleSvg(), WaterPuddleSvgProps, Bloom, StrokeMark, WashRecipe, WATER_RECIPES

### Community 24 - "game/types.ts"
Cohesion: 0.35
Nodes (8): powerForSeat(), PowerId, speciesIdForSeat(), SpeciesPower, adjacentPerches(), openHoverPerches(), Perch, PerchLevel

### Community 25 - "stepFeedback.ts"
Cohesion: 0.33
Nodes (8): StepSelection, OUTCOME_LABEL, playerReactions(), primaryZoneCallout(), primaryZoneOutcome(), REACTION_PRIORITY, selectionZone(), zoneActions()

## Knowledge Gaps
- **146 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `GameState` to `App.tsx`, `presentation.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `legacy.ts`, `stepFeedback.ts`, `lesson.ts`, `RosterSheet.tsx`, `Perch.tsx`, `game/types.ts`, `stepFeedback.ts`?**
  _High betweenness centrality (0.087) - this node is a cross-community bridge._
- **Why does `CardType` connect `presentation.ts` to `App.tsx`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `RiverBoard.tsx`, `legacy.ts`, `lesson.ts`, `RosterSheet.tsx`, `game/types.ts`, `stepFeedback.ts`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `KingfisherID` connect `StatusLine.tsx` to `presentation.ts`, `types.ts`, `GameState`, `RiverBoard.tsx`, `game/types.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._