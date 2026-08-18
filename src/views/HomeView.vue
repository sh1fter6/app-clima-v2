<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '../stores/weatherStore'
import ChileMap from '../components/ChileMap.vue'
import ClimaLocal from '../components/ClimaLocal.vue'
import DetalleRegion from '../components/DetalleRegion.vue'
import { fetchWeather } from '../api/weatherService'

import comunasData from '../data/chile-comunas.json'
import regionesData from '../data/regiones.json'

const router = useRouter()
const weatherStore = useWeatherStore()

const regionHover = ref(null)
const isLoadingRegion = ref(false)

const localWeather = ref(null)
const unidad = ref('C')

// Fetch clima local inicial (Santiago por defecto)
onMounted(async () => {
  try {
    localWeather.value = await fetchWeather({
      id: 'scl', nombre: 'Santiago', lat: -33.4569, lon: -70.6483
    })
  } catch (e) {
    console.error('Error fetching local weather')
  }
})

// Metadata de la región hovered
const regionHoverData = computed(() => {
  if (!regionHover.value) return null
  return regionesData.features.find(f => f.id === regionHover.value || f.properties.slug === regionHover.value)?.properties
})

// Computed para el clima promedio de la región hovered
const regionHoverWeather = computed(() => {
  if (!regionHover.value) return null
  const comunas = weatherStore.getRegionWeather(regionHover.value)
  if (!comunas || comunas.length === 0) return null

  // Promedio básico de la región
  let min = 999
  let max = -999
  let sumTemp = 0
  let modeCondition = {}

  comunas.forEach(c => {
    sumTemp += c.tempActual
    const dMin = c.pronosticoSemanal[0]?.min
    const dMax = c.pronosticoSemanal[0]?.max
    if (dMin < min) min = dMin
    if (dMax > max) max = dMax
    
    modeCondition[c.estadoActual] = (modeCondition[c.estadoActual] || 0) + 1
  })

  const tempActual = Math.round(sumTemp / comunas.length)
  const estadoActual = Object.keys(modeCondition).reduce((a, b) => modeCondition[a] > modeCondition[b] ? a : b)
  
  // Encontramos una ciudad con ese estado para robarle el label (simplificación)
  const cityWithState = comunas.find(c => c.estadoActual === estadoActual)
  const estadoLabel = cityWithState ? cityWithState.estadoLabel : 'Variado'

  return { min, max, tempActual, estadoActual, estadoLabel }
})

// Manejo de Hover: disparamos el fetch lazy
async function handleHover(regionId) {
  regionHover.value = regionId
  if (regionId && !weatherStore.getRegionWeather(regionId)) {
    isLoadingRegion.value = true
    const comunas = comunasData[regionId]
    if (comunas) {
      await weatherStore.fetchRegionWeather(regionId, comunas)
    }
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
    <!-- El fondo dinámico se queda en negro puro según reqs -->
    <div class="bg-black"></div>
    
    <div class="split-screen">
      <!-- Izquierda: Mapa SVG -->
      <div class="map-side">
        <ChileMap 
          :regionActiva="regionHover" 
          @hover="handleHover"
          @click="handleClick"
        />
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
              v-if="regionHover"
              :key="regionHover"
              :region="regionHoverData"
              :climaPromedio="regionHoverWeather"
              :unidad="unidad"
            />
            <div v-else class="empty-state">
              Pasa el cursor sobre el mapa para descubrir el clima de Chile.
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
  flex: 0 0 35%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid rgba(255,255,255,0.05);
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
