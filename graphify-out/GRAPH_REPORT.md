# Graph Report - kingfisher-dive-and-crash  (2026-08-06)

## Corpus Check
- 96 files · ~80,212 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 634 nodes · 1637 edges · 18 communities (16 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bcad238d`
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
- vite-env.d.ts
- legacy.ts
- stepFeedback.ts
- lesson.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 48 edges
2. `CardType` - 28 edges
3. `playSfx()` - 25 edges
4. `Board()` - 22 edges
5. `KingfisherID` - 20 edges
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

## Communities (18 total, 2 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.15
Nodes (16): App(), BotsMode, Mode, OnlineGame(), OnlineMode, TutorialGame(), Props, TutorialIntro() (+8 more)

### Community 2 - "package.json"
Cohesion: 0.05
Nodes (39): boardgame.io, koa-static, dependencies, boardgame.io, koa-static, react, react-dom, devDependencies (+31 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 4 - "presentation.ts"
Cohesion: 0.06
Nodes (47): FishCard(), FishCardBack(), FishIcon(), FishIconProps, Perch(), PerchProps, REACTION_CLASS, PerchOccupant (+39 more)

### Community 5 - "StatusLine.tsx"
Cohesion: 0.06
Nodes (80): CreateGame(), CreateOnline(), SeatKind, filledCount(), GameLobby(), MatchListItem, openSeats(), GameOver() (+72 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.08
Nodes (47): beforeHover, ev(), mm(), order, phaseLog, reducer, state, assert() (+39 more)

### Community 8 - "resolution.ts"
Cohesion: 0.14
Nodes (28): bestPlayer(), drawOne(), driftFish(), driftPeeked(), endOfRoundCleanup(), handReset(), nextPlayer(), restock() (+20 more)

### Community 9 - "WildTracks — Agent Rules"
Cohesion: 0.20
Nodes (9): CSS / Styling, Data, File Structure & Size, Game Logic (boardgame.io), graphify, React & Components, Tracking Progress, TypeScript (+1 more)

### Community 10 - "Progress"
Cohesion: 0.20
Nodes (9): Clarified Rules (2026-08-06), Core Types, Implementation Notes, Kingfisher: Dive & Crash — Design & Progress, Progress, Project Structure, Scaffolding, Tech Stack (+1 more)

### Community 17 - "legacy.ts"
Cohesion: 0.09
Nodes (55): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+47 more)

### Community 19 - "stepFeedback.ts"
Cohesion: 0.05
Nodes (56): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+48 more)

### Community 20 - "lesson.ts"
Cohesion: 0.05
Nodes (59): Board(), BoardExtra, PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, Hand() (+51 more)

## Knowledge Gaps
- **168 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+163 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `stepFeedback.ts` to `presentation.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `legacy.ts`, `lesson.ts`?**
  _High betweenness centrality (0.082) - this node is a cross-community bridge._
- **Why does `CardType` connect `lesson.ts` to `presentation.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `legacy.ts`, `stepFeedback.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `KingfisherID` connect `StatusLine.tsx` to `App.tsx`, `stepFeedback.ts`, `presentation.ts`, `types.ts`?**
  _High betweenness centrality (0.015) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Board()` (e.g. with `BotsGame()` and `OnlineGame()`) actually correct?**
  _`Board()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _168 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.1471861471861472 - nodes in this community are weakly interconnected._