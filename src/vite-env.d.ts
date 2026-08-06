/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GAME_SERVER?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
