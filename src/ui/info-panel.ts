export function createInfoPanel(): HTMLElement {
  const panel = document.createElement('div');
  panel.id = 'info-panel';

  const toggle = document.createElement('button');
  toggle.id = 'info-toggle';
  toggle.textContent = '? Info';
  toggle.title = 'Toggle simulation reference';

  const content = document.createElement('div');
  content.id = 'info-content';
  content.innerHTML = `
<h2>Flocking Simulation Reference</h2>

<details open>
  <summary>Overview</summary>
  <p>This simulation implements <strong>Craig Reynolds' Boids</strong> (1986) — autonomous agents
  following three simple local rules that produce emergent flocking behavior. Each boid only sees
  neighbors within its <em>vision radius</em> and reacts to at most <em>movement accuracy</em> of them.</p>
</details>

<details>
  <summary>Parameters</summary>
  <dl>
    <dt>Boid Count</dt>
    <dd>Total number of agents in the simulation. More boids = richer emergent patterns but higher computational cost.</dd>

    <dt>Vision Radius</dt>
    <dd>How far each boid can "see." Defines the neighborhood sphere. Only boids within this distance are considered neighbors.</dd>

    <dt>Movement Accuracy</dt>
    <dd>Maximum number of neighbors each boid considers per frame. Caps computation under high density — acts as a perceptual limit.</dd>

    <dt>Alignment</dt>
    <dd>Weight for velocity matching. High values cause boids to fly in parallel; low values let headings diverge.</dd>

    <dt>Cohesion</dt>
    <dd>Weight for steering toward the centroid of neighbors. High values create tight clusters; low values let groups spread.</dd>

    <dt>Separation</dt>
    <dd>Weight for avoiding nearby boids. High values prevent crowding; too high causes the flock to explode apart.</dd>

    <dt>Steering Force</dt>
    <dd>Maximum magnitude of the combined steering vector. Acts as a turn-rate limiter — lower values make smoother, more realistic turns.</dd>

    <dt>Min / Max Speed</dt>
    <dd>Speed clamp applied after integration. Prevents boids from stopping or accelerating unrealistically.</dd>

    <dt>Drag</dt>
    <dd>Velocity damping each frame: <code>v *= (1 - drag)</code>. Simulates air/fluid resistance. Higher drag = slower convergence.</dd>

    <dt>Randomness</dt>
    <dd>Weight for a random noise vector added each frame. Prevents perfect crystalline formations and adds organic feel.</dd>

    <dt>Bounce Edges / Wrap</dt>
    <dd>Boundary behavior. Bounce reflects velocity at walls; wrap teleports boids to the opposite edge (toroidal space).</dd>

    <dt>Particle Mode</dt>
    <dd>Disables all flocking forces (S/A/C = 0). Only noise, drag, and mouse interaction remain. Useful for testing input forces.</dd>

    <dt>Boid Size</dt>
    <dd>Visual scale of each cone. Does not affect simulation physics.</dd>

    <dt>World Depth (3D only)</dt>
    <dd>Z-axis extent of the bounding box in 3D mode.</dd>
  </dl>
</details>

<details>
  <summary>Steering Formulas</summary>
  <p>For each boid <em>i</em> with position <strong>p</strong> and velocity <strong>v</strong>, given neighbors <em>N(i)</em>:</p>

  <h4>Separation</h4>
  <p class="formula">S = &Sigma;<sub>j&isin;N</sub> (p<sub>i</sub> &minus; p<sub>j</sub>) / (|p<sub>i</sub> &minus; p<sub>j</sub>|&sup2; + &epsilon;)</p>
  <p>Inverse-square repulsion — nearer neighbors exert much stronger push.</p>

  <h4>Alignment</h4>
  <p class="formula">A = normalize(mean(v&#x302;<sub>j</sub>)) &minus; v&#x302;<sub>i</sub></p>
  <p>Steer toward the average heading of neighbors.</p>

  <h4>Cohesion</h4>
  <p class="formula">C = mean(p<sub>j</sub>) &minus; p<sub>i</sub></p>
  <p>Steer toward the centroid of the neighborhood.</p>

  <h4>Combined Steering</h4>
  <p class="formula">u = w<sub>sep</sub>&middot;S&#x302; + w<sub>align</sub>&middot;A&#x302; + w<sub>coh</sub>&middot;C&#x302; + w<sub>noise</sub>&middot;&eta;</p>
  <p class="formula">u = clamp(u, steeringForce)</p>

  <h4>Integration</h4>
  <p class="formula">v &larr; v + u<br/>
  v &larr; v &middot; (1 &minus; drag)<br/>
  v &larr; clampSpeed(v, min, max)<br/>
  p &larr; p + v &middot; &Delta;t</p>
</details>

<details>
  <summary>Spatial Grid</summary>
  <p>Neighbor search uses a <strong>uniform spatial grid</strong> (cell size = vision radius).
  Each frame: clear grid &rarr; insert all boids &rarr; for each boid, query its cell + 26 surrounding cells (3&times;3&times;3 in 3D).
  This reduces neighbor search from O(N&sup2;) to O(N&middot;K) where K = movementAccuracy.</p>
</details>

<details>
  <summary>Interactions</summary>
  <dl>
    <dt>2D Mode</dt>
    <dd>Left-click: attract &nbsp;|&nbsp; Right-click: repel &nbsp;|&nbsp; Double-click: explosion</dd>
    <dt>3D Mode</dt>
    <dd>Shift+Left-click: attract &nbsp;|&nbsp; Shift+Right-click: repel &nbsp;|&nbsp; Double-click: explosion<br/>
    Left-drag: orbit &nbsp;|&nbsp; Right-drag: pan &nbsp;|&nbsp; Scroll: zoom</dd>
    <dt>Keyboard</dt>
    <dd>Space: pause/resume &nbsp;|&nbsp; Period (.): single step</dd>
  </dl>
</details>

<details>
  <summary>Research Context</summary>
  <p>This demo is a stepping stone toward implementing <strong>Flock2</strong> — an orientation-based
  social flocking model that decouples social rules (heading targets) from an aerodynamic flight model
  (lift/drag/thrust/gravity) for physically plausible motion with energy accounting.</p>
  <p><em>Reference:</em> "Orientation-based social flocking" — Journal of Theoretical Biology, 2024
  (<a href="https://doi.org/10.1016/j.jtbi.2024.111844" target="_blank" rel="noopener">doi:10.1016/j.jtbi.2024.111844</a>)</p>
</details>
`;

  let expanded = false;
  content.style.display = 'none';

  toggle.addEventListener('click', () => {
    expanded = !expanded;
    content.style.display = expanded ? 'block' : 'none';
    toggle.textContent = expanded ? '< Close' : '? Info';
  });

  panel.appendChild(toggle);
  panel.appendChild(content);
  document.body.appendChild(panel);

  return panel;
}
