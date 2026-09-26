// Chapter 4: inside a fountain pen. Ink flows down the slit; air bubbles up the feed.
import { THREE, M, rod, sphere, box, swarm, canvasTexture, approach, clamp } from '../kit.js';

// Points along the ink's journey (pen-local coordinates; nib tip at -x).
const INK_PATH = [[4.8, 0, 0], [2.2, 0, 0], [0.8, -0.05, 0], [-0.8, 0.14, 0], [-2.6, 0.16, 0], [-3.35, 0.14, 0]].map((p) => new THREE.Vector3(...p));
const AIR_PATH = [[-0.4, -0.22, 0], [1.2, -0.22, 0], [2.6, -0.1, 0], [3.4, 0.05, 0.15], [4.6, 0.3, 0.05]].map((p) => new THREE.Vector3(...p));

function along(path, t) {
  const segs = path.length - 1, x = Math.min(segs - 1e-6, Math.max(0, t * segs)), i = Math.floor(x);
  return path[i].clone().lerp(path[i + 1], x - i);
}

export default {
  id: 'fountain',
  short: 'Fountain pens',
  title: 'Inside a fountain pen',
  subtitle: 'Ink runs down a slit; air bubbles up to take its place.',
  view: { pos: [-1.5, 3.6, 8.5], target: [0.4, 1.2, 0] },
  learn: `<p>A fountain pen has no ball. Its metal <b>nib</b> is split down the middle into two <b>tines</b>. The slit between them is so narrow that ink is drawn along it by <b>capillary action</b>, the same force that pulls water up a paper towel.</p>
    <p>Under the nib sits the <b>feed</b>, a black comb with tiny channels. It does two jobs at once: ink runs down one channel towards the nib, while <b>air</b> bubbles back up another into the reservoir. Without that swap, a vacuum would build and the ink would stop.</p>
    <p>The fins of the feed hold spare ink, like a sponge, so the pen doesn't flood when your hand warms the air inside. Press harder and the tines <b>spread</b>: the slit widens and the line gets wider.</p>
    <p class="tip"><b>Try it:</b> press harder, then stop writing and watch the bubbles stop too.</p>`,
  terms: [
    { t: 'Nib', d: 'The metal point of a fountain pen, split into two tines by a slit.' },
    { t: 'Tines', d: 'The two halves of the nib. They spread under pressure to widen the line.' },
    { t: 'Feed', d: 'The plastic part under the nib that sends ink out and lets air in.' },
    { t: 'Breather hole', d: 'The hole where the slit ends. It stops cracks and helps air in.' },
  ],
  defaults: { pressure: 0.25, writing: true, level: 0.7 },
  controls: [
    { key: 'pressure', type: 'range', label: 'Press on the nib', min: 0, max: 1, step: 0.01, ends: ['feather light', 'hard'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'writing', type: 'toggle', label: 'Writing' },
    { key: 'level', type: 'range', label: 'Ink in the pen', min: 0.05, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'What pulls ink down the nib’s slit?', options: ['A pump', 'Capillary action', 'Magnetism', 'The ball'], answer: 1, why: 'A very narrow gap draws liquid along it by itself.' },
    { q: 'Why do bubbles rise into a fountain pen as it writes?', options: ['The ink is boiling', 'Air must replace the ink that flows out', 'It’s leaking', 'The feed is broken'], answer: 1, why: 'Air replaces used ink, or a vacuum would stop the flow.' },
    { q: 'What happens when you press harder on a flexible nib?', options: ['The tines spread and the line gets wider', 'Nothing', 'The ink stops', 'The nib gets longer'], answer: 0, why: 'Spreading tines widen the slit and let out a wider stripe of ink.' },
  ],
  reel: [
    { ms: 5000, caption: 'A fountain pen’s nib splits in two: press harder and the line gets wider.', set: { writing: true, level: 0.7 }, anim: { pressure: [0.1, 0.95] }, spin: 0.35 },
    { ms: 4400, caption: 'For every drop of ink that flows out, a bubble of air goes back in.', set: { pressure: 0.35, writing: true }, spin: 0.2 },
  ],

  build({ stage }) {
    const pen = new THREE.Group();
    pen.position.set(0, 1.62, 0);
    pen.rotation.z = 0.5;                // nib tip down onto the paper
    stage.root.add(pen);

    // Nib: two tines cut from a pointed shape, each hinged near the breather hole.
    const nibMat = M.metal(0xe7c46a, { side: THREE.DoubleSide, roughness: 0.22 });
    const half = (sign) => {
      const sh = new THREE.Shape();
      sh.moveTo(0, 0.01 * sign); sh.lineTo(-2.6, 0.005 * sign);
      sh.quadraticCurveTo(-1.6, 0.55 * sign, -0.2, 0.7 * sign);
      sh.lineTo(0.6, 0.66 * sign); sh.lineTo(0.6, 0.01 * sign);
      const g = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false });
      g.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(g, nibMat); m.castShadow = true;
      const hinge = new THREE.Group(); hinge.position.x = -0.9; m.position.x = 0.9; hinge.add(m);
      return hinge;
    };
    const nib = new THREE.Group(); nib.position.set(-0.75, 0.2, 0);
    const left = half(1), right = half(-1);
    nib.add(left, right);
    // Shoulders of the nib, going back into the grip.
    const shoulder = rod(-0.2, 1.8, 0.62, 0.62, nibMat, 40, true); shoulder.scale.set(1, 0.18, 1); shoulder.position.y = 0.02;
    nib.add(shoulder);
    const breather = new THREE.Mesh(new THREE.CircleGeometry(0.1, 24), M.glow(0x111318)); breather.rotation.x = -Math.PI / 2; breather.position.set(-0.9, 0.045, 0);
    nib.add(breather);
    pen.add(nib);

    // Feed: black comb under the nib, with fins.
    const feedMat = M.plastic(0x16181f, { roughness: 0.55 });
    const feed = box(4.2, 0.28, 0.6, feedMat); feed.position.set(-0.1, -0.05, 0); pen.add(feed);
    const feedTip = box(1.4, 0.18, 0.4, feedMat); feedTip.position.set(-2.6, 0.02, 0); pen.add(feedTip);
    for (let i = 0; i < 9; i++) { const f = box(0.08, 0.35, 0.75, feedMat); f.position.set(0.4 + i * 0.18, -0.35, 0); pen.add(f); }
    const channel = box(3.8, 0.02, 0.06, M.glow(0x2346d9)); channel.position.set(-0.4, 0.1, 0); pen.add(channel);

    // Grip section and a see-through converter full of ink.
    const grip = rod(1.2, 2.9, 0.62, 0.6, M.plastic(0x23262f)); pen.add(grip);
    const conv = rod(2.9, 6.3, 0.5, 0.5, M.clear(0xd8e8ff, 0.18), 48, true); pen.add(conv);
    const inkMat = M.plastic(0x2346d9, { roughness: 0.25, transparent: true, opacity: 0.9 });
    const inkCol = rod(0, 1, 0.44, 0.44, inkMat); pen.add(inkCol);
    const cap = rod(6.3, 6.5, 0.52, 0.52, M.metal(0x9aa3b2)); pen.add(cap);

    // Paper and the line being written.
    const paper = canvasTexture(1024, 256, (g, w, h) => { g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(80,120,200,.3)'; g.lineWidth = 3; for (let y = 30; y < h; y += 90) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
    paper.tex.wrapS = THREE.RepeatWrapping;
    const sheet = new THREE.Mesh(new THREE.PlaneGeometry(16, 6), M.matte(0xffffff, { map: paper.tex })); sheet.rotation.x = -Math.PI / 2; sheet.position.y = 0.01; sheet.receiveShadow = true; stage.root.add(sheet);
    const lineMat = M.matte(0x1f3fcf);
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lineMat); line.rotation.x = -Math.PI / 2; line.position.y = 0.016; stage.root.add(line);

    // Ink drops travelling to the nib, and air bubbles travelling back.
    const drops = swarm(36, new THREE.SphereGeometry(0.06, 10, 8), M.plastic(0x2f5bff, { roughness: 0.2 }));
    const bubbles = swarm(12, new THREE.SphereGeometry(0.09, 12, 10), M.clear(0xffffff, 0.75, { depthWrite: true }));
    pen.add(drops, bubbles);
    const dt0 = Array.from({ length: 36 }, (_, i) => i / 36), bt0 = Array.from({ length: 12 }, (_, i) => i / 12);

    stage.label('Nib (two tines)', [-2.4, 0.7, 0], pen, 'hot');
    stage.label('Breather hole', [-0.9, 0.55, 0.3], pen);
    stage.label('Feed', [0.2, -0.75, 0.4], pen);
    stage.label('Ink', [4.6, 0.85, 0], pen);
    stage.label('Air bubbles', [3.4, -0.6, 0.4], pen);

    // The tip's position on the paper, for the written line.
    const tipWorld = new THREE.Vector3();
    let flow = 1, spread = 0, lineLen = 0, scroll = 0;
    return {
      update(dt, s) {
        flow = approach(flow, s.writing ? 0.4 + s.pressure * 0.8 : 0, 5, dt);
        spread = approach(spread, s.pressure, 6, dt);
        left.rotation.y = spread * 0.06; right.rotation.y = -spread * 0.06;
        const lvl = clamp(s.level, 0.02, 1), len = 3.2 * lvl;
        inkCol.scale.x = len; inkCol.position.x = 3.0 + len / 2;
        const speed = s.writing ? 1.1 : 0;
        scroll += speed * dt; paper.tex.offset.x = scroll / 16;
        pen.localToWorld(tipWorld.set(-3.4, 0.12, 0));
        lineLen = Math.min(7, lineLen + speed * dt);
        const w = 0.05 + spread * 0.32;
        line.scale.set(lineLen, w, 1);
        line.position.set(tipWorld.x - lineLen / 2 - 0.05, 0.016, 0);
        for (let i = 0; i < dt0.length; i++) { dt0[i] = (dt0[i] + dt * 0.22 * flow) % 1; const p = along(INK_PATH, dt0[i]); drops.place(i, [p.x, p.y, p.z + Math.sin(i * 7) * 0.03], null, flow > 0.05 ? 1 : 0.001); }
        drops.done();
        for (let i = 0; i < bt0.length; i++) {
          bt0[i] = (bt0[i] + dt * 0.16 * flow) % 1;
          const p = along(AIR_PATH, bt0[i]);
          const inside = p.x > 3 ? Math.min(1, (p.x - 3) / 1.6) : 0;
          bubbles.place(i, [p.x, p.y + inside * (lvl * 0.3), p.z + Math.cos(i * 3) * 0.08], null, flow > 0.05 && (p.x < 3 + len) ? 0.6 + 0.4 * Math.sin(i) ** 2 : 0.001);
        }
        bubbles.done();
      },
      readout: (s) => `<div class="row"><span>Line</span><b>about ${(0.3 + s.pressure * 1.2).toFixed(1)} mm wide</b></div>
        <div class="row"><span>Tines</span><b>${s.pressure < 0.15 ? 'closed' : s.pressure < 0.6 ? 'opening' : 'spread wide'}</b></div>
        <div class="row"><span>Air in</span><b>${s.writing ? 'one bubble per drop out' : 'none (not writing)'}</b></div>`,
    };
  },
};
