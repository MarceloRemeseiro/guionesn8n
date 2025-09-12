import { startScheduler } from './scheduler'

// Variable para evitar múltiples inicializaciones
let servicesInitialized = false

// Inicializar servicios al arrancar la aplicación
export function initializeServices() {
  // Solo inicializar una vez y solo en el servidor
  if (typeof window === 'undefined' && !servicesInitialized) {
    console.log('🚀 Inicializando servicios de la aplicación...')
    
    // Iniciar el scheduler de videos programados
    startScheduler()
    
    servicesInitialized = true
    console.log('✅ Servicios inicializados correctamente')
  }
}

// Auto-ejecutar cuando se importa el archivo solo en producción
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  initializeServices()
}