<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWeatherStore } from '../stores/weatherStore'
import { getIcon, formatTemp } from '../data/weatherData'
import regionesData from '../data/regiones.json'
import comunasData from '../data/chile-comunas.json'
import SkeletonCard from '../components/SkeletonCard.vue'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()

const loading = ref(true)
const unidad = ref('C')

// Paginación y Lazy Loading
const page = ref(1)
const limit = 12
const sentinel = ref(null)
let observer = null

// Fetch al montar la vista
async function loadRegion(slug) {
  loading.value = true
  page.value = 1 // Resetear página
  const comunas = comunasData[slug]
  if (comunas) {
    await weatherStore.fetchRegionWeather(slug, comunas)
  }
  loading.value = false
}

onMounted(() => {
  loadRegion(route.params.region)
  
  // Intersection Observer para Lazy Loading
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !loading.value) {
      page.value++
    }
  }, { rootMargin: '200px' })
  
  if (sentinel.value) observer.observe(sentinel.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})

watch(() => route.params.region, newSlug => loadRegion(newSlug))
watch(sentinel, (el) => {
  if (el && observer) observer.observe(el)
})

const regionMeta = computed(() => {
  return regionesData.features.find(f => f.id === route.params.region || f.properties.slug === route.params.region)?.properties
})

const ciudades = computed(() => {
  return weatherStore.getRegionWeather(route.params.region, comunasData[route.params.region]) || []
})

const ciudadesVisibles = computed(() => {
  return ciudades.value.slice(0, page.value * limit)
})

import { formatSlug } from '../utils/slugify'

function verDetalle(city) {
  const citySlug = city.slugCity || formatSlug(city.nombre)
  router.push(`/${route.params.region}/${citySlug}`)
}
</script>

<template>
  <div>
    <!-- Fondo dinámico basado en el clima predominante -->
    <div class="weather-bg weather-bg--cloudy">
      <div v-for="i in 14" :key="i" class="particle"
        :style="{ left: (Math.random()*100)+'%', width: (Math.random()*3+1.5)+'px', height: (Math.random()*3+1.5)+'px', animationDuration: (Math.random()*12+8)+'s', animationDelay: (Math.random()*10)+'s' }">
      </div>
    </div>

    <main class="app-content">
      <div class="page-header" v-if="regionMeta">
        <router-link to="/" class="back-link">← Volver al Mapa de Chile</router-link>
        <h1>Región de {{ regionMeta.nombre }}</h1>
        <p>Datos en tiempo real para todas las comunas registradas</p>
      </div>

      <div v-if="loading" class="cards-grid">
        <SkeletonCard v-for="i in 12" :key="i" />
      </div>

      <div v-else class="cards-grid">
        <div
          v-for="(city, index) in ciudadesVisibles"
          :key="city.id"
          class="weather-card staggered-card"
          :style="{ animationDelay: `${(index % 12) * 0.08}s` }"
          @click="verDetalle(city)"
        >
          <div class="weather-card__header">
            <div>
              <span class="weather-card__city">{{ city.nombre }}</span>
              <span class="weather-card__country">{{ regionMeta.nombre }}, Chile</span>
            </div>
            <span class="weather-card__badge">{{ city.estadoLabel }}</span>
          </div>

          <div class="weather-card__icon-wrap">
            <img :src="getIcon(city.estadoActual)" :alt="city.estadoLabel" />
          </div>

          <div class="weather-card__temp">{{ formatTemp(city.tempActual, unidad) }}</div>
          <div class="weather-card__condition">Sensación {{ formatTemp(city.sensacion, unidad) }}</div>

          <div class="weather-card__hourly">
            <div v-for="h in city.pronosticoHoras.slice(0,6)" :key="h.hora" class="weather-card__hour">
              <span class="weather-card__hour-time">{{ h.hora }}</span>
              <img class="weather-card__hour-icon" :src="getIcon(h.estado)" :alt="h.estado" />
              <span class="weather-card__hour-temp">{{ formatTemp(h.temp, unidad) }}</span>
            </div>
          </div>

          <div class="weather-card__minmax">
            <span>↑ <strong>{{ formatTemp(city.pronosticoSemanal[0]?.max, unidad) }}</strong></span>
            <span>↓ <strong>{{ formatTemp(city.pronosticoSemanal[0]?.min, unidad) }}</strong></span>
            <span class="weather-card__live-dot" title="Datos en vivo"></span>
          </div>
        </div>
      </div>
      
      <!-- Sentinela para el Lazy Loading -->
      <div ref="sentinel" class="sentinel" style="height: 10px; width: 100%;"></div>
    </main>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-block;
  margin-bottom: 15px;
  color: #ff9800;
  text-decoration: none;
  font-weight: 500;
}
.back-link:hover {
  text-decoration: underline;
}
.page-header h1 {
  font-size: 2.2rem;
  margin-bottom: 5px;
  text-transform: capitalize;
}
.page-header p {
  color: #a0a0a0;
  font-size: 1rem;
}

/* Staggered Card Animation */
.staggered-card {
  opacity: 0;
  animation: fadeInUp 0.5s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
