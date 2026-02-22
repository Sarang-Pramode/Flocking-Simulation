import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import type { Boid } from '../simulation/boid.ts';
import type { Settings } from '../settings.ts';
import type { SpatialGrid } from '../spatial/grid.ts';

const MAX_OVERLAY_BOIDS = 150;

export class Overlays {
  private gfx: Graphics;
  private fpsText: Text;
  private frameTimesMs: number[] = [];
  private frameIdx = 0;

  constructor(private app: Application) {
    this.gfx = new Graphics();
    app.stage.addChild(this.gfx);

    this.fpsText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 14,
        fill: 0xaaaaaa,
      }),
    });
    this.fpsText.x = 8;
    this.fpsText.y = 8;
    this.fpsText.visible = false;
    app.stage.addChild(this.fpsText);
  }

  update(
    boids: Boid[],
    settings: Settings,
    grid: SpatialGrid,
    width: number,
    height: number,
    deltaMs: number,
  ): void {
    this.gfx.clear();

    this.updateFps(deltaMs, settings.showDebugInfo, boids.length);

    if (settings.showSpatialSubdivision) {
      this.drawGrid(grid, width, height);
    }

    const drawVisionAreas = settings.showVisionAreas;
    const drawVisionOutlines = settings.showVisionOutlines;
    const drawDirections = settings.showDesiredDirections;

    if (drawVisionAreas || drawVisionOutlines || drawDirections) {
      const limit = Math.min(boids.length, MAX_OVERLAY_BOIDS);
      for (let i = 0; i < limit; i++) {
        const b = boids[i];
        if (drawVisionAreas) {
          this.gfx.circle(b.x, b.y, settings.visionRadius);
          this.gfx.fill({ color: 0x3366ff, alpha: 0.04 });
        }
        if (drawVisionOutlines) {
          this.gfx.circle(b.x, b.y, settings.visionRadius);
          this.gfx.stroke({ color: 0x3366ff, alpha: 0.15, width: 1 });
        }
        if (drawDirections) {
          const scale = 20;
          this.gfx.moveTo(b.x, b.y);
          this.gfx.lineTo(b.x + b.dx * scale, b.y + b.dy * scale);
          this.gfx.stroke({ color: 0xff6644, alpha: 0.5, width: 1 });
        }
      }
    }
  }

  private updateFps(deltaMs: number, show: boolean, boidCount: number): void {
    this.fpsText.visible = show;
    if (!show) return;

    if (this.frameTimesMs.length < 60) {
      this.frameTimesMs.push(deltaMs);
    } else {
      this.frameTimesMs[this.frameIdx % 60] = deltaMs;
    }
    this.frameIdx++;

    const avg = this.frameTimesMs.reduce((a, b) => a + b, 0) / this.frameTimesMs.length;
    const fps = Math.round(1000 / avg);
    this.fpsText.text = `${fps} fps | ${boidCount} boids`;
  }

  private drawGrid(grid: SpatialGrid, width: number, height: number): void {
    const cs = grid.getCellSize();
    this.gfx.setStrokeStyle({ color: 0x334455, alpha: 0.25, width: 1 });
    for (let x = 0; x <= width; x += cs) {
      this.gfx.moveTo(x, 0);
      this.gfx.lineTo(x, height);
    }
    for (let y = 0; y <= height; y += cs) {
      this.gfx.moveTo(0, y);
      this.gfx.lineTo(width, y);
    }
    this.gfx.stroke();
  }
}
