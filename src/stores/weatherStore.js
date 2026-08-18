import { defineStore } from 'pinia'
import { ref } from 'vue'
import capitalesData from '../data/chile-capitales.json'

const WX_URL = 'https://api.open-meteo.com/v1/forecast'

export const useWeatherStore = defineStore('weather', () => {
  // --- Invalidación de Caché (por ej. si cambian los cálculos internos) ---
  const CURRENT_CACHE_VERSION = '1.1'
  if (localStorage.getItem('weatherCacheVersion') !== CURRENT_CACHE_VERSION) {
    localStorage.removeItem('weatherData')
    localStorage.removeItem('cacheMeta')
    localStorage.setItem('weatherCacheVersion', CURRENT_CACHE_VERSION)
  }

  // 1. Diccionario de Hidratación (Datos Climáticos por Ciudad)
  const weatherData = ref(JSON.parse(localStorage.getItem('weatherData') || '{}'))
  
  // 2. Metadatos de Caché y Control (Stale-While-Revalidate)
  const cacheMeta = ref(JSON.parse(localStorage.getItem('cacheMeta') || '{}'))

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
    const lp = 2551442842; // ms en un ciclo lunar (29.53 días)
    const newMoon = new Date('2000-01-06T18:14:00Z').getTime();
    const phase = ((Date.now() - newMoon) % lp) / lp;
    
    if (phase < 0.05 || phase > 0.95) return 'Nueva';
    if (phase < 0.45) return 'Creciente';
    if (phase < 0.55) return 'Llena';
    return 'Menguante';
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
    
    // Guardar en localStorage para persistir entre recargas
    try {
      localStorage.setItem('weatherData', JSON.stringify(weatherData.value))
      localStorage.setItem('cacheMeta', JSON.stringify(cacheMeta.value))
    } catch (e) {
      console.warn('No se pudo guardar en localStorage', e)
    }
  }

  // --- Core API ---

  // Pide el clima de las 16 capitales al mismo tiempo (Batching optimizado)
  async function fetchAllCapitals() {
    const now = Date.now()
    const ONE_HOUR = 60 * 60 * 1000 // 1 hora de TTL para capitales
    
    // Convertimos el objeto capitalesData en array
    const capitalsArray = Object.values(capitalesData)
    
    const toFetch = capitalsArray.filter(c => {
      const meta = cacheMeta.value[c.id]
      if (!meta) return true
      if (now - meta.lastFetched > ONE_HOUR) return true
      return false
    })

    if (toFetch.length === 0) {
      return capitalsArray.map(c => weatherData.value[c.id])
    }

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
      
      if (data.error || (!isArray && toFetch.length > 1)) {
        console.warn('Límite o error de Open-Meteo al pedir capitales', data.reason)
        return
      }

      toFetch.forEach((cap, index) => {
        const d = isArray ? data[index] : data
        const current = d.current_weather || {}
        
        weatherData.value[cap.id] = {
          ...cap,
          tempActual: Math.round(current.temperature),
          estadoActual: wmoToEstado(current.weathercode, current.is_day),
          estadoLabel: wmoToLabel(current.weathercode),
          pronosticoHoras: [], // Simplificado para la vista regional
          pronosticoSemanal: [{
            min: Math.round(d.daily.temperature_2m_min[0]),
            max: Math.round(d.daily.temperature_2m_max[0])
          }],
          sensacion: Math.round(d.hourly?.apparent_temperature?.[0] ?? current.temperature),
          luna: getLuna(),
          humedad: (d.hourly?.relativehumidity_2m?.[0] ?? 50) + '%'
        }
        
        cacheMeta.value[cap.id] = { lastFetched: now }
      })

      enforceCacheLimit()
    } catch (err) {
      console.error('Error al fetchear capitales en batch', err)
    }
  }

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
      
      if (data.error || (!isArray && toFetch.length > 1)) {
        const reason = data.reason || 'Límite diario de solicitudes excedido'
        console.warn(`Rate limit o error de Open-Meteo para la región:`, reason)
        toFetch.forEach(comuna => {
          weatherData.value[comuna.id] = {
            ...comuna,
            tempActual: '--',
            estadoActual: 'cloudy',
            estadoLabel: 'Sin datos',
            pronosticoHoras: [],
            pronosticoSemanal: [],
            sensacion: '--'
          }
        })
        return
      }

      const results = isArray ? data : [data]
      
      results.forEach((d, index) => {
        const comuna = toFetch[index]
        if (!d || d.error || !d.current_weather) {
          weatherData.value[comuna.id] = {
            ...comuna,
            tempActual: '--',
            estadoActual: 'cloudy',
            estadoLabel: 'Sin datos',
            pronosticoHoras: [],
            pronosticoSemanal: [],
            sensacion: '--'
          }
          return
        }

        const cw = d.current_weather
        const isDay = cw.is_day ?? 1
        
        const ahora = new Date()
        const hHoy = ahora.getHours()
        let startIdx = 0
        if (d.hourly && d.hourly.time) {
          const hIdx = d.hourly.time.findIndex(t => new Date(t).getHours() === hHoy)
          startIdx = hIdx >= 0 ? hIdx : 0
        }
        
        const pronosticoHoras = (d.hourly && d.hourly.time) ? Array.from({ length: 12 }, (_, i) => {
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
        }).filter(Boolean) : []

        const pronosticoSemanal = (d.daily && d.daily.time) ? d.daily.time.map((t, i) => {
          const fecha = new Date(t + 'T12:00:00')
          const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']
          return {
            dia: dias[fecha.getDay()],
            min: Math.round(d.daily.temperature_2m_min[i]),
            max: Math.round(d.daily.temperature_2m_max[i]),
            estado: wmoToEstado(d.daily.weathercode[i]),
            precip: d.daily.precipitation_sum[i] ?? 0
          }
        }) : []

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

  // Devuelve la información de la capital precalculada
  function getCapitalWeather(regionSlug) {
    const capital = capitalesData[regionSlug]
    if (!capital) return null
    return weatherData.value[capital.id]
  }

  return {
    weatherData,
    fetchRegionWeather,
    getRegionWeather,
    getCityWeather,
    fetchAllCapitals,
    getCapitalWeather
  }
})
