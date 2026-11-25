// Il notiziario del mattino: raccoglie i titoli delle ultime 24 ore da GDELT, paese per paese,
// e li fa riassumere in italiano da Gemini (piano gratuito). Nessuna dipendenza da installare.
//
//   GEMINI_API_KEY=... node mondo/sorgenti/genera.mjs
//
// Opzioni:
//   --solo IT,FR,SD      solo alcuni paesi (per le prove)
//   --senza-ai           salta Gemini e salva solo i titoli originali
//   --riusa-raccolta     non interroga di nuovo GDELT: usa l'ultima raccolta salvata
//
// Variabili facoltative: GEMINI_MODEL (predefinito gemini-flash-latest),
// GEMINI_RISERVA (predefinito gemini-flash-lite-latest), LINGUA (predefinita it).

import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';

const qui = p => new URL(p, import.meta.url);
const args = process.argv.slice(2);
const opz = n => args.includes(n);
const val = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

const LINGUA = process.env.LINGUA || 'it';
const MODELLI = [process.env.GEMINI_MODEL || 'gemini-flash-latest', process.env.GEMINI_RISERVA || 'gemini-flash-lite-latest'];
const CHIAVE = process.env.GEMINI_API_KEY;
const PAUSA_GDELT = 10_000;   // GDELT chiede al massimo una richiesta ogni 5 secondi: stiamo larghi
const PAUSA_GEMINI = 12_000;  // per restare sotto il limite di richieste al minuto del piano gratuito
const PAESI_PER_RICHIESTA = 15;
const FONTI_MAX = 8;          // fonti da tenere per paese nel file finale

const attendi = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- 1. Raccolta dei titoli da GDELT ----------

let ultimaGdelt = 0;
async function gdelt(query, max) {
  const url = 'https://api.gdeltproject.org/api/v2/doc/doc?' + new URLSearchParams({
    query, mode: 'artlist', format: 'json', timespan: '24h', sort: 'hybridrel', maxrecords: String(max),
  });
  for (let tentativo = 1; tentativo <= 4; tentativo++) {
    const pausa = ultimaGdelt + PAUSA_GDELT * tentativo - Date.now();
    if (pausa > 0) await attendi(pausa);
    ultimaGdelt = Date.now();
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(45_000) });
      const testo = await r.text();
      if (testo.startsWith('Please limit')) { await attendi(20_000); continue; }
      if (!testo.trim()) return [];
      return JSON.parse(testo).articles || [];
    } catch (e) {
      log(`  GDELT non risponde (${e.cause?.code || e.name}), riprovo`);
    }
  }
  return null; // GDELT irraggiungibile per questa richiesta
}

const normalizza = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function pulisci(articoli, visti = new Set()) {
  const out = [];
  for (const a of articoli || []) {
    const t = (a.title || '').replace(/\s+/g, ' ').trim();
    const k = normalizza(t);
    if (t.length < 25 || visti.has(k)) continue;
    visti.add(k);
    out.push({ t, d: a.domain, u: a.url, l: a.language });
  }
  return out;
}

async function raccogli(paesi) {
  const raccolta = {};
  for (const [i, p] of paesi.entries()) {
    const visti = new Set();
    let titoli = pulisci(await gdelt(p.fonte || `sourcecountry:${p.fips}`, 50), visti);
    // Pochi giornali locali indicizzati: aggiungiamo cosa scrive di quel paese la stampa internazionale.
    if (titoli.length < 6) {
      const estero = await gdelt(`"${p.en}" sourcelang:english -sourcecountry:${p.fips}`, 20);
      titoli = titoli.concat(pulisci(estero, visti));
    }
    raccolta[p.id] = titoli.slice(0, 20);
    log(`[${i + 1}/${paesi.length}] ${p.nome}: ${raccolta[p.id].length} titoli`);
  }
  return raccolta;
}

// ---------- 2. Il riassunto con Gemini ----------

const ISTRUZIONI = `Sei la redazione di un notiziario mattutino di geopolitica e attualità, scritto in italiano.
Per ogni paese ricevi titoli di articoli pubblicati nelle ultime 24 ore, in varie lingue, numerati da 0.

Regole, da rispettare sempre:
- Usa SOLO le informazioni contenute nei titoli. Non aggiungere fatti, cifre, nomi, date o contesto che non compaiano.
- Se un titolo è un'opinione o un'accusa, riportalo come tale ("secondo...", "il governo accusa...").
- Dai priorità a politica interna ed estera, conflitti, economia, diritti, ambiente, scienza e grandi fatti di società.
  Ignora gossip, sport, cucina, spettacolo, oroscopi e pubblicità, salvo fatti davvero eccezionali.
- Privilegia ciò che riguarda il paese stesso: la stampa locale parla spesso di altri paesi.
- Unisci i titoli che raccontano lo stesso fatto in un solo punto.
- Da 2 a 5 punti per paese, ognuno di 1 o 2 frasi brevi, chiare e neutrali, senza opinioni.
- In "fonti" metti i numeri dei titoli su cui si basa il punto.
- "titolo": la notizia principale del giorno, al massimo 12 parole.
- "intensita": 0 = niente di rilevante (in questo caso "punti" resta vuoto e "titolo" vuoto), 1 = giornata ordinaria,
  2 = notizie importanti, 3 = crisi o fatto di portata internazionale.
- "temi": da 1 a 3 parole chiave in minuscolo (es. "elezioni", "conflitto", "economia").`;

const SCHEMA_PAESI = {
  type: 'OBJECT',
  properties: {
    paesi: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          id: { type: 'STRING' },
          titolo: { type: 'STRING' },
          intensita: { type: 'INTEGER' },
          temi: { type: 'ARRAY', items: { type: 'STRING' } },
          punti: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { testo: { type: 'STRING' }, fonti: { type: 'ARRAY', items: { type: 'INTEGER' } } },
              required: ['testo', 'fonti'],
            },
          },
        },
        required: ['id', 'titolo', 'intensita', 'punti'],
      },
    },
  },
  required: ['paesi'],
};

const ISTRUZIONI_MONDO = `Sei la redazione di un notiziario mattutino di geopolitica, scritto in italiano.
Ricevi, paese per paese, la notizia principale e i punti già scritti dalla redazione.
Scegli i 6 fatti più importanti per il mondo oggi e scrivi per ognuno un titolo (massimo 10 parole) e un testo di 2 frasi.
Usa solo le informazioni ricevute, senza aggiungere nulla. Unisci i fatti che coinvolgono più paesi.
In "paesi" indica i codici dei paesi coinvolti, tra quelli ricevuti.`;

const SCHEMA_MONDO = {
  type: 'OBJECT',
  properties: {
    notizie: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: { titolo: { type: 'STRING' }, testo: { type: 'STRING' }, paesi: { type: 'ARRAY', items: { type: 'STRING' } } },
        required: ['titolo', 'testo', 'paesi'],
      },
    },
  },
  required: ['notizie'],
};

let ultimaGemini = 0;
let modelloUsato = null;
async function gemini(istruzioni, testo, schema) {
  for (const modello of MODELLI) {
    for (let tentativo = 1; tentativo <= 4; tentativo++) {
      const pausa = ultimaGemini + PAUSA_GEMINI - Date.now();
      if (pausa > 0) await attendi(pausa);
      ultimaGemini = Date.now();
      let r, corpo;
      try {
        r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modello}:generateContent`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-goog-api-key': CHIAVE },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: istruzioni }] },
            contents: [{ role: 'user', parts: [{ text: testo }] }],
            generationConfig: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.3, maxOutputTokens: 32768 },
          }),
          signal: AbortSignal.timeout(180_000),
        });
        corpo = await r.json();
      } catch (e) {
        log(`  Gemini non risponde (${e.cause?.code || e.name}), riprovo`);
        continue;
      }
      if (r.ok) {
        const parti = corpo.candidates?.[0]?.content?.parts || [];
        const json = parti.filter(p => !p.thought).map(p => p.text || '').join('');
        try { modelloUsato = modello; return JSON.parse(json); }
        catch { log(`  risposta non leggibile (${corpo.candidates?.[0]?.finishReason}), riprovo`); continue; }
      }
      const msg = corpo?.error?.message || r.status;
      if (r.status === 429) {
        // Limite del piano gratuito: se Google indica quanto aspettare, aspettiamo.
        const ritardo = corpo?.error?.details?.find(d => d.retryDelay)?.retryDelay;
        const secondi = ritardo ? parseFloat(ritardo) : 60;
        if (/per ?day|PerDay/i.test(JSON.stringify(corpo))) { log(`  quota giornaliera di ${modello} esaurita`); break; }
        log(`  limite raggiunto su ${modello}, attendo ${Math.round(secondi)} s`);
        await attendi(secondi * 1000 + 1000);
        continue;
      }
      if (r.status === 400 || r.status === 401 || r.status === 403) {
        throw new Error(`Gemini ha rifiutato la richiesta (${r.status}): ${msg}. Controlla la chiave GEMINI_API_KEY.`);
      }
      log(`  ${modello}: errore ${r.status} (${msg})`);
      if (r.status === 404) break; // modello non disponibile: si passa alla riserva
    }
  }
  return null;
}

function blocchiDiTesto(paesi, raccolta) {
  return paesi.map(p => `### ${p.id} — ${p.nome}\n` +
    raccolta[p.id].map((a, i) => `[${i}] ${a.t} (${a.d}, ${a.l})`).join('\n')).join('\n\n');
}

// Tiene le fonti citate (poi le altre, fino a FONTI_MAX) e rinumera i riferimenti nei punti.
function componi(voce, titoli) {
  const citate = [...new Set((voce.punti || []).flatMap(p => p.fonti || []))].filter(i => titoli[i]);
  const ordine = [...citate, ...titoli.map((_, i) => i).filter(i => !citate.includes(i))].slice(0, Math.max(FONTI_MAX, citate.length));
  const nuovo = new Map(ordine.map((vecchio, n) => [vecchio, n]));
  const punti = (voce.punti || [])
    .map(p => ({ testo: String(p.testo || '').trim(), fonti: (p.fonti || []).filter(i => nuovo.has(i)).map(i => nuovo.get(i)) }))
    .filter(p => p.testo);
  const intensita = Math.max(0, Math.min(3, Math.round(voce.intensita || 0)));
  return {
    titolo: punti.length ? String(voce.titolo || '').trim() : '',
    intensita: punti.length ? intensita : 0,
    temi: (voce.temi || []).slice(0, 3),
    punti,
    fonti: ordine.map(i => ({ t: titoli[i].t, d: titoli[i].d, u: titoli[i].u })),
  };
}

const soloTitoli = titoli => ({ titolo: '', intensita: 0, temi: [], punti: [], soloTitoli: true, fonti: titoli.slice(0, FONTI_MAX).map(({ t, d, u }) => ({ t, d, u })) });

// ---------- 3. Tutto insieme ----------

const tutti = JSON.parse(await readFile(qui('../dati/paesi.json'), 'utf8'));
const scelti = val('--solo') ? tutti.filter(p => val('--solo').split(',').includes(p.id)) : tutti;
const fileRaccolta = qui('.raccolta.json');

let raccolta;
if (opz('--riusa-raccolta')) {
  raccolta = JSON.parse(await readFile(fileRaccolta, 'utf8'));
} else {
  log(`Raccolgo i titoli di ${scelti.length} paesi da GDELT (ci vuole circa un'ora)...`);
  raccolta = await raccogli(scelti);
  await writeFile(fileRaccolta, JSON.stringify(raccolta));
}

const conTitoli = scelti.filter(p => raccolta[p.id]?.length);
if (conTitoli.length < Math.min(10, scelti.length)) {
  console.error(`Solo ${conTitoli.length} paesi con titoli: GDELT forse non funziona. Lascio il notiziario di ieri.`);
  process.exit(1);
}

const risultato = {};
const senzaAi = opz('--senza-ai') || !CHIAVE;
if (!CHIAVE && !opz('--senza-ai')) log('GEMINI_API_KEY mancante: salvo solo i titoli originali.');

for (let i = 0; i < conTitoli.length; i += PAESI_PER_RICHIESTA) {
  const gruppo = conTitoli.slice(i, i + PAESI_PER_RICHIESTA);
  let risposta = null;
  if (!senzaAi) {
    log(`Gemini: paesi ${i + 1}-${i + gruppo.length} di ${conTitoli.length}`);
    risposta = await gemini(ISTRUZIONI, blocchiDiTesto(gruppo, raccolta), SCHEMA_PAESI);
  }
  const perId = new Map((risposta?.paesi || []).map(v => [String(v.id).toUpperCase(), v]));
  for (const p of gruppo) {
    const voce = perId.get(p.id);
    risultato[p.id] = voce ? componi(voce, raccolta[p.id]) : soloTitoli(raccolta[p.id]);
  }
}

let mondo = [];
if (!senzaAi) {
  const rilevanti = conTitoli.filter(p => risultato[p.id].intensita >= 2);
  if (rilevanti.length) {
    log('Gemini: il mondo in breve');
    const testo = rilevanti.map(p => `### ${p.id} — ${p.nome}\n${risultato[p.id].titolo}\n` +
      risultato[p.id].punti.map(x => '- ' + x.testo).join('\n')).join('\n\n');
    const r = await gemini(ISTRUZIONI_MONDO, testo, SCHEMA_MONDO);
    const ids = new Set(rilevanti.map(p => p.id));
    mondo = (r?.notizie || []).slice(0, 6).map(n => ({
      titolo: String(n.titolo).trim(), testo: String(n.testo).trim(),
      paesi: (n.paesi || []).map(x => String(x).toUpperCase()).filter(x => ids.has(x)),
    }));
  }
}

const adesso = new Date();
const giorno = adesso.toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' }); // AAAA-MM-GG
const notiziario = {
  data: giorno,
  generato: adesso.toISOString(),
  lingua: LINGUA,
  modello: senzaAi ? null : modelloUsato,
  mondo,
  paesi: risultato,
};

const riassunti = Object.values(risultato).filter(v => !v.soloTitoli).length;
if (!senzaAi && riassunti === 0) {
  console.error('Gemini non ha prodotto nessun riassunto: lascio il notiziario di ieri.');
  process.exit(1);
}

if (opz('--solo')) {
  await writeFile(qui(`.prova-${LINGUA}.json`), JSON.stringify(notiziario, null, 1));
  log(`Prova salvata in mondo/sorgenti/.prova-${LINGUA}.json (il notiziario pubblico non è stato toccato)`);
} else {
  await writeFile(qui(`../dati/oggi-${LINGUA}.json`), JSON.stringify(notiziario));
  const archivio = qui('../dati/archivio/');
  await mkdir(archivio, { recursive: true });
  await writeFile(new URL(`${giorno}-${LINGUA}.json`, archivio), JSON.stringify(notiziario));
  // L'archivio tiene gli ultimi 30 giorni.
  const vecchi = (await readdir(archivio)).filter(f => f.endsWith('.json')).sort().reverse().slice(30);
  for (const f of vecchi) await unlink(new URL(f, archivio));
  log(`Fatto: ${riassunti} paesi riassunti, ${Object.keys(risultato).length - riassunti} con i soli titoli.`);
}
