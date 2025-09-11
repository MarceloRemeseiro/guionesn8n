#!/usr/bin/env node

/**
 * Script de prueba para el webhook de aprobación de videos
 * Uso: node test-webhook.js
 */

const https = require('https');

// Configuración
const WEBHOOK_URL = 'https://n8n.srv850442.hstgr.cloud/webhook/send-for-approval';
const TEST_CALLBACK_URL = 'https://httpbin.org/post'; // Servicio de prueba que acepta cualquier POST

// Datos de prueba
const testPayload = {
  videoId: `test_video_${Date.now()}`,
  contenido: {
    titulo: "🎬 Tutorial: Automatización con n8n",
    tema: "Automatización de Workflows y Procesos de Negocio",
    guion: `¡Hola! Bienvenidos a StreamingPro.

En este video vamos a aprender cómo crear workflows automatizados usando n8n.

Primero, vamos a configurar nuestro entorno:
- Instalación de n8n
- Configuración básica
- Creación de nuestro primer workflow

Luego veremos:
- Conectores más utilizados
- Manejo de datos entre nodos  
- Mejores prácticas de seguridad

Al final de este tutorial, tendrás las herramientas necesarias para automatizar procesos complejos y ahorrar horas de trabajo manual.

¡No olvides suscribirte y activar las notificaciones!`,
    textoLinkedin: `🚀 ¿Sabías que puedes automatizar hasta el 80% de tus tareas repetitivas?

En mi nuevo video te enseño paso a paso cómo usar n8n para crear workflows que trabajan por ti 24/7.

✅ Configuración desde cero
✅ Integraciones con +300 servicios  
✅ Casos de uso reales
✅ Tips de productividad

Perfecto para emprendedores, freelancers y equipos que quieren escalar sin burnout.

👆 Link en comentarios

#automatización #productividad #nocode #n8n #workflow`,
    tweet: "🤖 Nuevo tutorial: Cómo automatizar workflows con n8n\n\n✨ Sin código\n⚡ Súper potente\n🔄 300+ integraciones\n\n¿Listo para automatizar tu vida? 👇\n\n#NoCode #Automation #Productivity",
    descripcion: `En este tutorial completo aprenderás a dominar n8n, la herramienta de automatización más potente del mercado.

🎯 QUÉ APRENDERÁS:
• Instalación y configuración inicial
• Creación de workflows desde cero
• Conexión con APIs y servicios externos
• Manejo avanzado de datos
• Estrategias de error handling
• Optimización y mejores prácticas

⏰ TIMESTAMPS:
00:00 - Introducción
02:30 - Instalación de n8n
05:15 - Primer workflow
10:45 - Conectores principales
18:20 - Casos de uso reales
25:00 - Tips avanzados
30:15 - Conclusiones

🔗 RECURSOS MENCIONADOS:
• Documentación oficial de n8n
• Templates de workflows
• Comunidad en Discord

💡 IDEAL PARA:
- Emprendedores que buscan escalar
- Equipos que quieren ser más eficientes  
- Desarrolladores interesados en automatización
- Cualquiera que odie las tareas repetitivas

¡Dale like si te fue útil y suscríbete para más contenido sobre automatización!`
  },
  metadata: {
    promptUsado: "Crear contenido educativo sobre n8n y automatización de workflows, enfocado en casos prácticos para emprendedores y equipos pequeños",
    categoria: "Tecnología y Productividad",
    fechaCreacion: new Date().toISOString(),
    enviadorEmail: "test@streamingpro.com"
  },
  callbackUrl: TEST_CALLBACK_URL
};

/**
 * Realiza una petición POST al webhook
 */
function testWebhook() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(testPayload);
    
    const url = new URL(WEBHOOK_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        'User-Agent': 'n8n-webhook-test/1.0'
      }
    };

    console.log('🚀 Enviando solicitud de prueba al webhook...');
    console.log('📍 URL:', WEBHOOK_URL);
    console.log('📋 Video ID:', testPayload.videoId);
    console.log('📧 Email destino:', testPayload.metadata.enviadorEmail);
    console.log('');

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonResponse = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: jsonResponse
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            statusMessage: res.statusMessage,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout: El webhook no respondió en tiempo esperado'));
    });

    req.setTimeout(30000); // 30 segundos timeout

    req.write(data);
    req.end();
  });
}

/**
 * Muestra los resultados del test
 */
function displayResults(result) {
  console.log('📊 RESULTADO DEL TEST:');
  console.log('='.repeat(50));
  
  if (result.statusCode >= 200 && result.statusCode < 300) {
    console.log('✅ Status:', result.statusCode, result.statusMessage);
    console.log('🎉 ¡Test exitoso!');
  } else {
    console.log('❌ Status:', result.statusCode, result.statusMessage);
    console.log('💥 Test fallido');
  }
  
  console.log('');
  console.log('📄 RESPUESTA:');
  console.log(JSON.stringify(result.data, null, 2));
  
  if (result.data && result.data.success) {
    console.log('');
    console.log('✨ DETALLES DEL ÉXITO:');
    console.log('- Video ID:', result.data.videoId);
    console.log('- Email enviado:', result.data.emailSent ? '✅' : '❌');
    console.log('- Callback enviado:', result.data.callbackSent ? '✅' : '❌');
    console.log('- Timestamp:', result.data.timestamp);
  }

  if (result.data && !result.data.success) {
    console.log('');
    console.log('🔍 DETALLES DEL ERROR:');
    console.log('- Mensaje:', result.data.message);
    console.log('- Error:', result.data.error);
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🧪 INICIANDO TEST DEL WEBHOOK DE APROBACIÓN');
  console.log('=' .repeat(60));
  console.log('');
  
  try {
    const result = await testWebhook();
    displayResults(result);
    
    if (result.statusCode >= 200 && result.statusCode < 300) {
      console.log('');
      console.log('📧 PRÓXIMOS PASOS:');
      console.log('1. Revisa tu email en:', testPayload.metadata.enviadorEmail);
      console.log('2. Verifica que llegó el email de aprobación');
      console.log('3. Prueba los botones "Aprobar" y "Rechazar"');
      console.log('4. Confirma que los callbacks funcionan correctamente');
      console.log('');
      console.log('🔗 URLs de aprobación generadas:');
      console.log('- Aprobar: [Se generará automáticamente en el email]');
      console.log('- Rechazar: [Se generará automáticamente en el email]');
      
      process.exit(0);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    console.log('❌ ERROR EN EL TEST:');
    console.log('- Tipo:', error.name || 'Error desconocido');
    console.log('- Mensaje:', error.message);
    console.log('- Stack:', error.stack);
    
    console.log('');
    console.log('🔧 POSIBLES SOLUCIONES:');
    console.log('1. Verifica que n8n esté funcionando');
    console.log('2. Confirma que el webhook esté activado');
    console.log('3. Revisa las credenciales SMTP');
    console.log('4. Verifica la conectividad de red');
    
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
}

module.exports = {
  testWebhook,
  testPayload,
  WEBHOOK_URL
};