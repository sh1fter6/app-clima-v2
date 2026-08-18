<script setup>
import { computed } from 'vue'
import { getIcon, formatTemp } from '../data/weatherData'

const props = defineProps({
  region: Object, // Metadata de la región (desde regiones.json)
  climaPromedio: Object, // Datos climáticos computados
  unidad: { type: String, default: 'C' }
})

const weatherSuggestions = {
  sunny: 'Día ideal para actividades al aire libre.',
  night: 'Noche despejada, perfecta para descansar.',
  partly: 'Clima agradable con algunas nubes, excelente para un paseo.',
  cloudy: 'Cielo cubierto, buen momento para un café bajo techo.',
  rainy: 'Se esperan precipitaciones, no olvides salir con paraguas.',
  snow: 'Temperaturas bajo cero, abrígate muy bien si sales.',
  thunder: 'Condiciones inestables, se recomienda precaución.'
}

const suggestion = computed(() => {
  if (!props.climaPromedio) return ''
  return weatherSuggestions[props.climaPromedio.estadoActual] || 'Jornada variable, mantente preparado.'
})


</script>

<template>
  <div class="detalle-region" v-if="region">
    <div class="dr-top-row">
      <h2 class="dr-title">{{ region.nombre }}</h2>

      <div class="dr-data-container" v-if="climaPromedio">
        <div class="dr-data">
          <span class="dr-capital-name">{{ climaPromedio.nombre }}</span>
          <span class="dr-temp-big">{{ formatTemp(climaPromedio.tempActual, unidad) }}</span>
        </div>
        <div class="dr-icon">
          <img :src="getIcon(climaPromedio.estadoActual)" :alt="climaPromedio.estadoLabel" />
        </div>
      </div>
      <div class="dr-data-container skeleton" v-else>
        <div class="dr-data">
          <span class="dr-capital-name" style="opacity: 0.2">Cargando...</span>
          <span class="dr-temp-big" style="opacity: 0.2">--°C</span>
        </div>
        <div class="dr-icon" style="opacity: 0.2; width: clamp(60px, 15vw, 90px); height: clamp(60px, 15vw, 90px); border-radius: 50%; background: rgba(255,255,255,0.2);">
        </div>
      </div>
    </div>

    <p class="dr-desc" v-if="climaPromedio">
      El clima actual en <strong>{{ climaPromedio.nombre }}</strong>, capital de la región, es
      {{ climaPromedio.estadoLabel.toLowerCase() }} con temperaturas entre
      {{ formatTemp(climaPromedio.pronosticoSemanal[0]?.min ?? '--', unidad) }} y {{ formatTemp(climaPromedio.pronosticoSemanal[0]?.max ?? '--', unidad) }}.
      {{ suggestion }}
    </p>
    <p class="dr-desc loading-desc" v-else style="opacity: 0.4">
      Conectando con satélites meteorológicos...
    </p>
  </div>
  <div v-else class="detalle-region empty">
    <p>Desliza el mapa sobre una región para ver su resumen climático.</p>
  </div>
</template>

<style scoped>
.detalle-region {
  color: #fff;
  font-family: 'Inter', sans-serif;
  max-width: 600px;
  width: 100%;
  padding: 1rem 0; 
  transition: opacity 0.3s;
  min-height: 180px; /* Prevenir colapso vertical */
}

.empty {
  opacity: 0.5;
  font-weight: 300;
  font-size: 1.2rem;
  line-height: 1.6;
}

.dr-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  gap: 1rem; /* Espacio garantizado entre título y datos */
  flex-wrap: wrap; /* Permite saltar de línea si el nombre es muy largo */
}

.dr-title {
  font-size: clamp(2rem, 6vw, 2.8rem);
  font-weight: 700;
  letter-spacing: -1px;
  margin: 0;
  line-height: 1;
  flex: 1 1 auto; /* Permite crecer pero también saltar de línea si falta espacio */
}

.dr-data-container {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* Juntar más la temperatura y el ícono */
}

.dr-data {
  text-align: right;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
}

.dr-capital-name {
  font-size: clamp(1rem, 3vw, 1.3rem);
  font-weight: 500;
  opacity: 0.8;
  margin-bottom: -0.2rem;
  letter-spacing: -0.5px;
}

.dr-temp-big {
  font-size: clamp(2.5rem, 8vw, 3.5rem);
  font-weight: 800;
  line-height: 1;
  letter-spacing: -2px;
}

.dr-icon img {
  width: clamp(60px, 15vw, 90px);
  height: clamp(60px, 15vw, 90px);
  filter: drop-shadow(0 4px 12px rgba(255,255,255,0.1));
}

.dr-desc {
  font-size: 1.1rem;
  font-weight: 300;
  line-height: 1.618;
  opacity: 0.85;
  text-align: left; /* Justificado a la izquierda según tu instrucción */
  margin: 0;
  max-width: 90%;
}

@media (max-width: 620px) {
  .dr-top-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.2rem;
  }
}
</style>
