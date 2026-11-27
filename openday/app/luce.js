// Tappa 2 (foto dei laboratori) e Tappa 3: il tavolo luminoso dell'Atelier della luce.
import * as THREE from 'three';
import { V, trama, caso, alone, lucine, SAGOME, memoria, dbLeggi, dbScrivi, testoCentrato, pathStella } from './utili.js';
import { ostacolo } from './stanze.js';

/* ---------- Fotografie dei laboratori (aula immersiva) ---------- */
function fotoSegnaposto(i) {
  const titoli = ['Osserviamo il cielo', 'Il tavolo luminoso', 'Giochi d\'ombra', 'Dipingere le spirali'];
  return trama(640, 440, (g, w, h) => {
    const fondi = ['#1b2f6b', '#e9edf5', '#d8d3c8', '#21336e']; g.fillStyle = fondi[i]; g.fillRect(0, 0, w, h);
    const r = caso(i + 3);
    if (i === 0) { g.fillStyle = '#0c1640'; g.fillRect(150, 60, 340, 240); for (let k = 0; k < 40; k++) { g.fillStyle = '#ffe9a0'; g.fillRect(160 + r() * 320, 70 + r() * 220, 3, 3); } g.fillStyle = '#e6c49a'; for (const x of [210, 330, 430]) { g.beginPath(); g.arc(x, 330, 36, 0, 7); g.fill(); g.fillRect(x - 40, 360, 80, 80); } }
    if (i === 1) { g.fillStyle = '#fffbe9'; g.shadowColor = '#fff3b0'; g.shadowBlur = 40; g.fillRect(90, 120, 460, 220); g.shadowBlur = 0; for (let k = 0; k < 14; k++) { g.fillStyle = ['#e84a5f', '#2a9df4', '#4ccf7a', '#f2c14e', '#8e5cd9'][k % 5]; g.globalAlpha = 0.8; g.beginPath(); g.arc(120 + r() * 400, 150 + r() * 160, 14 + r() * 16, 0, 7); g.fill(); } g.globalAlpha = 1; g.fillStyle = '#1b1e2e'; pathStella(g, 320, 230, 60, 26); g.fill(); }
    if (i === 2) { g.fillStyle = '#fbfbf6'; g.fillRect(100, 40, 440, 300); g.fillStyle = '#3a3a44'; pathStella(g, 280, 180, 90, 40); g.fill(); g.beginPath(); g.arc(440, 130, 50, 0, 7); g.fill(); g.fillStyle = '#d8d3c8'; g.beginPath(); g.arc(462, 118, 44, 0, 7); g.fill(); }
    if (i === 3) { g.lineWidth = 14; for (let s = 0; s < 3; s++) { g.strokeStyle = ['#f2c94c', '#9cc7f2', '#ffffff'][s]; g.beginPath(); for (let k = 0; k < 140; k++) { const a = k * 0.13, rr = 6 + k * 0.9; g.lineTo(160 + s * 160 + Math.cos(a) * rr * 0.6, 200 + Math.sin(a) * rr * 0.6); } g.stroke(); } }
    g.fillStyle = 'rgba(7,13,34,.78)'; g.fillRect(0, h - 70, w, 70);
    g.font = '600 30px "Hanken Grotesk"'; g.fillStyle = '#f2c94c'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(titoli[i], 24, h - 44);
    g.font = '400 20px "Hanken Grotesk"'; g.fillStyle = '#cfd6ee'; g.fillText('Foto del laboratorio · da sostituire', 24, h - 16);
  });
}
export const foto = {
  cornici: [], immagini: [], indice: 0,
  costruisci(scene) {
    const x = -5.1, z0 = -11.6;
    const asse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.55, 2.4), new THREE.MeshStandardMaterial({ color: 0xece6da, roughness: 0.9 })); asse.position.set(x, 1.45, z0 - 1.0); scene.add(asse); ostacolo(x, z0 - 1.0, 0.4, 2.4);
    for (const dz of [-1.1, 1.1]) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.7, 0.04), new THREE.MeshStandardMaterial({ color: 0x6b5a45 })); g.position.set(x, 0.35, z0 - 1.0 + dz); scene.add(g); }
    for (let i = 0; i < 4; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.69), new THREE.MeshBasicMaterial({ map: fotoSegnaposto(i) }));
      m.rotation.y = Math.PI / 2; m.position.set(x + 0.035, 1.82 - Math.floor(i / 2) * 0.76, z0 - 0.45 - (i % 2) * 1.1); scene.add(m); this.cornici.push(m);
    }
  },
  async carica() { const v = await dbLeggi('foto'); if (Array.isArray(v) && v.length) this.mostra(v); return v || []; },
  async salva(files) {
    const urls = [];
    for (const f of [...files].slice(0, 12)) {
      try {
        const img = await new Promise((ok, ko) => { const r = new FileReader(); r.onload = () => { const im = new Image(); im.onload = () => ok(im); im.onerror = ko; im.src = r.result; }; r.onerror = ko; r.readAsDataURL(f); });
        const s = Math.min(1, 1024 / Math.max(img.width, img.height)); const c = document.createElement('canvas'); c.width = Math.round(img.width * s); c.height = Math.round(img.height * s);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); urls.push(c.toDataURL('image/jpeg', 0.85));
      } catch (e) { /* file non leggibile: si salta */ }
    }
    if (!urls.length) return 0;
    const salvato = await dbScrivi('foto', urls); this.mostra(urls); return salvato ? urls.length : -urls.length;
  },
  async togli() { await dbScrivi('foto', []); this.immagini = []; this.cornici.forEach((m, i) => { m.material.map = fotoSegnaposto(i); m.material.needsUpdate = true; }); },
  mostra(urls) {
    this.immagini = urls.map((u) => { const t = new THREE.TextureLoader().load(u); t.colorSpace = THREE.SRGBColorSpace; return t; });
    this.indice = 0; this.giro();
  },
  giro() {
    if (!this.immagini.length) return;
    this.cornici.forEach((m, i) => { m.material.map = this.immagini[(this.indice + i) % this.immagini.length]; m.material.needsUpdate = true; });
    if (this.immagini.length > 4) this.indice = (this.indice + 1) % this.immagini.length;
  },
};

/* ---------- Tavolo luminoso ---------- */
export const TAVOLO = { cx: -1.6, cz: -25.6, w: 1.4, d: 0.9, top: 0.63 };
const moltiplica = (c) => new THREE.MeshBasicMaterial({ color: c, transparent: true, blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.DstColorFactor, blendDst: THREE.ZeroFactor, depthWrite: false, toneMapped: false });
const riflesso = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.4, depthWrite: false });
const cartone = new THREE.MeshBasicMaterial({ color: 0x151a29 });
const COLORI_GEMME = [0x3d8bff, 0x39d07a, 0xff4d6d, 0xffb43d, 0xa66bff, 0x2fd6d6];
const COLORI_ACETATI = [0xff6b6b, 0x5aa9ff, 0xffe066, 0x7be08f, 0xc58cff];

export const MATERIALI_LUCE = [
  { tipo: 'albero', nome: 'Albero' }, { tipo: 'stella', nome: 'Stella' }, { tipo: 'luna', nome: 'Luna' }, { tipo: 'casa', nome: 'Casa' },
  { tipo: 'spirale', nome: 'Spirale' }, { tipo: 'gemma', nome: 'Gemma' }, { tipo: 'cristallo', nome: 'Cristallo' },
  { tipo: 'acetato', nome: 'Acetato' }, { tipo: 'pietra', nome: 'Pietra luminosa' },
];

function creaPezzo(tipo, variante) {
  const g = new THREE.Group(); const add = (shapes, m, y = 0) => { const me = new THREE.Mesh(new THREE.ShapeGeometry(shapes, 16), m); me.position.z = y; me.layers.enable(1); g.add(me); return me; };
  switch (tipo) {
    case 'albero': add(variante % 2 ? SAGOME.alberoTondo(0.26) : SAGOME.abete(0.3), cartone); break;
    case 'stella': add(SAGOME.contornoStella(0.11), cartone); break;
    case 'luna': add(SAGOME.luna(0.1), cartone); break;
    case 'casa': add(SAGOME.casa(0.17, 0.19), cartone); break;
    case 'spirale': add(SAGOME.spirale(0.1), cartone); break;
    case 'gemma': { const c = COLORI_GEMME[variante % COLORI_GEMME.length]; add(SAGOME.gemma(0.045), moltiplica(c)); const r = add(SAGOME.gemma(0.022), riflesso, 0.0004); r.position.x = -0.008; break; }
    case 'cristallo': { add(SAGOME.cristallo(0.13), moltiplica(variante % 2 ? 0xbfefff : 0xe8d0ff)); add(SAGOME.cristallo(0.06), riflesso, 0.0004).position.y = 0.02; break; }
    case 'acetato': add(SAGOME.lucido(0.2, 0.15), moltiplica(COLORI_ACETATI[variante % COLORI_ACETATI.length])); break;
    case 'pietra': {
      const c = [0xfff1a8, 0xa8f0ff, 0xffb0e0][variante % 3]; add(SAGOME.pietra(0.04, variante + 1), new THREE.MeshBasicMaterial({ color: c, toneMapped: false }));
      const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: alone, color: c, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); s.scale.setScalar(0.22); s.position.z = 0.01; s.layers.enable(1); g.add(s); break;
    }
    default: break;
  }
  return g;
}

export const luce = {
  pezzi: [], gruppo: new THREE.Group(), anello: null, selezionato: null, piano: new THREE.Plane(new THREE.Vector3(0, 1, 0), -TAVOLO.top),
  costruisci(scene) {
    const T = TAVOLO; scene.add(this.gruppo);
    const legno = new THREE.MeshStandardMaterial({ color: 0xe8d7bd, roughness: 0.7 });
    for (const [x, z] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.31, 0.05), legno); g.position.set(T.cx + x * (T.w / 2 - 0.05), 0.155, T.cz + z * (T.d / 2 - 0.05)); scene.add(g); }
    const base = new THREE.Mesh(new THREE.BoxGeometry(T.w, 0.02, T.d), legno); base.position.set(T.cx, 0.31, T.cz); scene.add(base);
    // carta argentata stropicciata sul fondo
    const geo = new THREE.PlaneGeometry(T.w - 0.06, T.d - 0.06, 40, 26); const p = geo.attributes.position; const r = caso(9);
    for (let i = 0; i < p.count; i++) p.setZ(i, r() * 0.012); geo.computeVertexNormals();
    const argento = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xd9dee8, metalness: 0.9, roughness: 0.35, emissive: 0x8c95a8, emissiveIntensity: 0.6 })); argento.rotation.x = -Math.PI / 2; argento.position.set(T.cx, 0.325, T.cz); scene.add(argento);
    // LED dentro la scatola
    const led = []; for (let i = 0; i < 26; i++) led.push(V(T.cx - T.w / 2 + 0.08 + (i % 13) * 0.104, 0.36, T.cz + (i < 13 ? -0.3 : 0.3)));
    scene.add(lucine(led, [0xffffff, 0xe6f0ff], 0.05));
    // pareti trasparenti
    const vetro = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.1, emissive: 0xdde6ff, emissiveIntensity: 0.4, depthWrite: false });
    const box = new THREE.Mesh(new THREE.BoxGeometry(T.w, T.top - 0.32, T.d), vetro); box.position.set(T.cx, (T.top + 0.32) / 2, T.cz); scene.add(box);
    // il piano luminoso
    const trPiano = trama(512, 330, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); const rr = caso(4); for (let i = 0; i < 1800; i++) { g.fillStyle = `rgba(200,210,230,${rr() * 0.12})`; g.fillRect(rr() * w, rr() * h, 2 + rr() * 8, 1 + rr() * 3); } });
    const piano = new THREE.Mesh(new THREE.PlaneGeometry(T.w, T.d), new THREE.MeshBasicMaterial({ map: trPiano, color: 0xfffbf0, toneMapped: false }));
    piano.rotation.x = -Math.PI / 2; piano.position.set(T.cx, T.top, T.cz); piano.layers.enable(1); scene.add(piano); this.pianoMesh = piano;
    const bordo = new THREE.Mesh(new THREE.BoxGeometry(T.w + 0.06, 0.03, T.d + 0.06), legno); bordo.position.set(T.cx, T.top - 0.016, T.cz); scene.add(bordo);
    const l = new THREE.PointLight(0xe6eeff, 3, 0, 1.6); l.position.set(T.cx, T.top + 0.4, T.cz); scene.add(l);
    ostacolo(T.cx, T.cz, T.w, T.d);
    // cesti dei materiali sul tavolino accanto
    const tav = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.5, 1.4), legno); tav.position.set(-3.9, 0.25, -25.6); scene.add(tav); ostacolo(-3.9, -25.6, 0.6, 1.4);
    MATERIALI_LUCE.forEach((m, i) => {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.09, 0.07, 16, 1, true), new THREE.MeshStandardMaterial({ color: 0xc9a06a, roughness: 1, side: THREE.DoubleSide })); const x = -3.9 + ((i % 2) - 0.5) * 0.26, z = -26.15 + Math.floor(i / 2) * 0.26; c.position.set(x, 0.535, z); scene.add(c);
      const pz = creaPezzo(m.tipo, i); pz.rotation.x = -Math.PI / 2; pz.scale.setScalar(0.6); pz.position.set(x, 0.56, z); scene.add(pz);
    });
    this.anello = new THREE.Mesh(new THREE.RingGeometry(0.13, 0.15, 40), new THREE.MeshBasicMaterial({ color: 0xf2c14e, toneMapped: false, transparent: true, depthWrite: false })); this.anello.rotation.x = -Math.PI / 2; this.anello.visible = false; scene.add(this.anello);
    // documentazione: le composizioni fotografate, sulla parete di destra
    this.pareteFoto = [];
    for (let i = 0; i < 6; i++) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.62), new THREE.MeshBasicMaterial({ map: this.cartellino(i) })); m.rotation.y = -Math.PI / 2; m.position.set(4.96, 1.9 - Math.floor(i / 3) * 0.95, -22.6 - (i % 3) * 1.15); scene.add(m); this.pareteFoto.push(m);
    }
    const sp = memoria.leggi('pezzi', null);
    (sp || [['luna', 1.0, -0.62, 0.3, 1.1], ['albero', 0, -0.25, 0.08, 1.2], ['albero', 1, 0.35, 0.1, 1], ['casa', 0, 0.0, 0.18, 1], ['stella', 0, -0.4, -0.25, 1], ['stella', 0, 0.42, -0.22, 0.8], ['gemma', 0, -0.4, -0.25, 1.2], ['gemma', 2, 0.42, -0.22, 1], ['acetato', 1, 0.15, -0.15, 1.4], ['spirale', 0, 0.05, -0.28, 1.2], ['pietra', 0, -0.62, 0.3, 1], ['cristallo', 1, 0.55, 0.25, 1]]).forEach((a) => this.aggiungi(a[0], a[1], a[2], a[3], a[4], false, a[5]));
  },
  cartellino(i) {
    return trama(512, 352, (g, w, h) => { g.fillStyle = '#f4f6fb'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c2c9db'; g.setLineDash([12, 10]); g.lineWidth = 4; g.strokeRect(16, 16, w - 32, h - 32); testoCentrato(g, i === 0 ? 'Qui compariranno le composizioni fotografate' : '…', w / 2, h / 2, 400, { font: 'Hanken Grotesk', peso: 500, max: 34, min: 20, colore: '#6a7393' }); });
  },
  aggiungi(tipo, variante, x, z, s = 1, salva = true, rot) {
    const T = TAVOLO; const g = creaPezzo(tipo, variante);
    const v = { tipo, variante, x, z, s, r: rot ?? (Math.random() - 0.5) * 0.8, g };
    g.rotation.order = 'XYZ'; this.gruppo.add(g); this.pezzi.push(v); this.posa(v);
    g.traverse((o) => { o.userData.pezzo = v; });
    if (salva) this.salva();
    return v;
  },
  posa(v) {
    const T = TAVOLO; v.x = THREE.MathUtils.clamp(v.x, -T.w / 2 + 0.05, T.w / 2 - 0.05); v.z = THREE.MathUtils.clamp(v.z, -T.d / 2 + 0.05, T.d / 2 - 0.05);
    const ordine = this.pezzi.indexOf(v); const opaco = ['albero', 'stella', 'luna', 'casa', 'spirale'].includes(v.tipo);
    v.g.position.set(T.cx + v.x, T.top + 0.0015 + ordine * 0.0004 + (opaco ? 0.01 : 0), T.cz + v.z);
    v.g.rotation.set(-Math.PI / 2, 0, v.r); v.g.scale.setScalar(v.s);
    if (this.selezionato === v) { this.anello.position.set(v.g.position.x, T.top + 0.03, v.g.position.z); this.anello.scale.setScalar(v.s); }
  },
  seleziona(v) { this.selezionato = v; this.anello.visible = !!v; if (v) this.posa(v); },
  togli(v) { this.gruppo.remove(v.g); this.pezzi.splice(this.pezzi.indexOf(v), 1); if (this.selezionato === v) this.seleziona(null); this.pezzi.forEach((p) => this.posa(p)); this.salva(); },
  svuota() { [...this.pezzi].forEach((p) => this.gruppo.remove(p.g)); this.pezzi = []; this.seleziona(null); this.salva(); },
  salva() { memoria.scrivi('pezzi', this.pezzi.map((p) => [p.tipo, p.variante, +p.x.toFixed(3), +p.z.toFixed(3), +p.s.toFixed(2), +p.r.toFixed(2)])); },
  puntoSulTavolo(raggio) {
    const p = new THREE.Vector3(); if (!raggio.ray.intersectPlane(this.piano, p)) return null;
    const x = p.x - TAVOLO.cx, z = p.z - TAVOLO.cz; if (Math.abs(x) > TAVOLO.w / 2 || Math.abs(z) > TAVOLO.d / 2) return null; return { x, z };
  },
  colpito(raggio) { const h = raggio.intersectObjects(this.gruppo.children, true)[0]; return h ? h.object.userData.pezzo : null; },
  // Foto della composizione vista dall'alto: si disegna sul canvas e si ritaglia il tavolo.
  fotografa(renderer, scene) {
    const T = TAVOLO; const canvas = renderer.domElement; const asp = canvas.width / canvas.height;
    const cam = new THREE.PerspectiveCamera(30, asp, 0.1, 10); const t = Math.tan(THREE.MathUtils.degToRad(15));
    const dist = Math.max((T.d / 2 + 0.03) / t, (T.w / 2 + 0.03) / (t * asp));
    cam.position.set(T.cx, T.top + dist, T.cz); cam.up.set(0, 0, -1); cam.lookAt(T.cx, T.top, T.cz); cam.layers.set(1);
    this.anello.visible = false; const sfondo = scene.background; scene.background = new THREE.Color(0x0b1024);
    renderer.render(scene, cam);
    const a = V(T.cx - T.w / 2, T.top, T.cz - T.d / 2).project(cam), b = V(T.cx + T.w / 2, T.top, T.cz + T.d / 2).project(cam);
    const x0 = (Math.min(a.x, b.x) + 1) / 2 * canvas.width, x1 = (Math.max(a.x, b.x) + 1) / 2 * canvas.width;
    const y0 = (1 - Math.max(a.y, b.y)) / 2 * canvas.height, y1 = (1 - Math.min(a.y, b.y)) / 2 * canvas.height;
    const out = document.createElement('canvas'); out.width = 900; out.height = Math.round(900 * (y1 - y0) / (x1 - x0));
    out.getContext('2d').drawImage(canvas, x0, y0, x1 - x0, y1 - y0, 0, 0, out.width, out.height);
    scene.background = sfondo; this.anello.visible = !!this.selezionato;
    return out;
  },
  appendiFoto(cieli) {
    this.pareteFoto.forEach((m, i) => {
      const c = cieli[i];
      if (!c) { m.material.map = this.cartellino(i); m.material.needsUpdate = true; return; }
      const img = new Image(); img.onload = () => {
        m.material.map = trama(512, 352, (g, w, h) => { g.fillStyle = '#f4f6fb'; g.fillRect(0, 0, w, h); g.drawImage(img, 16, 16, w - 32, h - 96); testoCentrato(g, c.titolo || 'Il mio cielo', w / 2, h - 42, 460, { max: 44, min: 22, maxRighe: 1 }); });
        m.material.needsUpdate = true;
      }; img.src = c.img;
    });
  },
};
