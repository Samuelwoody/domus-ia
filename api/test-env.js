// Test endpoint para verificar variables de entorno
// Seguridad: deshabilitado en producción para evitar enumeración de configuración.
export default async function handler(req, res) {
  if (process.env.NODE_ENV === 'production') {
    return res.status(404).json({
      success: false,
      error: 'Not found'
    });
  }

  const envVars = {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasTavily: !!process.env.TAVILY_API_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasSupabaseAnon: !!process.env.SUPABASE_ANON_KEY,
    hasImgBB: !!process.env.IMGBB_API_KEY
  };

  return res.status(200).json({
    success: true,
    message: 'Test de variables de entorno (solo desarrollo)',
    environment: envVars
  });
}
