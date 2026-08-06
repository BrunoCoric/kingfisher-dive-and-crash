import type { CardType, FishType, GameState } from '../game/types'
import { KINGFISHERS, type Kingfisher, type KingfisherID } from '../game/kingfishers'
import { SPECIES_ORDER, speciesIdForSeat } from '../game/powers'

export const SPECIES_SHORT: Record<KingfisherID, string> = {
  common: 'Common',
  pied: 'Pied',
  orientalDwarf: 'Dwarf',
  belted: 'Belted',
  azure: 'Azure',
}

export function kingfisherById(id: KingfisherID): Kingfisher {
  return KINGFISHERS[id]
}

/** Flock-order lookup (menus / diorama). Prefer `seatKingfisher` in-match. */
export function kingfisher(index: number): Kingfisher {
  return KINGFISHERS[SPECIES_ORDER[index % SPECIES_ORDER.length]]
}

export function seatKingfisher(G: GameState, pid: string): Kingfisher {
  return kingfisherById(speciesIdForSeat(G, pid))
}

/** UI accent for a seat — sourced from the species manifest (single source of truth). */
export function playerColor(G: GameState, pid: string): string {
  return seatKingfisher(G, pid).accent
}

export function speciesName(G: GameState, pid: string): string {
  return seatKingfisher(G, pid).displayName
}

export function speciesShort(G: GameState, pid: string): string {
  return SPECIES_SHORT[speciesIdForSeat(G, pid)]
}

export function speciesShortById(id: KingfisherID): string {
  return SPECIES_SHORT[id]
}

export const CARD_ACCENT: Record<CardType, string> = {
  Dive: 'var(--water-cyan)',
  Drop: 'var(--flame)',
  Splash: 'var(--status-hazard)',
  Hover: 'var(--leaf-green)',
}

export const FISH_LABEL: Record<FishType, string> = {
  Minnow: 'Minnow',
  Perch: 'Perch',
  Trout: 'Golden Trout',
  Trash: 'Old Boot',
  Pike: 'Pike',
}

export const ACTION_LABEL: Record<CardType, string> = {
  Dive: 'Dive',
  Drop: 'Drop',
  Splash: 'Splash',
  Hover: 'Hover',
}

/** Human label for a perch id like "L3" → "Z4 · left bank". */
export function perchLabel(perchId: string): string {
  if (!perchId) return 'No perch'
  const bank = perchId.startsWith('L') ? 'left bank' : 'right bank'
  const zone = Number(perchId.slice(1))
  return `Z${zone} · ${bank}`
}
