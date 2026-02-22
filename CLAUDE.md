# CLAUDE.md — Project Instructions for AI Agents

## Project overview

This is a **2D boids flocking simulation** built as a stepping stone toward a research implementation of "orientation-based social flocking" (Flock2). Demo v1 implements classic Reynolds-style steering (separation, alignment, cohesion) with a spatial grid for performance, PixiJS for rendering, and a full interactive control panel.

Long-term goal: extend to 3D murmuration with aerodynamic flight model (lift/drag/thrust/gravity) per the Flock2 paper (doi:10.1016/j.jtbi.2024.111844).

## Quick start

```bash
npm install
npm run dev        # Vite dev server at http://localhost:5173
```

## Architecture — 4 modules

| Module | Directory | Responsibility |
|--------|-----------|----------------|
| Simulation Core | `src/simulation/` | Boid state (pos, vel), steering vectors, integration, boundaries |
| Spatial Index | `src/spatial/` | Uniform grid for O(1)-amortized neighbor queries |
| Renderer | `src/renderer/` | PixiJS WebGL canvas, triangle boids, overlays |
| UI / Controls | `src/ui/` | lil-gui panel writing into a single `settings` object |

Data flow each frame:
`settings` → spatial grid clear+insert → per-boid neighbor query → steering (S/A/C + noise) → clamp → integrate (drag, speed bounds) → boundary → renderer update.

## Key conventions

- **Single settings object** (`src/settings.ts`): all simulation + visual parameters live here. UI reads/writes this object. It must be JSON-serializable.
- **No O(N²) neighbor search**: always use the spatial grid (`src/spatial/grid.ts`). Cell size = `visionRadius`. Query the boid's cell + 8 surrounding cells. Cap neighbors at `movementAccuracy`.
- **No per-frame allocations in the hot loop**: reuse arrays/buffers. Pre-allocate neighbor lists.
- **TypeScript throughout**: use interfaces for `Boid`, `Vec2`, `Settings`.

## Steering formulas (Reynolds 2D)

Separation: `S = Σ (p_i - p_j) / (|Δ|² + ε)`
Alignment: `A = normalize(mean(v_j)) - normalize(v_i)`
Cohesion: `C = mean(p_j) - p_i`

Combined: `u = w_sep * normalize(S) + w_align * normalize(A) + w_coh * normalize(C) + w_noise * η`
Clamp: `u = clampMagnitude(u, steeringForce)`
Integrate: `v += u; v *= (1 - drag); v = clampSpeed(v, minSpeed, maxSpeed); p += v * dt`

Particle mode: set `w_sep = w_align = w_coh = 0`, keep noise + drag + user forces.

## File layout

```
src/
  main.ts              # entry: init app, run loop
  settings.ts          # Settings interface + defaults
  simulation/
    boid.ts            # Boid type
    steering.ts        # S, A, C, combine, clamp
    bounds.ts          # bounce / wrap
    loop.ts            # per-frame tick
  spatial/
    grid.ts            # uniform grid insert/query
  renderer/
    pixi-app.ts        # PixiJS init, resize, DPI
    boids-view.ts      # triangle rendering, hue-by-speed
    overlays.ts        # vision circles, direction arrows, grid, FPS
  ui/
    panel.ts           # lil-gui wired to settings
```

## Performance targets

- ≥60 fps with ~1,000 boids on a modern laptop
- ≥30 fps with ~3,000 boids (or auto-warn and suggest reducing movementAccuracy / boidCount)
- Spatial grid cell size = visionRadius; query 3×3 neighborhood only
- movementAccuracy caps how many neighbors each boid considers

## Testing & verification

- Run `npm run dev` and confirm flocking behavior (boids form groups, avoid collisions, align headings).
- Toggle particle mode: boids should scatter with only noise/drag.
- Toggle bounce vs wrap: boids should reflect off edges or appear on opposite side.
- UI sliders should update behavior in real time without restart (except boidCount which triggers restart).
- FPS overlay should show stable frame rate.

## What is out of scope for Demo v1

- 3D rendering / murmuration
- Flock2 aerodynamic model (lift/drag/thrust/gravity)
- STFT wave analytics
- Predator agents
- Web Workers / multi-threading
