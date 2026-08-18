<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '../stores/weatherStore'
import ChileMap from '../components/ChileMap.vue'
import ClimaLocal from '../components/ClimaLocal.vue'
import DetalleRegion from '../components/DetalleRegion.vue'
import { fetchWeather } from '../api/weatherService'
import { getRegionSlugFromAPI } from '../utils/slugify'

import comunasData from '../data/chile-comunas.json'
import regionesData from '../data/regiones.json'

const router = useRouter()
const weatherStore = useWeatherStore()

const regionActiva = ref(null)
const isLoadingRegion = ref(false)

const localWeather = ref(null)
const unidad = ref('C')

// Enter key handler
function onGlobalKeydown(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && regionActiva.value) {
    handleClick(regionActiva.value)
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onGlobalKeydown)
  
  // Geolocation
  try {
    const ipRes = await fetch('https://ipapi.co/json/')
    const ipData = await ipRes.json()
    const detectedSlug = getRegionSlugFromAPI(ipData.region)
    // Inicializamos con la región detectada o la Metropolitana por defecto
    regionActiva.value = detectedSlug !== 'global' ? detectedSlug : 'metropolitana'
  } catch(e) {
    regionActiva.value = 'metropolitana'
  }

  // Fetch clima local inicial (Santiago por defecto)
  try {
    localWeather.value = await fetchWeather({
      id: 'scl', nombre: 'Santiago', lat: -33.4569, lon: -70.6483
    })
  } catch (e) {
    console.error('Error fetching local weather')
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', onGlobalKeydown)
})

// Metadata de la región activa
const regionHoverData = computed(() => {
  if (!regionActiva.value) return null
  return regionesData.features.find(f => f.id === regionActiva.value || f.properties.slug === regionActiva.value)?.properties
})

// Computed para el clima promedio de la región activa
const regionHoverWeather = computed(() => {
  if (!regionActiva.value) return null
  const comunas = weatherStore.getRegionWeather(regionActiva.value, comunasData[regionActiva.value])
  if (!comunas || comunas.length === 0) return null

  // Promedio básico de la región
  let min = 999
  let max = -999
  let sumTemp = 0
  let modeCondition = {}

  comunas.forEach(c => {
    sumTemp += c.tempActual
    const dMin = c.pronosticoSemanal?.[0]?.min ?? 999
    const dMax = c.pronosticoSemanal?.[0]?.max ?? -999
    if (dMin < min) min = dMin
    if (dMax > max) max = dMax
    
    modeCondition[c.estadoActual] = (modeCondition[c.estadoActual] || 0) + 1
  })

  let estadoComun = 'cloudy'
  let maxOcurrencias = 0
  for (const estado in modeCondition) {
    if (modeCondition[estado] > maxOcurrencias) {
      maxOcurrencias = modeCondition[estado]
      estadoComun = estado
    }
  }

  // Encontramos una ciudad con ese estado para robarle el label (simplificación)
  const cityWithState = comunas.find(c => c.estadoActual === estadoComun)
  const estadoLabel = cityWithState ? cityWithState.estadoLabel : 'Variado'

  return {
    tempActual: Math.round(sumTemp / comunas.length),
    estadoActual: estadoComun,
    estadoLabel,
    min: min === 999 ? '--' : min,
    max: max === -999 ? '--' : max
  }
})

async function handleActiveRegion(slug) {
  regionActiva.value = slug
  if (!slug) return

  const comunas = comunasData[slug]
  if (comunas) {
    isLoadingRegion.value = true
    await weatherStore.fetchRegionWeather(slug, comunas)
    isLoadingRegion.value = false
  }
}

// Click para navegar a la región
function handleClick(regionId) {
  if (regionId) {
    router.push(`/${regionId}`)
  }
}
</script>

<template>
  <div class="home-layout">
    <div class="bg-black"></div>
    
    <div class="split-screen">
      <!-- Izquierda: Mapa SVG -->
      <div class="map-side">
        <ChileMap 
          :regionActiva="regionActiva" 
          @update:regionActiva="handleActiveRegion"
        />
        
        <!-- Botón flotante al centro -->
        <button class="go-region-btn" v-if="regionActiva" @click="handleClick(regionActiva)" aria-label="Ir a región">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>

      <!-- Derecha: Detalles interactivos -->
      <div class="details-side">
        <div class="info-content">
          <ClimaLocal 
            :clima="localWeather" 
            :unidad="unidad"
            localidad="Santiago, Chile" 
          />

          <transition name="fade" mode="out-in">
            <DetalleRegion 
              v-if="regionActiva"
              :key="regionActiva"
              :region="regionHoverData"
              :climaPromedio="regionHoverWeather"
              :unidad="unidad"
            />
            <div v-else class="empty-state">
              Desliza el mapa para descubrir el clima de Chile.
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-layout {
  min-height: 100vh;
  background-color: #050505; /* Fondo negro según reqs */
  color: #ffffff;
  overflow: hidden;
}

.bg-black {
  position: fixed;
  inset: 0;
  background: #050505;
  z-index: -1;
}

.split-screen {
  display: flex;
  height: 100vh;
}

.map-side {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.go-region-btn {
  position: absolute;
  right: 2rem;
  top: 50%;
  transform: translateY(-50%);
  width: 54px;
  height: 54px;
  border-radius: 50%;
  border: 2px solid #ffffff;
  background-color: #050505;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: background-color 0.2s, color 0.2s;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
}

.go-region-btn:hover {
  background-color: #ffffff;
  color: #050505;
}

.details-side {
  flex: 1;
  padding: 4rem;
  display: flex;
  flex-direction: column;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start; /* Fija ClimaLocal arriba para que no salte al aparecer DetalleRegion */
  padding-top: 2rem;
  gap: 2rem;
}

.empty-state {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.4;
  margin-top: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
