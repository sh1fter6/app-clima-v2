<template>
  <div class="login-view" :class="{ 'is-auth': authStore.isAuthenticated }">
    <!-- Vista de Favoritos -->
    <div v-if="authStore.isAuthenticated" class="favorites-panel">
      <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 10; margin-bottom: 2rem;">
        <h2 class="title" style="text-align: center; margin: 0; line-height: 1.2;">Mis Favoritos</h2>
        <p class="subtitle" style="text-align: center; margin-top: 0.5rem; line-height: 1.5;">Hola, {{ authStore.usuarioActual.nombre }}</p>
      </div>
      
      <div v-if="loading" class="alert-box" style="text-align: center">Cargando favoritos...</div>
      
      <div v-else-if="loadedFavorites.length === 0" class="alert-box" style="text-align: center">
        Aún no has agregado favoritos.
      </div>
      
      <div v-else class="grid-comunas">
        <ComunaCard
          v-for="(city, index) in loadedFavorites"
          :key="city.id"
          :city="city"
          :index="index"
          unidad="C"
          :regionName="city.slugRegion"
          :slugRegion="city.slugRegion"
          @click="router.push(`/${city.slugRegion}/${city.id}`)"
        />
      </div>

      <div style="margin-top: 4rem; text-align: center; padding-bottom: 4rem; position: relative; z-index: 10;">
        <button @click="authStore.logout" class="btn-primary" style="background-color: #e53e3e; color: white; border: none; max-width: 250px; padding: 1rem 2rem; font-weight: bold; border-radius: 12px; cursor: pointer; box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);">
          Cerrar Sesión
        </button>
      </div>
    </div>

    <!-- Formulario de Login -->
    <div v-else class="glass-panel login-card">
      <h2 class="title">Iniciar Sesión</h2>
      <p class="subtitle">Accede para guardar tus preferencias</p>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="admin@clima.cl" 
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="••••••••" 
            required
            class="form-input"
          >
        </div>

        <div v-if="errorMsg" class="alert-box error">
          {{ errorMsg }}
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Ingresando...' : 'Entrar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useWeatherStore } from '../stores/weatherStore'
import comunasData from '../data/chile-comunas.json'
import ComunaCard from '../components/ComunaCard.vue'

const authStore = useAuthStore()
const weatherStore = useWeatherStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

const loadedFavorites = ref([])

async function fetchFavorites() {
  if (!authStore.isAuthenticated) return
  loading.value = true
  const userFavs = authStore.usuarioActual?.favoritos || []
  const newFavs = []

  for (const fav of userFavs) {
    const region = fav.slugRegion
    const cityId = fav.id
    let cityData = weatherStore.getCityWeather(region, cityId)
    
    if (!cityData || !cityData.pronosticoSemanal) {
      const localCity = comunasData[region]?.find(c => c.id === cityId)
      if (localCity) {
        await weatherStore.fetchRegionWeather(region, [localCity])
        cityData = weatherStore.getCityWeather(region, cityId)
      }
    }
    
    if (cityData) {
      newFavs.push({ ...cityData, slugRegion: region })
    }
  }
  loadedFavorites.value = newFavs
  loading.value = false
}

onMounted(fetchFavorites)
watch(() => authStore.usuarioActual?.favoritos, fetchFavorites, { deep: true })

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''
  
  try {
    await authStore.login({
      email: email.value,
      password: password.value
    })
    // Cargar favoritos al loguear
    await fetchFavorites()
  } catch (error) {
    errorMsg.value = error.message
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 80px);
  padding: 80px 2rem 2rem 2rem;
}
.login-view.is-auth {
  align-items: flex-start;
  padding-top: 110px;
}
.favorites-panel {
  width: 100%;
  max-width: 1200px;
}
.grid-comunas {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  padding: 3rem 2.5rem;
  text-align: center;
}

.title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.8);
}

.subtitle {
  font-family: 'Inter', sans-serif;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 2rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  text-align: left;
}

.form-group label {
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input {
  width: 100%;
  padding: 1rem 1.2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1rem;
  font-family: inherit;
  outline: none;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.15);
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.1);
}

.form-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
  font-family: inherit;
}

.alert-box.error {
  color: #fda4af;
  background: rgba(225, 29, 72, 0.2);
  border: 1px solid rgba(225, 29, 72, 0.3);
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.9rem;
  text-align: center;
}

.btn-primary {
  background: white;
  color: #0f172a;
  border: none;
  padding: 1rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}
</style>
