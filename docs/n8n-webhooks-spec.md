# Especificaciones de Webhooks para n8n

## 🎯 **Webhooks Necesarios**

### 1. **Generar Contenido**
- **URL**: `/webhook-test/generate-content`  
- **Método**: POST
- **Propósito**: Recibir prompt y generar contenido con OpenAI/Claude

**Payload que recibirá:**
```json
{
  "videoId": "cuid-del-video",
  "prompt": "texto-completo-del-prompt",
  "temasExistentes": ["tema1", "tema2", "tema3"],
  "webhookUrl": "https://tu-app.com/api/webhooks/content-generated"
}
```

**Workflow n8n:**
1. Webhook trigger
2. OpenAI/Claude node con el prompt
3. HTTP Request de vuelta a `webhookUrl` con el contenido generado

**Respuesta que debe enviar de vuelta:**
```json
{
  "videoId": "mismo-cuid",
  "titulo": "Título del video",
  "tema": "Tema tratado",
  "guion": "Texto completo del guión",
  "textoLinkedin": "Post para LinkedIn",
  "tweet": "Tweet promocional", 
  "descripcion": "Descripción para YouTube"
}
```

---

### 2. **Enviar Email de Aprobación**
- **URL**: `/webhook-test/send-approval-email`
- **Método**: POST
- **Propósito**: Enviar email a Marcelo para aprobar el contenido

**Payload que recibirá:**
```json
{
  "videoId": "cuid-del-video",
  "titulo": "Título del video",
  "tema": "Tema tratado", 
  "guion": "Texto del guión",
  "textoLinkedin": "Post LinkedIn",
  "tweet": "Tweet",
  "descripcion": "Descripción",
  "approveUrl": "https://tu-app.com/api/webhooks/approve-content?videoId=123&action=approve",
  "rejectUrl": "https://tu-app.com/api/webhooks/approve-content?videoId=123&action=reject"
}
```

**Workflow n8n:**
1. Webhook trigger
2. Email node a Marcelo
3. Template HTML con el contenido y botones de Aprobar/Rechazar

**Template de Email Sugerido:**
```html
<h2>🎥 Nuevo Contenido para Revisar</h2>
<h3>{{$json.titulo}}</h3>
<p><strong>Tema:</strong> {{$json.tema}}</p>
<p><strong>Guión:</strong></p>
<p>{{$json.guion}}</p>
<p><strong>LinkedIn:</strong></p>
<p>{{$json.textoLinkedin}}</p>
<p><strong>Tweet:</strong> {{$json.tweet}}</p>
<p><strong>Descripción:</strong></p>
<p>{{$json.descripcion}}</p>

<div style="margin: 20px 0;">
  <a href="{{$json.approveUrl}}" style="background: green; color: white; padding: 10px 20px; text-decoration: none;">✅ APROBAR</a>
  &nbsp;&nbsp;
  <a href="{{$json.rejectUrl}}" style="background: red; color: white; padding: 10px 20px; text-decoration: none;">❌ RECHAZAR</a>
</div>
```

---

### 3. **Publicar Video**
- **URL**: `/webhook-test/publish-video`
- **Método**: POST  
- **Propósito**: Publicar en YouTube, LinkedIn, Twitter

**Payload que recibirá:**
```json
{
  "videoId": "cuid-del-video",
  "titulo": "Título del video",
  "descripcion": "Descripción para YouTube",
  "textoLinkedin": "Post para LinkedIn", 
  "tweet": "Tweet promocional",
  "urlHeygen": "https://heygen.com/video/123",
  "webhookUrl": "https://tu-app.com/api/webhooks/published"
}
```

**Workflow n8n:**
1. Webhook trigger
2. YouTube API - Subir video
3. LinkedIn API - Crear post
4. Twitter API - Publicar tweet
5. HTTP Request de vuelta con URLs

**Respuesta que debe enviar de vuelta:**
```json
{
  "videoId": "mismo-cuid",
  "urlYoutube": "https://youtube.com/watch?v=abc123",
  "urlLinkedin": "https://linkedin.com/posts/marcelo_abc123", 
  "urlTwitter": "https://twitter.com/user/status/123456"
}
```

---

### 4. **Respuesta de Aprobación** (Opcional)
- **URL**: `/webhook-test/approval-response`
- **Método**: POST
- **Propósito**: Notificar cuando se apruebe/rechace contenido

**Payload que recibirá:**
```json
{
  "videoId": "cuid-del-video",
  "action": "approved" | "rejected",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

---

## 🔧 **Configuración de URLs en n8n**

En cada webhook de n8n, configura:

**Base URL**: `https://n8n.srv850442.hstgr.cloud`

**Paths**:
- `/webhook-test/generate-content`
- `/webhook-test/send-approval-email`  
- `/webhook-test/publish-video`
- `/webhook-test/approval-response`

## 📝 **Notas Importantes**

1. **Headers**: Todos los requests usan `Content-Type: application/json`
2. **Timeouts**: Configura timeouts apropiados para las APIs externas
3. **Error Handling**: Implementa manejo de errores en cada workflow
4. **Logs**: Mantén logs de cada operación para debugging
5. **Validación**: Valida que los campos requeridos estén presentes

## 🧪 **Testing**

Para probar cada webhook:
```bash
curl -X POST https://n8n.srv850442.hstgr.cloud/webhook-test/generate-content \
  -H "Content-Type: application/json" \
  -d '{"videoId":"test","prompt":"test prompt","temasExistentes":[],"webhookUrl":"https://webhook.site/test"}'
```