# Demo v1 Specification

## Parameters

### Simulation

| Parameter | Range | Default | Description |
|-----------|-------|---------|-------------|
| boidCount | 100 -- 10000 | 1000 | Number of boids (restart on change) |
| visionRadius | 5 -- 200 | 50 | How far each boid can see |
| movementAccuracy | 1 -- 64 | 16 | Max neighbors considered per boid |
| alignmentForce | 0 -- 3 | 1.0 | Weight for alignment steering |
| cohesionForce | 0 -- 3 | 1.0 | Weight for cohesion steering |
| separationForce | 0 -- 3 | 1.5 | Weight for separation steering |
| steeringForce | 0 -- 3 | 0.5 | Max magnitude of combined steering |
| minSpeed | 0 -- 10 | 1.0 | Minimum boid speed |
| maxSpeed | 0 -- 10 | 4.0 | Maximum boid speed |
| drag | 0 -- 0.2 | 0.02 | Velocity damping per frame |
| randomness | 0 -- 1 | 0.1 | Random noise weight |
| bounceEdges | bool | true | Bounce vs wrap at boundaries |
| particleMode | bool | false | Disable flocking, keep noise/drag |

### Visual toggles

| Toggle | Default | Description |
|--------|---------|-------------|
| hideBoids | false | Hide boid rendering |
| showDesiredDirections | false | Draw steering target vectors |
| hueBySpeed | false | Color boids by speed gradient |
| showVisionAreas | false | Draw filled vision circles |
| showVisionOutlines | false | Draw vision radius outlines |
| showDebugInfo | false | Show FPS and stats |
| showSpatialSubdivision | false | Draw spatial grid overlay |

### Buttons

- **Restart Simulation**: re-initialize all boids with current boidCount
- **Reset Settings**: restore all parameters to defaults
- **Export Settings**: copy settings JSON to clipboard
- **Import Settings**: paste JSON to restore settings

## Interactions

| Input | Action |
|-------|--------|
| Left click + hold | Attract boids toward cursor |
| Right click + hold | Repel boids from cursor |
| Double click | Explosion impulse from click point |
| Space | Pause / resume simulation |
| Period (.) | Single-step (advance one frame while paused) |

## Core formulas

### Neighborhood

For boid i, collect neighbors N(i) where distance < visionRadius.
Cap |N(i)| at movementAccuracy (keep closest K).

### Steering

```
Separation:  S = Σ_j (p_i - p_j) / (|p_i - p_j|² + ε)
Alignment:   A = normalize(mean(v_j / |v_j|)) - normalize(v_i)
Cohesion:    C = mean(p_j) - p_i

Combined:    u = w_sep * S_hat + w_align * A_hat + w_coh * C_hat + w_noise * η
Clamped:     u = clampMag(u, steeringForce)
```

### Integration

```
v_i += u
v_i *= (1 - drag)
v_i = clampSpeed(v_i, minSpeed, maxSpeed)
p_i += v_i * Δt
```

### Particle mode

w_sep = w_align = w_coh = 0; only noise, drag, and user forces active.

## Performance targets

- 60+ fps at ~1,000 boids on a modern laptop
- 30+ fps at ~3,000 boids (with graceful degradation warning)
- Spatial grid: cell size = visionRadius, query 3x3 neighborhood
- No per-frame heap allocations in simulation hot path

## Phases

- [x] Phase 0: Project scaffold (Vite + PixiJS + lil-gui)
- [ ] Phase 1: Settings object + UI panel + restart/reset
- [ ] Phase 2: Simulation core (S/A/C + spatial grid + integration)
- [ ] Phase 3: Rendering (triangles, hue-by-speed, overlays)
- [ ] Phase 4: Interactions (attract/repel, explosion, pause/step)
- [ ] Phase 5: Debug (FPS overlay, grid overlay, settings export/import)
