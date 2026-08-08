# Graph Report - kingfisher-dive-and-crash  (2026-08-08)

## Corpus Check
- 113 files · ~369,697 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 705 nodes · 1820 edges · 39 communities (34 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `59233897`
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
- ExampleInstrumentedTest.java
- ExampleUnitTest.java
- legacy.ts
- gradlew
- stepFeedback.ts
- lesson.ts
- MainActivity.java
- capacitor.config.ts
- game/types.ts
- ZoneTile.tsx
- OutcomeSplash.tsx
- WaterPuddleSvg.tsx
- game/types.ts
- OutcomeSplash.tsx
- RosterSheet.tsx
- StatusLine.tsx
- cutout_kingfisher.py
- stepSfx.ts

## God Nodes (most connected - your core abstractions)
1. `GameState` - 48 edges
2. `playSfx()` - 35 edges
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
- `main()` --calls--> `openHoverTargets()`  [EXTRACTED]
  _powers_smoke.mts → src/game/powers.ts
- `fresh()` --calls--> `setup()`  [EXTRACTED]
  _powers_smoke.mts → src/game/Game.ts
- `main()` --calls--> `setup()`  [EXTRACTED]
  _powers_smoke.mts → src/game/Game.ts

## Import Cycles
- None detected.

## Communities (39 total, 5 thin omitted)

### Community 0 - "VISUALS.md — Kingfisher: Dive & Crash"
Cohesion: 0.05
Nodes (38): 10. Implementation Notes (CSS Modules), 11. Screens Inventory, 1. Art Direction — "Sunlit Field Guide", 2. Color Palette, 3. Typography, 4. Layout Structure, 5. Card & Component System, 6. The Theatrical Core: Select → Lock → Reveal → Resolve (+30 more)

### Community 1 - "App.tsx"
Cohesion: 0.12
Nodes (23): App(), BotsMode, Mode, OnlineGame(), OnlineMode, MatchWaiting(), Props, TutorialIntro() (+15 more)

### Community 2 - "package.json"
Cohesion: 0.04
Nodes (45): boardgame.io, @capacitor/android, @capacitor/cli, @capacitor/core, koa-static, dependencies, boardgame.io, @capacitor/android (+37 more)

### Community 3 - "compilerOptions"
Cohesion: 0.09
Nodes (22): DOM, DOM.Iterable, ES2022, src, compilerOptions, allowImportingTsExtensions, isolatedModules, jsx (+14 more)

### Community 4 - "presentation.ts"
Cohesion: 0.15
Nodes (18): assert(), fresh(), main(), BotsGame(), TutorialGame(), buildDeck(), clampZoneCount(), countsTotal() (+10 more)

### Community 5 - "StatusLine.tsx"
Cohesion: 0.07
Nodes (82): CreateBotRoster(), CreateBotRosterProps, CreateGame(), CreateOnline(), SeatKind, filledCount(), GameLobby(), MatchListItem (+74 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): ES2023, vite.config.ts, compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection (+10 more)

### Community 7 - "types.ts"
Cohesion: 0.08
Nodes (49): beforeHover, ev(), mm(), order, phaseLog, reducer, state, Board() (+41 more)

### Community 8 - "resolution.ts"
Cohesion: 0.14
Nodes (29): bestPlayer(), drawOne(), driftFish(), driftPeeked(), endOfRoundCleanup(), handReset(), nextPlayer(), restock() (+21 more)

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
Nodes (57): bounceDive(), cardsOf(), exactKeyHelper(), expectedLeft(), freshHand(), oppVictimAt(), playCard(), pOfHeld() (+49 more)

### Community 18 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 19 - "stepFeedback.ts"
Cohesion: 0.06
Nodes (46): avg(), BotKind, main(), makeBot(), newStats(), report(), simulate(), Stats (+38 more)

### Community 20 - "lesson.ts"
Cohesion: 0.13
Nodes (23): BoardExtra, Props, TutorialCoach(), actionLesson(), cleanupReviewKey(), lessonFor(), outcomeKinds(), reviewLesson() (+15 more)

### Community 29 - "game/types.ts"
Cohesion: 0.33
Nodes (7): OutcomeSplash(), prefersReducedMotion(), Props, personalOutcomeSplash(), PersonalSplash, pointsSuffix(), SplashValence

### Community 30 - "ZoneTile.tsx"
Cohesion: 0.21
Nodes (16): RiverBoardProps, BADGE_CLASS, ZoneTile(), ZoneTileProps, OutcomeCallout, RiverZone, SPECIES_SHORT, OUTCOME_LABEL (+8 more)

### Community 31 - "OutcomeSplash.tsx"
Cohesion: 0.36
Nodes (9): countCards(), countFish(), placeOf(), summarizeMatch(), emptyCardCounts(), emptyFishCounts(), emptyOutcomes(), emptyStats() (+1 more)

### Community 32 - "WaterPuddleSvg.tsx"
Cohesion: 0.29
Nodes (6): WaterPuddleSvg(), WaterPuddleSvgProps, Bloom, StrokeMark, WashRecipe, WATER_RECIPES

### Community 33 - "game/types.ts"
Cohesion: 0.14
Nodes (15): Perch(), PerchProps, REACTION_CLASS, PerchOccupant, BankFoliageSvg(), BankFoliageSvgProps, BranchSvg(), BranchSvgProps (+7 more)

### Community 34 - "OutcomeSplash.tsx"
Cohesion: 0.19
Nodes (15): PendingSelection, ActionCard(), ActionCardProps, ActionIcon(), ActionIconProps, Hand(), HandProps, PRIORITY (+7 more)

### Community 35 - "RosterSheet.tsx"
Cohesion: 0.20
Nodes (8): FishCard(), FishCardBack(), FishIcon(), FishIconProps, RevealLine(), RosterSheetProps, FISH_LABEL, selectionDetail()

### Community 36 - "StatusLine.tsx"
Cohesion: 0.60
Nodes (3): adjacentPerches(), openHoverPerches(), PerchLevel

### Community 37 - "cutout_kingfisher.py"
Cohesion: 0.33
Nodes (9): Image, Path, collect_paths(), content_bbox(), main(), process(), Bounding box of real content, ignoring thin alpha fringe strips.      Generator, Crop to opaque content. Ignores faint alpha noise and thin fringe strips. (+1 more)

### Community 38 - "stepSfx.ts"
Cohesion: 0.32
Nodes (7): StepSelection, SfxId, cueStepSfx(), fishSfx(), OUTCOME_ORDER, REVEAL_SFX, revealed()

## Knowledge Gaps
- **179 isolated node(s):** `Stats`, `BotKind`, `Stats`, `state`, `order` (+174 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `GameState` connect `stepFeedback.ts` to `App.tsx`, `RosterSheet.tsx`, `presentation.ts`, `StatusLine.tsx`, `StatusLine.tsx`, `types.ts`, `resolution.ts`, `stepSfx.ts`, `legacy.ts`, `lesson.ts`, `game/types.ts`, `ZoneTile.tsx`, `OutcomeSplash.tsx`?**
  _High betweenness centrality (0.069) - this node is a cross-community bridge._
- **Why does `KingfisherID` connect `StatusLine.tsx` to `App.tsx`, `game/types.ts`, `StatusLine.tsx`, `types.ts`, `stepFeedback.ts`, `ZoneTile.tsx`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `CardType` connect `OutcomeSplash.tsx` to `RosterSheet.tsx`, `StatusLine.tsx`, `StatusLine.tsx`, `stepSfx.ts`, `types.ts`, `resolution.ts`, `legacy.ts`, `lesson.ts`, `ZoneTile.tsx`, `OutcomeSplash.tsx`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **What connects `Stats`, `BotKind`, `Stats` to the rest of the system?**
  _179 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `VISUALS.md — Kingfisher: Dive & Crash` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._