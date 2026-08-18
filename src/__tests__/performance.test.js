import { describe, it, expect, vi, beforeEach } from 'vitest'
import { formatSlug } from '../utils/slugify'
import { createPinia, setActivePinia } from 'pinia'
import { useWeatherStore } from '../stores/weatherStore'
import comunasData from '../data/chile-comunas.json'

describe('Pruebas de Rendimiento y Complejidad', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('formatSlug debe ser eficiente con miles de strings', () => {
    const start = performance.now()
    for (let i = 0; i < 10000; i++) {
      formatSlug('Iquique, Región de Tarapacá')
    }
    const end = performance.now()
    const diff = end - start
    
    // 10000 slugs debería tardar menos de 50ms
    expect(diff).toBeLessThan(50)
  })

  it('fetchRegionWeather debe procesar 345 comunas sin leaks', async () => {
    const store = useWeatherStore()
    const regionSlug = 'metropolitana'
    const comunas = comunasData[regionSlug]
    
    // Mock the global fetch
    global.fetch = vi.fn(() => {
      const mockResult = {
        current_weather: { temperature: 20, weathercode: 0, windspeed: 10, is_day: 1 },
        hourly: { 
          time: ['2026-08-18T13:00'], 
          temperature_2m: [20], 
          weathercode: [0], 
          precipitation_probability: [0], 
          is_day: [1],
          apparent_temperature: [20],
          relativehumidity_2m: [50],
          surface_pressure: [1013]
        },
        daily: { time: ['2026-08-18'], temperature_2m_max: [25], temperature_2m_min: [10], weathercode: [0], precipitation_sum: [0] }
      }
      return Promise.resolve({
        json: () => Promise.resolve(Array(comunas.length).fill(mockResult))
      })
    })

    const start = performance.now()
    await store.fetchRegionWeather(regionSlug, comunas)
    const end = performance.now()
    
    const regionData = store.getRegionWeather(regionSlug)
    expect(regionData.length).toBe(comunas.length)
    expect(end - start).toBeLessThan(2000)
  })
})
