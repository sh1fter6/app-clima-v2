<script setup>
import { getIcon, formatTemp } from '../data/weatherData'
import { useAuthStore } from '../stores/authStore'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

function handleFav() {
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  authStore.toggleFavorito(props.city.id, props.slugRegion)
}

const props = defineProps({
  city: { type: Object, required: true },
  index: { type: Number, required: true },
  unidad: { type: String, default: 'C' },
  regionName: { type: String, required: true },
  slugRegion: { type: String, required: true }
})

defineEmits(['click'])
</script>

<template>
  <div
    class="weather-card staggered-card"
    :style="{ animationDelay: `${(index % 12) * 0.08}s` }"
    @click="$emit('click')"
  >
    <div class="weather-card__header">
      <div>
        <span class="weather-card__city">{{ city.nombre }}</span>
        <span class="weather-card__country">{{ regionName }}, Chile</span>
      </div>
      <div style="display: flex; gap: 0.5rem; align-items: center;">
        <span class="weather-card__badge">{{ city.estadoLabel }}</span>
        <button @click.stop="handleFav" class="fav-btn" :class="{ 'is-fav': authStore.isFavorito(city.id) }" title="Guardar en favoritos">
          <i class="fa-solid fa-heart" v-if="authStore.isFavorito(city.id)"></i>
          <i class="fa-regular fa-heart" v-else></i>
        </button>
      </div>
    </div>

    <div class="weather-card__icon-wrap">
      <img :src="getIcon(city.estadoActual)" :alt="city.estadoLabel" />
    </div>

    <div class="weather-card__temp">{{ formatTemp(city.tempActual, unidad) }}</div>
    <div class="weather-card__condition">Sensación {{ formatTemp(city.sensacion, unidad) }}</div>

    <div class="weather-card__hourly">
      <div v-for="h in (city.pronosticoHoras || []).slice(0, 6)" :key="h.hora" class="weather-card__hour">
        <span class="weather-card__hour-time">{{ h.hora }}</span>
        <img class="weather-card__hour-icon" :src="getIcon(h.estado)" :alt="h.estado" />
        <span class="weather-card__hour-temp">{{ formatTemp(h.temp, unidad) }}</span>
      </div>
    </div>

    <div class="weather-card__minmax">
      <span>↑ <strong>{{ city.pronosticoSemanal && city.pronosticoSemanal[0] ? formatTemp(city.pronosticoSemanal[0].max, unidad) : '--' }}</strong></span>
      <span>↓ <strong>{{ city.pronosticoSemanal && city.pronosticoSemanal[0] ? formatTemp(city.pronosticoSemanal[0].min, unidad) : '--' }}</strong></span>
      <span class="weather-card__live-dot" title="Datos en vivo"></span>
    </div>
  </div>
</template>

<style scoped>
.fav-btn {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.fav-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
.fav-btn.is-fav {
  color: #ff4d4d;
  border-color: rgba(255, 77, 77, 0.3);
}
</style>
