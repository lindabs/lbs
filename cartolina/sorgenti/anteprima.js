// Rigenera le immagini della cartolina:
//   cartolina/per-te/anteprima.jpg  (1200×630) l'anteprima WhatsApp della busta: solo la busta chiusa, niente meta né nomi
//   cartolina/anteprima.jpg         (1200×630) l'anteprima WhatsApp della pagina "Crea la tua cartolina"
//   cartolina/sorgenti/miniatura.jpg (560×420) la miniatura per la galleria del biglietto da visita
// Dalla cartella del repository: python3 -m http.server 8765, poi: node cartolina/sorgenti/anteprima.js
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8765/cartolina/per-te/'); await p.waitForTimeout(600);
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
  await p.screenshot({ path: 'cartolina/per-te/anteprima.jpg', type: 'jpeg', quality: 88 });
  await p.goto('http://localhost:8765/cartolina/sorgenti/vetrina.html?testo'); await p.waitForTimeout(800);
  await p.screenshot({ path: 'cartolina/anteprima.jpg', type: 'jpeg', quality: 88 });
  const m = await b.newPage({ viewport: { width: 560, height: 420 } });
  await m.goto('http://localhost:8765/cartolina/sorgenti/vetrina.html'); await m.waitForTimeout(800);
  await m.screenshot({ path: 'cartolina/sorgenti/miniatura.jpg', type: 'jpeg', quality: 82 });
  await b.close();
})();
