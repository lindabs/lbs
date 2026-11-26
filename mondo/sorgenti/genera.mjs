// Il notiziario del mattino: raccoglie i titoli delle ultime 24 ore da GDELT (stampa locale, paese per paese)
// e dai feed RSS pubblici di alcune testate internazionali, poi li fa riassumere in italiano da Gemini
// (piano gratuito). Nessuna dipendenza da installare.
//
//   GEMINI_API_KEY=... node mondo/sorgenti/genera.mjs
//
// Opzioni:
//   --solo IT,FR,SD      solo alcuni paesi (per le prove)
//   --senza-ai           salta Gemini e salva solo i titoli originali
//   --riusa-raccolta     non interroga di nuovo GDELT: usa l'ultima raccolta salvata
//
// Variabili facoltative: GEMINI_MODEL (predefinito gemini-flash-lite-latest, il più disponibile nel piano gratuito),
// GEMINI_RISERVA (predefinito gemini-flash-latest), LINGUA (predefinita it),
// GDELT_MINUTI (tempo massimo per GDELT, predefinito 60; 0 = solo feed internazionali).

import { readFile, writeFile, mkdir, readdir, unlink } from 'node:fs/promises';

const qui = p => new URL(p, import.meta.url);
const args = process.argv.slice(2);
const opz = n => args.includes(n);
const val = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };

const LINGUA = process.env.LINGUA || 'it';
const MODELLI = [process.env.GEMINI_MODEL || 'gemini-flash-lite-latest', process.env.GEMINI_RISERVA || 'gemini-flash-latest'];
const CHIAVE = process.env.GEMINI_API_KEY;
const PAUSA_GDELT = 8_000;    // GDELT chiede al massimo una richiesta ogni 5 secondi: stiamo larghi
const PAUSA_GEMINI = 12_000;  // per restare sotto il limite di richieste al minuto del piano gratuito
const PAESI_PER_RICHIESTA = 15;
const FONTI_MAX = 8;          // fonti da tenere per paese nel file finale

const attendi = ms => new Promise(r => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- 1a. Feed RSS delle testate internazionali ----------
// Feed pubblici, pensati per essere ripresi con titolo, sommario e link.

const FEED = [
  'https://feeds.bbci.co.uk/news/world/rss.xml',
  'https://feeds.bbci.co.uk/news/world/africa/rss.xml',
  'https://feeds.bbci.co.uk/news/world/asia/rss.xml',
  'https://feeds.bbci.co.uk/news/world/europe/rss.xml',
  'https://feeds.bbci.co.uk/news/world/latin_america/rss.xml',
  'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml',
  'https://feeds.bbci.co.uk/news/world/us_and_canada/rss.xml',
  'https://www.aljazeera.com/xml/rss/all.xml',
  'https://rss.dw.com/rdf/rss-en-world',
  'https://www.rfi.fr/en/rss',
  'https://www.theguardian.com/world/rss',
  'https://feeds.npr.org/1004/rss.xml',
  'https://news.un.org/feed/subscribe/en/news/all/rss.xml',
  'https://allafrica.com/tools/headlines/rdf/latest/headlines.rdf',
  'https://en.mercopress.com/rss',
  'https://www.ansa.it/sito/notizie/mondo/mondo_rss.xml',
  // per regione, così anche i paesi piccoli hanno qualche notizia
  'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Africa.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Americas.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/AsiaPacific.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/Europe.xml',
  'https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml',
  'https://news.un.org/feed/subscribe/en/news/region/africa/feed/rss.xml',
  'https://news.un.org/feed/subscribe/en/news/region/americas/feed/rss.xml',
  'https://news.un.org/feed/subscribe/en/news/region/asia-pacific/feed/rss.xml',
  'https://news.un.org/feed/subscribe/en/news/region/europe/feed/rss.xml',
  'https://news.un.org/feed/subscribe/en/news/region/middle-east/feed/rss.xml',
  'https://allafrica.com/tools/headlines/rdf/westafrica/headlines.rdf',
  'https://allafrica.com/tools/headlines/rdf/eastafrica/headlines.rdf',
  'https://allafrica.com/tools/headlines/rdf/southernafrica/headlines.rdf',
  'https://allafrica.com/tools/headlines/rdf/centralafrica/headlines.rdf',
  'https://allafrica.com/tools/headlines/rdf/northafrica/headlines.rdf',
  'https://globalvoices.org/feed/',
  'https://www.ipsnews.net/feed/',
  'https://thediplomat.com/feed/',
  'https://www.scmp.com/rss/91/feed',
  'https://www.middleeasteye.net/rss',
  'https://balkaninsight.com/feed/',
  'https://www.euronews.com/rss?level=theme&name=news',
  'https://www.rnz.co.nz/rss/pacific.xml',
  'https://www.batimes.com.ar/feed',
];

// Feed nazionali: le notizie interne dei paesi principali, collegate direttamente al paese
// (senza cercarne il nome nel testo). La lingua aiuta Gemini a tradurre.
const FEED_NAZIONALI = {
  IT: ['Italian', 'https://www.ansa.it/sito/notizie/politica/politica_rss.xml', 'https://www.ansa.it/sito/notizie/cronaca/cronaca_rss.xml', 'https://www.ansa.it/sito/notizie/economia/economia_rss.xml'],
  GB: ['English', 'https://feeds.bbci.co.uk/news/uk/rss.xml', 'https://feeds.bbci.co.uk/news/politics/rss.xml'],
  US: ['English', 'https://feeds.npr.org/1001/rss.xml', 'https://feeds.npr.org/1014/rss.xml', 'https://rss.nytimes.com/services/xml/rss/nyt/US.xml'],
  DE: ['German', 'https://www.tagesschau.de/inland/index~rss2.xml', 'https://www.tagesschau.de/index~rss2.xml'],
  FR: ['French', 'https://www.lemonde.fr/politique/rss_full.xml', 'https://www.lemonde.fr/societe/rss_full.xml'],
  ES: ['Spanish', 'https://feeds.elpais.com/mrss-s/pages/ep/site/elpais.com/section/espana/portada'],
  PT: ['Portuguese', 'https://www.publico.pt/api/list/politica'],
  NL: ['English', 'https://nltimes.nl/rss'],
  CH: ['English', 'https://www.swissinfo.ch/eng/rss/politics'],
  JP: ['English', 'https://www3.nhk.or.jp/rss/news/cat1.xml', 'https://www.japantimes.co.jp/feed/'],
  KR: ['English', 'https://en.yna.co.kr/RSS/news.xml'],
  CN: ['English', 'https://www.scmp.com/rss/4/feed'],
  IN: ['English', 'https://www.thehindu.com/news/national/feeder/default.rss'],
  PK: ['English', 'https://www.dawn.com/feeds/home'],
  AU: ['English', 'https://www.abc.net.au/news/feed/51120/rss.xml'],
  CA: ['English', 'https://www.cbc.ca/webfeed/rss/rss-canada', 'https://www.cbc.ca/webfeed/rss/rss-politics'],
  BR: ['Portuguese', 'https://g1.globo.com/rss/g1/politica/', 'https://g1.globo.com/rss/g1/economia/'],
  RU: ['English', 'https://meduza.io/rss/en/all'],
  UA: ['English', 'https://www.ukrinform.net/rss/block-lastnews', 'https://kyivindependent.com/news-archive/rss/'],
  IL: ['English', 'https://www.timesofisrael.com/feed/'],
  NG: ['English', 'https://punchng.com/feed/'],
  PH: ['English', 'https://www.rappler.com/feed/'],
  IE: ['English', 'https://www.rte.ie/feeds/rss/?index=/news/'],
  NZ: ['English', 'https://www.rnz.co.nz/rss/national.xml'],
};

// Altri modi in cui i giornali nominano un paese (oltre al nome inglese e a quello italiano).
const SINONIMI = {
  US: ['United States', 'U.S.', 'US', 'USA', 'Washington', 'White House', 'Stati Uniti', 'Usa'], CN: ['China', 'Chinese', 'Beijing', 'Cina', 'Pechino'],
  GB: ['UK', 'Britain', 'British', 'London', 'Regno Unito', 'Londra'], RU: ['Russian', 'Kremlin', 'Moscow', 'Mosca', 'Cremlino'],
  UA: ['Ukrainian', 'Kyiv', 'Kiev', 'Ucraina'], IL: ['Israeli', 'Israele'], PS: ['Gaza', 'West Bank', 'Palestinian', 'Cisgiordania'],
  IR: ['Iranian', 'Tehran', 'Teheran'], DE: ['German', 'Berlin', 'Berlino'], FR: ['French', 'Paris', 'Parigi'], IT: ['Italian', 'Rome'],
  JP: ['Japanese', 'Tokyo'], KR: ['Seoul'], KP: ['Pyongyang', 'Corea del Nord'], IN: ['Indian government', 'New Delhi', 'Modi'],
  PK: ['Pakistani', 'Islamabad'], TR: ['Turkish', 'Türkiye', 'Ankara', 'Erdogan'], SY: ['Syrian', 'Damascus'], LB: ['Lebanese', 'Beirut', 'Hezbollah'],
  YE: ['Yemeni', 'Houthi', 'Houthis'], SA: ['Saudi', 'Riyadh'], AE: ['UAE', 'Emirati', 'Dubai', 'Abu Dhabi'], EG: ['Egyptian', 'Cairo'],
  SD: ['Sudanese', 'Khartoum', 'Darfur', 'El Fasher'], CD: ['DR Congo', 'DRC', 'Kinshasa'], CG: ['Brazzaville'], VE: ['Venezuelan', 'Caracas'],
  BR: ['Brazilian', 'Brasília', 'Lula'], MX: ['Mexican', 'Mexico City'], AR: ['Argentine', 'Argentinian', 'Buenos Aires', 'Milei'],
  CO: ['Colombian', 'Bogotá'], CU: ['Cuban', 'Havana'], HT: ['Haitian', 'Port-au-Prince'], TW: ['Taiwanese', 'Taipei'],
  AF: ['Afghan', 'Taliban', 'Kabul'], MM: ['Burma', 'Burmese'], NG: ['Nigerian', 'Abuja', 'Lagos'], ET: ['Ethiopian', 'Addis Ababa', 'Tigray'],
  SO: ['Somali', 'Mogadishu', 'al-Shabab'], ZA: ['South African', 'Pretoria', 'Johannesburg'], KE: ['Kenyan', 'Nairobi'],
  PL: ['Polish', 'Warsaw'], HU: ['Hungarian', 'Budapest', 'Orban', 'Orbán'], CZ: ['Czech', 'Czechia', 'Prague'], GR: ['Greek', 'Athens'],
  ES: ['Spanish', 'Madrid'], CA: ['Canadian', 'Ottawa'], AU: ['Australian', 'Canberra'], PH: ['Philippine', 'Filipino', 'Manila'],
  ID: ['Indonesian', 'Jakarta'], VN: ['Vietnamese', 'Hanoi'], TH: ['Thai', 'Bangkok'], BD: ['Bangladeshi', 'Dhaka'], LK: ['Sri Lankan', 'Colombo'],
  IQ: ['Iraqi', 'Baghdad'], JO: ['Jordanian', 'Amman'], CI: ["Côte d'Ivoire", 'Ivorian'], CV: ['Cabo Verde'], MK: ['Macedonia'],
  SZ: ['Swaziland'], TL: ['Timor-Leste'], VA: ['Vatican', 'Pope', 'Papa', 'Vaticano'], BS: ['Bahamas'], GM: ['Gambia'], FM: ['Micronesia'],
  BY: ['Belarusian', 'Minsk', 'Lukashenko'], RS: ['Serbian', 'Belgrade'], XK: ['Pristina'], GE: ['Tbilisi', 'Georgian Dream'],
  AM: ['Armenian', 'Yerevan'], AZ: ['Azerbaijani', 'Baku'], ML: ['Malian', 'Bamako'], BF: ['Burkinabe', 'Ouagadougou'], NE: ['Niamey'],
  LY: ['Libyan', 'Tripoli'], TN: ['Tunisian', 'Tunis'], DZ: ['Algerian', 'Algiers'], MA: ['Moroccan', 'Rabat'], QA: ['Qatari', 'Doha'],
  NZ: ['Wellington'], CL: ['Chilean', 'Santiago'], PE: ['Peruvian', 'Lima'], BO: ['Bolivian', 'La Paz'], EC: ['Ecuadorian', 'Quito'],
  NI: ['Nicaraguan', 'Managua'], SV: ['Salvadoran', 'Bukele'], GT: ['Guatemalan'], HN: ['Honduran'], PA: ['Panamanian', 'Panama Canal'],
  KZ: ['Kazakh', 'Astana'], RO: ['Romanian', 'Bucharest'], BG: ['Bulgarian', 'Sofia'], MD: ['Moldovan', 'Chisinau'], SE: ['Swedish', 'Stockholm'],
  NO: ['Norwegian', 'Oslo'], FI: ['Finnish', 'Helsinki'], DK: ['Danish', 'Copenhagen'], NL: ['Dutch', 'The Hague', 'Amsterdam'],
  BE: ['Belgian', 'Brussels'], PT: ['Portuguese', 'Lisbon'], IE: ['Irish', 'Dublin'], CH: ['Swiss', 'Geneva', 'Bern'], AT: ['Austrian', 'Vienna'],
};

const decodifica = s => s
  .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;|&apos;/g, "'")
  .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ')
  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const campo = (xml, ...nomi) => {
  for (const n of nomi) {
    const m = xml.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, 'i'));
    if (m && decodifica(m[1])) return decodifica(m[1]);
  }
  return '';
};

async function leggiFeed(url, lingua) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(30_000), headers: { 'user-agent': 'il-mondo-stamattina (notiziario personale)' } });
    if (!r.ok) throw new Error(r.status);
    const xml = await r.text();
    const dominio = new URL(url).hostname.replace(/^(www|feeds|rss|en|news)\./, '');
    const limite = Date.now() - 36 * 3600_000;
    const voci = [...xml.matchAll(/<(item|entry)[\s>][\s\S]*?<\/\1>/gi)].map(([x]) => {
      const href = x.match(/<link[^>]*href="([^"]+)"/i)?.[1];
      const data = Date.parse(campo(x, 'pubDate', 'dc:date', 'updated', 'published'));
      return { t: campo(x, 'title'), s: campo(x, 'description', 'summary', 'content').slice(0, 280), u: campo(x, 'link') || href, d: dominio, l: lingua || (url.includes('ansa.it') ? 'Italian' : 'English'), data };
    }).filter(v => v.t && v.u && !(v.data < limite));
    log(`  feed ${dominio}: ${voci.length} notizie`);
    return voci;
  } catch (e) {
    log(`  feed non disponibile: ${url} (${e.message})`);
    return [];
  }
}

function regoleNomi(paesi) {
  const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regole = [];
  for (const p of paesi) {
    for (const n of new Set([p.en, p.nome, ...(SINONIMI[p.id] || [])])) regole.push({ id: p.id, n });
  }
  // prima i nomi lunghi: "Papua New Guinea" non deve contare anche come "Guinea"
  regole.sort((a, b) => b.n.length - a.n.length);
  return regole.map(r => ({ id: r.id, re: new RegExp(`(?<![\\p{L}])${esc(r.n)}(?![\\p{L}])`, 'gu') }));
}

function assegna(voci, paesi) {
  const regole = regoleNomi(paesi);
  const perPaese = {};
  for (const v of voci) {
    let testo = v.t + ' — ' + v.s;
    const trovati = new Set();
    for (const r of regole) {
      if (r.re.test(testo)) { trovati.add(r.id); testo = testo.replace(r.re, '#'); }
      r.re.lastIndex = 0;
    }
    if (trovati.size > 4) continue; // articoli che citano mezzo mondo non aiutano
    for (const id of trovati) (perPaese[id] ||= []).push(v);
  }
  return perPaese;
}

// ---------- 1b. Stampa locale da GDELT ----------

// GDELT è gratuito ma spesso lento: ha un tempo massimo, e se risponde male si va avanti senza.
const GDELT_MINUTI = Number(process.env.GDELT_MINUTI ?? 60);
const gdeltScadenza = Date.now() + GDELT_MINUTI * 60_000;
let ultimaGdelt = 0, gdeltRichieste = 0, gdeltFallimenti = 0, gdeltSpento = GDELT_MINUTI <= 0;
function spegniGdelt(motivo) { if (!gdeltSpento) log(`GDELT: ${motivo}. Proseguo con i soli feed internazionali.`); gdeltSpento = true; }
async function gdelt(query, max) {
  if (Date.now() > gdeltScadenza) spegniGdelt('tempo massimo raggiunto');
  if (gdeltSpento) return null;
  gdeltRichieste++;
  const url = 'https://api.gdeltproject.org/api/v2/doc/doc?' + new URLSearchParams({
    query, mode: 'artlist', format: 'json', timespan: '24h', sort: 'hybridrel', maxrecords: String(max),
  });
  for (let tentativo = 1; tentativo <= 3; tentativo++) {
    const pausa = ultimaGdelt + PAUSA_GDELT * tentativo - Date.now();
    if (pausa > 0) await attendi(pausa);
    ultimaGdelt = Date.now();
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(30_000) });
      const testo = await r.text();
      if (r.status === 429 || testo.startsWith('Please limit')) { log('  GDELT chiede di rallentare'); await attendi(30_000); continue; }
      if (!testo.trim()) return [];
      return JSON.parse(testo).articles || [];
    } catch (e) {
      log(`  GDELT non risponde (${e.cause?.code || e.name}), riprovo`);
    }
  }
  // Se GDELT fallisce la maggior parte delle richieste, non vale la pena insistere.
  gdeltFallimenti++;
  if (gdeltRichieste >= 8 && gdeltFallimenti / gdeltRichieste > 0.6) spegniGdelt('troppe richieste senza risposta');
  return null;
}

const normalizza = t => t.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
function pulisci(articoli, visti = new Set()) {
  const out = [];
  for (const a of articoli || []) {
    const t = (a.title || a.t || '').replace(/\s+/g, ' ').trim();
    const k = normalizza(t);
    if (t.length < 25 || visti.has(k)) continue;
    visti.add(k);
    out.push({ t, d: a.domain || a.d, u: a.url || a.u, l: a.language || a.l, ...(a.s && a.s !== t ? { s: a.s } : {}) });
  }
  return out;
}

async function raccogli(paesi) {
  log(`Leggo ${FEED.length} feed internazionali...`);
  const voci = (await Promise.all(FEED.map(u => leggiFeed(u)))).flat();
  const nazionali = {};
  await Promise.all(Object.entries(FEED_NAZIONALI).map(async ([id, [lingua, ...urls]]) => {
    nazionali[id] = (await Promise.all(urls.map(u => leggiFeed(u, lingua)))).flat();
  }));
  const dalMondo = assegna(voci, JSON.parse(await readFile(qui('../dati/paesi.json'), 'utf8')));

  // La stampa locale serve di più dove quella internazionale dice poco: GDELT parte da quei paesi.
  const ordine = [...paesi].sort((a, b) => (dalMondo[a.id]?.length || 0) - (dalMondo[b.id]?.length || 0));
  log(`Raccolgo la stampa locale da GDELT (al massimo ${GDELT_MINUTI} minuti)...`);
  const raccolta = {};
  for (const [i, p] of ordine.entries()) {
    const visti = new Set();
    // prima la stampa internazionale (ha anche un breve sommario), poi quella locale
    // prima le notizie interne dei feed nazionali, quando ci sono
    const interne = pulisci(nazionali[p.id] || [], visti).slice(0, 12);
    const estero = pulisci(dalMondo[p.id] || [], visti).slice(0, interne.length ? 6 : 10);
    const locale = gdeltSpento ? [] : pulisci(await gdelt(`sourcecountry:${p.fips}`, 50), visti);
    raccolta[p.id] = [...interne, ...estero, ...locale].slice(0, 24);
    if (!gdeltSpento || i % 25 === 0) log(`[${i + 1}/${paesi.length}] ${p.nome}: ${estero.length} internazionali, ${locale.length} locali`);
  }
  const coperti = Object.values(raccolta).filter(v => v.length).length;
  log(`Paesi con almeno una notizia: ${coperti} su ${paesi.length}`);
  return raccolta;
}

// ---------- 2. Il riassunto con Gemini ----------

const ISTRUZIONI = `Sei la redazione di un notiziario mattutino di geopolitica e attualità, scritto in italiano.
Per ogni paese ricevi titoli di articoli pubblicati nelle ultime 24 ore, in varie lingue, numerati da 0;
alcuni hanno sotto anche un breve sommario.

Regole, da rispettare sempre:
- Usa SOLO le informazioni contenute nei titoli e nei sommari. Non aggiungere fatti, cifre, nomi, date o contesto che non compaiano.
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
let modelli = null;

// Il modello che ha appena funzionato passa davanti, così le richieste successive vanno a colpo sicuro.
async function elencoModelli() {
  modelli ??= [...MODELLI];
  return modelli;
}

// Anche Gemini ha un tempo massimo: i paesi rimasti fuori mostreranno i titoli originali.
let geminiScadenza = null;
async function gemini(istruzioni, testo, schema) {
  const elenco = await elencoModelli();
  geminiScadenza ??= Date.now() + 50 * 60_000;
  for (const giro of [1, 2]) {
    for (const modello of [...elenco]) {
      for (let tentativo = 1; tentativo <= 3; tentativo++) {
        if (Date.now() > geminiScadenza) { log('  tempo massimo per Gemini raggiunto'); return null; }
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
            signal: AbortSignal.timeout(75_000),
          });
          corpo = await r.json();
        } catch (e) {
          log(`  ${modello} non risponde (${e.cause?.code || e.name})`);
          break; // un modello lento di solito resta lento: si passa al prossimo
        }
        if (r.ok) {
          const parti = corpo.candidates?.[0]?.content?.parts || [];
          const json = parti.filter(p => !p.thought).map(p => p.text || '').join('');
          try {
            const dati = JSON.parse(json);
            modelloUsato = modello;
            elenco.splice(elenco.indexOf(modello), 1); elenco.unshift(modello);
            log(`  fatto con ${modello}`);
            return dati;
          } catch { log(`  ${modello}: risposta non leggibile (${corpo.candidates?.[0]?.finishReason})`); continue; }
        }
        const msg = String(corpo?.error?.message || r.status).slice(0, 120);
        if (r.status === 401 || r.status === 403) {
          throw new Error(`Gemini ha rifiutato la chiave (${r.status}): ${msg}. Controlla il secret GEMINI_API_KEY.`);
        }
        if (r.status === 429) {
          if (/per ?day|PerDay/i.test(JSON.stringify(corpo))) { log(`  ${modello}: quota giornaliera esaurita`); break; }
          // Limite al minuto del piano gratuito: se Google indica quanto aspettare, aspettiamo.
          const ritardo = corpo?.error?.details?.find(d => d.retryDelay)?.retryDelay;
          const secondi = Math.min(ritardo ? parseFloat(ritardo) : 60, 90);
          log(`  ${modello}: limite al minuto, attendo ${Math.round(secondi)} s`);
          await attendi(secondi * 1000 + 1000);
          continue;
        }
        log(`  ${modello}: errore ${r.status} (${msg})`);
        if (r.status === 400 || r.status === 404) break; // modello non adatto: si passa al prossimo
        if (r.status >= 500) await attendi(15_000 * tentativo); // sovraccarico: un po' di pazienza
      }
    }
    if (giro === 1) { log('  tutti i modelli sono occupati, riprovo tra due minuti'); await attendi(120_000); }
  }
  return null;
}

function blocchiDiTesto(paesi, raccolta) {
  return paesi.map(p => `### ${p.id} — ${p.nome}\n` +
    raccolta[p.id].map((a, i) => `[${i}] ${a.t} (${a.d}, ${a.l})` + (a.s ? `\n    ${a.s}` : '')).join('\n')).join('\n\n');
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

async function riassumi(elenco, perRichiesta, etichetta) {
  for (let i = 0; i < elenco.length; i += perRichiesta) {
    const gruppo = elenco.slice(i, i + perRichiesta);
    let risposta = null;
    if (!senzaAi) {
      log(`Gemini${etichetta}: paesi ${i + 1}-${i + gruppo.length} di ${elenco.length}`);
      risposta = await gemini(ISTRUZIONI, blocchiDiTesto(gruppo, raccolta), SCHEMA_PAESI);
    }
    const perId = new Map((risposta?.paesi || []).map(v => [String(v.id).toUpperCase(), v]));
    for (const p of gruppo) {
      const voce = perId.get(p.id);
      risultato[p.id] = voce ? componi(voce, raccolta[p.id]) : soloTitoli(raccolta[p.id]);
    }
  }
}

await riassumi(conTitoli, PAESI_PER_RICHIESTA, '');

// Secondo passaggio: si riprova, a gruppi più piccoli, solo con i paesi rimasti senza riassunto.
const mancanti = senzaAi ? [] : conTitoli.filter(p => risultato[p.id].soloTitoli);
if (mancanti.length) {
  log(`Secondo passaggio per ${mancanti.length} paesi rimasti senza riassunto`);
  geminiScadenza = Date.now() + 20 * 60_000;
  await attendi(30_000);
  await riassumi(mancanti, 8, ' (secondo passaggio)');
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
  for (const [id, v] of Object.entries(notiziario.paesi)) {
    console.log(`\n== ${id}: ${v.soloTitoli ? '(solo titoli)' : `${v.titolo} [intensità ${v.intensita}]`}`);
    for (const x of v.punti) console.log(`- ${x.testo} [fonti ${x.fonti.map(n => n + 1).join(', ')}]`);
    v.fonti.forEach((f, n) => console.log(`  ${n + 1}. ${f.t} (${f.d})`));
  }
  for (const n of notiziario.mondo) console.log(`\n** ${n.titolo}: ${n.testo} (${n.paesi.join(', ')})`);
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
