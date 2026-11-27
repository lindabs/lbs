// Le sei stanze della scuola: muri, pavimenti, luci e allestimenti fissi.
import * as THREE from 'three';
import { V, tempo, trama, caso, alone, lucine, filo, lineaFilo, persona, poligono, puntiStella, testoCentrato, pathStella } from './utili.js';
import { PAROLE_BAMBINI } from './dati.js';

export const ALTEZZA_OCCHI = 1.55;
// Stanze in fila lungo -z. "porta" è la x della porta sul muro di fondo.
export const STANZE = [
  { w: 10, d: 9, h: 3.4, porta: 0, muro: 0x0d1634, soffitto: 0x0a1130, pav: 'terrazzo' },
  { w: 11, d: 11, h: 3.6, porta: 0, muro: null, soffitto: null, pav: 'moquette' },
  { w: 10, d: 10, h: 3.2, porta: 3.4, muro: 0xdfe5f1, soffitto: 0xeef1f7, pav: 'linoleum' },
  { w: 10, d: 10, h: 3.2, porta: 3.4, muro: 0x262f4c, soffitto: 0x1f2640, pav: 'grigio' },
  { w: 9, d: 9, h: 3.0, porta: 0, muro: 0xe6c3a0, soffitto: 0xf0e0cc, pav: 'legno' },
  { w: 12, d: 10, h: 3.6, porta: null, muro: 0x1a2858, soffitto: 0x141f48, pav: 'legnoScuro' },
];
{ let z = 0; STANZE.forEach((s, i) => { s.i = i; s.z0 = z; s.z1 = z - s.d; s.zc = z - s.d / 2; z = s.z1; s.portaIn = i ? STANZE[i - 1].porta : null; }); }
export function stanzaDi(z) { for (const s of STANZE) if (z <= s.z0 && z > s.z1) return s.i; return z > 0 ? 0 : STANZE.length - 1; }

const ostacoli = [];
export function ostacolo(cx, cz, w, d) { ostacoli.push({ x0: cx - w / 2, x1: cx + w / 2, z0: cz - d / 2, z1: cz + d / 2 }); }
export function calpestabile(x, z) {
  for (const o of ostacoli) if (x > o.x0 - 0.25 && x < o.x1 + 0.25 && z > o.z0 - 0.25 && z < o.z1 + 0.25) return false;
  for (const s of STANZE) if (z <= s.z0 - 0.35 && z >= s.z1 + 0.35 && Math.abs(x) <= s.w / 2 - 0.35) return true;
  for (const s of STANZE) if (s.porta != null && Math.abs(z - s.z1) < 0.6 && Math.abs(x - s.porta) < 0.5) return true;
  return false;
}

// Punti di vista delle tappe e posti della guida.
function vista(p, t) { const dx = t.x - p.x, dz = t.z - p.z; return { pos: p, yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(t.y - p.y, Math.hypot(dx, dz)) }; }
export const VISTE = [
  vista(V(0, ALTEZZA_OCCHI, -1.5), V(0, 2.0, -9)),
  vista(V(0, 1.5, -11.2), V(0, 2.3, -20)),
  vista(V(0.7, ALTEZZA_OCCHI, -23.7), V(-1.6, 0.55, -25.6)),
  vista(V(1.4, ALTEZZA_OCCHI, -32.9), V(-1.3, 1.4, -38.3)),
  vista(V(1.7, 1.45, -41.8), V(-1.8, 0.8, -45.6)),
  vista(V(0, ALTEZZA_OCCHI, -52.6), V(0, 1.95, -59)),
];
export const POSTI_GUIDA = [V(1.1, 0, -3.6), V(1.0, 0, -13.8), V(1.0, 0, -25.3), V(2.9, 0, -35.7), V(2.5, 0, -44.3), V(-1.9, 0, -55.4)];

export const PUNTI = []; // punti informativi (stelline da toccare)
function punto(stanza, pos, titolo, testo, azione) { PUNTI.push({ stanza, pos, titolo, testo, azione }); }
export const PAVIMENTI = [];

/* ---------- Trame dei pavimenti ---------- */
function tramaPavimento(tipo) {
  const rnd = caso(tipo.length * 99);
  return trama(512, 512, (g, w, h) => {
    const base = { terrazzo: '#2a2f45', moquette: '#141a35', linoleum: '#c9d2df', grigio: '#4a5068', legno: '#a8774e', legnoScuro: '#5e432f' }[tipo];
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    if (tipo.startsWith('legno')) {
      for (let y = 0; y < h; y += 64) { g.fillStyle = `rgba(0,0,0,${0.08 + rnd() * 0.1})`; g.fillRect(0, y, w, 2); const off = rnd() * w; g.fillRect(off, y, 2, 64); for (let k = 0; k < 40; k++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,230,200' : '40,20,0'},.05)`; g.fillRect(rnd() * w, y + rnd() * 64, 60 + rnd() * 120, 1.5); } }
    } else {
      const n = tipo === 'terrazzo' ? 1600 : 3000;
      for (let i = 0; i < n; i++) { const c = tipo === 'terrazzo' ? ['#7a809a', '#c9b98d', '#1b1e2e', '#99a3c8'][i % 4] : (rnd() > 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.06)'); g.fillStyle = c; const s = tipo === 'terrazzo' ? 1 + rnd() * 3 : 1 + rnd() * 2; g.fillRect(rnd() * w, rnd() * h, s, s); }
      if (tipo === 'linoleum' || tipo === 'grigio') { g.strokeStyle = 'rgba(0,0,0,.08)'; g.lineWidth = 2; g.strokeRect(0, 0, w, h); }
    }
  }, { ripeti: true });
}

/* ---------- Cielo animato dell'aula immersiva (ispirato alla Notte Stellata) ---------- */
export function materialeCielo(centro) {
  return new THREE.ShaderMaterial({
    uniforms: { uT: tempo, uC: { value: centro }, uLuce: { value: 1 } },
    vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix*viewMatrix*w; }',
    fragmentShader: `
    varying vec3 vW; uniform float uT; uniform vec3 uC; uniform float uLuce;
    float h1(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
    float rum(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.0-2.0*f); return mix(mix(h1(i),h1(i+vec2(1,0)),u.x), mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),u.x), u.y); }
    float fbm(vec2 p){ float v=0.0, a=0.5; for(int i=0;i<4;i++){ v+=a*rum(p); p=p*2.03+vec2(1.7,9.2); a*=0.5; } return v; }
    vec3 stella(vec2 p, vec2 c, float s, float k){ float r = length(p-c); float nucleo = smoothstep(0.07*s, 0.0, r);
      float anelli = (0.5+0.5*sin(r*55.0/s - uT*1.4 + k))*exp(-r*5.0/s);
      return vec3(1.0,0.93,0.55)*nucleo*1.4 + mix(vec3(0.95,0.85,0.35), vec3(0.6,0.85,0.9), smoothstep(0.05,0.3,r/s))*anelli*0.75; }
    void main(){
      vec3 d = normalize(vW - uC);
      float th = atan(d.x, -d.z); float ph = asin(clamp(d.y,-1.0,1.0));
      vec2 p = vec2(th*2.2, ph*2.6);
      vec2 q = vec2(d.x + 0.6*d.y, d.z - 0.8*d.y)*3.0;
      float psi = 0.9*p.y;
      vec2 c1 = vec2(-0.5,1.25); vec2 c2 = vec2(0.55,1.0); vec2 c3 = vec2(-2.6,1.3); vec2 c4 = vec2(2.5,1.15);
      psi += 1.15*exp(-dot(p-c1,p-c1)/0.32) - 0.85*exp(-dot(p-c2,p-c2)/0.22) + 0.7*exp(-dot(p-c3,p-c3)/0.4) - 0.6*exp(-dot(p-c4,p-c4)/0.35);
      psi += 0.28*fbm(q*1.4 + vec2(uT*0.025, 0.0));
      float pennellata = sin(psi*22.0 + fbm(q*7.0)*4.0 - uT*0.55);
      float rottura = smoothstep(0.3,0.7,rum(q*vec2(30.0,30.0) + vec2(psi*9.0, -psi*6.0)));
      vec3 blu = mix(vec3(0.04,0.10,0.33), vec3(0.13,0.30,0.66), smoothstep(-0.4,1.6,p.y)*0.6 + 0.4*fbm(q*2.0));
      vec3 col = mix(blu, vec3(0.42,0.62,0.86), smoothstep(0.55,1.0,pennellata)*(0.55+0.45*rottura));
      col = mix(col, vec3(0.03,0.07,0.24), smoothstep(-0.6,-1.0,pennellata)*0.6);
      float vort = exp(-dot(p-c1,p-c1)/0.32) + exp(-dot(p-c2,p-c2)/0.22);
      col = mix(col, vec3(0.86,0.85,0.62), smoothstep(0.75,1.0,pennellata)*vort*0.7);
      col += stella(p, vec2(-1.95,0.95), 1.0, 0.0) + stella(p, vec2(-1.1,1.6), 0.8, 1.0) + stella(p, vec2(0.05,0.9), 0.9, 2.0)
           + stella(p, vec2(1.05,1.55), 0.7, 3.0) + stella(p, vec2(1.6,0.75), 0.9, 4.0) + stella(p, vec2(-3.3,0.7), 0.8, 5.0)
           + stella(p, vec2(3.4,0.95), 0.8, 6.0) + stella(p, vec2(-0.6,2.6), 0.7, 7.0) + stella(p, vec2(2.2,2.3), 0.6, 8.0) + stella(p, vec2(-2.4,2.2), 0.6, 9.0);
      vec2 m = vec2(2.6,1.55); float rm = length(p-m);
      float luna = step(rm,0.16)*step(0.13,length(p-m-vec2(0.07,0.04)));
      col += vec3(1.0,0.78,0.25)*luna*1.3 + vec3(0.95,0.75,0.3)*(0.5+0.5*sin(rm*40.0-uT))*exp(-rm*4.0)*0.8;
      float colline = -0.36 + 0.07*sin(p.x*1.3) + 0.04*sin(p.x*3.1+1.0);
      if (p.y < colline){ col = mix(vec3(0.05,0.1,0.25), vec3(0.12,0.2,0.4), 0.5+0.5*sin(p.y*60.0 + p.x*8.0 + fbm(q*5.0)*4.0)); }
      float cella = floor(p.x*3.2); float alt = -0.52 + 0.1*h1(vec2(cella,3.0));
      float fx = fract(p.x*3.2);
      if (p.y < alt + 0.07*(1.0-abs(fx-0.5)*2.0) && p.y < -0.38 && abs(fx-0.5)<0.42){
        col = mix(vec3(0.07,0.1,0.2), vec3(0.16,0.2,0.3), h1(vec2(cella,1.0)));
        vec2 fin = fract(p*vec2(16.0,14.0)); float acc = step(0.55, h1(floor(p*vec2(16.0,14.0))));
        col = mix(col, vec3(1.0,0.82,0.35), acc*step(0.3,fin.x)*step(fin.x,0.7)*step(0.3,fin.y)*step(fin.y,0.75));
      }
      if (abs(p.x-0.8)<0.03*(1.0-(p.y+0.7)/1.0) && p.y<0.25 && p.y>-0.55) col = vec3(0.07,0.1,0.2);
      float cx = -3.45 + 0.08*sin(p.y*5.0 + uT*0.4);
      float larg = 0.34*(1.0-smoothstep(-0.8,1.15,p.y)) + 0.01;
      if (abs(p.x-cx) < larg && p.y < 1.15){ float s = 0.5+0.5*sin((p.x-cx)*50.0 + p.y*18.0 + fbm(q*6.0)*5.0); col = mix(vec3(0.02,0.06,0.05), vec3(0.12,0.22,0.14), s); }
      col *= uLuce;
      gl_FragColor = vec4(col, 1.0);
    }`,
  });
}

/* ---------- Muri ---------- */
function geoMuro(larg, alt, px, pw = 1.8, ph = 2.3) {
  const pts = px == null
    ? [[-larg / 2, 0], [larg / 2, 0], [larg / 2, alt], [-larg / 2, alt]]
    : [[-larg / 2, 0], [px - pw / 2, 0], [px - pw / 2, ph], [px + pw / 2, ph], [px + pw / 2, 0], [larg / 2, 0], [larg / 2, alt], [-larg / 2, alt]];
  return new THREE.ShapeGeometry(poligono(pts));
}
function stipite(scene, x, z, pw = 1.8, ph = 2.3, colore = 0xf1f1ee) {
  const m = new THREE.MeshStandardMaterial({ color: colore, roughness: 0.6 });
  for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08, ph, 0.26), m); b.position.set(x + sx * (pw / 2 + 0.04), ph / 2, z); scene.add(b); }
  const l = new THREE.Mesh(new THREE.BoxGeometry(pw + 0.16, 0.08, 0.26), m); l.position.set(x, ph + 0.04, z); scene.add(l);
}

export function costruisciStanze(scene, cielo) {
  scene.add(new THREE.HemisphereLight(0x8094cc, 0x2a2012, 0.9));
  STANZE.forEach((s) => {
    const mm = s.muro == null ? cielo : new THREE.MeshStandardMaterial({ color: s.muro, roughness: 0.95 });
    const ms = s.soffitto == null ? cielo : new THREE.MeshStandardMaterial({ color: s.soffitto, roughness: 1 });
    const fondo = new THREE.Mesh(geoMuro(s.w, s.h, s.porta), mm); fondo.position.set(0, 0, s.z1); scene.add(fondo);
    const ing = new THREE.Mesh(geoMuro(s.w, s.h, s.i === 0 ? 0 : -s.portaIn, s.i === 0 ? 2.2 : 1.8, s.i === 0 ? 2.5 : 2.3), mm); ing.rotation.y = Math.PI; ing.position.set(0, 0, s.z0); scene.add(ing);
    const sx = new THREE.Mesh(geoMuro(s.d, s.h, null), mm); sx.rotation.y = Math.PI / 2; sx.position.set(-s.w / 2, 0, s.zc); scene.add(sx);
    const dx = new THREE.Mesh(geoMuro(s.d, s.h, null), mm); dx.rotation.y = -Math.PI / 2; dx.position.set(s.w / 2, 0, s.zc); scene.add(dx);
    const t = tramaPavimento(s.pav); t.repeat.set(s.w / 2.5, s.d / 2.5);
    const pav = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.d), new THREE.MeshStandardMaterial({ map: t, roughness: s.pav === 'linoleum' ? 0.55 : 0.9 }));
    pav.rotation.x = -Math.PI / 2; pav.position.set(0, 0, s.zc); pav.userData.pavimento = true; scene.add(pav); PAVIMENTI.push(pav);
    const sof = new THREE.Mesh(new THREE.PlaneGeometry(s.w, s.d), ms); sof.rotation.x = Math.PI / 2; sof.position.set(0, s.h, s.zc); scene.add(sof);
    if (s.porta != null) stipite(scene, s.porta, s.z1);
  });
  // Luci di stanza
  const luci = [[0xffd9a0, 10, 0, 3.0, -4.5], [0x6d8cff, 5, 0, 3.2, -14.5], [0xfff3e2, 22, 0.5, 2.9, -25], [0xb4c4ff, 3.5, 2.6, 2.8, -32], [0xffbe7a, 13, -1.4, 2.6, -45], [0xffe7c4, 16, 0, 3.2, -54.5]];
  for (const [c, i, x, y, z] of luci) { const l = new THREE.PointLight(c, i, 0, 1.6); l.position.set(x, y, z); scene.add(l); }
  ingresso(scene); aulaImmersiva(scene); angoloLetturaArredo(scene); costellazioneArredo(scene);
}

/* ---------- Tappa 1: l'ingresso ---------- */
function ingresso(scene) {
  const s = STANZE[0];
  // Porte a vetri verso il giardino di notte
  const fuori = trama(1024, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#0a1440'); gr.addColorStop(1, '#1d2f6b'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = caso(5); for (let i = 0; i < 220; i++) { g.fillStyle = `rgba(255,250,220,${0.3 + r() * 0.7})`; const z = r() * 2; g.fillRect(r() * w, r() * h * 0.7, z, z); }
    g.fillStyle = '#060b1e'; g.beginPath(); g.moveTo(0, h); for (let x = 0; x <= w; x += 32) g.lineTo(x, h * 0.78 - Math.sin(x * 0.01) * 30 - r() * 20); g.lineTo(w, h); g.fill();
  });
  const vetro = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.5), new THREE.MeshBasicMaterial({ map: fuori })); vetro.rotation.y = Math.PI; vetro.position.set(0, 1.25, 0.06); scene.add(vetro);
  const tel = new THREE.MeshStandardMaterial({ color: 0x9aa3b5, metalness: 0.5, roughness: 0.4 });
  for (const x of [-1.1, 0, 1.1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.05, 2.5, 0.06), tel); b.position.set(x, 1.25, 0.0); scene.add(b); }
  const tr = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.06, 0.06), tel); tr.position.set(0, 2.5, 0); scene.add(tr);
  // Teli blu e neri sulle pareti laterali
  const blu = new THREE.MeshStandardMaterial({ color: 0x1b3d8f, roughness: 1, side: THREE.DoubleSide });
  const nero = new THREE.MeshStandardMaterial({ color: 0x080a14, roughness: 1, side: THREE.DoubleSide });
  const geoTelo = new THREE.PlaneGeometry(1.25, 3.3, 30, 1); const pa = geoTelo.attributes.position;
  for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin((pa.getX(i) / 1.25 + 0.5) * Math.PI * 6) * 0.05);
  geoTelo.computeVertexNormals();
  for (const lato of [-1, 1]) for (let k = 0; k < 7; k++) {
    const m = new THREE.Mesh(geoTelo, (k + (lato > 0 ? 1 : 0)) % 2 ? blu : nero);
    m.rotation.y = lato < 0 ? Math.PI / 2 : -Math.PI / 2; m.position.set(lato * (s.w / 2 - 0.09), 1.7, -0.8 - k * 1.15); scene.add(m);
  }
  // Teli a festone sul soffitto
  for (const [z, mtl] of [[-2.4, blu], [-4.6, nero], [-6.8, blu]]) {
    const geo = new THREE.PlaneGeometry(10, 1.0, 60, 4); const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i); p.setZ(i, -0.45 * (1 - (x / 5) ** 2) + Math.sin(x * 4) * 0.04); }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, mtl); m.rotation.x = Math.PI / 2; m.position.set(0, s.h - 0.02, z); scene.add(m);
    scene.add(lucine(filo(V(-4.9, s.h - 0.05, z + 0.5), V(4.9, s.h - 0.05, z + 0.5), 46, 0.5), [0xffd58a, 0xfff1c9]));
  }
  scene.add(lucine(filo(V(-4.9, 2.6, -8.95), V(-1.0, 2.5, -8.95), 18, 0.1).concat(filo(V(1.0, 2.5, -8.95), V(4.9, 2.6, -8.95), 18, 0.1), filo(V(-0.9, 2.42, -8.95), V(0.9, 2.42, -8.95), 10, 0.02)), [0xbfd6ff, 0xffd58a], 0.08));
  // Stelle dorate appese
  const oro = new THREE.MeshStandardMaterial({ color: 0xe8b84a, metalness: 0.35, roughness: 0.35, emissive: 0x5a3a05, emissiveIntensity: 0.6 });
  const geoStella = new THREE.ExtrudeGeometry(poligono(puntiStella(0.16, 0.07)), { depth: 0.025, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.008, bevelSegments: 1 });
  const r = caso(11); const appese = [];
  for (let i = 0; i < 16; i++) {
    const x = (r() - 0.5) * 8.6, z = -0.9 - r() * 7.6, y = 2.25 + r() * 0.75;
    const m = new THREE.Mesh(geoStella, oro); m.position.set(x, y, z); m.scale.setScalar(0.7 + r() * 0.7); m.userData.fase = r() * 6; scene.add(m); appese.push(m);
    scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x, y + 0.12, z), V(x, s.h, z)]), new THREE.LineBasicMaterial({ color: 0x8a7a50 })));
  }
  scene.userData.stelleIngresso = appese;
  // Spirali alla Van Gogh accanto alla porta e appese
  const spirali = [];
  function spirale(x, y, z, R, col, giri = 3) {
    const pts = []; for (let i = 0; i <= 120; i++) { const f = i / 120; const a = f * giri * Math.PI * 2; const rr = R * (0.08 + 0.92 * f); pts.push(V(Math.cos(a) * rr, Math.sin(a) * rr, 0)); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 200, R * 0.05, 6), new THREE.MeshStandardMaterial({ color: col, emissive: col, emissiveIntensity: 0.35, roughness: 0.5 }));
    m.position.set(x, y, z); scene.add(m); spirali.push(m); return m;
  }
  spirale(-2.6, 1.5, -8.9, 0.75, 0xf2c94c); spirale(2.6, 1.5, -8.9, 0.75, 0x9cc7f2); spirale(-3.9, 2.6, -8.92, 0.35, 0x9cc7f2, 2.5); spirale(3.9, 2.6, -8.92, 0.35, 0xf2c94c, 2.5);
  for (const [x, z, c] of [[-2.2, -3.6, 0xf2c94c], [2.4, -5.6, 0x9cc7f2], [-1.2, -7.2, 0xffffff]]) { const m = spirale(x, 2.75, z, 0.28, c, 2.5); m.userData.gira = true; }
  scene.userData.spiraliIngresso = spirali;
  // Frase di benvenuto sopra la porta
  const frase = trama(2048, 300, (g, w, h) => {
    g.font = 'italic 400 104px "Instrument Serif"'; g.fillStyle = '#f2c94c'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(242,201,76,.6)'; g.shadowBlur = 24; g.fillText('Il cielo è di tutti e ogni stella', w / 2, 90); g.fillText('ha una storia da raccontare.', w / 2, 210);
  });
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 0.94), new THREE.MeshBasicMaterial({ map: frase, transparent: true, toneMapped: false })); fr.position.set(0, 2.88, -8.97); scene.add(fr);
  // Parole dei bambini stampate, appese a due fili
  const carta = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.9 });
  [[-3.0, 2.55], [-6.4, 2.5]].forEach(([z, y], fi) => {
    scene.add(lineaFilo(V(-4.6, y, z), V(4.6, y, z), 0.28, 0x8b8370));
    const parole = PAROLE_BAMBINI.slice(fi * 5, fi * 5 + 5);
    parole.forEach((p, i) => {
      const t = (i + 0.5) / parole.length; const x = -4.6 + 9.2 * t; const yy = y - 0.28 * 4 * t * (1 - t);
      const tx = trama(512, 320, (g, w, h) => { g.fillStyle = '#fbf8ef'; g.fillRect(0, 0, w, h); testoCentrato(g, p, w / 2, h / 2, 440, { colore: ['#1b3d8f', '#b7471f', '#1d6b54', '#5b2c8f'][i % 4], max: 92, maxRighe: 2 }); });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.39), new THREE.MeshStandardMaterial({ map: tx, roughness: 0.9, side: THREE.DoubleSide, emissive: 0xffffff, emissiveMap: tx, emissiveIntensity: 0.35 }));
      m.position.set(x, yy - 0.24, z); m.rotation.z = (i % 2 ? 1 : -1) * 0.05; m.userData.dondola = i; scene.add(m);
    });
  });
  // Tavolo dell'accoglienza con i percorsi
  const legno = new THREE.MeshStandardMaterial({ color: 0xcaa57a, roughness: 0.7 });
  const banco = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.85, 2.0), legno); banco.position.set(3.3, 0.425, -2.4); scene.add(banco); ostacolo(3.3, -2.4, 0.8, 2.0);
  const telo = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.6, 2.02), blu); telo.position.set(3.3, 0.55, -2.4); scene.add(telo);
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.PlaneGeometry(0.21, 0.3), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xf2c94c : 0xfbf8ef })); c.rotation.x = -Math.PI / 2; c.rotation.z = 0.1 * i; c.position.set(3.2, 0.852 + i * 0.002, -1.8 - i * 0.18); scene.add(c); }
  const cartello = trama(512, 200, (g, w, h) => { g.fillStyle = '#0d1634'; g.fillRect(0, 0, w, h); g.font = '600 64px "Hanken Grotesk"'; g.fillStyle = '#f2c94c'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('Accoglienza', w / 2, h / 2); });
  const ca = new THREE.Mesh(new THREE.PlaneGeometry(0.75, 0.29), new THREE.MeshBasicMaterial({ map: cartello })); ca.rotation.y = -Math.PI / 2; ca.position.set(2.88, 0.62, -2.4); scene.add(ca);
  punto(0, V(-4.8, 1.9, -4.5), 'Teli blu e neri', 'Teli blu e neri alternati rivestono pareti e soffitto: chi entra si trova subito dentro un cielo di notte. Si fissano con mollette a una corda tesa vicino al soffitto.');
  punto(0, V(1.6, 2.45, -4.2), 'Stelle dorate', 'Stelle dorate appese a fili trasparenti, ad altezze diverse, che girano piano con l\'aria.');
  punto(0, V(-2.6, 1.5, -8.7), 'Spirali ispirate a Van Gogh', 'Le spirali richiamano i vortici del cielo della Notte Stellata: gialle come le stelle, azzurre come il vento.');
  punto(0, V(-3.6, 3.0, -2.0), 'Luci LED', 'Fili di luci LED calde lungo i teli e intorno alla porta. Una luce bassa e morbida prepara all\'aula immersiva.');
  punto(0, V(0.6, 2.05, -3.0), 'Parole dei bambini stampate', 'Le parole dei bambini sul cielo, stampate e appese come un festone. Quelle che vedi sono esempi: al loro posto vanno le frasi raccolte in sezione.');
  punto(0, V(3.3, 1.2, -2.4), 'Gruppo Accoglienza', 'Le insegnanti dell\'accoglienza ricevono le famiglie e consegnano il percorso delle sei tappe.', 'pianta');
}

/* ---------- Tappa 2: l'aula immersiva ---------- */
function aulaImmersiva(scene) {
  const z = STANZE[1].zc;
  const carrello = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.5), new THREE.MeshStandardMaterial({ color: 0x30364a, roughness: 0.6 })); carrello.position.set(3.9, 0.4, -10.4); scene.add(carrello); ostacolo(3.9, -10.4, 0.6, 0.5);
  const proiettore = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.14, 0.3), new THREE.MeshStandardMaterial({ color: 0xe5e8ee, roughness: 0.4 })); proiettore.position.set(3.9, 0.88, -10.5); scene.add(proiettore);
  const lente = new THREE.Mesh(new THREE.CircleGeometry(0.045, 20), new THREE.MeshBasicMaterial({ color: 0xdfe8ff })); lente.position.set(3.9, 0.88, -10.66); lente.rotation.y = Math.PI; scene.add(lente);
  const da = V(3.9, 0.88, -10.66), a = V(0, 1.9, -19.9); const lung = da.distanceTo(a);
  const cono = new THREE.Mesh(new THREE.ConeGeometry(2.6, lung, 32, 1, true), new THREE.MeshBasicMaterial({ color: 0x9fb8ff, transparent: true, opacity: 0.045, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  cono.position.copy(da.clone().lerp(a, 0.5)); cono.lookAt(a); cono.rotateX(-Math.PI / 2); scene.add(cono);
  const cassa = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.34, 0.2), new THREE.MeshStandardMaterial({ color: 0x15161c, roughness: 0.5 })); cassa.position.set(4.9, 0.17, -11.2); scene.add(cassa);
  const cusc = [0x2b4fa3, 0xe0b23f, 0x1d6b8f, 0x3a2f7a, 0xd98f2b, 0x24407f, 0x4a79c9, 0xc9a23a];
  cusc.forEach((c, i) => { const lato = i < 4 ? -1 : 1; const k = i % 4; const m = new THREE.Mesh(new THREE.SphereGeometry(0.32, 20, 12), new THREE.MeshStandardMaterial({ color: c, roughness: 1 })); m.scale.set(1, 0.32, 1); m.position.set(lato * (1.3 + k * 0.85), 0.1, z - 0.6 - (k % 2) * 0.7); scene.add(m); });
  punto(1, V(3.9, 1.15, -10.5), 'Proiettore', 'Il proiettore anima le immagini della Notte Stellata su pareti e soffitto. Conviene oscurare le finestre e proiettare su teli o pareti chiare.');
  punto(1, V(0, 2.7, -19.6), 'Immagini animate della Notte Stellata', 'Le famiglie entrano nel cielo di Van Gogh: i vortici si muovono, le stelle pulsano. I bambini raccontano: "Questo è il cielo che abbiamo osservato."');
  punto(1, V(4.9, 0.6, -11.2), 'Musica di sottofondo', 'Una musica lenta e delicata accompagna la visita. Tocca per accendere o spegnere la musica.', 'musica');
}

/* ---------- Tappa 5: angolo lettura (arredo fisso) ---------- */
function angoloLetturaArredo(scene) {
  const s = STANZE[4]; const cx = -1.8, cz = -45.4;
  const tappeto = trama(512, 512, (g, w, h) => { const cols = ['#2b4fa3', '#f2c94c', '#2b4fa3', '#e7d7b6', '#24407f', '#f2c94c']; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(256, 256, 256 - i * 40, 0, Math.PI * 2); g.fillStyle = cols[i]; g.fill(); } pathStella(g, 256, 262, 50, 22); g.fillStyle = '#fbf8ef'; g.fill(); });
  const tp = new THREE.Mesh(new THREE.CircleGeometry(1.7, 48), new THREE.MeshStandardMaterial({ map: tappeto, roughness: 1 })); tp.rotation.x = -Math.PI / 2; tp.position.set(cx, 0.01, cz); scene.add(tp);
  const tp2 = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), new THREE.MeshStandardMaterial({ color: 0xc4673a, roughness: 1 })); tp2.rotation.x = -Math.PI / 2; tp2.position.set(1.6, 0.008, -46.6); scene.add(tp2);
  const col = [0xf2c94c, 0x2b4fa3, 0xd98f2b, 0x6a8fd6, 0xe7d7b6, 0x3a2f7a, 0xc4673a];
  for (let i = 0; i < 7; i++) { const a = -0.4 + i * 0.75; const m = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 12), new THREE.MeshStandardMaterial({ color: col[i], roughness: 1 })); m.scale.set(1, 0.38, 1); m.position.set(cx + Math.cos(a) * 1.35, 0.13, cz + Math.sin(a) * 1.35); scene.add(m); }
  for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.18, 0.6), new THREE.MeshStandardMaterial({ color: col[i + 3], roughness: 1 })); m.position.set(1.0 + i * 0.65, 0.09, -46.9); m.rotation.y = i * 0.3; scene.add(m); }
  // Libreria bassa
  const legno = new THREE.MeshStandardMaterial({ color: 0xd9b48a, roughness: 0.7 });
  const lib = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.9, 0.2), legno); lib.position.set(1.2, 0.45, -48.88); scene.add(lib); ostacolo(1.2, -48.8, 2.4, 0.35);
  const rnd = caso(3);
  for (let r = 0; r < 2; r++) for (let i = 0; i < 16; i++) { const h = 0.22 + rnd() * 0.12; const b = new THREE.Mesh(new THREE.BoxGeometry(0.05 + rnd() * 0.04, h, 0.24), new THREE.MeshStandardMaterial({ color: new THREE.Color().setHSL(rnd(), 0.5, 0.5), roughness: 0.8 })); b.position.set(0.1 + i * 0.14, 0.05 + r * 0.42 + h / 2 + 0.02, -48.66); b.rotation.z = (rnd() - 0.5) * 0.15; scene.add(b); }
  // Lucine a tenda sopra il tappeto
  const centro = V(cx, s.h - 0.05, cz); let pts = [];
  for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; pts = pts.concat(filo(centro, V(cx + Math.cos(a) * 2.6, 2.1, cz + Math.sin(a) * 2.6), 14, -0.15)); }
  scene.add(lucine(pts, [0xffcf86, 0xfff0c9], 0.07));
  scene.add(lucine(filo(V(-4.4, 2.6, -40.4), V(-4.4, 2.6, -48.6), 36, 0.35).concat(filo(V(-4.4, 2.7, -48.9), V(4.4, 2.7, -48.9), 36, 0.3)), [0xffcf86], 0.07));
  // Stelle sospese di carta
  const geo = new THREE.ExtrudeGeometry(poligono(puntiStella(0.13, 0.06)), { depth: 0.04, bevelEnabled: false });
  const carte = [0xfff2b3, 0xffffff, 0xf2c94c, 0xbfd3ff];
  const sosp = [];
  for (let i = 0; i < 12; i++) { const a = i * 2.4, r = 0.4 + (i % 4) * 0.45; const x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r, y = 1.85 + (i % 3) * 0.28; const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: carte[i % 4], roughness: 0.8, emissive: carte[i % 4], emissiveIntensity: 0.15 })); m.position.set(x, y, z); m.userData.fase = i; scene.add(m); sosp.push(m); scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(x, y + 0.1, z), V(x, s.h, z)]), new THREE.LineBasicMaterial({ color: 0x9a8a70 }))); }
  scene.userData.stelleSospese = sosp;
  punto(4, V(cx + 1.2, 0.5, cz + 0.6), 'Tappeti e cuscini', 'Un allestimento morbido: tappeti e cuscini a cerchio, così i piccoli gruppi ascoltano vicini.');
  punto(4, V(-4.3, 2.45, -44.2), 'Lucine', 'Lucine calde lungo le pareti e a raggiera sopra il tappeto, come una tenda di stelle.');
  punto(4, V(cx + 0.4, 2.2, cz - 0.5), 'Stelle sospese', 'Stelle di carta appese a diverse altezze sopra il tappeto.');
}

/* ---------- Tappa 6: arredo della sala finale ---------- */
function costellazioneArredo(scene) {
  const legno = new THREE.MeshStandardMaterial({ color: 0xcaa57a, roughness: 0.7 });
  const tav = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.06, 0.8), legno); tav.position.set(3.8, 0.72, -54.6); scene.add(tav); ostacolo(3.8, -54.6, 1.6, 0.8);
  for (const [x, z] of [[-0.7, -0.33], [0.7, -0.33], [-0.7, 0.33], [0.7, 0.33]]) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.7, 0.05), legno); g.position.set(3.8 + x, 0.35, -54.6 + z); scene.add(g); }
  const geo = new THREE.ShapeGeometry(poligono(puntiStella(0.09, 0.04)));
  for (let i = 0; i < 9; i++) { const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x0b0f1f, roughness: 0.8 })); m.rotation.x = -Math.PI / 2; m.rotation.z = i; m.position.set(3.3 + (i % 3) * 0.2, 0.752 + i * 0.001, -54.8 + Math.floor(i / 3) * 0.2); scene.add(m); }
  for (let i = 0; i < 6; i++) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8), new THREE.MeshStandardMaterial({ color: i % 2 ? 0xffffff : 0xd9a838, metalness: 0.4, roughness: 0.4 })); p.rotation.z = Math.PI / 2; p.position.set(4.25, 0.765, -54.85 + i * 0.07); scene.add(p); }
  const frase = trama(1600, 900, (g, w, h) => {
    g.fillStyle = 'rgba(0,0,0,0)'; g.fillRect(0, 0, w, h); g.textAlign = 'left'; g.textBaseline = 'top'; g.fillStyle = '#f2c94c';
    g.font = 'italic 400 92px "Instrument Serif"';
    ['Il cielo è di tutti,', 'ma ogni bambino lo guarda', 'con occhi diversi.'].forEach((r, i) => g.fillText(r, 40, 40 + i * 104));
    g.font = '400 54px "Instrument Serif"'; g.fillStyle = '#dfe6ff';
    ['Nella nostra scuola custodiamo ogni sguardo,', 'ogni domanda e ogni stella.'].forEach((r, i) => g.fillText(r, 40, 420 + i * 70));
  });
  const fr = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 2.0), new THREE.MeshBasicMaterial({ map: frase, transparent: true, toneMapped: false })); fr.rotation.y = Math.PI / 2; fr.position.set(-5.95, 1.9, -53.6); scene.add(fr);
  punto(5, V(3.8, 1.05, -54.6), 'Stelle di cartoncino e pennarelli', 'Ogni famiglia riceve una stella di cartoncino e scrive con i pennarelli bianchi e oro.', 'stella');
}

/* ---------- Persone: insegnanti e bambini ---------- */
export function costruisciPersone(scene) {
  const p = [];
  function metti(opts, x, z, guarda, gruppo, testo, stanza) {
    const f = persona(opts); f.g.position.set(x, 0, z); f.g.rotation.y = Math.atan2(guarda[0] - x, guarda[1] - z); scene.add(f.g);
    f.fase = Math.random() * 6; p.push(f);
    if (gruppo) punto(stanza, V(x, f.altezza + 0.25, z), gruppo, testo);
    return f;
  }
  metti({ maglia: 0xb5473a, capelli: 0x6b4423 }, 4.15, -2.4, [0, -2.4], 'Gruppo Accoglienza', 'Ricevono le famiglie e consegnano il percorso.', 0);
  const doc = metti({ maglia: 0x3c7d6a, capelli: 0x2a1d14, pelle: 0xc99a74 }, -3.8, -17.6, [0, -14], 'Gruppo Documentazione', 'Fotografano e raccolgono le frasi dei bambini durante tutta la visita.', 1);
  const cam = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.09, 0.07), new THREE.MeshStandardMaterial({ color: 0x15161c })); cam.position.set(0, doc.altezza - 0.18, 0.14); doc.g.add(cam);
  doc.braccia.forEach((b) => { b.rotation.x = -1.3; });
  metti({ h: 1.1, bambino: true, maglia: 0xe0b23f, pantaloni: 0x24407f }, -2.2, -15.6, [-1, -19], null, null, 1).braccia[1].rotation.x = -2.6;
  metti({ h: 1.08, bambino: true, maglia: 0x6a8fd6, capelli: 0x111111 }, 2.4, -15.9, [1, -19], null, null, 1);
  metti({ maglia: 0x6a4a9c, capelli: 0x8a5a2b }, -3.2, -24.7, [-1.6, -25.6], 'Gruppo Atelier della Luce', 'Sostengono bambini e famiglie mentre compongono il proprio paesaggio luminoso.', 2);
  metti({ h: 1.05, bambino: true, maglia: 0xd96a3b }, -2.6, -24.9, [-1.6, -25.6], null, null, 2).braccia[0].rotation.x = -0.9;
  metti({ maglia: 0x2f6fa8, capelli: 0x3a2a20 }, -4.1, -36.6, [-1.3, -37.5], 'Gruppo Atelier delle Ombre', 'Gestiscono il telo, la lampada, le torce e il proiettore.', 3);
  const lett = metti({ maglia: 0xc4673a, capelli: 0x2a1d14, seduta: 0.42 }, -3.15, -46.5, [-1.8, -45.4], 'Gruppo Angolo Lettura', 'Leggono l\'albo in piccoli gruppi e guidano la conversazione.', 4);
  const sedia = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.42, 0.45), new THREE.MeshStandardMaterial({ color: 0xd9b48a })); sedia.position.set(-3.15, 0.21, -46.5); scene.add(sedia); ostacolo(-3.15, -46.5, 0.5, 0.5);
  const libro = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.26, 0.02), new THREE.MeshStandardMaterial({ color: 0x1b3d8f })); libro.position.set(0, lett.altezza - 0.45, 0.32); libro.rotation.x = -0.5; lett.g.add(libro);
  lett.braccia.forEach((b) => { b.rotation.x = -1.0; });
  p.lettrice = lett;
  const kids = [[-1.6, -44.4, 0xe0b23f], [-0.9, -45.2, 0x6a8fd6], [-1.2, -46.3, 0x3c7d6a]];
  p.ascoltatori = kids.map(([x, z, c]) => metti({ h: 1.05, bambino: true, maglia: c, seduta: 0.16 }, x, z, [-3.15, -46.5], null, null, 4));
  metti({ maglia: 0x3c7d6a, capelli: 0x2a1d14, pelle: 0xc99a74 }, 4.5, -56.2, [0, -58], 'Gruppo Documentazione', 'Fotografa la costellazione collettiva e raccoglie i nomi e i desideri.', 5);
  metti({ h: 1.1, bambino: true, maglia: 0xd96a3b, pantaloni: 0x24407f }, 3.1, -55.6, [3.8, -54.6], null, null, 5);
  return p;
}

// La guida: una bambina di 5 anni con la stella-lanterna.
export function costruisciGuida(scene) {
  const f = persona({ h: 1.12, bambino: true, maglia: 0xf2c14e, pantaloni: 0x1d3f8f, capelli: 0x4a2c17 });
  const spilla = new THREE.Mesh(new THREE.ShapeGeometry(poligono(puntiStella(0.045, 0.02))), new THREE.MeshBasicMaterial({ color: 0x1d3f8f })); spilla.position.set(0, 0.24, 0.1); f.anca.add(spilla);
  const bast = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.42, 6), new THREE.MeshStandardMaterial({ color: 0x8a6a3a })); bast.position.set(0, -0.32, 0.12); bast.rotation.x = Math.PI / 2.4; f.braccia[1].add(bast);
  const lant = new THREE.Mesh(new THREE.ExtrudeGeometry(poligono(puntiStella(0.08, 0.035)), { depth: 0.02, bevelEnabled: false }), new THREE.MeshBasicMaterial({ color: 0xffd76a, toneMapped: false })); lant.position.set(0, -0.46, 0.32); f.braccia[1].add(lant);
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: alone, color: 0xffd76a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  sp.scale.setScalar(0.5); lant.add(sp); f.alone = sp;
  f.braccia[1].rotation.x = -0.7;
  scene.add(f.g); f.g.position.copy(POSTI_GUIDA[0]); f.g.rotation.y = 0.6;
  return f;
}
