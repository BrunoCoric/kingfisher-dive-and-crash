# WildTracks — Agent Rules

DO NOT overthink
if you are not sure about something ask the user

## React & Components

- **Never use `useEffect`.** It is almost always a bad design choice. Prefer derived state, event handlers, and computed values from game state.
- Components should be pure functions of props and game state. Side effects belong in game moves or event handlers.
- Use the `boardgame.io` turn/move/phase system for all game logic — never sync state with `useEffect` if not needed be vary of using it.

## File Structure & Size

- **Max 200 lines per file.** Try not to have more than 200 tiles per file, of course if the file is like complicated styling or just an orchestrator that's fine.
- Keep components small and focused. Extract reusable sub-components and helper functions into separate files.
- Game logic files (`src/game/`) should separate concerns: types, moves, AI, card data each get their own file.

## TypeScript

- Use strict types. Avoid `any`.
- Define shared types in `src/game/types.ts`. Reuse them across game logic and components.
- Use `interface` for object shapes, `type` for unions and aliases.

## Game Logic (boardgame.io)

- Moves are pure functions — they mutate `G` directly (boardgame.io handles immutability under the hood).
- Keep move functions small. Delegate complex rules to helper functions in separate files.
- Use boardgame.io phases (`phases` config) to model the round/step state machine.

## CSS / Styling

- Use CSS modules (`*.module.css`) for component-scoped styles.
- Global styles go in `src/styles/`.

## Tracking Progress

- **Keep DESIGN.md up to date.** After implementing any feature, mark the corresponding checkbox in `DESIGN.md` as `[x]`. This is the single source of truth for what's done.
- If you add a feature or file not listed in DESIGN.md, add a new checkbox entry for it. If the feature is not in `README.md`, so we changed the rules of the game, update the `README.md`
- **Document new features.** When implementing something non-trivial, add a brief explanation of how it works in the relevant section of DESIGN.md or under a new subsection. This keeps the design doc useful as a reference, not just a checklist.

## Data

- Import data as typed constants, not JSON files, to get type checking.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

When the user types `/graphify`, use the installed graphify skill or instructions before doing anything else.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- Dirty graphify-out/ files are expected after hooks or incremental updates; dirty graph files are not a reason to skip graphify. Only skip graphify if the task is about stale or incorrect graph output, or the user explicitly says not to use it.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
