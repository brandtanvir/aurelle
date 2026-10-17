import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

export const isMobile = () => matchMedia('(max-width: 760px)').matches;
export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

export function createRenderer(canvas, { alpha = false } = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, isMobile() ? 1.5 : 1.75));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  return renderer;
}

// GPU textures can't be shared between WebGL contexts, so cache one per renderer.
const envCache = new WeakMap();
export function studioEnvironment(renderer) {
  if (!envCache.has(renderer)) {
    const pmrem = new THREE.PMREMGenerator(renderer);
    envCache.set(renderer, pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
    pmrem.dispose();
  }
  return envCache.get(renderer);
}

// Keeps canvas sized to its box and renders only while on screen and the tab is visible.
export function runScene(canvas, { renderer, camera, onResize, onFrame }) {
  let visible = false, raf = 0, last = performance.now(), t = 0;
  const frame = (now) => {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    t += dt;
    onFrame(dt, t);
    raf = requestAnimationFrame(frame);
  };
  const start = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  const resize = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    onResize?.(w, h);
    if (!raf) onFrame(0, t);
  };
  new ResizeObserver(resize).observe(canvas);
  resize();

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) start(); }, { rootMargin: '100px' }).observe(canvas);
  document.addEventListener('visibilitychange', () => { if (!document.hidden && visible) start(); });
  return { renderOnce: () => onFrame(0, t) };
}
