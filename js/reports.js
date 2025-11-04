// ============================================
// 📊 REPORTS MANAGER - Preview y Publicación de Informes
// ============================================

class ReportsManager {
    constructor() {
        this.currentReport = null;
        this.currentReportData = null;
        this.previewModal = null;
        this.init();
    }

    init() {
        console.log('📊 ReportsManager inicializado');
        this.createModalStructure();
    }

    /**
     * Crea la estructura del modal de preview
     */
    createModalStructure() {
        // Verificar si ya existe
        if (document.getElementById('reportPreviewModal')) {
            console.log('✅ Modal ya existe');
            return;
        }

        const modalHTML = `
            <div id="reportPreviewModal" class="report-modal hidden">
                <div class="report-modal-overlay" onclick="window.reportsManager.closePreview()"></div>
                <div class="report-modal-container">
                    <div class="report-modal-header">
                        <h2>📊 Vista Previa del Informe</h2>
                        <button class="report-modal-close" onclick="window.reportsManager.closePreview()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="report-modal-body">
                        <!-- Preview del informe -->
                        <div class="report-preview-container">
                            <iframe id="reportPreviewFrame" frameborder="0"></iframe>
                        </div>
                        
                        <!-- Panel de edición (opcional) -->
                        <div class="report-edit-panel hidden">
                            <h3>✏️ Editar Datos</h3>
                            <div id="reportEditFields"></div>
                        </div>
                    </div>
                    
                    <div class="report-modal-footer">
                        <button class="btn-secondary" onclick="window.reportsManager.requestChanges()">
                            <i class="fas fa-edit"></i> Solicitar Cambios
                        </button>
                        <button class="btn-primary" onclick="window.reportsManager.publishReport()">
                            <i class="fas fa-check"></i> Publicar Informe
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.previewModal = document.getElementById('reportPreviewModal');
        
        console.log('✅ Estructura del modal creada');
    }

    /**
     * Muestra el preview del informe
     * @param {Object} reportResponse - Respuesta del backend con reportHTML y reportData
     */
    showPreview(reportResponse) {
        console.log('📊 Mostrando preview del informe...');
        
        if (!reportResponse.reportHTML) {
            console.error('❌ No hay HTML del informe');
            return;
        }

        // Guardar datos actuales
        this.currentReport = reportResponse.reportHTML;
        this.currentReportData = reportResponse.reportData;

        // Mostrar HTML en iframe
        const iframe = document.getElementById('reportPreviewFrame');
        if (!iframe) {
            console.error('❌ Iframe no encontrado');
            return;
        }

        // Escribir HTML en el iframe
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(this.currentReport);
        iframeDoc.close();

        // Mostrar modal
        this.previewModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        console.log('✅ Preview mostrado');
    }

    /**
     * Cierra el modal de preview
     */
    closePreview() {
        if (this.previewModal) {
            this.previewModal.classList.add('hidden');
            document.body.style.overflow = '';
            console.log('✅ Preview cerrado');
        }
    }

    /**
     * Solicita cambios al informe (conversacional)
     */
    requestChanges() {
        console.log('✏️ Solicitando cambios...');
        
        // Cerrar modal
        this.closePreview();

        // Enfocar el chat input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.value = 'Quiero hacer algunos cambios al informe: ';
            chatInput.focus();
            
            // Mostrar mensaje de ayuda
            if (window.domusIA) {
                window.domusIA.addMessage('sofia', 
                    '✏️ Perfecto, dime qué cambios quieres hacer en el informe. Por ejemplo:\n\n' +
                    '• "Cambia el precio medio a 360.000€"\n' +
                    '• "Actualiza la descripción del inmueble"\n' +
                    '• "Añade información sobre el barrio"\n\n' +
                    'Te regeneraré el informe con los cambios.'
                );
            }
        }
    }

    /**
     * Publica el informe y genera URL compartible
     */
    async publishReport() {
        console.log('📤 Publicando informe...');

        if (!this.currentReport || !this.currentReportData) {
            console.error('❌ No hay informe para publicar');
            return;
        }

        // Mostrar loading
        const publishBtn = document.querySelector('.report-modal-footer .btn-primary');
        const originalText = publishBtn.innerHTML;
        publishBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publicando...';
        publishBtn.disabled = true;

        try {
            // Enviar al backend para guardar
            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    action: 'publish',
                    reportHTML: this.currentReport,
                    reportData: this.currentReportData,
                    userEmail: localStorage.getItem('userEmail') || 'guest@domus-ia.com'
                })
            });

            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();

            if (result.success && result.publicUrl) {
                console.log('✅ Informe publicado:', result.publicUrl);
                
                // Cerrar modal
                this.closePreview();

                // Mostrar mensaje de éxito con URL
                if (window.domusIA) {
                    window.domusIA.addMessage('sofia', 
                        `✅ **¡Informe publicado correctamente!**\n\n` +
                        `🔗 **URL para compartir:**\n` +
                        `[${result.publicUrl}](${result.publicUrl})\n\n` +
                        `📱 Puedes compartir este enlace con tu cliente por:\n` +
                        `• WhatsApp\n` +
                        `• Email\n` +
                        `• Redes sociales\n\n` +
                        `El informe se ve perfecto en móvil y ordenador. ✨`
                    );
                }

                // Copiar URL al portapapeles
                if (navigator.clipboard) {
                    navigator.clipboard.writeText(result.publicUrl);
                    this.showToast('📋 URL copiada al portapapeles');
                }

            } else {
                throw new Error(result.error || 'Error desconocido al publicar');
            }

        } catch (error) {
            console.error('❌ Error publicando informe:', error);
            
            if (window.domusIA) {
                window.domusIA.addMessage('sofia', 
                    `⚠️ No pude publicar el informe automáticamente.\n\n` +
                    `**Error:** ${error.message}\n\n` +
                    `Puedes guardar el informe manualmente o intentarlo de nuevo.`
                );
            }

            this.showToast('❌ Error al publicar informe', 'error');

        } finally {
            // Restaurar botón
            publishBtn.innerHTML = originalText;
            publishBtn.disabled = false;
        }
    }

    /**
     * Muestra un toast notification
     */
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: ${type === 'error' ? '#ef4444' : '#10b981'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.reportsManager = new ReportsManager();
        });
    } else {
        window.reportsManager = new ReportsManager();
    }
}
