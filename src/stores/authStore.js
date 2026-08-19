import { defineStore } from 'pinia'
import { ref } from 'vue'

const usuariosMock = [
  { id: 1, nombre: 'Admin', email: 'admin@clima.cl', password: 'password123', favoritos: [{ slugRegion: 'metropolitana-de-santiago', id: 'santiago' }, { slugRegion: 'valparaiso', id: 'valparaiso' }] },
  { id: 2, nombre: 'Juan Pérez', email: 'juan@clima.cl', password: '123', favoritos: [{ slugRegion: 'coquimbo', id: 'la-serena' }] }
]

export const useAuthStore = defineStore('auth', () => {
  // Estado
  // Buscamos si ya hay un usuario guardado en localStorage para persistencia
  const storedUser = localStorage.getItem('usuarioActual')
  const usuarioActual = ref(storedUser ? JSON.parse(storedUser) : null)
  const isAuthenticated = ref(!!storedUser)

  // Acciones
  async function login(credenciales) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = usuariosMock.find(u => u.email === credenciales.email && u.password === credenciales.password)
        if (user) {
          const { password, ...safeUser } = user
          usuarioActual.value = safeUser
          isAuthenticated.value = true
          localStorage.setItem('usuarioActual', JSON.stringify(safeUser))
          resolve(safeUser)
        } else {
          reject(new Error('Correo o contraseña incorrectos'))
        }
      }, 800)
    })
  }

  function logout() {
    usuarioActual.value = null
    isAuthenticated.value = false
    localStorage.removeItem('usuarioActual')
  }

  function toggleFavorito(cityId, slugRegion) {
    if (!usuarioActual.value) return
    if (!usuarioActual.value.favoritos) {
      usuarioActual.value.favoritos = []
    }
    const idx = usuarioActual.value.favoritos.findIndex(f => f.id === cityId)
    if (idx >= 0) {
      usuarioActual.value.favoritos.splice(idx, 1)
    } else {
      usuarioActual.value.favoritos.push({ id: cityId, slugRegion })
    }
    // Sincronizar localStorage
    localStorage.setItem('usuarioActual', JSON.stringify(usuarioActual.value))
    
    // También actualizar el mock por si cerramos sesión y volvemos a entrar
    const mockUser = usuariosMock.find(u => u.email === usuarioActual.value.email)
    if (mockUser) mockUser.favoritos = [...usuarioActual.value.favoritos]
  }

  function isFavorito(cityId) {
    if (!usuarioActual.value || !usuarioActual.value.favoritos) return false
    return usuarioActual.value.favoritos.some(f => f.id === cityId)
  }

  return {
    usuarioActual,
    isAuthenticated,
    login,
    logout,
    toggleFavorito,
    isFavorito
  }
})
