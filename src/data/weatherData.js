// Datos mock de clima para las 5 ciudades
export const CITIES = [
  {
    id: 1,
    nombre: "Santiago",
    estadoActual: "sunny",
    estadoLabel: "Soleado",
    tempActual: 28,
    sensacion: 30,
    humedad: "42%",
    viento: "14 km/h",
    presion: "1013 hPa",
    precipitacion: "0 mm",
    luna: "Creciente",
    pronosticoHoras: [
      { hora: "13h", estado: "sunny",  temp: 27 },
      { hora: "14h", estado: "sunny",  temp: 28 },
      { hora: "15h", estado: "sunny",  temp: 29 },
      { hora: "16h", estado: "cloudy", temp: 27 },
      { hora: "17h", estado: "cloudy", temp: 25 },
      { hora: "18h", estado: "sunny",  temp: 24 },
      { hora: "19h", estado: "cloudy", temp: 22 },
      { hora: "20h", estado: "night",  temp: 21 },
      { hora: "21h", estado: "night",  temp: 20 },
      { hora: "22h", estado: "night",  temp: 19 },
      { hora: "23h", estado: "night",  temp: 18 },
      { hora: "00h", estado: "night",  temp: 17 }
    ],
    pronosticoSemanal: [
      { dia: "Lun", min: 14, max: 28, estado: "sunny" },
      { dia: "Mar", min: 15, max: 30, estado: "sunny" },
      { dia: "Mié", min: 12, max: 24, estado: "cloudy" },
      { dia: "Jue", min: 10, max: 20, estado: "rainy" },
      { dia: "Vie", min: 11, max: 22, estado: "cloudy" },
      { dia: "Sáb", min: 13, max: 26, estado: "sunny" },
      { dia: "Dom", min: 14, max: 27, estado: "sunny" }
    ]
  },
  {
    id: 2,
    nombre: "Pelotillehue",
    estadoActual: "cloudy",
    estadoLabel: "Nublado",
    tempActual: 22,
    sensacion: 20,
    humedad: "78%",
    viento: "18 km/h",
    presion: "1008 hPa",
    precipitacion: "2 mm",
    luna: "Llena",
    pronosticoHoras: [
      { hora: "13h", estado: "cloudy", temp: 22 },
      { hora: "14h", estado: "cloudy", temp: 22 },
      { hora: "15h", estado: "rainy",  temp: 20 },
      { hora: "16h", estado: "rainy",  temp: 19 },
      { hora: "17h", estado: "cloudy", temp: 19 },
      { hora: "18h", estado: "cloudy", temp: 18 },
      { hora: "19h", estado: "rainy",  temp: 17 },
      { hora: "20h", estado: "night",  temp: 16 },
      { hora: "21h", estado: "night",  temp: 16 },
      { hora: "22h", estado: "night",  temp: 15 },
      { hora: "23h", estado: "night",  temp: 15 },
      { hora: "00h", estado: "night",  temp: 14 }
    ],
    pronosticoSemanal: [
      { dia: "Lun", min: 15, max: 22, estado: "cloudy" },
      { dia: "Mar", min: 14, max: 20, estado: "rainy" },
      { dia: "Mié", min: 13, max: 21, estado: "rainy" },
      { dia: "Jue", min: 16, max: 24, estado: "cloudy" },
      { dia: "Vie", min: 18, max: 26, estado: "sunny" },
      { dia: "Sáb", min: 19, max: 28, estado: "sunny" },
      { dia: "Dom", min: 20, max: 29, estado: "sunny" }
    ]
  },
  {
    id: 3,
    nombre: "Concepción",
    estadoActual: "rainy",
    estadoLabel: "Lluvioso",
    tempActual: 12,
    sensacion: 9,
    humedad: "92%",
    viento: "22 km/h",
    presion: "1002 hPa",
    precipitacion: "12 mm",
    luna: "Nueva",
    pronosticoHoras: [
      { hora: "13h", estado: "rainy",  temp: 13 },
      { hora: "14h", estado: "rainy",  temp: 12 },
      { hora: "15h", estado: "rainy",  temp: 11 },
      { hora: "16h", estado: "rainy",  temp: 11 },
      { hora: "17h", estado: "cloudy", temp: 12 },
      { hora: "18h", estado: "cloudy", temp: 11 },
      { hora: "19h", estado: "rainy",  temp: 10 },
      { hora: "20h", estado: "night",  temp: 9  },
      { hora: "21h", estado: "night",  temp: 9  },
      { hora: "22h", estado: "night",  temp: 8  },
      { hora: "23h", estado: "night",  temp: 8  },
      { hora: "00h", estado: "night",  temp: 7  }
    ],
    pronosticoSemanal: [
      { dia: "Lun", min: 8, max: 12, estado: "rainy" },
      { dia: "Mar", min: 7, max: 11, estado: "rainy" },
      { dia: "Mié", min: 8, max: 13, estado: "cloudy" },
      { dia: "Jue", min: 6, max: 11, estado: "rainy" },
      { dia: "Vie", min: 5, max: 10, estado: "rainy" },
      { dia: "Sáb", min: 7, max: 14, estado: "cloudy" },
      { dia: "Dom", min: 9, max: 17, estado: "sunny" }
    ]
  },
  {
    id: 4,
    nombre: "Ciudad de México",
    estadoActual: "sunny",
    estadoLabel: "Soleado",
    tempActual: 26,
    sensacion: 28,
    humedad: "38%",
    viento: "10 km/h",
    presion: "1016 hPa",
    precipitacion: "0 mm",
    luna: "Menguante",
    pronosticoHoras: [
      { hora: "13h", estado: "sunny",  temp: 26 },
      { hora: "14h", estado: "sunny",  temp: 26 },
      { hora: "15h", estado: "sunny",  temp: 27 },
      { hora: "16h", estado: "sunny",  temp: 26 },
      { hora: "17h", estado: "cloudy", temp: 24 },
      { hora: "18h", estado: "cloudy", temp: 22 },
      { hora: "19h", estado: "cloudy", temp: 20 },
      { hora: "20h", estado: "night",  temp: 19 },
      { hora: "21h", estado: "night",  temp: 18 },
      { hora: "22h", estado: "night",  temp: 17 },
      { hora: "23h", estado: "night",  temp: 16 },
      { hora: "00h", estado: "night",  temp: 16 }
    ],
    pronosticoSemanal: [
      { dia: "Lun", min: 14, max: 27, estado: "sunny" },
      { dia: "Mar", min: 15, max: 28, estado: "sunny" },
      { dia: "Mié", min: 16, max: 29, estado: "sunny" },
      { dia: "Jue", min: 14, max: 25, estado: "cloudy" },
      { dia: "Vie", min: 13, max: 24, estado: "rainy" },
      { dia: "Sáb", min: 12, max: 25, estado: "cloudy" },
      { dia: "Dom", min: 13, max: 27, estado: "sunny" }
    ]
  },
  {
    id: 5,
    nombre: "Lima",
    estadoActual: "cloudy",
    estadoLabel: "Nublado",
    tempActual: 19,
    sensacion: 18,
    humedad: "86%",
    viento: "14 km/h",
    presion: "1010 hPa",
    precipitacion: "0.5 mm",
    luna: "Cuarto creciente",
    pronosticoHoras: [
      { hora: "13h", estado: "cloudy", temp: 19 },
      { hora: "14h", estado: "cloudy", temp: 19 },
      { hora: "15h", estado: "cloudy", temp: 20 },
      { hora: "16h", estado: "cloudy", temp: 19 },
      { hora: "17h", estado: "rainy",  temp: 18 },
      { hora: "18h", estado: "cloudy", temp: 17 },
      { hora: "19h", estado: "cloudy", temp: 16 },
      { hora: "20h", estado: "night",  temp: 15 },
      { hora: "21h", estado: "night",  temp: 15 },
      { hora: "22h", estado: "night",  temp: 14 },
      { hora: "23h", estado: "night",  temp: 14 },
      { hora: "00h", estado: "night",  temp: 13 }
    ],
    pronosticoSemanal: [
      { dia: "Lun", min: 16, max: 20, estado: "cloudy" },
      { dia: "Mar", min: 16, max: 21, estado: "cloudy" },
      { dia: "Mié", min: 17, max: 22, estado: "cloudy" },
      { dia: "Jue", min: 15, max: 19, estado: "rainy" },
      { dia: "Vie", min: 16, max: 20, estado: "cloudy" },
      { dia: "Sáb", min: 17, max: 23, estado: "sunny" },
      { dia: "Dom", min: 16, max: 22, estado: "sunny" }
    ]
  }
]

// Mapeo de estado → icono Meteocons CDN
// Iconos locales desde @meteocons/svg (instalado en node_modules)
import clearDay   from '@meteocons/svg/fill/clear-day.svg'
import clearNight from '@meteocons/svg/fill/clear-night.svg'
import cloudy     from '@meteocons/svg/fill/cloudy.svg'
import rain       from '@meteocons/svg/fill/rain.svg'
import thunder    from '@meteocons/svg/fill/thunderstorms-day.svg'
import snow       from '@meteocons/svg/fill/snow.svg'
import partlyCloudy from '@meteocons/svg/fill/partly-cloudy-day.svg'
import partlyCloudyNight from '@meteocons/svg/fill/partly-cloudy-night.svg'

export const WEATHER_ICONS = {
  sunny:  clearDay,
  cloudy: cloudy,
  rainy:  rain,
  night:  clearNight,
  partly: partlyCloudy,
  'partly-night': partlyCloudyNight,
  thunder: thunder,
  snow:   snow,
}

export function getIcon(estado) {
  return WEATHER_ICONS[estado] || WEATHER_ICONS.sunny
}

// Convertir °C a °F
export function toFahrenheit(c) {
  return Math.round((parseFloat(c) * 9 / 5) + 32)
}

export function formatTemp(val, unidad) {
  const n = parseFloat(val)
  if (isNaN(n)) return '–'
  return unidad === 'F' ? `${toFahrenheit(n)}°F` : `${Math.round(n)}°C`
}

// Calcular estadísticas semanales
export function calcStats(pronostico) {
  let minT = pronostico[0].min, maxT = pronostico[0].max, suma = 0
  const c = { sunny: 0, cloudy: 0, rainy: 0 }
  pronostico.forEach(d => {
    if (d.min < minT) minT = d.min
    if (d.max > maxT) maxT = d.max
    suma += (d.min + d.max) / 2
    if (c[d.estado] !== undefined) c[d.estado]++
  })
  const promedio = (suma / pronostico.length).toFixed(1)
  let resumen = 'Semana con clima variado.'
  if (c.sunny > c.cloudy && c.sunny > c.rainy) resumen = 'Semana mayormente soleada.'
  else if (c.rainy > c.sunny) resumen = 'Semana con precipitaciones frecuentes.'
  else if (c.cloudy > c.sunny) resumen = 'Semana predominantemente nublada.'
  return { min: minT, max: maxT, promedio, soleados: c.sunny, nublados: c.cloudy, lluviosos: c.rainy, resumen }
}

// Generar alertas
export function calcAlerts(stats, tempActual) {
  const res = []
  if (stats.max >= 25 || tempActual >= 25)
    res.push({ tipo: 'danger', icon: '<i class="fa-solid fa-fire"></i>', titulo: 'Altas Temperaturas', msg: `Máxima de ${stats.max}°C. Mantén hidratación.` })
  if (stats.lluviosos >= 2)
    res.push({ tipo: 'warning', icon: '<i class="fa-solid fa-cloud-showers-heavy"></i>', titulo: 'Lluvias Frecuentes', msg: `${stats.lluviosos} días con precipitaciones previstas.` })
  if (stats.min <= 10)
    res.push({ tipo: 'info', icon: '<i class="fa-solid fa-snowflake"></i>', titulo: 'Bajas Temperaturas', msg: `Mínima de ${stats.min}°C. Abrígate por las mañanas.` })
  if (!res.length)
    res.push({ tipo: 'success', icon: '<i class=\"fa-solid fa-check-circle\"></i>', titulo: 'Condiciones Favorables', msg: 'Sin alertas meteorológicas activas.' })
  return res
}
