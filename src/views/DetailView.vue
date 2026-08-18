<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useWeatherStore } from '../stores/weatherStore'
import { getIcon, formatTemp, calcStats, calcAlerts } from '../data/weatherData.js'
import comunasData from '../data/chile-comunas.json'

const route   = useRoute()
const weatherStore = useWeatherStore()

const unidad  = ref('C')
const ciudad  = ref(null)
const loading = ref(true)
const error   = ref('')

const stats  = computed(() => ciudad.value ? calcStats(ciudad.value.pronosticoSemanal) : null)
const alertas = computed(() => stats.value ? calcAlerts(stats.value, ciudad.value.tempActual) : [])
const bgClass = computed(() => {
  if (!ciudad.value) return 'weather-bg--cloudy'
  if (ciudad.value.estadoActual === 'sunny' && ciudad.value.tempActual >= 39) {
    return 'weather-bg--hot'
  }
  return `weather-bg--${ciudad.value.estadoActual}`
})

async function cargar() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
  loading.value = true
  error.value   = ''
  const region = route.params.region || 'global'
  const city = route.params.city
  
  // Intenta recuperar de la store (caché lazy-load)
  let cityData = weatherStore.getCityWeather(region, city)
  
  // Si no está, lo buscamos en el diccionario estático usando el ID (slug)
  if (!cityData) {
    const localCity = comunasData[region]?.find(c => c.id === city)
    if (localCity) {
      // Forzamos el fetch hidratando desde las coordenadas locales
      await weatherStore.fetchRegionWeather(region, [localCity])
      cityData = weatherStore.getCityWeather(region, city)
    }
  }
  // Si tenemos datos parciales (ej: de NavBar antigua) pero no el pronóstico
  else if (cityData && !cityData.pronosticoSemanal && cityData.lat && cityData.lon) {
    await weatherStore.fetchRegionWeather(region, [cityData])
    cityData = weatherStore.getCityWeather(region, city)
  }

  if (cityData && cityData.pronosticoSemanal) {
    ciudad.value = cityData
    loading.value = false
  } else {
    error.value = 'No se encontraron datos completos para esta ciudad. Asegúrate de tener conexión.'
    loading.value = false
  }
}

onMounted(() => cargar())
watch(() => [route.params.region, route.params.city], () => cargar())

const lunaEmoji = { 'Llena':'🌕','Nueva':'🌑','Creciente':'🌙','Menguante':'🌗','Cuarto creciente':'🌒' }
function lunaIcon(l) { return lunaEmoji[l] || '🌙' }
</script>

<template>
  <div>
    <div class="weather-bg" :class="bgClass">
      <div v-for="i in 14" :key="i" class="particle"
        :style="{ left: (Math.random()*100)+'%', width: (Math.random()*3+1.5)+'px', height: (Math.random()*3+1.5)+'px', animationDuration: (Math.random()*12+8)+'s', animationDelay: (Math.random()*10)+'s' }">
      </div>
    </div>

    <main class="app-content detail-page">

      <!-- Loading -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Obteniendo datos meteorológicos en tiempo real...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-state">
        <span>⚠️</span><p>{{ error }}</p>
        <router-link to="/" class="back-btn" style="margin-top:1rem;">← Volver</router-link>
      </div>

      <!-- Contenido real -->
      <template v-else-if="ciudad">

        <!-- ── HERO: ciudad / temp / métricas ──────────────────────────── -->
        <div class="d-hero staggered-item" style="animation-delay: 0.1s">
          <div class="d-hero__main">
            <div class="d-hero__city-row">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <router-link :to="`/${route.params.region}`" class="circle-back-btn" aria-label="Volver a la región">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                  </svg>
                </router-link>
                <div>
                  <span class="d-hero__city">{{ ciudad.nombre }}</span>
                  <span class="weather-card__live-dot" title="Datos en vivo" style="margin-left:0.5rem"></span>
                </div>
              </div>
              <div class="unit-toggle">
                <button :class="{ active: unidad==='C' }" @click="unidad='C'">°C</button>
                <button :class="{ active: unidad==='F' }" @click="unidad='F'">°F</button>
              </div>
            </div>

            <div class="d-hero__center">
              <img class="d-hero__icon" :src="getIcon(ciudad.estadoActual)" :alt="ciudad.estadoLabel" />
              <div>
                <div class="d-hero__temp">{{ formatTemp(ciudad.tempActual, unidad) }}</div>
                <div class="d-hero__condition">{{ ciudad.estadoLabel }}</div>
                <div class="d-hero__feels">Sensación {{ formatTemp(ciudad.sensacion, unidad) }}</div>
              </div>
            </div>
          </div>

          <div class="d-hero__divider"></div>

          <div class="d-hero__metrics">
            <div class="d-metric">
              <span class="d-metric__ic">💧</span>
              <div><div class="d-metric__lb">Humedad</div><div class="d-metric__vl">{{ ciudad.humedad }}</div></div>
            </div>
            <div class="d-metric">
              <span class="d-metric__ic">💨</span>
              <div><div class="d-metric__lb">Viento</div><div class="d-metric__vl">{{ ciudad.viento }}</div></div>
            </div>
            <div class="d-metric">
              <span class="d-metric__ic">📊</span>
              <div><div class="d-metric__lb">Presión</div><div class="d-metric__vl">{{ ciudad.presion }}</div></div>
            </div>
            <div class="d-metric">
              <span class="d-metric__ic">🌧️</span>
              <div><div class="d-metric__lb">Precipitación</div><div class="d-metric__vl">{{ ciudad.precipitacion }}</div></div>
            </div>
            <div class="d-metric">
              <span class="d-metric__ic">{{ lunaIcon(ciudad.luna) }}</span>
              <div><div class="d-metric__lb">Luna</div><div class="d-metric__vl">{{ ciudad.luna }}</div></div>
            </div>
            <div class="d-metric">
              <span class="d-metric__ic">📈</span>
              <div>
                <div class="d-metric__lb">Máx / Mín hoy</div>
                <div class="d-metric__vl">{{ formatTemp(ciudad.pronosticoSemanal[0]?.max, unidad) }} / {{ formatTemp(ciudad.pronosticoSemanal[0]?.min, unidad) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── SLIDER 12 HORAS ────────────────────────────────────────── -->
        <div class="hourly-section staggered-item" style="animation-delay: 0.2s">
          <h3 class="section-title">Próximas 12 horas</h3>
          <div class="hourly-strip">
            <div v-for="h in ciudad.pronosticoHoras" :key="h.hora" class="hourly-item">
              <span class="hourly-item__time">{{ h.hora }}</span>
              <img class="hourly-item__icon" :src="getIcon(h.estado)" :alt="h.estado" />
              <span class="hourly-item__temp">{{ formatTemp(h.temp, unidad) }}</span>
              <span v-if="h.prob > 0" class="hourly-item__prob">{{ h.prob }}%</span>
            </div>
          </div>
        </div>

        <!-- ── DOS COLUMNAS: alertas + pronóstico ─────────────────────── -->
        <div class="d-two-col staggered-item" style="animation-delay: 0.3s">
          <div class="glass-panel">
            <h3 class="section-title">Alertas</h3>
            <div v-for="(a, i) in alertas" :key="i" class="alert-item" :class="'alert-item--'+a.tipo">
              <div class="alert-item__icon">{{ a.icon }}</div>
              <div>
                <div class="alert-item__title">{{ a.titulo }}</div>
                <div class="alert-item__msg">{{ a.msg }}</div>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <h3 class="section-title">Pronóstico 7 días</h3>
            <div class="forecast-compact">
              <div v-for="(d, i) in ciudad.pronosticoSemanal" :key="i" class="forecast-compact__row">
                <span class="forecast-compact__day">{{ d.dia }}</span>
                <img class="forecast-compact__icon" :src="getIcon(d.estado)" :alt="d.estado" />
                <div class="forecast-compact__bar-wrap">
                  <span class="forecast-compact__min">{{ formatTemp(d.min, unidad) }}</span>
                  <div class="forecast-compact__bar">
                    <div class="forecast-compact__fill" :style="{ width: Math.min(100, Math.max(8, Math.round(((d.max-d.min)/25)*100)))+'%' }"></div>
                  </div>
                  <span class="forecast-compact__max">{{ formatTemp(d.max, unidad) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ── STATS ──────────────────────────────────────────────────── -->
        <div class="glass-panel staggered-item" style="animation-delay: 0.4s">
          <h3 class="section-title">Resumen semanal</h3>
          <div class="stats-inline">
            <div class="stat-pill"><span class="stat-pill__label">Mín</span><span class="stat-pill__val">{{ formatTemp(stats.min, unidad) }}</span></div>
            <div class="stat-pill"><span class="stat-pill__label">Máx</span><span class="stat-pill__val">{{ formatTemp(stats.max, unidad) }}</span></div>
            <div class="stat-pill"><span class="stat-pill__label">Prom</span><span class="stat-pill__val">{{ formatTemp(stats.promedio, unidad) }}</span></div>
            <div class="stat-pill"><span class="stat-pill__label">☀️</span><span class="stat-pill__val">{{ stats.soleados }}d</span></div>
            <div class="stat-pill"><span class="stat-pill__label">⛅</span><span class="stat-pill__val">{{ stats.nublados }}d</span></div>
            <div class="stat-pill"><span class="stat-pill__label">🌧️</span><span class="stat-pill__val">{{ stats.lluviosos }}d</span></div>
          </div>
          <div class="stats-summary">{{ stats.resumen }}</div>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>
.detail-page {
  padding-top: 6rem; /* Aire superior para evitar que el navbar fije tape contenido */
}

/* Botón circular sin borde, solo sombra, estilo neumórfico / glass */
.circle-back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  text-decoration: none;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: transform 0.2s, background 0.2s;
}

.circle-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

/* Transición Staggered Internal */
.staggered-item {
  opacity: 0;
  animation: fadeInUpScale 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
}

@keyframes fadeInUpScale {
  0% {
    opacity: 0;
    transform: translateY(15px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
