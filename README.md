# LBS

Biglietto da visita digitale e progetti formali di LBS.

- **Biglietto da visita**: https://lindabs.github.io/lbs/
- **Ciak, si sceglie** (il gioco per scegliere il film in due): https://lindabs.github.io/lbs/ciak/

## Come è organizzata la repository

```
index.html          il biglietto da visita (pagina principale)
anteprima.jpg       l'immagine che compare quando il link viene condiviso (WhatsApp, social)
qr-biglietto.png    il QR code che apre il biglietto
ciak/               Ciak, si sceglie (pagina pubblica e anteprima)
ciak/sorgenti/      archivio dei film, trame, script per TMDB e per ricostruire la pagina
```

### Aggiornare Ciak
Dentro `ciak/sorgenti/`: aggiungi i film in `films_src.py`, poi
`python3 fetch_tmdb.py && python3 fetch_providers.py && python3 build.py --sito ../index.html`.
Gli script leggono i dati da TMDB: la chiave non va mai scritta nei file.

I progetti formali futuri andranno ciascuno in una propria cartella, per esempio
`nome-progetto/index.html`, raggiungibile su `https://lindabs.github.io/lbs/nome-progetto/`.
