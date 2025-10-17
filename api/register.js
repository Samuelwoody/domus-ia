// api/register.js
// Registro de nuevos usuarios - Integrado con Supabase
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
    const { name, email, password, userType, businessDocument } = req.body;

    // Validar campos requeridos
    if (!name || !email || !password || !userType) {
      return res.status(400).json({ 
        success: false,
        error: 'Faltan campos requeridos' 
      });
    }

    // Validar tipo de usuario
    if (!['particular', 'profesional'].includes(userType)) {
      return res.status(400).json({ 
        success: false,
        error: 'Tipo de usuario inválido' 
      });
    }

    // Si es profesional, requiere documento
    if (userType === 'profesional' && !businessDocument) {
      return res.status(400).json({ 
        success: false,
        error: 'Los profesionales deben proporcionar CIF/NIF' 
      });
    }
    
    // Validar formato CIF/NIF español
    if (userType === 'profesional' && businessDocument) {
      const cifNifRegex = /^[A-Z]?[0-9]{8}[A-Z]?$/i;
      const cleanDoc = businessDocument.toUpperCase().trim();
      
      if (!cifNifRegex.test(cleanDoc)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Formato de CIF/NIF inválido. Use: B12345678 (CIF) o 12345678A (NIF)' 
        });
      }
    }

    // Hash de contraseña (simple - en producción usar bcrypt)
    const hashedPassword = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');
    
    // Crear usuario en Supabase o modo demo
    let user = null;
    let isDemo = false;
    
    if (supabaseClient) {
      // Modo producción con Supabase
      console.log('📝 Creando usuario en Supabase:', email);
      
      // Si es profesional, limpiar y pasar el CIF
      const cleanCif = (userType === 'profesional' && businessDocument) 
        ? businessDocument.toUpperCase().trim() 
        : null;
      
      user = await supabaseClient.getOrCreateUser(
        email, 
        name, 
        userType,
        cleanCif
      );
      
      if (!user) {
        return res.status(500).json({ 
          success: false, 
          error: 'Error al crear usuario en base de datos' 
        });
      }
      
      // Actualizar password_hash y cif_nif usando el cliente directo
      console.log('📝 Actualizando credenciales para usuario:', user.id);
      
      // Construir URL de actualización
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Supabase no configurado');
        return res.status(500).json({ 
          success: false, 
          error: 'Configuración de base de datos incompleta' 
        });
      }
      
      const updateData = {
        password_hash: hashedPassword,
        last_login: new Date().toISOString()
      };
      
      // Solo agregar cif_nif si es profesional
      if (userType === 'profesional' && businessDocument) {
        updateData.cif_nif = businessDocument.toUpperCase().trim();
      }
      
      // Hacer update directo con fetch
      const updateResponse = await fetch(`${supabaseUrl}/rest/v1/users?id=eq.${user.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!updateResponse.ok) {
        const errorText = await updateResponse.text();
        console.error('Error actualizando usuario:', errorText);
        return res.status(500).json({ 
          success: false, 
          error: 'Error al guardar credenciales en base de datos' 
        });
      }
      
      console.log('✅ Usuario creado en Supabase:', user.id);
      console.log('✅ Credenciales guardadas correctamente');
      
    } else {
      // Modo DEMO (sin Supabase configurado)
      isDemo = true;
      user = {
        id: 'demo-' + Date.now(),
        email: email,
        name: name,
        user_type: userType
      };
      console.log('🎭 Usuario creado en modo DEMO');
    }
    
    // Generar token de sesión (simple - en producción usar JWT)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Respuesta
    const responseUser = {
      id: user.id,
      name: user.name || name,
      email: user.email || email,
      userType: user.user_type || userType,
      businessDocument: userType === 'profesional' ? businessDocument : null,
      subscriptionPlan: user.subscription_plan || 'free',
      subscriptionStatus: user.subscription_status || 'active',
      usage: {
        messages: 0,
        dalle: 0,
        vision: 0,
        documents: 0
      }
    };
    
    console.log('✅ Registro exitoso:', responseUser.email);
    
    return res.status(201).json({
      success: true,
      user: responseUser,
      token: token,
      demo: isDemo,
      message: isDemo 
        ? 'Cuenta creada en modo demo (sin base de datos)' 
        : 'Cuenta creada exitosamente'
    });

  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
