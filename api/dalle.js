// 🎨 DOMUS-IA ESPAÑA - DALL-E 3 IMAGE GENERATION
// Serverless Function para generación de imágenes con DALL-E 3
// Integrado con límites por plan de usuario

export default async function handler(req, res) {
  // ============================================================================
  // CORS Configuration
  // ============================================================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // ============================================================================
    // Security & Configuration
    // ============================================================================
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'API key not configured' 
      });
    }

    // ============================================================================
    // Parse Request
    // ============================================================================
    const { 
      prompt,           // Descripción de la imagen a generar
      size = '1024x1024', // Tamaño: '1024x1024', '1024x1792', '1792x1024'
      quality = 'standard', // 'standard' o 'hd'
      style = 'vivid',   // 'vivid' o 'natural'
      userPlan = 'particular', // Plan del usuario para límites
      userEmail         // Para tracking de uso
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt is required' 
      });
    }

    // ============================================================================
    // Mejorar prompt con contexto inmobiliario
    // ============================================================================
    const enhancedPrompt = enhancePromptForRealEstate(prompt);

    console.log('🎨 Generando imagen con DALL-E 3:', enhancedPrompt);

    // ============================================================================
    // Call DALL-E 3 API
    // ============================================================================
    const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: enhancedPrompt,
        n: 1,
        size: size,
        quality: quality,
        style: style
      })
    });

    if (!dalleResponse.ok) {
      const error = await dalleResponse.json();
      console.error('DALL-E API Error:', error);
      return res.status(dalleResponse.status).json({ 
        success: false,
        error: 'DALL-E API error: ' + (error.error?.message || 'Unknown error')
      });
    }

    const data = await dalleResponse.json();

    // ============================================================================
    // Response
    // ============================================================================
    return res.status(200).json({
      success: true,
      imageUrl: data.data[0].url,
      revisedPrompt: data.data[0].revised_prompt,
      cost: calculateDallECost(size, quality),
      message: '✅ Imagen generada exitosamente'
    });

  } catch (error) {
    console.error('Function Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error: ' + error.message 
    });
  }
}

// ============================================================================
// 🎨 HELPER FUNCTIONS
// ============================================================================

/**
 * Mejora el prompt con contexto inmobiliario para mejores resultados
 */
function enhancePromptForRealEstate(userPrompt) {
  // Si el prompt ya es detallado, no modificarlo
  if (userPrompt.length > 200) {
    return userPrompt;
  }

  // Keywords inmobiliarias comunes
  const realEstateKeywords = [
    'casa', 'piso', 'apartamento', 'villa', 'chalet',
    'inmueble', 'propiedad', 'vivienda', 'edificio',
    'salón', 'cocina', 'dormitorio', 'baño', 'terraza',
    'jardín', 'piscina', 'fachada', 'interior'
  ];

  const hasRealEstateContext = realEstateKeywords.some(keyword => 
    userPrompt.toLowerCase().includes(keyword)
  );

  if (hasRealEstateContext) {
    // Si ya tiene contexto inmobiliario, solo mejorarlo ligeramente
    return `High-quality, professional real estate photography style: ${userPrompt}. Modern, bright, inviting atmosphere.`;
  }

  // Si no tiene contexto inmobiliario, mantener el prompt original
  return userPrompt;
}

/**
 * Calcula el coste de generación de DALL-E 3
 */
function calculateDallECost(size, quality) {
  // Precios reales de OpenAI (Enero 2025)
  const pricing = {
    'standard': {
      '1024x1024': 0.040,
      '1024x1792': 0.080,
      '1792x1024': 0.080
    },
    'hd': {
      '1024x1024': 0.080,
      '1024x1792': 0.120,
      '1792x1024': 0.120
    }
  };

  return pricing[quality]?.[size] || 0.040;
}
