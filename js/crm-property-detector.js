/**
 * 🏠 CRM PROPERTY DETECTOR
 * Detecta propiedades inmobiliarias en conversaciones naturales
 * Extrae: dirección, tipo, precio, m², habitaciones, baños
 * 
 * @author Domus-IA España
 * @version 2.0
 */

class PropertyDetector {
    constructor() {
        // Patrones de detección
        this.patterns = {
            // Tipos de propiedad
            propertyTypes: {
                'piso': /\b(piso|apartamento|ático|dúplex|duplex)\b/gi,
                'casa': /\b(casa|chalet|chalé|adosado|unifamiliar|villa)\b/gi,
                'local': /\b(local|oficina|nave|almacén|almacen)\b/gi,
                'terreno': /\b(terreno|parcela|solar|finca|terreno urbano)\b/gi
            },
            
            // Precio en euros
            price: [
                /(?:por|precio|vale|cuesta|vendo|compro)\s*(?:unos?\s*)?(\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?)\s*(?:€|euros?|mil|k)/gi,
                /(\d{1,3}(?:[.,]\d{3})*)\s*(?:€|euros?)/gi,
                /(\d{1,3})\s*(?:mil|k)\s*(?:€|euros?)?/gi
            ],
            
            // Superficie en m²
            surface: [
                /(\d{1,4})\s*(?:m2|m²|metros\s*cuadrados?|metros)/gi,
                /superficie\s*(?:de\s*)?(\d{1,4})\s*m/gi
            ],
            
            // Habitaciones
            rooms: [
                /(\d)\s*(?:habitacion(?:es)?|dormitorio(?:s)?|hab\.?|dorm\.?)/gi,
                /(?:con|tiene)\s*(\d)\s*(?:hab|habitacion)/gi
            ],
            
            // Baños
            bathrooms: [
                /(\d)\s*(?:baño(?:s)?|aseo(?:s)?)/gi,
                /(?:con|tiene)\s*(\d)\s*(?:baño|aseo)/gi
            ],
            
            // Dirección (más complejo, requiere análisis contextual)
            address: [
                /(?:en|calle|avenida|av\.|plaza|paseo|c\/)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ]?[a-záéíóúñ]+)*)\s*(?:n[úuº]?\.?\s*)?(\d+)?/gi,
                /(?:zona|barrio|distrito)\s+(?:de\s+)?([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑ]?[a-záéíóúñ]+)*)/gi
            ],
            
            // Ciudad
            city: /(?:en|de)\s+([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+),?\s*(?:Madrid|Barcelona|Valencia|Sevilla|Málaga|España)?/gi
        };
        
        // Palabras clave que indican mención de propiedad
        this.propertyKeywords = [
            'piso', 'casa', 'local', 'terreno', 'apartamento', 'chalet',
            'vender', 'comprar', 'alquilar', 'propiedad', 'inmueble',
            'vivienda', 'habitaciones', 'm2', 'metros'
        ];
    }
    
    /**
     * Detecta si el mensaje contiene referencia a propiedad
     * @param {string} message - Mensaje del usuario o Sofía
     * @returns {boolean}
     */
    containsPropertyMention(message) {
        const lowerMessage = message.toLowerCase();
        return this.propertyKeywords.some(keyword => lowerMessage.includes(keyword));
    }
    
    /**
     * Extrae datos de propiedad del mensaje
     * @param {string} message - Mensaje con información de propiedad
     * @returns {object|null} - Datos extraídos o null si no se detecta
     */
    extractPropertyData(message) {
        if (!this.containsPropertyMention(message)) {
            return null;
        }
        
        const data = {
            raw_text: message,
            property_type: this.extractPropertyType(message),
            address: this.extractAddress(message),
            city: this.extractCity(message),
            price: this.extractPrice(message),
            surface_m2: this.extractSurface(message),
            rooms: this.extractRooms(message),
            bathrooms: this.extractBathrooms(message),
            confidence: 0
        };
        
        // Calcular confianza (0-100%)
        data.confidence = this.calculateConfidence(data);
        
        // Solo retornar si tiene mínimo de datos
        if (data.confidence >= 30) {
            return data;
        }
        
        return null;
    }
    
    /**
     * Extrae tipo de propiedad
     */
    extractPropertyType(message) {
        for (const [type, pattern] of Object.entries(this.patterns.propertyTypes)) {
            pattern.lastIndex = 0; // Reset regex
            if (pattern.test(message)) {
                return type;
            }
        }
        return null;
    }
    
    /**
     * Extrae precio
     */
    extractPrice(message) {
        for (const pattern of this.patterns.price) {
            pattern.lastIndex = 0;
            const match = pattern.exec(message);
            if (match) {
                let price = match[1].replace(/[.,]/g, '');
                
                // Si dice "mil" o "k", multiplicar por 1000
                if (message.toLowerCase().includes('mil') || message.toLowerCase().includes('k')) {
                    price = parseInt(price) * 1000;
                } else {
                    price = parseInt(price);
                }
                
                // Validar rango razonable (5.000€ - 50.000.000€)
                if (price >= 5000 && price <= 50000000) {
                    return price;
                }
            }
        }
        return null;
    }
    
    /**
     * Extrae superficie en m²
     */
    extractSurface(message) {
        for (const pattern of this.patterns.surface) {
            pattern.lastIndex = 0;
            const match = pattern.exec(message);
            if (match) {
                const m2 = parseInt(match[1]);
                // Validar rango (20 - 10000 m²)
                if (m2 >= 20 && m2 <= 10000) {
                    return m2;
                }
            }
        }
        return null;
    }
    
    /**
     * Extrae número de habitaciones
     */
    extractRooms(message) {
        for (const pattern of this.patterns.rooms) {
            pattern.lastIndex = 0;
            const match = pattern.exec(message);
            if (match) {
                const rooms = parseInt(match[1]);
                if (rooms >= 0 && rooms <= 20) {
                    return rooms;
                }
            }
        }
        return null;
    }
    
    /**
     * Extrae número de baños
     */
    extractBathrooms(message) {
        for (const pattern of this.patterns.bathrooms) {
            pattern.lastIndex = 0;
            const match = pattern.exec(message);
            if (match) {
                const bathrooms = parseInt(match[1]);
                if (bathrooms >= 0 && bathrooms <= 10) {
                    return bathrooms;
                }
            }
        }
        return null;
    }
    
    /**
     * Extrae dirección (básico)
     */
    extractAddress(message) {
        for (const pattern of this.patterns.address) {
            pattern.lastIndex = 0;
            const match = pattern.exec(message);
            if (match) {
                let address = match[1];
                if (match[2]) {
                    address += ' ' + match[2];
                }
                return address.trim();
            }
        }
        return null;
    }
    
    /**
     * Extrae ciudad
     */
    extractCity(message) {
        const citiesSpain = [
            'Madrid', 'Barcelona', 'Valencia', 'Sevilla', 'Zaragoza',
            'Málaga', 'Murcia', 'Palma', 'Bilbao', 'Alicante',
            'Córdoba', 'Valladolid', 'Vigo', 'Gijón', 'Granada'
        ];
        
        for (const city of citiesSpain) {
            if (message.toLowerCase().includes(city.toLowerCase())) {
                return city;
            }
        }
        
        return null;
    }
    
    /**
     * Calcula nivel de confianza (0-100%)
     */
    calculateConfidence(data) {
        let score = 0;
        
        if (data.property_type) score += 20;
        if (data.address) score += 25;
        if (data.city) score += 15;
        if (data.price) score += 20;
        if (data.surface_m2) score += 10;
        if (data.rooms) score += 5;
        if (data.bathrooms) score += 5;
        
        return score;
    }
    
    /**
     * Formatea datos para mostrar en modal
     */
    formatForDisplay(data) {
        const parts = [];
        
        if (data.property_type) {
            const typeNames = {
                'piso': '🏢 Piso',
                'casa': '🏠 Casa',
                'local': '🏪 Local',
                'terreno': '🌳 Terreno'
            };
            parts.push(typeNames[data.property_type] || '🏘️ Propiedad');
        }
        
        if (data.address) {
            parts.push(`📍 ${data.address}`);
        }
        
        if (data.city) {
            parts.push(`🌆 ${data.city}`);
        }
        
        if (data.price) {
            parts.push(`💰 ${this.formatPrice(data.price)}`);
        }
        
        if (data.surface_m2) {
            parts.push(`📐 ${data.surface_m2}m²`);
        }
        
        if (data.rooms) {
            parts.push(`🛏️ ${data.rooms} hab.`);
        }
        
        if (data.bathrooms) {
            parts.push(`🚿 ${data.bathrooms} baños`);
        }
        
        return parts.join(' · ');
    }
    
    /**
     * Formatea precio con separadores de miles
     */
    formatPrice(price) {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    }
    
    /**
     * Genera resumen legible
     */
    generateSummary(data) {
        const type = data.property_type || 'propiedad';
        const location = data.address && data.city 
            ? `en ${data.address}, ${data.city}`
            : data.address 
                ? `en ${data.address}`
                : data.city
                    ? `en ${data.city}`
                    : '';
        
        return `${type.charAt(0).toUpperCase() + type.slice(1)} ${location}`.trim();
    }
}

// Exportar para uso en main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PropertyDetector;
}
