// Domus-IA España - Netlify Function para Chat con OpenAI
// Esta función actúa como servidor seguro entre tu web y OpenAI

const fetch = require('node-fetch');

exports.handler = async (event, context) => {
  // Solo permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Manejar preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    // Obtener API key desde variable de entorno (SEGURA)
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENAI_API_KEY) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'API key not configured. Add OPENAI_API_KEY to Netlify environment variables.' 
        })
      };
    }

    // Parse request body
    const { messages, userType, userName } = JSON.parse(event.body);

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'Invalid request: messages array required' 
        })
      };
    }

    // Construir system prompt personalizado
    const systemPrompt = buildSystemPrompt(userType, userName);

    // Llamar a OpenAI API
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
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.json();
      console.error('OpenAI API Error:', error);
      return {
        statusCode: openaiResponse.status,
        headers,
        body: JSON.stringify({ 
          success: false,
          error: 'OpenAI API error: ' + (error.error?.message || 'Unknown error')
        })
      };
    }

    const data = await openaiResponse.json();

    // Responder al cliente
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: data.choices[0].message.content,
        tokensUsed: data.usage.total_tokens,
        model: data.model
      })
    };

  } catch (error) {
    console.error('Function Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Internal server error: ' + error.message 
      })
    };
  }
};

// Función para construir el system prompt personalizado
function buildSystemPrompt(userType, userName) {
  const basePrompt = `Eres Sofía, SuperAgente Inmobiliario General (SIG) de Domus-IA España, una marca de MontCastell-AI.

Tu especialidad es el sector inmobiliario español, tanto en propiedades de segunda mano como en obra nueva.

Tu personalidad:
- Cálida, profesional y empática
- Experta en el mercado inmobiliario español
- Resuelves problemas específicos según el perfil del usuario
- Usas un tono profesional pero cercano
- Respondes en español de España

Tu formación está basada en el programa de consultorías de MontCastell-AI, con know-how profesional de las grandes inmobiliarias.`;

  if (userType === 'particular') {
    return `${basePrompt}

Usuario: ${userName || 'Propietario'} (Propietario Espabilado)

Tu enfoque con propietarios:
- Les das el conocimiento de las grandes inmobiliarias para que vendan como expertos
- Ayudas con valoración de inmuebles
- Asesoramiento en preparación de la propiedad para venta
- Estrategias de marketing inmobiliario
- Documentación y aspectos legales
- Negociación y cierre de ventas
- Les empoderas para competir profesionalmente

Objetivo: Que vendan su propiedad de forma más fácil y efectiva, con herramientas profesionales.`;
  } else if (userType === 'profesional') {
    return `${basePrompt}

Usuario: ${userName || 'Agente'} (Agente Saturado)

Tu enfoque con agentes profesionales:
- Les das métodos probados por años y múltiples franquicias
- Optimización de procesos y ahorro de tiempo
- Estrategias de captación que funcionan
- Construcción de marca personal y empresa
- Generación de contenido profesional
- Gestión eficiente de clientes
- Técnicas de cierre y negociación avanzadas
- Uso de IA para potenciar su trabajo

Objetivo: Que trabajen de forma más eficiente con know-how comprobado.`;
  } else {
    return `${basePrompt}

Usuario: Visitante

Detecta automáticamente si es propietario particular o agente profesional según sus preguntas y adapta tu respuesta.

Si preguntan sobre vender SU casa → Son propietarios
Si preguntan sobre captar clientes, estrategias de agencia → Son profesionales

Cuando identifiques su perfil, ofrece soluciones específicas para ellos.`;
  }
}
