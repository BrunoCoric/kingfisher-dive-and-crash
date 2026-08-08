# Graph Report - kingfisher-dive-and-crash  (2026-08-08)

## Corpus Check
- 117 files · ~372,510 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 741 nodes · 1932 edges · 39 communities (34 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a61c64d7`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- VISUALS.md — Kingfisher: Dive & Crash
- App.tsx
- package.json
- compilerOptions
- ZoneTile.tsx
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
- CardType
- RosterSheet.tsx
- zones.ts
- RiverBoard.tsx
- Perch.tsx
- StatusLine.tsx
- game/types.ts
- WaterPuddleSvg.tsx
- cutout_kingfisher.py
- stepSfx.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 48 edges
2. `playSfx()` - 39 edges
3. `CardType` - 28 edges
4. `KingfisherID` - 25 edges
5. `spriteScaleStyle()` - 23 edges
6. `Board()` - 22 edges
7. `compilerOptions` - 17 edges
8. `scoreMove()` - 16 edges
9. `CreateOnline()` - 15 edges
10. `setup()` - 15 edges

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

## Communities (39 total, 5 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.08
Nodes (43): App(), BotsGame(), BotsMode, Mode, OnlineGame(), OnlineMode, filledCount(), GameLobby() (+35 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (45): boardgame.io, @capacitor/android, @capacitor/cli, @capacitor/core, koa-static, dependencies, boardgame.io, @capacitor/android (+37 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 4 - "ZoneTile.tsx"
Cohesion: 0.22
Nodes (13): RiverBoardProps, ZoneKindBadge(), BADGE_CLASS, DRIFT_CLASS, KIND_CLASS, ZoneTile(), ZoneTileProps, OutcomeCallout (+5 more)

### Community 5 - "StatusLine.tsx"
Cohesion: 0.07
Nodes (76): CreateBotRoster(), CreateBotRosterProps, CreateGame(), CreateOnline(), SeatKind, GameOver(), maybeRecord(), GatherPanel() (+68 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.07
Nodes (53): beforeHover, ev(), mm(), order, phaseLog, reducer, state, assert() (+45 more)

### Community 8 - "resolution.ts"
Cohesion: 0.07
Nodes (46): PRIORITY, Row, ROWS, RulesCheatsheet(), RulesCheatsheetProps, calloutFor(), phaseText(), StatusActor (+38 more)

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
Cohesion: 0.10
Nodes (53): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+45 more)

### Community 18 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 19 - "stepFeedback.ts"
Cohesion: 0.07
Nodes (47): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+39 more)

### Community 20 - "lesson.ts"
Cohesion: 0.12
Nodes (25): TutorialGame(), BoardExtra, Props, TutorialCoach(), actionLesson(), cleanupReviewKey(), lessonFor(), outcomeKinds() (+17 more)

### Community 29 - "CardType"
Cohesion: 0.22
Nodes (11): PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, Hand(), HandProps, CardType (+3 more)

### Community 30 - "RosterSheet.tsx"
Cohesion: 0.27
Nodes (13): Board(), RosterSheet(), statusActionsFor(), statusHintFor(), speciesShort(), OUTCOME_LABEL, playerReactions(), primaryZoneCallout() (+5 more)

### Community 31 - "zones.ts"
Cohesion: 0.24
Nodes (8): FishCard(), FishCardBack(), FishIcon(), FishIconProps, KnownFish, FishType, FISH_LABEL, LifetimeStats

### Community 32 - "RiverBoard.tsx"
Cohesion: 0.18
Nodes (11): RiverBoard(), BankFoliageSvg(), BankFoliageSvgProps, MossTuftSvg(), MossTuftSvgProps, RiverChannelSvg(), adjacentPerches(), openHoverPerches() (+3 more)

### Community 33 - "Perch.tsx"
Cohesion: 0.24
Nodes (8): Perch(), PerchProps, REACTION_CLASS, BranchSvg(), BranchSvgProps, ReedSvg(), ReedSvgProps, Perch

### Community 34 - "StatusLine.tsx"
Cohesion: 0.32
Nodes (5): PerchOccupant, RevealLine(), RosterSheetProps, CalloutKind, selectionDetail()

### Community 35 - "game/types.ts"
Cohesion: 0.23
Nodes (18): hasPower(), blockPlayer(), crashPlayer(), discardOneCard(), EMPTY_OUTCOMES, grantFish(), grantSoloCatch(), pruneSettledLog() (+10 more)

### Community 36 - "WaterPuddleSvg.tsx"
Cohesion: 0.29
Nodes (6): WaterPuddleSvg(), WaterPuddleSvgProps, Bloom, StrokeMark, WashRecipe, WATER_RECIPES

### Community 37 - "cutout_kingfisher.py"
Cohesion: 0.33
Nodes (9): Image, Path, collect_paths(), content_bbox(), main(), process(), Bounding box of real content, ignoring thin alpha fringe strips.      Generator, Crop to opaque content. Ignores faint alpha noise and thin fringe strips. (+1 more)

### Community 38 - "stepSfx.ts"
Cohesion: 0.38
Nodes (6): SfxId, cueStepSfx(), fishSfx(), OUTCOME_ORDER, REVEAL_SFX, revealed()

## Knowledge Gaps
- **186 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+181 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `stepFeedback.ts` to `App.tsx`, `StatusLine.tsx`, `game/types.ts`, `StatusLine.tsx`, `stepSfx.ts`, `types.ts`, `resolution.ts`, `legacy.ts`, `lesson.ts`, `RosterSheet.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **Why does `KingfisherID` connect `StatusLine.tsx` to `RiverBoard.tsx`, `App.tsx`, `ZoneTile.tsx`, `types.ts`, `stepFeedback.ts`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `CardType` connect `CardType` to `StatusLine.tsx`, `game/types.ts`, `ZoneTile.tsx`, `StatusLine.tsx`, `stepSfx.ts`, `types.ts`, `resolution.ts`, `legacy.ts`, `stepFeedback.ts`, `lesson.ts`, `RosterSheet.tsx`, `zones.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _186 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.07924984875983061 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._