export type VideoEstado = 'borrador' | 'esperando_aprobacion' | 'aprobado' | 'programado' | 'publicado'

export interface VideoContenido {
  titulo: string
  tema: string
  guion: string
  textoLinkedin: string
  tweet: string
  descripcion: string
}

export interface N8nWebhookPayload {
  videoId: string
  contenido?: VideoContenido
  urlHeygen?: string
  urlsPublicacion?: {
    youtube?: string
    linkedin?: string
    twitter?: string
  }
}

export interface CategoriaData {
  id: string
  nombre: string
  color?: string | null
  activa: boolean
  creadoEn: Date
}

export interface PromptData {
  id: string
  nombre: string
  descripcion?: string | null
  contenidoPrompt: string
  categoriaId?: string | null
  activo: boolean
  creadoEn: Date
  categoria?: CategoriaData | null
}

export interface VideoData {
  id: string
  promptId?: string
  titulo?: string
  tema?: string
  guion?: string
  textoLinkedin?: string
  tweet?: string
  descripcion?: string
  estado: VideoEstado
  urlHeygen?: string
  urlYoutube?: string
  urlLinkedin?: string
  urlTwitter?: string
  creadoEn: Date
  aprobadoEn?: Date
  publicadoEn?: Date
  prompt?: PromptData
}