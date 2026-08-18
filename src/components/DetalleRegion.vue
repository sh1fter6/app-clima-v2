<script setup>
import { computed } from 'vue'
import { getIcon, formatTemp } from '../data/weatherData'

const props = defineProps({
  region: Object, // Metadata de la región (desde regiones.json)
  climaPromedio: Object, // Datos climáticos computados
  unidad: { type: String, default: 'C' }
})

// Tipografía blanca, proporciones Fibonacci, sin borders/sombras como solicitó el usuario.
</script>

<template>
  <div class="detalle-region" v-if="region && climaPromedio">
    <div class="dr-header">
      <h2 class="dr-title">{{ region.nombre }}</h2>
      <p class="dr-desc">
        La región de {{ region.nombre }} ({{ region.numero }}) tiene un clima 
        <strong>{{ climaPromedio.estadoLabel.toLowerCase() }}</strong> con temperaturas que varían entre 
        los {{ formatTemp(climaPromedio.min, unidad) }} y {{ formatTemp(climaPromedio.max, unidad) }}.
      </p>
    </div>
    
    <div class="dr-data-container">
      <div class="dr-data">
        <span class="dr-temp-big">{{ formatTemp(climaPromedio.tempActual, unidad) }}</span>
        <span class="dr-estado">{{ climaPromedio.estadoLabel }}</span>
      </div>
      <div class="dr-icon">
        <img :src="getIcon(climaPromedio.estadoActual)" :alt="climaPromedio.estadoLabel" />
      </div>
    </div>
  </div>
  <div v-else-if="region" class="detalle-region loading-anim">
    <h2 class="dr-title" style="opacity:0.5">{{ region.nombre }}</h2>
    <p class="dr-desc">Calculando promedio en tiempo real de todas las comunas...</p>
  </div>
  <div v-else class="detalle-region empty">
    <p>Pasa el ratón sobre una región para ver su resumen climático.</p>
  </div>
</template>

<style scoped>
.detalle-region {
  color: #fff;
  font-family: 'Inter', sans-serif;
  max-width: 600px;
  padding: 2rem 0;
  transition: opacity 0.3s;
}

.empty {
  opacity: 0.5;
  font-weight: 300;
  font-size: 1.2rem;
  line-height: 1.6;
}

.dr-header {
  margin-bottom: 2rem;
}

.dr-title {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -1px;
  margin: 0 0 1rem 0;
  line-height: 1;
}

.dr-desc {
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.618; /* Golden ratio */
  opacity: 0.85;
  text-align: justify;
}

.dr-data-container {
  display: flex;
  align-items: center;
  justify-content: flex-end; /* Justificado a la derecha según req */
  gap: 2rem;
}

.dr-data {
  text-align: right;
  display: flex;
  flex-direction: column;
}

.dr-temp-big {
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
}

.dr-estado {
  font-size: 1.618rem;
  font-weight: 400;
  opacity: 0.7;
  margin-top: 0.5rem;
}

.dr-icon img {
  width: 120px;
  height: 120px;
  filter: drop-shadow(0 4px 12px rgba(255,255,255,0.1));
}
</style>
