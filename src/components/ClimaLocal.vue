<script setup>
import { getIcon, formatTemp } from '../data/weatherData'

const props = defineProps({
  localidad: String,
  clima: Object,
  unidad: { type: String, default: 'C' }
})
</script>

<template>
  <div class="clima-local">
    <div class="cl-top">
      <span class="cl-ubicacion">📍 {{ localidad || 'Ubicación actual' }}</span>
    </div>

    <div class="cl-main" v-if="clima">
      <span class="cl-temp">{{ formatTemp(clima.tempActual, unidad) }}</span>
      <div class="cl-estado-wrap">
        <img :src="getIcon(clima.estadoActual)" :alt="clima.estadoLabel" class="cl-icon" />
        <span class="cl-estado">{{ clima.estadoLabel }}</span>
      </div>
    </div>
    <div class="cl-main cl-skeleton" v-else>
      <span class="cl-temp">--°</span>
      <div class="cl-estado-wrap">
        <span class="cl-estado" style="opacity:0.4">Cargando...</span>
      </div>
    </div>

    <div class="cl-meta" v-if="clima">
      Sensación térmica {{ formatTemp(clima.sensacion, unidad) }} • 💧 {{ clima.humedad }}
    </div>
  </div>
</template>

<style scoped>
.clima-local {
  color: #fff;
  font-family: 'Inter', sans-serif;
  margin-top: 1rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.cl-top {
  margin-bottom: 1rem;
}

.cl-ubicacion {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.7;
}

.cl-main {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.cl-temp {
  font-size: 4rem;
  font-weight: 700;
  line-height: 1;
}

.cl-estado-wrap {
  display: flex;
  flex-direction: column;
}

.cl-icon {
  width: 50px;
  height: 50px;
}

.cl-estado {
  font-size: 1rem;
  font-weight: 500;
  margin-top: 0.25rem;
}

.cl-meta {
  font-size: 0.9rem;
  opacity: 0.6;
}
</style>
