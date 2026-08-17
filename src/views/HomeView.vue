<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const busqueda = ref('')

const ciudades = ref([
  { id: 1, nombre: "Santiago", tempActual: 18, estadoActual: "Soleado", icono: "fa-solid fa-sun text-warning" },
  { id: 2, nombre: "Pelotillehue", tempActual: 22, estadoActual: "Nublado", icono: "fa-solid fa-cloud text-secondary" },
  { id: 3, nombre: "Concepción", tempActual: 14, estadoActual: "Lluvioso", icono: "fa-solid fa-cloud-showers-heavy text-info" },
  { id: 4, nombre: "Ciudad de México", tempActual: 25, estadoActual: "Soleado", icono: "fa-solid fa-sun text-warning" },
  { id: 5, nombre: "Lima", tempActual: 19, estadoActual: "Nublado", icono: "fa-solid fa-cloud text-secondary" }
])

const ciudadesFiltradas = computed(() => {
  if (!busqueda.value) return ciudades.value
  const term = busqueda.value.toLowerCase().trim()
  return ciudades.value.filter(c => c.nombre.toLowerCase().includes(term))
})

function obtenerEstadoMod(estado) {
  const e = estado.toLowerCase()
  if (e === 'soleado') return 'sunny'
  if (e === 'nublado') return 'cloudy'
  return 'rainy'
}

function verDetalle(id) {
  router.push(`/lugar/${id}`)
}
</script>

<template>
  <main class="container my-5 weather-app__main">
    <section class="text-center mb-4 weather-header__banner">
      <h1 class="display-4 fw-bold text-white weather-header__title">Pronóstico del Clima (Vue 3 SPA)</h1>
      <p class="lead text-white weather-header__subtitle">Selecciona una ciudad para ver el pronóstico detallado de la semana</p>
    </section>

    <!-- Formulario de búsqueda interactivo con v-model (Requisito Módulo 6) -->
    <section class="row justify-content-center mb-5">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="input-group input-group-lg shadow-sm">
          <span class="input-group-text bg-white border-0"><i class="fa-solid fa-magnifying-glass text-muted"></i></span>
          <input 
            type="text" 
            class="form-control border-0" 
            placeholder="Buscar ciudad por nombre..." 
            v-model="busqueda"
          />
          <button v-if="busqueda" class="btn btn-white bg-white border-0 text-muted" @click="busqueda = ''">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>
    </section>

    <!-- Mensaje si no hay resultados (v-if / v-else) -->
    <section v-if="ciudadesFiltradas.length === 0" class="text-center py-5">
      <div class="alert alert-warning d-inline-block px-4 py-3 rounded-pill shadow-sm">
        <i class="fa-solid fa-circle-exclamation me-2"></i> No se encontraron ciudades que coincidan con "{{ busqueda }}".
      </div>
    </section>

    <!-- Grilla de ciudades con v-for -->
    <section v-else class="weather-app__grid-section">
      <div class="row g-4">
        <div v-for="city in ciudadesFiltradas" :key="city.id" class="col-12 col-md-6 col-lg-4">
          <article 
            class="card place-card h-100 p-4 text-center" 
            :class="'place-card--' + obtenerEstadoMod(city.estadoActual)"
            @click="verDetalle(city.id)"
          >
            <div class="card-body place-card__body d-flex flex-column justify-content-between">
              <div>
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <h2 class="place-card__name text-dark fw-bold m-0">{{ city.nombre }}</h2>
                  <span class="badge bg-success text-white">Vue 3 SFC</span>
                </div>
                <div class="place-card__icon mb-3 text-center"><i :class="city.icono"></i></div>
                <p class="place-card__temp text-primary mb-2">{{ city.tempActual }}°C</p>
                <span class="place-card__badge badge bg-info text-dark px-3 py-2 rounded-pill">{{ city.estadoActual }}</span>
              </div>
              <div class="mt-4">
                <button class="btn btn-primary btn-sm w-100 rounded-pill place-card__button">Ver Detalle</button>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </main>
</template>
