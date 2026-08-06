import type { CardType, FishType } from '../game/types'
import { KINGFISHERS, type Kingfisher } from '../game/kingfishers'

export const SPECIES = [
  'Common Kingfisher',
  'Pied Kingfisher',
  'Oriental Dwarf Kingfisher',
  'Belted Kingfisher',
  'Azure Kingfisher',
]

export const SPECIES_SHORT = ['Common', 'Pied', 'Dwarf', 'Belted', 'Azure']

export function kingfisher(index: number): Kingfisher {
  return Object.values(KINGFISHERS)[index % Object.values(KINGFISHERS).length]
}

/** UI accent for a seat — sourced from the species manifest (single source of truth). */
export function playerColor(index: number): string {
  return kingfisher(index).accent
}

export function species(index: number): string {
  return SPECIES[index % SPECIES.length]
}

export function speciesShort(index: number): string {
  return SPECIES_SHORT[index % SPECIES_SHORT.length]
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
