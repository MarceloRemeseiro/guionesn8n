// Ejemplo de integración con el workflow de n8n para aprobación de videos
// Este archivo muestra cómo enviar solicitudes al webhook y manejar las respuestas

// Configuración
const N8N_WEBHOOK_URL = 'https://n8n.srv850442.hstgr.cloud/webhook/send-for-approval';
const APP_BASE_URL = 'https://tu-app.com'; // Cambia por tu URL real

/**
 * Envía una solicitud de aprobación de video al workflow de n8n
 * @param {Object} videoData - Datos del video generado
 * @returns {Promise<Object>} - Respuesta del webhook
 */
async function sendVideoForApproval(videoData) {
  const payload = {
    videoId: videoData.id,
    contenido: {
      titulo: videoData.titulo,
      tema: videoData.tema,
      guion: videoData.guion,
      textoLinkedin: videoData.textoLinkedin,
      tweet: videoData.tweet,
      descripcion: videoData.descripcion
    },
    metadata: {
      promptUsado: videoData.promptUsado,
      categoria: videoData.categoria,
      fechaCreacion: new Date().toISOString(),
      enviadorEmail: videoData.creadorEmail
    },
    callbackUrl: `${APP_BASE_URL}/api/webhooks/callback`
  };

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ Email de aprobación enviado exitosamente:', result);
      return {
        success: true,
        data: result,
        message: 'Solicitud de aprobación enviada correctamente'
      };
    } else {
      console.error('❌ Error en el webhook de n8n:', result);
      return {
        success: false,
        error: result.message || 'Error desconocido',
        data: result
      };
    }
  } catch (error) {
    console.error('❌ Error enviando solicitud a n8n:', error);
    return {
      success: false,
      error: 'Error de conexión con n8n',
      details: error.message
    };
  }
}

/**
 * Endpoint para manejar la confirmación de envío de email desde n8n
 * Este endpoint debe estar disponible en: /api/webhooks/callback
 */
function handleEmailConfirmationCallback(req, res) {
  try {
    const { success, message, videoId, emailSent, timestamp, recipientEmail } = req.body;
    
    console.log('📧 Confirmación de email recibida:', {
      videoId,
      emailSent,
      timestamp,
      recipientEmail,
      success
    });

    // Actualizar estado del video en la base de datos
    updateVideoStatus(videoId, {
      status: 'pending_approval',
      emailSent: emailSent,
      emailSentAt: timestamp,
      recipientEmail: recipientEmail
    });

    // Responder a n8n que recibimos la confirmación
    res.status(200).json({
      received: true,
      message: 'Confirmación procesada correctamente',
      videoId: videoId
    });

  } catch (error) {
    console.error('❌ Error procesando confirmación de email:', error);
    res.status(500).json({
      received: false,
      error: 'Error interno del servidor'
    });
  }
}

/**
 * Endpoint para manejar las respuestas de aprobación/rechazo
 * Este endpoint debe estar disponible en: /api/webhooks/approval-response
 */
function handleApprovalResponse(req, res) {
  try {
    const { action, videoId } = req.query;
    
    if (!action || !videoId) {
      return res.status(400).json({
        error: 'Faltan parámetros requeridos: action y videoId'
      });
    }

    console.log(`📋 Respuesta de aprobación recibida: ${action} para video ${videoId}`);

    // Validar acción
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        error: 'Acción inválida. Debe ser "approve" o "reject"'
      });
    }

    // Actualizar estado del video
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    const result = updateVideoStatus(videoId, {
      status: newStatus,
      approvalAction: action,
      approvedAt: new Date().toISOString()
    });

    if (!result) {
      return res.status(404).json({
        error: 'Video no encontrado'
      });
    }

    // Página de confirmación HTML
    const confirmationHTML = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>StreamingPro - Confirmación</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                margin: 0;
                padding: 40px 20px;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .container {
                background: white;
                padding: 40px;
                border-radius: 12px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
            }
            .icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }
            .approved { color: #28a745; }
            .rejected { color: #dc3545; }
            h1 {
                color: #333;
                margin-bottom: 10px;
            }
            p {
                color: #666;
                font-size: 18px;
                margin-bottom: 30px;
            }
            .video-id {
                background: #f8f9fa;
                padding: 10px 20px;
                border-radius: 20px;
                font-family: monospace;
                color: #6c757d;
                display: inline-block;
                margin-top: 20px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="icon ${action === 'approve' ? 'approved' : 'rejected'}">
                ${action === 'approve' ? '✅' : '❌'}
            </div>
            <h1>Video ${action === 'approve' ? 'Aprobado' : 'Rechazado'}</h1>
            <p>
                ${action === 'approve' 
                  ? 'El video ha sido aprobado exitosamente y está listo para publicación.' 
                  : 'El video ha sido rechazado y requiere modificaciones.'}
            </p>
            <div class="video-id">ID: ${videoId}</div>
        </div>
    </body>
    </html>`;

    res.status(200).send(confirmationHTML);

    // Ejecutar acciones post-aprobación si es necesario
    if (action === 'approve') {
      handleVideoApproval(videoId);
    } else {
      handleVideoRejection(videoId);
    }

  } catch (error) {
    console.error('❌ Error procesando respuesta de aprobación:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
}

/**
 * Actualiza el estado de un video en la base de datos
 * @param {string} videoId - ID del video
 * @param {Object} updates - Actualizaciones a aplicar
 * @returns {boolean} - true si se actualizó correctamente
 */
function updateVideoStatus(videoId, updates) {
  try {
    // Aquí implementarías la lógica de tu base de datos
    // Ejemplo con Prisma, MongoDB, SQL, etc.
    
    console.log(`📝 Actualizando video ${videoId}:`, updates);
    
    // Ejemplo simulado
    // await prisma.video.update({
    //   where: { id: videoId },
    //   data: updates
    // });
    
    return true;
  } catch (error) {
    console.error('❌ Error actualizando estado del video:', error);
    return false;
  }
}

/**
 * Maneja las acciones post-aprobación del video
 * @param {string} videoId - ID del video aprobado
 */
function handleVideoApproval(videoId) {
  console.log(`🎉 Video ${videoId} aprobado - ejecutando acciones post-aprobación`);
  
  // Aquí puedes implementar:
  // - Enviar notificación al creador
  // - Programar publicación automática
  // - Generar el video final
  // - Actualizar métricas
  // - etc.
}

/**
 * Maneja las acciones post-rechazo del video
 * @param {string} videoId - ID del video rechazado
 */
function handleVideoRejection(videoId) {
  console.log(`❌ Video ${videoId} rechazado - ejecutando acciones post-rechazo`);
  
  // Aquí puedes implementar:
  // - Enviar notificación al creador con feedback
  // - Mover a cola de revisión
  // - Generar reporte de rechazo
  // - etc.
}

/**
 * Ejemplo de uso completo
 */
async function ejemploCompleto() {
  // Datos del video de ejemplo
  const videoData = {
    id: 'vid_' + Date.now(),
    titulo: 'Cómo Automatizar tu Workflow de Video',
    tema: 'Automatización y Productividad',
    guion: 'En este video aprenderás a configurar un sistema automatizado...',
    textoLinkedin: '🚀 Nuevo video sobre automatización! Aprende a optimizar tu workflow de producción de video con herramientas como n8n...',
    tweet: '🎬 ¿Cansado de tareas repetitivas? Automatiza tu workflow de video! #automation #productivity',
    descripcion: 'Tutorial completo sobre cómo crear un sistema de aprobación automatizado para contenido de video.',
    promptUsado: 'Crear contenido educativo sobre automatización de workflows',
    categoria: 'Tecnología',
    creadorEmail: 'creador@ejemplo.com'
  };

  // Enviar para aprobación
  const resultado = await sendVideoForApproval(videoData);
  
  if (resultado.success) {
    console.log('✅ Solicitud enviada correctamente');
  } else {
    console.log('❌ Error enviando solicitud:', resultado.error);
  }
}

// Exportar funciones para usar en tu aplicación
module.exports = {
  sendVideoForApproval,
  handleEmailConfirmationCallback,
  handleApprovalResponse,
  updateVideoStatus,
  handleVideoApproval,
  handleVideoRejection,
  ejemploCompleto
};

// Si ejecutas este archivo directamente, ejecuta el ejemplo
if (require.main === module) {
  ejemploCompleto().catch(console.error);
}