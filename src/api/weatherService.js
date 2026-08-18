// ─── Open-Meteo: sin API key, 100% gratis ─────────────────────────────────
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const WX_URL  = 'https://api.open-meteo.com/v1/forecast'

// Mapeo WMO weathercode → estado interno
function wmoToEstado(code, isDay = 1) {
  if (code === 0) return isDay ? 'sunny' : 'night'
  if (code <= 3)  return isDay ? 'partly' : 'partly-night'
  if (code <= 48) return 'cloudy'
  if (code <= 67) return 'rainy'
  if (code <= 77) return 'snow'
  if (code <= 82) return 'rainy'
  if (code <= 86) return 'snow'
  return 'thunder'
}

function wmoToLabel(code) {
  if (code === 0) return 'Despejado'
  if (code <= 3)  return 'Parcialmente nublado'
  if (code <= 48) return 'Nublado'
  if (code <= 67) return 'Lluvioso'
  if (code <= 77) return 'Nevando'
  if (code <= 82) return 'Chubascos'
  if (code <= 86) return 'Nevada'
  return 'Tormenta'
}

function lunaFase() {
  const lp = 2551442842; // ms en un ciclo lunar (29.53 días)
  const newMoon = new Date('2000-01-06T18:14:00Z').getTime();
  const phase = ((Date.now() - newMoon) % lp) / lp;
  
  if (phase < 0.05 || phase > 0.95) return 'Nueva';
  if (phase < 0.45) return 'Creciente';
  if (phase < 0.55) return 'Llena';
  return 'Menguante';
}

// Buscar ciudades por nombre → geocoding
import { formatSlug, getRegionSlugFromAPI } from '../utils/slugify.js'

export async function searchCities(query) {
  if (!query || query.length < 2) return []
  const r = await fetch(`${GEO_URL}?name=${encodeURIComponent(query)}&count=20&language=es&format=json`)
  const d = await r.json()
  let results = (d.results || [])
    .filter(c => c.country_code === 'CL' || c.country === 'Chile')

  // Filtrar duplicados por id o nombre
  const unicos = []
  const names = new Set()
  for (const c of results) {
    if (!names.has(c.name)) {
      names.add(c.name)
      unicos.push(c)
    }
  }

  const finalResults = unicos.slice(0, 6).map(c => {
    const slugRegion = getRegionSlugFromAPI(c.admin1)
    const slugCity = formatSlug(c.name)
    return {
      id: c.id,
      nombre: c.name,
      pais: c.country,
      lat: c.latitude,
      lon: c.longitude,
      slugRegion,
      slugCity
    }
  })

  if (finalResults.length === 0) return []

  // Fetch temp actual en lote
  try {
    const lats = finalResults.map(c => c.lat).join(',')
    const lons = finalResults.map(c => c.lon).join(',')
    const wxRes = await fetch(`${WX_URL}?latitude=${lats}&longitude=${lons}&current_weather=true&timezone=auto`)
    const wxData = await wxRes.json()
    
    const wxArray = Array.isArray(wxData) ? wxData : [wxData]
    
    finalResults.forEach((c, i) => {
      if (wxArray[i] && wxArray[i].current_weather) {
        c.temp = Math.round(wxArray[i].current_weather.temperature)
        c.estado = wmoToEstado(wxArray[i].current_weather.weathercode, wxArray[i].current_weather.is_day ?? 1)
      }
    })
  } catch (e) {
    console.error("Error fetching temps for search", e)
  }

  return finalResults
}

// Obtener clima completo de una ciudad por coordenadas
export async function fetchWeather(ciudad) {
  const params = new URLSearchParams({
    latitude:  ciudad.lat,
    longitude: ciudad.lon,
    current_weather: true,
    hourly: 'temperature_2m,apparent_temperature,relativehumidity_2m,precipitation_probability,weathercode,surface_pressure',
    daily:  'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max',
    timezone: 'auto',
    forecast_days: 7
  })

  const r = await fetch(`${WX_URL}?${params}`)
  const d = await r.json()

  const cw  = d.current_weather
  const isDay = cw.is_day ?? 1

  // Encontrar la hora actual en el array hourly
  const ahora = new Date()
  const hHoy  = ahora.getHours()
  // El índice en el array hourly correspondiente a la hora actual (aprox)
  const hIdx  = d.hourly.time.findIndex(t => {
    const h = new Date(t).getHours()
    return h === hHoy
  })
  const startIdx = hIdx >= 0 ? hIdx : 0

  // 12 horas siguientes desde ahora
  const pronosticoHoras = Array.from({ length: 12 }, (_, i) => {
    const idx = startIdx + i
    if (idx >= d.hourly.time.length) return null
    const t = new Date(d.hourly.time[idx])
    const h = t.getHours().toString().padStart(2, '0') + 'h'
    const code = d.hourly.weathercode[idx]
    const isN  = t.getHours() < 6 || t.getHours() >= 20 ? 0 : 1
    return {
      hora:   h,
      temp:   Math.round(d.hourly.temperature_2m[idx]),
      estado: wmoToEstado(code, isN),
      prob:   d.hourly.precipitation_probability[idx] ?? 0
    }
  }).filter(Boolean)

  // 7 días
  const pronosticoSemanal = d.daily.time.map((t, i) => {
    const fecha = new Date(t + 'T12:00:00')
    const dias  = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
    return {
      dia:    dias[fecha.getDay()],
      min:    Math.round(d.daily.temperature_2m_min[i]),
      max:    Math.round(d.daily.temperature_2m_max[i]),
      estado: wmoToEstado(d.daily.weathercode[i]),
      precip: d.daily.precipitation_sum[i] ?? 0
    }
  })

  // Humedad y presión de la hora actual
  const humedad  = d.hourly.relativehumidity_2m[startIdx] ?? '–'
  const presion  = Math.round(d.hourly.surface_pressure[startIdx] ?? 1013)
  const sensacion = Math.round(d.hourly.apparent_temperature[startIdx] ?? cw.temperature)

  return {
    id:           ciudad.id,
    nombre:       ciudad.nombre,
    pais:         ciudad.pais || '',
    lat:          ciudad.lat,
    lon:          ciudad.lon,
    tempActual:   Math.round(cw.temperature),
    sensacion,
    estadoActual: wmoToEstado(cw.weathercode, isDay),
    estadoLabel:  wmoToLabel(cw.weathercode),
    humedad:      `${humedad}%`,
    viento:       `${Math.round(cw.windspeed)} km/h`,
    presion:      `${presion} hPa`,
    precipitacion:`${pronosticoSemanal[0]?.precip ?? 0} mm`,
    luna:         lunaFase(),
    pronosticoHoras,
    pronosticoSemanal,
    isLive: true,
    ts: Date.now()
  }
}

// Ciudades de la Octava Región del Biobío - Chile
export const DEFAULT_CITIES = [
  { id: 1, nombre: 'Concepción',       pais: 'Chile', lat: -36.8201, lon: -73.0444 },
  { id: 2, nombre: 'Talcahuano',       pais: 'Chile', lat: -36.7248, lon: -73.1167 },
  { id: 3, nombre: 'Chiguayante',      pais: 'Chile', lat: -36.9209, lon: -73.0167 },
  { id: 4, nombre: 'San Pedro de la Paz', pais: 'Chile', lat: -36.8833, lon: -73.1167 },
  { id: 5, nombre: 'Coronel',          pais: 'Chile', lat: -37.0167, lon: -73.1500 },
]
