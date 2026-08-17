<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const unidad = ref('C')

const dataset = ref([
  {
    id: 1,
    nombre: "Santiago",
    tempActual: 18,
    estadoActual: "Soleado",
    icono: "fa-solid fa-sun text-warning",
    humedad: "45%",
    viento: "12 km/h",
    pronosticoSemanal: [
      { dia: "Lunes", min: 10, max: 24, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Martes", min: 12, max: 26, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Miércoles", min: 9, max: 20, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Jueves", min: 8, max: 18, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Viernes", min: 7, max: 19, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Sábado", min: 11, max: 22, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Domingo", min: 13, max: 25, estado: "Soleado", icono: "fa-solid fa-sun text-warning" }
    ]
  },
  {
    id: 2,
    nombre: "Pelotillehue",
    tempActual: 22,
    estadoActual: "Nublado",
    icono: "fa-solid fa-cloud text-secondary",
    humedad: "80%",
    viento: "18 km/h",
    pronosticoSemanal: [
      { dia: "Lunes", min: 15, max: 22, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Martes", min: 18, max: 25, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Miércoles", min: 17, max: 23, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Jueves", min: 16, max: 24, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Viernes", min: 19, max: 26, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Sábado", min: 20, max: 28, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Domingo", min: 22, max: 30, estado: "Soleado", icono: "fa-solid fa-sun text-warning" }
    ]
  },
  {
    id: 3,
    nombre: "Concepción",
    tempActual: 14,
    estadoActual: "Lluvioso",
    icono: "fa-solid fa-cloud-showers-heavy text-info",
    humedad: "90%",
    viento: "8 km/h",
    pronosticoSemanal: [
      { dia: "Lunes", min: 10, max: 14, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Martes", min: 9, max: 13, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Miércoles", min: 8, max: 15, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Jueves", min: 7, max: 14, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Viernes", min: 6, max: 12, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Sábado", min: 8, max: 16, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Domingo", min: 9, max: 18, estado: "Soleado", icono: "fa-solid fa-sun text-warning" }
    ]
  },
  {
    id: 4,
    nombre: "Ciudad de México",
    tempActual: 25,
    estadoActual: "Soleado",
    icono: "fa-solid fa-sun text-warning",
    humedad: "40%",
    viento: "10 km/h",
    pronosticoSemanal: [
      { dia: "Lunes", min: 14, max: 26, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Martes", min: 15, max: 27, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Miércoles", min: 16, max: 28, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Jueves", min: 15, max: 25, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Viernes", min: 14, max: 24, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Sábado", min: 13, max: 25, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Domingo", min: 12, max: 26, estado: "Soleado", icono: "fa-solid fa-sun text-warning" }
    ]
  },
  {
    id: 5,
    nombre: "Lima",
    tempActual: 19,
    estadoActual: "Nublado",
    icono: "fa-solid fa-cloud text-secondary",
    humedad: "85%",
    viento: "15 km/h",
    pronosticoSemanal: [
      { dia: "Lunes", min: 16, max: 20, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Martes", min: 16, max: 21, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Miércoles", min: 17, max: 22, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Jueves", min: 15, max: 20, estado: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
      { dia: "Viernes", min: 16, max: 21, estado: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
      { dia: "Sábado", min: 17, max: 23, estado: "Soleado", icono: "fa-solid fa-sun text-warning" },
      { dia: "Domingo", min: 16, max: 22, estado: "Soleado", icono: "fa-solid fa-sun text-warning" }
    ]
  }
])

const ciudad = computed(() => {
  const id = route.params.id
  return dataset.value.find(c => c.id == id) || dataset.value[0]
})

const stats = computed(() => {
  if (!ciudad.value) return { min: 0, max: 0, promedio: 0, soleados: 0, nublados: 0, lluviosos: 0, resumen: '' }
  const pronostico = ciudad.value.pronosticoSemanal
  let minTotal = pronostico[0].min
  let maxTotal = pronostico[0].max
  let sumaPromedios = 0
  const conteos = { "Soleado": 0, "Nublado": 0, "Lluvioso": 0 }

  pronostico.forEach(dia => {
    if (dia.min < minTotal) minTotal = dia.min
    if (dia.max > maxTotal) maxTotal = dia.max
    sumaPromedios += (dia.min + dia.max) / 2
    if (conteos[dia.estado] !== undefined) conteos[dia.estado]++
  })

  const promedioTotal = (sumaPromedios / pronostico.length).toFixed(1)
  let resumen = "Clima muy variado esta semana."
  if (conteos["Soleado"] > conteos["Nublado"] && conteos["Soleado"] > conteos["Lluvioso"]) {
    resumen = "Semana mayormente soleada y templada."
  } else if (conteos["Lluvioso"] > conteos["Soleado"]) {
    resumen = "Semana con precipitaciones frecuentes."
  } else if (conteos["Nublado"] > conteos["Soleado"]) {
    resumen = "Semana predominantemente cubierta y nublada."
  }

  return {
    min: minTotal,
    max: maxTotal,
    promedio: promedioTotal,
    soleados: conteos["Soleado"],
    nublados: conteos["Nublado"],
    lluviosos: conteos["Lluvioso"],
    resumen: resumen
  }
})

const alertas = computed(() => {
  const res = []
  const s = stats.value
  const tempActual = ciudad.value ? ciudad.value.tempActual : 0

  if (s.max >= 25 || tempActual >= 25) {
    res.push({
      tipo: "danger",
      icono: "fa-solid fa-fire text-danger",
      titulo: "Alerta de Altas Temperaturas",
      mensaje: `Se registran temperaturas de hasta ${tempFormateada(s.max)}. Se recomienda hidratación constante.`
    })
  }

  if (s.lluviosos >= 2) {
    res.push({
      tipo: "warning",
      icono: "fa-solid fa-cloud-showers-heavy text-warning",
      titulo: "Alerta de Lluvias Frecuentes",
      mensaje: `Se pronostican ${s.lluviosos} días con precipitaciones. Lleva tu paraguas.`
    })
  }

  if (s.min <= 10) {
    res.push({
      tipo: "info",
      icono: "fa-solid fa-snowflake text-info",
      titulo: "Alerta de Bajas Temperaturas Matinales",
      mensaje: `Mínimas de ${tempFormateada(s.min)} registradas en la semana. Abrígate bien temprano.`
    })
  }

  if (res.length === 0) {
    res.push({
      tipo: "success",
      icono: "fa-solid fa-circle-check text-success",
      titulo: "Condiciones Favorables",
      mensaje: "El tiempo se mantiene moderado sin alertas meteorológicas severas."
    })
  }

  return res
})

function tempFormateada(valorCelsius) {
  const num = parseFloat(valorCelsius)
  if (isNaN(num)) return '0°C'
  if (unidad.value === 'F') {
    const fah = Math.round((num * 9 / 5) + 32)
    return `${fah}°F`
  }
  return `${Math.round(num)}°C`
}
</script>

<template>
  <main class="container my-5 weather-app__main">
    <div v-if="!ciudad" class="text-center py-5">
      <div class="alert alert-danger d-inline-block px-4 py-3 rounded-pill shadow-sm">
        <i class="fa-solid fa-triangle-exclamation me-2"></i> Ciudad no encontrada.
      </div>
      <div class="mt-3">
        <router-link to="/" class="btn btn-outline-light rounded-pill px-4">Volver al Inicio</router-link>
      </div>
    </div>

    <div v-else class="row g-4">
      <div class="col-12 col-lg-4">
        <article class="card detail-card p-4 text-center h-100 d-flex flex-column justify-content-center">
          <h1 class="display-4 fw-bold text-dark mb-2">{{ ciudad.nombre }}</h1>
          <div class="display-1 my-3"><i :class="ciudad.icono"></i></div>
          
          <!-- Selector de Unidad °C / °F con v-model / @click (Interacción Módulo 6) -->
          <div class="d-flex justify-content-center align-items-center mb-3">
            <span class="display-3 fw-bold text-primary me-3">{{ tempFormateada(ciudad.tempActual) }}</span>
            <div class="btn-group btn-group-sm" role="group">
              <button 
                type="button" 
                class="btn" 
                :class="unidad === 'C' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="unidad = 'C'"
              >°C</button>
              <button 
                type="button" 
                class="btn" 
                :class="unidad === 'F' ? 'btn-primary' : 'btn-outline-primary'" 
                @click="unidad = 'F'"
              >°F</button>
            </div>
          </div>

          <p class="fs-4 text-secondary mb-4">{{ ciudad.estadoActual }}</p>
          <div class="row g-2 mt-2">
            <div class="col-6">
              <div class="p-3 bg-weather-info text-start">
                <small class="text-muted d-block uppercase text-xs">Humedad</small>
                <span class="fs-5 fw-bold text-dark">{{ ciudad.humedad }}</span>
              </div>
            </div>
            <div class="col-6">
              <div class="p-3 bg-weather-info text-start">
                <small class="text-muted d-block uppercase text-xs">Viento</small>
                <span class="fs-5 fw-bold text-dark">{{ ciudad.viento }}</span>
              </div>
            </div>
          </div>
        </article>
      </div>

      <div class="col-12 col-lg-8">
        <!-- Alertas de Clima -->
        <section class="card detail-card p-4 mb-4">
          <h2 class="h4 fw-bold text-dark mb-3"><i class="fa-solid fa-triangle-exclamation text-warning me-2"></i>Alertas de Clima</h2>
          <div v-for="(alerta, idx) in alertas" :key="idx" :class="'alert alert-' + alerta.tipo" class="d-flex align-items-center mb-3 shadow-sm" role="alert">
            <i :class="alerta.icono" class="fs-4 me-3"></i>
            <div>
              <strong class="d-block">{{ alerta.titulo }}</strong>
              <span>{{ alerta.mensaje }}</span>
            </div>
          </div>
        </section>

        <!-- Pronóstico de la semana -->
        <section class="card detail-card p-4 d-flex flex-column justify-content-between mb-4">
          <h2 class="h3 fw-bold text-dark mb-4">Pronóstico de la Semana</h2>
          <div class="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-7 g-3">
            <div v-for="(day, idx) in ciudad.pronosticoSemanal" :key="idx" class="col">
              <div class="card forecast-item p-2 h-100 text-center">
                <p class="text-muted fw-bold mb-1 small">{{ day.dia }}</p>
                <div class="fs-3 my-1"><i :class="day.icono"></i></div>
                <p class="fw-bold text-dark mb-1 small">{{ tempFormateada(day.min) }} - {{ tempFormateada(day.max) }}</p>
                <small class="text-secondary d-block" style="font-size: 0.7rem; line-height: 1.1;">{{ day.estado }}</small>
              </div>
            </div>
          </div>
        </section>

        <!-- Estadísticas de la semana -->
        <section class="card detail-card p-4">
          <h2 class="h3 fw-bold text-dark mb-4">Estadísticas de la semana</h2>
          <div class="row g-3">
            <div class="col-md-4">
              <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                <h4 class="h5 text-muted mb-2">Min / Max</h4>
                <p class="fs-4 fw-bold text-primary mb-0">{{ tempFormateada(stats.min) }} / {{ tempFormateada(stats.max) }}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                <h4 class="h5 text-muted mb-2">Promedio</h4>
                <p class="fs-4 fw-bold text-primary mb-0">{{ tempFormateada(stats.promedio) }}</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                <h4 class="h5 text-muted mb-2">Días</h4>
                <small class="d-block fw-bold text-dark">{{ stats.soleados }} Soleados</small>
                <small class="d-block fw-bold text-dark">{{ stats.nublados }} Nublados</small>
                <small class="d-block fw-bold text-dark">{{ stats.lluviosos }} Lluviosos</small>
              </div>
            </div>
          </div>
          <div class="mt-4 p-3 bg-info bg-opacity-10 rounded text-center">
            <p class="fs-5 fw-bold text-dark mb-0">{{ stats.resumen }}</p>
          </div>
          <div class="mt-4 text-end">
            <router-link to="/" class="btn btn-outline-secondary rounded-pill px-4">Volver al Inicio</router-link>
          </div>
        </section>
      </div>
    </div>
  </main>
</template>
