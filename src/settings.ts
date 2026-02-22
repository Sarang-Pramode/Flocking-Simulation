export interface Settings {
  // Simulation
  boidCount: number;
  visionRadius: number;
  movementAccuracy: number;
  alignmentForce: number;
  cohesionForce: number;
  separationForce: number;
  steeringForce: number;
  minSpeed: number;
  maxSpeed: number;
  drag: number;
  randomness: number;
  bounceEdges: boolean;
  particleMode: boolean;

  // Visual
  hideBoids: boolean;
  showDesiredDirections: boolean;
  hueBySpeed: boolean;
  showVisionAreas: boolean;
  showVisionOutlines: boolean;
  showDebugInfo: boolean;
  showSpatialSubdivision: boolean;
}

export function createDefaultSettings(): Settings {
  return {
    boidCount: 1000,
    visionRadius: 50,
    movementAccuracy: 16,
    alignmentForce: 1.0,
    cohesionForce: 1.0,
    separationForce: 1.5,
    steeringForce: 0.5,
    minSpeed: 1.0,
    maxSpeed: 4.0,
    drag: 0.02,
    randomness: 0.1,
    bounceEdges: true,
    particleMode: false,

    hideBoids: false,
    showDesiredDirections: false,
    hueBySpeed: false,
    showVisionAreas: false,
    showVisionOutlines: false,
    showDebugInfo: false,
    showSpatialSubdivision: false,
  };
}

export function resetSettings(target: Settings): void {
  Object.assign(target, createDefaultSettings());
}
