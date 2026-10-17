// Procedural business jet (rear-engine, T-tail). Nose points +X, up is +Y, span along Z.
// Total length ≈ 10 units, span ≈ 10 units, centred on the origin.
import * as THREE from 'three';

// Pearl-white body with a sky-blue tail.
const PAL = { body: 0xe9eef3, accent: 0x2f7bc4, glow: 0.55 };

function fuselageGeometry() {
  const L = 10, pts = [];
  const N = 96;
  pts.push(new THREE.Vector2(0, -0.02));
  for (let i = 0; i <= N; i++) {
    const y = (i / N) * L;
    let r;
    if (y < 2.7) {
      const u = y / 2.7;
      r = 0.1 + 0.48 * Math.sin((u * Math.PI) / 2) ** 0.9;
    } else if (y < 7.8) {
      const u = (y - 2.7) / 5.1;
      r = 0.58 + 0.02 * Math.sin(u * Math.PI);
    } else {
      const u = (y - 7.8) / 2.2;
      r = 0.58 * Math.pow(1 - Math.pow(u, 2.4), 0.55);
    }
    pts.push(new THREE.Vector2(Math.max(r, 0.0001), y));
  }
  const geo = new THREE.LatheGeometry(pts, 72);

  // Sweep the tail cone upward (lathe −X becomes world +Y after rotation).
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    if (y < 2.9) p.setX(i, p.getX(i) - 0.3 * Math.pow(1 - y / 2.9, 2));
    // Slight droop of the nose.
    if (y > 8.6) p.setX(i, p.getX(i) + 0.08 * Math.pow((y - 8.6) / 1.4, 2));
  }
  geo.rotateZ(-Math.PI / 2);
  geo.translate(-5, 0, 0);
  geo.computeVertexNormals();

  // Vertex colours: white body, near-black windshield band.
  const colors = new Float32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
    const ang = Math.atan2(Math.abs(z), y); // 0 at top
    const front = x > 3.45 && x < 4.35 - Math.max(0, ang - 0.9) * 0.4;
    const shield = front && ang > 0.25 && ang < 1.35 && y > 0.05;
    const c = shield ? 0.04 : 1;
    colors.set([c, c, c], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

function planform(points, depth, bevel = 0.03) {
  const s = new THREE.Shape();
  points.forEach(([x, y], i) => (i ? s.lineTo(x, y) : s.moveTo(x, y)));
  s.closePath();
  return new THREE.ExtrudeGeometry(s, {
    depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 3, curveSegments: 4,
  });
}

function fanTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(128, 128, 4, 128, 128, 128);
  grd.addColorStop(0, '#fffaf0');
  grd.addColorStop(0.18, '#ffd59a');
  grd.addColorStop(0.55, '#f08a2c');
  grd.addColorStop(0.85, '#7a3410');
  grd.addColorStop(1, '#1a0d06');
  g.fillStyle = grd;
  g.fillRect(0, 0, 256, 256);
  g.translate(128, 128);
  g.strokeStyle = 'rgba(60,22,6,0.55)';
  g.lineWidth = 3;
  for (let i = 0; i < 24; i++) {
    g.rotate((Math.PI * 2) / 24);
    g.beginPath();
    g.moveTo(14, 0);
    g.quadraticCurveTo(70, 26, 124, 18);
    g.stroke();
  }
  g.fillStyle = '#fff6e6';
  g.beginPath();
  g.arc(0, 0, 13, 0, Math.PI * 2);
  g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, 'rgba(255,200,120,1)');
  grd.addColorStop(0.25, 'rgba(255,150,60,0.55)');
  grd.addColorStop(1, 'rgba(255,120,40,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function createJet() {
  const pal = PAL;
  const group = new THREE.Group();

  const mats = {
    body: new THREE.MeshPhysicalMaterial({
      color: pal.body, vertexColors: true, metalness: 0.15, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.05,
    }),
    wing: new THREE.MeshPhysicalMaterial({ color: 0xd5dde5, metalness: 0.3, roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.15 }),
    accent: new THREE.MeshPhysicalMaterial({ color: pal.accent, metalness: 0.92, roughness: 0.26, clearcoat: 0.7 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0x08090b, metalness: 0.1, roughness: 0.04, clearcoat: 1 }),
    nacelle: new THREE.MeshPhysicalMaterial({ color: pal.body, metalness: 0.7, roughness: 0.22, clearcoat: 1, side: THREE.DoubleSide }),
    fan: new THREE.MeshBasicMaterial({ map: fanTexture(), toneMapped: false }),
  };

  const fus = new THREE.Mesh(fuselageGeometry(), mats.body);
  group.add(fus);

  // Cabin windows.
  const winGeo = new THREE.SphereGeometry(1, 16, 12);
  const windows = new THREE.InstancedMesh(winGeo, mats.glass, 26);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), s = new THREE.Vector3(0.1, 0.13, 0.012);
  let k = 0;
  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 13; i++) {
      const x = -1.75 + i * 0.4;
      m.compose(new THREE.Vector3(x, 0.14, side * 0.594), q, s);
      windows.setMatrixAt(k++, m);
    }
  }
  group.add(windows);

  // Wings (one side built, the other mirrored).
  const wingGeo = planform([[1.5, 0], [-0.7, 0], [-2.05, 4.9], [-1.4, 4.9]], 0.07);
  wingGeo.rotateX(Math.PI / 2);
  const wingletGeo = planform([[-1.4, 0], [-2.05, 0], [-2.35, 0.75], [-2.05, 0.75]], 0.035, 0.015);
  const accentLineGeo = planform([[-1.42, 0.02], [-2.03, 0.02], [-2.08, 0.16], [-1.5, 0.16]], 0.036, 0.016);
  for (const side of [1, -1]) {
    const w = new THREE.Group();
    w.scale.z = side;
    const wing = new THREE.Mesh(wingGeo, mats.wing);
    w.add(wing);
    const winglet = new THREE.Mesh(wingletGeo, mats.wing);
    winglet.position.set(0, 0, 4.88);
    winglet.rotation.x = -0.12;
    w.add(winglet);
    const stripe = new THREE.Mesh(accentLineGeo, mats.accent);
    stripe.position.set(0, 0.06, 4.88);
    stripe.rotation.x = -0.12;
    w.add(stripe);
    w.position.y = -0.3;
    w.rotation.x = side * -0.055; // dihedral
    group.add(w);
  }

  // Vertical tail in brand bronze.
  const fin = new THREE.Mesh(planform([[-2.85, 0.25], [-4.75, 0.25], [-5.1, 2.25], [-4.5, 2.25]], 0.1), mats.accent);
  fin.position.z = -0.05;
  group.add(fin);

  // T-tail stabiliser.
  const stabGeo = planform([[-4.35, 0], [-5.05, 0], [-5.45, 1.95], [-5.05, 1.95]], 0.05);
  stabGeo.rotateX(Math.PI / 2);
  for (const side of [1, -1]) {
    const st = new THREE.Mesh(stabGeo, mats.wing);
    st.scale.z = side;
    st.position.y = 2.32;
    group.add(st);
  }

  // Rear-mounted engines.
  const nacPts = [];
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, y = u * 1.75;
    const r = 0.2 + 0.13 * Math.sin(Math.min(1, u * 1.15) * Math.PI * 0.62);
    nacPts.push(new THREE.Vector2(r, y));
  }
  nacPts.push(new THREE.Vector2(0.3, 1.8), new THREE.Vector2(0.27, 1.79), new THREE.Vector2(0.26, 1.6));
  const nacGeo = new THREE.LatheGeometry(nacPts, 48);
  nacGeo.rotateZ(-Math.PI / 2);
  const fanGeo = new THREE.CircleGeometry(0.262, 48);
  fanGeo.rotateY(Math.PI / 2);
  const glowMat = new THREE.SpriteMaterial({
    map: glowTexture(), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true, toneMapped: false, opacity: 0.85,
  });
  const fans = [], glows = [];
  for (const side of [1, -1]) {
    const eng = new THREE.Group();
    eng.add(new THREE.Mesh(nacGeo, mats.nacelle));
    const fan = new THREE.Mesh(fanGeo, mats.fan);
    fan.position.x = 1.62;
    eng.add(fan);
    fans.push(fan);
    const glow = new THREE.Sprite(glowMat);
    glow.position.x = 1.9;
    glow.scale.setScalar(1.6 * pal.glow);
    eng.add(glow);
    glows.push(glow);
    eng.position.set(-3.55, 0.42, side * 0.98);
    group.add(eng);
    const pylon = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.09, 0.5), mats.wing);
    pylon.position.set(-2.75, 0.4, side * 0.62);
    group.add(pylon);
  }

  // The glow only shows when the intakes face the camera.
  const fwd = new THREE.Vector3(), toCam = new THREE.Vector3(), wp = new THREE.Vector3();
  function tick(t, camera) {
    fans.forEach((f) => (f.rotation.x = t * 9));
    let facing = 1;
    if (camera) {
      fwd.set(1, 0, 0).transformDirection(group.matrixWorld);
      fans[0].getWorldPosition(wp);
      toCam.copy(camera.position).sub(wp).normalize();
      facing = THREE.MathUtils.smoothstep(fwd.dot(toCam), -0.05, 0.45);
    }
    const flicker = 0.82 + Math.sin(t * 13) * 0.04 + Math.sin(t * 5.3) * 0.04;
    glowMat.opacity = flicker * facing;
    glows.forEach((g) => (g.visible = facing > 0.01));
  }

  group.traverse((o) => { if (o.isMesh) { o.castShadow = false; } });
  return { group, tick, mats };
}
