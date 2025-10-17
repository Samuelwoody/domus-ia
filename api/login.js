// api/login.js
// Login de usuarios - Integrado con Supabase
// Versión: 2.0.0 - Compatible con auth.js y main.js

import supabaseClient from './supabase-client.js';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        error: 'Email y contraseña requeridos' 
      });
    }

    // Hash de contraseña para comparar
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    let user = null;
    let isDemo = false;
    
    if (supabaseClient) {
      // Modo producción con Supabase
      console.log('🔐 Intentando login con Supabase:', email);
      
      // Obtener usuario de Supabase
      user = await supabaseClient.getOrCreateUser(email);
      
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          error: 'Email o contraseña incorrectos' 
        });
      }
      
      // TODO: Verificar password con hash guardado en BD
      // Por ahora aceptamos cualquier password en modo Supabase
      // Requiere columna password_hash en tabla users
      
      console.log('✅ Login exitoso en Supabase:', user.id);
      
    } else {
      // Modo DEMO (sin Supabase configurado)
      isDemo = true;
      user = {
        id: 'demo-' + Date.now(),
        email: email,
        name: email.split('@')[0],
        user_type: 'particular'
      };
      console.log('🎭 Login en modo DEMO');
    }
    
    // Generar token de sesión (simple - en producción usar JWT)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Respuesta
    const responseUser = {
      id: user.id,
      name: user.name || email.split('@')[0],
      email: user.email || email,
      userType: user.user_type || 'particular',
      subscriptionPlan: user.subscription_plan || 'free',
      subscriptionStatus: user.subscription_status || 'active',
      usage: {
        messages: 0,
        dalle: 0,
        vision: 0,
        documents: 0
      }
    };
    
    console.log('✅ Login exitoso:', responseUser.email);
    
    return res.status(200).json({
      success: true,
      user: responseUser,
      token: token,
      demo: isDemo,
      message: isDemo 
        ? 'Login exitoso (modo demo)' 
        : 'Sesión iniciada'
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
