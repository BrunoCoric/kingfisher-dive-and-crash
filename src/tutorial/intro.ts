export interface IntroSlide {
  id: string
  title: string
  body: string
  bullets?: string[]
}

/** Rules primer shown before the click-guided practice begins. */
export const TUTORIAL_INTRO: IntroSlide[] = [
  {
    id: 'goal',
    title: 'Win with fish points',
    body: 'You are a kingfisher on the river. Score the most victory points from caught fish.',
    bullets: [
      'Minnow 1 · Perch 2 · Trout 3 · Trash 0',
      'Pike is a hazard: 0 points, and you return your lowest scored fish',
      'Game ends when the fish deck cannot fill an empty river zone',
      'Highest points wins; ties go to most fish cards',
    ],
  },
  {
    id: 'board',
    title: 'Zones & adjacent reach',
    body: 'The river is a line of face-down fish zones. Your perch decides which zones you can hit.',
    bullets: [
      'Zone 1 is upstream; higher numbers are downstream',
      '“Adjacent” = your perch’s reach, not every zone',
      'Low perch: own zone + one downstream (or upstream at the end)',
      'High perch: own zone + upstream + downstream (wider at the edges)',
      'Low perch also gets a secret sightline peek at round start',
    ],
  },
  {
    id: 'round',
    title: 'How a round works',
    body: 'Each round has 3 simultaneous steps. Everyone locks a card face-down, then they resolve together.',
    bullets: [
      'Hand is 4 cards; you play 3 and leave one unused',
      'Resolve order: Hover → Splash → Dive → Drop',
      'Effects last only for that step — nothing carries over',
      'After step 3: review, fish drift downstream, restock, hands reset',
      'First Player passes clockwise; birds leave the board, then everyone places again',
    ],
  },
  {
    id: 'cards',
    title: 'Your four cards',
    body: 'Next you will practice each interaction on a scripted river — opponents move on rails.',
    bullets: [
      'Dive — catch a fish on a reachable zone (solo only)',
      'Splash — block Dives on a zone this step',
      'Drop — steal from a successful solo Dive this step',
      'Hover — peek any face-down fish, then hop to an adjacent perch or stay',
      'Same action twice on one zone = Crash (fish flees + discard penalty)',
    ],
  },
]
