const fs = require('fs');

const slugs = [
  "arica",           // 1
  "tarapaca",        // 2
  "antofagasta",     // 3
  "atacama",         // 4
  "coquimbo",        // 5
  "valparaiso",      // 6
  "metropolitana",   // 7
  "ohiggins",        // 8
  "maule",           // 9
  "biobio",          // 10 (incluye ñuble temporalmente)
  "araucania",       // 11
  "losrios",         // 12
  "loslagos",        // 13
  "aysen",           // 14
  "magallanes"       // 15
];

const csv = fs.readFileSync('/tmp/comunas.csv', 'utf8');
const lines = csv.trim().split('\n').slice(1);

const result = { nuble: [] };
slugs.forEach(s => result[s] = []);

const comunasNuble = new Set([
  "bulnes", "chillan", "chillanviejo", "cobquecura", "coelemu", "coihueco",
  "elcarmen", "ninhue", "niquen", "pemuco", "pinto", "portezuelo", "quillon",
  "quirihue", "ranquil", "sancarlos", "sanfabian", "sanignacio", "sannicolas",
  "treguaco", "yungay"
]);

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
      
      let targetRegion = slugs[region_id];
      // Mover a Ñuble si estaba en Biobío y pertenece a Ñuble
      if (targetRegion === "biobio" && comunasNuble.has(slugId)) {
        targetRegion = "nuble";
      }

      result[targetRegion].push({
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
