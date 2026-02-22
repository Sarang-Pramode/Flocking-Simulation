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

This demo implements classic Reynolds-style boids as a foundation. The long-term goal is to implement and extend the Flock2 model from:

> "Orientation-based social flocking" -- Journal of Theoretical Biology, 2024
> ([doi:10.1016/j.jtbi.2024.111844](https://doi.org/10.1016/j.jtbi.2024.111844))

Flock2 decouples social rules (producing heading targets) from an aerodynamic flight model (lift/drag/thrust/gravity) that produces physically plausible motion with energy accounting.

### Roadmap

- **v1** (current): 2D Reynolds boids with interactive demo
- **v2**: 3D rendering + camera controls
- **v3**: Flock2 aerodynamic model integration
- **v4**: Comparative analysis and research publication

## License

MIT
