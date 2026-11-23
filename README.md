# LBS

Biglietto da visita digitale e progetti formali di LBS.

- **Biglietto da visita**: https://lindabs.github.io/lbs/
- **Ciak, si sceglie** (il gioco per scegliere il film in due): https://lindabs.github.io/lbs/ciak/
- **La cartolina che si apre** (l'annuncio di un viaggio a sorpresa): https://lindabs.github.io/lbs/cartolina/
  esempi: [Santorini](https://lindabs.github.io/lbs/cartolina/per-te/#santorini) · [Parigi](https://lindabs.github.io/lbs/cartolina/per-te/#parigi)

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

I progetti formali futuri andranno ciascuno in una propria cartella, per esempio
`nome-progetto/index.html`, raggiungibile su `https://lindabs.github.io/lbs/nome-progetto/`.
