/** ElevenLabs WAVs served from `public/sounds/`. */

export type SfxId =
  | 'blocked'
  | 'bird_move'
  | 'card_lock'
  | 'card_select'
  | 'catch'
  | 'crash'
  | 'fish_drift'
  | 'fish_minnow'
  | 'fish_perch'
  | 'fish_trash'
  | 'fish_trout'
  | 'game_win'
  | 'peek'
  | 'pike'
  | 'restock'
  | 'reveal_dive'
  | 'reveal_drop'
  | 'reveal_hover'
  | 'reveal_splash'
  | 'round_start'
  | 'splash_bad'
  | 'splash_good'
  | 'steal'
  | 'step_resolve'

const AMBIENCE_VOLUME = 0.28

const cache = new Map<SfxId, HTMLAudioElement>()
let ambience: HTMLAudioElement | null = null

function muted(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

function load(id: SfxId): HTMLAudioElement {
  let audio = cache.get(id)
  if (!audio) {
    audio = new Audio(`/sounds/${id}.wav`)
    audio.preload = 'auto'
    cache.set(id, audio)
  }
  return audio
}

/** Fire-and-forget one-shot. Optional delay for layered step cues. */
export function playSfx(id: SfxId, delayMs = 0): void {
  if (typeof window === 'undefined' || muted()) return
  const go = () => {
    const base = load(id)
    const shot = base.cloneNode(true) as HTMLAudioElement
    void shot.play().catch(() => {
      /* autoplay / missing file — ignore */
    })
  }
  if (delayMs <= 0) go()
  else window.setTimeout(go, delayMs)
}

/** Soft looping river bed. Call from a user gesture (mode start). */
export function startAmbience(): void {
  if (typeof window === 'undefined' || muted()) return
  if (!ambience) {
    ambience = new Audio('/sounds/ambience.wav')
    ambience.loop = true
    ambience.preload = 'auto'
    ambience.volume = AMBIENCE_VOLUME
  }
  if (!ambience.paused) return
  void ambience.play().catch(() => {
    /* autoplay blocked — ignore until next gesture */
  })
}

export function stopAmbience(): void {
  if (!ambience) return
  ambience.pause()
  ambience.currentTime = 0
}

/** After fish drift + restock into the next round's placement. */
export function cueRoundAdvanceSfx(): void {
  playSfx('restock', 180)
  playSfx('round_start', 520)
}

let lastWinKey = ''

/** Once when the end screen appears for a given winner. */
export function cueWinSfx(winner: string): void {
  const key = winner
  if (key === lastWinKey) return
  lastWinKey = key
  playSfx('game_win')
}
