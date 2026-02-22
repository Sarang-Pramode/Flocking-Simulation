import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

export interface ThreeApp {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
}

export function initThreeApp(): ThreeApp {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0a0a1a);
  document.body.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    1,
    10000,
  );
  camera.position.set(500, 400, 1200);
  camera.lookAt(500, 400, 400);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(500, 400, 400);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.update();

  const ambient = new THREE.AmbientLight(0x334466, 1.5);
  scene.add(ambient);
  const dir = new THREE.DirectionalLight(0xffffff, 1.2);
  dir.position.set(500, 800, 1000);
  scene.add(dir);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return { renderer, scene, camera, controls };
}
