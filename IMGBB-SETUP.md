# 🖼️ Configuración de ImgBB para URLs Permanentes de Imágenes DALL-E

## 📋 ¿Qué problema resuelve esto?

**ANTES:**
- Las URLs de DALL-E expiran en ~1 hora
- Las imágenes desaparecen del historial
- Sofía no puede "recordar" imágenes generadas previamente
- No se pueden descargar después de expirar

**DESPUÉS:**
- URLs permanentes que nunca expiran
- Imágenes disponibles para siempre
- Sofía puede analizar imágenes en conversaciones posteriores
- Descarga disponible en cualquier momento

---

## 🚀 PASO 1: Obtener API Key de ImgBB (2 minutos)

### 1.1. Ir a ImgBB API
Abre tu navegador y ve a: **https://api.imgbb.com/**

### 1.2. Crear cuenta gratuita
- Haz clic en **"Get API Key"** o **"Sign Up"**
- Completa el registro:
  - **Email:** Tu email
  - **Username:** Tu nombre de usuario
  - **Password:** Tu contraseña
- Confirma tu email (revisa tu bandeja de entrada)

### 1.3. Obtener tu API Key
Una vez dentro de tu cuenta:
1. Ve a la sección **"API"** en el menú
2. Copia tu **API Key** (será algo como: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
3. ⚠️ **GUÁRDALA en un lugar seguro** (la necesitarás en el siguiente paso)

### 1.4. Características de la cuenta gratuita
✅ **Ilimitadas imágenes**
✅ **Sin expiración de enlaces**
✅ **32 MB por imagen**
✅ **Sin marca de agua**
✅ **HTTPS seguro**
✅ **CDN global**

**Costo: $0/mes forever**

---

## 🔧 PASO 2: Configurar API Key en Vercel (1 minuto)

### 2.1. Ir a tu proyecto en Vercel
1. Abre: **https://vercel.com/dashboard**
2. Selecciona tu proyecto **"domus-ia"** (o como lo hayas nombrado)

### 2.2. Añadir variable de entorno
1. Ve a **"Settings"** (arriba derecha)
2. En el menú lateral, haz clic en **"Environment Variables"**
3. Haz clic en **"Add New"**
4. Configura:
   - **Name:** `IMGBB_API_KEY`
   - **Value:** Pega tu API Key de ImgBB (la que copiaste en el paso 1.3)
   - **Environments:** Selecciona **Production**, **Preview** y **Development** (todas)
5. Haz clic en **"Save"**

### 2.3. Verificar variable
Deberías ver algo así en la lista:

```
IMGBB_API_KEY    a1b2c3d4e5f6g7... (hidden)    Production, Preview, Development
```

---

## 📤 PASO 3: Subir archivos modificados a GitHub

### 3.1. Archivos que debes subir:

**Archivos modificados:**
1. `api/chat.js` - Backend con integración ImgBB
2. `js/main.js` - Frontend con botones de descarga/edición

### 3.2. Subir a GitHub:

**Opción A: Usando GitHub Desktop**
1. Abre GitHub Desktop
2. Verás los cambios en los archivos
3. Escribe un mensaje de commit: "Añadir integración ImgBB para URLs permanentes"
4. Haz clic en **"Commit to main"**
5. Haz clic en **"Push origin"**

**Opción B: Usando la web de GitHub**
1. Ve a tu repositorio en GitHub.com
2. Navega a cada archivo (`api/chat.js` y `js/main.js`)
3. Haz clic en el ícono del lápiz (Edit)
4. Copia y pega el contenido nuevo
5. Haz clic en **"Commit changes"**

---

## 🔄 PASO 4: Redesplegar en Vercel (automático)

### 4.1. Trigger redeploy
Vercel detectará automáticamente los cambios en GitHub y redesplegará tu proyecto.

**IMPORTANTE:** Como añadiste una nueva variable de entorno, necesitas hacer un **redeploy completo**.

### 4.2. Forzar redeploy (si no se activa automático):
1. Ve a tu proyecto en Vercel
2. Ve a la pestaña **"Deployments"**
3. Encuentra el deployment más reciente
4. Haz clic en los **tres puntos (...)** a la derecha
5. Selecciona **"Redeploy"**
6. Confirma haciendo clic en **"Redeploy"** nuevamente

### 4.3. Esperar deployment
Espera 1-2 minutos mientras Vercel redespliega tu proyecto con la nueva configuración.

---

## ✅ PASO 5: Probar funcionamiento

### 5.1. Abrir tu sitio web
Abre tu sitio: `https://tu-proyecto.vercel.app`

### 5.2. Generar una imagen
1. Abre el chat con Sofía
2. Pide: **"Crea una casa moderna minimalista"**
3. Espera a que se genere la imagen

### 5.3. Verificar URL permanente
Deberías ver:
- ✅ Imagen generada correctamente
- ✅ Badge verde: **"✓ Enlace permanente"** debajo de la imagen
- ✅ Tres botones: **Descargar**, **Editar**, **Variación**

### 5.4. Probar descarga
1. Haz clic en **"Descargar"**
2. La imagen debería descargarse a tu ordenador
3. Nombre del archivo: `domus-ia-[timestamp].png`

### 5.5. Verificar que la URL no expira
1. Copia la URL de la imagen (clic derecho → "Copiar dirección de imagen")
2. La URL debería empezar con: `https://i.ibb.co/...`
3. Pega esa URL en una pestaña nueva del navegador
4. ✅ La imagen debería cargar correctamente
5. ⏰ Esta URL funcionará para siempre (no expira)

### 5.6. Probar análisis visual de Sofía
1. Después de generar la imagen, pregúntale a Sofía:
   - **"¿Qué te parece esta imagen?"**
   - **"¿Qué colores predominan?"**
   - **"¿Cuántas ventanas tiene?"**
2. ✅ Sofía debería poder responder específicamente sobre la imagen

---

## 🐛 Solución de problemas

### Problema 1: Badge dice "⚠ Enlace temporal (1h)"

**Causa:** La API Key no está configurada correctamente o no se cargó en el deployment.

**Solución:**
1. Verifica que la variable `IMGBB_API_KEY` esté en Vercel Settings → Environment Variables
2. Verifica que esté activa para **Production**
3. Haz un **Redeploy** forzado (ver Paso 4.2)
4. Espera 2 minutos y prueba de nuevo

### Problema 2: Error en consola "ImgBB upload failed"

**Causa:** La API Key es incorrecta o expiró.

**Solución:**
1. Ve a https://api.imgbb.com/
2. Inicia sesión
3. Regenera tu API Key
4. Actualiza la variable en Vercel
5. Redespliega

### Problema 3: La imagen no se descarga

**Causa:** Bloqueador de pop-ups del navegador.

**Solución:**
1. Permite pop-ups para tu sitio web
2. O haz clic derecho en la imagen → "Guardar imagen como..."

### Problema 4: Sofía dice "no puedo ver imágenes"

**Causa:** El archivo `api/chat.js` no se subió correctamente.

**Solución:**
1. Verifica que el archivo `api/chat.js` en GitHub tenga la función `uploadToImgBB`
2. Verifica que el system prompt tenga la sección "🎨 CAPACIDADES DE GENERACIÓN Y VISIÓN DE IMÁGENES"
3. Redespliega en Vercel

---

## 📊 Verificar en logs de Vercel (Debugging avanzado)

Si algo no funciona, puedes revisar los logs:

1. Ve a tu proyecto en Vercel
2. Ve a la pestaña **"Functions"**
3. Haz clic en **"api/chat.js"**
4. Ve a **"Logs"**
5. Genera una imagen en tu sitio
6. Busca en los logs:
   - ✅ `"📤 Subiendo imagen a ImgBB para URL permanente..."`
   - ✅ `"✅ Imagen subida a ImgBB exitosamente"`
   - ✅ `"🔗 URL permanente: https://i.ibb.co/..."`

Si ves estos mensajes, todo está funcionando correctamente.

---

## 💰 Costos y límites

### ImgBB Gratuito:
- **Imágenes:** Ilimitadas
- **Almacenamiento:** Ilimitado
- **Bandwidth:** Generoso (no especificado)
- **Costo:** $0/mes

### Proyección de uso:
- **100 imágenes/mes:** $0
- **500 imágenes/mes:** $0
- **1000 imágenes/mes:** $0
- **Escalable:** Sin límites conocidos

---

## 🎯 Resumen rápido (checklist)

- [ ] Registrado en ImgBB
- [ ] API Key obtenida
- [ ] Variable `IMGBB_API_KEY` añadida en Vercel
- [ ] Archivo `api/chat.js` subido a GitHub
- [ ] Archivo `js/main.js` subido a GitHub
- [ ] Redeploy forzado en Vercel
- [ ] Imagen generada con badge "✓ Enlace permanente"
- [ ] Botones de Descargar/Editar/Variación visibles
- [ ] Descarga funciona correctamente
- [ ] Sofía puede analizar la imagen visualmente

---

## 📞 Siguiente paso

Una vez que hayas completado todos los pasos y verificado que funciona:

✅ Las imágenes ahora tienen URLs permanentes
✅ Se pueden descargar en cualquier momento
✅ Sofía puede verlas y comentar sobre ellas
✅ Los botones de Editar y Variación están listos

**¡Todo listo para producción!** 🚀

---

## 🔐 Seguridad

**¿Es seguro ImgBB?**
- ✅ HTTPS seguro
- ✅ Las imágenes son públicas (cualquiera con el enlace puede verlas)
- ⚠️ NO subas información confidencial o personal
- ✅ Perfecto para imágenes generadas por DALL-E (casas, interiores, etc.)

**¿Puedo borrar imágenes?**
- Sí, cada imagen tiene un `deleteUrl` que se devuelve en la respuesta
- Puedes implementar funcionalidad de borrado si lo necesitas
- Por ahora, las imágenes se quedan almacenadas indefinidamente

---

**Tiempo total de configuración: ~5 minutos**
**Dificultad: Baja (solo copiar/pegar API key)**
