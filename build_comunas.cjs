const fs = require('fs');

const slugs = [
  "arica",
  "tarapaca",
  "antofagasta",
  "atacama",
  "coquimbo",
  "valparaiso",
  "metropolitana",
  "ohiggins",
  "maule",
  "nuble",
  "biobio",
  "araucania",
  "losrios",
  "loslagos",
  "aysen",
  "magallanes"
];

const csv = fs.readFileSync('/tmp/comunas.csv', 'utf8');
const lines = csv.trim().split('\n').slice(1);

const result = {};
slugs.forEach(s => result[s] = []);

lines.forEach(line => {
  // Line format: "1","1","Arica","-18.4707","-70.2945"
  const parts = line.split('","').map(p => p.replace(/"/g, ''));
  if (parts.length >= 5) {
    const comuna_id = parts[0];
    const region_id = parseInt(parts[1]) - 1; // 1-based to 0-based
    const nombre = parts[2];
    const lat = parseFloat(parts[3]);
    const lon = parseFloat(parts[4]);
    
    if (slugs[region_id]) {
      // Usar slug del nombre como ID principal
      const text = nombre;
      const slugId = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
      
      result[slugs[region_id]].push({
        id: slugId,
        nombre: nombre,
        lat: lat,
        lon: lon
      });
    }
  }
});

fs.writeFileSync('src/data/chile-comunas.json', JSON.stringify(result, null, 2));
console.log('chile-comunas.json updated successfully with ' + lines.length + ' comunas!');
