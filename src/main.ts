import * as THREE from 'three';
import { createDefaultSettings } from './settings.ts';
import { createBoids } from './simulation/boid.ts';
import { tick, applyExplosion, type MouseState } from './simulation/loop.ts';
import { SpatialGrid } from './spatial/grid.ts';
import { initThreeApp, type ThreeApp } from './renderer/three-app.ts';
import { BoidsView } from './renderer/boids-view.ts';
import { Overlays } from './renderer/overlays.ts';
import { createPanel } from './ui/panel.ts';
import { createInfoPanel } from './ui/info-panel.ts';
import type { Boid } from './simulation/boid.ts';

const settings = createDefaultSettings();
let boids: Boid[] = [];
const grid = new SpatialGrid();
let paused = false;
let shiftHeld = false;

const mouse: MouseState = { x: 0, y: 0, z: 0, force: 0 };

const raycaster = new THREE.Raycaster();
const ndcMouse = new THREE.Vector2();
const intersectPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const intersectPoint = new THREE.Vector3();

function main() {
  const app: ThreeApp = initThreeApp();
  const { renderer, scene, camera, controls } = app;

  const boidsView = new BoidsView(scene, settings.boidCount);
  const overlays = new Overlays(scene);

  function getWidth(): number { return window.innerWidth; }
  function getHeight(): number { return window.innerHeight; }
  function getDepth(): number { return settings.mode3D ? settings.worldDepth : 1; }

  function restart(): void {
    boids = createBoids(
      settings.boidCount, getWidth(), getHeight(), getDepth(),
      settings.minSpeed, settings.maxSpeed, settings.mode3D,
    );
    boidsView.syncCount(boids.length);
  }

  function applyCamera(): void {
    const w = getWidth();
    const h = getHeight();
    const d = getDepth();
    if (settings.mode3D) {
      camera.position.set(w / 2, h / 2, d + 800);
      controls.target.set(w / 2, h / 2, d / 2);
      controls.enableRotate = true;
    } else {
      camera.position.set(w / 2, h / 2, Math.max(w, h) * 1.1);
      controls.target.set(w / 2, h / 2, 0);
      controls.enableRotate = false;
    }
    controls.update();
  }

  function onModeSwitch(): void {
    restart();
    applyCamera();
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
      applyCamera();
    } catch {
      alert('Invalid JSON');
    }
  }

  function resetCamera(): void {
    applyCamera();
  }

  const gui = createPanel(settings, {
    onRestart: restart,
    onExport: exportSettings,
    onImport: importSettings,
    onResetCamera: resetCamera,
    onModeSwitch: onModeSwitch,
  });

  createInfoPanel();

  restart();
  applyCamera();

  const canvas = renderer.domElement;

  function updateMouseWorld(e: MouseEvent): void {
    const rect = canvas.getBoundingClientRect();
    ndcMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    ndcMouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(ndcMouse, camera);

    if (settings.mode3D) {
      const camDir = camera.getWorldDirection(new THREE.Vector3());
      intersectPlane.set(camDir.clone(), -controls.target.dot(camDir));
    } else {
      intersectPlane.set(new THREE.Vector3(0, 0, 1), 0);
    }

    if (raycaster.ray.intersectPlane(intersectPlane, intersectPoint)) {
      mouse.x = intersectPoint.x;
      mouse.y = intersectPoint.y;
      mouse.z = settings.mode3D ? intersectPoint.z : 0;
    }
  }

  canvas.addEventListener('mousemove', (e: MouseEvent) => {
    updateMouseWorld(e);
  });

  canvas.addEventListener('mousedown', (e: MouseEvent) => {
    if (settings.mode3D && !shiftHeld) return;
    updateMouseWorld(e);
    if (e.button === 0) mouse.force = 3;
    else if (e.button === 2) mouse.force = -3;
  });

  canvas.addEventListener('mouseup', () => { mouse.force = 0; });
  canvas.addEventListener('mouseleave', () => { mouse.force = 0; });
  canvas.addEventListener('contextmenu', (e: MouseEvent) => {
    if (!settings.mode3D || shiftHeld) e.preventDefault();
  });

  canvas.addEventListener('dblclick', () => {
    applyExplosion(boids, mouse.x, mouse.y, mouse.z, settings.visionRadius * 3, 8);
  });

  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Shift') shiftHeld = true;
    if (e.target !== document.body) return;
    if (e.code === 'Space') {
      e.preventDefault();
      paused = !paused;
    } else if (e.code === 'Period' && paused) {
      stepOnce();
    }
  });

  window.addEventListener('keyup', (e: KeyboardEvent) => {
    if (e.key === 'Shift') shiftHeld = false;
  });

  function stepOnce(): void {
    tick(boids, grid, settings, 1, getWidth(), getHeight(), getDepth(), mouse);
    boidsView.update(boids, settings);
    overlays.update(boids, settings, getWidth(), getHeight(), getDepth(), 16.67);
  }

  let lastTime = performance.now();

  function animate(): void {
    requestAnimationFrame(animate);
    controls.update();

    const now = performance.now();
    const deltaMs = now - lastTime;
    lastTime = now;
    const deltaS = deltaMs / 1000;

    if (!paused) {
      const dt = Math.min(deltaS * 60, 3);
      tick(boids, grid, settings, dt, getWidth(), getHeight(), getDepth(), mouse);
    }

    renderer.setClearColor(settings.backgroundColor);
    boidsView.update(boids, settings);
    overlays.update(boids, settings, getWidth(), getHeight(), getDepth(), deltaMs);
    renderer.render(scene, camera);
  }

  animate();
}

main();
