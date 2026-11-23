// Rigenera cartolina/anteprima.jpg (1200×630, l'immagine dell'anteprima su WhatsApp).
// Dalla cartella del repository: python3 -m http.server 8765, poi: node cartolina/sorgenti/anteprima.js cartolina/anteprima.jpg
// L'anteprima mostra solo la busta chiusa: niente meta, niente nomi.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8765/cartolina/'); await p.waitForTimeout(600);
  await p.evaluate(() => {
    document.querySelector('#busta-nome').textContent = 'Per te';
    document.querySelector('#busta-data').textContent = 'Da aprire con calma';
    const t = document.createElement('div'); t.id = 'testo-ant';
    t.innerHTML = '<p class="occhiello">Posta per te</p><h1>Una busta chiusa,<br><em>con dentro una sorpresa.</em></h1><p class="sotto">Si apre con un tocco, quando è il momento.</p>';
    document.querySelector('#s-busta').appendChild(t);
  });
  await p.addStyleTag({ content: `
    .audio, #busta-sotto, #s-busta > .occhiello { display: none !important; }
    #s-busta { flex-direction: row !important; gap: 70px !important; padding: 0 80px !important; justify-content: center !important; animation: none !important; }
    .busta-wrap { width: 500px !important; margin: 0 !important; transform: rotate(-4deg); }
    #testo-ant { text-align: left; display: grid; gap: 18px; max-width: 470px; }
    #testo-ant h1 { font-size: 58px; line-height: 1.02; color: var(--avorio); }
    #testo-ant h1 em { color: var(--champagne); }
    #testo-ant .sotto { font-size: 21px; color: var(--tenue); }
  `});
  await p.waitForTimeout(400);
  await p.screenshot({ path: process.argv[2], type: 'jpeg', quality: 88 });
  await b.close();
})();
