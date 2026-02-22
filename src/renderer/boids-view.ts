import { Application, ParticleContainer, Particle, Texture } from 'pixi.js';
import type { Boid } from '../simulation/boid.ts';
import type { Settings } from '../settings.ts';
import { TRIANGLE_ANCHOR_X, TRIANGLE_ANCHOR_Y } from './pixi-app.ts';

function hslToHex(h: number, s: number, l: number): number {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }
  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);
  return (ri << 16) | (gi << 8) | bi;
}

export class BoidsView {
  private container: ParticleContainer;
  private particles: Particle[] = [];
  private texture: Texture;

  constructor(private app: Application, texture: Texture) {
    this.texture = texture;
    this.container = new ParticleContainer({
      dynamicProperties: {
        position: true,
        rotation: true,
        tint: true,
      },
    });
    app.stage.addChild(this.container);
  }

  syncCount(boids: Boid[]): void {
    while (this.particles.length < boids.length) {
      const p = new Particle(this.texture);
      p.anchorX = TRIANGLE_ANCHOR_X;
      p.anchorY = TRIANGLE_ANCHOR_Y;
      this.particles.push(p);
      this.container.addParticle(p);
    }
    while (this.particles.length > boids.length) {
      const p = this.particles.pop()!;
      this.container.removeParticle(p);
    }
  }

  update(boids: Boid[], settings: Settings): void {
    this.container.visible = !settings.hideBoids;
    if (settings.hideBoids) return;

    const speedRange = settings.maxSpeed - settings.minSpeed;
    const useHue = settings.hueBySpeed;

    for (let i = 0; i < boids.length; i++) {
      const b = boids[i];
      const p = this.particles[i];
      p.x = b.x;
      p.y = b.y;
      p.rotation = Math.atan2(b.vy, b.vx);

      if (useHue) {
        const speed = Math.sqrt(b.vx * b.vx + b.vy * b.vy);
        const t = Math.min(Math.max((speed - settings.minSpeed) / (speedRange + 0.001), 0), 1);
        p.tint = hslToHex(240 - t * 240, 0.9, 0.55);
      } else {
        p.tint = 0x88ccff;
      }
    }
  }

  destroy(): void {
    this.app.stage.removeChild(this.container);
    this.container.destroy();
    this.particles = [];
  }
}
