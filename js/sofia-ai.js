// Sofia AI - Advanced OpenAI Integration Module
// Domus-IA España - SuperAgente Inmobiliario General (SIG)
// Author: MontCastell-AI

class SofiaAI {
    constructor() {
        this.apiKey = null;
        this.baseURL = 'https://api.openai.com/v1';
        this.model = 'gpt-4o'; // Latest GPT model
        this.maxTokens = 2000;
        this.temperature = 0.7;
        this.systemPrompt = this.getSystemPrompt();
        
        // Advanced capabilities
        this.capabilities = {
            textGeneration: true,
            imageAnalysis: true,
            imageGeneration: true,
            documentAnalysis: true,
            voiceGeneration: true, // Via TTS
            webSearch: false, // Would need integration
            realTimeData: false // Would need integration
        };
    }

    // ===== SYSTEM PROMPT CONFIGURATION =====
    getSystemPrompt() {
        return `Eres Sofía, el primer SuperAgente Inmobiliario de Domus-IA España para Propietarios Espabilados y Agentes Saturados, desarrollado por MontCastell-AI. 

PERSONALIDAD Y ESTILO:
- Profesional, empática, cercana y motivadora
- Comunicación en mensajes cortos y proactivos  
- Especialista máxima en sector inmobiliario
- Guías al usuario según sus necesidades específicas
- Transmites confianza, tranquilidad y pasión por el sector

CONOCIMIENTO ESPECIALIZADO:
- Compraventa de segunda mano y obra nueva
- Formación basada en programa MontCastell-AI
- Conocimiento completo de cursos para Agentes de Propiedad Inmobiliaria
- Legislación inmobiliaria española
- Estrategias de marketing y captación
- Negociación y cierre de ventas
- Análisis de mercado inmobiliario

FUNCIONALIDADES PARA PROFESIONALES:
1. Construcción de empresa y marca personal
2. Imagen corporativa y publicidad  
3. Captación formal y bien remunerada
4. Gestión VIP de encargos de venta
5. Informes de ajuste de precios con datos reales
6. Negociación formal y cierre de acuerdos
7. Formatos legales y post-venta
8. Formación sobre IA y Agentes IA

FUNCIONALIDADES PARA PARTICULARES:
1. Estudio de mercado personalizado
2. Preparación del inmueble para venta
3. Revisión y estudio de documentación
4. Estrategias de publicación de calidad
5. Cómo atender y convencer compradores
6. Defensa del precio de venta
7. Redacción de acuerdos y arras
8. Organización de firma notarial

CAPACIDADES IA AVANZADAS:
- Análisis y generación de imágenes
- Creación de logos e imagen corporativa
- Videos y contenido para publicidad
- Construcción de embudos de captación
- Informes de precios con búsquedas profundas
- Roleplay audio para práctica
- Redacción de documentos legales

DETECCIÓN AUTOMÁTICA:
- Identifica si el usuario es particular o profesional
- Adapta respuestas según el perfil detectado
- Personaliza formación y consejos
- Ajusta nivel técnico del lenguaje

DIRECTRICES DE RESPUESTA:
- Siempre empática y comprensiva
- Preguntas proactivas para guiar la conversación
- Ofrece soluciones concretas y actionables
- Referencias a la formación MontCastell-AI cuando sea relevante
- Menciona capacidades específicas cuando sea apropiado
- Mantén mensajes concisos pero completos`;
    }

    // ===== API CONNECTION METHODS =====
    // NOTA: Las API keys se gestionan en el BACKEND (Vercel)
    // Los usuarios NO necesitan configurar API keys
    
    isAPIConfigured() {
        // Siempre retorna true porque el backend tiene las claves
        return true;
    }

    async makeAPICall(endpoint, method = 'POST', data = null) {
        // Este método ya no se usa directamente
        // Todo va a través del backend (/api/chat)
        console.warn('makeAPICall() deprecated - Use /api/chat endpoint');
        
        const headers = {
            'Content-Type': 'application/json'
        };

        const config = {
            method,
            headers
        };

        if (data) {
            config.body = JSON.stringify(data);
        }

        const response = await fetch(`${this.baseURL}${endpoint}`, config);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`API Error: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
        }

        return await response.json();
    }

    // ===== CHAT COMPLETION =====
    async generateResponse(messages, userType = null, userName = null) {
        try {
            const systemMessage = this.buildSystemMessage(userType, userName);
            
            const requestData = {
                model: this.model,
                messages: [
                    { role: 'system', content: systemMessage },
                    ...messages
                ],
                max_tokens: this.maxTokens,
                temperature: this.temperature,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            };

            const response = await this.makeAPICall('/chat/completions', 'POST', requestData);
            return response.choices[0].message.content;

        } catch (error) {
            console.error('AI Response Error:', error);
            return this.getFallbackResponse(userType);
        }
    }

    buildSystemMessage(userType, userName) {
        let contextualPrompt = this.systemPrompt;
        
        if (userType === 'profesional') {
            contextualPrompt += `

CONTEXTO ACTUAL: Estás hablando con ${userName || 'un agente'} inmobiliario profesional. 
Enfócate en:
- Formación avanzada y técnicas de MontCastell-AI
- Estrategias de alto nivel para agentes
- Construcción de negocio y marca personal
- Captación premium y gestión VIP
- Herramientas profesionales del sector`;

        } else if (userType === 'particular') {
            contextualPrompt += `

CONTEXTO ACTUAL: Estás hablando con ${userName || 'un propietario'} particular que quiere vender.
Enfócate en:
- Asesoramiento como haría un gran agente inmobiliario
- Guía paso a paso para el proceso de venta
- Consejos prácticos y fáciles de implementar
- Evitar jerga técnica excesiva
- Tranquilizar y dar confianza en el proceso`;
        }

        return contextualPrompt;
    }

    getFallbackResponse(userType) {
        const responses = {
            profesional: [
                "Como agente profesional, puedo ayudarte con estrategias avanzadas de captación, formación especializada y técnicas de MontCastell-AI. ¿En qué área específica quieres enfocar tu desarrollo?",
                "Te ofrezco formación completa para agentes: desde construcción de marca hasta cierre de ventas. ¿Qué aspecto de tu negocio inmobiliario quieres potenciar?"
            ],
            particular: [
                "Como propietario, puedo guiarte en todo el proceso de venta: desde preparar tu inmueble hasta la firma notarial. ¿En qué fase del proceso te encuentras?",
                "Te ayudo con estudios de mercado, documentación, estrategias de precio y negociación. ¿Qué aspecto de la venta de tu inmueble te preocupa más?"
            ],
            general: [
                "Soy Sofía, tu SuperAgente Inmobiliario especializada en el sector. Puedo ayudarte tanto si eres propietario como agente profesional. ¿Cuál es tu situación?",
                "Como experta inmobiliaria con formación de MontCastell-AI, ofrezco asesoramiento completo. ¿En qué puedo asistirte hoy?"
            ]
        };

        const typeResponses = responses[userType] || responses.general;
        return typeResponses[Math.floor(Math.random() * typeResponses.length)];
    }

    // ===== IMAGE ANALYSIS =====
    async analyzeImage(imageUrl, instruction) {
        try {
            const requestData = {
                model: "gpt-4o", // GPT-4 with vision
                messages: [
                    {
                        role: "system",
                        content: "Eres Sofía, experta inmobiliaria. Analiza imágenes de propiedades con criterio profesional, enfocándote en aspectos que afecten valor, marketabilidad y mejoras recomendadas."
                    },
                    {
                        role: "user",
                        content: [
                            { 
                                type: "text", 
                                text: instruction || "Analiza esta imagen inmobiliaria y proporciona consejos profesionales sobre presentación, valor y mejoras posibles."
                            },
                            {
                                type: "image_url",
                                image_url: { url: imageUrl }
                            }
                        ]
                    }
                ],
                max_tokens: 1000
            };

            const response = await this.makeAPICall('/chat/completions', 'POST', requestData);
            return response.choices[0].message.content;

        } catch (error) {
            console.error('Image Analysis Error:', error);
            return "No he podido analizar la imagen. Por favor, asegúrate de que sea una URL válida y que tengas una suscripción activa.";
        }
    }

    // ===== IMAGE GENERATION =====
    async generateImage(prompt, size = "1024x1024", quality = "standard", userPlan = 'particular') {
        try {
            console.log('🎨 Solicitando generación de imagen:', prompt);
            
            // Llamar al endpoint de backend /api/dalle
            const response = await fetch('/api/dalle', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    prompt: prompt,
                    size: size,
                    quality: quality,
                    style: 'vivid',
                    userPlan: userPlan
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Error al generar imagen');
            }

            const data = await response.json();
            console.log('✅ Imagen generada:', data.imageUrl);
            
            return data.imageUrl;

        } catch (error) {
            console.error('Image Generation Error:', error);
            throw new Error("No he podido generar la imagen: " + error.message);
        }
    }

    // ===== TEXT-TO-SPEECH =====
    async generateSpeech(text, voice = "nova", format = "mp3") {
        try {
            const requestData = {
                model: "tts-1",
                input: text,
                voice: voice,
                response_format: format
            };

            const response = await fetch(`${this.baseURL}/audio/speech`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getApiKey()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error('TTS request failed');
            }

            const audioBlob = await response.blob();
            return URL.createObjectURL(audioBlob);

        } catch (error) {
            console.error('TTS Error:', error);
            throw new Error("No he podido generar el audio. Verifica tu suscripción.");
        }
    }

    // ===== DOCUMENT ANALYSIS =====
    async analyzeDocument(fileContent, docType = 'general') {
        try {
            const requestData = {
                model: this.model,
                messages: [
                    {
                        role: "system",
                        content: `Eres Sofía, experta en documentación inmobiliaria. Analiza documentos relacionados con propiedades, contratos, escrituras, etc. Identifica información clave, problemas potenciales y recomendaciones.`
                    },
                    {
                        role: "user",
                        content: `Analiza este documento inmobiliario (tipo: ${docType}):\n\n${fileContent}`
                    }
                ],
                max_tokens: 1500
            };

            const response = await this.makeAPICall('/chat/completions', 'POST', requestData);
            return response.choices[0].message.content;

        } catch (error) {
            console.error('Document Analysis Error:', error);
            return "No he podido analizar el documento. Asegúrate de que el formato sea compatible y tengas suscripción activa.";
        }
    }

    // ===== MARKET RESEARCH =====
    async generateMarketReport(location, propertyType, userType) {
        const prompt = `Como Sofía, experta inmobiliaria, genera un informe de mercado detallado para ${location}, tipo de propiedad: ${propertyType}. 
        
        Usuario: ${userType}
        
        Incluye:
        - Análisis de precios actuales
        - Tendencias del mercado
        - Tiempo medio de venta
        - Recomendaciones específicas
        - Factores que afectan el valor
        - Estrategias de precio
        
        Formato profesional pero comprensible.`;

        return await this.generateResponse([{ role: 'user', content: prompt }], userType);
    }

    // ===== ROLE PLAYING SCENARIOS =====
    async createRolePlayScenario(scenarioType, userType) {
        const scenarios = {
            'negotiation': 'Simula una negociación inmobiliaria donde practicar técnicas de cierre',
            'objection_handling': 'Crea objeciones típicas de compradores para practicar respuestas',
            'price_justification': 'Simula un cliente que cuestiona el precio para practicar argumentos',
            'first_visit': 'Practica la primera visita con un cliente potencial',
            'closing_meeting': 'Simula la reunión de cierre de una venta'
        };

        const scenarioPrompt = scenarios[scenarioType] || scenarios.negotiation;
        
        const prompt = `Como Sofía, crea un escenario de roleplay inmobiliario para practicar: ${scenarioPrompt}.
        
        Usuario: ${userType}
        
        Proporciona:
        1. Contexto de la situación
        2. Perfil del cliente/comprador
        3. Objetivos del ejercicio
        4. Puntos clave a practicar
        5. Inicio del diálogo
        
        Hazlo interactivo y educativo.`;

        return await this.generateResponse([{ role: 'user', content: prompt }], userType);
    }

    // ===== LEGAL DOCUMENT GENERATION =====
    async generateLegalDocument(docType, details) {
        const prompt = `Como Sofía, experta en documentación inmobiliaria, genera un ${docType} con los siguientes detalles:
        
        ${JSON.stringify(details, null, 2)}
        
        Crea un documento profesional, legalmente orientado pero accesible. Incluye:
        - Estructura adecuada
        - Cláusulas importantes
        - Advertencias y recomendaciones
        - Siguiente pasos
        
        Nota: Recomienda siempre revisión legal profesional.`;

        return await this.generateResponse([{ role: 'user', content: prompt }]);
    }

    // ===== MARKETING CONTENT GENERATION =====
    async generateMarketingContent(contentType, propertyDetails, targetAudience) {
        const prompt = `Como Sofía, especialista en marketing inmobiliario, crea ${contentType} para:
        
        Propiedad: ${JSON.stringify(propertyDetails, null, 2)}
        Audiencia: ${targetAudience}
        
        Genera contenido:
        - Atractivo y profesional
        - Orientado a conversión
        - Con keywords relevantes
        - Emocionalmente conectivo
        - Call-to-action efectivo
        
        Incluye sugerencias de imágenes y formato.`;

        return await this.generateResponse([{ role: 'user', content: prompt }]);
    }

    // ===== PRICE ANALYSIS =====
    async analyzePricing(propertyData, marketData) {
        const prompt = `Como Sofía, experta en valoración inmobiliaria, analiza el precio de esta propiedad:
        
        Datos de la propiedad:
        ${JSON.stringify(propertyData, null, 2)}
        
        Datos del mercado:
        ${JSON.stringify(marketData, null, 2)}
        
        Proporciona:
        - Valoración recomendada con rango
        - Justificación técnica
        - Comparables utilizados
        - Factores que afectan el precio
        - Estrategia de pricing
        - Recomendaciones de ajuste
        
        Formato: Informe profesional pero comprensible.`;

        return await this.generateResponse([{ role: 'user', content: prompt }]);
    }

    // ===== TRAINING CONTENT =====
    async generateTrainingModule(topic, level, userType) {
        const prompt = `Como Sofía, formadora inmobiliaria de MontCastell-AI, crea un módulo de formación sobre: ${topic}
        
        Nivel: ${level}
        Usuario: ${userType}
        
        Estructura:
        1. Objetivos de aprendizaje
        2. Conceptos clave
        3. Casos prácticos
        4. Ejercicios
        5. Recursos adicionales
        6. Evaluación
        
        Enfoque pedagógico y profesional.`;

        return await this.generateResponse([{ role: 'user', content: prompt }], userType);
    }

    // ===== UTILITY METHODS =====
    isAPIConfigured() {
        // Always return true since backend handles API key via Vercel env variables
        // No need for client-side API key storage
        return true;
    }

    getCapabilities() {
        return this.capabilities;
    }

    updateCapability(capability, enabled) {
        this.capabilities[capability] = enabled;
    }

    // ===== ERROR HANDLING =====
    handleAPIError(error) {
        const errorMessages = {
            401: "API key inválida o expirada. Por favor, verifica tu suscripción.",
            429: "Límite de uso excedido. Espera un momento o mejora tu plan.",
            500: "Error del servidor OpenAI. Intenta de nuevo en unos minutos.",
            default: "Error de conexión. Verifica tu internet y suscripción."
        };

        const statusCode = error.message.match(/\d{3}/)?.[0];
        return errorMessages[statusCode] || errorMessages.default;
    }
}

// Export for use in other modules
window.SofiaAI = SofiaAI;

// Export for use in other modules
window.SofiaAI = SofiaAI;
