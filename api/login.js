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
      
      // Obtener usuario de Supabase usando fetch directo
      console.log('🔐 Buscando usuario en Supabase:', email);
      
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase no configurado');
        return res.status(500).json({ 
          success: false, 
          error: 'Configuración de base de datos incompleta' 
        });
      }
      
      // Buscar usuario por email
      const getUserResponse = await fetch(`${supabaseUrl}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!getUserResponse.ok) {
        console.error('Error buscando usuario en BD');
        return res.status(401).json({ 
          success: false, 
          error: 'Email o contraseña incorrectos' 
        });
      }
      
      const users = await getUserResponse.json();
      
      if (!users || users.length === 0) {
        console.log('❌ Usuario no encontrado:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Email o contraseña incorrectos' 
        });
      }
      
      user = users[0];
      
      // Verificar password con hash guardado en BD
      if (user.password_hash && user.password_hash !== hashedPassword) {
        console.log('❌ Password incorrecta para:', email);
        return res.status(401).json({ 
          success: false, 
          error: 'Email o contraseña incorrectos' 
        });
      }
      
      // Actualizar last_login
      await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({ last_login: new Date().toISOString() })
      });
      
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
