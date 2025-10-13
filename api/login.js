// api/login.js
// Login de usuarios - Sin API keys

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

    // TODO: Implementar con base de datos real
    /*
    const bcrypt = require('bcrypt');
    const jwt = require('jsonwebtoken');

    // 1. Buscar usuario por email
    const user = await db.users.findUnique({
      where: { email: email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Email o contraseña incorrectos' 
      });
    }

    // 2. Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false,
        error: 'Email o contraseña incorrectos' 
      });
    }

    // 3. Generar token JWT
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        userType: user.userType 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // 4. Actualizar último login
    await db.users.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    return res.status(200).json({
      success: true,
      message: 'Login exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        userType: user.userType,
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        stripeCustomerId: user.stripeCustomerId,
        usage: {
          messages: user.monthlyMessageCount,
          dalle: user.monthlyDalleCount,
          vision: user.monthlyVisionCount,
          documents: user.monthlyDocumentCount
        }
      },
      token: token
    });
    */

    // MODO DEMO - Login simulado
    console.log('✅ Login simulado:', { email });
    
    const userId = 'user_' + Date.now();
    
    return res.status(200).json({
      success: true,
      demo: true,
      message: 'Login exitoso (modo demo)',
      user: {
        id: userId,
        name: 'Usuario Demo',
        email: email,
        userType: 'particular',
        subscriptionPlan: 'free',
        usage: {
          messages: 0,
          dalle: 0,
          vision: 0,
          documents: 0
        }
      },
      token: 'demo_token_' + userId
    });

  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
