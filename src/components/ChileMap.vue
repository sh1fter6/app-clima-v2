<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import * as d3 from 'd3-geo'

const props = defineProps({
  regionActiva: String // Slug de la región seleccionada
})
const emit = defineEmits(['update:regionActiva'])

const svgContainer = ref(null)
const mapPaths = ref([])

onMounted(async () => {
  try {
    const res = await fetch('./chile-regiones.geojson')
    const geojson = await res.json()

    // Configurar proyección fija para Chile continental
    const projection = d3.geoMercator()
      .center([-71.0, -39.0])
      .scale(1200)
      .translate([160, 600]) 
    
    const pathGenerator = d3.geoPath().projection(projection)
    
    mapPaths.value = geojson.features.map(feature => {
      const nombreRegion = feature.properties.Region || feature.properties.nombre || ''
      
      let slug = 'desconocido'
      // Normalizamos: minúsculas y quitar tildes/acentos
      const nr = nombreRegion.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      
      if (nr.includes('arica')) slug = 'arica'
      else if (nr.includes('tarapac')) slug = 'tarapaca'
      else if (nr.includes('antofagasta')) slug = 'antofagasta'
      else if (nr.includes('atacama')) slug = 'atacama'
      else if (nr.includes('coquimbo')) slug = 'coquimbo'
      else if (nr.includes('valpara')) slug = 'valparaiso'
      else if (nr.includes('metropolitana')) slug = 'metropolitana'
      else if (nr.includes('higgins')) slug = 'ohiggins'
      else if (nr.includes('maule')) slug = 'maule'
      else if (nr.includes('nuble') || nr.includes('ñuble')) slug = 'nuble'
      else if (nr.includes('biob') || nr.includes('bio-bio') || nr.includes('bio bio')) slug = 'biobio'
      else if (nr.includes('araucan')) slug = 'araucania'
      else if (nr.includes('rios')) slug = 'losrios'
      else if (nr.includes('lagos')) slug = 'loslagos'
      else if (nr.includes('ays') || nr.includes('ais')) slug = 'aysen'
      else if (nr.includes('magallanes')) slug = 'magallanes'
      
      return {
        id: slug,
        nombre: nombreRegion,
        d: pathGenerator(feature)
      }
    })
    
    // Iniciar tracking de scroll
    if (svgContainer.value) {
      svgContainer.value.addEventListener('scroll', handleScroll, { passive: true })
      // Forzar evaluación inicial
      setTimeout(handleScroll, 100)
    }
    
  } catch (error) {
    console.error('Error cargando mapa:', error)
  }
})

onUnmounted(() => {
  if (svgContainer.value) {
    svgContainer.value.removeEventListener('scroll', handleScroll)
  }
})

// Scroll Tracking
let scrollTicking = false
function handleScroll() {
  if (!scrollTicking) {
    window.requestAnimationFrame(() => {
      updateActiveRegionFromScroll()
      scrollTicking = false
    })
    scrollTicking = true
  }
}

function updateActiveRegionFromScroll() {
  if (!svgContainer.value) return
  
  const containerRect = svgContainer.value.getBoundingClientRect()
  // Centro exacto del contenedor
  const centerY = containerRect.top + (containerRect.height / 2)
  
  const paths = svgContainer.value.querySelectorAll('.region-path')
  let closestId = null
  let minDistance = Infinity
  
  paths.forEach(path => {
    const rect = path.getBoundingClientRect()
    // Centro vertical del bounding box de esta región
    const pathCenterY = rect.top + (rect.height / 2)
    const distance = Math.abs(pathCenterY - centerY)
    
    if (distance < minDistance) {
      minDistance = distance
      closestId = path.getAttribute('data-id')
    }
  })
  
  if (closestId && props.regionActiva !== closestId) {
    emit('update:regionActiva', closestId)
  }
}
</script>

<template>
  <div class="chile-map-wrapper">
    <div class="chile-map-container" ref="svgContainer">
      <svg width="320" height="1300" viewBox="0 0 320 1200" class="chile-svg" preserveAspectRatio="xMidYMid meet">
        <path
          v-for="region in mapPaths"
          :key="region.id"
          :data-id="region.id"
          :d="region.d"
          :class="['region-path', { active: props.regionActiva === region.id }]"
          @click="emit('update:regionActiva', region.id)"
        >
          <title>{{ region.nombre }}</title>
        </path>
      </svg>
    </div>
    <!-- Indicador visual sutil de scroll -->
    <div class="scroll-fade top"></div>
    <div class="scroll-fade bottom"></div>
  </div>
</template>

<style scoped>
.chile-map-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.chile-map-container {
  height: 100%;
  width: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none; /* Ocultar scroll en Firefox */
  display: flex;
  justify-content: center;
  align-items: flex-start; /* Para que empiece desde arriba y no centrado */
  padding: 50vh 0; /* Padding dinámico para que Arica y Magallanes lleguen al centro */
  scroll-behavior: smooth;
}

.chile-map-container::-webkit-scrollbar {
  display: none; /* Ocultar scroll en Chrome/Safari */
}

/* Efectos de difuminado en los bordes para indicar que se puede deslizar */
.scroll-fade {
  position: absolute;
  left: 0;
  right: 0;
  height: 60px;
  pointer-events: none;
  z-index: 5;
}
.scroll-fade.top {
  top: 0;
  background: linear-gradient(to bottom, #050505 0%, transparent 100%);
}
.scroll-fade.bottom {
  bottom: 0;
  background: linear-gradient(to top, #050505 0%, transparent 100%);
}

.chile-svg {
  /* Se elimina el filtro drop-shadow por el gran impacto en rendimiento 
     con múltiples nodos SVG vectoriales y evento hover. */
  max-width: 100%;
}

.region-path {
  fill: rgba(255, 255, 255, 0.08);
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 0.8;
  transition: fill 0.15s ease, stroke-width 0.15s ease;
  cursor: pointer;
  will-change: fill; /* Optimizando para repintado rápido */
}

.region-path:hover,
.region-path.active {
  fill: rgba(255, 255, 255, 0.5);
  stroke: #ffffff;
  stroke-width: 1.5;
  /* Se cambia sombra vector por color sólido por rendimiento */
}
</style>
