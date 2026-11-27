// Testi del tour, presi dalla progettazione "Il cielo è di tutti".
// Per cambiare parole, frasi o esempi basta modificare questo file.

// Parole dei bambini stampate all'ingresso (esempi: sostituitele con le loro vere parole).
export const PAROLE_BAMBINI = [
  'il cielo di notte è blu', 'le stelle brillano', 'la luna mi segue',
  'spirale!', 'il buio è morbido', 'una stella cadente',
  'luccica', 'il vento gira', 'le stelle parlano', 'il cielo è grande',
];

// Frasi d'esempio per "Nel mio cielo c'è…" (compaiono segnate come esempio).
export const FRASI_ESEMPIO = [
  'una luna che sorride', 'il mio cane che vola', 'tante stelle colorate', 'la casa della nonna',
];

// Stelle d'esempio sulla costellazione (u, v in metri sul pannello).
export const STELLE_ESEMPIO = [
  { testo: 'Giulia', u: -2.6, v: 0.55 }, { testo: 'nuovi amici', u: -1.6, v: 0.9 },
  { testo: 'Tommaso', u: -0.7, v: 0.35 }, { testo: 'tanta curiosità', u: 0.4, v: 0.75 },
  { testo: 'Amir', u: 1.4, v: 0.2 }, { testo: 'giocare insieme', u: 2.4, v: 0.6 },
  { testo: 'Sofia', u: 0.9, v: -0.55 },
];

export const TAPPE = [
  {
    nome: 'Il cielo ci accoglie', spazio: 'Ingresso della scuola',
    frase: 'Il cielo è di tutti e ogni stella ha una storia da raccontare.',
    esperienza: 'Le famiglie entrano sotto un cielo di teli blu e neri, tra stelle dorate, spirali ispirate a Van Gogh e luci LED. Appese ai fili ci sono le parole dei bambini. Al tavolo dell\'accoglienza si ritira il percorso delle sei tappe.',
    allestimento: ['Teli blu e neri', 'Stelle dorate', 'Spirali ispirate a Van Gogh', 'Luci LED', 'Parole dei bambini stampate'],
    insegnanti: { gruppo: 'Gruppo Accoglienza', compiti: ['Ricezione delle famiglie', 'Consegna del percorso'] },
    bambini: 'Le guide di 5 anni aspettano i futuri compagni all\'ingresso e li accompagnano dentro il cielo.',
    guida: ['Ciao! Sono una delle guide: ho 5 anni e questa è la mia scuola.', 'Il cielo è di tutti e ogni stella ha una storia da raccontare.', 'Vieni con me, ti faccio vedere il nostro cielo!'],
  },
  {
    nome: 'La Notte Stellata', spazio: 'Aula immersiva',
    esperienza: 'Le luci si spengono e il cielo di Van Gogh prende vita su pareti e soffitto: il proiettore anima le pennellate, la musica accompagna. Le famiglie entrano nel quadro e i bambini raccontano quello che hanno osservato. Sul pannello, le fotografie dei laboratori.',
    citazione: 'Questo è il cielo che abbiamo osservato.',
    allestimento: ['Proiettore', 'Immagini animate della Notte Stellata', 'Musica di sottofondo', 'Fotografie dei laboratori'],
    insegnanti: { gruppo: 'Gruppo Documentazione', compiti: ['Fotografie', 'Raccolta delle frasi dei bambini'] },
    bambini: 'I bambini diventano narratori: raccontano il cielo che hanno osservato durante l\'anno.',
    guida: ['Questo è il cielo che abbiamo osservato.', 'Guarda: le stelle girano come il vento!', 'Noi l\'abbiamo dipinto con le spirali.'],
  },
  {
    nome: 'Atelier della luce', sotto: 'Un pezzo di cielo per tutti', spazio: 'Atelier',
    ispirazione: 'Van Gogh + Rodari', domanda: 'Come sarebbe il tuo cielo?',
    esperienza: 'Bambini e famiglie costruiscono il proprio paesaggio luminoso sul tavolo luminoso. Le sagome vengono completate con i materiali disponibili. Ogni composizione viene fotografata e riceve un titolo.',
    allestimento: ['Tavolo luminoso fai-da-te: box trasparente', 'Luci LED', 'Carta argentata'],
    materiali: ['Sagome di alberi', 'Sagome di stelle', 'Luna', 'Case', 'Spirali', 'Gemme trasparenti', 'Cristalli', 'Acetati colorati', 'Pietre luminose'],
    documentazione: ['Fotografie delle composizioni', 'Titolo attribuito al proprio cielo'],
    insegnanti: { gruppo: 'Gruppo Atelier della Luce', compiti: ['Supporto alle composizioni'] },
    bambini: 'I bambini sono facilitatori: mostrano ai nuovi compagni come si usano sagome, gemme e acetati.',
    guida: ['Come sarebbe il tuo cielo?', 'Prendi una stella, una luna, una gemma… e mettila sulla luce!', 'Le gemme sulla luce diventano colorate.'],
  },
  {
    nome: 'Atelier delle ombre', sotto: 'Quando il cielo prende vita', spazio: 'Atelier',
    domanda: 'Le stelle hanno un\'ombra?',
    esperienza: 'I visitatori sperimentano le ombre del corpo, le ombre degli oggetti, le ombre colorate e le immagini proiettate. Le immagini natalizie e invernali diventano elementi narrativi.',
    focus: 'Scoprire come la luce trasformi forme e immagini.',
    allestimento: ['Telo bianco', 'Lampada LED', 'Torce', 'Proiettore'],
    materiali: ['Sagome di stelle', 'Luna', 'Alberi', 'Fiocchi di neve', 'Simboli dell\'inverno', 'Lucidi colorati', 'Cornici trasparenti preparate dai bambini'],
    insegnanti: { gruppo: 'Gruppo Atelier delle Ombre', compiti: ['Gestione del telo e delle proiezioni'] },
    bambini: 'I bambini sono costruttori di meraviglia: hanno preparato le cornici trasparenti e mostrano come far crescere un\'ombra.',
    guida: ['Le stelle hanno un\'ombra? Proviamo!', 'Se avvicini la stella alla luce, l\'ombra diventa gigante.', 'Con tre luci colorate le ombre diventano colorate!'],
  },
  {
    nome: 'Il cielo racconta', spazio: 'Angolo lettura',
    esperienza: 'Un angolo morbido con tappeti, cuscini, lucine e stelle sospese. Le insegnanti leggono l\'albo "Il cielo è di tutti" di Gianni Rodari in piccoli gruppi. Poi ogni bambino completa la frase "Nel mio cielo c\'è…": le risposte vengono raccolte su cartoncini a forma di stella.',
    lettura: 'Il cielo è di tutti · Gianni Rodari',
    allestimento: ['Tappeti', 'Cuscini', 'Lucine', 'Stelle sospese'],
    materiali: ['Albo illustrato', 'Tappeti', 'Cuscini', 'Luci decorative'],
    insegnanti: { gruppo: 'Gruppo Angolo Lettura', compiti: ['Lettura dell\'albo', 'Conversazione'] },
    bambini: 'Le guide si siedono vicino ai nuovi compagni e raccontano per primi che cosa c\'è nel loro cielo.',
    guida: ['Sediamoci sui cuscini: adesso c\'è la storia.', 'Nel mio cielo c\'è… un drago gentile!', 'Scrivi anche tu che cosa c\'è nel tuo cielo.'],
    domandeConversazione: ['Che cosa vedi quando guardi il cielo dalla finestra?', 'Di chi è il cielo?', 'Che cosa metteresti nel tuo cielo?', 'Il cielo è uguale per tutti, di giorno e di notte?'],
  },
  {
    nome: 'La costellazione della scuola', spazio: 'Installazione finale',
    esperienza: 'Su un grande pannello blu ogni famiglia appende la sua stella, con il nome del bambino oppure un desiderio per il suo ingresso a scuola. Le stelle formano una grande costellazione collettiva.',
    allestimento: ['Grande pannello blu o nero'],
    materiali: ['Pannello grande', 'Stelle di cartoncino', 'Pennarelli bianchi e oro'],
    insegnanti: { gruppo: 'Tutte le insegnanti', compiti: ['Consegna delle stelle alle famiglie', 'Il Gruppo Documentazione fotografa la costellazione'] },
    bambini: 'Le guide consegnano le stelle e aiutano ad appenderle: la costellazione è di tutti.',
    guida: ['Questa è la costellazione della nostra scuola.', 'Manca solo la tua stella!', 'Scrivi il tuo nome, o un desiderio.'],
  },
];

export const PROGETTO = {
  titolo: 'Il cielo è di tutti',
  sottotitolo: 'Ogni bambino ha una stella da far brillare',
  premessa: [
    'L\'Open Day non è pensato come una semplice visita degli ambienti scolastici, ma come un\'esperienza immersiva in cui bambini e famiglie possano vivere l\'identità educativa della scuola.',
    'Il percorso prende avvio dalla Notte Stellata di Van Gogh, da Il cielo è di tutti di Gianni Rodari, dal linguaggio della luce, dal gioco delle ombre, dalla narrazione e dalla ricerca attraverso i materiali.',
    'I bambini di 5 anni diventano guide e accompagnatori dei futuri iscritti.',
  ],
  obiettivi: [
    { per: 'Per i futuri iscritti', voci: ['Vivere un\'esperienza positiva di accoglienza', 'Esplorare gli ambienti scolastici', 'Partecipare ad attività laboratoriali'] },
    { per: 'Per le famiglie', voci: ['Conoscere il progetto educativo della scuola', 'Osservare i bambini in contesti di ricerca', 'Comprendere il valore dell\'atelier e del gioco esplorativo'] },
    { per: 'Per i bambini di 5 anni', voci: ['Vivere il ruolo di tutor', 'Raccontare le esperienze realizzate durante l\'anno', 'Accogliere i nuovi compagni'] },
  ],
  materiale: [
    { per: 'Atelier della luce', voci: ['Box trasparenti', 'Luci LED', 'Carta argentata', 'Acetati', 'Gemme trasparenti', 'Cristalli', 'Pietre decorative', 'Sagome'] },
    { per: 'Atelier delle ombre', voci: ['Telo bianco', 'Lampada LED', 'Torce', 'Proiettore', 'Sagome', 'Lucidi colorati', 'Cornici trasparenti'] },
    { per: 'Angolo lettura', voci: ['Albo illustrato', 'Tappeti', 'Cuscini', 'Luci decorative'] },
    { per: 'Costellazione finale', voci: ['Pannello grande', 'Stelle di cartoncino', 'Pennarelli bianchi e oro'] },
  ],
  ruoli: [
    { gruppo: 'Gruppo Accoglienza', compiti: 'Ricezione delle famiglie, consegna del percorso' },
    { gruppo: 'Gruppo Atelier della Luce', compiti: 'Supporto alle composizioni' },
    { gruppo: 'Gruppo Atelier delle Ombre', compiti: 'Gestione del telo e delle proiezioni' },
    { gruppo: 'Gruppo Angolo Lettura', compiti: 'Lettura dell\'albo, conversazione' },
    { gruppo: 'Gruppo Documentazione', compiti: 'Fotografie, raccolta delle frasi dei bambini' },
  ],
  bambini: ['Guide', 'Narratori', 'Facilitatori', 'Costruttori di meraviglia'],
  documentazione: ['Pannello fotografico', 'Video dell\'evento', 'Raccolta delle parole dei bambini', 'Costellazione collettiva della scuola'],
  conclusione: 'Il cielo è di tutti, ma ogni bambino lo guarda con occhi diversi. Nella nostra scuola custodiamo ogni sguardo, ogni domanda e ogni stella.',
};
