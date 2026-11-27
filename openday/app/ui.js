// Interfaccia: la scheda della tappa, la pianta, la progettazione e la documentazione.
import { TAPPE, PROGETTO, FRASI_ESEMPIO } from './dati.js';
import { STANZE } from './stanze.js';
import { MATERIALI_LUCE } from './luce.js';
import { SAGOME_OMBRE, MODI } from './ombre.js';
import { memoria } from './utili.js';

export const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const lista = (v) => `<ul>${v.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
const btn = (azione, testo, { arg = '', primo = false, premuto = null, chip = false } = {}) => `<button class="btn${primo ? ' primo' : ''}${chip ? ' chip' : ''}" data-azione="${azione}" data-arg="${esc(arg)}"${premuto == null ? '' : ` aria-pressed="${premuto}"`}>${esc(testo)}</button>`;
export const STELLA_SVG = '<svg viewBox="0 0 24 24"><path d="M12 2.5l2.8 6.2 6.7.7-5 4.5 1.4 6.6L12 17.1l-5.9 3.4 1.4-6.6-5-4.5 6.7-.7z"/></svg>';

export function disegnaPercorso(api) {
  const nav = $('#percorso');
  nav.innerHTML = TAPPE.map((t, i) => `<button data-tappa="${i}" title="Tappa ${i + 1}: ${esc(t.nome)}" aria-label="Tappa ${i + 1}: ${esc(t.nome)}">${STELLA_SVG}<span>${i + 1}</span></button>`).join('');
  nav.addEventListener('click', (e) => { const b = e.target.closest('[data-tappa]'); if (b) api.vaiTappa(+b.dataset.tappa); });
}
export function aggiornaPercorso(i, viste) {
  document.querySelectorAll('#percorso button').forEach((b, k) => { b.classList.toggle('vista', viste.includes(k)); if (k === i) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current'); });
}

function esperienza(i, S) {
  const t = TAPPE[i]; let h = '';
  if (t.domanda) h += `<p class="domanda">${esc(t.domanda)}</p>`;
  h += `<p>${esc(t.esperienza)}</p>`;
  if (i === 0) h += `<p class="citazione">“${esc(t.frase)}”</p><div class="azioni">${btn('pianta', 'Ritira il percorso', { primo: true })}${btn('guardaFrase', 'Leggi la frase di benvenuto')}</div>`;
  if (i === 1) h += `<p class="citazione">“${esc(t.citazione)}”</p><div class="azioni">${btn('musica', S.audio ? 'Spegni la musica' : 'Accendi la musica', { premuto: S.audio })}${btn('caricaFoto', 'Carica le foto dei laboratori')}${S.fotoCaricate ? btn('togliFoto', 'Rimetti le foto d\'esempio') : ''}${btn('parla', 'Ascolta i bambini')}</div><p class="nota">Le foto restano solo su questo dispositivo e compaiono sul pannello vicino all'ingresso dell'aula.</p>`;
  if (i === 2) {
    h += `<div class="azioni">${btn('componi', S.componi ? 'Torna in piedi' : 'Siediti al tavolo luminoso', { primo: !S.componi, premuto: S.componi })}${btn('fotografa', 'Fotografa la composizione')}${btn('svuota', 'Svuota il tavolo')}</div>`;
    h += `<h3>Scegli un materiale, poi tocca il tavolo</h3><div class="azioni">${MATERIALI_LUCE.map((m) => btn('materiale', m.nome, { arg: m.tipo, chip: true, premuto: S.materiale === m.tipo })).join('')}</div>`;
    h += `<p class="nota">Tocca un pezzo sul tavolo per ruotarlo, ingrandirlo o toglierlo; trascinalo per spostarlo.</p>`;
  }
  if (i === 3) {
    h += `<h3>La luce</h3><div class="azioni">${MODI.map((m) => btn('modo', m.nome, { arg: m.id, chip: true, premuto: S.modo === m.id })).join('')}</div><p class="nota">${esc(MODI.find((m) => m.id === S.modo).testo)}</p>`;
    h += `<h3>Metti una sagoma davanti alla luce</h3><div class="azioni">${SAGOME_OMBRE.map((s) => btn('sagoma', s.nome, { arg: s.tipo, chip: true })).join('')}</div>`;
    h += `<div class="azioni">${btn('corpo', S.corpo ? 'Esci dalla luce' : 'Entra nella luce: l\'ombra del corpo', { premuto: S.corpo })}</div>`;
    h += `<p class="nota">Trascina le sagome per spostarle; toccane una per avvicinarla alla luce o al telo.</p><h3>Focus</h3><p>${esc(t.focus)}</p>`;
  }
  if (i === 4) {
    h += `<h3>Lettura</h3><p><b>${esc(t.lettura)}</b></p><div class="azioni">${btn('leggi', S.lettura ? 'Fine della lettura' : 'Ascolta la lettura', { primo: !S.lettura, premuto: S.lettura })}</div>`;
    if (S.lettura) h += `<h3>Per la conversazione</h3>${lista(t.domandeConversazione)}`;
    h += `<h3>Nel mio cielo c'è…</h3><form class="campo" data-form="frase"><input type="text" id="campoFrase" maxlength="60" placeholder="…una balena che vola" aria-label="Completa la frase: nel mio cielo c'è"><button class="btn primo" type="submit">Appendi la stella</button></form><p class="nota">Il cartoncino compare sul filo, sulla parete a sinistra.</p>`;
  }
  if (i === 5) {
    h += `<form class="campo" data-form="stella"><input type="text" id="campoStella" maxlength="40" placeholder="${S.tipoStella === 'desiderio' ? 'Un desiderio per l\'ingresso a scuola' : 'Il nome del bambino'}" aria-label="Che cosa scrivi sulla stella"><button class="btn primo" type="submit">Appendi la stella</button></form>`;
    h += `<div class="azioni">${btn('tipoStella', 'Il nome', { arg: 'nome', chip: true, premuto: S.tipoStella === 'nome' })}${btn('tipoStella', 'Un desiderio', { arg: 'desiderio', chip: true, premuto: S.tipoStella === 'desiderio' })}<span style="width:8px"></span>${btn('penna', 'Pennarello oro', { arg: 'oro', chip: true, premuto: S.penna === 'oro' })}${btn('penna', 'Pennarello bianco', { arg: 'bianco', chip: true, premuto: S.penna === 'bianco' })}</div>`;
    h += `<p class="nota">Dopo "Appendi", tocca il pannello nel punto in cui vuoi la tua stella.</p><div class="azioni">${btn('finale', 'La frase conclusiva')}</div>`;
  }
  return h;
}
function allestimento(i) {
  const t = TAPPE[i]; let h = `<h3>Spazio</h3><p>${esc(t.spazio)}</p>`;
  if (t.ispirazione) h += `<h3>Ispirazione</h3><p>${esc(t.ispirazione)}</p>`;
  h += `<h3>Allestimento</h3>${lista(t.allestimento)}`;
  if (t.materiali) h += `<h3>Materiali</h3>${lista(t.materiali)}`;
  if (t.documentazione) h += `<h3>Documentazione</h3>${lista(t.documentazione)}`;
  if (t.frase) h += `<h3>Frase di benvenuto</h3><p class="citazione">“${esc(t.frase)}”</p>`;
  return h + '<p class="nota">Le stelline nella scena mostrano dove si trova ogni elemento.</p>';
}
function persone(i) {
  const t = TAPPE[i];
  return `<h3>${esc(t.insegnanti.gruppo)}</h3>${lista(t.insegnanti.compiti)}<h3>I bambini di 5 anni</h3><p>${esc(t.bambini)}</p><p class="nota">Guide, narratori, facilitatori, costruttori di meraviglia: accompagnano i visitatori e mostrano gli atelier.</p>`;
}
export function disegnaScheda(i, S, scheda = S.scheda) {
  const t = TAPPE[i];
  $('#schedaNum').textContent = `Tappa ${i + 1} di 6 · ${t.spazio}`;
  $('#schedaTitolo').textContent = t.nome;
  $('#schedaSotto').textContent = t.sotto || (i === 0 ? 'Il cielo ci accoglie all\'ingresso' : '');
  document.querySelectorAll('.schede button').forEach((b) => b.setAttribute('aria-selected', b.dataset.scheda === scheda));
  const corpo = $('#schedaCorpo'); const scroll = corpo.scrollTop;
  corpo.innerHTML = scheda === 'allestimento' ? allestimento(i) : scheda === 'persone' ? persone(i) : esperienza(i, S);
  corpo.scrollTop = scroll;
  $('#indietro').disabled = i === 0; $('#avanti').textContent = i === 5 ? 'Ricomincia dall\'ingresso' : 'Tappa successiva →';
}

export function disegnaPianta(api, pos, attuale) {
  const larga = window.innerWidth > 700; const L = 59, W = 12;
  const P = (x, z) => (larga ? [1 - z, x + W / 2 + 1] : [x + W / 2 + 1, L + 1 + z]);
  const vb = larga ? [0, 0, L + 2, W + 8] : [0, 0, W + 2 + 18, L + 2];
  let s = `<svg viewBox="${vb.join(' ')}" role="img" aria-label="Pianta delle sei stanze del percorso" style="max-height:${larga ? 'none' : '70vh'}">`;
  STANZE.forEach((r, i) => {
    const [ax, ay] = P(-r.w / 2, r.z0), [bx, by] = P(r.w / 2, r.z1);
    const x = Math.min(ax, bx), y = Math.min(ay, by), w = Math.abs(bx - ax), h = Math.abs(by - ay);
    s += `<g data-tappa="${i}" style="cursor:pointer"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${i === attuale ? 'rgba(242,193,78,.22)' : 'rgba(61,99,201,.18)'}" stroke="#f2c14e" stroke-width="0.12"/>`;
    const [cx, cy] = P(0, r.zc);
    s += `<circle cx="${cx}" cy="${cy}" r="1.1" fill="#f2c14e"/><text x="${cx}" y="${cy + 0.45}" text-anchor="middle" font-size="1.3" font-weight="700" fill="#141005" font-family="Hanken Grotesk, sans-serif">${i + 1}</text>`;
    const nome = esc(TAPPE[i].nome);
    if (larga) s += `<text x="${cx}" y="${W + 3.4 + (i % 2) * 1.8}" text-anchor="middle" font-size="1.25" fill="#eef1fb" font-family="Hanken Grotesk, sans-serif">${nome}</text>`;
    else s += `<text x="${W + 3}" y="${cy + 0.45}" font-size="1.3" fill="#eef1fb" font-family="Hanken Grotesk, sans-serif">${nome}</text>`;
    s += '</g>';
    if (r.porta != null) { const [dx, dy] = P(r.porta, r.z1); s += `<rect x="${dx - (larga ? 0.25 : 0.9)}" y="${dy - (larga ? 0.9 : 0.25)}" width="${larga ? 0.5 : 1.8}" height="${larga ? 1.8 : 0.5}" fill="#0b1430"/>`; }
  });
  const [ex, ey] = P(0, 0); s += `<text x="${ex + (larga ? -0.2 : 0)}" y="${ey + (larga ? 0 : 1.2)}" font-size="1" fill="#a9b4d8" text-anchor="${larga ? 'end' : 'middle'}" font-family="Hanken Grotesk, sans-serif">entrata</text>`;
  const [px, py] = P(pos.x, pos.z); s += `<circle cx="${px}" cy="${py}" r="0.55" fill="#fbe9a8" stroke="#070d22" stroke-width="0.15"/><text x="${px}" y="${py - 0.9}" font-size="0.9" text-anchor="middle" fill="#fbe9a8" font-family="Hanken Grotesk, sans-serif">sei qui</text></svg>`;
  const m = $('#mappa'); m.innerHTML = s;
  m.onclick = (e) => { const g = e.target.closest('[data-tappa]'); if (g) { $('#dlgPianta').close(); api.vaiTappa(+g.dataset.tappa); } };
}

export function disegnaProgetto() {
  const P = PROGETTO; const fatti = memoria.leggi('spunte', {});
  let h = `<p class="motto" style="font:600 24px/1.1 var(--mano);color:var(--luna)">${esc(P.sottotitolo)}</p><h3>Premessa pedagogica</h3>${P.premessa.map((p) => `<p>${esc(p)}</p>`).join('')}`;
  h += `<h3>Obiettivi</h3><div class="griglia">${P.obiettivi.map((o) => `<div><b>${esc(o.per)}</b>${lista(o.voci)}</div>`).join('')}</div>`;
  h += `<h3>Organizzazione degli spazi</h3><p>Un percorso a tappe:</p><ol>${TAPPE.map((t) => `<li><b>${esc(t.nome)}</b> · ${esc(t.spazio)}</li>`).join('')}</ol>`;
  h += `<h3>Materiale occorrente</h3><p class="nota">Spunta ciò che è già pronto: la lista resta salvata su questo dispositivo.</p><div class="griglia">${P.materiale.map((g, gi) => `<div><b>${esc(g.per)}</b><ul class="spunta">${g.voci.map((v, vi) => { const k = gi + '.' + vi; return `<li><label><input type="checkbox" data-spunta="${k}"${fatti[k] ? ' checked' : ''}> ${esc(v)}</label></li>`; }).join('')}</ul></div>`).join('')}</div>`;
  h += `<h3>Ruoli delle insegnanti</h3><div class="ruoli">${P.ruoli.map((r) => `<div><b>${esc(r.gruppo)}</b><span>${esc(r.compiti)}</span></div>`).join('')}</div>`;
  h += `<h3>Ruolo dei bambini di 5 anni</h3><p>I bambini diventano ${P.bambini.map((b) => b.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' e $1')}. Accompagnano i visitatori e mostrano gli atelier.</p>`;
  h += `<h3>Documentazione finale</h3>${lista(P.documentazione)}<p class="chiusura">«${esc(P.conclusione)}»</p>`;
  const el = $('#progetto'); el.innerHTML = h;
  el.onchange = (e) => { const k = e.target.dataset.spunta; if (k == null) return; const f = memoria.leggi('spunte', {}); f[k] = e.target.checked; memoria.scrivi('spunte', f); };
}

export function disegnaAlbum(api, conferma = false) {
  const cieli = memoria.leggi('cieli', []), frasi = memoria.leggi('frasi', []), stelle = memoria.leggi('stelle', []);
  let h = `<p>Quello che si raccoglie durante la visita: le composizioni fotografate all'Atelier della luce, le frasi "Nel mio cielo c'è…" e le stelle della costellazione. Resta salvato solo su questo dispositivo.</p>`;
  h += `<h3>Pannello fotografico · i nostri cieli</h3>` + (cieli.length ? `<div class="album">${cieli.map((c) => `<figure><img src="${c.img}" alt="${esc(c.titolo)}"><figcaption>${esc(c.titolo)}</figcaption></figure>`).join('')}</div>` : '<p class="vuoto">Ancora nessuna foto: all\'Atelier della luce componi un cielo e fotografalo.</p>');
  h += `<h3>Le parole dei bambini · Nel mio cielo c'è…</h3><div class="parole">${FRASI_ESEMPIO.map((f) => `<span class="es" title="esempio">${esc(f)}</span>`).join('')}${frasi.map((f) => `<span>${esc(f)}</span>`).join('')}</div>`;
  h += `<h3>La costellazione della scuola</h3>` + (stelle.length ? `<div class="parole">${stelle.map((s) => `<span style="background:#0b0f1f;color:${s.penna === 'oro' ? '#f2c14e' : '#fff'};border:1px solid #d9a838">${esc(s.testo)}</span>`).join('')}</div>` : '<p class="vuoto">Nessuna stella ancora: appendila nella sala finale.</p>');
  h += `<h3>Ricominciare</h3>` + (conferma
    ? `<div class="conferma"><span>Togliere foto, frasi e stelle salvate su questo dispositivo?</span>${btn('azzeraSi', 'Sì, togli tutto', { primo: true })}${btn('azzeraNo', 'Annulla')}</div>`
    : `<div class="conferma">${btn('azzera', 'Togli quello che ho salvato')}</div>`);
  const el = $('#album'); el.innerHTML = h;
  el.onclick = (e) => { const b = e.target.closest('[data-azione]'); if (!b) return; const a = b.dataset.azione; if (a === 'azzera') disegnaAlbum(api, true); else if (a === 'azzeraNo') disegnaAlbum(api, false); else if (a === 'azzeraSi') { api.azzera(); disegnaAlbum(api, false); } };
}

let tAvviso = null;
export function avvisa(testo, ms = 4200) { const a = $('#avviso'); a.textContent = testo; a.hidden = !testo; clearTimeout(tAvviso); if (testo && ms) tAvviso = setTimeout(() => { a.hidden = true; }, ms); }
export function mostraInfo(p, api) {
  $('#infoTitolo').textContent = p.titolo; $('#infoTesto').textContent = p.testo;
  const az = { pianta: 'Ritira il percorso', musica: 'Accendi o spegni la musica', stella: 'Scrivi la tua stella' }[p.azione];
  $('#infoAzioni').innerHTML = az ? btn(p.azione, az, { primo: true }) : '';
  $('#infoAzioni').onclick = (e) => { const b = e.target.closest('[data-azione]'); if (b) { $('#info').hidden = true; api.azione(b.dataset.azione, b.dataset.arg); } };
  $('#info').hidden = false;
}
export function attrezzi(voci, api) {
  const el = $('#attrezzi'); if (!voci) { el.hidden = true; el.innerHTML = ''; return; }
  el.innerHTML = voci.map(([a, t]) => btn(a, t, { chip: true })).join(''); el.hidden = false;
  el.onclick = (e) => { const b = e.target.closest('[data-azione]'); if (b) api.azione(b.dataset.azione, b.dataset.arg); };
}
