import type { KingfisherID } from '../game/kingfishers'

/** Educational field-guide copy — visible for locked and unlocked birds alike. */
export interface FieldNote {
  scientificName: string
  region: string
  habitat: string
  trivia: readonly [string, string] | readonly [string, string, string]
}

export const FIELD_NOTES: Record<KingfisherID, FieldNote> = {
  common: {
    scientificName: 'Alcedo atthis',
    region: 'Europe, North Africa, and across temperate Asia',
    habitat: 'Clear streams and lakes with overhanging perches',
    trivia: [
      'Dives beak-first, then blinks a third eyelid to protect its eyes underwater.',
      'That electric blue is structural colour — feather structure, not blue pigment.',
      'A nesting pair can catch dozens of fish a day when feeding chicks.',
    ],
  },
  pied: {
    scientificName: 'Ceryle rudis',
    region: 'Sub-Saharan Africa and South & Southeast Asia',
    habitat: 'Open water — rivers, lakes, estuaries, and coasts',
    trivia: [
      'Famous for true hovering: it hangs in place before plunging straight down.',
      'Often hunts in pairs or loose groups along the same stretch of water.',
      'One of the few kingfishers comfortable fishing far from dense cover.',
    ],
  },
  orientalDwarf: {
    scientificName: 'Ceyx erithaca',
    region: 'South and Southeast Asia',
    habitat: 'Shaded forest streams and thick riverside undergrowth',
    trivia: [
      'Barely sparrow-sized — one of the smallest kingfishers in the world.',
      'Its blaze of orange, lilac, and violet makes it look almost painted.',
      'Often heard before it is seen: a sharp high call darting through the trees.',
    ],
  },
  belted: {
    scientificName: 'Megaceryle alcyon',
    region: 'North America (winters into Central America and the Caribbean)',
    habitat: 'Lakes, rivers, estuaries, and sheltered coasts',
    trivia: [
      'One of the few bird species where the female is brighter than the male.',
      'Nests in burrows dug into sandy banks — tunnels can run over a metre deep.',
      'Its rattling call is a classic sound of North American waterways.',
    ],
  },
  azure: {
    scientificName: 'Ceyx azureus',
    region: 'Northern and eastern Australia, New Guinea, and nearby islands',
    habitat: 'Shaded rainforest creeks and slow, overhanging streams',
    trivia: [
      'Often flashes past as a blue blur just above the water’s surface.',
      'Prefers quiet, enclosed waterways rather than open lakes.',
      'Like other Ceyx kingfishers, it digs nest tunnels into soft stream banks.',
    ],
  },
  yellowBilled: {
    scientificName: 'Syma torotoro',
    region: 'New Guinea and northern Australia (Cape York)',
    habitat: 'Rainforest canopy and dense woodland — often away from water',
    trivia: [
      'A forest hunter: insects and small lizards matter more than fish.',
      'Its bright yellow bill stands out even in deep green shade.',
      'Part of a tropical group that left the classic riverside lifestyle behind.',
    ],
  },
  banded: {
    scientificName: 'Lacedo pulchella',
    region: 'Southeast Asian lowland forests',
    habitat: 'Dense evergreen forest, often far from open water',
    trivia: [
      'Males and females look strikingly different — rare among kingfishers.',
      'Hunts insects and small vertebrates in the understorey, not diving for fish.',
      'Its soft, mournful whistle is more often heard than the bird is seen.',
    ],
  },
  green: {
    scientificName: 'Chloroceryle americana',
    region: 'Southern Texas through Central America to much of South America',
    habitat: 'Quiet rivers, mangroves, and wooded shorelines',
    trivia: [
      'A compact New World kingfisher with an emerald-green back.',
      'Often sits low and still, then dashes out for fish near the bank.',
      'Shares rivers with larger relatives like the Amazon and Ringed kingfishers.',
    ],
  },
  kookaburra: {
    scientificName: 'Dacelo novaeguineae',
    region: 'Eastern Australia (introduced to parts of the southwest and New Zealand)',
    habitat: 'Open woodland, parks, and suburban trees — not a diving fisher',
    trivia: [
      'Its laughing chorus helps pairs hold territory at dawn and dusk.',
      'Hunts snakes, lizards, insects, and small mammals more than fish.',
      'Still a true kingfisher — the family is far wider than riverside divers.',
    ],
  },
}

export function fieldNoteFor(id: KingfisherID): FieldNote {
  return FIELD_NOTES[id]
}
