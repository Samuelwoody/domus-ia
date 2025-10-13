// api/register.js
// Registro de nuevos usuarios - Sin API keys

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

    // TODO: Implementar con base de datos real
    /*
    // 1. Verificar que el email no existe
    const existingUser = await db.users.findUnique({
      where: { email: email }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        error: 'El email ya está registrado' 
      });
    }

    // 2. Hashear contraseña
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Crear usuario
    const user = await db.users.create({
      data: {
        name: name,
        email: email,
        password: hashedPassword,
        userType: userType,
        businessDocument: businessDocument || null,
        subscriptionPlan: 'free',
        subscriptionStatus: 'trial',
        monthlyMessageCount: 0,
        monthlyDalleCount: 0,
        monthlyVisionCount: 0,
        monthlyDocumentCount: 0,
        createdAt: new Date()
      }
    });

    // 4. Generar token JWT
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.userType },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        subscriptionPlan: user.subscriptionPlan
      },
      token: token
    });
    */

    // MODO DEMO - Crear usuario simulado
    console.log('✅ Registro simulado:', { name, email, userType, businessDocument });
    
    const userId = 'user_' + Date.now();
    
    return res.status(201).json({
      success: true,
      demo: true,
      message: 'Usuario registrado (modo demo)',
      user: {
        id: userId,
        name: name,
        email: email,
        userType: userType,
        subscriptionPlan: 'free'
      },
      token: 'demo_token_' + userId
    });

  } catch (error) {
    console.error('Error en register:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
