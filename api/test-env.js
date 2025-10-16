// Test endpoint para verificar variables de entorno
export default async function handler(req, res) {
  const envVars = {
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasTavily: !!process.env.TAVILY_API_KEY,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasSupabaseKey: !!process.env.SUPABASE_SERVICE_KEY,
    hasSupabaseAnon: !!process.env.SUPABASE_ANON_KEY,
    hasImgBB: !!process.env.IMGBB_API_KEY,
    
    // Mostrar solo primeros caracteres para seguridad
    openAIPrefix: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.substring(0, 7) + '...' : 'NO CONFIGURADO',
    supabaseUrlPrefix: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 20) + '...' : 'NO CONFIGURADO'
  };
  
  res.status(200).json({
    success: true,
    message: 'Test de variables de entorno',
    environment: envVars
  });
}
