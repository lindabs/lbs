# LBS

Biglietto da visita digitale e progetti formali di LBS.

- **Biglietto da visita**: https://lindabs.github.io/lbs/
- **Buon Appetito** (cena di festa a tappe): https://lindabs.github.io/lbs/cena/

## Come è organizzata la repository

```
index.html          il biglietto da visita (pagina principale)
anteprima.jpg       l'immagine che compare quando il link viene condiviso (WhatsApp, social)
qr-biglietto.png    il QR code che apre il biglietto
cena/index.html     Buon Appetito: percorso a tappe, piano della serata e invito per gli ospiti
cena/anteprima.jpg  l'immagine di anteprima del link della cena
```

## Buon Appetito

Identità propria, «Lume di candela», distinta dal biglietto. Una sola pagina, senza cookie né tracciamento. Cinque tappe (occasione, ospiti, esigenze,
atmosfera, tempo ed energie) e un piano completo: menù, lista della spesa, mise en place,
playlist, tabella di marcia e invito da mandare su WhatsApp.

- Le risposte e il piano restano sul telefono di chi lo usa (localStorage).
- L'invito viaggia tutto dentro il link (`cena/#invito=…`): il sito non lo riceve.
- I font sono incorporati nella pagina, quindi nessuna richiesta a server esterni.
- Ricette, mise en place e playlist sono in fondo al file, negli oggetti `R`, `MISE` e `PL`:
  per aggiungere una ricetta basta copiare un blocco esistente e cambiarne i valori.

I progetti formali futuri andranno ciascuno in una propria cartella, per esempio
`nome-progetto/index.html`, raggiungibile su `https://lindabs.github.io/lbs/nome-progetto/`.
