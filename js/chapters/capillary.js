// Chapter 5: capillary action, with real numbers (Jurin's law).
import { THREE, M, rod, approach } from '../kit.js';

// Surface tension γ (N/m), contact angle θ (degrees), density ρ (kg/m³).
const LIQUIDS = {
  water: { label: 'Water', gamma: 0.0728, theta: 0, rho: 1000, color: 0x5aa9ff, opacity: 0.55 },
  ink: { label: 'Fountain pen ink', gamma: 0.045, theta: 10, rho: 1010, color: 0x4f7bff, opacity: 0.9 },
  mercury: { label: 'Mercury', gamma: 0.485, theta: 140, rho: 13534, color: 0xc9ced8, opacity: 1 },
};
const BASE_R = [1.2, 0.8, 0.45, 0.25];        // tube radii in millimetres at width ×1
const MM_PER_UNIT = 12;                        // scene scale for heights
const R_SCENE = 0.55;                          // scene radius of a 1 mm tube

export function riseMM(liq, rMM) {
  return ((2 * liq.gamma * Math.cos((liq.theta * Math.PI) / 180)) / (liq.rho * 9.81 * (rMM / 1000))) * 1000;
}

export default {
  id: 'capillary',
  short: 'Capillary action',
  title: 'Capillary action',
  subtitle: 'Why ink climbs into narrow gaps all by itself.',
  view: { pos: [0.5, 5.2, 13], target: [0, 3.0, 0] },
  learn: `<p>Water molecules are attracted to glass more than to each other, so water creeps up a glass wall. In a narrow tube, that creep lifts the whole column. The narrower the tube, the higher it climbs. This is <b>capillary action</b>.</p>
    <p>The height follows <b>Jurin’s law</b>: <span class="formula">h = 2γ·cos θ / (ρ·g·r)</span>. Here γ is surface tension, θ how well the liquid wets the wall, ρ its density, g gravity, and r the tube's radius. Halve the radius and the liquid climbs twice as high.</p>
    <p>A fountain pen's slit is a capillary a few hundredths of a millimetre wide. That's why ink runs to the tip by itself, and why paper, a mesh of tiny fibres, soaks it up. Mercury does the opposite: it's more attracted to itself than to glass, so it's <b>pushed down</b>.</p>
    <p class="tip"><b>Try it:</b> make the tubes thinner, then switch to mercury.</p>`,
  terms: [
    { t: 'Surface tension', d: 'The pull between a liquid’s molecules at its surface, like a stretched skin.' },
    { t: 'Wetting', d: 'How strongly a liquid clings to a surface. Water wets glass; mercury doesn’t.' },
    { t: 'Meniscus', d: 'The curved surface of liquid in a tube: dipping for water, bulging for mercury.' },
  ],
  defaults: { width: 1, liquid: 'water' },
  controls: [
    { key: 'width', type: 'log', label: 'Tube width', min: 0.35, max: 2.2, ends: ['thinner', 'wider'], fmt: (v) => '×' + v.toFixed(2) },
    { key: 'liquid', type: 'seg', label: 'Liquid', options: [{ v: 'water', label: 'Water' }, { v: 'ink', label: 'Ink' }, { v: 'mercury', label: 'Mercury' }] },
  ],
  quiz: [
    { q: 'Make a glass tube half as wide. What happens to the water column?', options: ['It rises twice as high', 'It rises half as high', 'No change', 'It sinks'], answer: 0, why: 'Height is inversely proportional to radius: h ∝ 1/r.' },
    { q: 'Why does mercury sink in a narrow glass tube?', options: ['It’s too heavy', 'It’s more attracted to itself than to glass', 'Glass repels metal', 'It evaporates'], answer: 1, why: 'Mercury doesn’t wet glass (contact angle above 90°), so the curve pushes it down.' },
    { q: 'What moves ink from a fountain pen’s feed to the tip?', options: ['A pump', 'Capillary action in the slit', 'The ball', 'Static electricity'], answer: 1, why: 'The nib’s narrow slit is a capillary.' },
  ],
  reel: [
    { ms: 4800, caption: 'The narrower the gap, the higher the ink climbs: capillary action feeds the nib.', set: { liquid: 'ink' }, anim: { width: [2, 0.45, true] }, spin: 0.3 },
  ],

  build({ stage }) {
    const dish = rod(0, 1, 4.6, 4.6, M.clear(0xd8e8ff, 0.22), 64, true);
    dish.rotation.z = Math.PI / 2; dish.scale.set(0.6, 1, 1); dish.position.set(0, 0.3, 0);
    const pool = new THREE.Mesh(new THREE.CylinderGeometry(4.5, 4.5, 0.5, 64), M.plastic(0x5aa9ff, { transparent: true, opacity: 0.6, roughness: 0.1 }));
    pool.position.y = 0.25;
    stage.root.add(dish, pool);

    const TOP = 7.5, xs = [-3, -1, 1, 3];
    const tubes = xs.map((x, i) => {
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, TOP, 40, 1, true), M.clear(0xe8f4ff, 0.34));
      glass.position.set(x, TOP / 2 + 0.1, 0);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1, 40), M.plastic(0x5aa9ff, { transparent: true, opacity: 0.6, roughness: 0.1 }));
      const cap = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), col.material);
      stage.root.add(glass, col, cap);
      const label = stage.label('', [x, 0, 0]);
      return { x, glass, col, cap, label, h: 0, base: BASE_R[i] };
    });
    stage.label('Liquid in a dish', [0, -0.3, 3.8]);

    return {
      update(dt, s) {
        const liq = LIQUIDS[s.liquid] || LIQUIDS.water;
        pool.material.color.set(liq.color); pool.material.opacity = liq.opacity;
        pool.material.metalness = s.liquid === 'mercury' ? 0.9 : 0;
        for (const t of tubes) {
          const rMM = t.base * s.width, r = R_SCENE * rMM;
          const target = riseMM(liq, rMM) / MM_PER_UNIT;
          t.h = approach(t.h, Math.max(-0.45, Math.min(TOP - 0.5, target)), 2.5, dt);
          t.glass.scale.set(r, 1, r);
          const top = 0.5 + t.h;
          t.col.scale.set(r * 0.96, Math.max(0.01, top), r * 0.96); t.col.position.set(t.x, top / 2, 0);
          t.col.material = pool.material;
          // Water dips in the middle (concave); mercury bulges (convex).
          t.cap.material = pool.material;
          t.cap.scale.set(r * 0.96, r * 0.45 * (liq.theta > 90 ? 1 : -1), r * 0.96);
          t.cap.position.set(t.x, top, 0);
          t.label.position.set(t.x, Math.max(top, 0.5) + 0.8, 0);
          const mm = riseMM(liq, rMM);
          t.label.element.textContent = `${(rMM * 2).toFixed(1)} mm tube: ${mm >= 0 ? '+' : ''}${mm.toFixed(0)} mm`;
        }
      },
      readout: (s) => {
        const liq = LIQUIDS[s.liquid] || LIQUIDS.water;
        const slit = riseMM(liq, 0.025) / 10;
        return `<div class="row"><span>Liquid</span><b>${liq.label}</b></div>
          <div class="row"><span>In a 0.05 mm nib slit</span><b>${slit >= 0 ? 'climbs' : 'sinks'} ${Math.abs(slit).toFixed(0)} cm</b></div>
          <div class="formula">h = 2γ cos θ / (ρ g r)</div>`;
      },
    };
  },
};
