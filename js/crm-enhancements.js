/**
 * 🎨 CRM Enhancements
 * Mejoras adicionales de UX para el CRM DomusIA
 * - Shortcuts de teclado
 * - Confirmación al salir sin guardar
 * - Contador de caracteres
 * - Prevención de pérdida de datos
 */

class CRMEnhancements {
    constructor() {
        this.formModified = false;
        this.originalFormData = {};
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupFormChangeDetection();
        this.setupCharacterCounter();
        this.setupModalEscapeKey();
    }

    /**
     * ⌨️ Shortcuts de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Esc para cerrar modales
            if (e.key === 'Escape') {
                this.handleEscapeKey(e);
            }

            // Ctrl+S / Cmd+S para guardar (solo en modales de edición)
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                this.handleSaveShortcut(e);
            }

            // Ctrl+F / Cmd+F para focus en búsqueda
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                this.handleSearchShortcut(e);
            }
        });

        console.log('⌨️ Keyboard shortcuts activados');
        console.log('   • Esc - Cerrar modales');
        console.log('   • Ctrl+S / Cmd+S - Guardar cambios');
        console.log('   • Ctrl+F / Cmd+F - Buscar propiedades');
    }

    /**
     * Manejar tecla Escape
     */
    handleEscapeKey(e) {
        // Buscar modales abiertos
        const modals = document.querySelectorAll('.modal:not(.hidden)');
        
        if (modals.length > 0) {
            e.preventDefault();
            
            // Cerrar el último modal abierto
            const lastModal = modals[modals.length - 1];
            const modalId = lastModal.id;
            
            // Si hay cambios sin guardar, preguntar
            if (modalId === 'editModal' && this.formModified) {
                if (confirm('¿Cerrar sin guardar cambios?')) {
                    this.closeModalWithId(modalId);
                    this.formModified = false;
                }
            } else {
                this.closeModalWithId(modalId);
            }
        }
    }

    /**
     * Manejar Ctrl+S para guardar
     */
    handleSaveShortcut(e) {
        const editModal = document.getElementById('editModal');
        
        if (editModal && !editModal.classList.contains('hidden')) {
            e.preventDefault();
            
            // Trigger submit del formulario
            const form = document.getElementById('editPropertyForm');
            if (form) {
                console.log('⌨️ Ctrl+S detectado - Guardando cambios...');
                form.requestSubmit();
            }
        }
    }

    /**
     * Manejar Ctrl+F para búsqueda
     */
    handleSearchShortcut(e) {
        const propertiesSection = document.getElementById('propertiesSection');
        
        if (propertiesSection && propertiesSection.classList.contains('active')) {
            e.preventDefault();
            
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.focus();
                searchInput.select();
                console.log('⌨️ Ctrl+F detectado - Focus en búsqueda');
            }
        }
    }

    /**
     * Cerrar modal por ID
     */
    closeModalWithId(modalId) {
        if (window.crmDashboard) {
            window.crmDashboard.closeModal(modalId);
        } else {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('hidden');
            }
        }
    }

    /**
     * 🔔 Detectar cambios en formulario (prevenir pérdida de datos)
     */
    setupFormChangeDetection() {
        const form = document.getElementById('editPropertyForm');
        
        if (form) {
            // Guardar datos originales cuando se abre el modal
            const observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                        const editModal = document.getElementById('editModal');
                        
                        if (editModal && !editModal.classList.contains('hidden')) {
                            // Modal se acaba de abrir
                            setTimeout(() => {
                                this.saveOriginalFormData();
                                this.formModified = false;
                            }, 100);
                        }
                    }
                });
            });

            const editModal = document.getElementById('editModal');
            if (editModal) {
                observer.observe(editModal, { attributes: true });
            }

            // Detectar cambios en campos
            form.addEventListener('input', () => {
                if (!this.formModified) {
                    this.formModified = true;
                    console.log('📝 Formulario modificado - Confirmación activada');
                }
            });

            form.addEventListener('change', () => {
                if (!this.formModified) {
                    this.formModified = true;
                }
            });
        }
    }

    /**
     * Guardar datos originales del formulario
     */
    saveOriginalFormData() {
        const form = document.getElementById('editPropertyForm');
        if (!form) return;

        const formData = new FormData(form);
        this.originalFormData = {};
        
        for (let [key, value] of formData.entries()) {
            this.originalFormData[key] = value;
        }
    }

    /**
     * 🔢 Contador de caracteres en descripción
     */
    setupCharacterCounter() {
        const descriptionField = document.getElementById('editDescription');
        
        if (descriptionField) {
            // Crear contador
            const counter = document.createElement('div');
            counter.id = 'descriptionCounter';
            counter.className = 'character-counter';
            counter.style.cssText = `
                text-align: right;
                font-size: 12px;
                color: #6b7280;
                margin-top: 4px;
            `;
            
            // Insertar después del textarea
            descriptionField.parentNode.insertBefore(counter, descriptionField.nextSibling);
            
            // Actualizar contador
            const updateCounter = () => {
                const current = descriptionField.value.length;
                const max = 2000;
                const remaining = max - current;
                
                counter.textContent = `${current} / ${max} caracteres`;
                
                // Cambiar color si se acerca al límite
                if (remaining < 100) {
                    counter.style.color = '#ef4444'; // Rojo
                } else if (remaining < 200) {
                    counter.style.color = '#f59e0b'; // Amarillo
                } else {
                    counter.style.color = '#6b7280'; // Gris
                }
            };
            
            // Actualizar en cada input
            descriptionField.addEventListener('input', updateCounter);
            
            // Actualizar inicialmente
            setTimeout(updateCounter, 100);
        }
    }

    /**
     * 🚪 Prevenir cierre de ventana con cambios sin guardar
     */
    setupBeforeUnloadWarning() {
        window.addEventListener('beforeunload', (e) => {
            if (this.formModified) {
                e.preventDefault();
                e.returnValue = ''; // Chrome requiere esto
                return '¿Cerrar sin guardar cambios?';
            }
        });
    }

    /**
     * Configurar escape en modales
     */
    setupModalEscapeKey() {
        // Ya manejado en setupKeyboardShortcuts
    }

    /**
     * Resetear estado de modificación (llamar tras guardar)
     */
    resetFormModified() {
        this.formModified = false;
        console.log('✅ Estado de formulario reseteado');
    }
}

// Instancia global
const CRMEnhance = new CRMEnhancements();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.CRMEnhance = CRMEnhance;
}

// Función helper para resetear tras guardar (llamar desde crm-dashboard.js)
window.resetFormModified = function() {
    if (window.CRMEnhance) {
        window.CRMEnhance.resetFormModified();
    }
};

console.log('✨ CRM Enhancements cargado');
