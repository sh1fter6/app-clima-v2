<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useWeatherStore } from '../stores/weatherStore'
import ChileMap from '../components/ChileMap.vue'
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

// Estado para el tutorial sobre el mapa
const showTutorial = ref(true)

// Enter key handler
function onGlobalKeydown(e) {
  if (e.key === 'Enter' && e.target.tagName !== 'INPUT' && regionActiva.value) {
    e.preventDefault()
    handleClick(regionActiva.value)
  }
}

onMounted(async () => {
  window.addEventListener('keydown', onGlobalKeydown)
  
  // Fetch batch de todas las capitales al inicio (caché 1 hora)
  try {
    await weatherStore.fetchAllCapitals()
  } catch(e) {
    console.error('Error pre-cargando capitales', e)
  }

  // Geolocation
  try {
    const ipRes = await fetch('https://ipapi.co/json/')
    const ipData = await ipRes.json()
    const detectedSlug = getRegionSlugFromAPI(ipData.region)
    // Inicializamos con la región detectada o la Metropolitana por defecto
    const initialRegion = detectedSlug !== 'global' ? detectedSlug : 'metropolitana'
    handleActiveRegion(initialRegion, true)
  } catch(e) {
    handleActiveRegion('metropolitana', true)
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

// Computed para el clima promedio (ahora sólo retorna el de la capital pre-cacheada)
const regionHoverWeather = computed(() => {
  if (!regionActiva.value) return null
  return weatherStore.getCapitalWeather(regionActiva.value)
})

let debounceFetchTimer = null
async function handleActiveRegion(slug, isInitial = false) {
  regionActiva.value = slug
  
  if (slug && showTutorial.value && !isInitial) {
    showTutorial.value = false // Oculta el tutorial al primer cambio
  }

  if (!slug) return
  
  // Ya no hacemos fetch aquí, los datos están cacheados
  const comunas = comunasData[slug]
  if (comunas) {
    regionHoverData.value = { id: slug, nombre: regionesData.features.find(f => f.id === slug || f.properties.slug === slug)?.properties.nombre, comunas }
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
          <!-- Tutorial Inline con espacio reservado (wrapper) para evitar solapamientos y saltos -->
          <div class="tutorial-wrapper">
            <transition name="fade">
              <div v-show="showTutorial" class="inline-tutorial">
                <p>Desliza el mapa para seleccionar una región</p>
                <span class="tutorial-arrow">↕</span>
              </div>
            </transition>
          </div>

          <DetalleRegion 
            v-if="regionActiva"
            :region="regionHoverData"
            :climaPromedio="regionHoverWeather"
            :unidad="unidad"
          />
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
  overflow-x: hidden;
}

.bg-black {
  position: fixed;
  inset: 0;
  background: #050505;
  z-index: -1;
}

.split-screen {
  display: flex;
  flex-wrap: wrap;
  min-height: 100vh;
  width: 100%;
}

.map-side {
  flex: 1 1 400px;
  position: relative;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  padding-left: clamp(10px, 3vw, 20px);
  overflow: hidden;
  max-height: 100vh;
}

.go-region-btn {
  position: absolute;
  right: clamp(1rem, 4vw, 2rem);
  top: 50%;
  transform: translateY(-50%);
  width: clamp(46px, 12vw, 54px);
  height: clamp(46px, 12vw, 54px);
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
  flex: 1 1 450px;
  padding: clamp(1.5rem, 5vw, 4rem);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.top-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: clamp(1rem, 3vw, 2rem);
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centrado vertical para bajar el bloque completo de forma armoniosa */
  gap: clamp(1.5rem, 4vw, 2rem);
  position: relative;
}

.tutorial-wrapper {
  height: 2rem;
  width: 100%;
  display: flex;
  align-items: flex-end;
}

/* Tutorial Inline (Sección derecha) */
.inline-tutorial {
  width: 100%;
  text-align: left;
  color: #fff;
  opacity: 0.7;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  align-items: center;
  gap: 0.5rem;
}

.tutorial-arrow {
  font-size: 1.5rem;
  display: inline-block;
  animation: slideFadeStretch 3s infinite ease-in-out;
}

@keyframes slideFadeStretch {
  /* Fase Hacia Arriba */
  0% { transform: translateY(0) scaleY(1); opacity: 1; }
  20% { transform: translateY(-8px) scaleY(1.3); opacity: 0; }
  25% { transform: translateY(0) scaleY(1); opacity: 0; }
  
  /* Fase Hacia Abajo */
  50% { transform: translateY(0) scaleY(1); opacity: 1; }
  70% { transform: translateY(8px) scaleY(1.3); opacity: 0; }
  75% { transform: translateY(0) scaleY(1); opacity: 0; }
  
  100% { transform: translateY(0) scaleY(1); opacity: 1; }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.8s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.empty-state {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  font-weight: 300;
  opacity: 0.4;
  margin-top: 0;
}

/* W3C Standard Structural Breakpoint */
@media (max-width: 850px) {
  .map-side {
    flex: 0 0 100%;
    aspect-ratio: 1 / 1;
    max-height: 60vh; /* Asegurarnos que en móvil no sea absurdamente grande si es una tablet vertical */
    border-bottom: 1px solid rgba(255,255,255,0.1);
  }
}
</style>
