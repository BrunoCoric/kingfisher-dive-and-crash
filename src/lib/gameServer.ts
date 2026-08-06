/** boardgame.io Lobby + Socket.IO base URL (no trailing slash). */
export function gameServerUrl(): string {
  const fromEnv = import.meta.env.VITE_GAME_SERVER as string | undefined
  if (fromEnv && fromEnv.length > 0) return fromEnv.replace(/\/$/, '')

  // Built UI served by the game server (local tunnel / same-origin share).
  if (typeof window !== 'undefined' && !import.meta.env.DEV) {
    return window.location.origin
  }

  // Vite `npm run dev` talks to the local game server.
  return 'http://localhost:8000'
}

export const GAME_NAME = 'kingfisher'
