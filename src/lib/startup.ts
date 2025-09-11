import { startScheduler } from './scheduler'

// Inicializar servicios al arrancar la aplicación
export function initializeServices() {
  console.log('🚀 Inicializando servicios de la aplicación...')
  
  // Iniciar el scheduler de videos programados
  startScheduler()
  
  console.log('✅ Servicios inicializados correctamente')
}

// Auto-ejecutar cuando se importa el archivo
if (typeof window === 'undefined') { // Solo en el servidor
  initializeServices()
}