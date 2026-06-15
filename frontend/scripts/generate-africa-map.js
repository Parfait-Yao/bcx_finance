// Génère les données géographiques de l'Afrique (paths SVG des pays +
// positions des marqueurs) à partir de world-atlas, pour affichage dans
// la section "Présence en Afrique" de la landing page.
const fs = require('fs');
const path = require('path');
const topojson = require('topojson-client');
const { geoMercator, geoPath } = require('d3-geo');
const world = require('world-atlas/countries-110m.json');

const geo = topojson.feature(world, world.objects.countries);

// IDs ISO numériques des pays du continent africain (+ Madagascar)
const AFRICA_IDS = new Set([
  '012', '024', '072', '108', '120', '132', '140', '148', '178', '180',
  '204', '226', '231', '232', '262', '266', '270', '288', '324', '384',
  '404', '426', '430', '434', '450', '454', '466', '478', '480', '504',
  '508', '516', '562', '566', '624', '646', '686', '690', '694', '706',
  '710', '716', '729', '732', '748', '768', '788', '800', '818', '834',
  '854', '894', '728',
]);

// Pays couverts par BCX Finance (id -> drapeau)
const COUVERTS = {
  '384': '🇨🇮', // Côte d'Ivoire
  '686': '🇸🇳', // Sénégal
  '466': '🇲🇱', // Mali
  '854': '🇧🇫', // Burkina Faso
  '288': '🇬🇭', // Ghana
  '768': '🇹🇬', // Togo
  '204': '🇧🇯', // Bénin
  '566': '🇳🇬', // Nigéria
  '562': '🇳🇪', // Niger
  '120': '🇨🇲', // Cameroun
  '324': '🇬🇳', // Guinée
  '148': '🇹🇩', // Tchad
  '180': '🇨🇩', // RD Congo
  '266': '🇬🇦', // Gabon
  '504': '🇲🇦', // Maroc
  '788': '🇹🇳', // Tunisie
  '818': '🇪🇬', // Égypte
  '404': '🇰🇪', // Kenya
  '646': '🇷🇼', // Rwanda
  '710': '🇿🇦', // Afrique du Sud
};

// Capitales (id -> [nom, lon, lat])
const CAPITALES = {
  '384': ["Côte d'Ivoire", -5.32, 6.83],
  '686': ['Sénégal', -17.45, 14.69],
  '466': ['Mali', -8.0, 12.65],
  '854': ['Burkina Faso', -1.53, 12.37],
  '288': ['Ghana', -0.2, 5.6],
  '768': ['Togo', 1.22, 6.13],
  '204': ['Bénin', 2.42, 6.49],
  '566': ['Nigéria', 7.49, 9.08],
  '562': ['Niger', 2.12, 13.51],
  '120': ['Cameroun', 11.5, 3.87],
  '324': ['Guinée', -13.68, 9.5],
  '148': ['Tchad', 15.05, 12.1],
  '180': ['RD Congo', 15.31, -4.32],
  '266': ['Gabon', 9.45, 0.39],
  '504': ['Maroc', -6.85, 34.02],
  '788': ['Tunisie', 10.18, 36.81],
  '818': ['Égypte', 31.24, 30.04],
  '404': ['Kenya', 36.82, -1.29],
  '646': ['Rwanda', 30.06, -1.95],
  '710': ['Afrique du Sud', 28.19, -25.75],
};

const africaFeatures = geo.features.filter((f) => AFRICA_IDS.has(String(f.id)));

// Projection centrée sur l'Afrique, taille adaptée à un viewBox 0 0 700 620
const projection = geoMercator()
  .center([22, 2])
  .scale(420)
  .translate([350, 280]);

const pathGen = geoPath(projection);

const countryPaths = africaFeatures.map((f) => {
  const id = String(f.id);
  return {
    id,
    name: f.properties.name,
    d: pathGen(f),
    couvert: Object.prototype.hasOwnProperty.call(COUVERTS, id),
  };
});

const markers = Object.entries(CAPITALES).map(([id, [nom, lon, lat]]) => {
  const [x, y] = projection([lon, lat]);
  return { id, nom, x: Math.round(x * 100) / 100, y: Math.round(y * 100) / 100 };
});

const output = `// Fichier généré automatiquement par scripts/generate-africa-map.js
// Ne pas modifier à la main : relancer "node scripts/generate-africa-map.js"
// pour régénérer à partir des données world-atlas (TopoJSON, résolution 110m).

export interface PaysCarte {
  id: string;
  name: string;
  d: string;
  couvert: boolean;
}

export interface MarqueurCarte {
  id: string;
  nom: string;
  x: number;
  y: number;
}

export const AFRICA_VIEWBOX = '0 0 700 620';

export const AFRICA_COUNTRY_PATHS: PaysCarte[] = ${JSON.stringify(countryPaths, null, 2)};

export const AFRICA_MARKERS: MarqueurCarte[] = ${JSON.stringify(markers, null, 2)};
`;

const outPath = path.join(__dirname, '..', 'src', 'components', 'landing', 'africa-map-data.ts');
fs.writeFileSync(outPath, output, 'utf-8');
console.log('Généré :', outPath);
console.log('Pays Afrique :', countryPaths.length, '| Couverts :', countryPaths.filter((c) => c.couvert).length, '| Marqueurs :', markers.length);
