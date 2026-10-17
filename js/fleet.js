// Fleet viewer: a turntable jet that morphs between aircraft classes.
// Each class names its own free CC-BY model (FLEET[].glb); the procedural jet is the fallback.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { createJet } from './jet.js';
import { FLEET } from './data.js';
import { createRenderer, studioEnvironment, runScene, reducedMotion } from './gl.js';

// Per-file fixes: yaw turns the nose to +X (radians around Y).
const MODEL_FIX = {
  'assets/jet.glb': { yaw: Math.PI },
  // Black livery reads as a void on navy; render it as a pearl-white studio model.
  'assets/jet-black.glb': { yaw: 0, pearl: true },
};

// Remap a dark livery texture: body to pearl, trim to silver, detail lines to graphite.
const PEARL_GLSL = /* glsl */ `
  #ifdef USE_MAP
    vec4 texel = texture2D( map, vMapUv );
    float l = dot( texel.rgb, vec3( 0.2126, 0.7152, 0.0722 ) );
    vec3 c = mix( vec3( 0.70, 0.73, 0.78 ), vec3( 0.36, 0.39, 0.44 ), smoothstep( 0.04, 0.1, l ) );
    c = mix( c, vec3( 0.02, 0.03, 0.045 ), smoothstep( 0.35, 0.55, l ) );
    diffuseColor.rgb *= c;
  #endif
`;
function pearlFrom(old) {
  const m = new THREE.MeshPhysicalMaterial({
    map: old.map, normalMap: old.normalMap || null, roughnessMap: old.roughnessMap || null,
    roughness: 0.5, metalness: 0.06, clearcoat: 1, clearcoatRoughness: 0.08,
  });
  m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <map_fragment>', PEARL_GLSL); };
  return m;
}

// Centre the model, lay its longest axis along X and scale it to fill the stage.
function normalise(root, fix = {}) {
  const size = new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3());
  if (size.z > size.x) root.rotation.y = Math.PI / 2;
  root.rotation.y += fix.yaw || 0;
  root.updateMatrixWorld(true);
  const s = 11.5 / Math.max(...new THREE.Box3().setFromObject(root).getSize(new THREE.Vector3()).toArray());
  root.scale.multiplyScalar(s);
  root.updateMatrixWorld(true);
  root.position.sub(new THREE.Box3().setFromObject(root).getCenter(new THREE.Vector3()));
  root.traverse((o) => {
    if (o.isMesh && fix.pearl) o.material = pearlFrom(o.material);
    if (o.isMesh && o.material) {
      (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => {
        m.envMapIntensity = 1.1;
        // Tint the cabin glass; the Learjet's interior was stripped from the file.
        if (m.name === 'WindowsGlass') Object.assign(m, { opacity: 0.92, metalness: 0.3, roughness: 0.05 }), m.color.set(0x1b2a3c);
      });
    }
  });
  const wrap = new THREE.Group();
  wrap.add(root);
  return wrap;
}

// Shared with the aircraft pages. Paths in FLEET are site-relative, so resolve them from this module.
export async function loadModel(url) {
  try {
    const gltf = await new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).loadAsync(new URL(`../${url}`, import.meta.url).href);
    return normalise(gltf.scene, MODEL_FIX[url]);
  } catch (err) {
    console.warn(`Fleet model ${url} unavailable, using the built-in jet.`, err);
    return null;
  }
}

export function initFleet(canvas) {
  const { gsap } = window;
  const reduce = reducedMotion();
  const renderer = createRenderer(canvas, { alpha: true });
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  scene.environment = studioEnvironment(renderer);
  scene.environmentIntensity = 1;
  const camera = new THREE.PerspectiveCamera(26, 1, 0.1, 100);

  scene.add(new THREE.HemisphereLight(0xf4f9ff, 0x9fb4c8, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 2.4);
  key.position.set(6, 10, 8);
  const rim = new THREE.DirectionalLight(0xcfe6ff, 1.6);
  rim.position.set(-8, 3, -8);
  scene.add(key, rim);

  let tickJet = () => {};
  const morph = new THREE.Group(); // class scaling lives here so swapped models inherit it
  const turn = new THREE.Group();
  const float = new THREE.Group();
  turn.add(morph);
  float.add(turn);
  scene.add(float);
  morph.scale.set(...FLEET[0].scale);

  // Files load once and are cached; their CC BY credit appears once loaded.
  const cache = new Map();
  const getModel = (url) => {
    if (!cache.has(url)) {
      cache.set(url, loadModel(url).then((m) => {
        if (m) document.querySelectorAll(`[data-model-credit="${url}"]`).forEach((el) => (el.hidden = false));
        return m;
      }));
    }
    return cache.get(url);
  };
  let fallback = null;
  const fallbackJet = () => (fallback ||= createJet());

  let shown = null;
  let token = 0;
  async function show(url, animate) {
    const mine = ++token;
    const model = url ? await getModel(url) : null;
    if (mine !== token) return; // a newer class was requested meanwhile
    const group = model || fallbackJet().group;
    tickJet = model ? () => {} : fallbackJet().tick;
    if (shown === group) return;
    const prev = shown;
    shown = group;
    if (prev) gsap.killTweensOf(prev.scale);
    gsap.killTweensOf(group.scale);
    if (prev && animate && !reduce) {
      gsap.to(prev.scale, { x: 0.001, y: 0.001, z: 0.001, duration: 0.45, ease: 'power3.in', onComplete: () => morph.remove(prev) });
      group.scale.setScalar(0.001);
      morph.add(group);
      gsap.to(group.scale, { x: 1, y: 1, z: 1, duration: 1.1, ease: 'expo.out', delay: 0.35 });
    } else {
      if (prev) morph.remove(prev);
      group.scale.setScalar(1);
      morph.add(group);
    }
    loop.renderOnce();
  }

  // Turntable with drag + inertia.
  const st = { angle: -0.6, vel: 0, dragging: false, lastX: 0, auto: reduce ? 0 : 0.12, dist: 21, lift: 0 };
  canvas.addEventListener('pointerdown', (e) => {
    st.dragging = true;
    st.lastX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!st.dragging) return;
    const dx = e.clientX - st.lastX;
    st.lastX = e.clientX;
    st.vel = dx * 0.006;
    st.angle += st.vel;
  });
  const end = () => { st.dragging = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  const onResize = (w, h) => {
    const aspect = w / h;
    st.dist = aspect < 1.2 ? Math.min(36, 19.5 * (1.35 / Math.max(aspect, 0.6))) : 21;
  };

  const target = new THREE.Vector3(0, -1.3, 0);
  const onFrame = (dt, t) => {
    if (!st.dragging) {
      st.vel *= Math.pow(0.04, dt);
      st.angle += st.vel + st.auto * dt;
    }
    turn.rotation.y = st.angle;
    float.position.y = Math.sin(t * 0.8) * 0.08 + st.lift;
    float.rotation.z = Math.sin(t * 0.6) * 0.02;
    camera.position.set(0, st.dist * 0.3, st.dist);
    camera.lookAt(target);
    tickJet(t, camera);
    renderer.render(scene, camera);
  };
  const loop = runScene(canvas, { renderer, camera, onResize, onFrame });

  // First class right away, the rest in the background.
  show(FLEET[0].glb, false).then(() => FLEET.forEach((f) => f.glb && getModel(f.glb)));

  let current = 0;
  return {
    setClass(i) {
      if (i === current) return;
      const dir = i > current ? 1 : -1;
      current = i;
      show(FLEET[i].glb, true);
      const [x, y, z] = FLEET[i].scale;
      gsap.to(morph.scale, { x, y, z, duration: 1.4, ease: 'expo.inOut', onUpdate: loop.renderOnce });
      if (!reduce) {
        gsap.to(st, { angle: st.angle + dir * Math.PI * 0.5, duration: 1.6, ease: 'expo.inOut' });
        gsap.fromTo(st, { lift: 0 }, { lift: 0.5, duration: 0.7, ease: 'sine.out', yoyo: true, repeat: 1 });
      }
    },
  };
}
