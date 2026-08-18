export function formatSlug(text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remueve tildes
    .replace(/ñ/g, "n") // Aseguramos ñ -> n por si normalize falla
    .replace(/[^a-z0-9]/g, "") // Remueve espacios y caracteres especiales
}

// Mapeo desde admin1 (API Geocoding) al slug de región local
export function getRegionSlugFromAPI(admin1) {
  if (!admin1) return 'global'
  const text = admin1.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  
  if (text.includes('biobio')) return 'biobio'
  if (text.includes('metropolitana') || text.includes('santiago')) return 'metropolitana'
  if (text.includes('araucania')) return 'araucania'
  if (text.includes('antofagasta')) return 'antofagasta'
  if (text.includes('arica')) return 'arica'
  if (text.includes('atacama')) return 'atacama'
  if (text.includes('aysen')) return 'aysen'
  if (text.includes('coquimbo')) return 'coquimbo'
  if (text.includes('lagos')) return 'loslagos'
  if (text.includes('rios')) return 'losrios'
  if (text.includes('magallanes')) return 'magallanes'
  if (text.includes('maule')) return 'maule'
  if (text.includes('nuble')) return 'nuble'
  if (text.includes('higgins')) return 'ohiggins'
  if (text.includes('tarapaca')) return 'tarapaca'
  if (text.includes('valparaiso')) return 'valparaiso'
  
  return 'global'
}
