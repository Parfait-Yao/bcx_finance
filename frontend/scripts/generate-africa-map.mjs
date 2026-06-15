// Génère src/components/landing/africa-map-data.ts à partir du GeoJSON
// des pays d'Afrique : tracés SVG (Mercator) + marqueurs sur les capitales
// des pays couverts par BCX Finance.
import fs from 'fs';
import { geoMercator, geoPath } from 'd3-geo';

const W = 1000;
const H = 1050;

const geo = JSON.parse(fs.readFileSync('./src/components/landing/africa.geojson', 'utf8'));

const projection = geoMercator().fitSize([W, H], geo);
const pathGen = geoPath(projection);

// Correspondance nom (geojson, anglais) -> capitale (lat, lng)
// pour les 20 pays couverts par BCX Finance.
const PAYS_COUVERTS = {
  'Ivory Coast': { lat: 6.8, lng: -5.27 },     // Yamoussoukro
  Senegal: { lat: 14.69, lng: -17.44 },        // Dakar
  Mali: { lat: 12.65, lng: -8.0 },             // Bamako
  'Burkina Faso': { lat: 12.37, lng: -1.52 },  // Ouagadougou
  Ghana: { lat: 5.6, lng: -0.19 },             // Accra
  Togo: { lat: 6.13, lng: 1.22 },              // Lomé
  Benin: { lat: 6.37, lng: 2.42 },             // Cotonou
  Nigeria: { lat: 9.08, lng: 7.4 },            // Abuja
  Niger: { lat: 13.51, lng: 2.11 },            // Niamey
  Cameroon: { lat: 3.87, lng: 11.52 },         // Yaoundé
  Guinea: { lat: 9.51, lng: -13.71 },          // Conakry
  Chad: { lat: 12.11, lng: 15.04 },            // N'Djamena
  'DR Congo': { lat: -4.32, lng: 15.31 },      // Kinshasa
  Gabon: { lat: 0.39, lng: 9.45 },             // Libreville
  Morocco: { lat: 34.02, lng: -6.84 },         // Rabat
  Tunisia: { lat: 36.81, lng: 10.18 },         // Tunis
  Egypt: { lat: 30.04, lng: 31.24 },           // Le Caire
  Kenya: { lat: -1.29, lng: 36.82 },           // Nairobi
  Rwanda: { lat: -1.94, lng: 30.06 },          // Kigali
  'South Africa': { lat: -25.75, lng: 28.19 }, // Pretoria
};

const countryPaths = geo.features.map((f, index) => ({
  id: `pays-${index}`,
  nom: f.properties.name,
  d: pathGen(f),
  couvert: Object.prototype.hasOwnProperty.call(PAYS_COUVERTS, f.properties.name),
}));

const markers = Object.entries(PAYS_COUVERTS).map(([nom, coord]) => {
  const [x, y] = projection([coord.lng, coord.lat]);
  return { id: `marqueur-${nom}`, nom, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
});

const out = `// Fichier généré automatiquement par scripts/generate-africa-map.mjs
// Ne pas modifier à la main : relancer "node scripts/generate-africa-map.mjs"

export const AFRICA_VIEWBOX = "0 0 ${W} ${H}";

export interface PaysCarte {
  id: string;
  nom: string;
  d: string;
  couvert: boolean;
}

export interface MarqueurCarte {
  id: string;
  nom: string;
  x: number;
  y: number;
}

export const AFRICA_COUNTRY_PATHS: PaysCarte[] = ${JSON.stringify(countryPaths, null, 2)};

export const AFRICA_MARKERS: MarqueurCarte[] = ${JSON.stringify(markers, null, 2)};
`;

fs.writeFileSync('./src/components/landing/africa-map-data.ts', out, 'utf8');
console.log('OK -', countryPaths.length, 'pays,', markers.length, 'marqueurs.');
