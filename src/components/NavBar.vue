<script setup>
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import comunasData from '../data/chile-comunas.json'
import { formatSlug } from '../utils/slugify'
import { useWeatherStore } from '../stores/weatherStore'
import { getIcon } from '../data/weatherData'

const router = useRouter()
const weatherStore = useWeatherStore()

const busqueda = ref('')
const sugerencias = ref([])
const buscandoGeo = ref(false)
const selectedIndex = ref(-1)
const searchWrap = ref(null)
let debounceTimer = null

// Aplanamos todas las comunas en un solo array para búsqueda rápida
const todasLasComunas = []
for (const regionSlug in comunasData) {
  comunasData[regionSlug].forEach(c => {
    todasLasComunas.push({
      ...c,
      slugRegion: regionSlug,
      pais: 'Chile'
    })
  })
}

function closeSearch() {
  busqueda.value = ''
  sugerencias.value = []
  selectedIndex.value = -1
}

function handleClickOutside(event) {
  if (searchWrap.value && !searchWrap.value.contains(event.target)) {
    closeSearch()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  clearTimeout(debounceTimer)
  document.removeEventListener('click', handleClickOutside)
})

watch(busqueda, val => {
  sugerencias.value = []
  selectedIndex.value = -1
  clearTimeout(debounceTimer)
  const q = val.trim().toLowerCase()
  if (q.length < 2) return
  
  buscandoGeo.value = true
  debounceTimer = setTimeout(() => {
    // 1. Búsqueda local instantánea (O(1) filter)
    const encontradas = todasLasComunas
      .filter(c => c.nombre.toLowerCase().includes(q) || (c.id && c.id.includes(q)))
      .slice(0, 10)
    
    sugerencias.value = encontradas
    buscandoGeo.value = false // Mostramos los nombres al instante
    
    // 2. Hidratación asíncrona en Lotes (Batch SWR)
    const byRegion = {}
    sugerencias.value.forEach(s => {
      if (!byRegion[s.slugRegion]) byRegion[s.slugRegion] = []
      byRegion[s.slugRegion].push(s)
    })

    Object.keys(byRegion).forEach(async (regionSlug) => {
      const wDataArray = await weatherStore.fetchRegionWeather(regionSlug, byRegion[regionSlug])
      if (!wDataArray) return
      
      wDataArray.forEach(w => {
        const target = sugerencias.value.find(s => s.id === w.id)
        if (target) {
          target.temp = w.tempActual
          target.estado = w.estadoActual
        }
      })
    })
  }, 150)
})

function onArrowDown() {
  if (!sugerencias.value.length) return
  selectedIndex.value = (selectedIndex.value + 1) % sugerencias.value.length
}

function onArrowUp() {
  if (!sugerencias.value.length) return
  selectedIndex.value = selectedIndex.value <= 0 
    ? sugerencias.value.length - 1 
    : selectedIndex.value - 1
}

function onEnter() {
  if (!sugerencias.value.length) return
  if (selectedIndex.value >= 0) {
    goCity(sugerencias.value[selectedIndex.value])
  } else {
    goCity(sugerencias.value[0]) // Enter by default goes to the first match
  }
}

function goCity(s) {
  if (!s) return
  const region = s.slugRegion || 'global'
  router.push(`/${region}/${s.id}`)
  closeSearch()
}
</script>

<template>
  <nav class="sticky-nav">
    <!-- Logo (Izquierda) -->
    <router-link to="/" class="nav-pill brand-pill">
      ☁️ ClimaChile
    </router-link>
    
    <!-- Buscador (Derecha) -->
    <div class="nav-search-wrap" ref="searchWrap">
      <div class="nav-pill nav-search-pill">
        <span class="search-icon">🔍</span>
        <input
          class="search-input"
          type="text"
          placeholder="Buscar comuna o ciudad..."
          v-model="busqueda"
          autocomplete="off"
          @keydown.down.prevent="onArrowDown"
          @keydown.up.prevent="onArrowUp"
          @keydown.enter.prevent="onEnter"
          @keydown.esc.prevent="closeSearch"
        />
        <span v-if="buscandoGeo" class="search-spinner">…</span>
        <button v-else-if="busqueda" class="search-clear" @click="closeSearch">✕</button>
      </div>

      <!-- Dropdown -->
      <div v-if="sugerencias.length" class="nav-geo-dropdown">
        <button
          v-for="(s, i) in sugerencias" :key="s.id"
          class="nav-geo-dropdown__item"
          :class="{ 'is-selected': i === selectedIndex }"
          @click="goCity(s)"
          @mouseover="selectedIndex = i"
        >
          <span class="nav-geo-dropdown__city">{{ s.nombre }}</span>
          <span class="nav-geo-dropdown__temp" v-if="s.temp !== undefined">
            {{ s.temp }}°C
            <img :src="getIcon(s.estado)" class="nav-geo-dropdown__icon" />
          </span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sticky-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 3rem;
  z-index: 1000;
  background: transparent;
  pointer-events: none;
}

.sticky-nav > * {
  pointer-events: auto;
}

.nav-pill {
  display: flex;
  align-items: center;
  border-radius: 999px;
  height: 48px;
  padding: 0 1.25rem;
  box-sizing: border-box;
}

.brand-pill {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: background 0.3s ease;
}

.brand-pill:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-search-wrap {
  position: relative;
  width: 320px;
  margin: 0;
}

.nav-search-pill {
  background: #000000;
  border: 1px solid #333333;
  width: 100%;
}

.search-icon {
  font-size: 0.9rem;
  color: #888;
  margin-right: 0.5rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: #fff;
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  width: 100%;
}

.search-spinner {
  color: #888;
  font-size: 0.8rem;
}

.search-clear {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  padding: 0 0.2rem;
}

.search-clear:hover {
  color: #fff;
}

.nav-geo-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #0a0a0a;
  border: 1px solid #333333;
  border-radius: 16px;
  overflow: hidden;
  z-index: 1001;
  box-shadow: 0 8px 24px rgba(0,0,0,0.5);
}

.nav-geo-dropdown__item {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1.25rem;
  background: transparent;
  border: none;
  border-bottom: 1px solid #222;
  cursor: pointer;
  transition: background 0.2s;
  color: #fff;
}

.nav-geo-dropdown__item:last-child {
  border-bottom: none;
}

.nav-geo-dropdown__item:hover,
.nav-geo-dropdown__item.is-selected {
  background: rgba(255, 255, 255, 0.1);
}

.nav-geo-dropdown__city {
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-geo-dropdown__temp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #ddd;
}

.nav-geo-dropdown__icon {
  width: 24px;
  height: 24px;
}
</style>
