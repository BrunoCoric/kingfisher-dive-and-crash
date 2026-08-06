/** Per-zone watercolor puddle silhouettes + pigment recipes (viewBox 100×80). */

export interface Bloom {
  cx: number
  cy: number
  rx: number
  ry: number
  fill: string
}

export interface WashRecipe {
  /** Organic outer silhouette — unique per zone. */
  path: string
  blooms: Bloom[]
  speckles: Array<{ cx: number; cy: number; r: number; fill: string }>
  /** Mid / deep wash colors for the SVG fill gradient. */
  mid: string
  deep: string
  light: string
}

export const WATER_RECIPES: WashRecipe[] = [
  {
    // sunlit shallow — left bulge, soft right notch
    path: 'M8,38 C6,22 18,10 34,8 C48,6 62,10 74,14 C88,20 96,32 94,46 C92,60 78,72 58,74 C40,76 22,70 12,58 C6,50 9,44 8,38 Z',
    mid: '#6eb0c6',
    deep: '#3f829a',
    light: '#c2dde8',
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
  },
  {
    // cool mid-channel — wavy top, fuller belly
    path: 'M10,42 C8,26 16,12 30,9 C44,6 52,14 66,11 C80,8 94,18 95,36 C96,52 86,68 68,73 C50,78 28,74 16,62 C8,54 11,48 10,42 Z',
    mid: '#589fba',
    deep: '#367492',
    light: '#aed4e4',
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
  },
  {
    // greenish shallows — pinched waist
    path: 'M12,36 C7,22 20,11 36,10 C50,9 58,16 70,13 C86,9 97,24 94,40 C91,56 80,70 60,74 C42,78 24,72 14,58 C8,50 14,44 12,36 Z',
    mid: '#5aa8a8',
    deep: '#3a7d82',
    light: '#b8d8d8',
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
  },
  {
    // deeper pool — right-heavy, low belly
    path: 'M9,40 C10,24 22,12 40,10 C56,8 72,12 84,18 C96,26 98,40 92,52 C86,66 70,76 50,76 C30,76 14,68 8,54 C5,46 8,44 9,40 Z',
    mid: '#4f96b4',
    deep: '#2f6e8c',
    light: '#a8cee0',
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
  },
  {
    // dappled glare — scalloped top edge
    path: 'M7,44 C6,28 14,14 28,10 C38,7 46,14 56,9 C68,4 82,12 90,24 C98,38 96,54 84,66 C70,78 48,80 30,74 C16,70 8,58 7,44 Z',
    mid: '#68adc4',
    deep: '#3d7f98',
    light: '#c8e0ea',
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
  },
  {
    // downstream — elongated, cooler foam lip
    path: 'M6,38 C8,22 24,10 42,8 C60,6 78,12 88,22 C98,34 97,50 88,62 C78,74 58,78 38,76 C20,74 6,62 5,48 C4,42 5,40 6,38 Z',
    mid: '#569ebc',
    deep: '#35708f',
    light: '#b0d4e6',
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
  },
  {
    // last pool — soft asymmetric lobe
    path: 'M11,40 C9,26 18,12 34,9 C50,6 64,12 76,16 C90,22 98,36 93,50 C88,66 70,76 50,77 C32,78 16,70 10,56 C7,48 12,44 11,40 Z',
    mid: '#5a9ab8',
    deep: '#3a7294',
    light: '#b4d0e4',
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
  },
]
