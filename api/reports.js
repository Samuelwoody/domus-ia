// ============================================
// 📊 REPORTS API - Guardar y Servir Informes
// ============================================

export default async function handler(req, res) {
  // ============================================================================
  // CORS Configuration
  // ============================================================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // ============================================================================
    // POST: Publicar Informe
    // ============================================================================
    if (req.method === 'POST') {
      const { action, reportHTML, reportData, userEmail } = req.body;

      if (action === 'publish') {
        console.log('📊 Publicando informe...');
        
        // Generar ID único
        const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Extraer título del inmueble
        const propertyAddress = reportData?.property_data?.address || 'Inmueble';
        const title = `Informe de Valoración - ${propertyAddress}`;
        
        // URL pública
        const publicUrl = `${req.headers.origin || 'https://domus-ia.vercel.app'}/report.html?id=${reportId}`;
        
        try {
          // Guardar en localStorage del servidor (simulado)
          // En producción, esto debería guardarse en la tabla documents
          // TODO: Integrar con tabla documents cuando esté disponible
          
          // Por ahora, guardamos en memoria (no persistente, solo para demo)
          const reportDoc = {
            id: reportId,
            user_email: userEmail || 'guest@domus-ia.com',
            property_id: null, // Opcional: relacionar con property del CRM
            document_type: 'valuation_report',
            title: title,
            html_content: reportHTML,
            report_data: JSON.stringify(reportData),
            status: 'published',
            public_url: publicUrl,
            views_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          console.log('✅ Informe guardado:', reportId);
          console.log('🔗 URL pública:', publicUrl);
          
          return res.status(200).json({
            success: true,
            publicUrl: publicUrl,
            reportId: reportId,
            message: 'Informe publicado correctamente'
          });

        } catch (error) {
          console.error('❌ Error guardando informe:', error);
          return res.status(500).json({
            success: false,
            error: 'Error guardando el informe: ' + error.message
          });
        }
      }
      
      return res.status(400).json({
        success: false,
        error: 'Acción no válida. Use action: "publish"'
      });
    }

    // ============================================================================
    // GET: Obtener Informe por ID
    // ============================================================================
    if (req.method === 'GET') {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'ID del informe requerido'
        });
      }
      
      console.log('📊 Obteniendo informe:', id);
      
      // TODO: Buscar en tabla documents
      // Por ahora, devolvemos un placeholder
      // const report = await TableDataGet({ name: "documents", id: id });
      
      // Placeholder response (en producción vendría de la base de datos)
      return res.status(200).json({
        success: true,
        html: '<html><body><h1>Informe no encontrado</h1><p>Este informe aún no está guardado en la base de datos. La funcionalidad de guardado persistente estará disponible próximamente.</p></body></html>',
        reportId: id,
        message: 'Sistema en modo demo - guardar en base de datos pendiente de implementación'
      });
    }

    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Use POST o GET'
    });

  } catch (error) {
    console.error('❌ Error en reports API:', error);
    return res.status(500).json({
      success: false,
      error: 'Error del servidor: ' + error.message
    });
  }
}
