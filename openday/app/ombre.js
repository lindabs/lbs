// Tappa 4: l'Atelier delle ombre. Il telo bianco riceve le ombre vere delle sagome:
// ogni sagoma viene proiettata sul piano del telo a partire da ciascuna sorgente di luce.
import * as THREE from 'three';
import { V, trama, caso, SAGOME, persona } from './utili.js';
import { ostacolo } from './stanze.js';

export const TELO = { x0: -3.4, x1: 0.8, y0: 0.3, y1: 2.7, z: -38.3 };
const CX = (TELO.x0 + TELO.x1) / 2, CY = (TELO.y0 + TELO.y1) / 2;
const PIANO = new THREE.Vector4(0, 0, 1, -(TELO.z + 0.012));

export const SAGOME_OMBRE = [
  { tipo: 'stella', nome: 'Stella' }, { tipo: 'luna', nome: 'Luna' }, { tipo: 'abete', nome: 'Albero' }, { tipo: 'fiocco', nome: 'Fiocco di neve' },
  { tipo: 'pupazzo', nome: 'Pupazzo di neve' }, { tipo: 'campanella', nome: 'Campanella' }, { tipo: 'lucido', nome: 'Lucido colorato' }, { tipo: 'cornice', nome: 'Cornice dei bambini' },
];
export const MODI = [
  { id: 'lampada', nome: 'Lampada LED', testo: 'Ombre degli oggetti: avvicina una sagoma alla lampada e l\'ombra cresce.' },
  { id: 'torcia', nome: 'Torcia', testo: 'Trascina la torcia: l\'ombra si sposta, si allunga, si accorcia.' },
  { id: 'colori', nome: 'Ombre colorate', testo: 'Tre luci, rossa, verde e blu: ogni sagoma fa tre ombre di colori diversi.' },
  { id: 'proiettore', nome: 'Proiettore', testo: 'Un\'immagine invernale proiettata sul telo: le sagome entrano nella storia.' },
];

function matriceOmbra(L, P, out) {
  const d = P.x * L.x + P.y * L.y + P.z * L.z + P.w;
  return out.set(
    d - L.x * P.x, -L.x * P.y, -L.x * P.z, -L.x * P.w,
    -L.y * P.x, d - L.y * P.y, -L.y * P.z, -L.y * P.w,
    -L.z * P.x, -L.z * P.y, d - L.z * P.z, -L.z * P.w,
    -P.x, -P.y, -P.z, d - P.w);
}

const proiezione = trama(1024, 600, (g, w, h) => {
  const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#24407f'); gr.addColorStop(1, '#8fb3e8'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  const r = caso(8); for (let i = 0; i < 160; i++) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.arc(r() * w, r() * h * 0.8, 1 + r() * 3, 0, 7); g.fill(); }
  g.fillStyle = '#fff4c2'; g.beginPath(); g.arc(840, 110, 56, 0, 7); g.fill(); g.fillStyle = '#3d5f9e'; g.beginPath(); g.arc(864, 96, 50, 0, 7); g.fill();
  g.fillStyle = '#f4f8ff'; g.beginPath(); g.moveTo(0, h); g.bezierCurveTo(200, 380, 420, 520, 620, 430); g.bezierCurveTo(780, 360, 900, 450, w, 400); g.lineTo(w, h); g.fill();
  for (const [x, y, s] of [[180, 430, 1], [300, 470, 0.8], [700, 420, 1.1]]) { g.fillStyle = '#2f6b52'; g.beginPath(); g.moveTo(x, y - 150 * s); g.lineTo(x + 60 * s, y); g.lineTo(x - 60 * s, y); g.fill(); g.fillStyle = '#ffd34d'; g.beginPath(); g.arc(x, y - 152 * s, 9 * s, 0, 7); g.fill(); }
  for (const [x, c] of [[470, '#c9583e'], [560, '#e8a33d']]) { g.fillStyle = c; g.fillRect(x, 420, 70, 60); g.fillStyle = '#ffffff'; g.beginPath(); g.moveTo(x - 10, 422); g.lineTo(x + 35, 380); g.lineTo(x + 80, 422); g.fill(); g.fillStyle = '#ffe58a'; g.fillRect(x + 25, 440, 20, 20); }
});

export const ombre = {
  sorgenti: [], sagome: [], modo: 'lampada', selezionata: null, avatar: null, uM: [0, 1, 2].map(() => ({ value: new THREE.Matrix4() })),
  costruisci(scene) {
    this.scene = scene;
    const uni = { uPos: { value: [V(), V(), V()] }, uCol: { value: [V(), V(), V()] }, uAim: { value: [V(), V(), V()] }, uCos: { value: [0.9, 0.9, 0.9] }, uKind: { value: [0, 0, 0] }, uProj: { value: proiezione }, uRect: { value: new THREE.Vector4(CX - 1.7, CY - 1.0, CX + 1.7, CY + 1.0) } };
    this.uni = uni;
    const telo = new THREE.Mesh(new THREE.PlaneGeometry(TELO.x1 - TELO.x0, TELO.y1 - TELO.y0), new THREE.ShaderMaterial({
      uniforms: uni,
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: `varying vec3 vW; uniform vec3 uPos[3]; uniform vec3 uCol[3]; uniform vec3 uAim[3]; uniform float uCos[3]; uniform float uKind[3]; uniform sampler2D uProj; uniform vec4 uRect;
      void main(){ vec3 c = vec3(0.13,0.135,0.15);
        for(int i=0;i<3;i++){ vec3 L = uPos[i]-vW; float d = length(L); vec3 dir = -L/d;
          if (uKind[i] > 0.5) { vec2 uv = (vW.xy-uRect.xy)/(uRect.zw-uRect.xy); if (uv.x>0.0&&uv.x<1.0&&uv.y>0.0&&uv.y<1.0) c += texture2D(uProj, uv).rgb*uCol[i]; }
          else { float sp = smoothstep(uCos[i], uCos[i]+0.05, dot(dir,uAim[i])); c += uCol[i]*sp*(L.z/d)/(d*d); } }
        float trama = 0.97+0.03*sin(vW.x*900.0)*sin(vW.y*900.0);
        gl_FragColor = vec4(min(c*trama, vec3(1.0)), 1.0); }`,
    }));
    telo.position.set(CX, CY, TELO.z); scene.add(telo); this.telo = telo;
    const ferro = new THREE.MeshStandardMaterial({ color: 0x8e95a8, metalness: 0.6, roughness: 0.4 });
    const asta = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, TELO.x1 - TELO.x0 + 0.3, 8), ferro); asta.rotation.z = Math.PI / 2; asta.position.set(CX, TELO.y1 + 0.05, TELO.z); scene.add(asta);
    for (const x of [TELO.x0 - 0.15, TELO.x1 + 0.15]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, TELO.y1 + 0.1, 8), ferro); p.position.set(x, (TELO.y1 + 0.1) / 2, TELO.z); scene.add(p); }
    ostacolo(CX, TELO.z, TELO.x1 - TELO.x0 + 0.4, 0.3);
    // dispositivi: lampada su treppiede, torcia, tre lampade colorate, proiettore
    const nero = new THREE.MeshStandardMaterial({ color: 0x23252e, roughness: 0.5 });
    const dispositivo = (w, h, d, colore = 0xffffff) => {
      const g = new THREE.Group(); const corpo = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), nero); g.add(corpo);
      const faccia = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.8), new THREE.MeshBasicMaterial({ color: colore, toneMapped: false })); faccia.rotation.y = Math.PI; faccia.position.z = -d / 2 - 0.001; g.add(faccia); g.faccia = faccia;
      scene.add(g); return g;
    };
    const treppiede = (x, z, h) => { for (let k = 0; k < 3; k++) { const a = k * 2.1; const gamba = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, h * 1.05, 6), ferro); gamba.position.set(x + Math.cos(a) * 0.12, h / 2, z + Math.sin(a) * 0.12); gamba.rotation.set(Math.sin(a) * 0.22, 0, -Math.cos(a) * 0.22); scene.add(gamba); } };
    this.dLampada = dispositivo(0.26, 0.2, 0.14); this.dLampada.position.set(CX, 1.3, -34.0); treppiede(CX, -34.0, 1.2); ostacolo(CX, -34.0, 0.4, 0.4);
    this.dTorcia = new THREE.Group(); const corpoT = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.028, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xd9452b, roughness: 0.5 })); corpoT.rotation.x = Math.PI / 2; this.dTorcia.add(corpoT);
    const vetroT = new THREE.Mesh(new THREE.CircleGeometry(0.034, 16), new THREE.MeshBasicMaterial({ color: 0xfff4d6, toneMapped: false })); vetroT.position.z = -0.111; vetroT.rotation.y = Math.PI; this.dTorcia.add(vetroT); scene.add(this.dTorcia);
    this.dColori = [0xff3b3b, 0x3bff5a, 0x3b6bff].map((c) => dispositivo(0.14, 0.12, 0.12, c));
    this.dProiettore = dispositivo(0.34, 0.13, 0.28, 0xe8f0ff);
    const carr = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.95, 0.4), nero); carr.position.set(CX - 0.85, 0.475, -33.7); scene.add(carr); ostacolo(CX - 0.85, -33.7, 0.5, 0.4);
    const tavolino = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.55, 0.5), new THREE.MeshStandardMaterial({ color: 0xe8d7bd, roughness: 0.7 })); tavolino.position.set(-4.1, 0.275, -34.4); scene.add(tavolino); ostacolo(-4.1, -34.4, 0.9, 0.5);
    for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.025, 0.2, 10), new THREE.MeshStandardMaterial({ color: [0xd9452b, 0x2b62d9, 0xf2c14e][i] })); t.rotation.z = Math.PI / 2; t.position.set(-4.3 + i * 0.2, 0.58, -34.4); scene.add(t); }
    this.faro = new THREE.SpotLight(0xffffff, 0, 0, 0.6, 0.6, 1.5); scene.add(this.faro); scene.add(this.faro.target); this.faro.target.position.set(CX, CY, TELO.z);
    this.avatar = persona({ maglia: 0x8a8f9e, pantaloni: 0x3a3e4c, capelli: 0x3a2a1e }); this.avatar.g.position.set(CX + 0.2, 0, -35.4); this.avatar.g.rotation.y = Math.PI; this.avatar.g.visible = false; scene.add(this.avatar.g);
    const corpo = []; this.avatar.g.traverse((o) => { if (o.isMesh) corpo.push(o); }); corpo.forEach((o) => this.ombreDi(o, null));
    [['stella', CX - 0.7, 1.5, -36.6], ['abete', CX + 0.6, 1.25, -36.0], ['fiocco', CX + 0.1, 1.85, -37.2]].forEach(([t, x, y, z]) => this.aggiungi(t, x, y, z));
    this.impostaModo('lampada');
  },
  // Ombra di una parte: un figlio della mesh, con la stessa geometria, schiacciato sul telo.
  ombreDi(mesh, film) {
    mesh.userData.ombre = [0, 1, 2].map((i) => {
      const m = new THREE.ShaderMaterial({
        uniforms: { uM: this.uM[i], uC: { value: new THREE.Color() }, uR: { value: new THREE.Vector4(TELO.x0, TELO.y0, TELO.x1, TELO.y1) } },
        vertexShader: 'uniform mat4 uM; varying vec3 vW; void main(){ vec4 w = uM*(modelMatrix*vec4(position,1.0)); w/=w.w; vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
        fragmentShader: 'uniform vec3 uC; uniform vec4 uR; varying vec3 vW; void main(){ if(vW.x<uR.x||vW.x>uR.z||vW.y<uR.y||vW.y>uR.w) discard; gl_FragColor=vec4(uC,1.0); }',
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.ZeroFactor, blendDst: THREE.OneMinusSrcColorFactor,
        stencilWrite: true, stencilRef: i + 1, stencilFunc: THREE.NotEqualStencilFunc, stencilZPass: THREE.ReplaceStencilOp,
      });
      const o = new THREE.Mesh(mesh.geometry, m); o.frustumCulled = false; o.renderOrder = 50 + i; o.userData.film = film; o.raycast = () => {}; mesh.add(o); return o;
    });
  },
  aggiungi(tipo, x = CX + (Math.random() - 0.5) * 1.6, y = 1.2 + Math.random() * 0.8, z = -36.4) {
    const g = new THREE.Group(); const cart = new THREE.MeshStandardMaterial({ color: 0x1d1f2b, roughness: 0.8, side: THREE.DoubleSide });
    const parte = (shapes, film) => {
      const m = new THREE.Mesh(new THREE.ShapeGeometry(shapes, 18), film ? new THREE.MeshBasicMaterial({ color: film, transparent: true, opacity: 0.5, depthWrite: false, side: THREE.DoubleSide }) : cart);
      g.add(m); this.ombreDi(m, film ? new THREE.Color(film) : null); return m;
    };
    const k = this.sagome.length;
    switch (tipo) {
      case 'stella': parte(SAGOME.stella(0.16)); break;
      case 'luna': parte(SAGOME.luna(0.15)); break;
      case 'abete': parte(SAGOME.abete(0.4)).position.y = -0.2; break;
      case 'fiocco': parte(SAGOME.fiocco(0.16)); break;
      case 'pupazzo': parte(SAGOME.pupazzo(0.38)).position.y = -0.19; break;
      case 'campanella': parte(SAGOME.campanella(0.26)).position.y = -0.13; break;
      case 'lucido': parte(SAGOME.lucido(0.3, 0.22), [0xff5a5a, 0x4aa3ff, 0xffd84a, 0x5be07a][k % 4]); break;
      case 'cornice': { parte(SAGOME.cornice(0.36, 0.28)); parte(SAGOME.lucido(0.3, 0.22), 0x6fc3ff).position.z = -0.002; parte(SAGOME.stella(0.07)).position.set(-0.06, 0.02, 0.002); parte(SAGOME.luna(0.05)).position.set(0.09, 0.05, 0.002); break; }
      default: break;
    }
    const bacchetta = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.5, 0.012), new THREE.MeshStandardMaterial({ color: 0x8a6a3a })); bacchetta.position.y = -0.34; g.add(bacchetta); this.ombreDi(bacchetta, null);
    const v = { tipo, g }; g.position.set(x, y, z); g.traverse((o) => { o.userData.sagoma = v; });
    this.scene.add(g); this.sagome.push(v); this.limita(v); this.coloraOmbre(); return v;
  },
  limita(v) { const p = v.g.position; p.x = THREE.MathUtils.clamp(p.x, TELO.x0 + 0.1, TELO.x1 - 0.1); p.y = THREE.MathUtils.clamp(p.y, 0.6, 2.3); p.z = THREE.MathUtils.clamp(p.z, -37.9, -34.7); },
  togli(v) { this.scene.remove(v.g); this.sagome.splice(this.sagome.indexOf(v), 1); if (this.selezionata === v) this.selezionata = null; },
  colpita(raggio) { const h = raggio.intersectObjects(this.sagome.map((s) => s.g), true)[0]; return h ? h.object.userData.sagoma : null; },
  impostaModo(id) {
    this.modo = id; const S = [];
    const L = (pos, col, cos, kind = 0) => S.push({ pos, col: new THREE.Color(col), cos, kind });
    if (id === 'lampada') L(V(CX, 1.3, -34.07), 0xffffff, 0.86);
    if (id === 'torcia') L(this.posTorcia || V(CX + 0.4, 1.3, -35.3), 0xfff2d8, 0.9);
    if (id === 'colori') { L(V(CX - 0.55, 1.35, -34.2), 0xff0000, 0.84); L(V(CX, 1.35, -34.2), 0x00ff00, 0.84); L(V(CX + 0.55, 1.35, -34.2), 0x0000ff, 0.84); }
    if (id === 'proiettore') L(V(CX - 0.85, 1.03, -33.85), 0xffffff, 0, 1);
    this.sorgenti = S; this.posizionaDispositivi(); this.coloraOmbre();
  },
  muoviTorcia(p) { if (this.modo !== 'torcia') return; p.x = THREE.MathUtils.clamp(p.x, TELO.x0, TELO.x1); p.y = THREE.MathUtils.clamp(p.y, 0.5, 2.5); p.z = THREE.MathUtils.clamp(p.z, -37.0, -34.0); this.posTorcia = p.clone(); this.sorgenti[0].pos.copy(p); this.posizionaDispositivi(); },
  posizionaDispositivi() {
    const m = this.modo; const s0 = this.sorgenti[0];
    this.dLampada.faccia.material.color.set(m === 'lampada' ? 0xffffff : 0x444444);
    this.dTorcia.position.copy(m === 'torcia' ? s0.pos : V(-4.1, 0.6, -34.2)); this.dTorcia.lookAt(m === 'torcia' ? V(s0.pos.x, s0.pos.y, TELO.z) : V(-4.1, 0.6, -40)); this.dTorcia.rotateY(Math.PI);
    this.dColori.forEach((d, i) => { d.visible = m === 'colori'; if (d.visible) d.position.copy(this.sorgenti[i].pos); });
    this.dProiettore.position.set(CX - 0.85, 1.03, -33.85); this.dProiettore.faccia.material.color.set(m === 'proiettore' ? 0xe8f0ff : 0x444444);
    this.faro.color.copy(m === 'colori' ? new THREE.Color(0xffffff) : s0.col); this.faro.intensity = 6; this.faro.position.copy(s0.pos);
  },
  coloraOmbre() {
    const S = this.sorgenti; const u = this.uni.value || this.uni;
    for (let i = 0; i < 3; i++) {
      const s = S[i];
      if (s) { u.uPos.value[i].copy(s.pos); const fuoco = V(s.kind ? CX : s.pos.x * 0.3 + CX * 0.7, CY, TELO.z); u.uAim.value[i].copy(fuoco.sub(s.pos).normalize()); u.uCos.value[i] = s.cos; u.uKind.value[i] = s.kind; const k = s.kind ? 1 : (this.modo === 'torcia' ? 4.5 : 17); u.uCol.value[i].set(s.col.r * k, s.col.g * k, s.col.b * k); }
      else u.uCol.value[i].set(0, 0, 0);
    }
    const tutte = this.sagome.map((s) => s.g).concat(this.avatar ? [this.avatar.g] : []);
    for (const g of tutte) g.traverse((o) => {
      if (!o.userData.ombre) return;
      o.userData.ombre.forEach((om, i) => {
        const s = S[i]; om.visible = !!s; if (!s) return;
        const f = om.userData.film; const c = s.col.clone();
        if (f) om.material.uniforms.uC.value.setRGB(c.r * (1 - f.r * 0.85), c.g * (1 - f.g * 0.85), c.b * (1 - f.b * 0.85));
        else om.material.uniforms.uC.value.setRGB(c.r * 0.9, c.g * 0.9, c.b * 0.9);
      });
    });
  },
  entraNellaLuce(si) { this.avatar.g.visible = si; },
  aggiorna(t) {
    this.sorgenti.forEach((s, i) => matriceOmbra(s.pos, PIANO, this.uM[i].value));
    if (this.avatar.g.visible) { const a = this.avatar; a.braccia[0].rotation.z = -0.3 - (0.5 + 0.5 * Math.sin(t * 1.6)) * 2.2; a.braccia[1].rotation.z = 0.3 + (0.5 + 0.5 * Math.sin(t * 1.6 + 1.2)) * 2.2; }
  },
};
