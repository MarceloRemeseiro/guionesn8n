# StreamingPro Video Creator

Plataforma para crear videos automatizados usando n8n y HeyGen.

## Características

- 🎯 **Gestión de Prompts**: Biblioteca de plantillas reutilizables
- 🤖 **Generación Automática**: Integración con n8n y OpenAI/Claude  
- ✅ **Workflow de Aprobación**: Sistema de revisión por email
- 🎥 **Integración HeyGen**: Soporte para videos con avatar
- 📱 **Publicación Automática**: YouTube, LinkedIn, Twitter
- 📊 **Seguimiento**: Estados y logs completos

## Tech Stack

- **Frontend/Backend**: Next.js 15 con App Router
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Automatización**: n8n workflows
- **Deployment**: Dokploy

## Configuración

1. **Clonar y instalar dependencias**
   ```bash
   git clone <repo>
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   ```
   
   Completar con tus datos:
   - `DATABASE_URL`: postgresql://postgres:videoStreamingProPass@85.10.196.133:5500/videoDb
   - `LOGIN_EMAIL`: Email de Lydia para acceder
   - `LOGIN_PASSWORD`: Contraseña de acceso
   - `NEXTAUTH_SECRET`: Generar con `openssl rand -base64 32`
   - Webhooks n8n ya configurados

3. **Configurar base de datos**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. **Login configurado**
   - Email: lydia.blanch@gmail.com
   - Password: 1298
   - Se crea automáticamente al hacer login

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

## Flujo de Trabajo

### 1. Generación de Contenido
- Usuario selecciona prompt
- Sistema envía a n8n con temas existentes
- n8n + OpenAI/Claude generan contenido
- Contenido se guarda como borrador

### 2. Proceso de Aprobación  
- Usuario envía para aprobación
- n8n envía email con contenido
- Marcelo aprueba/rechaza desde email
- Sistema actualiza estado

### 3. Creación de Video
- Usuario recibe notificación de aprobación
- Crea video manualmente en HeyGen
- Agrega link del video en plataforma

### 4. Publicación Automática
- Usuario hace clic en "Publicar"
- n8n publica en todas las redes sociales
- Sistema guarda URLs de publicación

## Endpoints API

### Webhooks para n8n

- `POST /api/webhooks/generate-content` - Iniciar generación
- `POST /api/webhooks/content-generated` - Recibir contenido
- `POST /api/webhooks/send-approval` - Enviar para aprobación  
- `GET /api/webhooks/approve-content` - Links de aprobación/rechazo
- `POST /api/webhooks/add-video` - Agregar link HeyGen
- `POST /api/webhooks/publish-video` - Iniciar publicación
- `POST /api/webhooks/published` - Confirmar publicación

## Workflows n8n Requeridos

### 1. Generación de Contenido
- **Webhook**: `generate-content`
- **OpenAI Node**: Procesar prompt + temas existentes
- **HTTP Request**: Devolver a `/content-generated`

### 2. Email de Aprobación
- **Webhook**: `send-approval-email`  
- **Email Node**: Enviar a Marcelo con botones
- **Template**: Incluir links de aprobación/rechazo

### 3. Publicación en Redes
- **Webhook**: `publish-video`
- **YouTube API**: Subir/programar video
- **LinkedIn API**: Crear post
- **Twitter API**: Publicar tweet
- **HTTP Request**: Confirmar en `/published`

## Estructura de Base de Datos

```sql
-- Prompts reutilizables
prompts: id, nombre, descripcion, contenido_prompt, categoria, activo

-- Videos y contenido generado  
videos: id, prompt_id, titulo, tema, guion, texto_linkedin, tweet, descripcion, estado, url_heygen, url_youtube, url_linkedin, url_twitter

-- Logs de workflow
workflow_logs: id, video_id, accion, detalles, creado_en

-- Usuarios
users: id, email, name, role
```

## Estados de Video

- `borrador` → Contenido generado, pendiente revisión
- `esperando_aprobacion` → Enviado para aprobación  
- `aprobado` → Aprobado, pendiente video HeyGen
- `video_agregado` → Video agregado, listo para publicar
- `publicado` → Publicado en todas las redes

## Deployment en Dokploy

1. Crear proyecto en Dokploy desde GitHub
2. Configurar variables de entorno
3. La base de datos PostgreSQL debe estar creada en Dokploy
4. Push a GitHub triggerea auto-deploy

## Desarrollo

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Linting  
npm run lint

# Base de datos
npx prisma studio
npx prisma db push
npx prisma migrate dev
```