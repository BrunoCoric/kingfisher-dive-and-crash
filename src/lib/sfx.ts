/** ElevenLabs WAVs via Web Audio — avoids mobile Now Playing / media session. */

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

let ctx: AudioContext | null = null
const buffers = new Map<string, Promise<AudioBuffer>>()
let ambienceSrc: AudioBufferSourceNode | null = null
let ambienceGain: GainNode | null = null
let ambienceWanted = false

function muted(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

async function ensureCtx(): Promise<AudioContext | null> {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    ctx = new AC()
  }
  if (ctx.state === 'suspended') await ctx.resume()
  return ctx
}

function loadBuffer(url: string): Promise<AudioBuffer> {
  let pending = buffers.get(url)
  if (!pending) {
    pending = (async () => {
      const c = await ensureCtx()
      if (!c) throw new Error('no audio')
      const res = await fetch(url)
      if (!res.ok) throw new Error(`sfx ${url}`)
      return c.decodeAudioData(await res.arrayBuffer())
    })()
    buffers.set(url, pending)
  }
  return pending
}

function playBuffer(
  c: AudioContext,
  buf: AudioBuffer,
  when: number,
  dest: AudioNode,
  loop = false,
): AudioBufferSourceNode {
  const src = c.createBufferSource()
  src.buffer = buf
  src.loop = loop
  src.connect(dest)
  src.start(when)
  return src
}

/** Fire-and-forget one-shot. Optional delay for layered step cues. */
export function playSfx(id: SfxId, delayMs = 0): void {
  if (typeof window === 'undefined' || muted()) return
  void (async () => {
    const c = await ensureCtx()
    if (!c || muted()) return
    const buf = await loadBuffer(`/sounds/${id}.wav`)
    playBuffer(c, buf, c.currentTime + delayMs / 1000, c.destination)
  })().catch(() => {
    /* autoplay / missing file — ignore */
  })
}

/** Soft looping river bed. Call from a user gesture (mode start). */
export function startAmbience(): void {
  if (typeof window === 'undefined' || muted()) return
  ambienceWanted = true
  void (async () => {
    const c = await ensureCtx()
    if (!c || muted() || !ambienceWanted || ambienceSrc) return
    const buf = await loadBuffer('/sounds/ambience.wav')
    if (!ambienceWanted || ambienceSrc) return
    if (!ambienceGain) {
      ambienceGain = c.createGain()
      ambienceGain.gain.value = AMBIENCE_VOLUME
      ambienceGain.connect(c.destination)
    }
    ambienceSrc = playBuffer(c, buf, c.currentTime, ambienceGain, true)
  })().catch(() => {
    /* autoplay blocked — ignore until next gesture */
  })
}

export function stopAmbience(): void {
  ambienceWanted = false
  if (!ambienceSrc) return
  try {
    ambienceSrc.stop()
  } catch {
    /* already stopped */
  }
  ambienceSrc = null
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
