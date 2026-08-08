# Graph Report - kingfisher-dive-and-crash  (2026-08-08)

## Corpus Check
- 114 files · ~369,995 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 707 nodes · 1826 edges · 32 communities (27 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `2818e243`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VISUALS.md — Kingfisher: Dive & Crash
- App.tsx
- package.json
- compilerOptions
- StatusLine.tsx
- compilerOptions
- types.ts
- resolution.ts
- WildTracks — Agent Rules
- Progress
- tsconfig.json
- vite-env.d.ts
- ExampleInstrumentedTest.java
- ExampleUnitTest.java
- legacy.ts
- gradlew
- stepFeedback.ts
- lesson.ts
- MainActivity.java
- capacitor.config.ts
- game/types.ts
- OutcomeSplash.tsx
- cutout_kingfisher.py
- fish.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 48 edges
2. `playSfx()` - 37 edges
3. `CardType` - 28 edges
4. `KingfisherID` - 25 edges
5. `spriteScaleStyle()` - 23 edges
6. `Board()` - 22 edges
7. `compilerOptions` - 17 edges
8. `scoreMove()` - 16 edges
9. `openHoverTargets()` - 15 edges
10. `seatKingfisher()` - 15 edges

## Surprising Connections (you probably didn't know these)
- `ensureOnlineBots()` --indirect_call--> `fresh()`  [INFERRED]
  src/lib/onlineBots.ts → _powers_smoke.mts
- `main()` --calls--> `hasPower()`  [EXTRACTED]
  _powers_smoke.mts → src/game/powers.ts
- `fresh()` --calls--> `setup()`  [EXTRACTED]
  _powers_smoke.mts → src/game/Game.ts
- `main()` --calls--> `setup()`  [EXTRACTED]
  _powers_smoke.mts → src/game/Game.ts
- `main()` --calls--> `openHoverTargets()`  [EXTRACTED]
  _powers_smoke.mts → src/game/powers.ts

## Import Cycles
- None detected.

## Communities (32 total, 5 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.08
Nodes (42): App(), BotsMode, Mode, OnlineGame(), OnlineMode, filledCount(), GameLobby(), MatchListItem (+34 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (45): boardgame.io, @capacitor/android, @capacitor/cli, @capacitor/core, koa-static, dependencies, boardgame.io, @capacitor/android (+37 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 5 - "StatusLine.tsx"
Cohesion: 0.07
Nodes (74): CreateBotRoster(), CreateBotRosterProps, CreateGame(), CreateOnline(), SeatKind, GameOver(), maybeRecord(), GatherPanel() (+66 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.07
Nodes (47): beforeHover, ev(), mm(), order, phaseLog, reducer, state, assert() (+39 more)

### Community 8 - "resolution.ts"
Cohesion: 0.15
Nodes (28): bestPlayer(), drawOne(), driftFish(), driftPeeked(), endOfRoundCleanup(), handReset(), nextPlayer(), restock() (+20 more)

### Community 9 - "WildTracks — Agent Rules"
Cohesion: 0.20
Nodes (9): CSS / Styling, Data, File Structure & Size, Game Logic (boardgame.io), graphify, React & Components, Tracking Progress, TypeScript (+1 more)

### Community 10 - "Progress"
Cohesion: 0.20
Nodes (9): Clarified Rules (2026-08-06), Core Types, Implementation Notes, Kingfisher: Dive & Crash — Design & Progress, Progress, Project Structure, Scaffolding, Tech Stack (+1 more)

### Community 15 - "ExampleInstrumentedTest.java"
Cohesion: 0.60
Nodes (3): ExampleInstrumentedTest, Test, RunWith

### Community 17 - "legacy.ts"
Cohesion: 0.09
Nodes (56): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+48 more)

### Community 18 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 19 - "stepFeedback.ts"
Cohesion: 0.06
Nodes (51): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+43 more)

### Community 20 - "lesson.ts"
Cohesion: 0.16
Nodes (19): BoardExtra, actionLesson(), cleanupReviewKey(), lessonFor(), outcomeKinds(), reviewLesson(), stepReviewKey(), BOT (+11 more)

### Community 33 - "game/types.ts"
Cohesion: 0.06
Nodes (47): FishCard(), FishCardBack(), FishIcon(), FishIconProps, Perch(), PerchProps, REACTION_CLASS, PerchOccupant (+39 more)

### Community 34 - "OutcomeSplash.tsx"
Cohesion: 0.08
Nodes (40): Board(), PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, Hand(), HandProps (+32 more)

### Community 37 - "cutout_kingfisher.py"
Cohesion: 0.33
Nodes (9): Image, Path, collect_paths(), content_bbox(), main(), process(), Bounding box of real content, ignoring thin alpha fringe strips.      Generator, Crop to opaque content. Ignores faint alpha noise and thin fringe strips. (+1 more)

### Community 38 - "fish.ts"
Cohesion: 0.25
Nodes (10): buildDeck(), clampZoneCount(), countsTotal(), FISH_COUNTS, FISH_POINTS, FISH_TYPES, FishCounts, fishCountsFor() (+2 more)

## Knowledge Gaps
- **179 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `stepFeedback.ts` to `App.tsx`, `OutcomeSplash.tsx`, `game/types.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `legacy.ts`, `lesson.ts`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `KingfisherID` connect `StatusLine.tsx` to `App.tsx`, `stepFeedback.ts`, `types.ts`, `game/types.ts`?**
  _High betweenness centrality (0.021) - this node is a cross-community bridge._
- **Why does `CardType` connect `OutcomeSplash.tsx` to `game/types.ts`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `legacy.ts`, `stepFeedback.ts`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08145363408521303 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._