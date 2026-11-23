# LBS

Biglietto da visita digitale e progetti formali di LBS.

- **Biglietto da visita**: https://lindabs.github.io/lbs/
- **Ciak, si sceglie** (il gioco per scegliere il film in due): https://lindabs.github.io/lbs/ciak/
- **La cartolina che si apre** (l'annuncio di un viaggio a sorpresa): https://lindabs.github.io/lbs/cartolina/

## Come è organizzata la repository

```
index.html          il biglietto da visita (pagina principale)
anteprima.jpg       l'immagine che compare quando il link viene condiviso (WhatsApp, social)
qr-biglietto.png    il QR code che apre il biglietto
ciak/               Ciak, si sceglie (pagina pubblica e anteprima)
ciak/sorgenti/      archivio dei film, trame, script per TMDB e per ricostruire la pagina
cartolina/          La cartolina che si apre (pagina, anteprima, caratteri ospitati in locale)
cartolina/sorgenti/ script per rigenerare l'immagine di anteprima
```

### Aggiornare Ciak
Dentro `ciak/sorgenti/`: aggiungi i film in `films_src.py`, poi
`python3 fetch_tmdb.py && python3 fetch_providers.py && python3 build.py --sito ../index.html`.
Gli script leggono i dati da TMDB: la chiave non va mai scritta nei file.

### Preparare una cartolina
Tutto ciò che si personalizza sta nell'oggetto `CARTOLINA` all'inizio dello script di
`cartolina/index.html`: nomi, iniziale sulla ceralacca, data di apertura, meta, indizi,
messaggio, date e programma del viaggio, risposta per WhatsApp.
Per vedere il conto alla rovescia senza cambiare la data: `.../cartolina/?attesa`.

Per una cartolina su misura conviene copiare la cartella con un nome difficile da indovinare
(es. `cartolina/k7m2-giulia/`), aggiornare titolo e anteprima nell'intestazione e scrivere
`../caratteri/` al posto di `caratteri/` nei percorsi dei caratteri.
Attenzione: la repository è pubblica, quindi nomi, testi e numero WhatsApp scritti nel file
sono leggibili da chiunque la sfogli. Il numero si può lasciare vuoto: WhatsApp chiederà a chi
inviare la risposta.

I progetti formali futuri andranno ciascuno in una propria cartella, per esempio
`nome-progetto/index.html`, raggiungibile su `https://lindabs.github.io/lbs/nome-progetto/`.
