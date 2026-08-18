const axios = require('axios');
const fs = require('fs');

const REGIONES = {
  "arica": ["Arica", "Putre", "Camarones"],
  "tarapaca": ["Iquique", "Alto Hospicio", "Pozo Almonte"],
  "antofagasta": ["Antofagasta", "Calama", "Tocopilla", "Mejillones", "San Pedro de Atacama"],
  "atacama": ["Copiapó", "Vallenar", "Caldera", "Chañaral"],
  "coquimbo": ["La Serena", "Coquimbo", "Ovalle", "Illapel", "Vicuña"],
  "valparaiso": ["Valparaíso", "Viña del Mar", "Quilpué", "Villa Alemana", "San Antonio", "Quillota", "Los Andes"],
  "metropolitana": ["Santiago", "Puente Alto", "Maipú", "La Florida", "San Bernardo", "Providencia", "Las Condes", "Melipilla"],
  "ohiggins": ["Rancagua", "San Fernando", "Machalí", "Pichilemu", "Rengo"],
  "maule": ["Talca", "Curicó", "Linares", "Constitución", "Cauquenes"],
  "nuble": ["Chillán", "San Carlos", "Bulnes", "Quirihue", "Cobquecura"],
  "biobio": ["Concepción", "Talcahuano", "Los Ángeles", "Chiguayante", "Coronel", "Lota", "Lebu", "Tomé"],
  "araucania": ["Temuco", "Padre Las Casas", "Villarrica", "Pucón", "Angol", "Victoria"],
  "losrios": ["Valdivia", "La Unión", "Río Bueno", "Panguipulli"],
  "loslagos": ["Puerto Montt", "Osorno", "Castro", "Ancud", "Puerto Varas", "Quellón"],
  "aysen": ["Coyhaique", "Puerto Aysén", "Cochrane", "Chile Chico"],
  "magallanes": ["Punta Arenas", "Puerto Natales", "Porvenir", "Cabo de Hornos"]
};

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const result = {};
  
  for (const [region, ciudades] of Object.entries(REGIONES)) {
    result[region] = [];
    for (const ciudad of ciudades) {
      try {
        const res = await axios.get(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=15&language=es`);
        if (res.data && res.data.results) {
          const c = res.data.results.find(item => item.country_code === 'CL' || item.country === 'Chile');
          if (c) {
            result[region].push({
              id: c.id,
              nombre: c.name,
              lat: c.latitude,
              lon: c.longitude
            });
          } else {
            console.warn(`No se encontró ${ciudad} en Chile`);
          }
        }
        await sleep(200); // rate limit protection
      } catch (e) {
        console.error(`Error fetching ${ciudad}: ${e.message}`);
      }
    }
    console.log(`Region ${region} procesada.`);
  }
  
  fs.writeFileSync('src/data/chile-comunas.json', JSON.stringify(result, null, 2));
  console.log("Comunas generadas en src/data/chile-comunas.json");
}

main();
