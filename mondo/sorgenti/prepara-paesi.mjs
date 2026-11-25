// Prepara l'elenco dei paesi e i confini per il globo, a partire da Natural Earth (dominio pubblico).
// Si lancia una volta sola (o quando si vogliono aggiornare i confini):
//   node mondo/sorgenti/prepara-paesi.mjs
// Scrive mondo/dati/paesi.json e mondo/dati/confini.json.
import { writeFile } from 'node:fs/promises';

const BASE = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/';
const scarica = async n => (await fetch(BASE + n)).json();

// Codici FIPS usati da GDELT (sourcecountry) dove Natural Earth non li ha.
const FIPS_MANCANTI = { SDS: 'OD', NOR: 'NO', ISR: 'IS', PSX: 'WE' };
// Aree che sul globo hanno una forma propria ma mostrano il notiziario di un altro paese.
const ALIAS = { SOL: 'SO', CYN: 'CY' };
// Territori che teniamo anche se piccoli, perché spesso al centro della cronaca.
const DA_TENERE = new Set(['GRL', 'HKG', 'MAC', 'PRI', 'NCL', 'PYF', 'FLK', 'ESH']);
const DA_ESCLUDERE = new Set(['ATA', 'KAS', 'IOA', 'ATF', 'HMD', 'SGS', 'ASH', 'PCN', 'IOT']);

const g110 = await scarica('ne_110m_admin_0_countries.geojson');
const g50 = await scarica('ne_50m_admin_0_countries.geojson');

const idDi = p => (p.ISO_A2_EH && p.ISO_A2_EH !== '-99' ? p.ISO_A2_EH : p.ADM0_A3);
const tieni = p => {
  if (DA_ESCLUDERE.has(p.ADM0_A3) || ALIAS[p.ADM0_A3]) return false;
  if (DA_TENERE.has(p.ADM0_A3)) return true;
  if (['Sovereign country', 'Sovereignty', 'Disputed', 'Indeterminate'].includes(p.TYPE)) return true;
  return p.POP_EST >= 200000; // "Country" e "Dependency" piccoli: lasciati fuori
};

const in110 = new Set(g110.features.map(f => f.properties.ADM0_A3));
const paesi = [];
for (const { properties: p } of g50.features) {
  if (!tieni(p)) continue;
  const fips = FIPS_MANCANTI[p.ADM0_A3] || p.FIPS_10;
  if (!fips || fips === '-99') { console.warn('Senza codice FIPS, escluso:', p.NAME); continue; }
  paesi.push({
    id: idDi(p),
    nome: p.NAME_IT || p.NAME,
    en: p.NAME_LONG || p.NAME,
    fips,
    lat: +p.LABEL_Y.toFixed(2),
    lng: +p.LABEL_X.toFixed(2),
    ...(in110.has(p.ADM0_A3) ? {} : { piccolo: true }),
  });
}
paesi.sort((a, b) => a.nome.localeCompare(b.nome, 'it'));

const arrotonda = c => (typeof c[0] === 'number' ? [+c[0].toFixed(2), +c[1].toFixed(2)] : c.map(arrotonda));
const ids = new Set(paesi.map(p => p.id));
const confini = {
  type: 'FeatureCollection',
  features: g110.features
    .filter(f => f.properties.ADM0_A3 !== 'ATA')
    .map(f => {
      const p = f.properties;
      const id = ALIAS[p.ADM0_A3] ? ALIAS[p.ADM0_A3] : idDi(p);
      return {
        type: 'Feature',
        properties: { id: ids.has(id) ? id : null, nome: p.NAME_IT || p.NAME },
        geometry: { type: f.geometry.type, coordinates: arrotonda(f.geometry.coordinates) },
      };
    }),
};

await writeFile(new URL('../dati/paesi.json', import.meta.url), JSON.stringify(paesi, null, 1) + '\n');
await writeFile(new URL('../dati/confini.json', import.meta.url), JSON.stringify(confini));
console.log(`${paesi.length} paesi, ${confini.features.length} forme sul globo`);
