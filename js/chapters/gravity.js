// Chapter 3: gravity, air, and the pressurized "space pen".
import { THREE, M, rod, sphere, box, approach, clamp } from '../kit.js';

export default {
  id: 'gravity',
  short: 'Gravity & air',
  title: 'Why a ballpoint needs gravity',
  subtitle: 'Point it at the ceiling and the ink walks away from the ball.',
  view: { pos: [1, 6, 17], target: [0, 5.6, 0] },
  learn: `<p>An ordinary ballpoint relies on <b>gravity</b> to keep ink sitting against the back of the ball. Write on a wall for a while, or on a notepad held above your head, and the ink column slides back up the tube. The ball runs dry and the line fades.</p>
    <p>There's a tiny <b>air hole</b> at the back of the refill. As ink leaves through the ball, air comes in behind it. Block the hole and a partial vacuum builds up that holds the ink back, so the pen stops writing even pointing down.</p>
    <p>A <b>pressurized refill</b>, the idea behind the Fisher Space Pen (1965), seals the tube and puts compressed nitrogen behind a plug of ink. The gas pushes ink to the ball at any angle, underwater, in freezing cold and in space.</p>
    <p class="tip"><b>Try it:</b> tip the pen upside down, block the air hole, then switch on the pressurized refill.</p>`,
  terms: [
    { t: 'Air vent', d: 'A small hole that lets air replace the ink that has been used.' },
    { t: 'Vacuum', d: 'Lower pressure left behind when air can’t get in. It holds the ink back.' },
    { t: 'Pressurized refill', d: 'A sealed refill with gas behind the ink, so it writes at any angle.' },
  ],
  defaults: { angle: 0, blocked: false, pressurized: false },
  controls: [
    { key: 'angle', type: 'range', label: 'Point the pen', min: 0, max: 180, step: 1, ends: ['down at a desk', 'up at the ceiling'], fmt: (v) => Math.round(v) + '°' },
    { key: 'blocked', type: 'toggle', label: 'Block the air hole' },
    { key: 'pressurized', type: 'toggle', label: 'Pressurized refill (space pen)' },
  ],
  quiz: [
    { q: 'Why does an ordinary ballpoint stop writing upside down?', options: ['The ball falls out', 'Gravity pulls the ink away from the ball', 'The ink freezes', 'The spring jams'], answer: 1, why: 'Without gravity holding it at the tip, the ink column slides back and the ball runs dry.' },
    { q: 'What does the tiny hole at the back of a refill do?', options: ['Lets air replace used ink', 'Lets ink drip out', 'Holds the spring', 'Nothing'], answer: 0, why: 'Air must replace used ink, or a vacuum holds the ink back.' },
    { q: 'How does a space pen write in zero gravity?', options: ['Magnets pull the ink', 'Compressed gas pushes the ink to the ball', 'It uses pencil lead', 'Astronauts shake it'], answer: 1, why: 'Pressurized nitrogen behind the ink does gravity’s job.' },
  ],
  reel: [
    { ms: 5200, caption: 'Point an ordinary ballpoint at the ceiling and the ink slides away from the ball.', set: { pressurized: false, blocked: false }, anim: { angle: [0, 180] }, spin: 0 },
    { ms: 4400, caption: 'A pressurized refill pushes ink to the ball at any angle, even in space.', set: { pressurized: true, angle: 180 }, spin: 0.4 },
  ],

  build({ stage }) {
    const pivot = new THREE.Group(); pivot.position.y = 5.8; stage.root.add(pivot);
    const pen = new THREE.Group(); pivot.add(pen);

    // Refill along local X, tip at -X. Cut-open tube so the contents show.
    const tube = rod(-4, 4, 0.5, 0.5, M.clear(0xd8e8ff, 0.16), 48, true);
    const tipM = new THREE.Mesh(new THREE.ConeGeometry(0.5, 0.9, 32), M.metal(0xd4a64a));
    tipM.rotation.z = Math.PI / 2; tipM.position.x = -4.45;
    const ballM = sphere(0.14, M.metal(0xe8ecf2), 20); ballM.position.x = -4.95;
    const cap = rod(4, 4.15, 0.52, 0.52, M.plastic(0x2a3040));
    const vent = sphere(0.1, M.glow(0x9ef0a0), 16); vent.position.set(4.18, 0, 0);
    const plug = box(0.12, 0.2, 0.2, M.glow(0xff6b6b)); plug.position.set(4.2, 0, 0); plug.visible = false;
    pen.add(tube, tipM, ballM, cap, vent, plug);

    const inkMat = M.plastic(0x2346d9, { roughness: 0.3 });
    const INK_LEN = 3.6;
    const ink = rod(0, INK_LEN, 0.42, 0.42, inkMat);
    pen.add(ink);
    const follower = rod(0, 0.35, 0.43, 0.43, M.matte(0x9aa3b2));
    const gasMat = M.ghost(0xffb547, 0.35);
    const gas = rod(0, 1, 0.44, 0.44, gasMat);
    pen.add(follower, gas);

    // A little sheet of paper at the tip, with the line being written.
    const sheet = new THREE.Group(); sheet.position.x = -5.1; pen.add(sheet);
    const card = new THREE.Mesh(new THREE.PlaneGeometry(4, 3), M.matte(0xf4f1e8, { side: THREE.DoubleSide }));
    card.rotation.y = Math.PI / 2; sheet.add(card);
    const strokeMat = M.matte(0x2346d9);
    const stroke = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.08), strokeMat);
    stroke.rotation.y = Math.PI / 2; stroke.position.x = 0.01; sheet.add(stroke);

    const gLabel = stage.label('Gravity ↓', [4, 8.5, 0], stage.root, 'hot');
    const lGap = stage.label('Dry gap', [-3.4, -0.8, 0], pen);
    const lVent = stage.label('Air hole', [4.2, 0.75, 0], pen);
    stage.label('Ink', [0.2, 0.8, 0], pen);
    const lGas = stage.label('Compressed nitrogen', [3.1, 0.85, 0], pen);

    let gap = 0, flow = 1, written = 0, vac = 0;
    const state = { flow: 1, gap: 0 };
    return {
      update(dt, s) {
        const a = (s.angle * Math.PI) / 180;
        pivot.rotation.z = Math.PI / 2 - a; // tip points down at 0°, up at 180°
        const along = Math.cos(a);                     // how much gravity points toward the tip
        const pushToTip = s.pressurized || along > 0.15;
        gap = approach(gap, pushToTip ? 0 : clamp((-along + 0.15) * 3.4, 0, 3.4), pushToTip ? 3 : 0.9, dt);
        if (s.blocked && !s.pressurized) vac = Math.min(1, vac + dt * 0.35); else vac = Math.max(0, vac - dt * 2);
        const target = gap > 0.12 ? 0 : 1 - vac;
        flow = approach(flow, target, 4, dt);
        state.flow = flow; state.gap = gap;

        const x0 = -4 + 0.02 + gap;
        ink.position.x = x0 + INK_LEN / 2; ink.scale.x = 1;
        follower.visible = gas.visible = s.pressurized; lGas.visible = s.pressurized;
        follower.position.x = x0 + INK_LEN + 0.18;
        const gx0 = x0 + INK_LEN + 0.36, glen = Math.max(0.05, 4 - gx0);
        gas.scale.x = glen; gas.position.x = gx0 + glen / 2;
        plug.visible = s.blocked || s.pressurized; vent.visible = !plug.visible;
        lVent.element.textContent = s.pressurized ? 'Sealed' : s.blocked ? 'Air hole blocked' : 'Air hole';
        lGap.visible = gap > 0.12;
        written = flow > 0.3 ? Math.min(2.6, written + dt * 0.8 * flow) : written;
        stroke.scale.x = Math.max(0.001, written);
        stroke.position.z = -written / 2 + 1.3;
        strokeMat.opacity = 1; strokeMat.color.setHSL(0.63, 0.7, 0.35 + 0.35 * (1 - flow));
        gLabel.visible = true;
      },
      readout: (s) => {
        const ok = state.flow > 0.5;
        const why = s.pressurized ? 'gas pushes the ink onto the ball' : state.gap > 0.12 ? 'the ink has slid away from the ball' : s.blocked ? 'a vacuum is holding the ink back' : 'gravity keeps the ink on the ball';
        return `<div class="big ${ok ? 'ok' : 'no'}">${ok ? 'Writing' : 'Running dry'}</div>Because ${why}.`;
      },
    };
  },
};
