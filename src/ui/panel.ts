import GUI from 'lil-gui';
import type { Settings } from '../settings.ts';
import { resetSettings } from '../settings.ts';

export interface PanelCallbacks {
  onRestart: () => void;
  onExport: () => void;
  onImport: () => void;
  onResetCamera: () => void;
  onModeSwitch: () => void;
}

let styleEl: HTMLStyleElement | null = null;

function injectScalingCSS(rowH: number, fontSize: number, pad: number): void {
  if (!styleEl) {
    styleEl = document.createElement('style');
    document.head.appendChild(styleEl);
  }
  styleEl.textContent = `
    .lil-gui {
      --widget-height: ${rowH}px;
      --padding: ${pad}px;
      --font-size: ${fontSize}px;
      --input-font-size: ${fontSize}px;
      --name-width: 45%;
      font-size: ${fontSize}px !important;
    }
    .lil-gui .title {
      height: ${rowH + pad * 2}px;
      line-height: ${rowH + pad * 2}px;
      font-size: ${Math.round(fontSize * 1.05)}px;
      padding: 0 ${pad}px;
    }
    .lil-gui .controller {
      min-height: ${rowH}px;
      padding: ${pad}px ${pad}px;
      font-size: ${fontSize}px;
    }
    .lil-gui .controller .name {
      font-size: ${fontSize}px;
      line-height: ${rowH}px;
    }
    .lil-gui .controller .widget {
      min-height: ${rowH}px;
      font-size: ${fontSize}px;
    }
    .lil-gui .controller input {
      font-size: ${fontSize}px;
      height: ${rowH}px;
    }
    .lil-gui .controller .slider {
      height: ${rowH}px;
    }
    .lil-gui .controller.boolean .widget {
      min-height: ${rowH}px;
    }
    .lil-gui .controller.boolean input[type="checkbox"] {
      width: ${rowH}px;
      height: ${rowH}px;
    }
    .lil-gui .controller.function .widget {
      min-height: ${rowH}px;
    }
    .lil-gui .controller.function button {
      height: ${rowH}px;
      font-size: ${fontSize}px;
    }
  `;
}

function applyPanelSizing(gui: GUI): void {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  const w = Math.max(340, Math.round(vw * 0.25));
  gui.domElement.style.width = `${w}px`;
  gui.domElement.style.height = `${vh}px`;
  gui.domElement.style.maxHeight = `${vh}px`;
  gui.domElement.style.overflowY = 'auto';

  const totalRows = 38;
  const rowH = Math.max(18, Math.floor(vh / totalRows));
  const pad = Math.max(2, Math.floor(rowH * 0.12));
  const fontSize = Math.max(11, Math.min(18, Math.floor(vh / 52)));

  injectScalingCSS(rowH, fontSize, pad);
}

export function createPanel(settings: Settings, callbacks: PanelCallbacks): GUI {
  const gui = new GUI({ title: 'Flocking Simulation', width: Math.max(340, Math.round(window.innerWidth * 0.25)) });
  gui.domElement.style.position = 'fixed';
  gui.domElement.style.top = '0';
  gui.domElement.style.right = '0';

  applyPanelSizing(gui);
  window.addEventListener('resize', () => applyPanelSizing(gui));

  const modeFolder = gui.addFolder('Mode');
  modeFolder.add(settings, 'mode3D').name('3D Simulation').onChange(() => {
    worldDepthCtrl.domElement.parentElement!.style.display = settings.mode3D ? '' : 'none';
    callbacks.onModeSwitch();
  });

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
  const worldDepthCtrl = sim.add(settings, 'worldDepth', 200, 2000, 10).name('World Depth').onFinishChange(callbacks.onRestart);
  sim.add(settings, 'boidSize', 0.2, 5, 0.1).name('Boid Size');

  const vis = gui.addFolder('Visual');
  vis.add(settings, 'hideBoids').name('Hide Boids');
  vis.add(settings, 'showDesiredDirections').name('Direction Vectors');
  vis.add(settings, 'hueBySpeed').name('Hue by Speed');
  vis.add(settings, 'showVisionAreas').name('Vision Areas');
  vis.add(settings, 'showVisionOutlines').name('Vision Outlines');
  vis.add(settings, 'showDebugInfo').name('Debug Info (FPS)');
  vis.add(settings, 'showSpatialSubdivision').name('Bounding Box');

  const cam = gui.addFolder('Camera');
  cam.add({ reset: callbacks.onResetCamera }, 'reset').name('Reset Camera');

  const actions = gui.addFolder('Actions');
  actions.add({ restart: callbacks.onRestart }, 'restart').name('Restart Simulation');
  actions.add({
    reset: () => {
      resetSettings(settings);
      gui.controllersRecursive().forEach(c => c.updateDisplay());
      worldDepthCtrl.domElement.parentElement!.style.display = settings.mode3D ? '' : 'none';
      callbacks.onModeSwitch();
    },
  }, 'reset').name('Reset Settings');
  actions.add({ export: callbacks.onExport }, 'export').name('Export Settings');
  actions.add({ import: callbacks.onImport }, 'import').name('Import Settings');

  return gui;
}
