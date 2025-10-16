// api/chat-memory-layer.js
// CAPA DE MEMORIA PARA SOFÍA - SE INTEGRA EN api/chat.js
// Versión: 1.0.0
// ESTE ARCHIVO CONTIENE EL CÓDIGO QUE SE AÑADIRÁ A chat.js SIN TOCAR NADA MÁS

// ============================================
// INSTRUCCIONES PARA INTEGRAR:
// ============================================
// 1. Añadir este import al INICIO de api/chat.js (línea 5):
//    import supabaseClient from './supabase-client.js';
//
// 2. Añadir esta función ANTES del handler (línea 70):
//    (copiar toda la función buildSystemPromptWithMemory)
//
// 3. Modificar SOLO 3 LÍNEAS dentro del handler:
//    - Añadir extracción de userEmail (línea 110)
//    - Llamar a getUserContext (línea 148)
//    - Guardar mensajes en DB (línea 420)
//
// ============================================

/**
 * Construir System Prompt CON MEMORIA PERSISTENTE
 * Esta función ENVUELVE la función existente buildSystemPrompt()
 * SIN modificar su lógica interna
 */
async function buildSystemPromptWithMemory(userType, userName, userPlan, userEmail = null) {
  // 1. Obtener contexto del usuario desde Supabase (si está disponible)
  let userContext = null;
  let user = null;
  
  if (userEmail && supabaseClient) {
    try {
      // Obtener o crear usuario
      user = await supabaseClient.getOrCreateUser(userEmail, userName, userType);
      
      if (user) {
        // Obtener contexto completo (conversaciones, propiedades, tareas)
        userContext = await supabaseClient.getUserContext(user.id);
        console.log('✅ Contexto del usuario cargado:', {
          conversaciones: userContext.conversations.length,
          propiedades: userContext.properties.length,
          tareas: userContext.tasks.length
        });
      }
    } catch (error) {
      console.error('⚠️ Error al cargar contexto del usuario:', error);
      // NO fallar si Supabase no está disponible - continuar sin memoria
    }
  }
  
  // 2. Obtener el system prompt BASE (sin tocar la lógica existente)
  const baseSystemPrompt = buildSystemPrompt(userType, userName, userPlan);
  
  // 3. Si NO hay contexto, devolver prompt base sin cambios
  if (!userContext) {
    return baseSystemPrompt;
  }
  
  // 4. SI hay contexto, AÑADIR sección de memoria al final
  const memorySection = buildMemorySection(userContext);
  
  // 5. Combinar prompt base + memoria
  const enhancedSystemPrompt = `${baseSystemPrompt}

${memorySection}`;
  
  return enhancedSystemPrompt;
}

/**
 * Construir sección de memoria a partir del contexto del usuario
 */
function buildMemorySection(userContext) {
  const sections = [];
  
  // CONVERSACIONES RECIENTES (últimas 20)
  if (userContext.conversations && userContext.conversations.length > 0) {
    const recentConvs = userContext.conversations.slice(-20);
    const conversationSummary = recentConvs.map(conv => {
      const date = new Date(conv.created_at).toLocaleDateString('es-ES');
      return `[${date}] ${conv.sender === 'user' ? 'Usuario' : 'Sofía'}: ${conv.message.substring(0, 150)}${conv.message.length > 150 ? '...' : ''}`;
    }).join('\n');
    
    sections.push(`## 💾 HISTORIAL DE CONVERSACIONES RECIENTES

Últimas ${recentConvs.length} conversaciones con este usuario:

${conversationSummary}

**IMPORTANTE:** Usa este contexto para:
- Recordar de qué hablasteis antes
- Hacer seguimiento de temas pendientes
- Mencionar conversaciones anteriores si son relevantes
- No repetir información que ya conoce el usuario`);
  }
  
  // PROPIEDADES EN GESTIÓN
  if (userContext.properties && userContext.properties.length > 0) {
    const propertiesList = userContext.properties.map(prop => 
      `- ${prop.title || prop.address} (${prop.city || 'Sin ciudad'}) - ${prop.price ? prop.price + '€' : 'Precio no definido'} - Estado: ${prop.status}`
    ).join('\n');
    
    sections.push(`## 🏠 PROPIEDADES EN GESTIÓN DEL USUARIO

Este usuario tiene ${userContext.properties.length} propiedad(es) registrada(s):

${propertiesList}

**IMPORTANTE:** Cuando el usuario mencione alguna de estas direcciones, sabes que ya la tiene registrada. Puedes preguntarle:
- "¿Quieres que archive esta información en la carpeta de [dirección]?"
- "Veo que ya tienes registrado el inmueble de [dirección], ¿hablamos de ese?"`);
  }
  
  // TAREAS PENDIENTES
  if (userContext.tasks && userContext.tasks.length > 0) {
    const now = new Date();
    const overdueTasks = userContext.tasks.filter(task => 
      task.due_date && new Date(task.due_date) < now
    );
    const upcomingTasks = userContext.tasks.filter(task => 
      task.due_date && new Date(task.due_date) >= now
    );
    
    let tasksSummary = '';
    
    if (overdueTasks.length > 0) {
      tasksSummary += `**⚠️ TAREAS VENCIDAS (${overdueTasks.length}):**\n`;
      tasksSummary += overdueTasks.map(task => {
        const daysOverdue = Math.floor((now - new Date(task.due_date)) / (1000 * 60 * 60 * 24));
        return `- ${task.title} (vencida hace ${daysOverdue} día${daysOverdue !== 1 ? 's' : ''})`;
      }).join('\n');
      tasksSummary += '\n\n';
    }
    
    if (upcomingTasks.length > 0) {
      tasksSummary += `**📅 TAREAS PRÓXIMAS (${upcomingTasks.length}):**\n`;
      tasksSummary += upcomingTasks.map(task => {
        const dueDate = new Date(task.due_date).toLocaleDateString('es-ES');
        return `- ${task.title} (${dueDate})`;
      }).join('\n');
    }
    
    sections.push(`## ✅ TAREAS PENDIENTES DEL USUARIO

${tasksSummary}

**SÉ PROACTIVA:** Al inicio de la conversación, si hay tareas vencidas o próximas, menciόnalas:
- "Veo que tienes una tarea pendiente: [título]. ¿Ya la hiciste?"
- "Recuerda que mañana tienes programado: [título]"`);
  }
  
  // CONTACTOS
  if (userContext.contacts && userContext.contacts.length > 0) {
    const contactsList = userContext.contacts.map(contact => 
      `- ${contact.name} (${contact.contact_type})`
    ).join('\n');
    
    sections.push(`## 👥 CONTACTOS DEL USUARIO

Este usuario tiene ${userContext.contacts.length} contacto(s) registrado(s):

${contactsList}

**IMPORTANTE:** Cuando el usuario mencione a alguna de estas personas, sabes que ya está registrada.`);
  }
  
  // Si no hay ninguna sección, no añadir nada
  if (sections.length === 0) {
    return '';
  }
  
  // Combinar todas las secciones
  return `
# ═══════════════════════════════════════════════════════════════
# 💾 MEMORIA PERSISTENTE Y CONTEXTO DEL USUARIO
# ═══════════════════════════════════════════════════════════════

${sections.join('\n\n')}

# ═══════════════════════════════════════════════════════════════
# FIN DE LA MEMORIA PERSISTENTE
# ═══════════════════════════════════════════════════════════════
`;
}

/**
 * Guardar mensaje del usuario Y de Sofía en la base de datos
 * Se llama DESPUÉS de recibir la respuesta de OpenAI
 */
async function saveConversationToDatabase(user, userMessage, sofiaMessage) {
  if (!user || !supabaseClient) return;
  
  try {
    // Guardar mensaje del usuario
    await supabaseClient.saveMessage(
      user.id,
      userMessage,
      'user'
    );
    
    // Guardar mensaje de Sofía
    await supabaseClient.saveMessage(
      user.id,
      sofiaMessage,
      'sofia'
    );
    
    console.log('✅ Conversación guardada en base de datos');
  } catch (error) {
    console.error('⚠️ Error al guardar conversación:', error);
    // NO fallar la petición si falla el guardado - es solo logging
  }
}

// ============================================
// CÓDIGO A AÑADIR EN EL HANDLER (chat.js)
// ============================================

/*
// PASO 1: Añadir al inicio del archivo (línea 5):
import supabaseClient from './supabase-client.js';

// PASO 2: En el bloque "Parse Request" (línea 110), añadir:
const { 
  messages, 
  userType, 
  userName,
  userEmail,  // ← AÑADIR ESTA LÍNEA
  sofiaVersion = 'sofia-1.0',
  ...
} = req.body;

// PASO 3: Donde se construye el system prompt (línea ~240), REEMPLAZAR:
// ANTES:
const systemPrompt = buildSystemPrompt(userType, userName || 'Usuario', userPlan);

// DESPUÉS:
const systemPrompt = await buildSystemPromptWithMemory(
  userType, 
  userName || 'Usuario', 
  userPlan,
  userEmail  // ← NUEVO parámetro
);

// PASO 4: Después de obtener la respuesta de OpenAI (línea ~420), AÑADIR:
// (justo después de: const responseMessage = completion.choices[0].message.content;)
// Guardar conversación en base de datos (asíncrono, no bloqueante)
if (userEmail) {
  const user = await supabaseClient.getOrCreateUser(userEmail, userName, userType);
  if (user) {
    saveConversationToDatabase(
      user,
      lastMessage.content,
      responseMessage
    ).catch(err => console.error('Error guardando conversación:', err));
  }
}

*/

// Exportar funciones para usar en chat.js
export {
  buildSystemPromptWithMemory,
  buildMemorySection,
  saveConversationToDatabase
};
