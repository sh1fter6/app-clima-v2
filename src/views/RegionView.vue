<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWeatherStore } from '../stores/weatherStore'
import regionesData from '../data/regiones.json'
import comunasData from '../data/chile-comunas.json'
import ComunaCard from '../components/ComunaCard.vue'
import SkeletonCard from '../components/SkeletonCard.vue'
import { formatSlug } from '../utils/slugify'

const route = useRoute()
const router = useRouter()
const weatherStore = useWeatherStore()

const loading = ref(true)
const unidad = ref('C')

// ── Paginación y Lazy Loading ──
const page = ref(1)
const limit = 12
const sentinel = ref(null)
let observer = null

async function loadRegion(slug) {
  loading.value = true
  page.value = 1
  const comunas = comunasData[slug]
  if (comunas) {
    await weatherStore.fetchRegionWeather(slug, comunas)
  }
  loading.value = false
}

onMounted(() => {
  loadRegion(route.params.region)
  
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

const nombreOficialRegion = computed(() => {
  console.log('[DEBUG] route.params.region:', route.params.region)
  console.log('[DEBUG] regionMeta.value:', regionMeta.value)
  if (!regionMeta.value) return ''
  const val = `${regionMeta.value.numero} Región, ${regionMeta.value.nombre}`
  console.log('[DEBUG] nombreOficialRegion is:', val)
  return val
})

const ciudades = computed(() => {
  return weatherStore.getRegionWeather(route.params.region, comunasData[route.params.region]) || []
})

const ciudadesVisibles = computed(() => {
  return ciudades.value.slice(0, page.value * limit)
})

function verDetalle(city) {
  const citySlug = city.slugCity || formatSlug(city.nombre)
  router.push(`/${route.params.region}/${citySlug}`)
}
</script>

<template>
  <div>


    <main class="app-content">
      <div class="page-header" v-if="regionMeta">
        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
          <router-link to="/" class="circle-back-btn" aria-label="Volver al inicio">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </router-link>
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #fff; text-shadow: 0 2px 4px rgba(0,0,0,0.5); margin: 0;">
            {{ nombreOficialRegion }}
          </h1>
        </div>
      </div>

      <div v-if="loading" class="cards-grid">
        <SkeletonCard v-for="i in 12" :key="i" />
      </div>

      <div v-else class="cards-grid">
        <ComunaCard
          v-for="(city, index) in ciudadesVisibles"
          :key="city.id"
          :city="city"
          :index="index"
          :unidad="unidad"
          :regionName="regionMeta.nombre"
          @click="verDetalle(city)"
        />
      </div>
      
      <!-- Sentinela para el Lazy Loading -->
      <div ref="sentinel" class="sentinel" style="height: 10px; width: 100%;"></div>
    </main>
  </div>
</template>

<style scoped>
.app-content {
  padding-top: 6rem;
}

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
  transition: transform 0.2s, background 0.2s;
  flex-shrink: 0;
}

.circle-back-btn:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.2);
}

.page-header {
  margin-bottom: 2rem;
  color: #fff;
}

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
