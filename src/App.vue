<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useWeatherStore } from './stores/weatherStore'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const weatherStore = useWeatherStore()

const globalBgClass = computed(() => {
  if (route.name === 'home' || route.path === '/') {
    return 'weather-bg--black'
  }
  if (route.name === 'region') {
    return 'weather-bg--cloudy'
  }
  if (route.name === 'detail') {
    const region = route.params.region
    const citySlug = route.params.city
    const weather = weatherStore.getCityWeather(region, citySlug)
    if (!weather) return 'weather-bg--cloudy'
    if (weather.tempActual > 25) return 'weather-bg--hot'
    return `weather-bg--${weather.estadoActual}`
  }
  return 'weather-bg--cloudy'
})
</script>

<template>
  <div class="app-layout">
    <div class="weather-bg" :class="globalBgClass"></div>
    <NavBar />

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <footer class="app-footer">
      <p>© 2026 ClimaChile | Sitio por Martin Poquet para portafolio | Bootcamp front-end trainee Sence, Sustantiva Spa</p>
    </footer>
  </div>
</template>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #000;
}
/* Evitamos que router-view se solape incorrectamente */
.app-layout > .main-content {
  flex: 1;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sticky-nav {
  background: transparent;
}

.app-footer {
  text-align: center;
  padding: 1.5rem;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.6);
  background: rgba(0, 0, 0, 0.3);
  margin-top: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
  z-index: 10;
}

/* Transición global para rutas */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
