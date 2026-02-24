# Flocking Simulation

A high-performance 2D boids flocking simulation with interactive controls, built as a research prototype toward orientation-based social flocking (Flock2).

## Quick start

```bash
npm install
npm run dev
```

Opens at [http://localhost:5173](http://localhost:5173).

## Features (Demo v1)

**Simulation parameters** -- all adjustable in real time via the UI panel:

- Boid count (100 -- 10,000)
- Vision radius, movement accuracy (neighbor cap)
- Alignment, cohesion, separation, steering force weights
- Min/max speed, drag, movement randomness
- Bounce-off-edges vs wrap-around
- Particle mode (disables flocking forces)

**Visual toggles:**

- Desired direction vectors
- Hue by speed (smooth gradient)
- Vision circles / outlines
- Hide boids (art mode)
- FPS counter
- Spatial subdivision debug grid

**Interactions:**

- Left click: attract boids
- Right click: repel boids
- Double click: explosion impulse
- Space: pause/resume
- Period (.): single-step while paused

## Architecture

Four logically separated modules:

| Module | Path | Purpose |
|--------|------|---------|
| Simulation Core | `src/simulation/` | Boid state, Reynolds steering (S/A/C), integration, boundaries |
| Spatial Index | `src/spatial/` | Uniform grid for efficient neighbor queries |
| Renderer | `src/renderer/` | PixiJS WebGL canvas with triangle boids and overlays |
| UI / Controls | `src/ui/` | lil-gui panel bound to a single `settings` object |

## Performance

- Target: 60 fps at ~1,000 boids, 30 fps at ~3,000 boids on a modern laptop
- Spatial grid reduces neighbor search from O(N^2) to O(N*K) where K = movementAccuracy
- PixiJS batched rendering for GPU-accelerated drawing

## Tech stack

- **TypeScript** + **Vite** (dev server with hot reload)
- **PixiJS** (2D WebGL rendering)
- **lil-gui** (lightweight control panel)

## Research context

This demo build on classic Reynolds-style boids as a foundation.

## License

MIT
