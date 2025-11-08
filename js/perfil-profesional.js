// ============================================================================
// API: Professional Profile Management
// Descripción: CRUD completo para perfiles profesionales de agentes/empresas
// Autor: Domus-IA España
// Fecha: 04 Noviembre 2025
// ============================================================================

import { createClient } from '@supabase/supabase-js';

// Inicializar cliente Supabase
function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase no configurado');
  }
  
  return createClient(supabaseUrl, supabaseKey);
}

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabase = getSupabaseClient();

  try {
    // ========================================================================
    // GET: Obtener perfil profesional
    // ========================================================================
    if (req.method === 'GET') {
      const { email, userId } = req.query;

      if (!email && !userId) {
        return res.status(400).json({
          success: false,
          error: 'Email o userId requerido'
        });
      }

      // Buscar usuario primero
      let user;
      if (email) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, user_type')
          .eq('email', email)
          .single();

        if (userError || !userData) {
          return res.status(404).json({
            success: false,
            error: 'Usuario no encontrado'
          });
        }
        user = userData;
      } else {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, email, name, user_type')
          .eq('id', userId)
          .single();

        if (userError || !userData) {
          return res.status(404).json({
            success: false,
            error: 'Usuario no encontrado'
          });
        }
        user = userData;
      }

      // Obtener perfil profesional
      const { data: profile, error: profileError } = await supabase
        .from('professional_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error obteniendo perfil:', profileError);
        return res.status(500).json({
          success: false,
          error: 'Error al obtener perfil'
        });
      }

      // Si no existe perfil, devolver null pero indicar que el usuario existe
      if (!profile) {
        return res.status(200).json({
          success: true,
          profile: null,
          user: user,
          message: 'Usuario existe pero no tiene perfil profesional creado'
        });
      }

      return res.status(200).json({
        success: true,
        profile: profile,
        user: user
      });
    }

    // ========================================================================
    // POST: Crear perfil profesional
    // ========================================================================
    if (req.method === 'POST') {
      const { email, profileData } = req.body;

      if (!email || !profileData) {
        return res.status(400).json({
          success: false,
          error: 'Email y profileData requeridos'
        });
      }

      // Buscar usuario
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id, email, name, user_type')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Verificar que sea profesional
      if (user.user_type !== 'profesional') {
        return res.status(403).json({
          success: false,
          error: 'Solo usuarios profesionales pueden crear perfil de empresa'
        });
      }

      // Verificar si ya existe un perfil
      const { data: existingProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        return res.status(409).json({
          success: false,
          error: 'El usuario ya tiene un perfil profesional. Use PUT para actualizar.'
        });
      }

      // Crear perfil profesional
      const { data: newProfile, error: createError } = await supabase
        .from('professional_profiles')
        .insert({
          user_id: user.id,
          ...profileData
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creando perfil:', createError);
        return res.status(500).json({
          success: false,
          error: 'Error al crear perfil profesional',
          details: createError.message
        });
      }

      return res.status(201).json({
        success: true,
        profile: newProfile,
        message: 'Perfil profesional creado exitosamente'
      });
    }

    // ========================================================================
    // PUT: Actualizar perfil profesional
    // ========================================================================
    if (req.method === 'PUT') {
      const { email, profileData } = req.body;

      if (!email || !profileData) {
        return res.status(400).json({
          success: false,
          error: 'Email y profileData requeridos'
        });
      }

      // Buscar usuario
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Actualizar perfil
      const { data: updatedProfile, error: updateError } = await supabase
        .from('professional_profiles')
        .update(profileData)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error actualizando perfil:', updateError);
        return res.status(500).json({
          success: false,
          error: 'Error al actualizar perfil profesional',
          details: updateError.message
        });
      }

      return res.status(200).json({
        success: true,
        profile: updatedProfile,
        message: 'Perfil profesional actualizado exitosamente'
      });
    }

    // ========================================================================
    // DELETE: Eliminar perfil profesional
    // ========================================================================
    if (req.method === 'DELETE') {
      const { email } = req.query;

      if (!email) {
        return res.status(400).json({
          success: false,
          error: 'Email requerido'
        });
      }

      // Buscar usuario
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (userError || !user) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado'
        });
      }

      // Eliminar perfil
      const { error: deleteError } = await supabase
        .from('professional_profiles')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error eliminando perfil:', deleteError);
        return res.status(500).json({
          success: false,
          error: 'Error al eliminar perfil profesional',
          details: deleteError.message
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Perfil profesional eliminado exitosamente'
      });
    }

    // Método no soportado
    return res.status(405).json({
      success: false,
      error: `Método ${req.method} no soportado`
    });

  } catch (error) {
    console.error('Error en professional-profile API:', error);
    return res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
}
