/** Per-zone watercolor puddle silhouettes + pigment recipes (viewBox 100×80). */

export interface Bloom {
  cx: number
  cy: number
  rx: number
  ry: number
  fill: string
}

export interface StrokeMark {
  d: string
  width: number
  opacity: number
}

export interface WashRecipe {
  /** Organic outer silhouette — unique per zone. */
  path: string
  blooms: Bloom[]
  speckles: Array<{ cx: number; cy: number; r: number; fill: string }>
  /** Per-zone sun glare — varied so puddles don't look stamped. */
  glare: StrokeMark[]
  /** Soft ripple arcs under the glare. */
  ripples: StrokeMark[]
  mid: string
  deep: string
  light: string
}

export const WATER_RECIPES: WashRecipe[] = [
  {
    // sunlit shallow — left bulge, soft right notch
    path: 'M8,38 C6,22 18,10 34,8 C48,6 62,10 74,14 C88,20 96,32 94,46 C92,60 78,72 58,74 C40,76 22,70 12,58 C6,50 9,44 8,38 Z',
    mid: '#62a8c0',
    deep: '#357892',
    light: '#b8d8e6',
    blooms: [
      { cx: 28, cy: 24, rx: 22, ry: 14, fill: 'rgba(255,252,245,0.55)' },
      { cx: 68, cy: 40, rx: 18, ry: 16, fill: 'rgba(140,200,218,0.4)' },
      { cx: 42, cy: 64, rx: 24, ry: 12, fill: 'rgba(70,130,155,0.28)' },
    ],
    speckles: [
      { cx: 20, cy: 48, r: 1.4, fill: 'rgba(45,95,120,0.22)' },
      { cx: 76, cy: 28, r: 1.1, fill: 'rgba(255,255,255,0.4)' },
      { cx: 58, cy: 56, r: 1.6, fill: 'rgba(45,95,120,0.18)' },
    ],
    glare: [
      { d: 'M18 28 C32 20, 48 22, 64 30', width: 3.4, opacity: 0.82 },
      { d: 'M26 34 C38 28, 50 30, 60 36', width: 1.5, opacity: 0.3 },
    ],
    ripples: [
      { d: 'M28 54 C40 50, 54 51, 66 56', width: 1.1, opacity: 0.42 },
    ],
  },
  {
    // cool mid-channel — wavy top, fuller belly
    path: 'M10,42 C8,26 16,12 30,9 C44,6 52,14 66,11 C80,8 94,18 95,36 C96,52 86,68 68,73 C50,78 28,74 16,62 C8,54 11,48 10,42 Z',
    mid: '#4f96b2',
    deep: '#2e6c8a',
    light: '#a4cee0',
    blooms: [
      { cx: 62, cy: 22, rx: 20, ry: 13, fill: 'rgba(230,245,250,0.5)' },
      { cx: 30, cy: 44, rx: 20, ry: 18, fill: 'rgba(100,175,200,0.38)' },
      { cx: 70, cy: 62, rx: 18, ry: 11, fill: 'rgba(55,110,140,0.3)' },
    ],
    speckles: [
      { cx: 18, cy: 30, r: 1.2, fill: 'rgba(45,95,120,0.2)' },
      { cx: 48, cy: 18, r: 1.5, fill: 'rgba(255,255,255,0.35)' },
      { cx: 82, cy: 50, r: 1.3, fill: 'rgba(45,95,120,0.22)' },
    ],
    glare: [
      { d: 'M34 20 C48 16, 62 20, 78 28', width: 2.8, opacity: 0.7 },
      { d: 'M40 26 C52 24, 66 28, 76 34', width: 1.3, opacity: 0.22 },
    ],
    ripples: [
      { d: 'M24 50 C38 46, 52 48, 70 52', width: 1.2, opacity: 0.38 },
      { d: 'M32 58 C44 56, 56 56, 66 60', width: 0.85, opacity: 0.24 },
    ],
  },
  {
    // greenish shallows — pinched waist
    path: 'M12,36 C7,22 20,11 36,10 C50,9 58,16 70,13 C86,9 97,24 94,40 C91,56 80,70 60,74 C42,78 24,72 14,58 C8,50 14,44 12,36 Z',
    mid: '#52a0a0',
    deep: '#34767c',
    light: '#aed2d2',
    blooms: [
      { cx: 40, cy: 28, rx: 24, ry: 15, fill: 'rgba(210,235,230,0.45)' },
      { cx: 72, cy: 48, rx: 16, ry: 17, fill: 'rgba(120,185,185,0.35)' },
      { cx: 32, cy: 60, rx: 20, ry: 12, fill: 'rgba(60,125,140,0.28)' },
    ],
    speckles: [
      { cx: 24, cy: 40, r: 1.3, fill: 'rgba(46,75,42,0.12)' },
      { cx: 66, cy: 24, r: 1.2, fill: 'rgba(255,255,255,0.38)' },
      { cx: 50, cy: 68, r: 1.5, fill: 'rgba(45,95,120,0.2)' },
    ],
    glare: [
      { d: 'M24 34 C40 26, 56 28, 72 38', width: 3, opacity: 0.55 },
    ],
    ripples: [
      { d: 'M30 48 C42 44, 55 45, 68 50', width: 1, opacity: 0.35 },
      { d: 'M36 62 C46 60, 56 60, 64 63', width: 0.8, opacity: 0.22 },
    ],
  },
  {
    // deeper pool — right-heavy, low belly
    path: 'M9,40 C10,24 22,12 40,10 C56,8 72,12 84,18 C96,26 98,40 92,52 C86,66 70,76 50,76 C30,76 14,68 8,54 C5,46 8,44 9,40 Z',
    mid: '#468eb0',
    deep: '#286684',
    light: '#9ec8dc',
    blooms: [
      { cx: 55, cy: 20, rx: 18, ry: 12, fill: 'rgba(200,230,240,0.42)' },
      { cx: 25, cy: 38, rx: 16, ry: 15, fill: 'rgba(90,160,185,0.36)' },
      { cx: 58, cy: 58, rx: 26, ry: 14, fill: 'rgba(40,100,130,0.34)' },
    ],
    speckles: [
      { cx: 78, cy: 36, r: 1.4, fill: 'rgba(45,95,120,0.24)' },
      { cx: 36, cy: 22, r: 1.1, fill: 'rgba(255,255,255,0.4)' },
      { cx: 44, cy: 70, r: 1.7, fill: 'rgba(30,80,110,0.22)' },
    ],
    glare: [
      { d: 'M42 18 C58 14, 72 20, 86 30', width: 2.6, opacity: 0.65 },
      { d: 'M20 36 C32 32, 42 34, 52 40', width: 1.8, opacity: 0.28 },
    ],
    ripples: [
      { d: 'M22 56 C36 52, 54 54, 74 58', width: 1.15, opacity: 0.4 },
    ],
  },
  {
    // dappled glare — scalloped top edge
    path: 'M7,44 C6,28 14,14 28,10 C38,7 46,14 56,9 C68,4 82,12 90,24 C98,38 96,54 84,66 C70,78 48,80 30,74 C16,70 8,58 7,44 Z',
    mid: '#5ea6be',
    deep: '#357894',
    light: '#bedaeb',
    blooms: [
      { cx: 22, cy: 32, rx: 16, ry: 16, fill: 'rgba(255,250,240,0.48)' },
      { cx: 52, cy: 36, rx: 22, ry: 14, fill: 'rgba(150,205,220,0.36)' },
      { cx: 74, cy: 58, rx: 16, ry: 12, fill: 'rgba(65,125,150,0.3)' },
    ],
    speckles: [
      { cx: 40, cy: 52, r: 1.2, fill: 'rgba(255,255,255,0.35)' },
      { cx: 68, cy: 22, r: 1.4, fill: 'rgba(45,95,120,0.18)' },
      { cx: 28, cy: 66, r: 1.3, fill: 'rgba(45,95,120,0.2)' },
    ],
    glare: [
      { d: 'M16 34 C28 26, 40 28, 54 34', width: 3.6, opacity: 0.78 },
      { d: 'M58 24 C68 22, 78 28, 86 36', width: 2.2, opacity: 0.4 },
    ],
    ripples: [
      { d: 'M26 56 C40 52, 55 53, 70 58', width: 1, opacity: 0.36 },
      { d: 'M34 64 C46 62, 56 62, 64 65', width: 0.75, opacity: 0.2 },
    ],
  },
  {
    // downstream — elongated, cooler foam lip
    path: 'M6,38 C8,22 24,10 42,8 C60,6 78,12 88,22 C98,34 97,50 88,62 C78,74 58,78 38,76 C20,74 6,62 5,48 C4,42 5,40 6,38 Z',
    mid: '#4c96b4',
    deep: '#2e6888',
    light: '#a6d0e4',
    blooms: [
      { cx: 48, cy: 24, rx: 26, ry: 13, fill: 'rgba(220,240,248,0.5)' },
      { cx: 28, cy: 50, rx: 18, ry: 16, fill: 'rgba(110,175,200,0.34)' },
      { cx: 68, cy: 55, rx: 20, ry: 14, fill: 'rgba(50,115,145,0.32)' },
    ],
    speckles: [
      { cx: 16, cy: 36, r: 1.5, fill: 'rgba(255,255,255,0.42)' },
      { cx: 80, cy: 42, r: 1.2, fill: 'rgba(45,95,120,0.2)' },
      { cx: 52, cy: 68, r: 1.4, fill: 'rgba(45,95,120,0.18)' },
    ],
    glare: [
      { d: 'M20 26 C38 18, 58 20, 80 30', width: 3.1, opacity: 0.72 },
      { d: 'M30 32 C46 28, 62 30, 76 36', width: 1.4, opacity: 0.26 },
    ],
    ripples: [
      { d: 'M22 52 C40 48, 58 49, 76 54', width: 1.2, opacity: 0.4 },
    ],
  },
  {
    // last pool — soft asymmetric lobe
    path: 'M11,40 C9,26 18,12 34,9 C50,6 64,12 76,16 C90,22 98,36 93,50 C88,66 70,76 50,77 C32,78 16,70 10,56 C7,48 12,44 11,40 Z',
    mid: '#5292b2',
    deep: '#326a8c',
    light: '#aacce0',
    blooms: [
      { cx: 35, cy: 26, rx: 20, ry: 14, fill: 'rgba(225,235,245,0.48)' },
      { cx: 65, cy: 42, rx: 18, ry: 17, fill: 'rgba(115,165,200,0.36)' },
      { cx: 40, cy: 62, rx: 22, ry: 11, fill: 'rgba(55,105,145,0.3)' },
    ],
    speckles: [
      { cx: 72, cy: 28, r: 1.3, fill: 'rgba(255,255,255,0.38)' },
      { cx: 22, cy: 54, r: 1.5, fill: 'rgba(45,95,120,0.22)' },
      { cx: 58, cy: 16, r: 1.1, fill: 'rgba(45,95,120,0.16)' },
    ],
    glare: [
      { d: 'M28 24 C42 18, 56 22, 70 32', width: 2.9, opacity: 0.6 },
      { d: 'M36 30 C48 28, 58 32, 66 38', width: 1.2, opacity: 0.24 },
    ],
    ripples: [
      { d: 'M26 50 C40 46, 54 48, 68 53', width: 1.05, opacity: 0.34 },
      { d: 'M32 60 C44 58, 54 58, 62 61', width: 0.8, opacity: 0.2 },
    ],
  },
]
