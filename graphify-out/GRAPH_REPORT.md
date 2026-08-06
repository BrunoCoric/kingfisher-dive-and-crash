# Graph Report - kingfisher-dive-and-crash  (2026-08-06)

## Corpus Check
- 76 files · ~64,938 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 501 nodes · 1173 edges · 20 communities (19 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `33cc9b5c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VISUALS.md — Kingfisher: Dive & Crash
- App.tsx
- package.json
- compilerOptions
- Game.ts
- WaterPuddleSvg.tsx
- compilerOptions
- types.ts
- resolution.ts
- WildTracks — Agent Rules
- Progress
- tsconfig.json
- cleanup.ts
- cleanup.ts
- legacy.ts
- bot.ts
- lesson.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 41 edges
2. `CardType` - 23 edges
3. `Board()` - 19 edges
4. `compilerOptions` - 17 edges
5. `scoreMove()` - 16 edges
6. `kingfisher()` - 16 edges
7. `compilerOptions` - 15 edges
8. `reachableZones()` - 14 edges
9. `VISUALS.md — Kingfisher: Dive & Crash` - 13 edges
10. `evaluateMove()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `humanAct()` --calls--> `humanGate()`  [EXTRACTED]
  _tutorial_smoke.mts → src/tutorial/script.ts
- `main()` --calls--> `humanGate()`  [EXTRACTED]
  _tutorial_smoke.mts → src/tutorial/script.ts
- `BotsGame()` --indirect_call--> `Board()`  [INFERRED]
  src/App.tsx → src/Board.tsx
- `TutorialGame()` --indirect_call--> `TutorialBot`  [INFERRED]
  src/App.tsx → src/tutorial/TutorialBot.ts
- `TutorialGame()` --indirect_call--> `TutorialBoard()`  [INFERRED]
  src/App.tsx → src/TutorialBoard.tsx

## Import Cycles
- None detected.

## Communities (20 total, 1 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.15
Nodes (15): App(), BotsGame(), BotsMode, Mode, PassPlayClient, PassPlayGame(), TutorialGame(), Props (+7 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (26): boardgame.io, dependencies, boardgame.io, react, react-dom, devDependencies, @types/react, @types/react-dom (+18 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 4 - "Game.ts"
Cohesion: 0.12
Nodes (32): beforeHover, ev(), mm(), order, phaseLog, reducer, state, enumerateLegalMoves() (+24 more)

### Community 5 - "WaterPuddleSvg.tsx"
Cohesion: 0.33
Nodes (5): WaterPuddleSvg(), WaterPuddleSvgProps, Bloom, WashRecipe, WATER_RECIPES

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.09
Nodes (39): FishCard(), FishCardBack(), FishIcon(), Perch(), PerchProps, REACTION_CLASS, PerchOccupant, RiverBoardProps (+31 more)

### Community 8 - "resolution.ts"
Cohesion: 0.16
Nodes (25): bestPlayer(), drawOne(), driftFish(), endOfRoundCleanup(), handReset(), nextPlayer(), restock(), blockPlayer() (+17 more)

### Community 9 - "WildTracks — Agent Rules"
Cohesion: 0.20
Nodes (9): CSS / Styling, Data, File Structure & Size, Game Logic (boardgame.io), graphify, React & Components, Tracking Progress, TypeScript (+1 more)

### Community 10 - "Progress"
Cohesion: 0.20
Nodes (9): Clarified Rules (2026-08-06), Core Types, Implementation Notes, Kingfisher: Dive & Crash — Design & Progress, Progress, Project Structure, Scaffolding, Tech Stack (+1 more)

### Community 15 - "cleanup.ts"
Cohesion: 0.40
Nodes (12): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+4 more)

### Community 16 - "cleanup.ts"
Cohesion: 0.06
Nodes (55): Board(), BoardExtra, PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, GameOver() (+47 more)

### Community 17 - "legacy.ts"
Cohesion: 0.11
Nodes (44): FishIconProps, collisionRisk(), EnumerateFn, evaluateMove(), individualDiveProb(), opponentDiveWeights(), opponentHasCard(), peekOf() (+36 more)

### Community 18 - "bot.ts"
Cohesion: 0.07
Nodes (43): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+35 more)

### Community 20 - "lesson.ts"
Cohesion: 0.14
Nodes (22): Props, TutorialCoach(), actionLesson(), cleanupReviewKey(), lessonFor(), outcomeKinds(), reviewLesson(), stepReviewKey() (+14 more)

## Knowledge Gaps
- **140 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+135 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `bot.ts` to `Game.ts`, `types.ts`, `resolution.ts`, `cleanup.ts`, `cleanup.ts`, `legacy.ts`, `lesson.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `CardType` connect `cleanup.ts` to `Game.ts`, `types.ts`, `resolution.ts`, `cleanup.ts`, `legacy.ts`, `lesson.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `Perch` connect `types.ts` to `legacy.ts`, `Game.ts`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _140 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._
- **Should `compilerOptions` be split into smaller, more focused modules?**
  _Cohesion score 0.08695652173913043 - nodes in this community are weakly interconnected._