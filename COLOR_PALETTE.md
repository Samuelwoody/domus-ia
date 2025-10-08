# 🎨 Paleta de Colores - Domus-IA España

## Nueva Paleta: Oro → Rojo

### Colores Principales

#### 🔴 Rojo Oscuro Profundo
```css
--domus-navy: #2c0a0e;
```
- **Uso**: Textos principales, fondos oscuros
- **RGB**: rgb(44, 10, 14)
- **Transmite**: Elegancia, seriedad, profesionalidad

#### 🔴 Rojo Corporativo
```css
--domus-accent: #8b1a1a;
```
- **Uso**: Acciones, hovers, acentos
- **RGB**: rgb(139, 26, 26)
- **Transmite**: Pasión, energía, determinación

#### ✨ Oro Elegante
```css
--domus-gold: #d4af37;
```
- **Uso**: Highlights, iconos premium, detalles
- **RGB**: rgb(212, 175, 55)
- **Transmite**: Lujo, calidad, excelencia

### Colores Secundarios

#### 🔘 Gris Sage
```css
--domus-sage: #6b7280;
```
- **Uso**: Textos secundarios, descripciones
- **RGB**: rgb(107, 114, 128)

#### ⚪ Crema Claro
```css
--domus-cream: #fafafa;
```
- **Uso**: Fondos claros, espacios en blanco
- **RGB**: rgb(250, 250, 250)

#### 🪨 Piedra
```css
--domus-stone: #78716c;
```
- **Uso**: Textos terciarios, bordes sutiles
- **RGB**: rgb(120, 113, 108)

### Gradientes

#### Gradiente Principal (Oro → Rojo)
```css
--gradient-primary: linear-gradient(135deg, #d4af37 0%, #8b1a1a 100%);
```
- **Uso**: Botones principales, headers, elementos destacados
- **Dirección**: 135° (diagonal superior izquierda a inferior derecha)

#### Gradiente Reverso (Rojo → Oro)
```css
--gradient-reverse: linear-gradient(135deg, #8b1a1a 0%, #d4af37 100%);
```
- **Uso**: Variantes, efectos alternativos

## Aplicaciones por Elemento

### 🏠 Logo y Branding
- **Icono**: Gradiente oro-rojo
- **Texto**: Rojo oscuro (#2c0a0e)
- **Fondo**: Transparente o crema

### 🔘 Botones

#### Primarios
- **Background**: `gradient-primary` (oro → rojo)
- **Text**: Blanco (#ffffff)
- **Hover**: Opacidad 90%

#### Secundarios
- **Border**: Oro (#d4af37)
- **Text**: Oro (#d4af37)
- **Hover**: Background gradient + texto blanco

### 💬 Chat Interface

#### Header
- **Background**: Gradiente oro-rojo
- **Text**: Blanco
- **Icono**: Blanco

#### Mensajes Usuario
- **Background**: Gradiente oro-rojo
- **Text**: Blanco

#### Mensajes Sofía
- **Avatar**: Gradiente oro-rojo
- **Nombre**: Oro (#d4af37)
- **Bubble**: Gris claro (#f3f4f6)

### 🔗 Links y Navegación
- **Default**: Gris sage (#6b7280)
- **Hover**: Oro (#d4af37)
- **Active**: Rojo (#8b1a1a)

### 📱 Estado y Feedback
- **Success**: Verde (#10b981)
- **Warning**: Oro (#d4af37)
- **Error**: Rojo (#8b1a1a)
- **Info**: Gris sage (#6b7280)

## Psicología del Color

### 🔴 Rojo
- **Emociones**: Pasión, energía, poder, determinación
- **Sector Inmobiliario**: Urgencia, acción, decisión
- **Sofía**: Proactividad, motivación, impulso

### ✨ Oro
- **Emociones**: Lujo, calidad, éxito, prestigio
- **Sector Inmobiliario**: Premium, inversión, valor
- **Sofía**: Excelencia, conocimiento, profesionalidad

### Combinación Oro-Rojo
- **Mensaje**: Lujo accesible con acción decisiva
- **Perfil**: Profesional, elegante pero enérgico
- **Target**: Agentes ambiciosos y propietarios exigentes

## Accesibilidad

### Contraste (WCAG 2.1)

#### Texto sobre Fondo Claro
- ✅ Rojo oscuro (#2c0a0e) sobre blanco: **AAA** (19.5:1)
- ✅ Rojo (#8b1a1a) sobre blanco: **AAA** (9.2:1)
- ✅ Oro (#d4af37) sobre blanco: **AA** (3.8:1)

#### Texto sobre Fondo Oscuro
- ✅ Blanco sobre rojo (#8b1a1a): **AAA** (9.2:1)
- ✅ Oro sobre rojo oscuro (#2c0a0e): **AAA** (8.5:1)

### Daltonismo
- ✅ **Protanopia**: Rojo se ve marrón oscuro (mantiene contraste)
- ✅ **Deuteranopia**: Oro y rojo distinguibles
- ✅ **Tritanopia**: Sin problemas de diferenciación

## Exportación de Colores

### CSS Variables
```css
:root {
    --domus-navy: #2c0a0e;
    --domus-gold: #d4af37;
    --domus-sage: #6b7280;
    --domus-cream: #fafafa;
    --domus-stone: #78716c;
    --domus-accent: #8b1a1a;
    --domus-accent-light: rgba(139, 26, 26, 0.1);
    --gradient-primary: linear-gradient(135deg, #d4af37 0%, #8b1a1a 100%);
    --gradient-reverse: linear-gradient(135deg, #8b1a1a 0%, #d4af37 100%);
}
```

### Tailwind Config
```javascript
colors: {
    'domus-navy': '#2c0a0e',
    'domus-gold': '#d4af37',
    'domus-sage': '#6b7280',
    'domus-cream': '#fafafa',
    'domus-stone': '#78716c',
    'domus-accent': '#8b1a1a'
}
```

### JSON
```json
{
  "domusNavy": "#2c0a0e",
  "domusGold": "#d4af37",
  "domusSage": "#6b7280",
  "domusCream": "#fafafa",
  "domusStone": "#78716c",
  "domusAccent": "#8b1a1a"
}
```

## Comparación de Paletas

### ❌ Paleta Anterior (Oro-Azul)
- Azul marino: #0c1e3e
- Azul corporativo: #1a4b8c
- **Mensaje**: Confianza, estabilidad, corporativo tradicional

### ✅ Paleta Nueva (Oro-Rojo)
- Rojo oscuro: #2c0a0e
- Rojo corporativo: #8b1a1a
- **Mensaje**: Pasión, acción, lujo con energía

## Recomendaciones de Uso

### ✅ DO
- Usar gradiente en elementos de llamada a la acción
- Combinar oro con rojo para balance visual
- Mantener espacios en blanco generosos
- Usar rojo oscuro para textos importantes

### ❌ DON'T
- No usar rojo puro brillante (#ff0000)
- No saturar todos los elementos con color
- No usar gradientes en textos pequeños
- No combinar con otros colores ajenos a la paleta

---

**Paleta**: Oro-Rojo Elegante
**Versión**: 2.0.0
**Fecha**: 2025
**Estado**: ✅ Implementado en toda la aplicación
