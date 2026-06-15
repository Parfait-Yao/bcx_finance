const topojson = require('topojson-client');
const world = require('world-atlas/countries-110m.json');
const geo = topojson.feature(world, world.objects.countries);
const names = geo.features.map((f) => ({ id: f.id, name: f.properties.name }));
const wanted = [
  'Nigeria', 'Ghana', 'Kenya', 'Egypt', 'Morocco', 'South Africa', 'Senegal',
  'Mali', 'Burkina Faso', 'Togo', 'Benin', 'Niger', 'Cameroon', 'Guinea',
  'Chad', 'Dem. Rep. Congo', 'Gabon', 'Tunisia', 'Rwanda', 'Cote d\'Ivoire',
  'Ivory Coast', "Côte d'Ivoire",
];
console.log(JSON.stringify(names.filter((n) => wanted.includes(n.name)), null, 1));
console.log('--- ALL AFRICA-ISH NAMES ---');
console.log(JSON.stringify(names, null, 1));
