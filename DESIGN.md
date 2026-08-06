# Kingfisher: Dive & Crash — Design & Progress

Single source of truth for implementation status. Refer to `README.md` for the game rules.

## Tech Stack

- Vite + React 18 + TypeScript (strict)
- boardgame.io for turn/move/phase logic
- CSS Modules for component styles; global styles in `src/styles/`
- Shared game types in `src/game/types.ts`

## Project Structure

- `src/main.tsx` — React entry point
- `src/App.tsx` — renders the `boardgame.io/react` Client
- `src/Board.tsx` — board view (boardgame.io `BoardProps`)
- `src/game/` — all game logic, separated by concern
  - `types.ts` — shared types/interfaces
  - `cards.ts` — action card data
  - `fish.ts` — fish deck data & builder
  - `Game.ts` — boardgame.io game config (setup, moves, phases)
  - `reach.ts` — perch reach and adjacent-perch geometry
  - `moves.ts` — validated simultaneous card selection
  - `resolution.ts` — Hover / Splash / Dive / Drop priority resolution
  - `cleanup.ts` — fish drift, restock, hand reset, and winner selection
  - `enumerate.ts` — legal-move enumeration (incl. `skipTurn` fallback)
  - `bot.ts` — smart `KingfisherBot` + re-export of legacy bot
  - `ai/` — belief, fish-drift memory, scoring, softmax select, legacy greedy
  - `kingfishers.ts` — typed species sprite manifest
  - `src/components/` — river board, held hand, scores roster sheet, rules cheatsheet, status line, end-state panels
  - `scene/` — SVG board props (`BranchSvg`, `ReedSvg`, `BankFoliageSvg`, `WaterPuddleSvg`)
- `src/lib/stepFeedback.ts` — pure helpers: zone actions/outcomes, pawn reactions, outcome story
- `src/lib/personalSplash.ts` — local-seat good/neutral/bad splash valence from outcomeLog + lastReveals
- `src/lib/boardChrome.tsx` — status-line hint/action builders for the mobile HUD
- `src/components/OutcomeSplash.tsx` — personal bird burst overlay (local seat only)

## Progress

### Scaffolding
- [x] Vite + React + TS project scaffolded
- [x] boardgame installed and wired (`src/game/Game.ts` + `src/App.tsx`)
- [x] Global styles scaffolding (`src/styles/global.css`)
- [x] Build / typecheck passing (`npm run build`)
- [x] Dev server verified (`npm run dev` → :5173)

### Core Types
- [x] `GameState`, `RiverZone`, `Perch`, `PlayerState` in `types.ts`
- [x] Card data in `cards.ts` (Dive / Drop / Splash / Hover)
- [x] Fish deck builder in `fish.ts` (per player count)

### Clarified Rules (2026-08-06)
- Fish deck totals (code `fish.ts` is authoritative): 2p:27, 3p:34, 4p:42, 5p:46.
- Reach: Zone 1 is most upstream, zone # increases downstream. Low perch = own zone + downstream (or upstream at the end); High perch = own zone + downstream + upstream (using two upstream/downstream at edges).
- Splash, Drop, Dive, Hover effects apply only within the Step they are played.
- Low-perch sightline: automatic, private, at round start; player picks one reachable zone card.
- Hover repositioning order: First Player first, then clockwise.
- Diving an empty zone (fish caught earlier this round) is illegal and fails.
- Crash/Splash penalty: played card spent + discard 1 additional card from hand.
- Demo flow: the four-seat pass-and-play starts with a randomized First Player; players place pawns once in clockwise order, then resolve three simultaneous card steps (4-card hand, one card left unplayed).
- Round length: `STEPS_PER_ROUND = 3` in `cards.ts` — phases are `step1`–`step3` (plus optional `hover1`–`hover3`).

### To Build Next
- [x] Round / Step state machine in boardgame.io phases (3 steps per round)
- [x] Action selection (face-down simultaneous) moves
- [x] Step resolution priority (Hover → Splash → Dive → Drop)
- [x] Crash / splash / drop collision rules
- [x] Fish drift downstream + restock at end of round
- [x] Win condition (deck exhausted, highest points wins)
- [x] Perch sightline & reach (peek / dive range) model
- [x] Turn & score panels in `Board.tsx`
- [x] Headless AI bot (`KingfisherBot` in `src/game/bot.ts`) driving every seat
- [x] Bot evaluation harness (`_bot_diag.mts`) for aggregate play-quality stats
- [x] Smart bot stack (`src/game/ai/*`): hand belief, fish memory, risk scoring, near-greedy sampling
- [x] Legacy greedy bot preserved (`LegacyKingfisherBot`) for A/B via `_bot_ab.mts` / `_sim_legacy.mts`
- [x] "Read it on the river" step feedback: zone action chips + outcome badges, pawn reaction CSS, opponent reveals on the player rail, status-line story (`src/lib/stepFeedback.ts`)
- [x] Handcrafted river board diorama: SVG scene pieces (`BranchSvg` / `ReedSvg` / `BankFoliageSvg` / `WaterPuddleSvg`), paper-grain tokens, 2.5D row depth, watercolor puddle zones
- [x] Field-guide polish: organic per-zone puddle silhouettes (`waterRecipes.ts`), parchment fish backs, soft sun-glow perch targets (not yellow app buttons), clearer high/low perch elevation, dappled bank light
- [x] End-of-round fish drift animation: **Next round** plays a short CSS slide downstream (last zone washes off), then `continueRound` applies cleanup; respects `prefers-reduced-motion`
- [x] Phone-first HUD shell: fixed `100dvh` column, slim masthead + on-demand `RosterSheet` (scores / 1st / fish piles), `StatusLine`, bottom-left minimizable held-hand fan (`Hand` / `ActionCard`); river stage scrolls internally
- [x] Scoring piles are public in `playerView` (hands stay private) so the roster can show each bird's fish
- [x] Public fish-deck remaining count (`deckCount`) on the Scores chip; deck faces stay hidden
- [x] Bottom-right rules cheatsheet (`RulesCheatsheet`): tap `? Rules` for priority order + crash / splash / steal interactions
- [x] Personal outcome splash (local seat only): `OutcomeSplash` + `personalSplash.ts` — slower bird burst on catch / steal / crash only; river feedback remains shared truth (VISUALS §6 Step 4b)

### Implementation Notes
- The local browser build is a four-seat pass-and-play: one shared boardgame.io `Local` client switches between Player 0 through Player 3 with the seat control. Hidden-information secrecy is intentionally deferred, as recorded in the implementation plan.
- The opening placement phase randomizes the First Player, then lets each player choose one unoccupied perch in clockwise order before the first simultaneous card step.
- Crash always discards the zone’s fish (Splash+Splash, Dive+Dive, Drop+Drop). Solo Dive grant is deferred until after Drops so a Drop+Drop Crash never briefly awards the catch.
- Splash blocks Dives only (blocked = discard penalty). Drop steals only from a successful solo Dive — Splash-blocked / crashed Dive → Drop does nothing. Drops Crash when 2+ share a zone (even if the Dive failed).
- Pike catches discard the Pike and automatically return the lowest previously scored fish, if one exists. This makes the hazard deterministic without adding a second decision prompt.
- Hover peek: select Hover, tap one face-down fish zone — that immediately locks the card and adds the zone to `G.peeked` (no second confirm, no switching). Empty / already-seen zones are not targets; if none remain, **Skip peek** locks Hover with no peek. Reposition still happens afterward in the hover phase; if no adjacent perch is free, the turn auto-stays.
- Low-perch sightline is now live during placement: after `placePawn` on a low perch the turn stays open (guarded by `maxMoves: 2`), the player picks a reachable zone with the `peekSightline` move, and the chosen card flips face-up in the tile until the turn ends. The peeked zone is stored in `G.sightlinePeek`.
- Repositioning happens every round, not just at game start: the `cleanup` phase routes `next: 'placement'`, so each round begins with a placement-style turn (clockwosise from First Player) where a player moves their pawn to any unoccupied perch — or explicitly stays — and, if on a low branch, peeks one reachable zone. `placePawn` now allows moving an already-placed pawn (guarded by `G.locked` so each player repositions once per round), and the low-branch peek flow still runs because `cleanup` resets `G.sightlinePeek`/`G.peeked` before the phase.
- Round transition pauses in `cleanup` so step-3 chips / outcomes stay on the river until someone taps **Next round** (`continueRound`). Vs-bots passes `humanSeats` in setup so Local bots are not active during the review (they would otherwise auto-advance in ~100ms). Headless sims / pass-and-play leave `humanSeats` empty → anyone may advance. `endOfRoundCleanup` runs in phase `onEnd` before `next: 'placement'`.
- Headless validation lives in `_bot_sim.mts`: it drives every seat with `KingfisherBot` through the reducer and asserts a non-null winner. `npm run build && npx tsx _bot_sim.mts` should print `_ok (12/12)` across 2–5 players.
- **Legacy bot** (`LegacyKingfisherBot` in `src/game/ai/legacy.ts`): pure argmax over a one-ply heuristic. Per-(bot, zone) `hashOffset` diversifies blind Dive targets so mirror matches rarely crash. No hand tracking, no fish memory, fully predictable once you know the hash.
- **Smart bot** (`KingfisherBot` in `src/game/bot.ts` + `src/game/ai/`):
  - `belief.ts` — exact distribution over each opponent's remaining hand (plays, crash discards, Dive bounce). Uses a separate `beliefRound` from fish-drift's `lastRound` so round reset isn't skipped.
  - `memory.ts` — remembers peeked fish and drifts them +1 zone each round.
  - `values.ts` / `risk.ts` / `scoring.ts` — zone EV, belief-scaled collision/Drop probs (opponents scored from *their* info set, not our peeks), Splash-Splash penalty, score-aware `riskFactor`.
  - `select.ts` — near-greedy softmax over a tight best-score band (wide temperature was re-colliding bots with the same info).
  - Still plays only on filtered `playerView` (no hidden-info leaks).
- **3-step retune:** With `STEPS_PER_ROUND = 3`, each card is ~⅓ of the round. Weights cut Hover/Drop/Splash vs Dive; Hover uses `stepsLeft / STEPS_PER_ROUND` decay plus an action-tax so it is sometimes the unplayed leftover (was stuck at ~33%). Dive gets a late-round push only on low-risk lanes. `individualDiveProb` scales by cards-left vs steps-left so leftover-card Dive risk isn't overstated. Mixed A/B still favors smart; all-smart crash/catch ≈ 0.2 / 0.7 / 0.9 at 2p/3p/4p.
- Enumerate fix: a seat with no legal card must emit `skipTurn` (not bare `endStage`), or simultaneous steps stall with `activePlayers: null` and a missing selection.
- Outcome log is cleared at the start of `resolveStep`, not on the first `selectCard` of the next step — otherwise later seats never see crashes/steals for belief updates. UI feedback (status story, zone badges, pawn reactions, roster reveals) stays visible through the following selection phase via the same `outcomeLog` / `lastReveals` window. `resolveStep` also snapshots `G.selections` into `G.lastReveals` so chips match the step that just resolved. After step 3, the `cleanup` review beat keeps that window until `continueRound`; only then does `endOfRoundCleanup` clear it, drift/restock fish, and reset hands (bot belief round-resets cleanly).
- [x] End-of-round review beat: `cleanup` waits for **Next round** in the status line (`continueRound`); river chips stay up; vs-bots holds on the human seat so bots don’t auto-skip
- Hover zone chips need the peek *zone* in public `lastReveals`. `playerView` no longer strips `peek` from revealed selections — only the fish face stays private (via `peeked` / zone filtering). Pending `selections` remain seat-private until resolve.
- A/B harness: `npx tsx _bot_ab.mts` (all-smart / all-legacy / mixed). Probe: `npx tsx _bot_probe.mts`. Diag: `npx tsx _bot_diag.mts`. Against legacy, smart typically wins mixed seats; all-smart mirror still crashes more than all-legacy because legacy's hash argmax is a near-perfect anti-collision coordination device.
