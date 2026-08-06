# Graph Report - kingfisher-dive-and-crash  (2026-08-06)

## Corpus Check
- 87 files · ~69,282 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 556 nodes · 1322 edges · 20 communities (19 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.73)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `1a22295d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VISUALS.md — Kingfisher: Dive & Crash
- App.tsx
- package.json
- compilerOptions
- Game.ts
- StatusLine.tsx
- compilerOptions
- types.ts
- resolution.ts
- WildTracks — Agent Rules
- Progress
- tsconfig.json
- cleanup.ts
- RiverBoard.tsx
- legacy.ts
- bot.ts
- lesson.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 42 edges
2. `CardType` - 28 edges
3. `kingfisher()` - 20 edges
4. `Board()` - 19 edges
5. `playSfx()` - 17 edges
6. `compilerOptions` - 17 edges
7. `reachableZones()` - 16 edges
8. `scoreMove()` - 15 edges
9. `compilerOptions` - 15 edges
10. `VISUALS.md — Kingfisher: Dive & Crash` - 13 edges

## Surprising Connections (you probably didn't know these)
- `humanAct()` --calls--> `humanGate()`  [EXTRACTED]
  _tutorial_smoke.mts → src/tutorial/script.ts
- `main()` --calls--> `humanGate()`  [EXTRACTED]
  _tutorial_smoke.mts → src/tutorial/script.ts
- `Props` --references--> `GameState`  [EXTRACTED]
  src/components/OutcomeSplash.tsx → src/game/types.ts
- `StatusLineProps` --references--> `GameState`  [EXTRACTED]
  src/components/StatusLine.tsx → src/game/types.ts
- `filterPlayerView()` --indirect_call--> `fish()`  [INFERRED]
  src/game/playerView.ts → src/game/Game.ts

## Import Cycles
- None detected.

## Communities (20 total, 1 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.06
Nodes (51): BoardExtra, PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, FishCard(), FishCardBack() (+43 more)

### Community 2 - "package.json"
Cohesion: 0.07
Nodes (26): boardgame.io, dependencies, boardgame.io, react, react-dom, devDependencies, @types/react, @types/react-dom (+18 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 4 - "Game.ts"
Cohesion: 0.10
Nodes (38): beforeHover, ev(), mm(), order, phaseLog, reducer, state, BotsGame() (+30 more)

### Community 5 - "StatusLine.tsx"
Cohesion: 0.12
Nodes (35): FishIconProps, GameOver(), maybeRecord(), ALL_UNLOCKS, NestPanel(), KnownFish, FishType, species (+27 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.11
Nodes (28): CreateGame(), GameLobby(), OutcomeSplash(), prefersReducedMotion(), Props, FLOCK, TitleDiorama(), personalOutcomeSplash() (+20 more)

### Community 8 - "resolution.ts"
Cohesion: 0.14
Nodes (28): bestPlayer(), drawOne(), driftFish(), driftPeeked(), endOfRoundCleanup(), handReset(), nextPlayer(), restock() (+20 more)

### Community 9 - "WildTracks — Agent Rules"
Cohesion: 0.20
Nodes (9): CSS / Styling, Data, File Structure & Size, Game Logic (boardgame.io), graphify, React & Components, Tracking Progress, TypeScript (+1 more)

### Community 10 - "Progress"
Cohesion: 0.20
Nodes (9): Clarified Rules (2026-08-06), Core Types, Implementation Notes, Kingfisher: Dive & Crash — Design & Progress, Progress, Project Structure, Scaffolding, Tech Stack (+1 more)

### Community 15 - "cleanup.ts"
Cohesion: 0.29
Nodes (6): WaterPuddleSvg(), WaterPuddleSvgProps, Bloom, StrokeMark, WashRecipe, WATER_RECIPES

### Community 16 - "RiverBoard.tsx"
Cohesion: 0.11
Nodes (22): Perch(), PerchProps, REACTION_CLASS, PerchOccupant, RiverBoard(), RiverBoardProps, RosterSheetProps, BankFoliageSvg() (+14 more)

### Community 17 - "legacy.ts"
Cohesion: 0.10
Nodes (52): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+44 more)

### Community 18 - "bot.ts"
Cohesion: 0.07
Nodes (47): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+39 more)

### Community 20 - "lesson.ts"
Cohesion: 0.10
Nodes (27): App(), BotsMode, Mode, TutorialGame(), Props, TutorialIntro(), IntroSlide, TUTORIAL_INTRO (+19 more)

## Knowledge Gaps
- **146 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+141 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `bot.ts` to `App.tsx`, `Game.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `RiverBoard.tsx`, `legacy.ts`, `lesson.ts`?**
  _High betweenness centrality (0.084) - this node is a cross-community bridge._
- **Why does `CardType` connect `App.tsx` to `Game.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `RiverBoard.tsx`, `legacy.ts`, `bot.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `FishType` connect `StatusLine.tsx` to `App.tsx`, `bot.ts`, `Game.ts`, `legacy.ts`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _146 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06438631790744467 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._