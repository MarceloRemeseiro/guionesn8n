# Guía de Configuración - Workflow de Aprobación de Videos

## Configuración Previa Requerida

### 1. Credenciales SMTP
Antes de importar el workflow, configura las credenciales SMTP en n8n:

**Nombre de la credencial:** `smtp-credentials` (debe coincidir exactamente)

**Configuración recomendada:**
```
Host: smtp.gmail.com (o tu proveedor SMTP)
Port: 587
Secure: true
User: tu-email@streamingpro.com
Password: tu-password-de-aplicación
```

### 2. Variables de Entorno (Opcional)
Si quieres usar variables de entorno, configura en tu instancia de n8n:
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@streamingpro.com
SMTP_PASS=tu-password
```

## Importación del Workflow

1. **Accede a n8n**: Ve a tu instancia en `https://n8n.srv850442.hstgr.cloud`

2. **Importar workflow:**
   - Click en "Import from File"
   - Selecciona el archivo `video-approval-workflow.json`
   - Confirma la importación

3. **Configurar credenciales:**
   - Ve al nodo "Send Approval Email"
   - Configura las credenciales SMTP
   - Guarda el workflow

4. **Activar webhook:**
   - Click en "Activate" para activar el workflow
   - El webhook estará disponible en: `https://n8n.srv850442.hstgr.cloud/webhook/send-for-approval`

## Estructura del Workflow

### Nodos Principales:

1. **Webhook Trigger** (`send-for-approval`)
   - Recibe las solicitudes POST de tu aplicación
   - Path: `/webhook/send-for-approval`
   - Acepta CORS para integraciones web

2. **Set Variables**
   - Extrae y organiza los datos del payload
   - Crea URLs de aprobación/rechazo dinámicamente
   - Prepara variables para el email

3. **Send Approval Email**
   - Envía email HTML profesional con branding StreamingPro
   - Incluye todo el contenido del video
   - Botones de acción directos
   - Diseño responsive y moderno

4. **Success Callback**
   - Confirma envío exitoso a tu aplicación
   - Envía datos de confirmación
   - Timestamp del envío

5. **Webhook Response**
   - Respuesta final al cliente
   - Estado de éxito/error
   - Información de proceso

6. **Error Handler**
   - Manejo de errores automático
   - Respuestas apropiadas en caso de fallo
   - Logging de errores

## Payload Esperado

El webhook espera recibir este JSON:
```json
{
  "videoId": "vid_12345",
  "contenido": {
    "titulo": "Título del Video",
    "tema": "Tema principal",
    "guion": "Guión completo del video...",
    "textoLinkedin": "Texto para LinkedIn...",
    "tweet": "Tweet para Twitter...",
    "descripcion": "Descripción del video..."
  },
  "metadata": {
    "promptUsado": "Prompt utilizado para generar contenido",
    "categoria": "Categoría del video",
    "fechaCreacion": "2024-01-01T12:00:00Z",
    "enviadorEmail": "usuario@ejemplo.com"
  },
  "callbackUrl": "https://tu-app.com/api/webhooks/callback"
}
```

## Respuestas del Webhook

### Éxito:
```json
{
  "success": true,
  "message": "Solicitud de aprobación procesada correctamente",
  "videoId": "vid_12345",
  "emailSent": true,
  "callbackSent": true,
  "timestamp": "2024-01-01 12:00:00"
}
```

### Error:
```json
{
  "success": false,
  "message": "Error procesando solicitud de aprobación",
  "error": "Descripción del error",
  "videoId": "vid_12345",
  "timestamp": "2024-01-01 12:00:00"
}
```

## URLs de Aprobación Generadas

El workflow genera automáticamente estas URLs:
- **Aprobar**: `{callbackUrl}/approval-response?action=approve&videoId={videoId}`
- **Rechazar**: `{callbackUrl}/approval-response?action=reject&videoId={videoId}`

Tu aplicación debe manejar estas rutas en `/api/webhooks/approval-response`

## Testing

### Usando curl:
```bash
curl -X POST https://n8n.srv850442.hstgr.cloud/webhook/send-for-approval \
  -H "Content-Type: application/json" \
  -d '{
    "videoId": "test_123",
    "contenido": {
      "titulo": "Video de Prueba",
      "tema": "Automatización",
      "guion": "Este es un guión de prueba...",
      "textoLinkedin": "Texto para LinkedIn de prueba",
      "tweet": "Tweet de prueba #automation",
      "descripcion": "Descripción del video de prueba"
    },
    "metadata": {
      "promptUsado": "Crear video sobre automatización",
      "categoria": "Tecnología",
      "fechaCreacion": "2024-01-01T12:00:00Z",
      "enviadorEmail": "test@ejemplo.com"
    },
    "callbackUrl": "https://httpbin.org/post"
  }'
```

## Personalización

### Cambiar el diseño del email:
- Edita el HTML en el nodo "Send Approval Email"
- Modifica los estilos CSS incluidos
- Ajusta la estructura y branding

### Modificar las URLs de callback:
- Edita el nodo "Set Variables"
- Cambia la lógica de construcción de URLs
- Añade parámetros adicionales si necesario

### Añadir validaciones:
- Inserta nodos "IF" para validar datos
- Añade nodos "Function" para lógica compleja
- Implementa retry logic si necesario

## Monitoreo

- Ve a "Executions" en n8n para ver el historial
- Revisa los logs de cada nodo
- Configura alertas para fallos si necesario

## Troubleshooting

### El email no se envía:
1. Verifica credenciales SMTP
2. Revisa logs del nodo de email
3. Confirma que el servidor SMTP permite conexiones

### URLs de aprobación no funcionan:
1. Verifica que `callbackUrl` sea correcto
2. Confirma que tu app maneja `/api/webhooks/approval-response`
3. Revisa la lógica de construcción de URLs

### Callback falla:
1. Verifica que `callbackUrl` esté disponible
2. Revisa los logs del nodo "Success Callback"
3. Confirma que tu app acepta el payload de confirmación