// Chapter 6: the click mechanism. A cam turns an eighth of a turn per click and
// alternately locks the refill out or lets the spring pull it back in.
import { THREE, M, rod, box, spring, smooth } from '../kit.js';

export default {
  id: 'click',
  short: 'The click',
  title: 'How the click works',
  subtitle: 'A tiny rotating cam that remembers whether the pen is out or in.',
  view: { pos: [7, 6.5, 14], target: [0, 3.6, 0] },
  learn: `<p>Press the button of a retractable pen and three parts meet: the <b>plunger</b> you push, a <b>cam</b> ring with slanted teeth, and <b>ribs</b> moulded inside the barrel.</p>
    <p>The plunger's teeth push the cam down and slide it sideways along their slopes, turning it a little. When you let go, the <b>spring</b> pushes back and the cam lands on the ribs. Every other click it lands on top of a rib, which holds the tip <b>out</b>. On the next click it turns a little further and drops into a groove, so the tip goes <b>in</b>.</p>
    <p>Each click turns the cam one eighth of a turn. Nothing needs to remember the state, because the cam's angle <i>is</i> the memory.</p>
    <p class="tip"><b>Try it:</b> press Click a few times and watch the cam's marker go round.</p>`,
  terms: [
    { t: 'Cam', d: 'A shaped part that turns a push into a turn, or a turn into a push.' },
    { t: 'Plunger', d: 'The button you press. Its sloped teeth turn the cam.' },
    { t: 'Ratchet', d: 'A mechanism that can only move one way, step by step.' },
  ],
  defaults: { auto: false, clicks: 0 },
  controls: [
    { key: 'press', type: 'buttons', label: 'Press the button', items: [{ label: 'Click', act: (s, inst) => inst.click() }] },
    { key: 'auto', type: 'toggle', label: 'Keep clicking' },
  ],
  quiz: [
    { q: 'How far does the cam turn each click?', options: ['A full turn', 'Half a turn', 'An eighth of a turn', 'It doesn’t turn'], answer: 2, why: 'Its slanted teeth step it one eighth of a turn per click.' },
    { q: 'What decides whether the tip stays out?', options: ['A battery', 'Whether the cam lands on a rib or drops into a groove', 'How hard you press', 'The ink level'], answer: 1, why: 'The cam’s angle alternates between resting on a rib and sliding into a groove.' },
    { q: 'What pulls the tip back in?', options: ['Gravity', 'The spring', 'The ink', 'A magnet'], answer: 1, why: 'When the cam drops into a groove, the spring pushes the refill back into the barrel.' },
  ],
  reel: [
    { ms: 5200, caption: 'Each click turns a little cam an eighth of a turn: out, in, out, in.', set: { auto: true }, spin: 0.5 },
  ],

  build({ stage }) {
    const g = new THREE.Group(); g.position.y = 0.4; stage.root.add(g);
    // Barrel cut open (half shell) so the mechanism shows.
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 7.6, 48, 1, true, Math.PI * 0.1, Math.PI * 1.3), M.clear(0xcfe0ff, 0.22));
    shell.position.y = 3.8; g.add(shell);
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 0.35, 1.2, 48, 1, true, Math.PI * 0.1, Math.PI * 1.3), M.clear(0xcfe0ff, 0.22));
    nose.position.y = -0.6; g.add(nose);

    // Ribs inside the barrel: four tall, four short, alternating.
    const ribMat = M.plastic(0x5b6478);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8, tall = i % 2 === 0;
      const rib = box(0.22, tall ? 1.3 : 0.7, 0.3, ribMat);
      rib.position.set(Math.cos(a) * 1.05, tall ? 4.1 : 4.3, Math.sin(a) * 1.05); rib.rotation.y = -a;
      g.add(rib);
    }

    // Cam ring with slanted teeth on top and a bright marker to show rotation.
    const cam = new THREE.Group(); g.add(cam);
    cam.add(rod(0, 1, 0.8, 0.8, M.metal(0x9aa3b2)));
    cam.children[0].rotation.z = Math.PI / 2; cam.children[0].scale.x = 0.9; cam.children[0].position.set(0, 0, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.45, 4), M.metal(0xb7bfcc));
      tooth.position.set(Math.cos(a) * 0.62, 0.62, Math.sin(a) * 0.62); tooth.rotation.y = -a;
      cam.add(tooth);
    }
    const marker = box(0.18, 0.5, 0.18, M.glow(0xff7a59)); marker.position.set(0.86, 0, 0); cam.add(marker);

    // Plunger with teeth pointing down, and the button above.
    const plunger = new THREE.Group(); g.add(plunger);
    plunger.add(rod(0, 1, 0.62, 0.62, M.plastic(0x2f5bff)));
    plunger.children[0].rotation.z = Math.PI / 2; plunger.children[0].scale.x = 2.4; plunger.children[0].position.set(0, 1.3, 0);
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 4), M.plastic(0x2f5bff));
      tooth.rotation.x = Math.PI; tooth.position.set(Math.cos(a) * 0.45, -0.1, Math.sin(a) * 0.45);
      plunger.add(tooth);
    }

    // Refill with spring; the tip pokes out of the nose when the cam is locked.
    const refill = new THREE.Group(); g.add(refill);
    const tubeM = rod(0, 1, 0.22, 0.22, M.clear(0xffffff, 0.5)); tubeM.rotation.z = Math.PI / 2; tubeM.scale.x = 4.6; tubeM.position.set(0, 2.1, 0); refill.add(tubeM);
    const inkM = rod(0, 1, 0.17, 0.17, M.plastic(0x2346d9)); inkM.rotation.z = Math.PI / 2; inkM.scale.x = 3.6; inkM.position.set(0, 2.4, 0); refill.add(inkM);
    const tipM = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 24), M.metal(0xd4a64a)); tipM.rotation.x = Math.PI; tipM.position.y = -0.55; refill.add(tipM);
    const coil = spring(0, 1.6, 0.36, 0.035, 8, M.metal(0xcfd4dc)); coil.rotation.z = Math.PI / 2; g.add(coil);

    stage.label('Push button (plunger)', [0, 8.5, 0], g, 'hot');
    stage.label('Cam: turns ⅛ per click', [1.6, 4.4, 0.8], g);
    stage.label('Ribs inside the barrel', [-1.7, 5.3, 0], g);
    stage.label('Spring', [0.9, 0.9, 0.6], g);
    const tipLabel = stage.label('', [0.9, -1.4, 0], g);

    // Click animation: 0→0.5 press (plunger down, cam pushed and turned half a step),
    // 0.5→1 release (cam lands one full step on, then settles on a rib or in a groove).
    let clicks = 0, anim = -1, autoT = 0;
    const api = { click: () => { if (anim < 0) anim = 0; } };
    const out = (n) => n % 2 === 1;
    return {
      ...api,
      update(dt, s) {
        if (s.auto) { autoT += dt; if (autoT > 1.1 && anim < 0) { autoT = 0; anim = 0; } }
        let press = 0, turn = clicks, camY;
        if (anim >= 0) {
          anim += dt * 1.6;
          const k = Math.min(1, anim);
          press = k < 0.5 ? smooth(k / 0.5) : 1 - smooth((k - 0.5) / 0.5);
          turn = clicks + smooth(k);
          if (anim >= 1) { anim = -1; clicks++; s.clicks = clicks; turn = clicks; press = 0; }
        }
        const isOut = out(Math.round(turn));
        const rest = isOut ? 5.2 : 5.9;            // held down on a rib (tip out) or risen into a groove (tip in)
        camY = rest - press * 0.55;
        cam.position.y = camY; cam.rotation.y = (-turn * Math.PI) / 4;
        plunger.position.y = camY + 0.8 + (1 - press) * 0.25;
        const refillY = camY - 6.2;                  // the refill travels with the cam
        refill.position.y = refillY;
        coil.position.y = 0.2; coil.scale.x = Math.max(0.4, (camY - 1.2) / 3.2) * 0.9;
        tipLabel.element.textContent = isOut ? 'Tip out: ready to write' : 'Tip in';
      },
      readout: () => `<div class="big">${out(clicks) ? 'Tip out' : 'Tip in'}</div><div class="row"><span>Clicks</span><b>${clicks}</b></div><div class="row"><span>Cam has turned</span><b>${clicks * 45}°</b></div>`,
    };
  },
};
