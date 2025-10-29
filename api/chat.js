// 🌟 DOMUS-IA ESPAÑA - VERSIÓN MÍNIMA FUNCIONAL
// Solo GPT-4o + DALL-E 3

export default async function handler(req, res) {
  // CORS
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
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return res.status(500).json({ 
        success: false,
        error: 'OPENAI_API_KEY not configured' 
      });
    }

    const { messages, userType, userName } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        success: false,
        error: 'messages array required' 
      });
    }

    // System prompt simple
    const systemPrompt = `Eres Sofía, asesora inmobiliaria experta de Domus-IA España.
    
Tu misión: Ayudar a ${userName || 'usuarios'} con consultas inmobiliarias.

IMPORTANTE:
- Responde SIEMPRE en español
- Sé profesional, clara y cercana
- Da respuestas concisas y útiles

Tienes acceso a DALL-E 3 para generar imágenes inmobiliarias cuando te lo pidan.`;

    // Tools: Solo DALL-E
    const tools = [
      {
        type: "function",
        function: {
          name: "generate_dalle_image",
          description: "Generate professional real estate images using DALL-E 3",
          parameters: {
            type: "object",
            properties: {
              prompt: {
                type: "string",
                description: "Detailed description of the image"
              },
              size: {
                type: "string",
                enum: ["1024x1024", "1024x1792", "1792x1024"],
                default: "1024x1024"
              }
            },
            required: ["prompt"]
          }
        }
      }
    ];

    // Llamada a OpenAI
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        max_tokens: 4000,
        temperature: 0.7,
        tools: tools,
        tool_choice: "auto"
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI Error:', error);
      return res.status(500).json({ 
        success: false,
        error: 'OpenAI API error: ' + (error.error?.message || 'Unknown')
      });
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0].message;

    // Check si quiere generar imagen
    if (assistantMessage.tool_calls && assistantMessage.tool_calls.length > 0) {
      const toolCall = assistantMessage.tool_calls[0];
      
      if (toolCall.function.name === 'generate_dalle_image') {
        try {
          const functionArgs = JSON.parse(toolCall.function.arguments);
          
          // Llamar a DALL-E
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
              quality: 'standard',
              style: 'vivid'
            })
          });

          if (!dalleResponse.ok) {
            throw new Error('DALL-E failed');
          }

          const dalleData = await dalleResponse.json();
          const imageUrl = dalleData.data[0].url;
          
          return res.status(200).json({
            success: true,
            message: '✨ He generado la imagen que pediste. ¿Qué te parece?',
            imageUrl: imageUrl,
            dalleUsed: true,
            tokensUsed: data.usage.total_tokens,
            model: 'gpt-4o + dall-e-3'
          });

        } catch (error) {
          console.error('DALL-E Error:', error);
          return res.status(200).json({
            success: true,
            message: 'Lo siento, hubo un error al generar la imagen. ¿Puedes intentarlo de nuevo?',
            dalleUsed: false,
            error: error.message
          });
        }
      }
    }

    // Respuesta normal de texto
    return res.status(200).json({
      success: true,
      message: assistantMessage.content,
      tokensUsed: data.usage.total_tokens,
      model: 'gpt-4o'
    });

  } catch (error) {
    console.error('Handler Error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal error: ' + error.message 
    });
  }
}
