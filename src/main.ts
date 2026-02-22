import { createDefaultSettings } from './settings.ts';
import { createBoids } from './simulation/boid.ts';
import { tick, applyExplosion, type MouseState } from './simulation/loop.ts';
import { SpatialGrid } from './spatial/grid.ts';
import { initApp, createTriangleTexture } from './renderer/pixi-app.ts';
import { BoidsView } from './renderer/boids-view.ts';
import { Overlays } from './renderer/overlays.ts';
import { createPanel } from './ui/panel.ts';
import type { Boid } from './simulation/boid.ts';

const settings = createDefaultSettings();
let boids: Boid[] = [];
const grid = new SpatialGrid();
let paused = false;

const mouse: MouseState = { x: 0, y: 0, force: 0 };

async function main() {
  const app = await initApp();
  const texture = createTriangleTexture(app);

  let boidsView = new BoidsView(app, texture);
  const overlays = new Overlays(app);

  function getWidth(): number { return app.screen.width; }
  function getHeight(): number { return app.screen.height; }

  function restart(): void {
    boids = createBoids(settings.boidCount, getWidth(), getHeight(), settings.minSpeed, settings.maxSpeed);
    boidsView.syncCount(boids);
  }

  function exportSettings(): void {
    const json = JSON.stringify(settings, null, 2);
    navigator.clipboard.writeText(json).then(() => {
      console.log('Settings copied to clipboard');
    });
  }

  function importSettings(): void {
    const json = prompt('Paste settings JSON:');
    if (!json) return;
    try {
      const parsed = JSON.parse(json);
      Object.assign(settings, parsed);
      gui.controllersRecursive().forEach(c => c.updateDisplay());
      restart();
    } catch {
      alert('Invalid JSON');
    }
  }

  const gui = createPanel(settings, {
    onRestart: restart,
    onExport: exportSettings,
    onImport: importSettings,
  });

  restart();

  const canvas = app.canvas;

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - rect.left) * (getWidth() / rect.width);
    mouse.y = (e.clientY - rect.top) * (getHeight() / rect.height);
  });

  canvas.addEventListener('mousedown', (e: MouseEvent) => {
    if (e.button === 0) mouse.force = 3;
    else if (e.button === 2) mouse.force = -3;
  });

  canvas.addEventListener('mouseup', () => { mouse.force = 0; });
  canvas.addEventListener('mouseleave', () => { mouse.force = 0; });
  canvas.addEventListener('contextmenu', (e: MouseEvent) => e.preventDefault());

  canvas.addEventListener('dblclick', () => {
    applyExplosion(boids, mouse.x, mouse.y, settings.visionRadius * 3, 8);
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.target !== document.body) return;
    if (e.code === 'Space') {
      e.preventDefault();
      paused = !paused;
    } else if (e.code === 'Period' && paused) {
      stepOnce();
    }
  });

  function stepOnce(): void {
    tick(boids, grid, settings, 1, getWidth(), getHeight(), mouse);
    boidsView.update(boids, settings);
    overlays.update(boids, settings, grid, getWidth(), getHeight(), 16.67);
  }

  app.ticker.add((ticker) => {
    if (paused) return;
    const dt = Math.min(ticker.deltaTime, 3);
    tick(boids, grid, settings, dt, getWidth(), getHeight(), mouse);
    boidsView.update(boids, settings);
    overlays.update(boids, settings, grid, getWidth(), getHeight(), ticker.deltaMS);
  });
}

main();
