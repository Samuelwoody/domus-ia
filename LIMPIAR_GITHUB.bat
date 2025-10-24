@echo off
echo ========================================
echo LIMPIEZA AUTOMATICA - Domus-IA v1.2
echo ========================================
echo.
echo Este script eliminara archivos obsoletos
echo del repositorio de GitHub
echo.
pause

echo.
echo Eliminando archivos obsoletos...
echo.

REM Categoria 1: Documentacion Oct 5-7
del /F /Q ACTIVAR_BACKEND.md 2>nul
del /F /Q BACKEND_SPECS.md 2>nul
del /F /Q BRANDING.md 2>nul
del /F /Q CAMBIOS_IMPLEMENTADOS.md 2>nul
del /F /Q CAMBIOS_SESION_FINAL.md 2>nul
del /F /Q COLOR_PALETTE.md 2>nul
del /F /Q ENTREGA_FINAL.md 2>nul
del /F /Q ESTADO_ACTUAL.md 2>nul
del /F /Q HERO_REDESIGN.md 2>nul
del /F /Q INDICE_DOCUMENTACION.md 2>nul
del /F /Q MOBILE_FIX.md 2>nul
del /F /Q NETLIFY_DEPLOY.md 2>nul
del /F /Q OPENAI_SETUP.md 2>nul
del /F /Q POSITIONING.md 2>nul
del /F /Q RESUMEN_CHATGPT_REAL.md 2>nul
del /F /Q RESUMEN_EJECUTIVO.md 2>nul
del /F /Q SOLUCION_RAPIDA_API.md 2>nul
del /F /Q START_HERE.md 2>nul
del /F /Q STRUCTURE_OPTIMIZATION.md 2>nul
del /F /Q UI_IMPROVEMENTS.md 2>nul
del /F /Q VOICE_RECORDING.md 2>nul
del /F /Q SISTEMA_COMPLETO_SOFIA.md 2>nul
del /F /Q VERCEL_DEPLOY.md 2>nul
del /F /Q ACTUALIZACION_GITHUB.md 2>nul

REM Categoria 2: Duplicados GitHub
del /F /Q SUBIR_A_GITHUB_AHORA.md 2>nul
del /F /Q SUBIR_AHORA.md 2>nul
del /F /Q SUBIR_TODO_FINAL.md 2>nul
del /F /Q VERIFICACION_ARCHIVOS.md 2>nul
del /F /Q README_SUBIR_YA.md 2>nul
del /F /Q SUBIR_GITHUB.txt 2>nul
del /F /Q LISTADO_FINAL_ARCHIVOS.txt 2>nul
del /F /Q EJECUTAR_AHORA.sh 2>nul
del /F /Q COPIAR_A_GITHUB.txt 2>nul

REM Categoria 3-7: Debugging y Desarrollo
del /F /Q FASE_1_MEJORAS_FRONTEND.md 2>nul
del /F /Q FIX_MODO_DEMO.md 2>nul
del /F /Q FIX_COMPLETO_MODO_DEMO.md 2>nul
del /F /Q CONFIGURACION_API_KEYS.md 2>nul
del /F /Q README_FUNCIONALIDADES_AVANZADAS.md 2>nul
del /F /Q DEPLOY_INSTRUCCIONES.md 2>nul
del /F /Q GUIA_RAPIDA.md 2>nul
del /F /Q MEJORAS_VELOCIDAD_FORMATO.md 2>nul
del /F /Q RESUMEN_VISUAL.md 2>nul
del /F /Q FIX_BOTON_ENVIAR_MOVIL.md 2>nul
del /F /Q CAMBIOS_BOTON_MOVIL.txt 2>nul
del /F /Q FIX_SOFIA_CAPACIDADES.md 2>nul
del /F /Q SUBIR_FIX_CAPACIDADES.txt 2>nul
del /F /Q SOFIA_CAPACIDADES_COMPLETAS.md 2>nul
del /F /Q SUBIR_CAPACIDADES_COMPLETAS.txt 2>nul
del /F /Q DIAGNOSTICO_ERROR.md 2>nul
del /F /Q CONFIGURACION_VERCEL_COMPLETA.md 2>nul
del /F /Q PASOS_VERCEL_AHORA.md 2>nul
del /F /Q PROBLEMA_IMPORTS_SOLUCIONADO.md 2>nul
del /F /Q SQL_LIMPIO_PARA_SUPABASE.sql 2>nul

REM Categoria 8-11: Integraciones
del /F /Q STRIPE_INTEGRATION_GUIDE.md 2>nul
del /F /Q RESUMEN_PAGOS.md 2>nul
del /F /Q SISTEMA_AUTENTICACION.md 2>nul
del /F /Q FASE_1_CAPTACION_EMAIL.md 2>nul
del /F /Q FASE_1_LIMITES_PAYWALL.md 2>nul
del /F /Q FASE_1_STRIPE_INTEGRATION.md 2>nul
del /F /Q ANALISIS_COMPATIBILIDAD_FASE_1.md 2>nul
del /F /Q supabase-schema-update.sql 2>nul
del /F /Q FASE_1_IMPLEMENTADO.md 2>nul
del /F /Q RESUMEN_FASE_1_COMPLETA.md 2>nul
del /F /Q IMPLEMENTACION_VISUAL_FASE_1.md 2>nul
del /F /Q CONOCIMIENTO_SOFIA_MONTCASTELL.md 2>nul
del /F /Q NUEVO_SYSTEM_PROMPT_SOFIA.txt 2>nul
del /F /Q IMGBB-SETUP.md 2>nul
del /F /Q FIX-ERRORES-500.md 2>nul
del /F /Q FIX-SOFIA-NO-GENERA-IMAGENES.md 2>nul
del /F /Q REVERT-TO-WORKING-STATE.md 2>nul
del /F /Q FIX-DESCARGA-IMAGENES.md 2>nul
del /F /Q LISTO-PARA-SUBIR.md 2>nul
del /F /Q "DIAGNÓSTICO-ERRORES.md" 2>nul
del /F /Q SIMPLIFICACION-DALLE.md 2>nul
del /F /Q FIX-TIMEOUT-DALLE.md 2>nul
del /F /Q MEJORAS-DALLE-2025-10-14.md 2>nul
del /F /Q FIX-TEXTO-PRODUCIENDO-IMAGEN.md 2>nul
del /F /Q FIX-LECTURA-VOZ-LIMPIA.md 2>nul

REM Categoria 12-16: CRM y Deployment
del /F /Q FASE1_MEMORIA_COMPLETADA.md 2>nul
del /F /Q REGISTRO_CAMBIOS_CRM.md 2>nul
del /F /Q FASE2_PROPIEDADES_COMPLETADA.md 2>nul
del /F /Q FASE5_CRM_VISUAL_COMPLETADA.md 2>nul

REM Test files
del /F /Q test-button.html 2>nul
del /F /Q github_index_check.html 2>nul
del /F /Q vercel_page_check.html 2>nul
del /F /Q debug.html 2>nul
del /F /Q test-document-extraction.html 2>nul
del /F /Q test-chat-close.html 2>nul

REM Archivos con emojis
del /F /Q "⚡_RESUMEN_RAPIDO.md" 2>nul
del /F /Q "✅_CHECKLIST_VERCEL.md" 2>nul
del /F /Q "🎯_QUE_HACER_EN_VERCEL.md" 2>nul
del /F /Q "📦_SUBIR_A_GITHUB.md" 2>nul
del /F /Q "🎯_LEE_ESTO_PRIMERO.md" 2>nul
del /F /Q "📖_INDICE_COMPLETO.md" 2>nul
del /F /Q "🆘_DIAGNOSTICO_REAL.md" 2>nul
del /F /Q "🎨_DALLE_FUNCIONANDO.md" 2>nul
del /F /Q "✅_COPIA_ESTOS_ARCHIVOS.md" 2>nul
del /F /Q "🎨_DALLE_VISUAL_FUNCIONANDO.md" 2>nul
del /F /Q "⚡_COPIA_AHORA.md" 2>nul
del /F /Q "🎨_DALLE_SOLUCION_FINAL.md" 2>nul
del /F /Q "⚡_COPIAR_ESTOS_ARCHIVOS.md" 2>nul
del /F /Q "📋_RESUMEN_CAMBIOS.txt" 2>nul
del /F /Q "🔍_GUIA_VERIFICACION.md" 2>nul
del /F /Q "🚀_LEER_PRIMERO.md" 2>nul
del /F /Q "📚_INDICE_SOLUCION_DALLE.md" 2>nul
del /F /Q "✅_RESUMEN_FINAL_COMPLETO.md" 2>nul
del /F /Q "🎨_ANTES_Y_DESPUES.md" 2>nul
del /F /Q "📊_ANALISIS_FUNCIONALIDADES_FALTANTES.md" 2>nul
del /F /Q "📋_RESUMEN_EJECUTIVO_FUNCIONES.md" 2>nul
del /F /Q "🎯_CHECKLIST_FUNCIONES_CHATGPT.md" 2>nul
del /F /Q "✅_FUNCTION_CALLING_IMPLEMENTADO.md" 2>nul
del /F /Q "🚀_DEPLOY_FUNCTION_CALLING.md" 2>nul
del /F /Q "⚡_RESUMEN_FUNCTION_CALLING.md" 2>nul
del /F /Q "📋_ARCHIVOS_CREADOS_HOY.md" 2>nul
del /F /Q "🎯_SOFIA_PERSONALIDAD_ACTUALIZADA.md" 2>nul
del /F /Q "📞_NUEVAS_FUNCIONALIDADES_AÑADIDAS.md" 2>nul
del /F /Q "✅_LISTO_PARA_SUBIR.md" 2>nul
del /F /Q "🔧_SUBIR_FIX_TEXTO.md" 2>nul
del /F /Q "🔊_SUBIR_VOZ_LIMPIA.md" 2>nul
del /F /Q "⌨️_EFECTO_ESCRITURA_CHATGPT.md" 2>nul
del /F /Q "✅_SUBIR_EFECTO_ESCRITURA.md" 2>nul
del /F /Q "✅_FIXES_COMPLETADOS.md" 2>nul
del /F /Q "🚀_SUBIR_AHORA_TODO.md" 2>nul
del /F /Q "📋_RESUMEN_COMPLETO_CRM.md" 2>nul
del /F /Q "🎯_PROXIMOS_PASOS_CRM.md" 2>nul
del /F /Q "🧪_GUIA_TESTING_CRM.md" 2>nul
del /F /Q "✅_IMPLEMENTACION_COMPLETA_CRM.md" 2>nul
del /F /Q "🎯_QUICK_REFERENCE_CRM.md" 2>nul
del /F /Q "🎉_RESUMEN_FINAL.md" 2>nul
del /F /Q "🎨_MEJORAS_UX_CRM.md" 2>nul
del /F /Q "🚀_CHECKLIST_DEPLOYMENT.md" 2>nul
del /F /Q "🎊_RESUMEN_FINAL_SESION.md" 2>nul
del /F /Q "⚡_ACCION_INMEDIATA_V1.1.md" 2>nul
del /F /Q "📚_INDICE_FIX_CHAT.md" 2>nul
del /F /Q "🔍_ESTADO_REAL_PROYECTO.md" 2>nul
del /F /Q "⚡_RESUMEN_1_MINUTO.md" 2>nul
del /F /Q "📍_DONDE_ESTOY.md" 2>nul
del /F /Q "📚_INDICE_MASTER.md" 2>nul
del /F /Q "🎯_QUE_HACER_AHORA.md" 2>nul
del /F /Q "🎨_CAMBIO_PALETA_COLORES.md" 2>nul
del /F /Q "⚡_RESUMEN_CAMBIO_COLORES.md" 2>nul
del /F /Q "🗑️_PLAN_LIMPIEZA.md" 2>nul
del /F /Q EJECUTAR_LIMPIEZA.sh 2>nul
del /F /Q "✅_LIMPIEZA_COMPLETADA.md" 2>nul
del /F /Q FIX_CIERRE_CHAT.md 2>nul
del /F /Q "📝_SCRIPT_SQL_INSTRUCCIONES.md" 2>nul
del /F /Q "🚨_DIAGNOSTICO_PRODUCCION.md" 2>nul
del /F /Q "⚡_SQL_EJECUTAR_YA.sql" 2>nul
del /F /Q "📸_CAPTURAS_ANTES_DESPUES.md" 2>nul
del /F /Q "🎯_SOLUCION_3_PASOS.md" 2>nul
del /F /Q "✅_CHECKLIST_DEPLOYMENT.md" 2>nul
del /F /Q "🔥_LEE_ESTO_PRIMERO.md" 2>nul
del /F /Q "📚_INDICE_DOCUMENTACION_FASE_1.md" 2>nul
del /F /Q "⚡_RESUMEN_EJECUTIVO.md" 2>nul
del /F /Q "🎨_VISUAL_PROBLEMA_SOLUCION.md" 2>nul
del /F /Q "🚀_QUICK_START.md" 2>nul
del /F /Q "🔧_FIX_IMPLEMENTADO.md" 2>nul
del /F /Q "🚀_SUBIR_A_GITHUB_AHORA.md" 2>nul
del /F /Q "📊_RESUMEN_SITUACION_ACTUAL.md" 2>nul
del /F /Q "⭐_RESUMEN_EJECUTIVO_FINAL.md" 2>nul
del /F /Q "📁_ARCHIVOS_CREADOS_HOY.md" 2>nul
del /F /Q "🎯_EMPIEZA_AQUI.md" 2>nul
del /F /Q "🔧_FIX_IMPORTS_SUPABASE.md" 2>nul
del /F /Q "🎯_ULTIMO_FIX.md" 2>nul
del /F /Q "🔧_FIX_COMPLETO_FINAL.md" 2>nul
del /F /Q "🎯_ACCION_INMEDIATA.md" 2>nul
del /F /Q "🔧_REVISION_COMPLETA_FINAL.md" 2>nul
del /F /Q "⚡_ULTIMO_CAMBIO.md" 2>nul
del /F /Q "🔍_DIAGNOSTICO_SUPABASE.sql" 2>nul
del /F /Q "🎯_DIAGNOSTICO_SUPABASE_CRITICO.md" 2>nul
del /F /Q "📧_RESUMEN_PARA_ENVIAR.md" 2>nul
del /F /Q "📊_RESUMEN_SESION_17_OCT.md" 2>nul
del /F /Q "⚡_LEE_ESTO_PRIMERO.md" 2>nul
del /F /Q "🗂️_INDICE_SESION_ACTUAL.md" 2>nul
del /F /Q "🔍_COPIAR_ESTO_EN_SUPABASE.sql" 2>nul
del /F /Q "⭐_LEER_PRIMERO_FASE_1.md" 2>nul
del /F /Q "🎯_RESUMEN_1_MINUTO.md" 2>nul
del /F /Q "🚀_SUBIR_AHORA.md" 2>nul

echo.
echo ========================================
echo Archivos eliminados localmente
echo ========================================
echo.
echo Ahora vamos a subirlos a GitHub...
echo.
pause

echo.
echo Agregando cambios a Git...
git add -A

echo.
echo Haciendo commit...
git commit -m "feat(v1.2): limpieza masiva - eliminados 130+ archivos obsoletos"

echo.
echo Subiendo a GitHub...
git push origin main

echo.
echo ========================================
echo LIMPIEZA COMPLETADA!
echo ========================================
echo.
echo Los archivos se han eliminado de GitHub
echo Vercel desplegara automaticamente en 2 minutos
echo.
pause
