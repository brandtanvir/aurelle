// Night Earth (NASA Black Marble) with an atmosphere rim and a light-trail route between two airports.
import * as THREE from 'three';
import { createRenderer, runScene, reducedMotion } from './gl.js';

const RAD = Math.PI / 180;
const NIGHT_URL = 'assets/earth-night.jpg';

export function latLonToVec(lat, lon, r = 1) {
  const phi = (90 - lat) * RAD, theta = (lon + 180) * RAD;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

const earthVert = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
const earthFrag = /* glsl */ `
  uniform sampler2D uNight;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    vec3 lights = texture2D(uNight, vUv).rgb;
    // Lift the city lights, keep land and ocean a deep navy.
    vec3 base = vec3(0.012, 0.028, 0.06);
    vec3 col = base + pow(lights, vec3(1.15)) * vec3(1.35, 1.2, 1.0);
    float fres = pow(1.0 - max(dot(vN, vView), 0.0), 2.6);
    col += vec3(0.25, 0.48, 0.9) * fres * 0.45;
    // Soft light from the upper left so the sphere has volume.
    float lit = 0.55 + 0.45 * max(dot(vN, normalize(vec3(-0.5, 0.6, 0.6))), 0.0);
    gl_FragColor = vec4(col * lit, 1.0);
    #include <colorspace_fragment>
  }
`;
const atmoFrag = /* glsl */ `
  varying vec3 vN;
  varying vec3 vView;
  void main() {
    // Back faces: strongest just outside the Earth's limb, fading to nothing at the shell edge.
    float d = dot(vN, vView);
    float f = pow(clamp(-d * 2.2, 0.0, 1.0), 3.0);
    gl_FragColor = vec4(vec3(0.38, 0.62, 1.0), f * 0.85);
    #include <colorspace_fragment>
  }
`;

function glowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.3, 'rgba(190,220,255,.6)');
  grd.addColorStop(1, 'rgba(190,220,255,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export async function initGlobe(canvas, tags = []) {
  const { gsap } = window;
  const reduce = reducedMotion();
  const renderer = createRenderer(canvas, { alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
  camera.position.set(0, 0, 5.2);

  const night = await new THREE.TextureLoader().loadAsync(NIGHT_URL);
  night.colorSpace = THREE.SRGBColorSpace;
  night.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const globe = new THREE.Group();
  scene.add(globe);
  globe.add(new THREE.Mesh(
    new THREE.SphereGeometry(1, 128, 96),
    new THREE.ShaderMaterial({ vertexShader: earthVert, fragmentShader: earthFrag, uniforms: { uNight: { value: night } } }),
  ));
  const atmo = new THREE.Mesh(
    new THREE.SphereGeometry(1, 96, 64),
    new THREE.ShaderMaterial({ vertexShader: earthVert, fragmentShader: atmoFrag, transparent: true, side: THREE.BackSide, blending: THREE.AdditiveBlending, depthWrite: false }),
  );
  atmo.scale.setScalar(1.1);
  scene.add(atmo);

  // Route: a faint full path, a bright moving trail, a glowing head and pulsing endpoints.
  const pathMat = new THREE.MeshBasicMaterial({ color: 0xcfe6ff, transparent: true, opacity: 0.35, toneMapped: false, depthWrite: false });
  const trailMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95, toneMapped: false, blending: THREE.AdditiveBlending, depthWrite: false });
  const glow = glowTexture();
  const head = new THREE.Sprite(new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false }));
  head.scale.setScalar(0.09);
  globe.add(head);
  const endMat = new THREE.SpriteMaterial({ map: glow, blending: THREE.AdditiveBlending, depthWrite: false, toneMapped: false });
  const ends = [new THREE.Sprite(endMat), new THREE.Sprite(endMat)];
  ends.forEach((e) => { e.scale.setScalar(0.07); globe.add(e); });
  const rings = [0, 1].map(() => new THREE.Mesh(
    new THREE.RingGeometry(0.03, 0.034, 48),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, side: THREE.DoubleSide, toneMapped: false, depthWrite: false }),
  ));
  rings.forEach((r) => globe.add(r));

  let route = null;
  const draw = { p: 0 };

  // Rotation: drag + eased targets.
  const rot = { x: 0.3, y: 0, tx: 0.3, ty: 0, dragging: false, lx: 0, ly: 0 };
  canvas.addEventListener('pointerdown', (e) => { rot.dragging = true; rot.lx = e.clientX; rot.ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!rot.dragging) return;
    rot.ty += (e.clientX - rot.lx) * 0.006;
    rot.tx = THREE.MathUtils.clamp(rot.tx + (e.clientY - rot.ly) * 0.004, -1.1, 1.1);
    rot.lx = e.clientX;
    rot.ly = e.clientY;
  });
  const stop = () => { rot.dragging = false; };
  canvas.addEventListener('pointerup', stop);
  canvas.addEventListener('pointercancel', stop);

  // City labels follow their endpoints and hide on the far side of the Earth.
  const world = new THREE.Vector3();
  const toCam = new THREE.Vector3();
  function placeTag(el, local) {
    if (!el) return;
    world.copy(local).applyMatrix4(globe.matrixWorld);
    toCam.copy(camera.position).sub(world).normalize();
    const facing = world.clone().normalize().dot(toCam);
    world.project(camera);
    const x = (world.x * 0.5 + 0.5) * canvas.clientWidth;
    const y = (-world.y * 0.5 + 0.5) * canvas.clientHeight;
    el.style.transform = `translate(${(x + 10).toFixed(1)}px, ${(y - 34).toFixed(1)}px)`;
    el.classList.toggle('is-on', facing > 0.15 && draw.p > 0.98);
  }

  const onFrame = (dt, t) => {
    if (!rot.dragging && !reduce && !route) rot.ty += dt * 0.05;
    const k = Math.min(1, dt * 3);
    rot.x += (rot.tx - rot.x) * k;
    rot.y += (rot.ty - rot.y) * k;
    globe.rotation.x = rot.x;
    globe.rotation.y = rot.y;
    if (route) {
      const per = route.radial * 6;
      route.path.geometry.setDrawRange(0, Math.floor(draw.p * route.segs) * per);
      const u = reduce ? 0.6 : (t * 0.12) % 1;
      const at = Math.floor(u * route.segs);
      const from = Math.max(0, at - Math.floor(route.segs * 0.16));
      const visible = draw.p > 0.99;
      route.trail.visible = visible;
      route.trail.geometry.setDrawRange(from * per, (at - from) * per);
      head.visible = visible;
      head.position.copy(route.curve.getPointAt(Math.min(1, Math.max(0, u))));
      const phase = (t * 0.8) % 1;
      rings.forEach((r) => { r.scale.setScalar(1 + phase * 1.8); r.material.opacity = 0.55 * (1 - phase); });
      globe.updateMatrixWorld();
      placeTag(tags[0], route.a);
      placeTag(tags[1], route.b);
    }
    renderer.render(scene, camera);
  };
  const loop = runScene(canvas, { renderer, camera, onFrame });

  function setRoute(a, b) {
    if (route) {
      globe.remove(route.path, route.trail);
      route.path.geometry.dispose();
      route.trail.geometry.dispose();
    }
    const va = latLonToVec(a.lat, a.lon), vb = latLonToVec(b.lat, b.lon);
    const angle = va.angleTo(vb);
    const lift = 0.06 + 0.3 * (angle / Math.PI);
    const pts = [];
    const qa = new THREE.Quaternion(), q = new THREE.Quaternion().setFromUnitVectors(va, vb);
    for (let i = 0; i <= 120; i++) {
      const s = i / 120;
      qa.identity().slerp(q, s);
      pts.push(va.clone().applyQuaternion(qa).multiplyScalar(1.004 + lift * Math.sin(Math.PI * s)));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    const segs = 260, radial = 8;
    const path = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.0035, radial, false), pathMat);
    const trail = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, 0.006, radial, false), trailMat);
    globe.add(path, trail);
    route = { path, trail, curve, segs, radial, a: va.clone().multiplyScalar(1.004), b: vb.clone().multiplyScalar(1.004) };

    [va, vb].forEach((v, i) => {
      ends[i].position.copy(v).multiplyScalar(1.006);
      rings[i].position.copy(v).multiplyScalar(1.005);
      rings[i].lookAt(v.clone().multiplyScalar(2));
    });
    [[tags[0], a], [tags[1], b]].forEach(([el, ap]) => {
      if (!el) return;
      el.querySelector('span').textContent = ap.city;
      el.querySelector('small').textContent = ap.code;
    });

    // Centre the route, viewed from slightly south so the arc reads as a curve.
    const mid = va.clone().add(vb).normalize();
    let ty = -Math.atan2(mid.x, mid.z);
    while (ty - rot.ty > Math.PI) ty -= Math.PI * 2;
    while (ty - rot.ty < -Math.PI) ty += Math.PI * 2;
    rot.ty = ty;
    rot.tx = THREE.MathUtils.clamp(Math.asin(mid.y) - 0.4, -1.1, 1.1);
    gsap.to(camera.position, { z: 4.9 + angle * 0.35, duration: 1.6, ease: 'expo.inOut' });

    gsap.killTweensOf(draw);
    if (reduce) draw.p = 1;
    else gsap.fromTo(draw, { p: 0 }, { p: 1, duration: 1.8, ease: 'expo.inOut', delay: 0.3 });
    loop.renderOnce();
  }

  return { setRoute };
}
