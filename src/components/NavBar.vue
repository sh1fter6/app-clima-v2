<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import comunasData from '../data/chile-comunas.json'
import { formatSlug } from '../utils/slugify'
import { useWeatherStore } from '../stores/weatherStore'
import { useAuthStore } from '../stores/authStore'
import { getIcon } from '../data/weatherData'

const router = useRouter()
const weatherStore = useWeatherStore()
const authStore = useAuthStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const searchActive = ref(false)

function toggleSearchMobile() {
  searchActive.value = !searchActive.value
  if (!searchActive.value) {
    busqueda.value = ''
    sugerencias.value = []
  }
}

const busqueda = ref('')
const sugerencias = ref([])
const buscandoGeo = ref(false)
const selectedIndex = ref(-1)
const searchWrap = ref(null)
let debounceTimer = null

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
  searchActive.value = false
}

function handleClickOutside(event) {
  if (searchWrap.value && !searchWrap.value.contains(event.target)) {
    closeSearch()
  }
}

function handleEsc(event) {
  if (event.key === 'Escape') {
    closeSearch()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEsc)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEsc)
  clearTimeout(debounceTimer)
})

watch(busqueda, val => {
  sugerencias.value = []
  selectedIndex.value = -1
  clearTimeout(debounceTimer)
  const q = val.trim().toLowerCase()
  if (q.length < 2) return
  
  buscandoGeo.value = true
  debounceTimer = setTimeout(() => {
    const encontradas = todasLasComunas
      .filter(c => c.nombre.toLowerCase().includes(q) || (c.id && c.id.includes(q)))
      .slice(0, 10)
    
    sugerencias.value = encontradas
    buscandoGeo.value = false
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
    goCity(sugerencias.value[0])
  }
}

function goCity(s) {
  if (!s) return
  const region = s.slugRegion || 'global'
  router.push(`/${region}/${s.id}`)
  closeSearch()
}

function handleFav(s) {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    closeSearch()
    return
  }
  authStore.toggleFavorito(s.id, s.slugRegion)
}
</script>

<template>
  <nav class="sticky-nav" :class="{ 'search-is-active': searchActive }">
    <router-link to="/" class="nav-pill brand-pill">
      <i class="fa-solid fa-cloud"></i> ClimaChile
    </router-link>
    
    <div class="nav-actions">
      <!-- Botón de Perfil / Login -->
      <router-link to="/login" class="nav-pill action-btn" title="Perfil">
        <span class="icon"><i class="fa-solid fa-user"></i></span>
      </router-link>

      <!-- Buscador -->
      <div class="nav-search-wrap" ref="searchWrap">
        <div class="nav-pill nav-search-pill" :class="{ 'is-active': searchActive }">
          <button class="search-icon-btn" @click="toggleSearchMobile">
            <span class="search-icon"><i class="fa-solid fa-search"></i></span>
          </button>
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
        <span v-if="buscandoGeo" class="search-spinner"><i class="fa-solid fa-spinner fa-spin"></i></span>
        <button v-else-if="busqueda" class="search-clear" @click="closeSearch"><i class="fa-solid fa-times"></i></button>
      </div>

      <!-- Dropdown -->
      <div v-if="sugerencias.length" class="nav-geo-dropdown">
        <div
          v-for="(s, i) in sugerencias" :key="s.id"
          class="nav-geo-dropdown__item"
          :class="{ 'is-selected': i === selectedIndex }"
          @click="goCity(s)"
          @mouseover="selectedIndex = i"
          role="button"
          tabindex="0"
        >
          <span class="nav-geo-dropdown__city">{{ s.nombre }}</span>
          <div style="display: flex; align-items: center; gap: 0.75rem;">
            <span class="nav-geo-dropdown__temp" v-if="s.temp !== undefined">
              {{ s.temp }}°C
              <img :src="getIcon(s.estado)" class="nav-geo-dropdown__icon" />
            </span>
            <button @click.stop="handleFav(s)" class="fav-btn-small" :class="{ 'is-fav': authStore.isFavorito(s.id) }" title="Guardar en favoritos">
              <i class="fa-solid fa-heart" v-if="authStore.isFavorito(s.id)"></i>
              <i class="fa-regular fa-heart" v-else></i>
            </button>
          </div>
        </div>
      </div>
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
  pointer-events: none;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
  pointer-events: auto;
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
  transition: background 0.3s ease, opacity 0.3s ease;
  white-space: nowrap;
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

.search-icon-btn {
  background: none;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.search-icon {
  font-size: 1rem;
  color: #888;
}

.search-input {
  flex: 1;
  margin-left: 0.5rem;
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
  font-family: inherit;
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

@media (max-width: 620px) {
  .sticky-nav {
    padding: 0 1rem;
    gap: 0.5rem;
    justify-content: space-between;
  }
  
  .sticky-nav.search-is-active .brand-pill,
  .sticky-nav.search-is-active .action-btn {
    opacity: 0;
    pointer-events: none;
  }
  
  .nav-actions {
    gap: 0.5rem;
  }

  .nav-search-wrap {
    width: 48px;
    height: 48px;
    position: relative;
  }
  
  .nav-search-pill {
    padding: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(255, 255, 255, 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
  }
  .nav-search-pill.is-active {
    width: calc(100vw - 2rem);
    max-width: none;
    border-radius: 24px;
    padding: 0 1rem;
    background: rgba(30, 30, 30, 0.95);
    z-index: 10;
    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  }
  .search-input {
    display: none;
  }
  .nav-search-pill.is-active .search-input {
    display: block;
    width: 100%;
  }
  .search-icon-btn {
    color: white;
    font-size: 1.2rem;
    width: 48px;
    height: 48px;
  }
  .nav-search-pill.is-active .search-icon-btn {
    display: none;
  }
  .nav-search-pill.is-active .search-icon-btn {
    display: none;
  }
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  text-decoration: none;
  font-size: 1.2rem;
  transition: all 0.3s ease, opacity 0.3s ease;
}

.action-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.fav-btn-small {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
  font-size: 1.1rem;
}
.fav-btn-small:hover {
  color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}
.fav-btn-small.is-fav {
  color: #ff4d4d;
}
</style>
