/* =====================================================================
   LA CARTOLINA CHE SI APRE · le mete
   Questo file è condiviso da due pagine:
   - cartolina/index.html  (Crea la tua cartolina: chi regala sceglie e scrive)
   - cartolina/per-te/     (la busta che apre chi riceve)
   Ogni meta porta con sé illustrazione, francobollo, timbro, suoni e testi predefiniti.
   Per aggiungere una meta: una nuova voce in METE, con la sua funzione di disegno.
   ===================================================================== */

/* ---------- Utilità ---------- */
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647, (seed - 1) / 2147483646); }
const giornoDa = s => new Date(s + "T12:00:00");
const fmt = (d, o) => new Intl.DateTimeFormat("it-IT", o).format(d);
const conArticolo = d => { const n = d.getDate(); const m = fmt(d, { month: "long" }); return n === 1 ? `il 1° ${m}` : (n === 8 || n === 11) ? `l'${n} ${m}` : `il ${n} ${m}`; };
const ROMANI = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
function intervallo(a, b) {
  const da = (n => (n === 8 || n === 11) ? `dall'${n}` : `dal ${n}`)(a.getDate());
  const al = (n => (n === 1) ? "al 1°" : (n === 8 || n === 11) ? `all'${n}` : `al ${n}`)(b.getDate());
  if (a.getMonth() === b.getMonth()) return `${da} ${al} ${fmt(b, { month: "long", year: "numeric" })}`;
  return `${da} ${fmt(a, { month: "long" })} ${al} ${fmt(b, { month: "long", year: "numeric" })}`;
}
const BIGLIETTO = "Dove, per ora, resta un segreto. Ti lascio quattro indizi da scoprire uno alla volta. Prenditi il tempo che serve: il viaggio comincia qui.";

/* =====================================================================
   LE METE
   ===================================================================== */
const METE = {
  santorini: {
    id: "santorini",
    nome: "Santorini", manifesto: "SANTORINI",
    luogo: "Grecia · Isole Cicladi",
    paese: "ΕΛΛΑΣ", paeseLatino: "HELLAS", valore: "1,20 €",
    timbro: "ΣΑΝΤΟΡΙΝΗ ✶ SANTORINI ✶ ",
    via: "Αεροπορικώς",
    ambiente: ["mare", "campane"],
    scena() { return scenaSantorini(this); },
    francobollo() { return francobolloSantorini(this); },
    predefiniti: {
      indizi: [
        { tipo: "profumo", titolo: "Un profumo",
          segreto: "Limoni, fichi e salsedine",
          testo: "Sa di limoni appena colti, di fichi lasciati al sole e di vento che arriva dal mare.",
          nota: "Lo schermo non profuma, lo sappiamo. Qui serve un po' di immaginazione." },
        { tipo: "suono", titolo: "Un suono", suoni: ["mare", "campane"],
          testo: "Onde che vanno e vengono e, lontana, una campana che chiama la sera." },
        { tipo: "colore", titolo: "Tre colori",
          colori: [{ nome: "Bianco calce", hex: "#f6f1e7" }, { nome: "Blu cupola", hex: "#1f4e9c" }, { nome: "Rosa buganvillea", hex: "#c8467a" }],
          testo: "Muri bianchissimi, cupole blu e fiori che scavalcano i cancelli. Il resto lo fa la luce." },
        { tipo: "parola", titolo: "Una parola",
          parola: "μεράκι", traslitterazione: "meráki", pronuncia: "me-RÀ-ki",
          significato: "Fare qualcosa con anima e amore, lasciandoci dentro un pezzo di sé.",
          testo: "È il modo in cui ho preparato questo viaggio." }
      ],
      indovina: {
        giuste: ["santorini", "santorino", "oia", "thira", "thera", "fira"],
        vicine: ["grecia", "cicladi", "isola greca", "isole greche", "egeo", "mykonos", "creta", "naxos", "paros", "milos", "atene"],
        giusta: "Centro. Complimenti per il fiuto: la cartolina conferma.",
        vicina: "Fuochino: il paese è quello giusto, manca l'isola.",
        sbagliate: ["Acqua. Bella idea, però: tienila per il prossimo viaggio.", "Non lì. Però ci stai girando intorno.", "No, ma l'entusiasmo è quello giusto."]
      },
      messaggio: per => `${per},\nho trovato un'isola dove il tramonto è così bello che la gente applaude. Ho pensato che valesse la pena vederlo insieme.\nPrepara poca valigia e tanta voglia di mare.`,
      valigia: [
        "Costume, meglio due: il mare chiama spesso",
        "Sandali comodi: a Oia gli scalini sono più delle cartoline",
        "Un capo elegante e leggero per le cene sulla caldera",
        "Occhiali da sole e cappello",
        "Una felpa: la sera il vento si fa sentire",
        "Spazio libero per i ricordi (e per i capperi)"
      ],
      programma: [
        "Arrivo, valigie in camera e primo tramonto da Oia. Applausi facoltativi.",
        "In barca nella caldera: bagno alle sorgenti calde e pranzo a bordo.",
        "Pyrgos, una degustazione di Assyrtiko e cena di pesce ad Ammoudi, ai piedi della scogliera.",
        "Colazione lenta, ultimo tuffo e rientro."
      ],
      nota: "Il resto si improvvisa: è la parte migliore."
    }
  },

  parigi: {
    id: "parigi",
    nome: "Parigi", manifesto: "PARIS",
    luogo: "Francia · La Ville Lumière",
    paese: "FRANCE", paeseLatino: "POSTES", valore: "1,20 €",
    timbro: "PARIS ✶ FRANCE ✶ ",
    via: "Prioritaire",
    ambiente: ["citta", "fisarmonica"],
    scena() { return scenaParigi(this); },
    francobollo() { return francobolloParigi(this); },
    predefiniti: {
      indizi: [
        { tipo: "profumo", titolo: "Un profumo",
          segreto: "Burro, caffè e pioggia sul selciato",
          testo: "Sa di croissant appena sfornati, di caffè bevuto al bancone e di pioggia leggera sulle pietre della strada.",
          nota: "Lo schermo non profuma, lo sappiamo. Ma il burro si immagina benissimo." },
        { tipo: "suono", titolo: "Un suono", suoni: ["fisarmonica"],
          testo: "Una fisarmonica all'angolo di una strada, un valzer che nessuno ha chiesto e tutti ascoltano." },
        { tipo: "colore", titolo: "Tre colori",
          colori: [{ nome: "Grigio zinco", hex: "#7f8ea6" }, { nome: "Pietra chiara", hex: "#e9dcc4" }, { nome: "Rosso bistrot", hex: "#a8323a" }],
          testo: "Tetti color zinco, facciate di pietra chiara e il rosso delle tende dei bistrot." },
        { tipo: "parola", titolo: "Una parola",
          parola: "flâner", traslitterazione: "flâner", pronuncia: "fla-NÉ",
          significato: "Passeggiare senza meta, con il solo scopo di guardarsi intorno.",
          testo: "È esattamente il programma." }
      ],
      indovina: {
        giuste: ["parigi", "paris", "eiffel", "montmartre", "louvre", "senna", "torre eiffel"],
        vicine: ["francia", "france", "lione", "nizza", "marsiglia", "provenza", "bordeaux", "normandia", "versailles", "strasburgo"],
        giusta: "Centro. Complimenti per il fiuto: la cartolina conferma.",
        vicina: "Fuochino: il paese è quello giusto, la città no.",
        sbagliate: ["Acqua. Bella idea, però: tienila per il prossimo viaggio.", "Non lì. Però ci stai girando intorno.", "No, ma l'entusiasmo è quello giusto."]
      },
      messaggio: per => `${per},\nho prenotato qualche giorno in una città dove si cammina senza meta e ci si ferma a ogni angolo. Il programma è quasi vuoto, apposta: lo riempiamo strada facendo.\nPorta scarpe comode e appetito.`,
      valigia: [
        "Scarpe comode: Parigi si gira a piedi, e i chilometri si sommano",
        "Un ombrello piccolo: il cielo qui cambia idea spesso",
        "Un capo elegante per una cena con le tovaglie bianche",
        "Una sciarpa, anche solo per stile",
        "Un libro da leggere al tavolino di un caffè",
        "Spazio in valigia per i macarons"
      ],
      programma: [
        "Arrivo, passeggiata lungo la Senna e cena in un bistrot del Marais.",
        "Montmartre al mattino, museo d'Orsay nel pomeriggio e battello sulla Senna al tramonto.",
        "Mercato, croissant ancora caldo e ultimo giro sul lungosenna prima di ripartire."
      ],
      nota: "Il resto si scopre passeggiando, senza fretta."
    }
  }
};

/* ---------- Le cartoline di esempio (per-te/#santorini e per-te/#parigi) ---------- */
const ESEMPI = {
  santorini: {
    m: "santorini", p: "Giulia", d: "Marco", a: "2026-11-23",
    s: "2027-06-04", r: "2027-06-07",
    sn: "Volo alle 7:05 da Milano Malpensa", rn: "Atterraggio in serata, abbronzatura inclusa",
    t: "Giulia,\ntre anni fa mi hai detto che sognavi un tramonto vero, di quelli che la gente applaude. Ho controllato: a Oia lo fanno davvero.\nQuindi a giugno si parte, solo noi due, poca valigia e nessuna sveglia (tranne quella del volo, perdonami).\nBuon anniversario.",
    x: "Ci sto! Ho appena aperto la cartolina: Santorini, dal 4 al 7 giugno. Comincio a pensare alla valigia. Grazie, Marco."
  },
  parigi: {
    m: "parigi", p: "Sofia", d: "Mamma e papà", a: "2026-11-23",
    s: "2027-04-23", r: "2027-04-25",
    sn: "Volo alle 8:15 da Milano Linate", rn: "Rientro in serata, con qualche formaggio in più",
    t: "Sofia,\ncinque anni di studio, una tesi e una corona d'alloro. Ci sembrava giusto festeggiare in una città dove le corone le mettono anche sui dolci.\nTre giorni a Parigi, solo noi tre. Il francese del liceo, finalmente, servirà a qualcosa.\nCongratulazioni, dottoressa."
  }
};

/* =====================================================================
   IL LINK
   Chi regala compila un modulo; i dati diventano un codice dopo il # del link.
   La parte dopo il # non viene mai inviata al server: resta tra chi manda e chi riceve.
   Chiavi brevi per tenere corto il link:
   m meta · p per · d da · a apertura · s partenza · r ritorno · sn/rn note di viaggio
   t messaggio · v valigia · g programma · n nota · w numero WhatsApp · x risposta · i indovina (0 = no)
   ===================================================================== */
const b64u = bytes => { let s = ""; bytes.forEach(b => s += String.fromCharCode(b)); return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); };
const daB64u = str => { const s = atob(str.replace(/-/g, "+").replace(/_/g, "/")); return Uint8Array.from(s, c => c.charCodeAt(0)); };
async function codifica(dati) {
  const json = new TextEncoder().encode(JSON.stringify(dati));
  if (window.CompressionStream) {
    try {
      const flusso = new Blob([json]).stream().pipeThrough(new CompressionStream("deflate-raw"));
      return "1" + b64u(new Uint8Array(await new Response(flusso).arrayBuffer()));
    } catch (e) {}
  }
  return "0" + b64u(json);
}
async function decodifica(codice) {
  let bytes = daB64u(codice.slice(1));
  if (codice[0] === "1") {
    if (!window.DecompressionStream) throw new Error("browser");
    const flusso = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
    bytes = new Uint8Array(await new Response(flusso).arrayBuffer());
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}
const righe = t => Array.isArray(t) ? t : String(t || "").split(/\n+/).map(r => r.trim()).filter(Boolean);

/* Dai dati brevi alla cartolina completa, riempiendo i vuoti con i testi della meta */
function componi(d) {
  const M = METE[d.m] || METE.santorini, P = M.predefiniti;
  const per = (d.p || "").trim() || "te", da = (d.d || "").trim();
  const partenza = d.s ? giornoDa(d.s) : null, ritorno = d.r ? giornoDa(d.r) : null;
  let quando = "";
  if (partenza && ritorno) quando = `, ${intervallo(partenza, ritorno).replace(/ \d{4}$/, "")}`;
  else if (partenza) quando = `, ${conArticolo(partenza)}`;
  return {
    meta: M.id, per, da,
    iniziale: (da || "L").trim()[0].toUpperCase(),
    apertura: d.a || "",
    biglietto: BIGLIETTO,
    indizi: P.indizi,
    indovina: d.i === 0 ? { attivo: false } : Object.assign({ attivo: true }, P.indovina),
    messaggio: righe(d.t || P.messaggio((d.p || "").trim() || "Ciao")),
    firma: da,
    viaggio: {
      partenza: d.s || "", ritorno: d.r || "",
      partenzaNota: d.sn || "", ritornoNota: d.rn || "",
      valigia: d.v ? righe(d.v) : P.valigia,
      programma: d.g ? righe(d.g) : P.programma,
      nota: d.n !== undefined ? d.n : P.nota
    },
    whatsapp: {
      numero: d.w || "",
      risposta: d.x || `Ci sto! Ho appena aperto la cartolina: ${M.nome}${quando}. Comincio a pensare alla valigia.${da ? ` Grazie, ${da}.` : ""}`
    }
  };
}
/* Legge la cartolina dall'indirizzo: #santorini, #parigi (esempi) oppure il codice di chi regala */
async function caricaCartolina(hash) {
  const h = decodeURIComponent((hash || "").replace(/^#/, ""));
  if (!h) return componi(ESEMPI.santorini);
  if (ESEMPI[h]) return componi(ESEMPI[h]);
  if (/^[01]/.test(h)) return componi(await decodifica(h));
  throw new Error("link");
}

/* ---------- Pezzi comuni ai disegni ---------- */
const f1 = n => n.toFixed(1);
const nuvola = (x, y, s, cl) => `<g class="${cl}"><rect x="${x}" y="${y}" width="${180 * s}" height="${13 * s}" rx="${6.5 * s}"/><rect x="${x + 40 * s}" y="${y - 10 * s}" width="${110 * s}" height="${14 * s}" rx="${7 * s}"/><rect x="${x + 90 * s}" y="${y + 9 * s}" width="${150 * s}" height="${10 * s}" rx="${5 * s}"/></g>`;
function titoloManifesto(M, colOmbra) {
  const n = M.manifesto || M.nome.toUpperCase(), fs = n.length > 7 ? 78 : 112, ls = n.length > 7 ? 9 : 22;
  return `<g class="titolo"><text x="${352 + ls / 2}" y="152" text-anchor="middle" font-family="'Josefin Sans', Futura, sans-serif" font-weight="600" font-size="${fs}" letter-spacing="${ls}" fill="${colOmbra}" fill-opacity=".35">${esc(n)}</text>
    <text x="${350 + ls / 2}" y="149" text-anchor="middle" font-family="'Josefin Sans', Futura, sans-serif" font-weight="600" font-size="${fs}" letter-spacing="${ls}" fill="#fbf1e3">${esc(n)}</text></g>
    <g class="titolo sottotitolo"><text x="354.5" y="195.5" text-anchor="middle" font-family="'Josefin Sans', Futura, sans-serif" font-weight="400" font-size="19" letter-spacing="7" fill="${colOmbra}" fill-opacity=".45">${esc(M.luogo.toUpperCase())}</text><text x="353" y="194" text-anchor="middle" font-family="'Josefin Sans', Futura, sans-serif" font-weight="400" font-size="19" letter-spacing="7" fill="#f8dcb8">${esc(M.luogo.toUpperCase())}</text></g>`;
}
function francobollo(id, interno, alto, altoFont, basso, valore) {
  let fori = "";
  for (let x = 0; x <= 100; x += 8.33) fori += `<circle cx="${x.toFixed(1)}" cy="0" r="3"/><circle cx="${x.toFixed(1)}" cy="124" r="3"/>`;
  for (let y = 8.27; y < 124; y += 8.27) fori += `<circle cx="0" cy="${y.toFixed(1)}" r="3"/><circle cx="100" cy="${y.toFixed(1)}" r="3"/>`;
  return `<svg viewBox="-3 -3 106 130" aria-hidden="true"><defs><mask id="${id}-fori"><rect x="-3" y="-3" width="106" height="130" fill="#fff"/><g fill="#000">${fori}</g></mask></defs>
    <g mask="url(#${id}-fori)"><rect x="-3" y="-3" width="106" height="130" fill="#fbf6ec"/>${interno}
    <text x="50" y="27" text-anchor="middle" font-family="${altoFont}" font-size="17" letter-spacing="2" fill="#fbf1e3">${esc(alto)}</text>
    <text x="50" y="38" text-anchor="middle" font-family="'Josefin Sans', Arial, sans-serif" font-size="6.5" letter-spacing="2.4" fill="#fbf1e3">${esc(basso)}</text>
    <text x="88" y="110" text-anchor="end" font-family="'Josefin Sans', Arial, sans-serif" font-weight="600" font-size="9.5" fill="#fbf1e3">${esc(valore)}</text>
    <rect x="8" y="8" width="84" height="108" fill="none" stroke="#fbf6ec" stroke-width="1.2" stroke-opacity=".7"/></g></svg>`;
}

/* =====================================================================
   ILLUSTRAZIONE · SANTORINI (tutto disegnato in codice)
   viewBox 700 × 1000: cielo e titolo in alto, la caldera a sinistra, il mare al tramonto a destra.
   ===================================================================== */
function scenaSantorini(M) {
  const R = rng(2027), O = [];
  const CR = [[-10, 470], [60, 462], [130, 474], [200, 500], [270, 536], [330, 575], [380, 616], [420, 662], [450, 722], [474, 800], [494, 900], [506, 1010]];
  const cresta = x => { for (let i = 0; i < CR.length - 1; i++) { const [a, b] = CR[i], [c, d] = CR[i + 1]; if (x <= c) return b + (d - b) * (x - a) / (c - a); } return 1010; };
  const profondita = x => Math.max(0, 330 - x * .6);
  const bordo = y => { for (let i = 3; i < CR.length - 1; i++) { const [a, b] = CR[i], [c, d] = CR[i + 1]; if (y <= d) return a + (c - a) * (y - b) / (d - b); } return 506; };
  const f1 = n => n.toFixed(1);

  // cielo
  O.push(`<defs>
    <linearGradient id="cielo-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2d5a98"/><stop offset=".45" stop-color="#7fa5c9"/><stop offset=".8" stop-color="#f0c48e"/><stop offset="1" stop-color="#f8d9a2"/></linearGradient>
    <linearGradient id="cielo-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#191c4a"/><stop offset=".36" stop-color="#47387a"/><stop offset=".64" stop-color="#b0577c"/><stop offset=".86" stop-color="#ee8a68"/><stop offset="1" stop-color="#f6b56f"/></linearGradient>
    <linearGradient id="mare" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a6fa8"/><stop offset=".25" stop-color="#25478a"/><stop offset="1" stop-color="#0f2452"/></linearGradient>
    <radialGradient id="sole-g"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".7" stop-color="#ffc979"/><stop offset="1" stop-color="#f6955a"/></radialGradient>
    <radialGradient id="alone"><stop offset="0" stop-color="#ffd98f" stop-opacity=".75"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>
    <clipPath id="sopra-orizzonte"><rect x="0" y="0" width="700" height="601"/></clipPath>
    <linearGradient id="cupola" x1="0" x2="1"><stop offset="0" stop-color="#163a78"/><stop offset=".55" stop-color="#1f4e9c"/><stop offset="1" stop-color="#3c72c4"/></linearGradient>
  </defs>`);
  O.push(`<rect width="700" height="602" fill="url(#cielo-a)"/><rect class="cielo-sera" width="700" height="602" fill="url(#cielo-b)"/>`);
  // stelle
  let st = "";
  for (let i = 0; i < 46; i++) { const x = R() * 700, y = R() * 330; st += `<circle class="stella" cx="${f1(x)}" cy="${f1(y)}" r="${f1(.6 + R() * 1.3)}" fill="#fff6e0" style="--d:${f1(9 + R() * 6)}s;--t:${f1(R() * 3)}s"/>`; }
  O.push(st);
  // sole e alone
  O.push(`<g clip-path="url(#sopra-orizzonte)"><g class="sole"><circle cx="540" cy="540" r="150" fill="url(#alone)"/><circle cx="540" cy="540" r="40" fill="url(#sole-g)"/></g></g>`);
  // nuvole: strisce morbide, da manifesto
  const nuvola = (x, y, s, cl) => `<g class="${cl}"><rect x="${x}" y="${y}" width="${180 * s}" height="${13 * s}" rx="${6.5 * s}"/><rect x="${x + 40 * s}" y="${y - 10 * s}" width="${110 * s}" height="${14 * s}" rx="${7 * s}"/><rect x="${x + 90 * s}" y="${y + 9 * s}" width="${150 * s}" height="${10 * s}" rx="${5 * s}"/></g>`;
  O.push(`<g class="nuvole-a">${nuvola(380, 470, 1, "nv")}${nuvola(70, 300, .8, "nv2")}</g><g class="nuvole-b">${nuvola(470, 410, .7, "nv2")}${nuvola(250, 240, .6, "nv")}</g>`);
  // uccelli
  O.push(`<g class="uccelli" fill="none" stroke="#3a2a4a" stroke-width="2" stroke-linecap="round"><path d="M300 300 q6 -6 12 0 q6 -6 12 0"/><path d="M332 288 q4 -4 8 0 q4 -4 8 0"/></g>`);
  // isole lontane
  O.push(`<path class="isola" d="M572 601 C590 590 606 586 622 588 C640 584 662 578 700 582 V602 H572 Z"/><path class="isola" opacity=".8" d="M360 601 C380 595 400 593 420 596 C434 594 446 596 458 601 Z"/>`);
  // mare
  O.push(`<rect y="600" width="700" height="400" fill="url(#mare)"/>`);
  let o1 = "", o2 = "";
  for (let i = 0; i < 70; i++) {
    const y = 608 + Math.pow(R(), 1.4) * 390, k = (y - 600) / 400, x = 300 + R() * 420, l = 8 + k * 46 * (.6 + R() * .6);
    const p = `<path d="M${f1(x)} ${f1(y)} h${f1(l)}" stroke-width="${f1(1 + k * 2.4)}"/>`; (i % 2 ? o1 += p : o2 += p);
  }
  O.push(`<g stroke="#7ea0d0" stroke-opacity=".5" stroke-linecap="round" fill="none"><g class="onde-1">${o1}</g><g class="onde-2">${o2}</g></g>`);
  let rf = "";
  for (let y = 607; y < 980; y += 8 + (y - 600) * .03) {
    const k = (y - 600) / 400, w = 14 + k * 80 * (.5 + R() * .7), x = 540 - w / 2 + (R() - .5) * 18 * (1 + k * 2);
    rf += `<rect class="scintilla" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(1.6 + k * 2.6)}" rx="1.5" style="--t:${f1(R() * 2)}s"/>`;
  }
  O.push(`<g class="riflesso" fill="#ffd590">${rf}</g>`);
  // barca a vela
  O.push(`<g class="barca"><g transform="translate(690 742)"><path d="M-22 0 H24 L17 8 H-16 Z" fill="#f5ecdf"/><path d="M0 -2 V-44 L20 -4 Z" fill="#fbf3e4"/><path d="M-3 -4 V-36 L-19 -4 Z" fill="#e7d7cc"/><path d="M-30 11 h70" stroke="#9bb6dc" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/></g></g>`);

  // scogliera della caldera, a strati
  let cr = `M-10 1010 L-10 ${CR[0][1]}`; for (let x = -10; x <= 506; x += 8) cr += ` L${x} ${f1(cresta(x))}`; cr += " L506 1010 Z";
  O.push(`<clipPath id="caldera"><path d="${cr}"/></clipPath><path d="${cr}" fill="#9a4632"/>`);
  const strati = [[60, "#b45d40"], [110, "#7a3a2e"], [150, "#c98d5e"], [175, "#4c2833"], [230, "#a9573c"], [290, "#d39a6a"], [330, "#6f3530"], [400, "#b9653f"], [470, "#57303a"]];
  let s = "";
  strati.forEach(([d, col], k) => {
    const sp = 14 + (k % 3) * 9; let p = "M-10 " + f1(cresta(-10) + d);
    for (let x = -10; x <= 520; x += 10) p += ` L${x} ${f1(cresta(Math.min(x, 500)) + d + Math.sin(x / 37 + k) * 4)}`;
    for (let x = 520; x >= -10; x -= 10) p += ` L${x} ${f1(cresta(Math.min(x, 500)) + d + sp + Math.sin(x / 29 + k * 2) * 3)}`;
    s += `<path d="${p} Z" fill="${col}"/>`;
  });
  O.push(`<g clip-path="url(#caldera)">${s}</g>`);

  // il paese: case bianche a gradoni lungo la cresta
  let case_ = "", winN = 0;
  const finestra = (x, y, w, h) => `<rect class="w" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="1" style="--d:${f1(3 + R() * 9)}s"/>`;
  const fiori = (x, y) => { let g = ""; for (let i = 0; i < 7; i++) g += `<circle cx="${f1(x + (R() - .5) * 16)}" cy="${f1(y + (R() - .5) * 12)}" r="${f1(2.2 + R() * 2.6)}" fill="${R() < .5 ? "#c8467a" : "#e2709d"}"/>`; return g; };
  const cupole = [[2, 196, 58, true], [0, 292, 50, false], [4, 138, 46, false]];
  for (let k = 0; k < 11; k++) {
    let x = -16 + (k * 23) % 40;
    while (x < 480) {
      const w = 30 + R() * 34, xc = x + w / 2;
      if (k * 30 > profondita(xc) - 10) { x += w; continue; }
      const cup = cupole.find(c => c[0] === k && Math.abs(c[1] - xc) < 34);
      if (R() < .1 && !cup) { x += w * .6; continue; }
      const h = cup ? 46 : 24 + R() * 22, yb = cresta(xc) + k * 30 + 16, y = yb - h;
      if (!cup && x + w > bordo(yb + 4) - 4) { x += w; continue; }
      if (!cup && k < 2 && x < 132 && x + w > 62) { x += w; continue; } // lascia libero il mulino
      if (cup) {
        const W = cup[2], X = cup[1] - W / 2, r = W * .36;
        case_ += `<rect class="cl" x="${f1(X)}" y="${f1(y)}" width="${f1(W)}" height="${f1(h + 4)}"/><rect class="cs" x="${f1(X)}" y="${f1(y)}" width="${f1(W * .26)}" height="${f1(h + 4)}"/>`;
        case_ += `<rect class="cl" x="${f1(cup[1] - r - 3)}" y="${f1(y - 9)}" width="${f1(2 * r + 6)}" height="10"/>`;
        case_ += `<path d="M${f1(cup[1] - r)} ${f1(y - 8)} a${f1(r)} ${f1(r * 1.05)} 0 0 1 ${f1(2 * r)} 0 Z" fill="url(#cupola)"/>`;
        case_ += `<path d="M${f1(cup[1])} ${f1(y - 8 - r * 1.05)} v-12 M${f1(cup[1] - 4)} ${f1(y - 14 - r * 1.05)} h8" stroke="#f5e6c8" stroke-width="2"/>`;
        case_ += `<path d="M${f1(cup[1] - 6)} ${f1(yb - 2)} v-16 a6 6 0 0 1 12 0 v16 Z" fill="#2d5ea6"/>`;
        if (cup[3]) { // campanile con la campana
          const bx = X + W + 2;
          case_ += `<rect class="cl" x="${f1(bx)}" y="${f1(y - 34)}" width="22" height="${f1(h + 38)}"/><rect class="cs" x="${f1(bx)}" y="${f1(y - 34)}" width="6" height="${f1(h + 38)}"/>`;
          case_ += `<path d="M${f1(bx + 5)} ${f1(y - 6)} v-18 a6 6 0 0 1 12 0 v18 Z" fill="#3b2c45"/>`;
          case_ += `<path d="M${f1(bx - 2)} ${f1(y - 34)} h26 M${f1(bx + 4)} ${f1(y - 34)} a7 7 0 0 1 14 0" stroke="#f8efe0" stroke-width="3" fill="#fbf3e4"/>`;
          case_ += `<path d="M${f1(bx + 11)} ${f1(y - 41)} v-9 M${f1(bx + 7.5)} ${f1(y - 46)} h7" stroke="#f5e6c8" stroke-width="1.6"/>`;
          case_ += `<g class="campana-b"><path d="M${f1(bx + 7)} ${f1(y - 9)} q0 -9 4 -10 q4 1 4 10 Z" fill="#d6a24e"/></g>`;
        }
        x = X + W + (cup[3] ? 24 : 0); continue;
      }
      case_ += `<rect class="cl" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h + 6)}"/><rect class="cs" x="${f1(x)}" y="${f1(y)}" width="${f1(w * .24)}" height="${f1(h + 6)}"/>`;
      const tetto = R();
      if (tetto < .32) case_ += `<path class="cl" d="M${f1(x)} ${f1(y + 1)} a${f1(w / 2)} ${f1(Math.min(10, w / 4))} 0 0 1 ${f1(w)} 0 Z"/>`;
      else if (tetto < .5) case_ += `<rect class="cs" x="${f1(x - 1)}" y="${f1(y - 2)}" width="${f1(w + 2)}" height="3"/>`;
      const nf = w > 46 ? 2 : 1;
      for (let j = 0; j < nf; j++) {
        const fx = x + w * (.36 + j * .34) + (R() - .5) * 4, fy = y + h * .3 + R() * 4;
        if (R() < .28) case_ += `<rect x="${f1(fx - 1.5)}" y="${f1(fy - 1.5)}" width="9" height="11" fill="#2d5ea6"/>`;
        case_ += finestra(fx, fy, 6, 8); winN++;
      }
      if (R() < .25) case_ += `<path d="M${f1(x + w * .62)} ${f1(yb + 6)} v-12 a3.5 3.5 0 0 1 7 0 v12 Z" fill="${R() < .6 ? "#2d5ea6" : "#4d3c56"}"/>`;
      if (R() < .16) case_ += fiori(R() < .5 ? x + 4 : x + w - 4, y + 6);
      x += w + (R() - .5) * 10;
    }
  }
  // mulino a vento sulla cresta
  const mx = 98, my = 404;
  let pale = "";
  for (let i = 0; i < 6; i++) { const a = i * 60; pale += `<g transform="rotate(${a} ${mx} ${my})"><path d="M${mx} ${my} V${my - 56}" stroke="#5a4136" stroke-width="2"/><path d="M${mx + 1} ${my - 14} L${mx + 15} ${my - 20} L${mx + 13} ${my - 54} L${mx + 1} ${my - 54} Z" fill="#f6eadb" opacity=".95"/></g>`; }
  const mulino = `<path class="cl" d="M${mx - 20} 476 L${mx - 16} ${my + 2} H${mx + 16} L${mx + 20} 476 Z"/><path class="cs" d="M${mx - 20} 476 L${mx - 16} ${my + 2} H${mx - 9} L${mx - 11} 476 Z"/>
    <path d="M${mx - 19} ${my + 4} Q${mx} ${my - 26} ${mx + 19} ${my + 4} Z" fill="#8c6a48"/><path d="M${mx - 4} 476 v-16 a4 4 0 0 1 8 0 v16 Z" fill="#2d5ea6"/>${finestra(mx + 4, my + 24, 6, 8)}
    <g class="pale">${pale}<circle cx="${mx}" cy="${my}" r="3.5" fill="#5a4136"/></g>`;
  // lampioni lungo i vicoli
  let lamp = "";
  for (let k = 1; k < 6; k += 2) for (let x = 20 + k * 9; x < 470; x += 46 + R() * 30) {
    const ly = cresta(x) + k * 30 + 22;
    if (k * 30 > profondita(x) - 20 || x > bordo(ly) - 8) continue;
    lamp += `<circle class="lampione" cx="${f1(x)}" cy="${f1(ly)}" r="2.6" fill="#ffe2a0" style="--d:${f1(4 + R() * 8)}s"/>`;
  }
  O.push(`<g>${mulino}${case_}</g><g>${lamp}</g>`);

  // un ramo di buganvillea che entra dall'angolo
  let ramo = `<path d="M712 -6 C668 16 640 26 600 30 C580 32 566 40 552 54" fill="none" stroke="#5b3a2c" stroke-width="3" stroke-linecap="round"/>`;
  [[690, 10], [664, 22], [640, 28], [616, 32], [592, 36], [572, 44], [556, 56]].forEach(([x, y], i) => {
    ramo += `<ellipse cx="${x - 4}" cy="${y + 8}" rx="9" ry="4.5" transform="rotate(${30 + i * 9} ${x - 4} ${y + 8})" fill="#3f6b4a"/>`;
    for (let j = 0; j < 5; j++) ramo += `<circle cx="${f1(x + (R() - .5) * 18)}" cy="${f1(y + 4 + R() * 18)}" r="${f1(3 + R() * 3)}" fill="${R() < .5 ? "#c8467a" : "#e2709d"}"/>`;
  });
  O.push(`<g class="ramo">${ramo}</g>`);

  O.push(titoloManifesto(M, "#14163b"));
  return `<svg class="scena-svg" viewBox="0 0 700 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(M.nome)}: il paese bianco sulla caldera al tramonto, il mare e una barca a vela">${O.join("")}</svg>`;
}

function francobolloSantorini(M) {
  let fori = "";
  for (let x = 0; x <= 100; x += 8.33) fori += `<circle cx="${x.toFixed(1)}" cy="0" r="3"/><circle cx="${x.toFixed(1)}" cy="124" r="3"/>`;
  for (let y = 8.27; y < 124; y += 8.27) fori += `<circle cx="0" cy="${y.toFixed(1)}" r="3"/><circle cx="100" cy="${y.toFixed(1)}" r="3"/>`;
  return `<svg viewBox="-3 -3 106 130" aria-hidden="true"><defs>
    <linearGradient id="fb-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b4f8e"/><stop offset=".6" stop-color="#e5877a"/><stop offset="1" stop-color="#f7c07a"/></linearGradient>
    <mask id="fb-fori"><rect x="-3" y="-3" width="106" height="130" fill="#fff"/><g fill="#000">${fori}</g></mask></defs>
    <g mask="url(#fb-fori)"><rect x="-3" y="-3" width="106" height="130" fill="#fbf6ec"/>
    <rect x="8" y="8" width="84" height="108" fill="url(#fb-cielo)"/>
    <circle cx="66" cy="72" r="11" fill="#ffe2a0"/>
    <rect x="8" y="78" width="84" height="38" fill="#1c3f7e"/>
    <path d="M8 84 H40 V70 H52 V84 H58 V116 H8 Z" fill="#fbf3e4"/>
    <path d="M14 70 a12 12 0 0 1 24 0 Z" fill="#1f4e9c"/><rect x="13" y="70" width="26" height="14" fill="#fbf3e4"/>
    <path d="M26 58 v-6 M23.5 55 h5" stroke="#fbf3e4" stroke-width="1.4"/>
    <rect x="18" y="74" width="4" height="6" fill="#1f4e9c"/><rect x="30" y="74" width="4" height="6" fill="#1f4e9c"/><rect x="45" y="75" width="3.5" height="5" fill="#1f4e9c"/>
    <text x="50" y="27" text-anchor="middle" font-family="'GFS Didot', Didot, Georgia, serif" font-size="17" letter-spacing="2" fill="#fbf1e3">${esc(M.paese)}</text>
    <text x="50" y="38" text-anchor="middle" font-family="'Josefin Sans', Arial, sans-serif" font-size="6.5" letter-spacing="2.4" fill="#fbf1e3">${esc(M.paeseLatino)}</text>
    <text x="88" y="110" text-anchor="end" font-family="'Josefin Sans', Arial, sans-serif" font-weight="600" font-size="9.5" fill="#fbf1e3">${esc(M.valore)}</text>
    <rect x="8" y="8" width="84" height="108" fill="none" stroke="#fbf6ec" stroke-width="1.2" stroke-opacity=".7"/></g></svg>`;
}

/* =====================================================================
   ILLUSTRAZIONE · PARIGI (tutto disegnato in codice)
   viewBox 700 × 1000: cielo e titolo in alto, la torre sulla riva lontana,
   la Senna con il ponte e il battello, i tetti di zinco in primo piano.
   La torre è disegnata al tramonto, senza la sua illuminazione notturna.
   ===================================================================== */
function scenaParigi(M) {
  const R = rng(1889), O = [];
  const finestra = (x, y, w, h) => `<rect class="w" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}" rx="${f1(Math.min(w, h) * .18)}" style="--d:${f1(3 + R() * 10)}s"/>`;
  O.push(`<defs>
    <linearGradient id="p-cielo-a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3d5c92"/><stop offset=".42" stop-color="#93a3c6"/><stop offset=".76" stop-color="#f0c2a0"/><stop offset="1" stop-color="#f8d8ac"/></linearGradient>
    <linearGradient id="p-cielo-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a1f4b"/><stop offset=".38" stop-color="#463b78"/><stop offset=".66" stop-color="#b0607f"/><stop offset=".87" stop-color="#ec9474"/><stop offset="1" stop-color="#f4bd86"/></linearGradient>
    <linearGradient id="p-senna" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7d8fb0"/><stop offset=".25" stop-color="#46608a"/><stop offset="1" stop-color="#1e2d4e"/></linearGradient>
    <radialGradient id="p-sole"><stop offset="0" stop-color="#ffe9a8"/><stop offset=".7" stop-color="#ffc979"/><stop offset="1" stop-color="#f6955a"/></radialGradient>
    <radialGradient id="p-alone"><stop offset="0" stop-color="#ffd98f" stop-opacity=".7"/><stop offset="1" stop-color="#ffb070" stop-opacity="0"/></radialGradient>
    <pattern id="p-traliccio" width="8" height="8" patternUnits="userSpaceOnUse"><path d="M0 0 L8 8 M8 0 L0 8" stroke="#f6d2a8" stroke-width=".9"/></pattern>
  </defs>`);
  // cielo, stelle, sole, nuvole
  O.push(`<rect width="700" height="720" fill="url(#p-cielo-a)"/><rect class="cielo-sera" width="700" height="720" fill="url(#p-cielo-b)"/>`);
  let st = "";
  for (let i = 0; i < 44; i++) st += `<circle class="stella" cx="${f1(R() * 700)}" cy="${f1(R() * 330)}" r="${f1(.6 + R() * 1.3)}" fill="#fff6e0" style="--d:${f1(9 + R() * 6)}s;--t:${f1(R() * 3)}s"/>`;
  O.push(st);
  O.push(`<g class="sole"><circle cx="175" cy="560" r="150" fill="url(#p-alone)"/><circle cx="175" cy="560" r="36" fill="url(#p-sole)"/></g>`);
  O.push(`<g class="nuvole-a">${nuvola(330, 455, 1, "nv")}${nuvola(40, 300, .8, "nv2")}</g><g class="nuvole-b">${nuvola(450, 380, .7, "nv2")}${nuvola(200, 250, .6, "nv")}</g>`);
  O.push(`<g class="uccelli" fill="none" stroke="#3a2a4a" stroke-width="2" stroke-linecap="round"><path d="M250 330 q6 -6 12 0 q6 -6 12 0"/><path d="M282 318 q4 -4 8 0 q4 -4 8 0"/></g>`);

  // la collina di Montmartre con la basilica, lontana
  O.push(`<g class="isola"><path d="M-10 648 C40 612 120 596 190 606 C230 612 262 632 290 650 V720 H-10 Z"/>
    <rect x="92" y="584" width="62" height="20"/><rect x="104" y="572" width="38" height="14"/>
    <path d="M106 573 a17 21 0 0 1 34 0 Z"/><rect x="121" y="544" width="4" height="10"/><path d="M119 555 h8 l-1 -3 h-6 Z"/>
    <path d="M93 585 a8 10 0 0 1 16 0 Z"/><path d="M137 585 a8 10 0 0 1 16 0 Z"/>
    <rect x="158" y="566" width="11" height="38"/><path d="M157 567 a6.5 8 0 0 1 13 0 Z"/></g>`);
  // profilo lontano della città
  let lont = "";
  for (let x = 250; x < 710;) { const w = 24 + R() * 40, h = 14 + R() * 22; lont += `<rect x="${f1(x)}" y="${f1(660 - h)}" width="${f1(w)}" height="${f1(h + 60)}"/>`; x += w - 2; }
  O.push(`<g class="isola" opacity=".75">${lont}</g>`);

  // la torre
  const TX = 474, TB = 706, sx = [], dx = [];
  sx.push([-1.4, 214], [-1.4, 258], [-7, 258], [-7, 272], [-5, 272]);
  for (let y = 284; y <= 466; y += 12) sx.push([-(5 + 17 * Math.pow((y - 272) / 194, 1.7)), y]);
  sx.push([-22, 470]);
  for (let y = 482; y <= 584; y += 10) sx.push([-(22 + 26 * Math.pow((y - 470) / 114, 1.5)), y]);
  for (let y = 598; y <= TB; y += 9) sx.push([-(48 + 50 * Math.pow((y - 590) / (TB - 590), 1.7)), y]);
  sx.forEach(([x, y]) => dx.unshift([-x, y]));
  const contorno = "M" + sx.concat(dx).map(([x, y]) => `${f1(TX + x)} ${f1(y)}`).join(" L") + " Z";
  const arco = `M${TX - 58} ${TB} A58 70 0 0 1 ${TX + 58} ${TB} Z`;
  const torre = `${contorno} ${arco}`;
  O.push(`<g><path class="torre" fill-rule="evenodd" d="${torre}"/><path class="traliccio" fill-rule="evenodd" fill="url(#p-traliccio)" d="${torre}"/>
    <rect class="torre" x="${TX - 31}" y="466" width="62" height="9"/>
    <rect class="torre" x="${TX - 64}" y="584" width="128" height="14"/>
    <path d="M${TX - 62} 598 ${Array.from({ length: 8 }, (_, i) => `a8 7 0 0 0 15.5 0`).join(" ")}" fill="none" class="traliccio-l" stroke-width="1.4"/>
    <rect class="torre" x="${TX - 9}" y="254" width="18" height="6"/></g>`);

  // la riva lontana: palazzi, la cupola dorata degli Invalides, gli alberi
  let riva = "";
  for (let x = -10; x < 710;) {
    const w = 34 + R() * 46, h = 26 + R() * 26, y = 712 - h;
    if (x > 360 && x < 430) { x += 20; continue; }
    riva += `<rect class="riva" x="${f1(x)}" y="${f1(y)}" width="${f1(w)}" height="${f1(h)}"/><path class="riva-tetto" d="M${f1(x)} ${f1(y)} L${f1(x + 6)} ${f1(y - 8)} H${f1(x + w - 6)} L${f1(x + w)} ${f1(y)} Z"/>`;
    for (let fx = x + 5; fx < x + w - 6; fx += 9) for (let fy = y + 6; fy < 704; fy += 11) if (R() < .55) riva += finestra(fx, fy, 3.4, 5);
    x += w + 1;
  }
  O.push(`<g>${riva}</g>`);
  O.push(`<g><rect class="riva" x="280" y="640" width="62" height="40"/><rect class="riva" x="292" y="628" width="38" height="14"/>
    <path class="oro" d="M290 629 a21 26 0 0 1 42 0 Z"/><rect class="oro" x="308" y="594" width="6" height="12"/><path class="oro" d="M311 584 l2.5 11 h-5 Z"/>
    ${[296, 304, 318, 326].map(x => `<rect class="oro-l" x="${x}" y="608" width="1.6" height="18"/>`).join("")}</g>`);
  let alberi = "";
  for (let x = -14; x < 720; x += 13 + R() * 10) alberi += `<circle class="albero" cx="${f1(x)}" cy="${f1(704 + R() * 6)}" r="${f1(9 + R() * 7)}"/>`;
  O.push(`<g>${alberi}</g><rect class="cl" x="0" y="710" width="700" height="9"/><rect class="cs" x="0" y="717" width="700" height="3"/>`);

  // la Senna
  O.push(`<rect y="720" width="700" height="280" fill="url(#p-senna)"/>`);
  let o1 = "", o2 = "";
  for (let i = 0; i < 46; i++) {
    const y = 728 + R() * 120, k = (y - 720) / 120, x = R() * 700, l = 10 + k * 34 * (.6 + R() * .6);
    const p = `<path d="M${f1(x)} ${f1(y)} h${f1(l)}" stroke-width="${f1(1 + k * 1.8)}"/>`; (i % 2 ? o1 += p : o2 += p);
  }
  O.push(`<g stroke="#9fb3d4" stroke-opacity=".45" stroke-linecap="round" fill="none"><g class="onde-1">${o1}</g><g class="onde-2">${o2}</g></g>`);
  // riflessi dei lampioni sull'acqua
  let rif = "";
  [40, 120, 200, 280, 520, 600, 680].forEach(x => { for (let j = 0; j < 4; j++) rif += `<rect class="lampione scintilla" x="${f1(x - 5 + (R() - .5) * 6)}" y="${f1(746 + j * 9)}" width="${f1(10 - j * 1.6)}" height="2" rx="1" fill="#ffd590" style="--d:${f1(5 + R() * 5)}s;--t:${f1(R() * 2)}s"/>`; });
  O.push(`<g>${rif}</g>`);
  // il battello
  O.push(`<g class="battello"><g transform="translate(-150 786)"><path d="M0 0 H118 L110 10 H8 Z" fill="#26304a"/><rect x="12" y="-13" width="90" height="13" rx="3" fill="#e9e3d6"/>
    ${Array.from({ length: 8 }, (_, i) => `<rect class="w" x="${16 + i * 10.6}" y="-10" width="7" height="7" rx="1" style="--d:${f1(4 + i * .3)}s"/>`).join("")}
    <rect x="12" y="-15" width="90" height="2.5" fill="#26304a"/><path d="M-10 13 h140" stroke="#9fb3d4" stroke-opacity=".5" stroke-width="2" stroke-linecap="round"/></g></g>`);
  // il ponte di pietra
  let archi = "";
  for (let i = 0; i < 5; i++) { const cx = 22 + i * 76; archi += ` M${cx - 30} 790 V768 A30 22 0 0 1 ${cx + 30} 768 V790 Z`; }
  let lamp = "";
  for (let x = 18; x < 340; x += 38) lamp += `<rect x="${x - 1}" y="718" width="2" height="12" fill="#2a2433"/><circle class="lampione" cx="${x}" cy="717" r="3" fill="#ffe2a0" style="--d:${f1(4 + R() * 6)}s"/>`;
  O.push(`<g><path class="ponte" fill-rule="evenodd" d="M-10 734 H346 L352 790 H-10 Z ${archi}"/><rect class="cs" x="-10" y="730" width="358" height="6"/>
    <path d="M-10 731 H348" stroke="#2a2433" stroke-width="3" stroke-dasharray="1.4 3.2"/>${lamp}</g>`);

  // i tetti di Parigi, in primo piano
  const edificio = (x, w, yb, s) => {
    let g = "";
    const hM = 40 * s, rient = 13 * s;
    g += `<rect class="cl" x="${f1(x)}" y="${f1(yb)}" width="${f1(w)}" height="${f1(1000 - yb)}"/><rect class="cs" x="${f1(x)}" y="${f1(yb)}" width="${f1(5 * s)}" height="${f1(1000 - yb)}"/>`;
    const n = Math.max(2, Math.floor((w - 12 * s) / (25 * s))), passo = (w - 12 * s) / n;
    for (let fy = yb + 14 * s, piano = 0; fy < 1000; fy += 46 * s, piano++) {
      for (let i = 0; i < n; i++) g += finestra(x + 6 * s + passo * i + (passo - 10 * s) / 2, fy, 10 * s, 22 * s);
      if (piano % 2 === 0) g += `<path d="M${f1(x + 3)} ${f1(fy + 19 * s)} H${f1(x + w - 3)}" stroke="#2a2433" stroke-width="${f1(7 * s)}" stroke-dasharray="${f1(1 * s)} ${f1(2.6 * s)}"/><rect x="${f1(x + 2)}" y="${f1(fy + 22 * s)}" width="${f1(w - 4)}" height="${f1(2.2 * s)}" fill="#2a2433"/>`;
    }
    g += `<rect class="cornice" x="${f1(x - 3 * s)}" y="${f1(yb - 3 * s)}" width="${f1(w + 6 * s)}" height="${f1(5 * s)}"/>`;
    g += `<path class="zinco" d="M${f1(x - 2 * s)} ${f1(yb - 3 * s)} L${f1(x + rient)} ${f1(yb - hM)} H${f1(x + w - rient)} L${f1(x + w + 2 * s)} ${f1(yb - 3 * s)} Z"/>`;
    let cuciture = "";
    for (let xx = x + rient + 4 * s; xx < x + w - rient; xx += 7 * s) { const t = (xx - (x + w / 2)) / (w / 2); cuciture += `M${f1(xx)} ${f1(yb - hM)} L${f1(xx + t * (rient - 2 * s))} ${f1(yb - 3 * s)} `; }
    g += `<path d="${cuciture}" stroke="#fff" stroke-opacity=".16" stroke-width="${f1(.8 * s)}"/><rect class="colmo" x="${f1(x + rient)}" y="${f1(yb - hM - 2 * s)}" width="${f1(w - 2 * rient)}" height="${f1(3 * s)}"/>`;
    const na = Math.max(1, Math.floor((w - 2 * rient) / (34 * s)));
    for (let i = 0; i < na; i++) {
      const cx = x + rient + (w - 2 * rient) * (i + .5) / na, ay = yb - hM + 10 * s;
      g += `<rect class="cl" x="${f1(cx - 7 * s)}" y="${f1(ay)}" width="${f1(14 * s)}" height="${f1(hM - 12 * s)}"/><path class="cl" d="M${f1(cx - 9 * s)} ${f1(ay + 1)} a${f1(9 * s)} ${f1(7 * s)} 0 0 1 ${f1(18 * s)} 0 Z"/>` + finestra(cx - 4 * s, ay + 4 * s, 8 * s, hM - 20 * s);
    }
    const nc = R() < .5 ? 2 : 1;
    for (let j = 0; j < nc; j++) {
      const cw = (16 + R() * 14) * s, ch = (24 + R() * 22) * s, cx = x + w * (j ? .62 + R() * .2 : .12 + R() * .2), top = yb - hM - ch + 8 * s;
      g += `<rect class="mattone" x="${f1(cx)}" y="${f1(top)}" width="${f1(cw)}" height="${f1(ch)}"/><rect class="colmo" x="${f1(cx - 1.5 * s)}" y="${f1(top)}" width="${f1(cw + 3 * s)}" height="${f1(3 * s)}"/>`;
      for (let px = cx + 2 * s; px < cx + cw - 3 * s; px += 6 * s) g += `<rect x="${f1(px)}" y="${f1(top - 8 * s)}" width="${f1(4 * s)}" height="${f1(8 * s)}" fill="#c96a3c"/><rect x="${f1(px - .5 * s)}" y="${f1(top - 9 * s)}" width="${f1(5 * s)}" height="${f1(1.6 * s)}" fill="#8f4a30"/>`;
    }
    return g;
  };
  let fila = "";
  for (let x = -24, s = .72; x < 720;) { const w = 120 + R() * 70; fila += edificio(x, w, 852 + R() * 16, s); x += w + 10 * s; }
  let davanti = edificio(-30, 250, 912, 1) + edificio(440, 290, 930, 1);
  O.push(`<g>${fila}</g><g>${davanti}</g>`);
  O.push(titoloManifesto(M, "#14163b"));
  return `<svg class="scena-svg" viewBox="0 0 700 1000" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(M.nome)}: i tetti di zinco, la Senna con il ponte e il battello, la torre Eiffel al tramonto">${O.join("")}</svg>`;
}

function francobolloParigi(M) {
  const interno = `<defs><linearGradient id="pf-cielo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3b4f8a"/><stop offset=".6" stop-color="#d98a8a"/><stop offset="1" stop-color="#f4c58a"/></linearGradient></defs>
    <rect x="8" y="8" width="84" height="108" fill="url(#pf-cielo)"/>
    <circle cx="30" cy="80" r="9" fill="#ffe2a0"/>
    <path d="M62 44 L63 50 L65 50 C66 64 69 74 74 86 L77 86 C80 96 84 104 88 116 H78 C76 108 72 103 67 103 C62 103 58 108 56 116 H46 C50 104 54 96 57 86 L60 86 C65 74 66 64 67 50 Z" fill="#2c2540" transform="translate(-4 0)"/>
    <path d="M8 98 H30 L34 92 H48 L52 98 H60 V116 H8 Z" fill="#6f7c98"/><rect x="8" y="104" width="52" height="12" fill="#e9dcc4"/>
    <rect x="12" y="107" width="3" height="5" fill="#a8323a"/><rect x="20" y="107" width="3" height="5" fill="#a8323a"/><rect x="28" y="107" width="3" height="5" fill="#a8323a"/>`;
  return francobollo("pf", interno, M.paese, "'Josefin Sans', Arial, sans-serif", M.paeseLatino, M.valore);
}
