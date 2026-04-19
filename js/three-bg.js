// ==========================================
//  THREE.JS PARTICLE BACKGROUND
//  Ghost Purple Nebula — Interactive
// ==========================================

(function() {
  'use strict';

  const canvas = document.getElementById('three-canvas');
  if (!canvas || !window.THREE) return;

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  camera.position.z = 80;

  // ── PARTICLES ──────────────────────────────
  const PARTICLE_COUNT = 5500;
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors    = new Float32Array(PARTICLE_COUNT * 3);
  const sizes     = new Float32Array(PARTICLE_COUNT);
  const velocities = [];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;

    positions[i3]     = (Math.random() - 0.5) * 260;
    positions[i3 + 1] = (Math.random() - 0.5) * 180;
    positions[i3 + 2] = (Math.random() - 0.5) * 120;

    // Purple / white color palette
    const t = Math.random();
    if (t < 0.5) {
      // ghost purple
      colors[i3]     = 0.75 + Math.random() * 0.25;
      colors[i3 + 1] = 0.35 + Math.random() * 0.15;
      colors[i3 + 2] = 1.0;
    } else if (t < 0.75) {
      // bright white
      colors[i3] = colors[i3 + 1] = colors[i3 + 2] = 0.9 + Math.random() * 0.1;
    } else {
      // deep violet
      colors[i3]     = 0.5 + Math.random() * 0.2;
      colors[i3 + 1] = 0.1;
      colors[i3 + 2] = 0.85 + Math.random() * 0.15;
    }

    sizes[i] = Math.random() * 3.8 + 1.2;

    velocities.push({
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.015,
      z: (Math.random() - 0.5) * 0.008,
    });
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color',    new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size',     new THREE.BufferAttribute(sizes, 1));

  // Circular particle texture via canvas
  const texCanvas = document.createElement('canvas');
  texCanvas.width = texCanvas.height = 64;
  const ctx = texCanvas.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0,   'rgba(255,255,255,1)');
  grad.addColorStop(0.3, 'rgba(200,128,255,0.8)');
  grad.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(texCanvas);

  const material = new THREE.PointsMaterial({
    size: 1.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    alphaMap: texture,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  // ── NEBULA MESH (background glow) ──────────
  const nebulaGeo   = new THREE.SphereGeometry(50, 32, 32);
  const nebulaMat   = new THREE.MeshBasicMaterial({
    color: 0x7c3aed,
    transparent: true,
    opacity: 0.03,
    side: THREE.BackSide,
  });
  scene.add(new THREE.Mesh(nebulaGeo, nebulaMat));

  // ── MOUSE INTERACTION ─────────────────────
  const mouse = { x: 0, y: 0, prevX: 0, prevY: 0 };
  let targetRotX = 0, targetRotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouse.prevX = mouse.x; mouse.prevY = mouse.y;
    mouse.x = (e.clientX / window.innerWidth  - 0.5);
    mouse.y = (e.clientY / window.innerHeight - 0.5);
  });

  // ── ANIMATION LOOP ────────────────────────
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();

    // Animate particle positions
    const pos = geometry.attributes.position.array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      pos[i3]     += velocities[i].x;
      pos[i3 + 1] += velocities[i].y;
      pos[i3 + 2] += velocities[i].z;

      // Wrap around bounds
      if (Math.abs(pos[i3])     > 130) velocities[i].x *= -1;
      if (Math.abs(pos[i3 + 1]) > 90)  velocities[i].y *= -1;
      if (Math.abs(pos[i3 + 2]) > 60)  velocities[i].z *= -1;
    }
    geometry.attributes.position.needsUpdate = true;

    // Slow drift + mouse parallax
    targetRotY = mouse.x * 0.15;
    targetRotX = mouse.y * 0.08;

    particles.rotation.y += (targetRotY - particles.rotation.y) * 0.02;
    particles.rotation.x += (targetRotX - particles.rotation.x) * 0.02;
    particles.rotation.z  = elapsed * 0.04;

    renderer.render(scene, camera);
  }
  animate();

  // ── RESIZE ───────────────────────────────
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

})();
