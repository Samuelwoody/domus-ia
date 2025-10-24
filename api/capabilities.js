// API para informar al frontend qué capacidades están activas
// Esto evita el error 404 que vimos en Console

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // ============================================================================
  // 🚀 CAPACIDADES AVANZADAS ACTIVAS (Enero 2025)
  // ============================================================================
  const capabilities = {
    chat: true,
    vision: true,           // ✅ Análisis de imágenes con GPT-4o Vision
    imageGeneration: true,  // ✅ DALL-E 3 para generación de imágenes
    webSearch: true,        // ✅ Búsqueda web en tiempo real con Tavily
    fileUpload: true,       // ✅ Subir y analizar PDFs, Word, Excel
    textToSpeech: false,    // ⏳ Futuro: Sofía habla (próximamente)
    
    // Límites por plan
    plans: {
      particular: {
        name: 'PARTICULAR',
        price: '€99/mes',
        messages: 500,
        dalleImages: 10,
        visionAnalysis: 100,
        documentUploads: 50,
        webSearches: 'ilimitadas'
      },
      profesional: {
        name: 'PROFESIONAL',
        price: '€199/mes',
        messages: 1000,
        dalleImages: 30,
        visionAnalysis: 300,
        documentUploads: 150,
        webSearches: 'ilimitadas'
      },
      premium: {
        name: 'PREMIUM',
        price: '€399/mes',
        messages: 3000,
        dalleImages: 100,
        visionAnalysis: 'ilimitadas',
        documentUploads: 500,
        webSearches: 'ilimitadas'
      }
    },
    
    versions: [
      {
        id: 'sofia-1.0',
        name: 'Sofía 1.0',
        description: 'Versión estándar con conocimiento completo y todas las funcionalidades avanzadas',
        model: 'GPT-4o',
        available: true
      },
      {
        id: 'sofia-2.0-pro',
        name: 'Sofía 2.0 Pro',
        description: 'Versión avanzada con máxima potencia y respuestas más profundas',
        model: 'GPT-4',
        available: true
      }
    ],
    
    features: {
      webSearch: {
        name: 'Búsqueda Web en Tiempo Real',
        description: 'Acceso a información actualizada de Internet vía Tavily Search API',
        icon: '🌐'
      },
      vision: {
        name: 'Análisis de Imágenes',
        description: 'Analiza fotos de propiedades, planos, documentos con GPT-4o Vision',
        icon: '👁️'
      },
      imageGeneration: {
        name: 'Generación de Imágenes',
        description: 'Crea renders, visualizaciones y material marketing con DALL-E 3',
        icon: '🎨'
      },
      documentUpload: {
        name: 'Análisis de Documentos',
        description: 'Sube y analiza PDFs, Word, Excel para extraer información clave',
        icon: '📄'
      }
    }
  };

  return res.status(200).json(capabilities);
}
