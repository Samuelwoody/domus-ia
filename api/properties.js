// 🏠 DOMUS-IA - CRM PROPERTIES API
// Endpoint para crear y gestionar propiedades inmobiliarias
// Integrado con Supabase PostgreSQL

import supabaseClient from './supabase-client.js';

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    try {
        // ==================================================
        // 📝 POST: Crear nueva propiedad
        // ==================================================
        if (req.method === 'POST') {
            const {
                userEmail,
                propertyData
            } = req.body;
            
            // Validación
            if (!userEmail) {
                return res.status(400).json({
                    error: 'Email de usuario requerido'
                });
            }
            
            if (!propertyData || !propertyData.address) {
                return res.status(400).json({
                    error: 'Datos de propiedad incompletos (mínimo: dirección)'
                });
            }
            
            // Obtener o crear usuario
            const user = await supabaseClient.getOrCreateUser(
                userEmail,
                propertyData.userName || 'Usuario',
                propertyData.userType || 'particular'
            );
            
            if (!user) {
                return res.status(500).json({
                    error: 'Error al obtener usuario'
                });
            }
            
            // Preparar datos de propiedad
            const propertyToCreate = {
                address: propertyData.address,
                city: propertyData.city || null,
                property_type: propertyData.property_type || 'piso',
                price: propertyData.price || null,
                surface_m2: propertyData.surface_m2 || null,
                rooms: propertyData.rooms || null,
                bathrooms: propertyData.bathrooms || null,
                description: propertyData.description || propertyData.raw_text || null,
                status: 'disponible',
                images: propertyData.images || []
            };
            
            // Crear propiedad en base de datos
            const createdProperty = await supabaseClient.createProperty(
                user.id,
                propertyToCreate
            );
            
            if (!createdProperty) {
                return res.status(500).json({
                    error: 'Error al crear propiedad en base de datos'
                });
            }
            
            console.log('✅ Propiedad creada:', createdProperty.id);
            
            return res.status(201).json({
                success: true,
                message: '🏠 Propiedad creada exitosamente',
                property: createdProperty
            });
        }
        
        // ==================================================
        // 📋 GET: Obtener propiedades del usuario
        // ==================================================
        if (req.method === 'GET') {
            const { userEmail } = req.query;
            
            if (!userEmail) {
                return res.status(400).json({
                    error: 'Email de usuario requerido'
                });
            }
            
            // Buscar usuario
            const user = await supabaseClient.getOrCreateUser(userEmail);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }
            
            // Obtener propiedades del usuario
            const properties = await supabaseClient.getUserProperties(user.id);
            
            return res.status(200).json({
                success: true,
                properties: properties || [],
                total: (properties || []).length
            });
        }
        
        // ==================================================
        // 🗑️ DELETE: Eliminar propiedad
        // ==================================================
        if (req.method === 'DELETE') {
            const { propertyId, userEmail } = req.body;
            
            if (!propertyId || !userEmail) {
                return res.status(400).json({
                    error: 'ID de propiedad y email requeridos'
                });
            }
            
            // Verificar que el usuario sea propietario
            const user = await supabaseClient.getOrCreateUser(userEmail);
            
            if (!user) {
                return res.status(404).json({
                    error: 'Usuario no encontrado'
                });
            }
            
            // Eliminar propiedad (soft delete cambiando status)
            const deleted = await supabaseClient.deleteProperty(propertyId, user.id);
            
            if (!deleted) {
                return res.status(500).json({
                    error: 'Error al eliminar propiedad'
                });
            }
            
            return res.status(200).json({
                success: true,
                message: 'Propiedad eliminada correctamente'
            });
        }
        
        // Método no soportado
        return res.status(405).json({
            error: 'Método no permitido'
        });
        
    } catch (error) {
        console.error('❌ Error en /api/properties:', error);
        return res.status(500).json({
            error: 'Error interno del servidor',
            details: error.message
        });
    }
}
