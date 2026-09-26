// Chapter 2: the rolling ball, seen up close.
import { THREE, M, sphere, canvasTexture, approach } from '../kit.js';

const INKS = {
  oil: { label: 'Oil-based (ballpoint)', color: 0x2346d9, factor: 0.42, film: 0.55 },
  gel: { label: 'Gel', color: 0x1636ff, factor: 0.55, film: 0.85 },
  water: { label: 'Water-based (rollerball)', color: 0x3d7bff, factor: 0.62, film: 0.4 },
};

export default {
  id: 'ball',
  short: 'The rolling ball',
  title: 'The rolling ball',
  subtitle: 'It picks up ink on top and lays it down underneath.',
  view: { pos: [3.4, 3.4, 8.5], target: [-0.8, 1.3, 0] },
  learn: `<p>The ball sits in a socket just big enough to let it turn. Inside the pen, its top half is bathed in ink. As you drag the pen, friction with the paper makes the ball <b>roll</b>, and the inked surface comes round to the bottom and touches the page.</p>
    <p>Ballpoint ink is thick and oily, so only a thin film clings to the ball, and it barely soaks into paper. That's why ballpoints rarely smudge or bleed through. <b>Gel</b> and <b>rollerball</b> inks are runnier, so they lay down wetter, bolder lines.</p>
    <p>The <b>line width</b> depends on the ball: a 0.7 mm ball draws a line only about 0.3 mm wide, because just a small part of the ball touches the paper.</p>
    <p class="tip"><b>Try it:</b> write faster, swap the ball size, and compare the three inks.</p>`,
  terms: [
    { t: 'Rolling contact', d: 'The ball’s bottom point moves with the paper, so the ball turns instead of sliding.' },
    { t: 'Ink film', d: 'The thin layer of ink carried on the ball’s surface.' },
    { t: 'Gel ink', d: 'A water-based ink thickened with a gel. It flows when the ball moves and thickens again at rest.' },
  ],
  defaults: { speed: 1, size: 0.7, ink: 'oil' },
  controls: [
    { key: 'speed', type: 'range', label: 'Writing speed', min: 0, max: 3, step: 0.01, ends: ['stopped', 'fast'], fmt: (v) => (v * 5).toFixed(1) + ' cm/s' },
    { key: 'size', type: 'seg', label: 'Ball size', options: [{ v: 0.5, label: '0.5 mm' }, { v: 0.7, label: '0.7 mm' }, { v: 1, label: '1.0 mm' }], fmt: (v) => v.toFixed(1) + ' mm' },
    { key: 'ink', type: 'seg', label: 'Ink', options: [{ v: 'oil', label: 'Ballpoint' }, { v: 'gel', label: 'Gel' }, { v: 'water', label: 'Rollerball' }] },
  ],
  quiz: [
    { q: 'Why does the ball roll instead of sliding?', options: ['A motor turns it', 'Friction with the paper turns it as you move the pen', 'Ink pressure spins it', 'Magnetism'], answer: 1, why: 'The paper grips the bottom of the ball, so dragging the pen makes it roll.' },
    { q: 'A 0.7 mm ball draws a line about how wide?', options: ['0.3 mm', '0.7 mm', '1.4 mm', '7 mm'], answer: 0, why: 'Only a small part of the ball touches the paper, so the line is narrower than the ball.' },
    { q: 'Why do ballpoints smudge less than rollerballs?', options: ['Their ink is thick and oily and barely soaks in', 'Their balls are smaller', 'They write slower', 'They use pencil lead'], answer: 0, why: 'Thick oil-based ink sits in a thin film that dries fast.' },
  ],
  reel: [
    { ms: 4800, caption: 'As it rolls, the ball picks up ink on top and lays it down underneath.', set: { ink: 'oil', size: 0.7 }, anim: { speed: [0, 2] }, spin: 0.3 },
    { ms: 4200, caption: 'A bigger ball lays down a wider line.', set: { speed: 1.4, ink: 'gel' }, anim: { size: [0.5, 1] }, spin: 0.3 },
  ],

  build({ stage }) {
    // Paper with ruled lines that scroll as you write.
    const paper = canvasTexture(1024, 512, (g, w, h) => {
      g.fillStyle = '#f4f1e8'; g.fillRect(0, 0, w, h);
      g.strokeStyle = 'rgba(80,120,200,.35)'; g.lineWidth = 3;
      for (let y = 40; y < h; y += 96) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
      g.fillStyle = 'rgba(0,0,0,.035)';
      for (let i = 0; i < 1800; i++) g.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    });
    paper.tex.wrapS = paper.tex.wrapT = THREE.RepeatWrapping;
    const paperMesh = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), M.matte(0xffffff, { map: paper.tex }));
    paperMesh.rotation.x = -Math.PI / 2; paperMesh.position.y = 0.01; paperMesh.receiveShadow = true;
    stage.root.add(paperMesh);

    // The written line: a strip from the contact point back along the paper.
    const lineMat = M.matte(INKS.oil.color, { roughness: 0.4 });
    const line = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), lineMat);
    line.rotation.x = -Math.PI / 2; line.position.y = 0.016;
    stage.root.add(line);

    // Tip: brass socket cut open so you can see inside, the ball, and the ink.
    const tip = new THREE.Group();
    stage.root.add(tip);
    const prof = [];
    const outer = [[1.08, 0.62], [1.18, 0.9], [1.3, 1.6], [1.4, 2.4], [1.5, 3.6]];
    outer.forEach(([r, y]) => prof.push(new THREE.Vector2(r, y)));
    prof.push(new THREE.Vector2(0.46, 3.6), new THREE.Vector2(0.42, 2.2), new THREE.Vector2(0.52, 1.92));
    for (let y = 1.86; y >= 0.62; y -= 0.08) prof.push(new THREE.Vector2(Math.sqrt(Math.max(0, 1 - (y - 1) ** 2)) + 0.03, y));
    prof.push(new THREE.Vector2(1.08, 0.62));
    const socket = new THREE.Mesh(new THREE.LatheGeometry(prof, 64, Math.PI * 0.4, Math.PI * 1.2), M.metal(0xd4a64a, { side: THREE.DoubleSide }));
    socket.castShadow = true;
    tip.add(socket);
    const ballTex = canvasTexture(512, 256, (g, w, h) => {
      g.fillStyle = '#d9dee6'; g.fillRect(0, 0, w, h);
      g.fillStyle = '#9aa3b2';
      for (let i = 0; i < 8; i++) g.fillRect((i * w) / 8, 0, w / 32, h);
      for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.3})`; g.fillRect(Math.random() * w, Math.random() * h, 3, 3); }
    });
    const ball = sphere(1, M.metal(0xffffff, { map: ballTex.tex, roughness: 0.22, metalness: 0.85 }), 48);
    ball.position.y = 1;
    tip.add(ball);
    const inkMat = M.plastic(INKS.oil.color, { roughness: 0.25, transparent: true, opacity: 0.85 });
    const film = new THREE.Mesh(new THREE.SphereGeometry(1.03, 48, 24, 0, Math.PI * 2, 0, 1.25), inkMat);
    film.position.y = 1;
    const channel = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 1.7, 32), inkMat);
    channel.position.y = 2.75;
    tip.add(film, channel);
    // Ink droplets riding down the channel onto the ball.
    const drops = Array.from({ length: 10 }, (_, i) => { const d = sphere(0.09, inkMat, 12); d.userData.t = i / 10; tip.add(d); return d; });

    stage.label('Ink', [0, 3.9, 0], tip, 'hot');
    stage.label('Socket', [-1.7, 2.6, 0], tip);
    stage.label('Ball', [1.25, 1.1, 0.4], tip);
    stage.label('Your line', [-5, 0.25, 0.6]);

    let lineLen = 0, filmK = 0.55, lineW = 0.3, scroll = 0;
    const tmpColor = new THREE.Color();
    return {
      update(dt, s) {
        const ink = INKS[s.ink] || INKS.oil;
        const k = s.size / 0.7;
        tip.scale.setScalar(k);
        const v = s.speed * 1.2;                 // scene units per second
        ball.rotation.z -= (v / k) * dt;          // rolls: bottom moves with the paper
        scroll += v * dt;
        paper.tex.offset.x = scroll / 18;
        lineLen = Math.min(9, lineLen + v * dt);
        if (v === 0 && lineLen > 0) lineLen = Math.max(lineLen, 0.001);
        lineW = approach(lineW, 2 * k * ink.factor, 6, dt);
        line.scale.set(lineLen, lineW, 1);
        line.position.x = -lineLen / 2;
        tmpColor.set(ink.color);
        lineMat.color.lerp(tmpColor, 1 - Math.exp(-6 * dt));
        inkMat.color.copy(lineMat.color);
        filmK = approach(filmK, ink.film, 6, dt);
        inkMat.opacity = 0.55 + 0.35 * filmK;
        drops.forEach((d) => {
          d.userData.t = (d.userData.t + dt * (0.15 + v * 0.35)) % 1;
          const t = d.userData.t;
          d.position.set(Math.sin(t * 40) * 0.12, 3.5 - t * 1.6, Math.cos(t * 40) * 0.12);
          d.visible = v > 0.01;
        });
      },
      readout: (s) => {
        const ink = INKS[s.ink] || INKS.oil;
        const turns = 10 / (Math.PI * s.size);
        return `<div class="row"><span>Ball</span><b>${s.size.toFixed(1)} mm</b></div>
          <div class="row"><span>Line</span><b>about ${(s.size * ink.factor).toFixed(2)} mm wide</b></div>
          <div class="row"><span>The ball turns</span><b>${turns.toFixed(1)} times per cm</b></div>
          <div class="row"><span>At this speed</span><b>${(s.speed * 5 * turns).toFixed(0)} turns a second</b></div>`;
      },
    };
  },
};
