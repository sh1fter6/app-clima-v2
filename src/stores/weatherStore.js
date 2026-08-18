import { defineStore } from 'pinia'
import { ref } from 'vue'

const WX_URL = 'https://api.open-meteo.com/v1/forecast'

export const useWeatherStore = defineStore('weather', () => {
  // 1. Diccionario de Hidratación (Datos Climáticos por Ciudad)
  const weatherData = ref({})
  
  // 2. Metadatos de Caché y Control (Stale-While-Revalidate)
  const cacheMeta = ref({})

  // Límite LRU
  const MAX_CITIES_IN_CACHE = 100 // Límite generoso, equivalente a 2-3 regiones grandes
  
  // --- Utilidades ---
  function wmoToEstado(code, isDay = 1) {
    if (code === 0) return isDay ? 'sunny' : 'night'
    if (code <= 3)  return isDay ? 'partly' : 'night'
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
  
  function getLuna() {
    const d = new Date().getDate()
    if (d <= 7) return 'Nueva'
    if (d <= 14) return 'Creciente'
    if (d <= 21) return 'Llena'
    return 'Menguante'
  }

  // Política de Evicción (LRU)
  function enforceCacheLimit() {
    const keys = Object.keys(cacheMeta.value)
    if (keys.length > MAX_CITIES_IN_CACHE) {
      // Ordenar por lastFetched ascendente (el más viejo primero)
      const oldestKeys = keys.sort((a, b) => cacheMeta.value[a].lastFetched - cacheMeta.value[b].lastFetched)
      // Borrar los más viejos hasta quedar bajo el límite
      const toRemove = oldestKeys.slice(0, keys.length - MAX_CITIES_IN_CACHE)
      toRemove.forEach(k => {
        delete weatherData.value[k]
        delete cacheMeta.value[k]
      })
    }
  }

  // --- Core API ---

  // Pide el clima de una o varias comunas, aplicando SWR si es posible
  async function fetchRegionWeather(regionSlug, comunasArray) {
    if (!comunasArray || comunasArray.length === 0) return []
    
    const now = Date.now()
    const TTL = 15 * 60 * 1000 // 15 minutos de frescura
    
    // Filtrar comunas que NECESITAN fetch (no están en caché o están STALE)
    const toFetch = comunasArray.filter(c => {
      const meta = cacheMeta.value[c.id]
      // Si no existe, necesita fetch
      if (!meta) return true
      // Si existe pero pasaron más de 15 min, es STALE -> necesita revalidate (background)
      if (now - meta.lastFetched > TTL) return true
      // Está fresco
      return false
    })

    // SWR: Si todas están FRESH, salimos inmediatamente. 
    // Si hay STALE/Nuevas, disparamos el fetch asíncronamente (o lo esperamos)
    if (toFetch.length === 0) {
      return comunasArray.map(c => weatherData.value[c.id])
    }

    // Petición a Open-Meteo
    const lats = toFetch.map(c => c.lat).join(',')
    const lons = toFetch.map(c => c.lon).join(',')
    
    const params = new URLSearchParams({
      latitude: lats,
      longitude: lons,
      current_weather: true,
      hourly: 'temperature_2m,apparent_temperature,relativehumidity_2m,precipitation_probability,weathercode,surface_pressure',
      daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_sum,windspeed_10m_max',
      timezone: 'auto',
      forecast_days: 7
    })

    try {
      const res = await fetch(`${WX_URL}?${params}`)
      const data = await res.json()
      
      const isArray = Array.isArray(data)
      const results = isArray ? data : [data]
      
      results.forEach((d, index) => {
        const comuna = toFetch[index]
        const cw = d.current_weather
        const isDay = cw.is_day ?? 1
        
        const ahora = new Date()
        const hHoy = ahora.getHours()
        const hIdx = d.hourly.time.findIndex(t => new Date(t).getHours() === hHoy)
        const startIdx = hIdx >= 0 ? hIdx : 0
        
        const pronosticoHoras = Array.from({ length: 12 }, (_, i) => {
          const idx = startIdx + i
          if (idx >= d.hourly.time.length) return null
          const t = new Date(d.hourly.time[idx])
          const code = d.hourly.weathercode[idx]
          const isN = (t.getHours() < 6 || t.getHours() >= 20) ? 0 : 1
          return {
            hora: t.getHours().toString().padStart(2, '0') + 'h',
            temp: Math.round(d.hourly.temperature_2m[idx]),
            estado: wmoToEstado(code, isN),
            prob: d.hourly.precipitation_probability[idx] ?? 0
          }
        }).filter(Boolean)

        const pronosticoSemanal = d.daily.time.map((t, i) => {
          const fecha = new Date(t + 'T12:00:00')
          const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
          return {
            dia: dias[fecha.getDay()],
            min: Math.round(d.daily.temperature_2m_min[i]),
            max: Math.round(d.daily.temperature_2m_max[i]),
            estado: wmoToEstado(d.daily.weathercode[i]),
            precip: d.daily.precipitation_sum[i] ?? 0
          }
        })

        const cityData = {
          id: comuna.id,
          nombre: comuna.nombre,
          pais: 'Chile',
          lat: comuna.lat,
          lon: comuna.lon,
          slugCity: comuna.id,
          slugRegion: regionSlug,
          tempActual: Math.round(cw.temperature),
          sensacion: Math.round(d.hourly.apparent_temperature[startIdx] ?? cw.temperature),
          estadoActual: wmoToEstado(cw.weathercode, isDay),
          estadoLabel: wmoToLabel(cw.weathercode),
          humedad: `${d.hourly.relativehumidity_2m[startIdx] ?? '–'}%`,
          viento: `${Math.round(cw.windspeed)} km/h`,
          presion: `${Math.round(d.hourly.surface_pressure[startIdx] ?? 1013)} hPa`,
          precipitacion: `${pronosticoSemanal[0]?.precip ?? 0} mm`,
          luna: getLuna(),
          pronosticoHoras,
          pronosticoSemanal,
          isLive: true
        }

        // Hydration Reactiva!
        weatherData.value[comuna.id] = cityData
        cacheMeta.value[comuna.id] = { lastFetched: Date.now(), status: 'FRESH' }
      })
      
      enforceCacheLimit()
      
      // Retorna los datos solicitados completos (mezclando caché y recién traídos)
      return comunasArray.map(c => weatherData.value[c.id]).filter(Boolean)
      
    } catch (e) {
      console.error('Error fetching region weather:', e)
      // Fallback SWR: Si falla el fetch pero había datos viejos, los devolvemos
      return comunasArray.map(c => weatherData.value[c.id]).filter(Boolean)
    }
  }

  // --- Getters ---

  // Obtiene el clima de una región entera (RegionView)
  function getRegionWeather(regionSlug, comunasArray) {
    if (!comunasArray) return []
    // O(1) lookup para cada ciudad en el array de entrada
    return comunasArray.map(c => weatherData.value[c.id]).filter(Boolean)
  }

  // Obtiene el clima de una sola ciudad (DetailView)
  function getCityWeather(regionSlug, cityId) {
    return weatherData.value[cityId] || null
  }

  return {
    weatherData,
    fetchRegionWeather,
    getRegionWeather,
    getCityWeather
  }
})
