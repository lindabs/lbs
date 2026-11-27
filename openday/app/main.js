// Il tour: scena, movimento, guida, punti informativi e azioni delle tappe.
import * as THREE from 'three';
import { V, tempo, memoria, scalaLucine } from './utili.js';
import { TAPPE } from './dati.js';
import { STANZE, VISTE, POSTI_GUIDA, PUNTI, PAVIMENTI, ALTEZZA_OCCHI, stanzaDi, calpestabile, materialeCielo, costruisciStanze, costruisciPersone, costruisciGuida } from './stanze.js';
import { foto, luce, TAVOLO } from './luce.js';
import { ombre } from './ombre.js';
import { lettura, costellazione } from './racconto.js';
import { suoni } from './suoni.js';
import { $, disegnaPercorso, aggiornaPercorso, disegnaScheda, disegnaPianta, disegnaProgetto, disegnaAlbum, avvisa, mostraInfo, attrezzi, STELLA_SVG } from './ui.js';

const ridotto = matchMedia('(prefers-reduced-motion: reduce)').matches;
const anteprima = /anteprima/.test(location.search);
const S = { tappa: 0, scheda: 'esperienza', audio: false, componi: false, materiale: 'stella', modo: 'lampada', corpo: false, lettura: false, penna: 'oro', tipoStella: 'nome', fotoCaricate: false, stellaDaAppendere: null };
const viste = memoria.leggi('viste', []);

/* ---------- Scena ---------- */
const canvas = $('#scena');
let renderer;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, stencil: true }); } catch (e) {
  $('#errore').hidden = false; $('#ingresso').hidden = true; $('#errore').insertAdjacentHTML('beforeend', '<button class="btn primo" id="soloTesto">Leggi la progettazione</button>');
  $('#soloTesto').onclick = () => { disegnaProgetto(); $('#dlgProgetto').showModal(); };
  throw e;
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
const scene = new THREE.Scene(); scene.background = new THREE.Color(0x050914);
const camera = new THREE.PerspectiveCamera(68, 1, 0.05, 120); camera.rotation.order = 'YXZ';
const raggio = new THREE.Raycaster();

await Promise.race([Promise.all(['600 40px "Caveat"', '400 40px "Instrument Serif"', 'italic 400 40px "Instrument Serif"', '600 40px "Hanken Grotesk"'].map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2500))]).catch(() => {});

const cielo = materialeCielo(V(0, ALTEZZA_OCCHI, STANZE[1].zc));
costruisciStanze(scene, cielo);
const persone = costruisciPersone(scene);
const guida = costruisciGuida(scene);
foto.costruisci(scene); luce.costruisci(scene); ombre.costruisci(scene); lettura.costruisci(scene); costellazione.costruisci(scene);
luce.appendiFoto(memoria.leggi('cieli', []));
foto.carica().then((v) => { S.fotoCaricate = v.length > 0; });
setInterval(() => foto.giro(), 5000);

function ridimensiona() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  scalaLucine.value = renderer.getDrawingBufferSize(new THREE.Vector2()).y / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
}
addEventListener('resize', ridimensiona); ridimensiona();

/* ---------- Giocatore e voli tra le tappe ---------- */
const io = { pos: VISTE[0].pos.clone(), yaw: VISTE[0].yaw, pitch: VISTE[0].pitch };
let volo = null, mira = null, stanzaAttuale = 0;
const angolo = (a, b, k) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * k; };
function percorso(a, b) {
  const ra = stanzaDi(a.z), rb = stanzaDi(b.z); const pts = []; const y = b.y;
  if (ra < rb) for (let i = ra; i < rb; i++) { const s = STANZE[i]; pts.push(V(s.porta, y, s.z1 + 0.8), V(s.porta, y, s.z1 - 0.8)); }
  if (ra > rb) for (let i = ra; i > rb; i--) { const s = STANZE[i]; pts.push(V(s.portaIn, y, s.z0 - 0.8), V(s.portaIn, y, s.z0 + 0.8)); }
  pts.push(b.clone()); return pts;
}
function vaiA(pos, yaw, pitch, dopo) {
  mira = null;
  if (ridotto) { io.pos.copy(pos); if (yaw != null) { io.yaw = yaw; io.pitch = pitch; } volo = null; dopo?.(); return; }
  volo = { punti: percorso(io.pos, pos), i: 0, yaw, pitch, dopo, v: 0, libero: false };
}
function guarda(p) { const dx = p.x - io.pos.x, dz = p.z - io.pos.z; mira = { yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(p.y - io.pos.y, Math.hypot(dx, dz)) }; }

function vaiTappa(i, { subito = false } = {}) {
  i = (i + 6) % 6; esciDaiModi(); S.tappa = i; S.scheda = 'esperienza'; disegna();
  const v = VISTE[i];
  if (subito) { io.pos.copy(v.pos); io.yaw = v.yaw; io.pitch = v.pitch; volo = null; arrivato(i); }
  else vaiA(v.pos, v.yaw, v.pitch, () => arrivato(i));
  guida.meta = percorso(guida.g.position.clone().setY(0), POSTI_GUIDA[i]).map((p) => p.setY(0)); guida.tappa = i;
  try { history.replaceState(null, '', '#tappa-' + (i + 1)); } catch (e) { /* niente */ }
}
function arrivato(i) {
  if (!viste.includes(i)) { viste.push(i); memoria.scrivi('viste', viste); }
  aggiornaPercorso(S.tappa, viste); parla(0);
  if (i === 1) suoni.volume(0.9); else suoni.volume(0.4);
}
function esciDaiModi() {
  if (S.componi) S.componi = false;
  luce.seleziona(null); ombre.selezionata = null; attrezzi(null); S.stellaDaAppendere = null; avvisa('');
  if (S.lettura) leggi(false);
}
function disegna() { disegnaScheda(S.tappa, S); aggiornaPercorso(S.tappa, viste); }

/* ---------- La guida parla ---------- */
let battuta = 0, fumettoFino = 0;
function parla(k) {
  const righe = TAPPE[S.tappa].guida; battuta = k == null ? (battuta + 1) % righe.length : k;
  const f = $('#fumetto'); f.innerHTML = `<small>La guida · 5 anni</small>${righe[battuta]}`; fumettoFino = performance.now() + 9000;
}
$('#fumetto').addEventListener('click', () => parla());

/* ---------- Punti informativi ---------- */
const strato = $('#punti');
PUNTI.forEach((p) => {
  const b = document.createElement('button'); b.className = 'punto'; b.innerHTML = STELLA_SVG + `<span>${p.titolo}</span>`; b.setAttribute('aria-label', p.titolo); b.hidden = true;
  b.addEventListener('click', () => mostraInfo(p, api)); strato.appendChild(b); p.el = b;
});
$('#chiudiInfo').onclick = () => { $('#info').hidden = true; };

/* ---------- Azioni ---------- */
const api = {
  vaiTappa,
  azzera() { ['cieli', 'frasi', 'stelle', 'viste', 'pezzi'].forEach((k) => memoria.togli(k)); viste.length = 0; luce.appendiFoto([]); lettura.ridisegna(); costellazione.rifai(); aggiornaPercorso(S.tappa, viste); avvisa('Fatto: il dispositivo è pronto per una nuova visita.'); },
  azione(a, arg) {
    switch (a) {
      case 'pianta': disegnaPianta(api, io.pos, stanzaDi(io.pos.z)); $('#dlgPianta').showModal(); break;
      case 'guardaFrase': guarda(V(0, 2.88, -8.97)); break;
      case 'musica': attivaAudio(!S.audio); break;
      case 'caricaFoto': $('#fileFoto').click(); break;
      case 'togliFoto': foto.togli().then(() => { S.fotoCaricate = false; disegna(); avvisa('Sul pannello sono tornate le foto d\'esempio.'); }); break;
      case 'parla': parla(); break;
      case 'componi': componi(!S.componi); break;
      case 'materiale': S.materiale = arg; disegna(); avvisa('Ora tocca il tavolo luminoso dove vuoi mettere: ' + arg + '.', 3000); break;
      case 'fotografa': fotografa(); break;
      case 'svuota': luce.svuota(); avvisa('Il tavolo è vuoto: comincia il tuo cielo.'); break;
      case 'ruota': if (luce.selezionato) { luce.selezionato.r += 0.4; luce.posa(luce.selezionato); luce.salva(); } if (ombre.selezionata) ombre.selezionata.g.rotation.z += 0.4; break;
      case 'grande': if (luce.selezionato) { luce.selezionato.s = Math.min(2.2, luce.selezionato.s * 1.2); luce.posa(luce.selezionato); luce.salva(); } break;
      case 'piccolo': if (luce.selezionato) { luce.selezionato.s = Math.max(0.5, luce.selezionato.s / 1.2); luce.posa(luce.selezionato); luce.salva(); } break;
      case 'togli': if (luce.selezionato) luce.togli(luce.selezionato); if (ombre.selezionata) ombre.togli(ombre.selezionata); attrezzi(null); break;
      case 'fatto': luce.seleziona(null); ombre.selezionata = null; attrezzi(null); break;
      case 'versoLuce': if (ombre.selezionata) { ombre.selezionata.g.position.z += 0.4; ombre.limita(ombre.selezionata); avvisa('Più vicina alla luce: l\'ombra cresce e si sfuma.', 2500); } break;
      case 'versoTelo': if (ombre.selezionata) { ombre.selezionata.g.position.z -= 0.4; ombre.limita(ombre.selezionata); avvisa('Più vicina al telo: l\'ombra si rimpicciolisce e diventa netta.', 2500); } break;
      case 'modo': S.modo = arg; ombre.impostaModo(arg); disegna(); break;
      case 'sagoma': { const v = ombre.aggiungi(arg); seleziona(v); break; }
      case 'corpo': S.corpo = !S.corpo; ombre.entraNellaLuce(S.corpo); ombre.coloraOmbre(); disegna(); if (S.corpo) avvisa('Questa è la tua ombra sul telo: alza le braccia!', 3500); break;
      case 'leggi': leggi(!S.lettura); break;
      case 'tipoStella': S.tipoStella = arg; disegna(); break;
      case 'penna': S.penna = arg; disegna(); break;
      case 'finale': $('#finale').showModal(); break;
      default: break;
    }
  },
};
function seleziona(v) {
  if (v && v.g && ombre.sagome.includes(v)) { ombre.selezionata = v; luce.seleziona(null); attrezzi([['versoLuce', 'Più vicino alla luce'], ['versoTelo', 'Più vicino al telo'], ['ruota', 'Ruota'], ['togli', 'Togli'], ['fatto', 'Fatto']], api); return; }
  ombre.selezionata = null; luce.seleziona(v);
  attrezzi(v ? [['ruota', 'Ruota'], ['grande', 'Più grande'], ['piccolo', 'Più piccolo'], ['togli', 'Togli'], ['fatto', 'Fatto']] : null, api);
}
function componi(si) {
  S.componi = si; disegna();
  if (si) { vaiA(V(TAVOLO.cx, 1.75, TAVOLO.cz + 0.62), 0, -1.12, () => avvisa('Scegli un materiale nella scheda e tocca il tavolo per posarlo.')); }
  else vaiA(VISTE[2].pos, VISTE[2].yaw, VISTE[2].pitch);
}
function fotografa() {
  const c = luce.fotografa(renderer, scene); const url = c.toDataURL('image/jpeg', 0.85);
  const p = document.createElement('canvas'); p.width = 480; p.height = Math.round(480 * c.height / c.width); p.getContext('2d').drawImage(c, 0, 0, p.width, p.height);
  fotografa.piccola = p.toDataURL('image/jpeg', 0.78); fotografa.grande = url;
  $('#fotoAnteprima').src = url; $('#titoloCielo').value = ''; $('#fotoNota').textContent = 'Dai un titolo al tuo cielo: la foto va nell\'album della documentazione e sulla parete dell\'atelier.';
  $('#dlgFoto').showModal(); suoni.scintilla();
}
$('#formFoto').addEventListener('submit', (e) => {
  e.preventDefault(); const titolo = $('#titoloCielo').value.trim() || 'Il mio cielo';
  const cieli = memoria.leggi('cieli', []); cieli.unshift({ titolo, img: fotografa.piccola, quando: Date.now() }); while (cieli.length > 12) cieli.pop();
  let ok = memoria.scrivi('cieli', cieli); while (!ok && cieli.length > 1) { cieli.pop(); ok = memoria.scrivi('cieli', cieli); }
  luce.appendiFoto(cieli); $('#dlgFoto').close(); avvisa(ok ? `"${titolo}" è nell'album e sulla parete dell'atelier.` : 'Questo dispositivo non lascia salvare: la foto si vede solo ora.');
});
function leggi(si) {
  S.lettura = si; disegna(); persone.lettrice.legge = si;
  if (si) { guarda(V(-3.0, 0.9, -46.6)); suoni.volume(0.2); avvisa('La maestra legge l\'albo al piccolo gruppo. Poi si parla insieme, con le domande nella scheda.', 5000); }
  else suoni.volume(0.4);
}
$('#fileFoto').addEventListener('change', async (e) => {
  if (!e.target.files.length) return; avvisa('Preparo le foto…', 0);
  const n = await foto.salva(e.target.files); e.target.value = '';
  if (n > 0) { S.fotoCaricate = true; avvisa(`${n} foto sul pannello dei laboratori.`); guarda(V(-5.1, 1.45, -12.6)); }
  else if (n < 0) { S.fotoCaricate = true; avvisa('Le foto si vedono ora, ma questo dispositivo non lascia salvarle.'); }
  else avvisa('Non sono riuscita a leggere quelle immagini: prova con foto JPG o PNG.');
  disegna();
});
document.addEventListener('submit', (e) => {
  const f = e.target.closest('[data-form]'); if (!f) return; e.preventDefault();
  if (f.dataset.form === 'frase') {
    const t = $('#campoFrase').value.trim(); if (!t) { avvisa('Scrivi prima che cosa c\'è nel tuo cielo.'); return; }
    const c = lettura.aggiungi(t.replace(/^(nel mio cielo c'è|…|\.\.\.)\s*/i, '')); suoni.scintilla(); $('#campoFrase').value = ''; guarda(c.position); avvisa('Il tuo cartoncino è sul filo.');
  }
  if (f.dataset.form === 'stella') {
    const t = $('#campoStella').value.trim(); if (!t) { avvisa(S.tipoStella === 'nome' ? 'Scrivi il nome del bambino.' : 'Scrivi un desiderio.'); return; }
    S.stellaDaAppendere = t; $('#campoStella').value = ''; guarda(V(0, 1.95, -58.9)); avvisa('Ora tocca il pannello nel punto in cui vuoi appendere la tua stella.', 0);
  }
});
function attivaAudio(si) {
  S.audio = si && suoni.accendi(); if (!si) suoni.spegni();
  if (S.audio) suoni.volume(stanzaDi(io.pos.z) === 1 ? 0.9 : 0.4);
  $('#audio').setAttribute('aria-pressed', S.audio); memoria.scrivi('audio', S.audio); disegna();
}

/* ---------- Comandi ---------- */
document.querySelectorAll('.schede button').forEach((b) => b.addEventListener('click', () => { S.scheda = b.dataset.scheda; disegna(); }));
$('#schedaCorpo').addEventListener('click', (e) => { const b = e.target.closest('[data-azione]'); if (b) api.azione(b.dataset.azione, b.dataset.arg); });
$('#avanti').onclick = () => vaiTappa(S.tappa + 1); $('#indietro').onclick = () => vaiTappa(S.tappa - 1);
$('#chiudiScheda').onclick = () => { const ch = $('#scheda').classList.toggle('chiusa'); $('#chiudiScheda').setAttribute('aria-expanded', !ch); $('#chiudiScheda').style.transform = ch ? 'rotate(180deg)' : ''; };
$('#apriPianta').onclick = () => api.azione('pianta');
$('#apriProgetto').onclick = () => { disegnaProgetto(); $('#dlgProgetto').showModal(); };
$('#apriAlbum').onclick = () => { disegnaAlbum(api); $('#dlgAlbum').showModal(); };
$('#audio').onclick = () => attivaAudio(!S.audio);
$('#finaleAlbum').onclick = () => { $('#finale').close(); disegnaAlbum(api); $('#dlgAlbum').showModal(); };
$('#finaleRestart').onclick = () => { $('#finale').close(); vaiTappa(0); };
document.querySelectorAll('[data-chiudi]').forEach((b) => b.addEventListener('click', () => b.closest('dialog').close()));
disegnaPercorso(api);

function entra(conAudio) {
  $('#ingresso').hidden = true; $('#hud').hidden = false; $('#fumetto').hidden = false;
  if (conAudio) attivaAudio(true);
  const m = /tappa-(\d)/.exec(location.hash); vaiTappa(m ? +m[1] - 1 : 0, { subito: true });
  if (!memoria.leggi('aiutoVisto', false)) { avvisa('Trascina per guardarti intorno · tocca il pavimento per camminare · tocca le stelline per i dettagli', 8000); memoria.scrivi('aiutoVisto', true); }
}
$('#entra').onclick = () => entra(true); $('#entraMuto').onclick = () => entra(false);
if (anteprima) { $('#ingresso').hidden = true; const m = /tappa-(\d)/.exec(location.hash); const i = m ? +m[1] - 1 : 0; io.pos.copy(VISTE[i].pos); io.yaw = VISTE[i].yaw; io.pitch = VISTE[i].pitch; S.tappa = i; guida.g.position.copy(POSTI_GUIDA[i]); if (/hud/.test(location.search)) entra(false); }

// Trascinare: guardarsi intorno, spostare pezzi e sagome, muovere la torcia.
let tocco = null;
const piano = new THREE.Plane();
function raggioDa(e) { const r = canvas.getBoundingClientRect(); raggio.setFromCamera(new THREE.Vector2((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), camera); return raggio; }
canvas.addEventListener('pointerdown', (e) => {
  canvas.setPointerCapture(e.pointerId); const r = raggioDa(e); const st = stanzaDi(io.pos.z);
  tocco = { x: e.clientX, y: e.clientY, t: performance.now(), mosso: false, modo: 'guarda' };
  if (st === 2) { const p = luce.colpito(r); if (p) { tocco.modo = 'pezzo'; tocco.pezzo = p; } }
  if (st === 3) {
    const s = ombre.colpita(r); if (s) { tocco.modo = 'sagoma'; tocco.sagoma = s; piano.set(V(0, 0, 1), -s.g.position.z); const h = r.ray.intersectPlane(piano, V()); tocco.off = h ? s.g.position.clone().sub(h) : V(); }
    else if (S.modo === 'torcia') { const d = r.ray.direction; if (Math.abs(r.ray.origin.z - ombre.sorgenti[0].pos.z) > 0.2) { tocco.modo = 'torcia'; } void d; }
  }
});
canvas.addEventListener('pointermove', (e) => {
  if (!tocco) return; const dx = e.clientX - tocco.x, dy = e.clientY - tocco.y;
  if (!tocco.mosso && Math.hypot(dx, dy) > 6) { tocco.mosso = true; canvas.classList.add('trascina'); }
  if (!tocco.mosso) return; const r = raggioDa(e);
  if (tocco.modo === 'guarda') { io.yaw += (e.clientX - (tocco.px ?? tocco.x)) * 0.0045; io.pitch = THREE.MathUtils.clamp(io.pitch + (e.clientY - (tocco.py ?? tocco.y)) * 0.0045, -1.35, 1.2); mira = null; if (volo) volo.libero = true; }
  if (tocco.modo === 'pezzo') { const p = luce.puntoSulTavolo(r); if (p) { tocco.pezzo.x = p.x; tocco.pezzo.z = p.z; luce.posa(tocco.pezzo); } }
  if (tocco.modo === 'sagoma') { const h = r.ray.intersectPlane(piano, V()); if (h) { tocco.sagoma.g.position.x = h.x + tocco.off.x; tocco.sagoma.g.position.y = h.y + tocco.off.y; ombre.limita(tocco.sagoma); } }
  if (tocco.modo === 'torcia') { piano.set(V(0, 0, 1), -ombre.sorgenti[0].pos.z); const h = r.ray.intersectPlane(piano, V()); if (h) ombre.muoviTorcia(h); }
  tocco.px = e.clientX; tocco.py = e.clientY;
});
canvas.addEventListener('pointerup', (e) => {
  if (!tocco) return; canvas.classList.remove('trascina'); const t = tocco; tocco = null;
  if (t.modo === 'pezzo' && t.mosso) { luce.salva(); return; }
  if (t.mosso) return;
  tocca(raggioDa(e));
});
canvas.addEventListener('pointercancel', () => { tocco = null; canvas.classList.remove('trascina'); });

function tocca(r) {
  const st = stanzaDi(io.pos.z);
  if (st === 5 && S.stellaDaAppendere) { const p = costellazione.puntoSulPannello(r); if (p) { costellazione.appendi(S.stellaDaAppendere, p.u, p.v, S.penna); S.stellaDaAppendere = null; suoni.scintilla(); avvisa('La tua stella è nella costellazione della scuola.'); if (!memoria.leggi('finaleVisto', false)) { memoria.scrivi('finaleVisto', true); setTimeout(() => $('#finale').showModal(), 1300); } return; } }
  if (st === 2) {
    const p = luce.colpito(r); if (p) { seleziona(p); return; }
    const q = luce.puntoSulTavolo(r); if (q) { if (luce.selezionato) { seleziona(null); return; } const v = luce.aggiungi(S.materiale, Math.floor(Math.random() * 6), q.x, q.z, 1); suoni.nota(81 + Math.floor(Math.random() * 6), 0.05); if (!S.componi) avvisa('Per comporre più comodo: "Siediti al tavolo luminoso" nella scheda.', 3500); void v; return; }
  }
  if (st === 3) { const s = ombre.colpita(r); if (s) { seleziona(s); return; } }
  if (ombre.selezionata || luce.selezionato) { seleziona(null); }
  // la guida
  const hg = r.intersectObject(guida.g, true)[0]; if (hg) { parla(); return; }
  // camminare
  const h = r.intersectObjects(PAVIMENTI, false)[0];
  if (h && h.distance < 30 && calpestabile(h.point.x, h.point.z)) {
    if (S.componi) { S.componi = false; disegna(); }
    const dest = V(h.point.x, ALTEZZA_OCCHI, h.point.z); vaiA(dest, null, null);
  }
}

const tasti = new Set();
addEventListener('keydown', (e) => {
  if (e.target.closest('input,textarea,dialog')) return;
  const k = e.key.toLowerCase();
  if (/^[1-6]$/.test(k)) { vaiTappa(+k - 1); return; }
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'q', 'e'].includes(k)) { tasti.add(k); volo = null; mira = null; e.preventDefault(); }
});
addEventListener('keyup', (e) => tasti.delete(e.key.toLowerCase()));
addEventListener('blur', () => tasti.clear());

/* ---------- Ciclo ---------- */
const orologio = new THREE.Clock();
const proj = new THREE.Vector3();
function aggiorna(dt, t) {
  tempo.value = t;
  if (tasti.size) {
    const f = (tasti.has('w') || tasti.has('arrowup') ? 1 : 0) - (tasti.has('s') || tasti.has('arrowdown') ? 1 : 0);
    const l = (tasti.has('d') ? 1 : 0) - (tasti.has('a') ? 1 : 0);
    io.yaw += ((tasti.has('arrowleft') || tasti.has('q') ? 1 : 0) - (tasti.has('arrowright') || tasti.has('e') ? 1 : 0)) * dt * 1.8;
    const sx = -Math.sin(io.yaw), sz = -Math.cos(io.yaw); const v = 2.2 * dt;
    const nx = io.pos.x + (sx * f - sz * l) * v, nz = io.pos.z + (sz * f + sx * l) * v;
    if (calpestabile(nx, nz)) { io.pos.x = nx; io.pos.z = nz; } else if (calpestabile(nx, io.pos.z)) io.pos.x = nx; else if (calpestabile(io.pos.x, nz)) io.pos.z = nz;
    io.pos.y += (ALTEZZA_OCCHI - io.pos.y) * Math.min(1, dt * 4);
  }
  if (volo) {
    const meta = volo.punti[volo.i]; const d = meta.clone().sub(io.pos); const dist = d.length(); const ultimo = volo.i === volo.punti.length - 1;
    volo.v = Math.min(2.6, volo.v + dt * 3.2); let vel = volo.v; if (ultimo) vel = Math.min(vel, Math.max(0.35, dist * 1.8));
    if (dist <= vel * dt) { io.pos.copy(meta); volo.i++; } else io.pos.addScaledVector(d, vel * dt / dist);
    if (!volo.libero) {
      const k = 1 - Math.exp(-dt * 3.5); const fine = ultimo && dist < 2.2 && volo.yaw != null;
      const oriz = Math.hypot(d.x, d.z);
      const ty = fine ? volo.yaw : (oriz > 0.05 ? Math.atan2(-d.x, -d.z) : io.yaw); const tp = fine ? volo.pitch : (volo.yaw == null ? io.pitch : 0);
      io.yaw = angolo(io.yaw, ty, k); io.pitch += (tp - io.pitch) * k;
    }
    if (volo.i >= volo.punti.length) { const v = volo; volo = null; if (v.yaw != null && !v.libero) mira = { yaw: v.yaw, pitch: v.pitch }; v.dopo?.(); }
  }
  if (mira) { const k = 1 - Math.exp(-dt * 4); io.yaw = angolo(io.yaw, mira.yaw, k); io.pitch += (mira.pitch - io.pitch) * k; if (Math.abs(mira.pitch - io.pitch) < 0.002 && Math.abs(angolo(io.yaw, mira.yaw, 1) - io.yaw) < 0.002) mira = null; }
  camera.position.copy(io.pos); camera.rotation.set(io.pitch, io.yaw, 0);

  const st = stanzaDi(io.pos.z);
  if (st !== stanzaAttuale) { stanzaAttuale = st; if (!volo && S.tappa !== st) { esciDaiModi(); S.tappa = st; S.scheda = 'esperienza'; disegna(); arrivato(st); guida.meta = percorso(guida.g.position.clone().setY(0), POSTI_GUIDA[st]).map((p) => p.setY(0)); } if (S.audio) suoni.volume(st === 1 ? 0.9 : 0.4); }

  // guida
  if (guida.meta && guida.meta.length) {
    const m = guida.meta[0]; const d = m.clone().sub(guida.g.position); d.y = 0; const dist = d.length(); const v = 2.9 * dt;
    if (dist < v) { guida.g.position.copy(m); guida.meta.shift(); } else { guida.g.position.addScaledVector(d, v / dist); guida.g.rotation.y = angolo(guida.g.rotation.y, Math.atan2(d.x, d.z), 0.2); }
    guida.gambe[0].rotation.x = Math.sin(t * 9) * 0.5; guida.gambe[1].rotation.x = -Math.sin(t * 9) * 0.5;
  } else {
    guida.gambe.forEach((g) => { g.rotation.x *= 0.8; });
    const dx = io.pos.x - guida.g.position.x, dz = io.pos.z - guida.g.position.z; guida.g.rotation.y = angolo(guida.g.rotation.y, Math.atan2(dx, dz), 0.06);
    const parlando = performance.now() < fumettoFino; guida.braccia[0].rotation.z = parlando ? -0.4 - (0.5 + 0.5 * Math.sin(t * 5)) * 0.8 : -0.12;
  }
  guida.anca.position.y = 0.448 + Math.abs(Math.sin(t * 2)) * 0.008; guida.alone.material.opacity = 0.6 + Math.sin(t * 3) * 0.25;
  for (const p of persone) { p.testa.rotation.y = Math.sin(t * 0.5 + p.fase) * 0.25; }
  if (persone.lettrice.legge) { persone.lettrice.testa.rotation.x = 0.25 + Math.sin(t * 0.7) * 0.05; persone.ascoltatori.forEach((k, i) => { k.testa.rotation.x = -0.15 + Math.sin(t + i) * 0.04; }); }

  // dettagli che si muovono
  (scene.userData.stelleIngresso || []).forEach((s) => { s.rotation.y = t * 0.4 + s.userData.fase; });
  (scene.userData.spiraliIngresso || []).forEach((s) => { s.rotation.z = -t * (s.userData.gira ? 0.5 : 0.12); });
  (scene.userData.stelleSospese || []).forEach((s) => { s.rotation.y = t * 0.3 + s.userData.fase; });
  if (Math.abs(st - 3) <= 1) ombre.aggiorna(t);
  if (st >= 4) { lettura.aggiorna(t); costellazione.aggiorna(performance.now()); }

  // punti informativi e fumetto sullo schermo
  const W = innerWidth, H = innerHeight;
  for (const p of PUNTI) {
    let vis = p.stanza === st && !S.componi && !anteprima;
    if (vis) { proj.copy(p.pos).project(camera); vis = proj.z < 1 && Math.abs(proj.x) < 1.05 && Math.abs(proj.y) < 1.05 && p.pos.distanceTo(io.pos) < 9; }
    if (p.el.hidden === vis) p.el.hidden = !vis;
    if (vis) p.el.style.transform = `translate(${((proj.x + 1) / 2 * W).toFixed(1)}px,${((1 - proj.y) / 2 * H).toFixed(1)}px)`;
  }
  const f = $('#fumetto'); let fv = !anteprima && !$('#hud').hidden && performance.now() < fumettoFino && stanzaDi(guida.g.position.z) === st && !S.componi;
  if (fv) { proj.copy(guida.g.position).setY(1.45).project(camera); fv = proj.z < 1 && Math.abs(proj.x) < 1 && proj.y < 1.1 && proj.y > -0.6; }
  f.style.opacity = fv ? 1 : 0; f.style.pointerEvents = fv ? 'auto' : 'none';
  if (fv) { const x = THREE.MathUtils.clamp((proj.x + 1) / 2 * W, 140, W - 140), y = THREE.MathUtils.clamp((1 - proj.y) / 2 * H, 120, H - 40); f.style.left = x + 'px'; f.style.top = y + 'px'; }
}
function ciclo() {
  const dt = Math.min(0.05, orologio.getDelta()); aggiorna(dt, orologio.elapsedTime);
  renderer.render(scene, camera); requestAnimationFrame(ciclo);
}
disegna();
ciclo();
window.__tour = { io, vaiTappa, S, api };
