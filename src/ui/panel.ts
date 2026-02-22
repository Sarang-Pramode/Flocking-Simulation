import GUI from 'lil-gui';
import type { Settings } from '../settings.ts';
import { resetSettings } from '../settings.ts';

export interface PanelCallbacks {
  onRestart: () => void;
  onExport: () => void;
  onImport: () => void;
}

function computePanelWidth(): number {
  const vw = window.innerWidth;
  if (vw >= 1920) return 340;
  if (vw >= 1440) return 310;
  if (vw >= 1024) return 280;
  return Math.max(220, Math.round(vw * 0.28));
}

function applyPanelSizing(gui: GUI): void {
  const w = computePanelWidth();
  gui.domElement.style.width = `${w}px`;

  const vh = window.innerHeight;
  const fontSize = vh >= 900 ? '13px' : vh >= 700 ? '12px' : '11px';
  gui.domElement.style.fontSize = fontSize;
  gui.domElement.style.maxHeight = `${vh}px`;
  gui.domElement.style.overflowY = 'auto';
}

export function createPanel(settings: Settings, callbacks: PanelCallbacks): GUI {
  const initialWidth = computePanelWidth();
  const gui = new GUI({ title: 'Flocking Simulation', width: initialWidth });
  gui.domElement.style.position = 'fixed';
  gui.domElement.style.top = '0';
  gui.domElement.style.right = '0';

  applyPanelSizing(gui);
  window.addEventListener('resize', () => applyPanelSizing(gui));

  const sim = gui.addFolder('Simulation');
  sim.add(settings, 'boidCount', 100, 10000, 1).name('Boid Count').onFinishChange(callbacks.onRestart);
  sim.add(settings, 'visionRadius', 5, 200, 1).name('Vision Radius');
  sim.add(settings, 'movementAccuracy', 1, 64, 1).name('Movement Accuracy');
  sim.add(settings, 'alignmentForce', 0, 3, 0.01).name('Alignment');
  sim.add(settings, 'cohesionForce', 0, 3, 0.01).name('Cohesion');
  sim.add(settings, 'separationForce', 0, 3, 0.01).name('Separation');
  sim.add(settings, 'steeringForce', 0, 3, 0.01).name('Steering Force');
  sim.add(settings, 'minSpeed', 0, 10, 0.1).name('Min Speed');
  sim.add(settings, 'maxSpeed', 0, 10, 0.1).name('Max Speed');
  sim.add(settings, 'drag', 0, 0.2, 0.001).name('Drag');
  sim.add(settings, 'randomness', 0, 1, 0.01).name('Randomness');
  sim.add(settings, 'bounceEdges').name('Bounce Edges');
  sim.add(settings, 'particleMode').name('Particle Mode');

  const vis = gui.addFolder('Visual');
  vis.add(settings, 'hideBoids').name('Hide Boids');
  vis.add(settings, 'showDesiredDirections').name('Direction Vectors');
  vis.add(settings, 'hueBySpeed').name('Hue by Speed');
  vis.add(settings, 'showVisionAreas').name('Vision Areas');
  vis.add(settings, 'showVisionOutlines').name('Vision Outlines');
  vis.add(settings, 'showDebugInfo').name('Debug Info (FPS)');
  vis.add(settings, 'showSpatialSubdivision').name('Spatial Grid');

  const actions = gui.addFolder('Actions');
  actions.add({ restart: callbacks.onRestart }, 'restart').name('Restart Simulation');
  actions.add({
    reset: () => {
      resetSettings(settings);
      gui.controllersRecursive().forEach(c => c.updateDisplay());
      callbacks.onRestart();
    },
  }, 'reset').name('Reset Settings');
  actions.add({ export: callbacks.onExport }, 'export').name('Export Settings');
  actions.add({ import: callbacks.onImport }, 'import').name('Import Settings');

  return gui;
}
