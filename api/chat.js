// 🌟 DOMUS-IA ESPAÑA - SOFÍA IA COMPLETA CON TODAS LAS CAPACIDADES GPT-4o
// Backend serverless con TODAS las capacidades de ChatGPT Plus
// GPT-4o + Vision + DALL-E 3 + Web Search + Code Interpreter + File Analysis + Canvas

// ============================================
// 💾 MEMORIA PERSISTENTE CON SUPABASE
// ============================================
import supabaseClient from './supabase-client.js';

// ============================================================================
 // 🖼️ IMGBB IMAGE HOSTING INTEGRATION
// ============================================================================
 // TEMPORALMENTE DESACTIVADO - Causaba errores 500
 // TODO: Implementar después de confirmar que DALL-E funciona básicamente

/*
async function uploadToImgBB(imageUrl, apiKey) {
  // Código comentado temporalmente
}
*/

// ============================================================================
 // 🎨 REPLICATE IMAGE EDITING INTEGRATION (Inpainting Real)
// ============================================================================
async function editImageWithNanoBanana(imageUrl, prompt) {
  const REPLICATE_API_TOKEN = process.env.REPLICATE_API_TOKEN;
  
  if (!REPLICATE_API_TOKEN) {
    throw new Error('REPLICATE_API_TOKEN no configurado en variables de entorno');
  }

  // Validaciones previas para evitar enviar tipos incorrectos a Replicate
  if (!imageUrl || typeof imageUrl !== 'string') {
    throw new Error('Invalid imageUrl: expected a string URL to a publicly accessible image (ending in .jpg/.png/.webp).');
  }

  if (imageUrl.startsWith('data:')) {
    // Replicate API typically expects a public URL; indicate the caller to upload to Cloudinary/Imgur
    throw new Error('Data URLs are not supported by the Replicate endpoint. Please provide a publicly accessible image URL (e.g., https://.../image.jpg) or upload the file to Cloudinary/Imgur and pass that URL.');
  }

  try {
    // Nano Banana (Gemini 2.5 Flash) - Edición conversacional real
    const response = await fetch('https://api.replicate.com/v1/models/google/nano-banana/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${REPLICATE_API_TOKEN}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          // FIX: enviar el URL como string dentro del array (no un objeto {value: ...})
          image_input: [imageUrl],
          prompt: prompt,
          aspect_ratio: "match_input_image",
          output_format: "jpg"
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Replicate API error: ${response.status} - ${errorText}`);
    }

    const prediction = await response.json();
    
    // Si la respuesta ya tiene el output (Prefer: wait)
    if (prediction.status === 'succeeded' && prediction.output) {
      // Nano Banana devuelve string directo o array
      return Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
    }
    
    // Si no, hacer polling
    let attempts = 0;
    const maxAttempts = 60; // 60 segundos máximo
    
    while (attempts < maxAttempts) {
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          'Authorization': `Bearer ${REPLICATE_API_TOKEN}`
        }
      });
      
      const statusData = await statusResponse.json();
      
      if (statusData.status === 'succeeded') {
        // Nano Banana devuelve string directo o array
        return Array.isArray(statusData.output) ? statusData.output[0] : statusData.output;
      }
      
      if (statusData.status === 'failed' || statusData.status === 'canceled') {
        throw new Error(`Replicate prediction failed: ${statusData.error || 'Unknown error'}`);
      }
      
      // Esperar 1 segundo antes de siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000));
      attempts++;
    }
    
    throw new Error('Replicate timeout: La edición tardó demasiado');
    
  } catch (error) {
    console.error('❌ Error en Replicate:', error);
    throw error;
  }
}

// ============================================================================
// 🌐 TAVILY WEB SEARCH INTEGRATION
// ============================================================================
async function searchWeb(query, tavilyApiKey) {
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: tavilyApiKey,
        query: query,
        search_depth: 'advanced',
        include_answer: true,
        include_raw_content: false,
        max_results: 5
      })
    });

    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.status}`);
    }

    const data = await response.json();
    
    const formattedResults = {
      answer: data.answer || '',
      results: (data.results || []).map(r => ({
        title: r.title,
        url: r.url,
        content: r.content,
        score: r.score
      }))
    };

    return formattedResults;
  } catch (error) {
    console.error('Web search error:', error);
    return null;
  }
}

function shouldSearchWeb(message) {
  const lowerMessage = message.toLowerCase();
  
  const webSearchKeywords = [
    'actualidad', 'actual', 'reciente', 'último', 'últimas',
    'noticia', 'noticias', 'hoy', 'esta semana', 'este mes',
    'precio actual', 'mercado actual', 'tendencias actuales',
    'búsqueda', 'busca', 'encuentra', 'información sobre',
    '2024', '2025', 'ahora', 'actualizado',
    'google', 'internet', 'web', 'online'
  ];
  
  return webSearchKeywords.some(keyword => lowerMessage.includes(keyword));
}

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
    const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'API key not configured. Add OPENAI_API_KEY to Vercel environment variables.' 
      });
    }

    // ============================================================================
    // Parse Request
    // ============================================================================
    const { 
      messages, 
      userType, 
      userName,
      userEmail,  // ← NUEVO: Email para memoria persistente
      sofiaVersion = 'sofia-1.0',
      userPlan = 'particular',
      imageFile,
      imageUrl,
      generateImage,
      webSearch,
      documentText
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false,
        error: 'Invalid request: messages array required' 
      });
    }

    // ============================================================================
    // Model Selection basado en versión
    // ============================================================================
    const modelConfig = {
      'sofia-1.0': {
        model: process.env.SOFIA_1_MODEL || 'gpt-4o',
        maxTokens: parseInt(process.env.MAX_TOKENS_SOFIA_1) || 4000,
        temperature: 0.7,
        name: 'Sofía 1.0'
      },
      'sofia-2.0-pro': {
        model: process.env.SOFIA_2_MODEL || 'gpt-4o',
        maxTokens: parseInt(process.env.MAX_TOKENS_SOFIA_2) || 6000,
        temperature: 0.7,
        name: 'Sofía 2.0 Pro'
      }
    };

    const config = modelConfig[sofiaVersion] || modelConfig['sofia-1.0'];

    // ============================================================================
    // 🌐 Web Search (si es necesario)
    // ============================================================================
    let webSearchResults = null;
    const lastMessage = messages[messages.length - 1];
    
    // 🔥 FIX: Validar que lastMessage.content no sea null antes de shouldSearchWeb
    const needsWebSearch = webSearch === true || 
                          (webSearch === 'auto' && lastMessage.content && shouldSearchWeb(lastMessage.content));
    
    if (needsWebSearch && TAVILY_API_KEY) {
      console.log('🌐 Realizando búsqueda web:', lastMessage.content);
      webSearchResults = await searchWeb(lastMessage.content, TAVILY_API_KEY);
      
      if (webSearchResults) {
        console.log('✅ Web search completada:', webSearchResults.results.length, 'resultados');
      }
    } else if (needsWebSearch && !TAVILY_API_KEY) {
      console.warn('⚠️ Web search solicitada pero TAVILY_API_KEY no configurada');
    }

    // ============================================================================
    // 👁️ Vision API - Procesar imágenes si existen
    // ============================================================================
    let processedMessages = [...messages];
    
    if (imageFile || imageUrl) {
      const lastMessageIndex = processedMessages.length - 1;
      const lastMsg = processedMessages[lastMessageIndex];
      
      // 🔥 Determinar URL correctamente
      let imageUrlToUse;
      if (imageUrl) {
        imageUrlToUse = imageUrl;
      } else if (imageFile) {
        imageUrlToUse = `data:image/jpeg;base64,${imageFile}`;
      }
      
      // Solo procesar si tenemos URL válida
      if (imageUrlToUse) {
        // 🔥 FIX: Validar que content no sea null
        const textContent = lastMsg.content || '';
        
        processedMessages[lastMessageIndex] = {
          role: lastMsg.role,
          content: [
            {
              type: 'text',
              text: textContent
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrlToUse,
                detail: 'high'
              }
            }
          ]
        };
        
        console.log('👁️ Vision API activada - Analizando imagen');
      }
    }
    
    // Si hay documento, añadir su texto al contexto
    if (documentText) {
      const lastMessageIndex = processedMessages.length - 1;
      const lastMsg = processedMessages[lastMessageIndex];
      
      // 🔥 FIX: Manejar correctamente si content es array (imagen) o string
      let baseContent = '';
      
      if (Array.isArray(lastMsg.content)) {
        // Si es array (imagen procesada), extraer el texto del primer elemento
        const textPart = lastMsg.content.find(item => item.type === 'text');
        baseContent = textPart ? textPart.text : '';
      } else {
        // Si es string, usar directamente (o vacío si es null)
        baseContent = lastMsg.content || '';
      }
      
      processedMessages[lastMessageIndex] = {
        role: lastMsg.role,
        content: `${baseContent}\n\n---\n📄 DOCUMENTO ADJUNTO:\n\n${documentText}\n---`
      };
      
      console.log('📄 Documento procesado - Texto extraído incluido en contexto');
    }

    // ============================================================================
    // Build Advanced System Prompt con TODO el conocimiento + MEMORIA
    // ============================================================================
    let systemPrompt = buildAdvancedSystemPrompt(userType, userName, sofiaVersion, webSearchResults);
    
    // 💾 AÑADIR MEMORIA PERSISTENTE (si está disponible)
    if (userEmail && supabaseClient) {
      try {
        const user = await supabaseClient.getOrCreateUser(userEmail, userName, userType);
        if (user) {
          const userContext = await supabaseClient.getUserContext(user.id);
          if (userContext) {
            systemPrompt = await addMemoryToSystemPrompt(systemPrompt, userContext);
            console.log('✅ Memoria persistente añadida al prompt');
          }
        }
      } catch (error) {
        console.error('⚠️ Error cargando memoria:', error);
        // Continuar sin memoria si falla
      }
    }

    // ============================================================================
    // 🛠️ DEFINE TOOLS/FUNCTIONS AVAILABLE (Function Calling)
    // ============================================================================
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_dalle_image",
          description: "Generate a professional real estate image using DALL-E 3. Use this when the user requests to create, generate, visualize, or design an image. Always use this tool for image generation.",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "Detailed description of the image to generate. Be specific about style, composition, lighting, and real estate context. Example: 'Modern minimalist living room with natural light and wooden floor'"
              },
              size: {
                type: "string",
                enum: ["1024x1024", "1024x1792", "1792x1024"],
                description: "Image size. Use 1024x1024 for standard, 1024x1792 for vertical (portraits), 1792x1024 for horizontal (landscapes)",
                default: "1024x1024"
              },
              quality: {
                type: "string",
                enum: ["standard", "hd"],
                description: "Image quality. Use 'hd' for highest quality professional images, 'standard' for faster generation",
                default: "standard"
              }
            },
            required: ["prompt"]
          }
        }
      },
      // ============================================================================
      // 🎨 TOOL NANO BANANA - EDICIÓN REAL DE IMÁGENES (ACTIVADO)
      // ============================================================================
      {
        type: "function",
        function: {
          name: "edit_real_estate_image",
          description: "🎯 REAL IMAGE EDITING with Nano Banana (Gemini 2.5 Flash) - PRESERVES EXACT STRUCTURE. Use for: virtual staging (add furniture), improve lighting, clean clutter, paint walls, change colors.",
          parameters: {
            type: "object",
            properties: {
              image_url: {
                type: "string",
                description: "🔗 REQUIRED: Publicly accessible URL of the image to edit. Must be a direct link (ending in .jpg, .png, .webp). If user provides local file, ask them to upload to Cloudinary or similar."
              },
              original_description: {
                type: "string",
                description: "Detailed description of the current image/space. Example: 'Empty living room with white walls, hardwood floor, large window on left, 4x5 meters'"
              },
              desired_changes: {
                type: "string",
                description: "Specific improvements to make PRESERVING STRUCTURE. Example: 'Add modern gray sofa and coffee table, paint walls soft beige, add plants near window, keep same floor and window positions'"
              },
              style: {
                type: "string",
                enum: ["modern", "minimalist", "scandinavian", "industrial", "mediterranean", "classic", "contemporary", "rustic"],
                description: "Target interior style for the transformation",
                default: "modern"
              },
              quality: {
                type: "string",
                enum: ["standard", "hd"],
                description: "Image quality (hd recommended for real estate)",
                default: "hd"
              }
            },
            required: ["image_url", "original_description", "desired_changes"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "compose_marketing_image",
          description: "Create a professional marketing image by composing property photo with branding elements (logo, price, features). Use for social media posts, listings, and advertisements.",
          parameters: {
            type: "object",
            properties: {
              base_image_description: {
                type: "string",
                description: "Description of the property image to use as base. Example: 'Modern apartment facade with balconies, blue sky'"
              },
              property_info: {
                type: "object",
                properties: {
                  price: { type: "string", description: "Price with currency. Ex: '350.000€'" },
                  size: { type: "string", description: "Size in m². Ex: '120m²'" },
                  rooms: { type: "string", description: "Bedrooms and bathrooms. Ex: '3 hab, 2 baños'" },
                  location: { type: "string", description: "City or neighborhood. Ex: 'Madrid Centro'" }
                },
                required: ["price", "location"]
              },
              format: {
                type: "string",
                enum: ["square", "horizontal", "story"],
                description: "Output format: square (1:1 for Instagram post), horizontal (16:9 for Facebook), story (9:16 for Instagram Stories)",
                default: "square"
              },
              include_logo: {
                type: "boolean",
                description: "Whether to include agency logo in top-left corner",
                default: true
              }
            },
            required: ["base_image_description", "property_info"]
          }
        }
      },
      {
        type: "function",
        function: {
          name: "call_valorador_workflow",
          description: "🏠 Llama al agente especializado de valoración inmobiliaria. Usa este tool cuando el usuario solicite: valorar una propiedad, informe de valoración, cuánto vale mi piso/casa.",
          parameters: {
            type: "object",
            properties: {
              direccion: {
                type: "string",
                description: "Dirección completa de la propiedad. Ejemplo: 'Calle Mayor 5, Madrid, 28013'"
              },
              metrosCuadrados: {
                type: "number",
                description: "Superficie útil o construida en metros cuadrados. Ejemplo: 120"
              },
              habitaciones: {
                type: "number",
                description: "Número de habitaciones/dormitorios. Ejemplo: 3"
              },
              banos: {
                type: "number",
                description: "Número de baños completos. Ejemplo: 2"
              },
              tipoPropiedad: {
                type: "string",
                enum: ["piso", "casa", "chalet", "adosado", "atico", "duplex", "estudio", "local", "terreno"],
                description: "Tipo de inmueble",
                default: "piso"
              },
              estadoConservacion: {
                type: "string",
                enum: ["nuevo", "muy_bueno", "bueno", "regular", "a_reformar"],
                description: "Estado general de conservación del inmueble",
                default: "bueno"
              },
              extras: {
                type: "string",
                description: "Características adicionales: garaje, trastero, piscina, jardín, terraza, ascensor, etc. Ejemplo: 'Garaje incluido, terraza de 15m², trastero'"
              },
              conversationContext: {
                type: "string",
                description: "Contexto adicional de la conversación que puede ser relevante para la valoración"
              }
            },
            required: ["direccion", "metrosCuadrados", "tipoPropiedad"]
          }
        }
      }
    ];

    // ============================================================================
    // 🛡️ VALIDACIÓN FINAL: Filtrar mensajes con content null ANTES de enviar
    // ============================================================================
    const safeMessages = processedMessages.filter(msg => {
      if (!msg.content) {
        console.warn('⚠️ Mensaje con content null detectado y filtrado:', msg.role);
        return false;
      }
      // Si content es array, verificar que tenga al menos un elemento con text
      if (Array.isArray(msg.content)) {
        const hasValidText = msg.content.some(item => item.type === 'text' && item.text !== null);
        if (!hasValidText) {
          console.warn('⚠️ Mensaje con array sin text válido filtrado:', msg.role);
          return false;
        }
      }
      return true;
    });

    console.log(`📤 Enviando ${safeMessages.length} mensajes a OpenAI (filtrados ${processedMessages.length - safeMessages.length})`);
    
    // 🔍 DEBUG: Mostrar estructura de mensajes para debugging
    safeMessages.forEach((msg, index) => {
      const contentPreview = Array.isArray(msg.content) 
        ? `[array con ${msg.content.length} items]` 
        : (typeof msg.content === 'string' ? msg.content.substring(0, 50) + '...' : String(msg.content));
      console.log(`  [${index}] ${msg.role}: ${contentPreview}`);
    });

    // ============================================================================
    // Call OpenAI API con todas las capacidades + Function Calling
    // ============================================================================
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...safeMessages
        ],
        max_tokens: config.maxTokens,
        temperature: config.temperature,
        tools: tools,
        tool_choice: "auto", // GPT-4o decides automatically when to use tools
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API Error:', error);
      return res.status(openaiResponse.status).json({ 
        success: false,
        error: 'OpenAI API error: ' + (error.error?.message || 'Unknown error')
      });
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0].message;

    // ============================================================================
    // 🎨 CHECK IF GPT-4o WANTS TO USE DALL-E (Function Calling)
    // ============================================================================
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      console.log('🎨 GPT-4o solicitó usar herramienta:', assistantMessage.tool_calls[0].function.name);
      
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.function.name === 'generate_dalle_image') {
        try {
          // Parse arguments from GPT-4o
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log('🎨 Argumentos para DALL-E:', functionArgs);
          
          // Call DALL-E 3 API
          const dalleResponse = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: 'dall-e-3',
              prompt: functionArgs.prompt,
              n: 1,
              size: functionArgs.size || '1024x1024',
              quality: functionArgs.quality || 'standard',
              style: 'vivid'
            })
          });

          if (!dalleResponse.ok) {
            const dalleError = await dalleResponse.json();
            console.error('❌ DALL-E Error:', dalleError);
            throw new Error(dalleError.error?.message || 'DALL-E generation failed');
          }

          const dalleData = await dalleResponse.json();
          const temporaryImageUrl = dalleData.data[0].url;
          const revisedPrompt = dalleData.data[0].revised_prompt;
          
          console.log('✅ Imagen generada:', temporaryImageUrl);
          
          // ============================================================================
          // ⚡ RESPUESTA RÁPIDA - Sin segunda llamada para evitar timeout
          // ============================================================================
          const finalImageUrl = temporaryImageUrl;
          
          // Crear mensaje simple de confirmación EN ESPAÑOL (sin llamar de nuevo a GPT-4o)
          const finalMessage = `✨ He generado la imagen que pediste. ¿Qué te parece? Si quieres ajustar algo, dímelo y creo una nueva versión.`;
          
          console.log('✅ Devolviendo imagen sin segunda llamada (optimización timeout)');

          // Return response with image URL
          return res.status(200).json({
            success: true,
            message: finalMessage,
            imageUrl: finalImageUrl,
            isPermanent: false,
            revisedPrompt: revisedPrompt,
            dalleUsed: true,
            tokensUsed: data.usage.total_tokens,
            model: data.model,
            sofiaVersion: config.name,
            webSearchUsed: !!webSearchResults,
            visionUsed: false,
            documentUsed: !!documentText,
            sources: webSearchResults ? webSearchResults.results.map(r => ({
              title: r.title,
              url: r.url
            })) : []
          });

        } catch (dalleError) {
          console.error('❌ Error en proceso DALL-E:', dalleError);
          
          // If DALL-E fails, ask GPT-4o to generate a response explaining the error
          const errorResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
              model: config.model,
              messages: [
                { role: 'system', content: systemPrompt },
                ...processedMessages,
                assistantMessage,
                {
                  role: 'tool',
                  tool_call_id: toolCall.id,
                  content: JSON.stringify({
                    success: false,
                    error: dalleError.message,
                    message: 'Failed to generate image with DALL-E 3'
                  })
                }
              ],
              max_tokens: config.maxTokens,
              temperature: config.temperature
            })
          });

          const errorData = await errorResponse.json();
          
          return res.status(200).json({
            success: true,
            message: errorData.choices[0].message.content,
            dalleUsed: false,
            dalleError: dalleError.message,
            tokensUsed: data.usage.total_tokens + errorData.usage.total_tokens,
            model: data.model,
            sofiaVersion: config.name,
            webSearchUsed: !!webSearchResults,
            visionUsed: !!(imageFile || imageUrl),
            documentUsed: !!documentText,
            sources: webSearchResults ? webSearchResults.results.map(r => ({
              title: r.title,
              url: r.url
            })) : []
          });
        }
      }
      
      // ============================================================================
      // 🎨 EDIT REAL ESTATE IMAGE - NANO BANANA (ACTIVADO)
      // ============================================================================
      else if (toolCall.function.name === 'edit_real_estate_image') {
        let functionArgs; // Declarar fuera del try para acceso en catch
        try {
          functionArgs = JSON.parse(toolCall.function.arguments);
          console.log('✏️ Editando imagen con Replicate:', functionArgs);
          
          // Verificar que REPLICATE_API_TOKEN esté configurado
          if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error('REPLICATE_API_TOKEN no configurado');
          }
          
          // ============================================================================
          // 🔍 DETECCIÓN AUTOMÁTICA DE URL DE IMAGEN
          // ============================================================================
          let imageUrl = functionArgs.image_url;
          
          if (!imageUrl) {
            // Buscar URL de Cloudinary en mensajes recientes del usuario
            console.log('🔍 Buscando URL de imagen en contexto...');
            
            // Buscar en los últimos 10 mensajes
            for (let i = messages.length - 1; i >= Math.max(0, messages.length - 10); i--) {
              const msg = messages[i];
              
              if (msg.role === 'user' && msg.content) {
                // Buscar patrones de URL de imágenes
                const urlPatterns = [
                  /https:\/\/res\.cloudinary\.com\/[^\s"'<>]+/,  // Cloudinary
                  /https:\/\/i\.imgur\.com\/[^\s"'<>]+/,          // Imgur
                  /https:\/\/i\.ibb\.co\/[^\s"'<>]+/,             // ImgBB
                  /https?:\/\/[^\s"'<>]+\.(jpg|jpeg|png|webp)/i  // Cualquier imagen
                ];
                
                for (const pattern of urlPatterns) {
                  const match = msg.content.match(pattern);
                  if (match) {
                    imageUrl = match[0];
                    console.log('✅ URL encontrada en contexto:', imageUrl);
                    break;
                  }
                }
                
                if (imageUrl) break;
              }
            }
          }
          
          // Si no se encontró URL, pedir al usuario que suba imagen
          if (!imageUrl) {
            return res.status(200).json({
              success: true,
              message: '📸 No encuentro la imagen que quieres editar. Por favor:\n\n' +
                       '1️⃣ Haz clic en el botón 📷 (subir imagen)\n' +
                       '2️⃣ Selecciona la foto del inmueble\n' +
                       '3️⃣ Espera a que se cargue\n' +
                       '4️⃣ Luego dime qué cambios quieres hacer\n\n' +
                       'Ejemplos: "añade muebles modernos", "limpia el desorden", "pinta las paredes de beige"',
              needsImage: true,
              imageEdited: false
            });
          }
          
          // ============================================================================
          // 🎨 EDICIÓN CON REPLICATE SDXL
          // ============================================================================
          
          // Construir prompt conversacional para Nano Banana (lenguaje natural)
          const editPrompt = `${functionArgs.desired_changes}. Original space: ${functionArgs.original_description}. Style: ${functionArgs.style || 'modern'}. Keep the same perspective, walls, windows, and floor layout exactly as they are. Only modify the requested elements.`;
          
          console.log('🍌 Llamando a Nano Banana con URL:', imageUrl);
          console.log('🍌 Prompt:', editPrompt);
          
          // Llamar a Nano Banana para edición real (preserva estructura)
          const editedImageUrl = await editImageWithNanoBanana(
            imageUrl,
            editPrompt
          );
          
          console.log('✅ Imagen editada con Nano Banana (estructura preservada):', editedImageUrl);

          return res.status(200).json({
            success: true,
            message: '✨ He editado tu imagen con Nano Banana manteniendo la estructura original. ' +
                     '\n\n**Cambios aplicados:** ' + functionArgs.desired_changes + '\n\n' +
                     '¿Quieres hacer más ajustes?',
            imageUrl: editedImageUrl,
            originalImageUrl: imageUrl,
            originalDescription: functionArgs.original_description,
            appliedChanges: functionArgs.desired_changes,
            isPermanent: false,
            nanoBananaUsed: true,
            structurePreserved: true,
            imageEdited: true,
            tokensUsed: data.usage.total_tokens,
            model: 'Nano Banana (Gemini 2.5) + ' + data.model
          });

        } catch (error) {
          console.error('❌ Error editando imagen con Replicate:', error);
          
          // Fallback: Instrucciones manuales
          const errorMessage = functionArgs 
            ? `⚠️ No pude procesar la edición con Nano Banana. ` +
              `Esto puede ser porque:\n\n` +
              `1️⃣ REPLICATE_API_TOKEN no está configurado\n` +
              `2️⃣ La URL de la imagen no es accesible: ${functionArgs.image_url || 'no encontrada'}\n` +
              `3️⃣ Nano Banana está temporalmente no disponible\n\n` +
              `**Cambios solicitados:** ${functionArgs.desired_changes}\n` +
              `**Estilo:** ${functionArgs.style || 'moderno'}\n\n` +
              `**Error técnico:** ${error.message}\n\n` +
              `Recomendación: Intenta de nuevo en unos segundos.`
            : `⚠️ Error procesando la edición: ${error.message}`;
          
          return res.status(200).json({
            success: true,
            message: errorMessage,
            imageEdited: false,
            fallbackMode: true,
            errorDetails: error.message
          });
        }
      }
      
      // ============================================================================
      // 🖼️ COMPOSE MARKETING IMAGE (usando NANO BANANA para overlays)
      // ============================================================================
      if (toolCall.function.name === 'compose_marketing_image') {
        try {
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log('🎨 Componiendo imagen de marketing con Nano Banana:', functionArgs);
          
          const { base_image_description, property_info, format, include_logo } = functionArgs;
          
          // Buscar URL de imagen en contexto (igual que en edit_real_estate_image)
          let baseImageUrl = null;
          
          console.log('🔍 Buscando imagen base en contexto...');
          for (let i = messages.length - 1; i >= Math.max(0, messages.length - 15); i--) {
            const msg = messages[i];
            if (msg.role === 'user' && msg.content) {
              const urlPatterns = [
                /https:\/\/res\.cloudinary\.com\/[^\s"'<>\]]+/,
                /https:\/\/i\.imgur\.com\/[^\s"'<>\]]+/,
                /https:\/\/i\.ibb\.co\/[^\s"'<>\]]+/,
                /https?:\/\/[^\s"'<>\]]+\.(jpg|jpeg|png|webp)/i
              ];
              
              for (const pattern of urlPatterns) {
                const match = msg.content.match(pattern);
                if (match) {
                  baseImageUrl = match[0];
                  console.log('✅ Imagen base encontrada:', baseImageUrl);
                  break;
                }
              }
              if (baseImageUrl) break;
            }
          }
          
          if (!baseImageUrl) {
            return res.status(200).json({
              success: true,
              message: '📸 Para crear la imagen publicitaria necesito que primero subas la foto de la propiedad con el botón 📷. Luego pídeme la portada con precio y logo.',
              needsImage: true,
              marketingComposed: false
            });
          }
          
          // Construir prompt para Nano Banana (añadir overlays sobre imagen real)
          const marketingPrompt = `Add professional real estate marketing overlays to this image: ` +
            `Large text "${property_info.price}" at top center in bold white font with black outline. ` +
            `Below that: "${property_info.size || ''} • ${property_info.rooms || ''}" in smaller white text. ` +
            `At bottom: "${property_info.location}" in elegant white typography. ` +
            (include_logo ? `Add "Domus-IA" logo watermark at top-left corner. ` : ``) +
            `Keep the original property image intact, only add text overlays with semi-transparent dark gradient for text readability.`;
          
          console.log('🍌 Creando portada con Nano Banana...');
          
          const marketingImageUrl = await editImageWithNanoBanana(
            baseImageUrl,
            marketingPrompt
          );
          
          console.log('✅ Imagen publicitaria creada con Nano Banana:', marketingImageUrl);

          return res.status(200).json({
            success: true,
            message: `📸 He creado tu imagen publicitaria profesional usando tu foto real. Incluye precio, características y ubicación. ¡Lista para publicar!`,
            imageUrl: marketingImageUrl,
            originalImageUrl: baseImageUrl,
            format: format,
            propertyInfo: property_info,
            isPermanent: false,
            nanoBananaUsed: true,
            marketingComposed: true,
            tokensUsed: data.usage.total_tokens,
            model: 'Nano Banana (Gemini 2.5) + ' + data.model
          });

        } catch (error) {
          console.error('❌ Error componiendo imagen de marketing:', error);
          
          // Fallback: entregar HTML/CSS template
          const htmlTemplate = `
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>
.property-card {
  position: relative;
  width: ${functionArgs.format === 'story' ? '1080px' : '1200px'};
  height: ${functionArgs.format === 'story' ? '1920px' : '1200px'};
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family: Arial, sans-serif;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 40px;
}
.price { font-size: 72px; font-weight: bold; color: white; text-shadow: 2px 2px 4px rgba(0,0,0,0.5); }
.details { font-size: 36px; color: white; margin-top: 20px; }
.location { font-size: 28px; color: white; opacity: 0.9; }
${functionArgs.include_logo ? '.logo { position: absolute; top: 20px; left: 20px; width: 150px; }' : ''}
</style></head><body>
<div class="property-card">
  ${functionArgs.include_logo ? '<div class="logo">🏢 MontCastell-AI</div>' : ''}
  <div class="price">${functionArgs.property_info.price}</div>
  <div class="details">${functionArgs.property_info.size || ''} • ${functionArgs.property_info.rooms || ''}</div>
  <div class="location">${functionArgs.property_info.location}</div>
</div>
</body></html>`;
          
          return res.status(200).json({
            success: true,
            message: 'No pude generar la imagen automáticamente, pero te doy un template HTML listo para usar. Puedes:\n\n' +
                     '1. Copiar el código HTML y abrirlo en navegador\n' +
                     '2. Capturar pantalla del resultado\n' +
                     '3. O usar Canva/Photoshop para crear la composición',
            htmlTemplate: htmlTemplate,
            marketingComposed: false,
            fallbackMode: true
          });
        }
      }
      
      // ============================================================================
      // 🏠 CALL VALORADOR WORKFLOW - Agente especializado de valoración
      // ============================================================================
      if (toolCall.function.name === 'call_valorador_workflow') {
        try {
          const functionArgs = JSON.parse(toolCall.function.arguments);
          console.log('🏠 Llamando a workflow de valoración:', functionArgs);
          
          // Llamar al endpoint del workflow valorador
          const valoradorResponse = await fetch(`${process.env.VERCEL_URL ? 'https://' + process.env.VERCEL_URL : 'http://localhost:3000'}/api/valorador`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              direccion: functionArgs.direccion,
              metrosCuadrados: functionArgs.metrosCuadrados,
              habitaciones: functionArgs.habitaciones || 0,
              banos: functionArgs.banos || 0,
              tipoPropiedad: functionArgs.tipoPropiedad || 'piso',
              estadoConservacion: functionArgs.estadoConservacion || 'bueno',
              extras: functionArgs.extras || '',
              conversationContext: functionArgs.conversationContext || ''
            })
          });
          
          if (!valoradorResponse.ok) {
            const errorData = await valoradorResponse.json();
            throw new Error(errorData.error || 'Error al ejecutar workflow de valoración');
          }
          
          const valoradorData = await valoradorResponse.json();
          console.log('✅ Workflow de valoración completado:', valoradorData.workflowId);
          
          // Extraer el resultado del workflow
          const valoracionCompleta = valoradorData.output;
          
          return res.status(200).json({
            success: true,
            message: valoracionCompleta,
            workflowId: valoradorData.workflowId,
            propertyData: {
              direccion: functionArgs.direccion,
              metrosCuadrados: functionArgs.metrosCuadrados,
              tipoPropiedad: functionArgs.tipoPropiedad
            },
            valoradorUsed: true,
            tokensUsed: data.usage.total_tokens,
            model: data.model,
            sofiaVersion: config.name
          });
          
        } catch (error) {
          console.error('❌ Error llamando a workflow valorador:', error);
          
          // Fallback: Sofía genera una respuesta explicando el error
          return res.status(200).json({
            success: true,
            message: '⚠️ No pude acceder al sistema de valoración especializado en este momento. ' +
                     'Esto puede deberse a:\n\n' +
                     '1️⃣ El workflow de OpenAI está temporalmente no disponible\n' +
                     '2️⃣ Falta configurar las credenciales correctamente\n' +
                     '3️⃣ Hay un problema de conectividad\n\n' +
                     '💡 **Mientras tanto**, puedo ayudarte con:\n' +
                     '- Buscar precios similares en la zona (búsqueda web)\n' +
                     '- Explicarte qué factores afectan el valor\n' +
                     '- Darte una estimación preliminar basada en €/m² de la zona\n\n' +
                     '¿Quieres que haga alguna de estas cosas?',
            valoradorUsed: false,
            valoradorError: error.message,
            tokensUsed: data.usage.total_tokens,
            model: data.model
          });
        }
      }
    }

    // ============================================================================
    // 💾 Guardar conversación en base de datos (no bloqueante)
    // ============================================================================
    if (userEmail) {
      saveConversationAsync(
        userEmail,
        userName,
        userType,
        lastMessage.content,
        assistantMessage.content
      ).catch(err => console.error('Error guardando:', err));
    }
    
    // ============================================================================
    // Response (No tool calls - normal text response)
    // ============================================================================
    return res.status(200).json({
      success: true,
      message: assistantMessage.content,
      tokensUsed: data.usage.total_tokens,
      model: data.model,
      sofiaVersion: config.name,
      webSearchUsed: !!webSearchResults,
      visionUsed: !!(imageFile || imageUrl),
      documentUsed: !!documentText,
      sources: webSearchResults ? webSearchResults.results.map(r => ({
        title: r.title,
        url: r.url
      })) : []
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
// 🧠 SISTEMA COMPLETO DE PERSONALIDAD DE SOFÍA CON TODAS LAS CAPACIDADES
// ============================================================================
function buildAdvancedSystemPrompt(userType, userName, sofiaVersion, webSearchResults = null) {
  // Knowledge base integrado directamente en el prompt
  
  // ============================================================================
  // 🌐 Integrar resultados de búsqueda web
  // ============================================================================
  let webSearchContext = '';
  if (webSearchResults && webSearchResults.results.length > 0) {
    webSearchContext = `\n\n## 🌐 INFORMACIÓN ACTUALIZADA DE INTERNET\n\n`;
    
    if (webSearchResults.answer) {
      webSearchContext += `**Resumen:** ${webSearchResults.answer}\n\n`;
    }
    
    webSearchContext += `**Fuentes verificadas en tiempo real:**\n`;
    webSearchResults.results.forEach((result, index) => {
      webSearchContext += `\n${index + 1}. **${result.title}**\n`;
      webSearchContext += `   ${result.content}\n`;
      webSearchContext += `   📍 Fuente: ${result.url}\n`;
    });
    
    webSearchContext += `\n⚠️ IMPORTANTE: Esta información viene de búsqueda en internet en tiempo real. Úsala para complementar tu conocimiento experto. Cita las fuentes cuando uses esta información.\n`;
  }
  
  const capabilities = sofiaVersion === 'sofia-2.0-pro' 
    ? 'versión avanzada con máxima potencia y todas las capacidades de ChatGPT Plus'
    : 'versión estándar con conocimiento completo y capacidades profesionales';

  const basePersonality = `# 🌟 IDENTIDAD: SOFÍA - SUPERASESORA INMOBILIARIA IA

Eres **Sofía**, SuperAsesora Inmobiliaria IA de **MontCastell-AI** (Domus-IA España).

Guías a propietarios y agentes en todo el ciclo inmobiliario: **valoración, ajuste de precio, marketing visual, documentos y firma**.

**Tus características:** Proactiva, estratégica, cercana y clara. Tomas la iniciativa, validas comprensión y propones el siguiente paso.

Estás usando ${capabilities}.

## 🌍 IDIOMA Y COMUNICACIÓN

**IMPORTANTE - IDIOMA:**
- **SIEMPRE responde en ESPAÑOL (es-ES)** por defecto
- TODAS tus respuestas deben estar en español, incluyendo cuando generas imágenes
- SOLO cambia a otro idioma si el usuario te lo pide EXPLÍCITAMENTE
- Cuando generes imágenes con DALL-E, el prompt técnico puede ser en inglés, pero tu mensaje al usuario SIEMPRE en español

## 💬 ESTILO DE COMUNICACIÓN

**Tono:** Profesional, cercana y segura.

**Reglas estrictas:**
- ✅ Frases CORTAS (1-3 líneas por idea)
- ✅ Máximo 2 preguntas por turno
- ✅ Verificar comprensión constantemente: "¿Te queda claro?" "¿Lo ves claro?"
- ✅ Liderar conversación (tú propones siguiente paso)
- ✅ Lenguaje natural (como WhatsApp con amigo profesional)
- ✅ Una idea por párrafo
- ✅ Emojis con moderación: ✅😊👍🎯

**Actitud:**
- ✅ Proactiva (tomas iniciativa)
- ✅ Estratégica (piensas medio-largo plazo)
- ✅ Calmada y segura
- ✅ Empática

**NUNCA seas:**
- ❌ Pasiva (esperando órdenes)
- ❌ Excesivamente formal
- ❌ Verbosa (respuestas largas tipo artículo)
- ❌ Confusa

## TU ROL

Actúas como: **asesor inmobiliario + financiero + abogado + formador experto**.

Llevas las riendas de cada interacción. Tu función es GUIAR, LIDERAR y ACOMPAÑAR al cliente paso a paso.

${webSearchContext}

## PERFILES QUE ASESORAS
...
`;

// (rest of file content for memory functions, addMemoryToSystemPrompt, saveConversationAsync, etc.)
async function addMemoryToSystemPrompt(basePrompt, userContext) {
  if (!userContext) return basePrompt;
  
  const memorySections = [];
  
  // CONVERSACIONES RECIENTES
  if (userContext.conversations && userContext.conversations.length > 0) {
    const recentConvs = userContext.conversations.slice(-15);
    const validConvs = recentConvs.filter(conv => conv.message && conv.message.trim()); // 🔥 FIX v1.10.1: Filtrar mensajes null/vacíos
    
    if (validConvs.length > 0) {
      const convSummary = validConvs.map(conv => {
        const date = new Date(conv.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
        const preview = conv.message.substring(0, 120);
        return `[${date}] ${conv.sender === 'user' ? '👤' : '🤖'}: ${preview}${conv.message.length > 120 ? '...' : ''}`;
      }).join('\n');
      
      memorySections.push(`## 💬 CONVERSACIONES RECIENTES (${validConvs.length})
      
${convSummary}
      
**Usa esto para:** Recordar temas anteriores, no repetir info, hacer seguimiento.`);
    }
  }
  
  // PROPIEDADES
  if (userContext.properties && userContext.properties.length > 0) {
    const propsList = userContext.properties.map(p => 
      `- 📍 ${p.address}${p.city ? ` (${p.city})` : ''} - ${p.price ? p.price + '€' : 'Sin precio'} - ${p.status}`
    ).join('\n');
    
    memorySections.push(`## 🏠 PROPIEDADES REGISTRADAS (${userContext.properties.length})
    
${propsList}
    
**Cuando mencione una dirección,** pregunta si quiere archivar info en su carpeta.`);
  }
  
  // TAREAS PENDIENTES
  if (userContext.tasks && userContext.tasks.length > 0) {
    const now = new Date();
    const overdue = userContext.tasks.filter(t => t.due_date && new Date(t.due_date) < now);
    const upcoming = userContext.tasks.filter(t => t.due_date && new Date(t.due_date) >= now);
    
    let tasksInfo = '';
    if (overdue.length > 0) {
      tasksInfo += `⚠️ **VENCIDAS:** ${overdue.map(t => t.title).join(', ')}\n`;
    }
    if (upcoming.length > 0) {
      tasksInfo += `📅 **PRÓXIMAS:** ${upcoming.map(t => t.title).join(', ')}`;
    }
    
    memorySections.push(`## ✅ TAREAS (${userContext.tasks.length})
    
${tasksInfo}
    
**SÉ PROACTIVA:** Menciona tareas vencidas al inicio.`);
  }
  
  // CONTACTOS
  if (userContext.contacts && userContext.contacts.length > 0) {
    const contactsList = userContext.contacts.slice(0, 5).map(c => 
      `- ${c.name} (${c.contact_type})`
    ).join('\n');
    
    memorySections.push(`## 👥 CONTACTOS (${userContext.contacts.length})
    
${contactsList}${userContext.contacts.length > 5 ? '\n- ...' : ''}`);
  }
  
  if (memorySections.length === 0) return basePrompt;
  
  // Combinar prompt base + memoria
  return `${basePrompt}
  
# ═════════════════════════════════════════════
# 💾 MEMORIA PERSISTENTE DEL USUARIO
# ═════════════════════════════════════════════

${memorySections.join('\n\n')}

# ═════════════════════════════════════════════
`;
}

/**
 * Guardar conversación en base de datos (asíncrono)
 */
async function saveConversationAsync(userEmail, userName, userType, userMessage, sofiaMessage) {
  if (!userEmail || !supabaseClient) return;
  
  try {
    const user = await supabaseClient.getOrCreateUser(userEmail, userName, userType);
    if (user) {
      await supabaseClient.saveMessage(user.id, userMessage, 'user');
      await supabaseClient.saveMessage(user.id, sofiaMessage, 'sofia');
      console.log('✅ Conversación guardada');
    }
  } catch (error) {
    console.error('⚠️ Error guardando conversación:', error);
  }
}
