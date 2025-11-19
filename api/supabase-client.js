// api/supabase-client.js
// Cliente de Supabase para gestión de CRM y memoria persistente
// Versión: 1.1.0 - FIXED: Import desde npm en lugar de CDN
// ESTE ARCHIVO ES COMPLETAMENTE NUEVO - NO AFECTA AL CÓDIGO EXISTENTE

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
let supabase = null;

function getSupabaseClient() {
  if (supabase) return supabase;
  
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase no configurado - CRM desactivado');
    return null;
  }
  
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase conectado');
  return supabase;
}

// ============================================
// FUNCIONES DE USUARIOS
// ============================================

/**
 * Obtener o crear usuario por email
 */
export async function getOrCreateUser(email, name = null, userType = 'particular', cifNif = null) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    // Buscar usuario existente con retry logic
    let { data: user, error } = await retrySupabaseOperation(async () => {
      return await client
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
    });
    
    if (error && error.code !== 'PGRST116') {
      console.error('❌ Error buscando usuario en Supabase:', error.message, error.details, error.hint);
      throw error;
    }
    
    // Si no existe, crearlo
    if (!user) {
      const insertData = {
        email,
        name: name || email.split('@')[0],
        user_type: userType
      };
      
      // Si es profesional y tiene CIF, agregarlo
      if (userType === 'profesional' && cifNif) {
        insertData.cif_nif = cifNif;
      }
      
      const { data: newUser, error: createError } = await retrySupabaseOperation(async () => {
        return await client
          .from('users')
          .insert(insertData)
          .select()
          .single();
      });
      
      if (createError) {
        console.error('❌ Error creando usuario en Supabase:', createError.message, createError.details, createError.hint);
        throw createError;
      }
      
      console.log('✅ Usuario creado:', newUser.id);
      return newUser;
    }
    
    // Actualizar last_active
    await client
      .from('users')
      .update({ last_active: new Date().toISOString() })
      .eq('id', user.id);
    
    return user;
  } catch (error) {
    console.error('❌ Error COMPLETO en getOrCreateUser:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack
    });
    return null;
  }
}

/**
 * Helper function para reintentar operaciones de Supabase en caso de errores de red
 */
async function retrySupabaseOperation(operation, maxRetries = 3) {
  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await operation();
      return result; // Éxito, devolver resultado
    } catch (error) {
      lastError = error;
      
      // Si es error de red, reintentar
      const isNetworkError = error.message && (
        error.message.includes('fetch failed') ||
        error.message.includes('socket') ||
        error.message.includes('ECONNRESET') ||
        error.message.includes('timeout')
      );
      
      if (isNetworkError && attempt < maxRetries) {
        const delay = 500 * attempt; // Backoff exponencial: 500ms, 1000ms, 1500ms
        console.warn(`⚠️ Intento ${attempt}/${maxRetries} falló - Error de red, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Si no es error de red o ya agotamos reintentos, lanzar error
      throw error;
    }
  }
  
  // Si llegamos aquí, todos los reintentos fallaron
  throw lastError;
}

// ============================================
// FUNCIONES DE CONVERSACIONES (MEMORIA)
// ============================================

/**
 * Guardar mensaje en historial
 */
export async function saveMessage(userId, message, sender = 'user', propertyId = null, contactId = null) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('conversations')
      .insert({
        user_id: userId,
        message,
        sender,
        property_id: propertyId,
        contact_id: contactId
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error en saveMessage:', error);
    return null;
  }
}

/**
 * Obtener últimas conversaciones del usuario (memoria a corto plazo)
 */
export async function getRecentConversations(userId, limit = 20) {
  const client = getSupabaseClient();
  if (!client) return [];
  
  try {
    const { data, error } = await client
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    
    // Invertir para tener orden cronológico (más antiguo primero)
    return data.reverse();
  } catch (error) {
    console.error('Error en getRecentConversations:', error);
    return [];
  }
}

/**
 * Obtener contexto completo del usuario (para Sofía)
 */
export async function getUserContext(userId) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    // Obtener datos en paralelo
    const [conversationsRes, propertiesRes, tasksRes, contactsRes] = await Promise.all([
      client
        .from('conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20),
      
      client
        .from('properties')
        .select('id, title, address, city, price, status')
        .eq('user_id', userId)
        .limit(10),
      
      client
        .from('tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pendiente')
        .order('due_date', { ascending: true })
        .limit(5),
      
      client
        .from('contacts')
        .select('id, name, contact_type')
        .eq('user_id', userId)
        .limit(10)
    ]);
    
    return {
      conversations: conversationsRes.data || [],
      properties: propertiesRes.data || [],
      tasks: tasksRes.data || [],
      contacts: contactsRes.data || []
    };
  } catch (error) {
    console.error('Error en getUserContext:', error);
    return null;
  }
}

// ============================================
// FUNCIONES DE PROPIEDADES
// ============================================

/**
 * Crear propiedad desde chat con Sofía
 */
export async function createProperty(userId, propertyData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('properties')
      .insert({
        user_id: userId,
        ...propertyData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Propiedad creada:', data.id);
    return data;
  } catch (error) {
    console.error('Error en createProperty:', error);
    return null;
  }
}

/**
 * Obtener todas las propiedades del usuario
 */
export async function getUserProperties(userId, limit = 100) {
  const client = getSupabaseClient();
  if (!client) return [];
  
  try {
    const { data, error } = await client
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .neq('status', 'eliminado')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error en getUserProperties:', error);
    return [];
  }
}

/**
 * Buscar propiedad por dirección (para vincular conversaciones)
 */
export async function findPropertyByAddress(userId, address) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('properties')
      .select('*')
      .eq('user_id', userId)
      .ilike('address', `%${address}%`)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    
    return data;
  } catch (error) {
    console.error('Error en findPropertyByAddress:', error);
    return null;
  }
}

/**
 * Actualizar propiedad existente
 */
export async function updateProperty(propertyId, userId, propertyData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    // Preparar datos de actualización (remover campos que no queremos actualizar)
    const updateData = {
      ...propertyData,
      updated_at: new Date().toISOString()
    };
    
    // Remover campos que no deben ser actualizados directamente
    delete updateData.id;
    delete updateData.user_id;
    delete updateData.created_at;
    
    const { data, error } = await client
      .from('properties')
      .update(updateData)
      .eq('id', propertyId)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Propiedad actualizada:', propertyId);
    return data;
  } catch (error) {
    console.error('Error en updateProperty:', error);
    return null;
  }
}

/**
 * Eliminar propiedad (soft delete)
 */
export async function deleteProperty(propertyId, userId) {
  const client = getSupabaseClient();
  if (!client) return false;
  
  try {
    const { error } = await client
      .from('properties')
      .update({ status: 'eliminado' })
      .eq('id', propertyId)
      .eq('user_id', userId);
    
    if (error) throw error;
    
    console.log('✅ Propiedad eliminada:', propertyId);
    return true;
  } catch (error) {
    console.error('Error en deleteProperty:', error);
    return false;
  }
}

// ============================================
// FUNCIONES DE CONTACTOS
// ============================================

/**
 * Crear contacto
 */
export async function createContact(userId, contactData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('contacts')
      .insert({
        user_id: userId,
        ...contactData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Contacto creado:', data.id);
    return data;
  } catch (error) {
    console.error('Error en createContact:', error);
    return null;
  }
}

/**
 * Vincular contacto con propiedad
 */
export async function linkPropertyContact(propertyId, contactId, relationship = 'interesado') {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('property_contacts')
      .insert({
        property_id: propertyId,
        contact_id: contactId,
        relationship
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Contacto vinculado a propiedad');
    return data;
  } catch (error) {
    console.error('Error en linkPropertyContact:', error);
    return null;
  }
}

// ============================================
// FUNCIONES DE TAREAS
// ============================================

/**
 * Crear tarea
 */
export async function createTask(userId, taskData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('tasks')
      .insert({
        user_id: userId,
        ...taskData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Tarea creada:', data.id);
    return data;
  } catch (error) {
    console.error('Error en createTask:', error);
    return null;
  }
}

/**
 * Obtener tareas pendientes (para proactividad de Sofía)
 */
export async function getPendingTasks(userId) {
  const client = getSupabaseClient();
  if (!client) return [];
  
  try {
    const { data, error } = await client
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pendiente')
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error en getPendingTasks:', error);
    return [];
  }
}

// ============================================
// FUNCIONES DE EVENTOS
// ============================================

/**
 * Crear evento en timeline
 */
export async function createEvent(userId, eventData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('events')
      .insert({
        user_id: userId,
        ...eventData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Evento creado:', data.id);
    return data;
  } catch (error) {
    console.error('Error en createEvent:', error);
    return null;
  }
}

// ============================================
// FUNCIONES DE PERFIL PROFESIONAL
// ============================================

/**
 * Obtener perfil profesional por user_id
 */
export async function getProfessionalProfile(userId) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('professional_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error en getProfessionalProfile:', error);
    return null;
  }
}

/**
 * Crear perfil profesional
 */
export async function createProfessionalProfile(userId, profileData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('professional_profiles')
      .insert({
        user_id: userId,
        ...profileData
      })
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Perfil profesional creado:', data.id);
    return data;
  } catch (error) {
    console.error('Error en createProfessionalProfile:', error);
    return null;
  }
}

/**
 * Actualizar perfil profesional
 */
export async function updateProfessionalProfile(userId, profileData) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('professional_profiles')
      .update(profileData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Perfil profesional actualizado:', data.id);
    return data;
  } catch (error) {
    console.error('Error en updateProfessionalProfile:', error);
    return null;
  }
}

/**
 * Verificar si el usuario completó el onboarding
 */
export async function hasCompletedOnboarding(userId) {
  const profile = await getProfessionalProfile(userId);
  return profile ? profile.onboarding_completed === true : false;
}

/**
 * Marcar onboarding como completado
 */
export async function markOnboardingComplete(userId) {
  const client = getSupabaseClient();
  if (!client) return null;
  
  try {
    const { data, error } = await client
      .from('professional_profiles')
      .update({
        onboarding_completed: true,
        is_complete: true,
        profile_completed_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    
    console.log('✅ Onboarding completado para usuario:', userId);
    return data;
  } catch (error) {
    console.error('Error en markOnboardingComplete:', error);
    return null;
  }
}

// ============================================
// EXPORTAR FUNCIONES
// ============================================

export default {
  getOrCreateUser,
  saveMessage,
  getRecentConversations,
  getUserContext,
  createProperty,
  getUserProperties,
  findPropertyByAddress,
  updateProperty,
  deleteProperty,
  createContact,
  linkPropertyContact,
  createTask,
  getPendingTasks,
  createEvent,
  // Funciones de perfil profesional
  getProfessionalProfile,
  createProfessionalProfile,
  updateProfessionalProfile,
  hasCompletedOnboarding,
  markOnboardingComplete
};
