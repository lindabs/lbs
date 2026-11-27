// Tappa 5 (l'albo e i cartoncini "Nel mio cielo c'è…") e Tappa 6 (la costellazione della scuola).
import * as THREE from 'three';
import { V, trama, caso, alone, tramaStella, testoCentrato, pathStella, memoria } from './utili.js';
import { FRASI_ESEMPIO, STELLE_ESEMPIO } from './dati.js';
import { ostacolo } from './stanze.js';

export const lettura = {
  carte: [],
  costruisci(scene) {
    this.scene = scene;
    // l'albo sul leggio (copertina disegnata per il tour, non quella dell'editore)
    const cop = trama(512, 640, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0d1d57'); gr.addColorStop(1, '#2a4fa8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = caso(21); for (let i = 0; i < 70; i++) { g.fillStyle = '#ffe9a0'; pathStella(g, r() * w, 170 + r() * 300, 4 + r() * 8, 2 + r() * 3); g.fill(); }
      g.fillStyle = '#0a1238'; g.beginPath(); g.ellipse(256, 700, 420, 230, 0, 0, 7); g.fill();
      g.fillStyle = '#f2c94c'; g.beginPath(); g.arc(256, 455, 22, 0, 7); g.fill(); g.fillRect(244, 475, 24, 50);
      g.font = 'italic 400 76px "Instrument Serif"'; g.fillStyle = '#f7e7a1'; g.textAlign = 'center'; g.fillText('Il cielo', w / 2, 92); g.fillText('è di tutti', w / 2, 160);
      g.font = '600 28px "Hanken Grotesk"'; g.fillStyle = '#dfe6ff'; g.fillText('GIANNI RODARI', w / 2, 600);
    });
    const leggio = new THREE.Group();
    const libro = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.53, 0.025), [0, 0, 0, 0, 1, 0].map((k) => new THREE.MeshStandardMaterial(k ? { map: cop, roughness: 0.6 } : { color: 0xf3eee2 })));
    libro.position.y = 1.0; libro.rotation.x = -0.25; leggio.add(libro);
    const asta = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 0.85, 8), new THREE.MeshStandardMaterial({ color: 0x8a6a3a })); asta.position.y = 0.43; leggio.add(asta);
    leggio.position.set(-2.7, 0, -47.3); leggio.rotation.y = 0.65; scene.add(leggio); ostacolo(-2.7, -47.3, 0.4, 0.4);
    // filo dei cartoncini a forma di stella sulla parete sinistra
    this.a = V(-4.42, 2.15, -40.8); this.b = V(-4.42, 2.15, -48.3);
    const pts = []; for (let i = 0; i <= 30; i++) { const t = i / 30; const p = this.a.clone().lerp(this.b, t); p.y -= 0.3 * 4 * t * (1 - t); pts.push(p); }
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x7d6a4f })));
    this.ridisegna();
  },
  frasi() { return memoria.leggi('frasi', []); },
  ridisegna() {
    this.carte.forEach((c) => this.scene.remove(c)); this.carte = [];
    const proprie = this.frasi().slice(-10).map((t) => ({ t, es: false }));
    const tutte = FRASI_ESEMPIO.map((t) => ({ t, es: true })).slice(0, Math.max(0, 12 - proprie.length)).concat(proprie);
    tutte.forEach((f, i) => {
      const t = (i + 0.5) / 12; const p = this.a.clone().lerp(this.b, t); p.y -= 0.3 * 4 * t * (1 - t) + 0.24;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.5), new THREE.MeshStandardMaterial({ map: tramaStella('Nel mio cielo c\'è… ' + f.t, { carta: f.es ? '#efe4bf' : '#f7df7a', esempio: f.es }), transparent: true, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.9 }));
      m.position.copy(p); m.rotation.y = Math.PI / 2; m.userData.fase = i; this.scene.add(m); this.carte.push(m);
    });
  },
  aggiungi(testo) { const f = this.frasi(); f.push(testo); memoria.scrivi('frasi', f); this.ridisegna(); return this.carte[this.carte.length - 1]; },
  aggiorna(t) { this.carte.forEach((m) => { m.rotation.x = Math.sin(t * 0.9 + m.userData.fase) * 0.05; }); },
};

export const PANNELLO = { cx: 0, cy: 1.95, z: -58.94, w: 7.2, h: 2.7 };
export const costellazione = {
  stelle: [],
  costruisci(scene) {
    this.scene = scene; const P = PANNELLO;
    const tr = trama(2048, 768, (g, w, h) => {
      g.fillStyle = '#132a72'; g.fillRect(0, 0, w, h);
      const r = caso(17); for (let i = 0; i < 2600; i++) { g.strokeStyle = `rgba(${r() > 0.5 ? '70,110,200' : '10,25,80'},.35)`; g.lineWidth = 2 + r() * 4; g.beginPath(); const x = r() * w, y = r() * h, a = Math.sin(x * 0.004) + Math.cos(y * 0.006); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke(); }
      for (let i = 0; i < 300; i++) { g.fillStyle = `rgba(255,245,210,${r() * 0.8})`; g.fillRect(r() * w, r() * h, 2, 2); }
      g.font = 'italic 400 64px "Instrument Serif"'; g.fillStyle = '#f2c94c'; g.textAlign = 'left'; g.fillText('La costellazione della scuola', 56, 90);
    });
    const pan = new THREE.Mesh(new THREE.PlaneGeometry(P.w, P.h), new THREE.MeshStandardMaterial({ map: tr, roughness: 0.9, emissive: 0xffffff, emissiveMap: tr, emissiveIntensity: 0.35 }));
    pan.position.set(P.cx, P.cy, P.z); scene.add(pan); this.pannello = pan;
    const cornice = new THREE.Mesh(new THREE.BoxGeometry(P.w + 0.12, P.h + 0.12, 0.03), new THREE.MeshStandardMaterial({ color: 0xcaa57a })); cornice.position.set(P.cx, P.cy, P.z - 0.02); scene.add(cornice);
    const l = new THREE.PointLight(0xfff1d0, 6, 0, 1.6); l.position.set(0, 3.2, -57.2); scene.add(l);
    this.linee = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xf2c94c, transparent: true, opacity: 0.75 })); scene.add(this.linee);
    STELLE_ESEMPIO.forEach((s) => this.metti(s.testo, s.u, s.v, 'oro', true, false));
    memoria.leggi('stelle', []).forEach((s) => this.metti(s.testo, s.u, s.v, s.penna, false, false));
  },
  metti(testo, u, v, penna = 'oro', esempio = false, anima = true) {
    const P = PANNELLO;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: tramaStella(testo, { carta: '#0b0f1f', inchiostro: penna === 'oro' ? '#f2c94c' : '#ffffff', bordo: '#d9a838', esempio }), transparent: true, alphaTest: 0.5, toneMapped: false }));
    m.position.set(P.cx + u, P.cy + v, P.z + 0.012 + this.stelle.length * 0.0005); m.rotation.z = (Math.random() - 0.5) * 0.4;
    const s = { testo, u, v, penna, esempio, m, nascita: anima ? performance.now() : 0 };
    if (anima) { m.scale.setScalar(0.01); const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: alone, color: 0xffd76a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); sp.scale.setScalar(1.4); m.add(sp); s.scintilla = sp; }
    this.scene.add(m); this.stelle.push(s); this.collega(); return s;
  },
  // Ogni stella si unisce alla più vicina tra quelle già appese: la costellazione cresce come un albero.
  collega() {
    const pts = [];
    this.stelle.forEach((s, i) => { if (!i) return; let best = null, bd = 1e9; for (let j = 0; j < i; j++) { const o = this.stelle[j]; const d = (o.u - s.u) ** 2 + (o.v - s.v) ** 2; if (d < bd) { bd = d; best = o; } } pts.push(s.m.position.clone().setZ(PANNELLO.z + 0.008), best.m.position.clone().setZ(PANNELLO.z + 0.008)); });
    this.linee.geometry.dispose(); this.linee.geometry = new THREE.BufferGeometry().setFromPoints(pts);
  },
  puntoSulPannello(raggio) { const h = raggio.intersectObject(this.pannello)[0]; if (!h) return null; return { u: h.point.x - PANNELLO.cx, v: h.point.y - PANNELLO.cy }; },
  appendi(testo, u, v, penna) {
    const P = PANNELLO; u = THREE.MathUtils.clamp(u, -P.w / 2 + 0.25, P.w / 2 - 0.25); v = THREE.MathUtils.clamp(v, -P.h / 2 + 0.25, P.h / 2 - 0.5);
    const s = this.metti(testo, u, v, penna); const salvate = memoria.leggi('stelle', []); salvate.push({ testo, u: +u.toFixed(3), v: +v.toFixed(3), penna }); memoria.scrivi('stelle', salvate); return s;
  },
  rifai() { this.stelle.forEach((s) => this.scene.remove(s.m)); this.stelle = []; STELLE_ESEMPIO.forEach((s) => this.metti(s.testo, s.u, s.v, 'oro', true, false)); memoria.leggi('stelle', []).forEach((s) => this.metti(s.testo, s.u, s.v, s.penna, false, false)); },
  aggiorna(now) {
    for (const s of this.stelle) if (s.nascita) { const k = Math.min(1, (now - s.nascita) / 900); const e = 1 - (1 - k) ** 3; s.m.scale.setScalar(0.01 + e * (1 + Math.sin(k * Math.PI) * 0.3)); if (s.scintilla) s.scintilla.material.opacity = 1 - k; if (k >= 1) { s.nascita = 0; if (s.scintilla) { s.m.remove(s.scintilla); s.scintilla = null; } } }
  },
};
