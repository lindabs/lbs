# LBS

Biglietto da visita digitale e progetti formali di LBS.

- **Biglietto da visita**: https://lindabs.github.io/lbs/
- **Ciak, si sceglie** (il gioco per scegliere il film in due): https://lindabs.github.io/lbs/ciak/
- **La cartolina che si apre** (l'annuncio di un viaggio a sorpresa): https://lindabs.github.io/lbs/cartolina/
  esempi: [Santorini](https://lindabs.github.io/lbs/cartolina/per-te/#santorini) · [Parigi](https://lindabs.github.io/lbs/cartolina/per-te/#parigi)
- **Buon Appetito** (cena di festa a tappe): https://lindabs.github.io/lbs/cena/
- **Il mondo stamattina** (notiziario del mattino sul globo): https://lindabs.github.io/lbs/mondo/

## Come è organizzata la repository

```
index.html          il biglietto da visita (pagina principale)
anteprima.jpg       l'immagine che compare quando il link viene condiviso (WhatsApp, social)
qr-biglietto.png    il QR code che apre il biglietto
ciak/               Ciak, si sceglie (pagina pubblica e anteprima)
ciak/sorgenti/      archivio dei film, trame, script per TMDB e per ricostruire la pagina
cartolina/          La cartolina che si apre: la pagina "Crea la tua cartolina" (chi regala)
cartolina/per-te/   la busta che apre chi riceve
cartolina/mete.js   le mete (disegni, francobolli, indizi e testi predefiniti) e la codifica del link
cartolina/mete.css  caratteri e animazioni delle illustrazioni, condivisi dalle due pagine
cartolina/caratteri/ caratteri ospitati in locale (nessuna richiesta a Google Fonts)
cartolina/sorgenti/ vetrina e script per rigenerare anteprime e miniatura del biglietto
cena/index.html     Buon Appetito: percorso a tappe, piano della serata e invito per gli ospiti
cena/anteprima.jpg  l'immagine di anteprima del link della cena
mondo/index.html    Il mondo stamattina: il globo e il pannello delle notizie
mondo/dati/         paesi, confini e il notiziario del giorno (oggi-it.json, più l'archivio di 30 giorni)
mondo/sorgenti/     lo script del mattino (genera.mjs) e quello che prepara paesi e confini
mondo/lib/          globe.gl, ospitato in locale
.github/workflows/mondo.yml  l'automatismo che ogni mattina scrive il notiziario
```

### Aggiornare Ciak
Dentro `ciak/sorgenti/`: aggiungi i film in `films_src.py`, poi
`python3 fetch_tmdb.py && python3 fetch_providers.py && python3 build.py --sito ../index.html`.
Gli script leggono i dati da TMDB: la chiave non va mai scritta nei file.

### La cartolina che si apre
Un solo link per chi regala: `cartolina/`. Si sceglie la meta, si compila il modulo e si invia
il link su WhatsApp. Non si crea una pagina per ogni cartolina: nomi, date e messaggio viaggiano
dentro il link, dopo il `#` (es. `cartolina/per-te/#1Tcq…`). Quella parte dell'indirizzo non
arriva mai al server, e niente viene salvato. Chi ha il link può però leggerne il contenuto.

- Esempi pronti: `cartolina/per-te/#santorini` e `cartolina/per-te/#parigi`.
- `?anteprima` (usato dal pulsante "Prova la cartolina") ignora la data di apertura;
  `?attesa` mostra il conto alla rovescia.
- Per aggiungere una meta: una nuova voce in `METE` dentro `cartolina/mete.js`, con la sua
  funzione di disegno e il francobollo. Compare da sola nel modulo.
- Dopo aver cambiato le illustrazioni, rigenera anteprime e miniatura:
  `python3 -m http.server 8765`, poi `node cartolina/sorgenti/anteprima.js`.
  La miniatura `cartolina/sorgenti/miniatura.jpg` va poi incollata, in base64, nella galleria di `index.html`.

## Buon Appetito

Identità propria, «Lume di candela», distinta dal biglietto. Una sola pagina, senza cookie né tracciamento.
Cinque tappe (occasione, ospiti, esigenze, atmosfera, tempo ed energie) e un piano completo:
menù, lista della spesa, mise en place, playlist, tabella di marcia e invito da mandare su WhatsApp.

- Le risposte e il piano restano sul telefono di chi lo usa (localStorage).
- L'invito viaggia tutto dentro il link (`cena/#invito=…`): il sito non lo riceve.
- I font sono incorporati nella pagina, quindi nessuna richiesta a server esterni.
- Ricette, mise en place e playlist sono in fondo al file, negli oggetti `R`, `MISE` e `PL`:
  per aggiungere una ricetta basta copiare un blocco esistente e cambiarne i valori.

## Il mondo stamattina

Un globo da girare: si tocca un paese e si legge il notiziario del giorno, in italiano, con i link alle fonti.
Tutto gratuito: le notizie vengono da [GDELT](https://www.gdeltproject.org/), i riassunti dal piano gratuito
di Gemini, il lavoro lo fa GitHub Actions e il sito resta su GitHub Pages.

- Ogni mattina alle 3:37 UTC (4:37 in inverno, 5:37 in estate) parte `.github/workflows/mondo.yml`.
  Raccoglie i titoli delle ultime 24 ore dai feed RSS pubblici di alcune testate internazionali (BBC,
  Al Jazeera, DW, France 24, ANSA…) e la stampa locale paese per paese da GDELT (al massimo un'ora: se è lento si prosegue con i soli feed),
  li fa riassumere a Gemini e salva `mondo/dati/oggi-it.json`.
- Serve il secret `GEMINI_API_KEY` (Settings → Secrets and variables → Actions), creato su Google AI Studio
  con un account senza fatturazione: così non può mai costare nulla. La chiave non va mai scritta nei file.
- Per una prova: Actions → «Il mondo stamattina» → Run workflow, con alcuni paesi nel campo (es. `IT,FR,SD`).
  Il risultato compare nel riepilogo dell'esecuzione e il sito non viene toccato. Lasciando il campo vuoto
  si genera e si pubblica il notiziario completo.
- In locale: `GEMINI_API_KEY=... node mondo/sorgenti/genera.mjs --solo IT,FR`
  (`--senza-ai` salva solo i titoli, `--riusa-raccolta` salta GDELT e riusa l'ultima raccolta).
- Se GDELT o Gemini non rispondono, resta online il notiziario del giorno prima. Se un gruppo di paesi
  non viene riassunto, il sito mostra i titoli originali.
- Il modello si cambia con le variabili `GEMINI_MODEL` e `GEMINI_RISERVA` (predefiniti `gemini-flash-latest`
  e `gemini-flash-lite-latest`). Per aggiungere l'inglese: `LINGUA=en`, le istruzioni in inglese in `genera.mjs`
  e un selettore nella pagina.

I progetti formali futuri andranno ciascuno in una propria cartella, per esempio
`nome-progetto/index.html`, raggiungibile su `https://lindabs.github.io/lbs/nome-progetto/`.
