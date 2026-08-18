<script setup>
import { onMounted, onUnmounted, nextTick, ref, watch } from 'vue'
import * as d3 from 'd3-geo'

const props = defineProps({ regionActiva: String })
const emit = defineEmits(['update:regionActiva'])

const svgContainer = ref(null)
const mapPaths = ref([])
const regionOrder = ref([]) // slugs norte → sur

const SVG_HEIGHT = 1300
const SVG_VIEWBOX_H = 1200
const SVG_SCALE = SVG_HEIGHT / SVG_VIEWBOX_H

const centroids = {}   // { slug: [cx, cy] } — coordenadas SVG
const anchors = {}     // { slug: scrollTop } — posiciones de anclaje calculadas

let isProgrammaticScroll = false
let _progTimer = null
// Activa el flag y reinicia el único timer compartido — evita que timers
// anteriores lo reseteen mientras un scroll nuevo está en curso
function setProg(ms = 700) {
  isProgrammaticScroll = true
  clearTimeout(_progTimer)
  _progTimer = setTimeout(() => { isProgrammaticScroll = false }, ms)
}

function unlockScroll() {
  isProgrammaticScroll = false
  clearTimeout(_progTimer)
}

function ts() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}:${String(d.getSeconds()).padStart(2,'0')}.${String(d.getMilliseconds()).padStart(3,'0')}`
}
function dbg(label, msg) {
  const line = `[${ts()}] ${label.padEnd(8)} ${msg}`
  fetch('/dev-log', { method: 'POST', body: line }).catch(() => {})
}

// ── Utilidades ───────────────────────────────────────────────────────────────
function slugFromName(name) {
  const n = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  if (n.includes('arica'))          return 'arica'
  if (n.includes('tarapac'))        return 'tarapaca'
  if (n.includes('antofagasta'))    return 'antofagasta'
  if (n.includes('atacama'))        return 'atacama'
  if (n.includes('coquimbo'))       return 'coquimbo'
  if (n.includes('valpara'))        return 'valparaiso'
  if (n.includes('metropolitana'))  return 'metropolitana'
  if (n.includes('higgins'))        return 'ohiggins'
  if (n.includes('maule'))          return 'maule'
  if (n.includes('nuble') || n.includes('ñuble')) return 'nuble'
  if (n.includes('biob') || n.includes('bio-bio') || n.includes('bio bio')) return 'biobio'
  if (n.includes('araucan'))        return 'araucania'
  if (n.includes('rios'))           return 'losrios'
  if (n.includes('lagos'))          return 'loslagos'
  if (n.includes('ays') || n.includes('ais')) return 'aysen'
  if (n.includes('magallanes'))     return 'magallanes'
  return 'desconocido'
}

// Calcula el scrollTop que centra cada región en el viewport
function computeAnchors() {
  const container = svgContainer.value
  if (!container) return
  const containerH = container.clientHeight
  const maxSt = container.scrollHeight - containerH // Límite máximo de scroll físico
  const paddingTop = window.innerHeight * 0.3 // coincidir con CSS 30vh

  for (const [slug, [, cy]] of Object.entries(centroids)) {
    let idealSt = Math.round(paddingTop + cy * SVG_SCALE - containerH / 2)
    // Forzar el anclaje a los límites físicos del scroll para que siempre sean alcanzables (Arica)
    if (idealSt < 0) idealSt = 0
    if (maxSt > 0 && idealSt > maxSt) idealSt = maxSt
    anchors[slug] = idealSt
  }
}

// Encuentra el slug cuya ancla está más cerca del scrollTop actual
function nearestAnchor(scrollTop) {
  let nearest = null
  let minDist = Infinity
  for (const [slug, anchorTop] of Object.entries(anchors)) {
    const dist = Math.abs(anchorTop - scrollTop)
    if (dist < minDist) { minDist = dist; nearest = slug }
  }
  return nearest
}

// ── Montaje ──────────────────────────────────────────────────────────────────
onMounted(async () => {
  try {
    const res = await fetch('./chile-regiones.geojson')
    const geojson = await res.json()

    const projection = d3.geoMercator()
      .center([-71.0, -39.0])
      .scale(1200)
      .translate([160, 600])

    const pathGenerator = d3.geoPath().projection(projection)

    const paths = geojson.features.map(feature => {
      const nombre = feature.properties.Region || feature.properties.nombre || ''
      const id = slugFromName(nombre)
      centroids[id] = pathGenerator.centroid(feature)
      return { id, nombre, d: pathGenerator(feature) }
    })

    // Ordenar norte → sur por centroide Y
    paths.sort((a, b) => (centroids[a.id]?.[1] ?? 0) - (centroids[b.id]?.[1] ?? 0))
    mapPaths.value = paths
    regionOrder.value = paths.map(p => p.id)

    // Esperar al render del DOM antes de calcular anchors
    await nextTick()
    computeAnchors()

    const container = svgContainer.value
    container.addEventListener('scroll', handleScroll, { passive: true })
    container.addEventListener('wheel', unlockScroll, { passive: true })
    container.addEventListener('touchmove', unlockScroll, { passive: true })
    container.addEventListener('mousedown', unlockScroll, { passive: true })
    window.addEventListener('keydown', handleArrowKey, { capture: true })
    window.addEventListener('resize', computeAnchors)

    // Posición inicial
    setTimeout(() => {
      if (props.regionActiva) scrollToRegion(props.regionActiva, 'instant')
    }, 100)

  } catch (err) {
    console.error('Error cargando mapa:', err)
  }
})

onUnmounted(() => {
  const container = svgContainer.value
  if (container) {
    container.removeEventListener('scroll', handleScroll)
    container.removeEventListener('wheel', unlockScroll)
    container.removeEventListener('touchmove', unlockScroll)
    container.removeEventListener('mousedown', unlockScroll)
  }
  window.removeEventListener('keydown', handleArrowKey, { capture: true })
  window.removeEventListener('resize', computeAnchors)
})

// ── Scroll manual → región ───────────────────────────────────────────────────
let scrollTicking = false
let lastLogSt = -999
function handleScroll() {
  if (isProgrammaticScroll) return
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      const st = Math.round(svgContainer.value.scrollTop)
      if (Math.abs(st - lastLogSt) >= 3) {
        dbg('SCROLL', `scrollTop=${st}  isProg=${isProgrammaticScroll}`)
        lastLogSt = st
      }
      const slug = nearestAnchor(st)
      if (slug && slug !== props.regionActiva) {
        dbg('REGION', `${props.regionActiva} → ${slug}`)
        emit('update:regionActiva', slug)
      }
      scrollTicking = false
    })
    scrollTicking = true
  }
}

// ── Flechas → región + scroll ────────────────────────────────────────────
let keyNavTimer = null
let pendingSlug = null   // destino acumulado por presses rápidos

function handleArrowKey(e) {
  if (!svgContainer.value || !regionOrder.value.length) return
  if (e.target.tagName === 'INPUT') return
  if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return

  e.preventDefault()
  e.stopPropagation()

  // Base de navegación: el destino pendiente o la región actual
  const base = pendingSlug || props.regionActiva
  const idx = regionOrder.value.indexOf(base)
  if (idx === -1) return

  const nextIdx = e.key === 'ArrowDown'
    ? Math.min(idx + 1, regionOrder.value.length - 1)
    : Math.max(idx - 1, 0)

  pendingSlug = regionOrder.value[nextIdx]
  dbg('KEY', `${e.key}  base=${base}(${idx}) → ${pendingSlug}(${nextIdx})`)

  // Emitir selección inmediatamente para feedback visual instantáneo
  emit('update:regionActiva', pendingSlug)

  // Debounce: lanzar el scroll solo cuando paren los presses
  clearTimeout(keyNavTimer)
  keyNavTimer = setTimeout(() => {
    const target = pendingSlug
    pendingSlug = null
    setProg(700)
    dbg('GOTO', `anchor[${target}]=${anchors[target]}  behavior=smooth`)
    scrollToRegion(target, 'smooth')
  }, 80)
}

// ── Scroll programático ───────────────────────────────────────────────────────
function scrollToRegion(slug, behavior = 'smooth') {
  const container = svgContainer.value
  const top = anchors[slug]
  if (container && top !== undefined) {
    container.scrollTo({ top, behavior })
  }
}

// Si la región cambia desde fuera (geolocalización inicial), seguir el scroll
watch(() => props.regionActiva, (newVal) => {
  if (newVal) {
    const currentSt = svgContainer.value ? Math.round(svgContainer.value.scrollTop) : 0
    const slugNow = nearestAnchor(currentSt)
    // Solo animar si el cambio viene de afuera (no del scroll nativo en curso)
    if (slugNow !== newVal) {
      setProg(600)
      scrollToRegion(newVal, 'smooth')
    }
  }
})
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
          @click="() => { setProg(600); emit('update:regionActiva', region.id); scrollToRegion(region.id) }"
        >
          <title>{{ region.nombre }}</title>
        </path>
      </svg>
    </div>
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
  scrollbar-width: none;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 30vh 0;
}

.chile-map-container::-webkit-scrollbar {
  display: none;
}

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
  max-width: 100%;
}

.region-path {
  fill: rgba(255, 255, 255, 0.08);
  stroke: rgba(255, 255, 255, 0.9);
  stroke-width: 0.8;
  transition: fill 0.15s ease, stroke-width 0.15s ease;
  cursor: pointer;
}

.region-path.active {
  fill: rgba(255, 255, 255, 0.5);
  stroke: #ffffff;
  stroke-width: 1.5;
}
</style>
