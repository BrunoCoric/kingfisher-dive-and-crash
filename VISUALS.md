# VISUALS.md — Kingfisher: Dive & Crash

Visual & UX design reference for the digital implementation.
This doc is the source of truth for how the game *looks and feels*; game rules live in `README.md`.

**Stack:** React + boardgame.io + Vite. CSS Modules (`*.module.css`) per component; global styles in `src/styles/`. No UI library — custom-styled from scratch.

---

## 1. Art Direction — "Sunlit Field Guide"

The game is **simultaneous-selection + bluffing** with a strong spatial layer. The UI has two jobs:

1. Make the **hidden → reveal moment theatrical** (this is the soul of the game).
2. Make **collision & priority resolution readable at a glance** (3+ players resolving at once is chaos without clear surfacing).

Style: a **hand-painted, airy naturalist** look — a storybook field guide to a sunny river valley.

- **Warm and bright**, never murky or dark-tech.
- Depth via light — glare on water, dappled sun through leaves, ripples — not via darkness.
- Whimsical but legible; every visual choice serves playability first.

### Reference Moodboard
- *Wingspan* — painterly calm nature, layered valleys.
- *Root* — whimsical woodcut charm, rounded organic shapes.
- *Everdell* / *Flamecraft* — soft rounded UI, storybook warmth.

---

## 2. Color Palette

### Water / River (cool base)
| Name | Hex | Usage |
|---|---|---|
| Deep Water | `#1E6E8C` | river zone fill base |
| River Cyan | `#2FA3C8` | zone gradient mid |
| Shallow Foam | `#BFE7F0` | ripple highlights, zone borders |
| Glare White | `#E8F7FB` | specular gleams, ghost states |

### Banks / Nature (warm mid)
| Name | Hex | Usage |
|---|---|---|
| Sand Bank | `#E9D3A3` | bank background |
| Reed Amber | `#C98F3E` | low perch accents, foliage |
| Leaf Green | `#4C7A3D` | foliage, high perch accents |
| Deep Forest | `#2E4B2A` | borders, branch silhouettes |

### Card / UI Surfaces
| Name | Hex | Usage |
|---|---|---|
| Parchment | `#FAF3E3` | cards, panels, modals |
| Ink | `#2B2420` | text, icons (warm dark brown-black) |
| Soft Shadow | `rgba(43,36,32,0.18)` | card elevation drops |

### Player Colors (high contrast, pop on the board)
| Player | Hex | Notes |
|---|---|---|
| Kingfisher Blue | `#2B5FBF` | vivid royal blue |
| Flame Orange | `#E8732A` | warm, energetic |
| River Teal | `#1FA08C` | distinct from water via depth/value |
| Leaf Green | `#5FA84B` | distinct from foliage via value |

> Player colors must be distinguishable from each other AND from the board. Never tint the water zone in a player's color.

### Status Colors
- **Success / catch:** `#3E9C50` (leaf green)
- **Crash / loss:** `#C93A3A` (brick red)
- **Hazard (Splash):** `#7A5BA6` (storm purple) — distinct from all players
- **Highlight / focus:** `#F2C14E` (sun yellow) — legal targets, hover

---

## 3. Typography

Two-face system:

- **Display (headlines, big numbers):** a rounded, whimsical, slightly woodcut-flavored font — e.g. *Fredoka*, *Baloo 2*, or *Kalam*. Used for game title, phase banners, "CRASH!" callouts, fish point values.
- **Body / UI:** a clean humanist sans — e.g. *Nunito Sans*, *Inter*, or *Mulish*. Used for rules text, buttons, labels, everything operational.

Guidelines:
- Fish point values should be **huge** (display font, near 2× card icon size) — push-your-luck tension lives in the numbers.
- Titles caps or sentence-case; avoid all-caps shouting except on crash/banner callouts.
- Minimum interactive text size 14px; never below 12px.

---

## 4. Layout Structure

### Mobile-first shell (primary target)

Phone is the design target. The board lives in a **fixed viewport shell** (`100dvh`, `overflow: hidden`). Slim chrome stays pinned; the river may scroll internally.

```
┌────────────────────────────────────────────┐  100dvh
│  Logo · [Scores flock] · Round/Step        │  slim masthead
│  Status line (phase / hint / outcome)      │
├────────────────────────────────────────────┤
│                                            │
│            RIVER BOARD (scroll ok)         │
│            flows downstream ↓              │
│  ┌ hand ┐                                  │
│  │ fan  │                                  │
└────────────────────────────────────────────┘
```

**Budget rules**
- Players are **not** always on screen. A compact **Scores** flock chip opens a parchment **roster sheet** (scores, first-player token, ready state, last reveal). Tap a bird to expand their public fish pile.
- Your action cards are a **held hand overlay** in the **bottom-left** of the river stage (fanned parchment cards). They float over the board — they do not take a permanent full-width strip.
- The hand can be **minimized** to a small pill (selected/locked action + count) so the river is fully readable; expand again to pick a card.
- Play flow: tap a card → tap a legal zone → committed. Tap the same card again to cancel. Hover: tap one face-down zone to peek and lock immediately (Skip peek only if none remain).
- Phase / targeting / outcome share **one status line**.
- River stage scrolls vertically when zones need space; page chrome stays pinned.

### Desktop
Same composition in a centered column (`max-width ≈ 34rem`). Side gutters show the valley background; no multi-column dashboard.

### The River Board (center stage)
Vertical flow, **top = upstream (Zone 1) → bottom = downstream (Zone 5)**. A small down-arrow chip in the board’s top-right marks flow direction (no separate upstream/downstream word labels).

```
  Zone 1 ────────────────────────────┐
  Zone 2 ── zones are wide water tiles│  each zone: rounded wobbly water shape
  Zone 3 ── flanked by 2 perches     │
  Zone 4 ── (one per bank side)      │
  Zone 5 ── [Downstream] ────────────┘
```

- **Water zones:** soft watercolor puddles — layered translucent blue washes, pigment bloom dots, deckled paper-edge halo (not glossy foam glass). Each zone has a unique silhouette. Fish cards sit on a soft pigment pool shadow.
- **Perches:** left bank + right bank at each zone. **Low perches** drawn at waterline (reeds/low branch, near-surface); **high perches** elevated above the bank (tall branch/overhang). Visual height difference reinforces the adjacency rule.
- **Board scene pieces:** reusable inline SVGs in `src/components/scene/` — `BranchSvg` (high perch limb + leaves), `ReedSvg` (reed clump on sand mound), `BankFoliageSvg` (corner meadow/sand shelves). Depth is faked with CSS: paper-grain overlay, richer river spine, and slight downstream row scale/shadow — not CSS 3D perspective on interactive tiles.
- **Fish cards:** mini-cards sitting *on* the water tile. Face-down = back design (fish silhouette + color-coded edge tint). Face-up = fish art, big point number. Light parchment grain + drop shadow so they read as physical tokens.
- **Pawns:** kingfisher markers on perches. **Flat 2D sprite pawns** (side-view, painted art) — no 3D models. Depth is faked (2.5D), not rendered:
  - **Elevation = distance.** A pawn's vertical position + scale on its perch expresses bank height: low perch = a smaller pawn near the waterline; high perch = a slightly larger pawn lifted above the bank edge. Perch height then self-explains the low/high reach rule.
  - **Diving = motion, not model:** on a dive, the pawn darts in a quick downward arc while gently scaling up (moves *toward* the water/viewer), then the grab flashes on the fish. Sells the plunge without a third dimension.
  - **Grounded presence via shadow:** each pawn carries a soft blurred drop-shadow that stays anchored on the perch even as the sprite lifts — sells a solid 3D table presence for free.
  - Idle: subtle bob (3s loop); hover move glides along an arc from perch to perch.

### Pawn Species (5 playable kingfishers)
Five real species, one per player slot (the game supports up to 5 players — each player picks a distinct species). Each has a **natural-feather palette**, a **defining mark**, and a **UI accent slot** used for the avatar border / score row / locked-card edge. All sprites share one **side-profile pose + baseline**, differing only in plumage color & small build cues.

| # | Species | Natural palette | Defining mark | UI accent |
|---|---|---|---|---|
| 1 | **Common Kingfisher** | deep royal blue back, orange underparts | long orange beak, cyan crown streak | `#2B5FBF` royal blue |
| 2 | **Pied Kingfisher** | black & white monochrome, tufted head | dramatic black crest | `#3A3A3A` charcoal |
| 3 | **Oriental Dwarf Kingfisher** | tiny; purple-blue back, white collar | egg-yolk orange crown cap | `#E8732A` flame orange |
| 4 | **Belted Kingfisher** | slate blue-grey, bushy head crest | thick grey-blue chest belt | `#1FA08C` river teal |
| 5 | **Azure Kingfisher** | iridescent azure blue | tiny size, bright azure + white | `#2E9FD6` azure blue |

Guidelines:
- Palette hexes are **not rigid** — the painted sprite's natural colors are the star; the UI accent only needs to be recognizable against board greens/water blues.
- Keep the **white throat/chest patch** on every species (shared silhouette anchor so all five read as the same bird "family").
- All five crop to the same baseline so elevation scale behaves identically on the perch.
- Species names appear next to avatars in the HUD and briefly on the setup/lobby picker (footnote tooltip with a fun fact, optional).

### Scores roster (on demand)
- Masthead holds a **Scores** flock chip (fish-deck count + stacked avatars + ready count + 1st marker). Opens a bottom parchment sheet: every bird, score, first-player badge, ready/reveal.
- Tap a row to expand that player's **public scoring pile** (fish chips with points). Hands stay private.
- Leading score tints gold. Your row is softly outlined.
- Status remains a dashed ink line under the masthead (phase / targeting / outcome). River chips still answer “where?” after a step.

### Held hand (bottom-left overlay)
- Small fanned parchment cards (icon + label) sit bottom-left over the river — like cards in hand.
- Toggle pill: **Hide** collapses to a compact chip showing count (+ selected/locked action icon); tap again to expand.
- Selected = lifts + sun rim; illegal/disabled = dimmed.
- Flow: tap card → legal zones light → tap zone to commit. Cancel = tap the same card again. Hover peeks commit on first zone tap.

### Rules cheatsheet (bottom-right overlay)
- Compact **? Rules** pill sits bottom-right over the river (mirrors the hand’s corner, does not compete with it).
- Tap opens a parchment sheet: define **Crash** once (spent + discard 1 + fish gone), then resolve order and short collision rows that just say Crash / Steal / Block.
- Backdrop dismiss / Close; ≥44px hit target. Keep copy short — this is a mid-game glance, not the full rulebook.

---

## 5. Card & Component System

### Action Cards (held hand)
Phone UI uses small parchment cards in a bottom-left fan (icon + name). Minimize when you need a clear view of the river.

- **Dive** — downward arrow / kingfisher dive glyph. Cyan-blue.
- **Drop** — intercept/ambush glyph (two crossing arrows). Orange.
- **Splash** — water-splash burst glyph. Purple (matches hazard status color).
- **Hover** — eye + wing glyph (peek + move). Green.

Card backs (opponent rail): **identical and plain** — only the ready tick changes state.

### Fish Cards
Small (about 60% of an action card). Always show a **big point number** plus a tiny fish glyph:
- Minnow (1 pt), Perch (2 pt), Golden Trout (3 pt, gold shimmer), Old Boot (0, comedic), Pike (hazard icon — toothy, jagged red edge).

### Overlays & Modals
- Frosted **parchment panels** with soft rounded corners and gentle paper texture.
- Used for: rules reference, end-of-round summary, crash result overlays, help.
- Backdrop: `rgba(43,36,32,0.4)` with blur.

---

## 6. The Theatrical Core: Select → Lock → Reveal → Resolve

This sequence is the heart of the game. **Current build: "Read it on the river"** — outcomes are readable on the board and birds for the whole next selection phase. Staged priority timeline / dive arcs / fish fly-to-score remain future polish.

### Step 1 — Select & Lock
- Legal targets light up (sun-yellow highlight); illegal targets dim.
- Locking in shows a small "lock" pulse + an animated countdown when the step timer is low.

### Step 2 — Simultaneous Reveal
- Public reveals live in the **opponent HUD rows** (face-up action + target), not a separate top strip.
- Player-colored **action chips** pin onto each targeted zone so "who went where?" is readable on the river itself.

### Step 3 — Priority Resolution (Hover → Splash → Dive → Drop)
- Engine still resolves in priority order instantly; staged "Resolving Hover…" banners are not yet animated.
- Splash zones keep the purple hazard dome for the remainder of the step window.

### Step 4 — Outcome Callouts ("Read it on the river")
Board is the source of truth; HUD story line is the accessible companion (`aria-live`).

- **Zone badges** — CATCH +N / CRASH / STEAL +N / BLOCKED / PIKE on the tile (display font, status colors). Crash shudder, catch green ring, steal orange rim; splash dome for blocked.
- **Pawn reactions** — CSS one-shots on the actor's kingfisher: catch bounce + "+", crash tilt + red ×, steal lean + STEAL chip, blocked wet shake + purple drip, pike recoil + "!".
- **Outcome story** — one sentence under the phase banner, e.g. `Pied CRASH Z2 · Azure STEAL Z2`.
- **Stable layout** — zone tiles and the status line reserve chip/button space at all times so feedback never resizes or shoves the river.
- Lifetime: badges / chips / reveals / reactions stay through the following selection phase (until the next `resolveStep`). After **step 3**, the game pauses in a cleanup review beat with the same river feedback still up. Tap status-line **Next round** to drift/restock and clear the feedback before placement.

> Rule of thumb: players must be able to reconstruct exactly what happened by looking at the river + opponent rows. Color is never the only signal (icon + text).

### Step 4b — Personal outcome splash (local player only)

River feedback stays the shared truth. On top of that, the **local seat** gets a personal bird burst for the beats that matter — fish in the beak, or a Crash that costs an extra card.

- **Audience:** only the viewing player’s own outcome for the step that just resolved. Opponents never see your splash; you never see theirs. Pass-and-play: show for the seat that just became human-active / the seat whose device this is.
- **Form:** a brief full-bleed **bird splash** — large species sprite + valence word — over a soft parchment / sun-glare veil. Not a modal dialog (no buttons, no scoreboard). Auto-dismisses; tap anywhere to skip early.
- **When (sparingly — no Hover / miss / blocked / pike noise):**

  | Feel | When | Look |
  |---|---|---|
  | **Good** | You keep a fish — Catch or Steal | Happy bird, green rim, “CATCH +N” / “STEAL +N” |
  | **Bad** | You Crash (spent card + discard 1) | Startled bird, brick-red, “CRASH!” |

- **Timing:** ~900ms after river badges/pawn reactions start, then splash ~1.4s on screen. Never queues multiple splashes in one step.
- **Does not replace** zone badges, pawn reactions, or the outcome story — those stay for the whole selection window so everyone can still read the river.
- **Reduced motion:** skip the splash art; keep the status-line story + river badges only.

---

## 7. Motion Language

- **Fast, light, springy.** The game is 15 minutes — nothing slow or ponderous.
- Durations: micro-interactions 100–200ms; card flips 250–350ms; pawn reactions / badge pops ~400–700ms once; personal outcome splash ~1.4s once (local only; fish gain / crash).
- Easing: ease-out for entrances, ease-in-out for flips/swooshes.
- Ambient idles: water ripples (2s loop), pawn bob (3s loop), fish float (4s loop). Always subtle, never distracting.
- **Respect `prefers-reduced-motion`:** fall back to instant state changes, no shake/burst; skip personal outcome splash.

---

## 8. Key UX Interactions

### Hover (peek + move)
Two clear sub-moments, both surfaced with distinct UI:
1. **Peek:** tap one highlighted face-down zone — card flips in-tile and Hover locks immediately. If no face-down fish remain, status offers **Skip peek**.
2. **Move:** after the step resolves into the hover phase, arrows appear on adjacent perches; one tap = move (or Stay). If no adjacent perch is free, Stay happens automatically.

### Crash / Penalty Feedback
When a player must discard an extra card, their hand visually "rejects" a card with a shake — makes the penalty physical and memorable.

### Score & Fish Flow
- Live totals live in the **Scores roster** (flock chip + sheet). Catch animations still go to the owner's pile; a +N floating number on arrival.

### End of Round Cleanup
- First: hold on the river so players can read step-3 chips / badges (same “read it on the river” language as mid-round).
- Status line shows the outcome story plus a primary **Next round**.
- On Next round: fish cards **slide one zone downstream** (~700ms; last zone fades off the board), status says “Fish drift downstream…”, then cleanup commits (hands reset, empties restock, placement). Skip the motion when `prefers-reduced-motion`.

---

## 9. Accessibility

- **Color is never the only signal** — pair every status color with an icon or text label (e.g. crash = red + "CRASH" text + shake).
- Contrast: body text on parchment `#2B2420` on `#FAF3E3` (well above WCAG AA). Check all accents on their surfaces.
- All interactive targets ≥ 44px.
- Focus rings visible (sun-yellow outline).
- Reduced-motion fallback as above.

---

## 10. Implementation Notes (CSS Modules)

- One `.module.css` per component in `src/components/`, global tokens in `src/styles/tokens.css`.
- **Design tokens:** expose palette + typography as CSS custom properties in `:root`, referenced by every module. Change the mood in one place.
- Layout: CSS Grid for the river board (`grid-template-rows` per zone, columns for [bank][water][bank]).
- Animations: CSS keyframes in modules; trigger reveal/outcome sequences via component state classes (never `useEffect`-driven animation).
- Board is portrait-ish; shell is `100dvh` flex column. River stage is `flex: 1; min-height: 0; position: relative` so the hand can overlay bottom-left. On desktop, same column centered with valley gutters — not side dashboards.

---

## 11. Screens Inventory

| Screen | Notes |
|---|---|
| **Lobby / Setup** | Player count, color pick, name, "Start". Then a setup checklist (deal fish, choose perch, take deck). |
| **Board (main)** | The full game loop lives here: selection, reveal, resolution, cleanup. |
| **Peek modal** | Hover peeks, face-down fish reveal. |
| **Crash / outcome overlay** | Zone-anchored badges + pawn reactions + `OutcomeStory` line (not modal dialogs). |
| **Personal outcome splash** | Local-only bird burst on catch / steal / crash; auto-dismiss; does not replace river feedback. |
| **Round review** | Same board + status-line **Next round** (no modal). |
| **Game over** | Winner celebration, final scoreboard, rematch button. |
| **Rules cheatsheet** | Bottom-right `? Rules` → parchment collision reference. |

---

## Appendix — Pawn Sprite Generation Prompts

One prompt per playable species. Each follows the same template (same pose, angle, composition, texture, and ending clauses) so the five sprites come out rig-identical; only the plumage sentence changes. Generate them all in the **same tool + same seed/style** to maximize consistency.

**Common Kingfisher**
> Hand-painted watercolor children's book illustration of a common kingfisher bird, side profile view, perched upright, head and body flat against a plain white background. Whimsical, airy, joyful field-guide art in the style of Wingspan. Soft painterly watercolor strokes with gentle paper texture, warm sunlit river-valley palette. Feather body is deep royal blue on the back and wings with orange-rufous underparts, a bright cyan crown streak, and a crisp white throat patch; long orange beak, round cartoonish head, single glossy eye, bold clean silhouette, no background scenery, no other elements, isolated subject, centered composition. Soft soft drop shadow under the feet. Clean vector flat colors with watercolor texture. PNG, no text. No background.

**Pied Kingfisher**
> Hand-painted watercolor children's book illustration of a pied kingfisher bird, side profile view, perched upright, head and body flat against a plain white background. Whimsical, airy, joyful field-guide art in the style of Wingspan. Soft painterly watercolor strokes with gentle paper texture, warm sunlit river-valley palette. Feather body is bold black and white monochrome with a dramatic black tufted crest, a white throat, a white eyebrow stripe, and a broad black mask through the eye; long black beak, round cartoonish head, single glossy eye, bold clean silhouette, no background scenery, no other elements, isolated subject, centered composition. Soft soft drop shadow under the feet. Clean vector flat colors with watercolor texture. PNG, no text. No background.

**Oriental Dwarf Kingfisher**
> Hand-painted watercolor children's book illustration of a small oriental dwarf kingfisher bird, side profile view, perched upright, head and body flat against a plain white background. Whimsical, airy, joyful field-guide art in the style of Wingspan. Soft painterly watercolor strokes with gentle paper texture, warm sunlit river-valley palette. Feather body is violet-purple on the back with lilac underparts, a bright egg-yolk orange crown cap, an orange collar, and a crisp white throat patch; tiny orange beak, round cartoonish head, single glossy eye, bold clean silhouette, no background scenery, no other elements, isolated subject, centered composition. Soft soft drop shadow under the feet. Clean vector flat colors with watercolor texture. PNG, no text. No background.

**Belted Kingfisher**
> Hand-painted watercolor children's book illustration of a belted kingfisher bird, side profile view, perched upright, head and body flat against a plain white background. Whimsical, airy, joyful field-guide art in the style of Wingspan. Soft painterly watercolor strokes with gentle paper texture, warm sunlit river-valley palette. Feather body is slate blue-grey with a clean white throat patch, a thick grey-blue chest belt across the breast, a bushy head crest, and a long dark charcoal beak; long orange beak, round cartoonish head, single glossy eye, bold clean silhouette, no background scenery, no other elements, isolated subject, centered composition. Soft soft drop shadow under the feet. Clean flat vector colors with watercolor texture. PNG, no text. No background.

**Azure Kingfisher**
> Hand-painted watercolor children's book illustration of a small azure kingfisher bird, side profile view, perched upright, head and body flat against a plain white background. Whimsical, airy, joyful field-guide art in the style of Wingspan. Soft painterly watercolor strokes with gentle paper texture, warm sunlit river-valley palette. Feather body is bright iridescent azure blue on the back with white underparts, a small white spot at the base of the wing, and a white throat patch; slender orange beak, round cartoonish head, single glossy eye, bold clean silhouette, no background scenery, no other elements, isolated subject, centered composition. Soft soft drop shadow under the feet. Clean flat vector colors with watercolor texture. PNG, no text. No background.

**Generation tips**
- Run all five in one batch/seed so plumage style and pose stay locked.
- Request transparent PNG and keep the same aspect ratio + baseline (feet aligned) so perch elevation scales identically.
- If a species' defining mark is missed, re-prompt with only that clause emphasized — don't regenerate the whole art direction.

**Final assets (in-repo)**
- Location: `src/assets/kingfishers/` (kebab-case filenames: `common-kingfisher.png`, `pied-kingfisher.png`, `oriental-dwarf-kingfisher.png`, `belted-kingfisher.png`, `azure-kingfisher.png`).
- Manifest: `src/game/kingfishers.ts` — typed constants per species (id, display name, sprite import, accent color).
- **Facing:** all sprites look **left**, except the **common kingfisher which faces right**. Components must flip sprites with CSS `scaleX(-1)` to make a pawn face the center of the board regardless of bank, i.e. use `facing` from the manifest.
