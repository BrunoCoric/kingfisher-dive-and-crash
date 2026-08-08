export interface IntroSlide {
  id: string
  title: string
  body: string
  bullets?: string[]
}

/** One-screen primer before the click-guided practice begins. */
export const TUTORIAL_INTRO: IntroSlide[] = [
  {
    id: 'core',
    title: 'Catch the most fish',
    body: 'Each step, everyone secretly plays one card. They resolve together. That is the whole game.',
    bullets: [
      'Dive — catch a fish alone on a zone you can reach',
      'Splash — block Dives on a zone this step',
      'Drop — steal a fish from a successful solo Dive this step',
      'Same card twice on one zone = Crash (fish stays; you lose tempo)',
    ],
  },
]
