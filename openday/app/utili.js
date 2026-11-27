// Attrezzi condivisi: memoria del browser, trame disegnate su canvas, sagome 2D, figure.
import * as THREE from 'three';

export const V = (x, y, z) => new THREE.Vector3(x, y, z);
export const tempo = { value: 0 };

/* ---------- Memoria (solo su questo dispositivo) ---------- */
export const memoria = {
  leggi(k, d) { try { const v = localStorage.getItem('cielo.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  scrivi(k, v) { try { localStorage.setItem('cielo.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
  togli(k) { try { localStorage.removeItem('cielo.' + k); } catch (e) { /* niente */ } },
};
function apriDB() {
  return new Promise((ok, ko) => {
    try {
      const r = indexedDB.open('cielo-di-tutti', 1);
      r.onupgradeneeded = () => r.result.createObjectStore('kv');
      r.onsuccess = () => ok(r.result); r.onerror = () => ko(r.error);
    } catch (e) { ko(e); }
  });
}
export async function dbLeggi(k) {
  try {
    const db = await apriDB();
    return await new Promise((ok, ko) => { const q = db.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => ok(q.result); q.onerror = () => ko(q.error); });
  } catch (e) { return undefined; }
}
export async function dbScrivi(k, v) {
  try {
    const db = await apriDB();
    await new Promise((ok, ko) => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = ok; t.onerror = () => ko(t.error); });
    return true;
  } catch (e) { return false; }
}

/* ---------- Trame su canvas ---------- */
export function trama(w, h, disegna, { srgb = true, ripeti = false } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); disegna(g, w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (ripeti) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = 4;
  return t;
}
export function caso(seme) { let s = seme >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

export const alone = trama(128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.2, 'rgba(255,255,255,.6)');
  gr.addColorStop(0.5, 'rgba(255,255,255,.15)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
}, { srgb: false });

export function a_capo(g, testo, larg) {
  const parole = String(testo).split(/\s+/); const righe = []; let r = '';
  for (const p of parole) { const prova = r ? r + ' ' + p : p; if (g.measureText(prova).width > larg && r) { righe.push(r); r = p; } else r = prova; }
  if (r) righe.push(r); return righe;
}
export function testoCentrato(g, testo, cx, cy, larg, { font = 'Caveat', peso = 600, max = 70, min = 26, colore = '#1b2a55', interl = 1.05, maxRighe = 4 } = {}) {
  let size = max, righe;
  for (; size >= min; size -= 2) {
    g.font = `${peso} ${size}px "${font}"`; righe = a_capo(g, testo, larg);
    if (righe.length <= maxRighe && righe.every((r) => g.measureText(r).width <= larg)) break;
  }
  g.fillStyle = colore; g.textAlign = 'center'; g.textBaseline = 'middle';
  const lh = size * interl; const y0 = cy - (righe.length - 1) * lh / 2;
  righe.forEach((r, i) => g.fillText(r, cx, y0 + i * lh));
}
export function pathStella(g, cx, cy, R, r, n = 5) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + i * Math.PI / n; const rr = i % 2 ? r : R; g.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  g.closePath();
}
// Cartoncino a forma di stella con una scritta (angolo lettura e costellazione).
export function tramaStella(testo, { carta = '#f7e7a1', inchiostro = '#22306a', bordo = null, esempio = false } = {}) {
  return trama(512, 512, (g) => {
    pathStella(g, 256, 270, 250, 118);
    g.fillStyle = carta; g.fill();
    if (bordo) { g.lineWidth = 10; g.strokeStyle = bordo; g.stroke(); }
    testoCentrato(g, testo, 256, 285, 236, { colore: inchiostro, max: 84, min: 30, maxRighe: 3 });
    if (esempio) { g.font = '500 22px "Hanken Grotesk"'; g.fillStyle = inchiostro; g.globalAlpha = 0.6; g.textAlign = 'center'; g.fillText('esempio', 256, 400); g.globalAlpha = 1; }
  });
}

/* ---------- Sagome 2D (metri) ---------- */
export function poligono(pts) { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; }
function percorsoDa(pts) { const p = new THREE.Path(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); p.closePath(); return p; }
export function puntiStella(R, r, n = 5) { const p = []; for (let i = 0; i < n * 2; i++) { const a = Math.PI / 2 + i * Math.PI / n; const rr = i % 2 ? r : R; p.push([Math.cos(a) * rr, Math.sin(a) * rr]); } return p; }
export function cerchio(cx, cy, r, n = 28) { const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return p; }
export function puntiLuna(R) {
  const d = 0.45 * R, r2 = 0.85 * R; const xi = (R * R - r2 * r2 + d * d) / (2 * d); const yi = Math.sqrt(R * R - xi * xi);
  const t1 = Math.atan2(yi, xi); const pts = [];
  for (let i = 0; i <= 24; i++) { const a = t1 + (2 * Math.PI - 2 * t1) * i / 24; pts.push([Math.cos(a) * R, Math.sin(a) * R]); }
  const p1 = Math.atan2(-yi, xi - d), p2 = Math.atan2(yi, xi - d) - 2 * Math.PI;
  for (let i = 1; i < 24; i++) { const a = p1 + (p2 - p1) * i / 24; pts.push([d + Math.cos(a) * r2, Math.sin(a) * r2]); }
  return pts;
}
function rett(cx, cy, w, h, a = 0) {
  const c = Math.cos(a), s = Math.sin(a);
  return [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([x, y]) => [cx + x * c - y * s, cy + x * s + y * c]);
}
export const SAGOME = {
  stella: (R = 0.12) => [poligono(puntiStella(R, R * 0.45))],
  contornoStella: (R = 0.12) => { const s = poligono(puntiStella(R, R * 0.45)); s.holes.push(percorsoDa(puntiStella(R * 0.72, R * 0.3))); return [s]; },
  luna: (R = 0.11) => [poligono(puntiLuna(R))],
  abete: (H = 0.3) => { const w = H * 0.72; return [poligono([[-0.05 * H, 0], [0.05 * H, 0], [0.05 * H, 0.12 * H], [w * 0.5, 0.12 * H], [w * 0.2, 0.42 * H], [w * 0.38, 0.42 * H], [w * 0.13, 0.7 * H], [w * 0.26, 0.7 * H], [0, H], [-w * 0.26, 0.7 * H], [-w * 0.13, 0.7 * H], [-w * 0.38, 0.42 * H], [-w * 0.2, 0.42 * H], [-w * 0.5, 0.12 * H], [-0.05 * H, 0.12 * H]])]; },
  alberoTondo: (H = 0.28) => [poligono(rett(0, H * 0.22, H * 0.1, H * 0.44)), poligono(cerchio(0, H * 0.66, H * 0.3))],
  casa: (W = 0.18, H = 0.2) => {
    const s = poligono([[-W / 2, 0], [W / 2, 0], [W / 2, H * 0.6], [0, H], [-W / 2, H * 0.6]]);
    s.holes.push(percorsoDa(rett(-W * 0.2, H * 0.36, W * 0.18, W * 0.18)), percorsoDa(rett(W * 0.2, H * 0.36, W * 0.18, W * 0.18)));
    return [s];
  },
  spirale: (R = 0.11, giri = 2.4, t = 0.008) => {
    const N = 110, out = [], inn = [];
    for (let i = 0; i <= N; i++) { const f = i / N; const a = f * giri * Math.PI * 2; const r = 0.12 * R + f * R * 0.88; out.push([Math.cos(a) * (r + t), Math.sin(a) * (r + t)]); inn.push([Math.cos(a) * (r - t), Math.sin(a) * (r - t)]); }
    return [poligono(out.concat(inn.reverse()))];
  },
  fiocco: (R = 0.13) => {
    const sh = []; const t = R * 0.13;
    for (let k = 0; k < 6; k++) {
      const a = k * Math.PI / 3; const ca = Math.cos(a), sa = Math.sin(a);
      sh.push(poligono(rett(ca * R / 2, sa * R / 2, R, t, a)));
      for (const s of [-1, 1]) { const b = a + s * Math.PI / 4; const px = ca * R * 0.58, py = sa * R * 0.58; sh.push(poligono(rett(px + Math.cos(b) * R * 0.15, py + Math.sin(b) * R * 0.15, R * 0.32, t * 0.9, b))); }
    }
    return sh;
  },
  pupazzo: (H = 0.3) => [poligono(cerchio(0, H * 0.2, H * 0.2)), poligono(cerchio(0, H * 0.52, H * 0.15)), poligono(cerchio(0, H * 0.76, H * 0.11)), poligono(rett(0, H * 0.9, H * 0.18, H * 0.12)), poligono(rett(0, H * 0.845, H * 0.28, H * 0.03))],
  campanella: (H = 0.22) => [poligono([[-0.5, 0], [0.5, 0], [0.38, 0.15], [0.32, 0.6], [0.18, 0.82], [0, 0.88], [-0.18, 0.82], [-0.32, 0.6], [-0.38, 0.15]].map(([x, y]) => [x * H * 0.9, y * H + H * 0.06])), poligono(cerchio(0, H * 0.02, H * 0.08, 14))],
  gemma: (R = 0.05) => [poligono(cerchio(0, 0, R, 6))],
  cristallo: (H = 0.12) => [poligono([[0, H / 2], [H * 0.2, H * 0.18], [H * 0.13, -H / 2], [-H * 0.13, -H / 2], [-H * 0.2, H * 0.18]])],
  pietra: (R = 0.045, seme = 1) => { const rnd = caso(seme * 977); const p = []; for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2; const r = R * (0.8 + rnd() * 0.3); p.push([Math.cos(a) * r, Math.sin(a) * r * 0.8]); } return [poligono(p)]; },
  lucido: (W = 0.2, H = 0.15) => [poligono(rett(0, 0, W, H))],
  cornice: (W = 0.34, H = 0.26, b = 0.03) => { const s = poligono(rett(0, 0, W, H)); s.holes.push(percorsoDa(rett(0, 0, W - 2 * b, H - 2 * b))); return [s]; },
};

/* ---------- Lucine LED (punti che brillano) ---------- */
const matLucine = new THREE.ShaderMaterial({
  uniforms: { uT: tempo, uMap: { value: alone }, uScala: { value: 400 } },
  vertexShader: `attribute float aFase; attribute float aDim; attribute vec3 aColore; uniform float uT; uniform float uScala; varying vec3 vC; varying float vA;
  void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); gl_Position = projectionMatrix*mv;
    float tw = 0.6+0.4*sin(uT*(1.4+aFase*1.6)+aFase*40.0); vA = tw; vC = aColore;
    gl_PointSize = max(2.0, aDim*uScala/-mv.z*(0.75+0.35*tw)); }`,
  fragmentShader: `uniform sampler2D uMap; varying vec3 vC; varying float vA; void main(){ float a = texture2D(uMap, gl_PointCoord).a; gl_FragColor = vec4(vC*(0.6+0.6*vA), a); }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
});
export const scalaLucine = matLucine.uniforms.uScala;
export function lucine(punti, colori = [0xffd58a], dim = 0.09) {
  const g = new THREE.BufferGeometry(); const n = punti.length;
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), fase = new Float32Array(n), d = new Float32Array(n);
  const c = new THREE.Color(); const rnd = caso(n * 31 + 7);
  punti.forEach((p, i) => { pos.set([p.x, p.y, p.z], i * 3); c.set(colori[i % colori.length]); col.set([c.r, c.g, c.b], i * 3); fase[i] = rnd(); d[i] = dim * (0.8 + rnd() * 0.4); });
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aColore', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aFase', new THREE.BufferAttribute(fase, 1)); g.setAttribute('aDim', new THREE.BufferAttribute(d, 1));
  const p = new THREE.Points(g, matLucine); p.frustumCulled = false; return p;
}
// Punti lungo un filo che scende tra due ancore (catenaria semplice).
export function filo(a, b, n, cala = 0.3) {
  const out = [];
  for (let i = 0; i < n; i++) { const t = (i + 0.5) / n; const p = a.clone().lerp(b, t); p.y -= cala * 4 * t * (1 - t); out.push(p); }
  return out;
}
export function lineaFilo(a, b, cala = 0.3, colore = 0x6f6a5a) {
  const pts = [a.clone()].concat(filo(a, b, 20, cala), [b.clone()]);
  return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: colore, transparent: true, opacity: 0.7 }));
}

/* ---------- Figure: insegnanti e bambini ---------- */
const mat = (c, extra = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...extra });
export function persona({ h = 1.65, maglia = 0x3d63c9, pantaloni = 0x2b2f45, pelle = 0xe7bd98, capelli = 0x3b2a1e, bambino = false, seduta = 0 } = {}) {
  const g = new THREE.Group();
  const legL = bambino ? h * 0.4 : h * 0.47, torsoL = bambino ? h * 0.3 : h * 0.31, headR = bambino ? h * 0.115 : h * 0.072;
  const anca = new THREE.Group(); anca.position.y = seduta || legL; g.add(anca);
  const gambe = [];
  for (const sx of [-1, 1]) {
    const coscia = new THREE.Group(); coscia.position.x = sx * h * 0.045;
    const m1 = new THREE.Mesh(new THREE.CapsuleGeometry(h * 0.036, legL / 2 - h * 0.04, 3, 8), mat(pantaloni)); m1.position.y = -legL / 4; coscia.add(m1);
    const ginocchio = new THREE.Group(); ginocchio.position.y = -legL / 2; coscia.add(ginocchio);
    const m2 = new THREE.Mesh(new THREE.CapsuleGeometry(h * 0.033, legL / 2 - h * 0.04, 3, 8), mat(pantaloni)); m2.position.y = -legL / 4; ginocchio.add(m2);
    if (seduta) { coscia.rotation.x = -Math.PI / 2; ginocchio.rotation.x = seduta > 0.3 ? Math.PI / 2 : 0.25; }
    anca.add(coscia); gambe.push(coscia);
  }
  const busto = new THREE.Mesh(new THREE.CylinderGeometry(h * (bambino ? 0.085 : 0.075), h * (bambino ? 0.1 : 0.095), torsoL, 14), mat(maglia)); busto.position.y = torsoL / 2; anca.add(busto);
  const braccia = [];
  for (const sx of [-1, 1]) {
    const spalla = new THREE.Group(); spalla.position.set(sx * h * (bambino ? 0.11 : 0.1), torsoL * 0.92, 0); spalla.rotation.z = sx * 0.12;
    const b = new THREE.Mesh(new THREE.CapsuleGeometry(h * 0.028, h * (bambino ? 0.2 : 0.26), 3, 8), mat(maglia)); b.position.y = -h * (bambino ? 0.12 : 0.15); spalla.add(b);
    const mano = new THREE.Mesh(new THREE.SphereGeometry(h * 0.032, 10, 8), mat(pelle)); mano.position.y = -h * (bambino ? 0.25 : 0.3); spalla.add(mano);
    anca.add(spalla); braccia.push(spalla);
  }
  const testa = new THREE.Group(); testa.position.y = torsoL + headR * 1.15; anca.add(testa);
  testa.add(new THREE.Mesh(new THREE.SphereGeometry(headR, 22, 16), mat(pelle)));
  const cap = new THREE.Mesh(new THREE.SphereGeometry(headR * 1.07, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(capelli)); cap.rotation.x = -0.35; testa.add(cap);
  for (const sx of [-1, 1]) { const o = new THREE.Mesh(new THREE.SphereGeometry(headR * 0.1, 8, 6), mat(0x1a1a22)); o.position.set(sx * headR * 0.36, headR * 0.08, headR * 0.92); testa.add(o); }
  return { g, braccia, gambe, testa, anca, altezza: (seduta || legL) + torsoL + headR * 2.3 };
}
