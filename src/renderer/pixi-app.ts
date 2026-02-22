import { Application, Graphics, Texture } from 'pixi.js';

export async function initApp(): Promise<Application> {
  const app = new Application();
  await app.init({
    background: '#0a0a1a',
    resizeTo: window,
    antialias: true,
    resolution: window.devicePixelRatio || 1,
    autoDensity: true,
  });
  document.body.appendChild(app.canvas);
  return app;
}

export function createTriangleTexture(app: Application): Texture {
  const W = 12;
  const H = 8;
  const g = new Graphics();
  g.poly([W, H / 2, 0, 0, 0, H]);
  g.fill({ color: 0xffffff });
  return app.renderer.generateTexture({
    target: g,
    resolution: 2,
  });
}

export const TRIANGLE_ANCHOR_X = 1 / 3;
export const TRIANGLE_ANCHOR_Y = 0.5;
