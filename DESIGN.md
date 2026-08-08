# Kingfisher: Dive & Crash — Design & Progress

Single source of truth for implementation status. Refer to `README.md` for the game rules.

## Tech Stack

- Vite + React 18 + TypeScript (strict)
- boardgame.io for turn/move/phase logic
- CSS Modules for component styles; global styles in `src/styles/`
- Shared game types in `src/game/types.ts`
- Nest profile (localStorage) in `src/profile/` — match stats & flock bird unlocks for vs-bots
- Online match server in `server/index.ts` (`npm run server`) — Lobby REST + Socket.IO

## Project Structure

- `src/main.tsx` — React entry point
- `src/App.tsx` — renders the `boardgame.io/react` Client
- `src/Board.tsx` — board view (boardgame.io `BoardProps`)
- `src/game/` — all game logic, separated by concern
  - `types.ts` — shared types/interfaces
  - `cards.ts` — action card data
  - `fish.ts` — fish deck data & builder; zone/deck defaults + create-game overrides
  - `Game.ts` — boardgame.io game config (setup, moves, phases)
  - `reach.ts` — perch reach and adjacent-perch geometry
  - `moves.ts` — validated simultaneous card selection
  - `resolution.ts` — Hover / Splash / Dive / Drop priority resolution
  - `cleanup.ts` — fish drift, restock, hand reset, and winner selection
  - `enumerate.ts` — legal-move enumeration (incl. `skipTurn` fallback)
  - `bot.ts` — smart `KingfisherBot` + re-export of legacy bot
  - `ai/` — belief, fish-drift memory, scoring, softmax select, legacy greedy
  - `kingfishers.ts` — typed species sprite manifest (`spriteScale` for tall art)
  - `powers.ts` — optional per-species soft passives + reach/hover helpers
  - `src/components/` — river board, held hand, scores roster sheet, rules cheatsheet, status line, end-state panels, tutorial coach, lobby / create online / gather / waiting room
  - `src/lib/gameServer.ts` / `matchSession.ts` — Socket/Lobby URL + session credentials
  - `server/index.ts` — boardgame.io Server entry
  - `src/tutorial/` — scripted bot moves, lesson copy, `TutorialBot`
  - `src/TutorialBoard.tsx` — coach + click-gate wrapper for tutorial mode
  - `scene/` — SVG board props (`BranchSvg`, `ReedSvg`, `BankFoliageSvg`, `MossTuftSvg`, `RiverChannelSvg`, `WaterPuddleSvg`)
  - `src/lib/stepFeedback.ts` — pure helpers: zone actions/outcomes, pawn reactions, outcome story
  - `src/lib/personalSplash.ts` — local-seat good/neutral/bad splash valence from outcomeLog + lastReveals
  - `src/lib/sfx.ts` / `src/lib/stepSfx.ts` — Web Audio WAV playback (`public/sounds/`; avoids mobile Now Playing) + once-per-step resolve cues
  - `src/lib/boardChrome.tsx` — status-line hint/action builders for the mobile HUD
  - `src/components/OutcomeSplash.tsx` — personal bird burst overlay (local seat only)
  - `src/profile/` — Nest localStorage profile, unlocks, match summarize
  - `src/content/fieldNotes.ts` — educational species range / habitat / trivia
  - `src/components/Nest.tsx` — start-screen Nest page (flock grid + species sheet + stats)

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
- [x] Create game / Create online: optional water-zone count (4–7) and fish-deck size (scaled mix from the player-count recipe)

### Clarified Rules (2026-08-06)
- Fish deck totals (code `fish.ts` is authoritative): 2p:25, 3p:32, 4p:39, 5p:43.
- River zones default (same file): 2p:4, 3p:5, 4p:6, 5p:7. Create game / Create online can override zones (4–7) and deck size (12–60, ≥ zones); custom totals scale the player-count mix via largest remainder.
- Reach: Zone 1 is most upstream, zone # increases downstream. Low perch = own zone + downstream (or upstream at the end); High perch = own zone + downstream + upstream (using two upstream/downstream at edges).
- Splash, Drop, Dive, Hover effects apply only within the Step they are played.
- Low-perch sightline: automatic, private, at round start; player picks one reachable zone card.
- Hover: Scout (peek anywhere) XOR Relocate (adjacent free perch at lock-in). Hover phase auto-applies declared Relocate in First Player order (taken perch → stay).
- Diving an empty zone (fish caught earlier this round) is illegal and fails.
- Crash/Splash-block: Crash = spent played card + one random extra hand discard; fish stays. Splash-block = Dive spent only; fish stays.
- Pike: discard a Minnow from the scorer’s pile if they have one; Pike itself is discarded (0 VP).
- Demo flow: the four-seat pass-and-play starts with a randomized First Player; players place pawns once in clockwise order, then resolve three simultaneous card steps (4-card hand, one card left unplayed).
- Round length: `STEPS_PER_ROUND = 3` in `cards.ts` — phases are `step1`–`step3` (plus optional `hover1`–`hover3`).

### To Build Next
- [x] Round / Step state machine in boardgame.io phases (3 steps per round)
- [x] Action selection (face-down simultaneous) moves
- [x] Step resolution priority (Hover → Splash → Dive → Drop)
- [x] Crash / splash / drop collision rules
- [x] Crash keeps fish on zone; crashers discard one extra random hand card (all same-action crashes)
- [x] Fish drift downstream + restock at end of round
- [x] Win condition (deck exhausted, highest points wins)
- [x] Perch sightline & reach (peek / dive range) model
- [x] Turn & score panels in `Board.tsx`
- [x] Headless AI bot (`KingfisherBot` in `src/game/bot.ts`) driving every seat
- [x] Bot evaluation harness (`_bot_diag.mts`) for aggregate play-quality stats
- [x] Smart bot stack (`src/game/ai/*`): hand belief, fish memory, risk scoring, near-greedy sampling
- [x] Legacy greedy bot preserved (`LegacyKingfisherBot`) for A/B via `_bot_ab.mts` / `_sim_legacy.mts`
- [x] "Read it on the river" step feedback: zone action chips + outcome badges, pawn reaction CSS, opponent reveals on the player rail, status-line story (`src/lib/stepFeedback.ts`)
- [x] Handcrafted river board diorama: SVG scene pieces (`BranchSvg` / `ReedSvg` / `BankFoliageSvg` / `WaterPuddleSvg` / `MossTuftSvg`), paper-grain tokens, 2.5D row depth, watercolor puddle zones
- [x] Field-guide polish: organic per-zone puddle silhouettes (`waterRecipes.ts`), parchment fish backs, soft sun-glow perch targets (not yellow app buttons), clearer high/low perch elevation, dappled bank light
- [x] River depth polish: softer broken-bloom channel (no hard tube), mid-board moss balance on both banks, per-zone puddle glare/ripples
- [x] Targeting contrast: Splash/Drop/Dive (and Hover peek / sightline) light legal zones with a sun halo + badge and dim out-of-reach / illegal zones so reach is obvious at a glance
- [x] Perch targeting contrast: placement / Hover relocate warm-glow legal perches (no sun badge); non-legal perches dim (replaces the old landing-arrow badge)
- [x] Perch hover reach preview: hovering (or focusing) any perch soft-glows its reachable zones in water-cyan and dims the rest — suppressed while card/sightline/perch targeting is active so it never fights the sun highlights
- [x] Round-start placement clears all birds off perches, then players place in First-Player order (empty → seated makes turn order readable)
- [x] End-of-round fish drift animation: **Next round** plays a short CSS slide downstream (last zone washes off), then `continueRound` applies cleanup; respects `prefers-reduced-motion`
- [x] Phone-first HUD shell: fixed `100dvh` column, slim masthead + on-demand `RosterSheet` (scores / 1st / fish piles), bottom `StatusLine` dock (Your turn focus), bottom-left minimizable held-hand fan (`Hand` / `ActionCard`); river stage scrolls internally
- [x] Turn focus dock: `StatusLine` moved from under masthead to bottom chrome — active sun highlight + Your turn pill; placement waiting shows current bird face + short name
- [x] Scoring piles are public in `playerView` (hands stay private) so the roster can show each bird's fish
- [x] Public fish-deck remaining count (`deckCount`) on the Scores chip; deck faces stay hidden
- [x] Roster round-play strip: `G.roundPlays` accumulates each seat's revealed cards across the 3 steps (cleared in `endOfRoundCleanup`); `RosterSheet` shows Dive/Drop/Splash/Hover icons + empty slots for steps still open
- [x] Bottom-right rules cheatsheet (`RulesCheatsheet`): tap `? Rules` for priority order + crash / splash / steal interactions
- [x] Personal outcome splash (local seat only): `OutcomeSplash` + `personalSplash.ts` — slower bird burst on catch / steal / crash only; river feedback remains shared truth (VISUALS §6 Step 4b)
- [x] Scripted interactive tutorial: Start Screen **Tutorial** → one core-loop primer slide then 3-seat sandbox (`tutorial: true` setup, `TutorialBot` seats 1–2, gated `TutorialBoard` + coach). Human only taps highlighted targets; opponents play a fixed script across 2 rounds covering place/peek, solo Dive catch, Hover scout, Splash block, Drop steal, and Dive Crash. Smoke: `npx tsx _tutorial_smoke.mts`.
- [x] Tutorial intro uses the same menu chrome back pill (`← Back`) as Nest / lobby / create; slide nav uses Previous / Next
- [x] SFX pack wired (`public/sounds/*.wav` via Web Audio API): card select/lock, peek, step resolve + all four card reveals, outcome kinds (catch/crash/steal/blocked/pike), fish-value flavors, personal splash good/bad, bird perch hops, fish drift → restock → round start, game win/lose, Nest (`nest_open` / `field_note` / `tab_switch` / `unlock`), looping ambience from main menu (unlocked on first menu click, kept across Main menu returns). Skips when `prefers-reduced-motion`. Web Audio avoids iOS/Android treating ambience as Now Playing / Control Center media.
- [x] Nest profile (localStorage): `src/profile/` types + store + unlocks + match summarize; vs-bots only
- [x] Match-long tallies on `G`: `matchPlays` / `matchOutcomes` (append in `resolveStep`, never cleared mid-game)
- [x] GameOver records Nest once (`recordMatchOnce`) and shows newly unlocked badges; CTA is **Main menu** (returns to Start Screen — in-client rematch stalled vs Local bots)
- [x] Start Screen main menu: **Play** / **Nest** / **Tutorial** (`card_select` on click); no Pass & Play
- [x] Play → **Game lobby** → **Create online** (Lobby API) or **Play vs bots** → Create game (bird pick + bot slots)
- [x] Menu / lobby / create: clean title (brand + flock + pill CTAs); lobby/create bank-sand panels
- [x] Start Screen CTA hierarchy: flame-orange primary **Play** (larger), nest/egg glyph on Nest, darker plaque hints, centered cluster + reed/ripple ambience on the water bank
- [x] Start Screen **Nest** page: flock grid + species field-guide sheet (trivia always readable), lifetime stats, recent matches; search / All·Unlocked·Locked filters
- [x] Optional Species Powers (`src/game/powers.ts`): one soft passive per bird; Create game toggle (default on); tutorial forced off; Rules sheet lists them when active
- [x] Nest flock unlocks: Common always free; Pied / Oriental Dwarf / Belted / Azure / Yellow-billed / Banded / Green / Laughing Kookaburra via vs-bots missions; Create game gates human bird pick; vs-bots Create game also assigns bot birds (`speciesBySeat`); `G.speciesBySeat` decouples seat from species
- [x] Species field notes (`src/content/fieldNotes.ts`): scientific name, range, habitat, 2–3 trivia lines per bird — unlocks gate play, not reading
- [x] App favicon: Common Kingfisher mark (`public/favicon.svg` + PNG fallbacks / apple-touch)
- [x] Online multiplayer: `npm run server` (boardgame.io Server + Socket.IO, default `:8000`); Lobby create/list/join; SocketIO client with credentials; waiting room until seats filled; host can fill seats with bots (driven on the host client)
- [x] Online **gather** phase: each seat picks bird (`setSpecies`) + Ready (`setReady`) before placement; Nest unlocks still client-gated; local/bots/tutorial skip gather

### Implementation Notes
- **Local vs-bots** remains Create game (2–5 seats, `Local({ bots })`). Pass-and-play stays off the Start Screen. **River table** options: water zones + fish deck size (defaults from player count; changing seat count resets both). Tap a bot row to pick its species (distinct from you and other bots; Nest unlocks gate only the human bird).
- **Online tables:** Play → lobby → Create online (bird pick + bot/open seats, like vs-bots) or Refresh/join. Same river-table overrides in `setupData`. Requires `npm run server` (`PORT` / `VITE_GAME_SERVER`). Host claims bot seats via Lobby join and drives them with headless SocketIO `KingfisherBot` clients (`src/lib/onlineBots.ts`). Open seats wait for humans. Nest records only when `humanSeats.length === 1` (host + bots only).
- **Share over the internet (local tunnel):** `npm run share` serves the built UI + game server on one port (default `8000`). In a second terminal, `npm run tunnel` (Cloudflare quick tunnel; needs `cloudflared`). Friends open the printed `https://….trycloudflare.com` URL — same-origin, no `VITE_GAME_SERVER`. Keep your machine awake; matches are in-memory. If port 8000 is busy: `PORT=8002 npm run share` and `cloudflared tunnel --url http://localhost:8002`.
- **Hidden info:** `filterPlayerView` keeps hands, pending selections, peeks, and deck faces private; master state lives on the server for SocketIO matches. Online clients run with `debug: false`. Hand UI only reads the local seat’s hand.
- **Gather phase:** `G.online` from setupData; starts as `gather` then → `placement`. Offline paths auto-`endPhase` in gather `onBegin`.
- **Species Powers (optional):** `G.speciesPowers` from setup. Same 4-card deck & crash principle; helpers in `powers.ts` (`playerReach`, `openHoverTargets`, `canSightline`, `hasPower`). Common skips crash extra discard; Pied 2-hop Hover; Dwarf high sightline; Belted low→high reach; Azure first Pike skips Minnow tax (`pikeShieldUsed`); Yellow-billed solo Splash peeks that zone (`sunBill`); Banded blocked Dive peeks that zone (`barredWatch`); Green Crash peeks that zone (`speckledWing`); Kookaburra blocked Dive returns Dive to hand (`heartyDive`). Smoke: `npx tsx _powers_smoke.mts`.
- **Tutorial mode:** Opens with one primer slide (`src/tutorial/intro.ts` / `TutorialIntro`) — goal + the Dive / Splash / Drop / Crash spine — then the Local client mounts. `setup(..., { humanSeats: ['0'], tutorial: true })` deals a fixed river/deck and First Player `0`. Round 1 teaches catch + scout; round 2 teaches Splash block, Drop steal, and Dive Crash. Lessons derive from phase/round/outcomes (`src/tutorial/lesson.ts`); review beats use Got it before unlocking the next gate. Edge cases (Pike, Drop+Drop) stay in the Rules cheatsheet.
- The opening placement phase randomizes the First Player, then lets each player choose one unoccupied perch in clockwise order before the first simultaneous card step.
- Crash never discards the zone’s fish (Splash+Splash, Dive+Dive, Drop+Drop). Crashers spend the played card and discard one extra random hand card. Solo Dive grant is deferred until after Drops so a Drop+Drop Crash can return the fish to the zone.
- Splash blocks Dives only (blocked = Dive spent; fish stays). Drop steals only from a successful solo Dive — Splash-blocked / crashed Dive → Drop does nothing. Drops Crash when 2+ share a zone (even if the Dive failed).
- Pike catches discard the Pike and a Minnow from the scorer’s pile if one exists (otherwise no scored fish is lost).
- Hover Scout XOR Relocate: `selectCard` locks either `peek` or `moveTo` (never both). Empty Hover only when neither Scout nor Relocate targets exist. Hover phase auto-applies `moveTo` if still free.
- Low-perch sightline is now live during placement: after `placePawn` on a low perch the turn stays open (guarded by `maxMoves: 2`), the player picks a reachable zone with the `peekSightline` move, and the chosen card flips face-up in the tile until the turn ends. The peeked zone is stored in `G.sightlinePeek`.
- Placement every round: `cleanup` → `placement`. `placement.onBegin` clears every `player.perch` (and `locked`) so the river starts empty; First Player then clockwise each place onto any free perch. Low branch still peeks via `peekSightline` (`maxMoves: 2`). Roster “ready” during placement = `perch !== ''`, so who already sat down vs who still waits is obvious.
- Round transition pauses in `cleanup` so step-3 chips / outcomes stay on the river until someone taps **Next round** (`continueRound`). Vs-bots passes `humanSeats` in setup so Local bots are not active during the review (they would otherwise auto-advance in ~100ms). Headless sims leave `humanSeats` empty → anyone may advance. `endOfRoundCleanup` runs in phase `onEnd` before `next: 'placement'`.
- Headless validation lives in `_bot_sim.mts`: it drives every seat with `KingfisherBot` through the reducer and asserts a non-null winner. `npm run build && npx tsx _bot_sim.mts` should print `_ok (12/12)` across 2–5 players.
- **Legacy bot** (`LegacyKingfisherBot` in `src/game/ai/legacy.ts`): pure argmax over a one-ply heuristic. Per-(bot, zone) `hashOffset` diversifies blind Dive targets so mirror matches rarely crash. No hand tracking, no fish memory, fully predictable once you know the hash.
- **Smart bot** (`KingfisherBot` in `src/game/bot.ts` + `src/game/ai/`):
  - `belief.ts` — exact distribution over each opponent's remaining hand (plays, Dive bounce). Uses a separate `beliefRound` from fish-drift's `lastRound` so round reset isn't skipped.
  - `memory.ts` — remembers peeked fish and drifts them +1 zone each round.
  - `values.ts` / `risk.ts` / `scoring.ts` — zone EV, belief-scaled collision/Drop probs (opponents scored from *their* info set, not our peeks), Splash-Splash penalty, score-aware `riskFactor`. Placement / Hover use `contestedPerchValue`: own reach EV plus `denyWeight`×exclusive-lane deny (lonely fish corridors weighted ~1.8×) so later placers invade a claimed bank instead of opening free pickings elsewhere.
  - `select.ts` — near-greedy softmax over a tight best-score band (wide temperature was re-colliding bots with the same info).
  - Still plays only on filtered `playerView` (no hidden-info leaks).
- **3-step retune:** With `STEPS_PER_ROUND = 3`, each card is ~⅓ of the round. Weights cut Hover/Drop/Splash vs Dive; Hover uses `stepsLeft / STEPS_PER_ROUND` decay plus an action-tax so it is sometimes the unplayed leftover (was stuck at ~33%). Dive gets a late-round push only on low-risk lanes. `individualDiveProb` scales by cards-left vs steps-left so leftover-card Dive risk isn't overstated. Mixed A/B still favors smart; all-smart crash/catch ≈ 0.2 / 0.7 / 0.9 at 2p/3p/4p.
- **Contest retune:** `denyWeight` 0.25→0.7, `repositionWeight` 0.3→0.45; `denyValue` scales by how exclusive a zone already is (1 bird ≫ crowded). Fixes bots herding mid-river while a human farms one side alone.
- Enumerate fix: a seat with no legal card must emit `skipTurn` (not bare `endStage`), or simultaneous steps stall with `activePlayers: null` and a missing selection.
- Outcome log is cleared at the start of `resolveStep`, not on the first `selectCard` of the next step — otherwise later seats never see crashes/steals for belief updates. UI feedback (status story, zone badges, pawn reactions, roster reveals) stays visible through the following selection phase via the same `outcomeLog` / `lastReveals` window. `resolveStep` also snapshots `G.selections` into `G.lastReveals` so chips match the step that just resolved, and appends each seat's card into `G.roundPlays` for the roster history strip. After step 3, the `cleanup` review beat keeps that window until `continueRound`; only then does `endOfRoundCleanup` clear it (including `roundPlays`), drift/restock fish, and reset hands (bot belief round-resets cleanly).
- **Nest:** Finished vs-bots matches (`humanSeats.length === 1`, not tutorial) write into `localStorage` key `kingfisher-nest-v1` via `recordMatchOnce` on GameOver. `G.matchPlays` / `G.matchOutcomes` accumulate for the whole match; fish types come from the human seat’s final `scored` pile. Flock unlocks (playable birds): Common always free; Pied = win a match; Oriental Dwarf = keep a Trout; Belted = crash ≥3 and finish top two; Azure = five matches; Yellow-billed = steal ≥1 with Drop; Banded = get blocked ≥1 by Splash; Green = keep a Perch; Laughing Kookaburra = play all four action cards in one match. Start Screen **Nest** is a full page (not a modal): Flock tab is a searchable/filterable sprite grid; tapping a bird opens a species sheet with field notes (`src/content/fieldNotes.ts` — range, habitat, trivia) plus river power + unlock mission. Locked birds stay silhouettes in the grid but field notes are fully readable. Lifetime / Matches tabs keep profile stats. Create game only offers unlocked birds. `G.speciesBySeat` (from `humanSpecies` setup) maps seats → species so the human can play any unlocked bird regardless of seat index. Legacy badge ids migrate on load.
- [x] End-of-round review beat: `cleanup` waits for **Next round** in the bottom status dock (`continueRound`); river chips stay up; vs-bots holds on the human seat so bots don’t auto-skip
- Hover zone chips need the peek *zone* in public `lastReveals`. `playerView` no longer strips `peek` from revealed selections — only the fish face stays private (via `peeked` / zone filtering). Pending `selections` remain seat-private until resolve.
- A/B harness: `npx tsx _bot_ab.mts` (all-smart / all-legacy / mixed). Probe: `npx tsx _bot_probe.mts`. Diag: `npx tsx _bot_diag.mts`. Against legacy, smart typically wins mixed seats; all-smart mirror still crashes more than all-legacy because legacy's hash argmax is a near-perfect anti-collision coordination device.
