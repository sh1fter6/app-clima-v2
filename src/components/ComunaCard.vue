<script setup>
import { getIcon, formatTemp } from '../data/weatherData'

defineProps({
  city: { type: Object, required: true },
  index: { type: Number, required: true },
  unidad: { type: String, default: 'C' },
  regionName: { type: String, required: true }
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
      <span class="weather-card__badge">{{ city.estadoLabel }}</span>
    </div>

    <div class="weather-card__icon-wrap">
      <img :src="getIcon(city.estadoActual)" :alt="city.estadoLabel" />
    </div>

    <div class="weather-card__temp">{{ formatTemp(city.tempActual, unidad) }}</div>
    <div class="weather-card__condition">Sensación {{ formatTemp(city.sensacion, unidad) }}</div>

    <div class="weather-card__hourly">
      <div v-for="h in city.pronosticoHoras.slice(0, 6)" :key="h.hora" class="weather-card__hour">
        <span class="weather-card__hour-time">{{ h.hora }}</span>
        <img class="weather-card__hour-icon" :src="getIcon(h.estado)" :alt="h.estado" />
        <span class="weather-card__hour-temp">{{ formatTemp(h.temp, unidad) }}</span>
      </div>
    </div>

    <div class="weather-card__minmax">
      <span>↑ <strong>{{ formatTemp(city.pronosticoSemanal[0]?.max, unidad) }}</strong></span>
      <span>↓ <strong>{{ formatTemp(city.pronosticoSemanal[0]?.min, unidad) }}</strong></span>
      <span class="weather-card__live-dot" title="Datos en vivo"></span>
    </div>
  </div>
</template>
