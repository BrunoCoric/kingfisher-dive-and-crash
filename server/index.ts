/**
 * boardgame.io match server — Lobby REST + Socket.IO + (optional) built UI.
 *
 * Dev API only:  npm run server
 * Share online:  npm run share   then in another terminal: npm run tunnel
 */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'
import serve from 'koa-static'
import { Server, Origins } from 'boardgame.io/server'
import { Game } from '../src/game/Game'

const PORT = Number(process.env.PORT ?? 8000)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distPath = path.resolve(__dirname, '../dist')
const hasDist = fs.existsSync(path.join(distPath, 'index.html'))

const server = Server({
  games: [Game],
  origins: [
    Origins.LOCALHOST,
    /http:\/\/192\.168\.\d+\.\d+:\d+/,
    /http:\/\/127\.0\.0\.1:\d+/,
    // Quick tunnels for sharing a local server with friends.
    /https:\/\/[a-z0-9-]+\.trycloudflare\.com/,
    /https:\/\/[a-z0-9-]+\.ngrok-free\.app/,
    /https:\/\/[a-z0-9-]+\.ngrok\.io/,
  ],
})

if (hasDist) {
  server.app.use(serve(distPath))
}

server.run(PORT, () => {
  if (hasDist) {
    // SPA fallback: unknown paths → index.html (after lobby routes).
    server.app.use(async (ctx, next) => {
      await serve(distPath)(Object.assign(ctx, { path: 'index.html' }), next)
    })
  }

  console.log(`kingfisher server listening on http://localhost:${PORT}`)
  if (hasDist) {
    console.log(`serving UI from ${distPath}`)
    console.log(`share: npm run tunnel  (Cloudflare quick tunnel → paste the https URL)`)
  } else {
    console.log(`no dist/ yet — run npm run build (or npm run share) to serve the UI here`)
  }
})
