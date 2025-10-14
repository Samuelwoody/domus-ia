# 🚀 DEPLOY FUNCTION CALLING - INSTRUCCIONES

## ⚡ PASOS RÁPIDOS (2 minutos)

### **1. Subir archivos modificados**

```bash
git add api/chat.js js/main.js
git commit -m "✨ Feat: Implement Function Calling for DALL-E - Fix 'no puedo generar' issue"
git push origin main
```

### **2. Esperar deploy automático**
- Vercel desplegará en 30-60 segundos
- Recibirás notificación cuando esté listo

### **3. Probar en producción**
```
1. Abre: https://[tu-proyecto].vercel.app
2. Abre chat con Sofia
3. Escribe: "Genera una imagen de un salón moderno"
4. Espera 10-15 segundos
5. ✅ Deberías ver la imagen en el chat
```

---

## 🧪 VERIFICACIÓN PASO A PASO

### **Test 1: Verificar que Function Calling funciona**

**Entrada:**
```
"Genera una imagen de un dormitorio escandinavo"
```

**Esperado:**
1. ✅ Sofia responde: "He generado..." (no dice "no puedo")
2. ✅ Imagen aparece debajo del mensaje
3. ✅ Mensaje describe la imagen generada

**Logs en consola (F12):**
```
🎨 GPT-4o solicitó usar herramienta: generate_dalle_image
✅ Imagen generada: https://oaidalleapi...
✅ Backend usó Function Calling - Imagen ya generada
✅ Imagen insertada en el chat vía Function Calling
```

---

### **Test 2: Verificar que no dice "no puedo"**

**Entrada:**
```
"Crea un render de una cocina minimalista"
```

**Esperado:**
- ✅ **NO** aparece: "Aunque no puedo producir imágenes..."
- ✅ **SÍ** aparece: "He generado..." o "Aquí está..."
- ✅ Imagen se muestra correctamente

---

### **Test 3: Verificar diferentes tipos de imágenes**

**Prueba estas variaciones:**
```
1. "Genera una imagen de un salón moderno"
2. "Crea un render de un baño de lujo"
3. "Visualiza una terraza con vistas"
4. "Diseña una cocina industrial"
5. "Genera una fachada de edificio contemporáneo"
```

**Todas deberían:**
- ✅ Generar imagen
- ✅ Mostrar en el chat
- ✅ Sin mensajes de error

---

## 🐛 TROUBLESHOOTING

### **Problema 1: "No se encontró el mensaje de Sofía"**

**Síntoma:**
```
Console: ❌ No se encontró el mensaje de Sofía para insertar la imagen
```

**Solución:**
- Limpia caché del navegador: `Ctrl+Shift+R` (Windows) / `Cmd+Shift+R` (Mac)
- Verifica que los archivos se hayan subido correctamente a GitHub
- Espera 1-2 minutos después del deploy

---

### **Problema 2: Image no aparece**

**Síntoma:**
- Sofia genera el mensaje correctamente
- Pero la imagen no aparece en el chat

**Solución 1: Verifica logs del backend**
```bash
# En Vercel Dashboard
1. Ve a: https://vercel.com/dashboard
2. Click en tu proyecto "domus-ia"
3. Click en "Functions"
4. Click en "/api/chat"
5. Revisa logs recientes
```

**Busca:**
```
🎨 GPT-4o solicitó usar herramienta: generate_dalle_image
✅ Imagen generada: https://...
```

**Si NO ves estos logs:**
- GPT-4o no está usando la herramienta
- Revisa que `OPENAI_API_KEY` esté configurada
- Verifica que no haya errores en el deploy

**Solución 2: Verifica logs del frontend**
```
Abre consola (F12)
Busca:
✅ Backend usó Function Calling - Imagen ya generada
✅ Imagen insertada en el chat vía Function Calling
```

**Si NO ves estos logs:**
- El frontend no está recibiendo `imageUrl`
- Verifica que `js/main.js` se haya actualizado
- Limpia caché y recarga

---

### **Problema 3: Error 500 en /api/chat**

**Síntoma:**
```
Console: Error 500: Internal Server Error
```

**Solución:**
1. Revisa logs de Vercel (ver arriba)
2. Busca el error específico
3. Común: "OPENAI_API_KEY not configured"
   - Ve a Vercel → Settings → Environment Variables
   - Verifica que `OPENAI_API_KEY` exista
   - Si falta, añádela y redeploy

---

### **Problema 4: "Tool call ID mismatch"**

**Síntoma:**
```
Backend logs: Error: tool_call_id does not match
```

**Solución:**
- Esto indica un error en el código del backend
- Verifica que copiaste el código exactamente como está
- Específicamente líneas 280-320 de `api/chat.js`

---

### **Problema 5: Fallback se activa siempre**

**Síntoma:**
- La imagen se genera
- Pero aparece el spinner de carga manual
- En lugar del método de Function Calling

**Solución:**
```javascript
// Verifica en js/main.js línea ~492:
if (data.imageUrl && data.dalleUsed) {
    // Este bloque debería ejecutarse
}
```

**Debug:**
```javascript
// Añade este log temporal:
console.log('Response data:', {
    hasImageUrl: !!data.imageUrl,
    dalleUsed: data.dalleUsed
});
```

Si `data.imageUrl` es `undefined`, el backend no está enviando la URL.

---

## 📊 MÉTRICAS DE ÉXITO

### **Indicadores de que funciona correctamente:**

✅ **Logs backend (Vercel):**
```
🎨 GPT-4o solicitó usar herramienta: generate_dalle_image
🎨 Argumentos para DALL-E: {...}
✅ Imagen generada: https://oaidalleapi...
```

✅ **Logs frontend (Console F12):**
```
✅ ChatGPT Real (GPT-4o) - Tokens: 1234
✅ Backend usó Function Calling - Imagen ya generada: https://...
✅ Imagen insertada en el chat vía Function Calling
```

✅ **Experiencia de usuario:**
```
1. Sofia responde coherentemente
2. No dice "no puedo generar"
3. Imagen aparece en el chat
4. Mensaje describe la imagen
5. Todo coordinado y profesional
```

---

## 🎯 COMPARACIÓN DE TIEMPOS

### **Antes (Detección manual):**
```
Usuario escribe → 2s → Sofia responde (texto) → 1s → 
Spinner aparece → 12s → DALL-E genera → Imagen aparece
Total: ~15 segundos
```

### **Ahora (Function Calling):**
```
Usuario escribe → GPT-4o decide → DALL-E genera → 
GPT-4o responde con contexto → Frontend muestra todo
Total: ~12-15 segundos (similar pero mejor coordinado)
```

**Diferencia:** No es más rápido, pero SÍ más inteligente y coherente.

---

## 🔧 MANTENIMIENTO

### **Logs útiles para monitorear:**

**En producción, revisa periódicamente:**

1. **Vercel Functions logs:**
   - Cuántas veces se usa DALL-E
   - Errores en generación
   - Tokens consumidos

2. **Frontend errors (Sentry/similar):**
   - Errores de inserción de imágenes
   - Problemas de DOM

3. **Costes de OpenAI:**
   - Dashboard: https://platform.openai.com/usage
   - Verifica consumo de DALL-E
   - ~$0.04-0.08 por imagen generada

---

## 💰 COSTES ESTIMADOS

### **Por generación de imagen:**

```
GPT-4o (decisión de usar herramienta): ~200 tokens → $0.003
DALL-E 3 (1024x1024 standard):                   → $0.040
GPT-4o (respuesta final):                ~300 tokens → $0.004
────────────────────────────────────────────────────────
TOTAL por imagen:                                   ~$0.047
```

### **Comparado con antes:**

```
ANTES:
GPT-4o (respuesta):                      ~200 tokens → $0.003
DALL-E 3 (llamada manual):                          → $0.040
────────────────────────────────────────────────────────
TOTAL:                                              ~$0.043

DIFERENCIA: +$0.004 por imagen (menos de 1 centavo)
```

**Conclusión:** Prácticamente el mismo coste, pero mucho mejor UX.

---

## ✅ CHECKLIST FINAL

Antes de dar por completado, verifica:

- [ ] `api/chat.js` modificado y subido
- [ ] `js/main.js` modificado y subido
- [ ] Commit hecho con mensaje descriptivo
- [ ] Push a GitHub completado
- [ ] Vercel desplegó correctamente (sin errores)
- [ ] Test 1 pasó (imagen se genera)
- [ ] Test 2 pasó (no dice "no puedo")
- [ ] Test 3 pasó (múltiples tipos de imágenes)
- [ ] Logs de backend muestran Function Calling
- [ ] Logs de frontend muestran imageUrl recibida
- [ ] Imagen aparece correctamente en el chat
- [ ] Mensaje de Sofia es coherente con la imagen

---

## 🎉 ¡COMPLETADO!

Si todos los tests pasaron, **Function Calling está funcionando correctamente**.

**Próximos pasos opcionales:**
1. Implementar Rate Limiting (4 horas)
2. Añadir Image Editing (6 horas)
3. Multi-image Vision (4 horas)

**Documentación completa:** Lee `✅_FUNCTION_CALLING_IMPLEMENTADO.md`

---

**Implementado:** 2025-10-13  
**Tiempo total:** 45 minutos  
**Estado:** ✅ LISTO PARA PRODUCCIÓN
