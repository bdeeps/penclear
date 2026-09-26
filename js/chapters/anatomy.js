// Chapter 1: take a retractable ballpoint apart.
import { THREE, M, rod, latheX, sphere, box, spring, exploder, clamp } from '../kit.js';

const INK = 0x2f5bff;

export default {
  id: 'anatomy',
  short: 'Inside a ballpoint',
  title: 'Inside a ballpoint pen',
  subtitle: 'A tube of thick ink, a tiny ball, a spring, and a clever button.',
  view: { pos: [1.5, 3.4, 12.5], target: [-0.3, 1.4, 0] },
  learn: `<p>Pull a click pen apart and there are only a handful of parts. The <b>refill</b> is a thin plastic tube full of thick, oily <b>ink</b>. At its end sits a brass <b>tip</b> holding a tiny steel or tungsten-carbide <b>ball</b>, usually 0.5 to 1 mm across.</p>
    <p>The ball is the whole trick. It's held by the tip so it can spin but can't fall out. When it rolls across paper, it carries ink from the tube down to the page.</p>
    <p>The <b>spring</b> pushes the refill back into the barrel. The <b>button</b> and a little rotating <b>cam</b> hold it out when you click, and let it go when you click again.</p>
    <p class="tip"><b>Try it:</b> explode the pen, switch on X-ray, and drain the ink.</p>`,
  terms: [
    { t: 'Refill', d: 'The replaceable tube that holds the ink, the tip and the ball.' },
    { t: 'Ball', d: 'A tiny sphere, often tungsten carbide, that rolls ink onto paper.' },
    { t: 'Socket', d: 'The end of the tip that grips the ball while letting it spin.' },
    { t: 'Viscosity', d: 'How thick a liquid is. Ballpoint ink is about as thick as honey, so it doesn’t leak.' },
  ],
  defaults: { explode: 0, xray: true, ink: 0.8 },
  controls: [
    { key: 'explode', type: 'range', label: 'Take it apart', min: 0, max: 1, step: 0.01, ends: ['together', 'exploded'], fmt: (v) => Math.round(v * 100) + '%' },
    { key: 'xray', type: 'toggle', label: 'X-ray barrel' },
    { key: 'ink', type: 'range', label: 'Ink left', min: 0.02, max: 1, step: 0.01, fmt: (v) => Math.round(v * 100) + '%' },
  ],
  quiz: [
    { q: 'What actually puts the ink on the paper?', options: ['A felt wick', 'A tiny rolling ball', 'Gravity dripping ink', 'A sponge in the tip'], answer: 1, why: 'The ball rolls: ink sticks to it inside the pen and is laid down on the paper as it turns.' },
    { q: 'Why doesn’t ballpoint ink leak out of the tip?', options: ['It’s frozen', 'It’s thick and oily, and the ball seals the tip', 'There’s a valve', 'The spring holds it in'], answer: 1, why: 'Thick ink plus a tight ball-and-socket act like a seal until the ball turns.' },
    { q: 'What does the spring do?', options: ['Pushes ink out', 'Pulls the refill back in when the pen is retracted', 'Makes the ball spin', 'Nothing'], answer: 1, why: 'The spring retracts the refill; the button and cam hold it out.' },
  ],
  reel: [
    { ms: 5200, caption: 'A ballpoint is just a tube of thick ink, a tiny ball, a spring and a button.', set: { xray: true, ink: 0.8 }, anim: { explode: [0, 1] }, spin: 0.8 },
  ],

  build({ stage }) {
    const pen = new THREE.Group();
    pen.position.y = 1.6;
    pen.rotation.z = 0.05;
    stage.root.add(pen);

    const barrelMat = M.clear(0xbfd9ff, 0.14);
    const barrel = rod(-3.9, 3.4, 0.42, 0.42, barrelMat, 48, true);
    barrel.castShadow = false;
    const grip = rod(-3.9, -2.2, 0.46, 0.44, M.matte(0x1b1e27));
    const nose = latheX([[-5.2, 0.07], [-4.9, 0.16], [-3.9, 0.42], [-3.9, 0]], M.plastic(0x2a3040));
    const barrelParts = new THREE.Group(); barrelParts.add(barrel, grip, nose);

    // Refill: tube, ink column, brass tip and the ball.
    const refill = new THREE.Group();
    const tubeR = rod(-4.4, 3.0, 0.15, 0.15, M.clear(0xffffff, 0.35), 32, true);
    const inkCol = rod(-4.3, 2.9, 0.12, 0.12, M.plastic(INK, { roughness: 0.3 }));
    const brass = latheX([[-5.35, 0.05], [-5.1, 0.1], [-4.4, 0.15], [-4.4, 0]], M.metal(0xd4a64a));
    const ball = sphere(0.06, M.metal(0xe8ecf2), 24); ball.position.x = -5.38;
    refill.add(tubeR, inkCol, brass, ball);

    const coil = spring(-3.8, -2.6, 0.22, 0.025, 9, M.metal(0xcfd4dc));
    const button = new THREE.Group();
    button.add(rod(3.4, 4.3, 0.3, 0.3, M.plastic(0x2f5bff)), rod(3.2, 3.5, 0.34, 0.34, M.plastic(0x1a1d26)));
    const cam = rod(2.9, 3.2, 0.26, 0.26, M.metal(0x8b93a3));
    const clip = box(3.2, 0.06, 0.14, M.metal(0xc0c6d0)); clip.position.set(1.7, 0.5, 0);
    pen.add(barrelParts, refill, coil, button, cam, clip);

    const parts = [
      { obj: barrelParts, off: [0, 1.3, 0] },
      { obj: refill, off: [-0.3, -0.35, 0] },
      { obj: coil, off: [0.4, -1.2, 0] },
      { obj: button, off: [1.1, 0.2, 0] },
      { obj: cam, off: [0.6, -1.0, 0] },
      { obj: clip, off: [0, 2.2, 0] },
    ];
    const setExplode = exploder(parts);
    const L = (text, obj, pos) => stage.label(text, pos, obj);
    L('Barrel', barrelParts, [0.5, 0.6, 0]);
    L('Refill: a tube of ink', refill, [0.8, -0.35, 0]);
    L('Tip and ball', refill, [-5.2, -0.3, 0]);
    L('Spring', coil, [-3.2, -0.45, 0]);
    L('Push button', button, [3.9, 0.5, 0]);
    L('Cam', cam, [3.05, -0.5, 0]);
    L('Clip', clip, [1.7, 0.25, 0]);

    return {
      update(dt, s) {
        setExplode(s.explode);
        barrelMat.opacity = s.xray ? 0.14 : 0.92;
        barrelMat.color.set(s.xray ? 0xbfd9ff : 0x2a3040);
        const len = 7.2 * clamp(s.ink, 0.02, 1);
        inkCol.scale.x = len / 7.2;
        inkCol.position.x = -4.3 + len / 2;
      },
      readout: (s) => `<div class="big">${Math.round(s.ink * 2000).toLocaleString('en')} m</div>of line left in this refill, if a full one writes about 2 km (a typical claim for cheap ballpoints).`,
    };
  },
};
