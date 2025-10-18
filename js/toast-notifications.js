/**
 * 🍞 Toast Notifications System
 * Sistema de notificaciones tipo toast para DomusIA CRM
 * 
 * Uso:
 * Toast.success('Operación exitosa', 'La propiedad se guardó correctamente');
 * Toast.error('Error', 'No se pudo cargar la propiedad');
 * Toast.warning('Advertencia', 'Algunos campos están vacíos');
 * Toast.info('Información', 'Tienes 5 propiedades sin precio');
 * 
 * Con duración personalizada:
 * Toast.success('Guardado', 'Todo bien', { duration: 5000 });
 * 
 * Sin auto-cerrar:
 * Toast.error('Error crítico', 'Verifica la conexión', { duration: 0 });
 */

class ToastNotification {
    constructor() {
        this.container = null;
        this.toasts = [];
        this.init();
    }

    /**
     * Inicializar contenedor de toasts
     */
    init() {
        // Crear contenedor si no existe
        if (!document.getElementById('toast-container')) {
            this.container = document.createElement('div');
            this.container.id = 'toast-container';
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        } else {
            this.container = document.getElementById('toast-container');
        }
    }

    /**
     * Mostrar toast
     * @param {string} type - success, error, warning, info, loading
     * @param {string} title - Título del mensaje
     * @param {string} message - Mensaje detallado (opcional)
     * @param {object} options - Opciones adicionales
     */
    show(type, title, message = '', options = {}) {
        const defaults = {
            duration: 3000, // 3 segundos por defecto (0 = no auto-cerrar)
            closeable: true, // Mostrar botón de cerrar
            progress: true // Mostrar barra de progreso
        };

        const config = { ...defaults, ...options };

        // Crear elemento toast
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        // ID único para el toast
        const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        toast.id = toastId;

        // Icono según tipo
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>',
            loading: '<div class="toast-loader"></div>'
        };

        // HTML del toast
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || icons.info}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            ${config.closeable ? `
                <button class="toast-close" onclick="Toast.close('${toastId}')">
                    ×
                </button>
            ` : ''}
            ${config.progress && config.duration > 0 ? `
                <div class="toast-progress" style="width: 100%;"></div>
            ` : ''}
        `;

        // Añadir al contenedor
        this.container.appendChild(toast);
        this.toasts.push({ id: toastId, element: toast });

        // Trigger animación de entrada
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Barra de progreso
        if (config.progress && config.duration > 0) {
            const progressBar = toast.querySelector('.toast-progress');
            if (progressBar) {
                progressBar.style.transition = `width ${config.duration}ms linear`;
                setTimeout(() => {
                    progressBar.style.width = '0%';
                }, 50);
            }
        }

        // Auto-cerrar
        if (config.duration > 0) {
            setTimeout(() => {
                this.close(toastId);
            }, config.duration);
        }

        return toastId;
    }

    /**
     * Cerrar toast específico
     */
    close(toastId) {
        const toastData = this.toasts.find(t => t.id === toastId);
        if (!toastData) return;

        const toast = toastData.element;
        toast.classList.remove('show');
        toast.classList.add('hide');

        setTimeout(() => {
            if (toast.parentElement) {
                toast.parentElement.removeChild(toast);
            }
            this.toasts = this.toasts.filter(t => t.id !== toastId);
        }, 300);
    }

    /**
     * Cerrar todos los toasts
     */
    closeAll() {
        this.toasts.forEach(({ id }) => this.close(id));
    }

    /**
     * Toast de éxito
     */
    success(title, message = '', options = {}) {
        return this.show('success', title, message, options);
    }

    /**
     * Toast de error
     */
    error(title, message = '', options = {}) {
        return this.show('error', title, message, { ...options, duration: options.duration || 5000 });
    }

    /**
     * Toast de advertencia
     */
    warning(title, message = '', options = {}) {
        return this.show('warning', title, message, options);
    }

    /**
     * Toast de información
     */
    info(title, message = '', options = {}) {
        return this.show('info', title, message, options);
    }

    /**
     * Toast de carga (sin auto-cerrar)
     */
    loading(title, message = '', options = {}) {
        return this.show('loading', title, message, { 
            ...options, 
            duration: 0, 
            closeable: false,
            progress: false
        });
    }

    /**
     * Actualizar toast existente (útil para cambiar loading a success/error)
     */
    update(toastId, type, title, message = '') {
        const toastData = this.toasts.find(t => t.id === toastId);
        if (!toastData) return;

        const toast = toastData.element;
        
        // Actualizar clase
        toast.className = `toast toast-${type} show`;

        // Iconos
        const icons = {
            success: '<i class="fas fa-check-circle"></i>',
            error: '<i class="fas fa-times-circle"></i>',
            warning: '<i class="fas fa-exclamation-triangle"></i>',
            info: '<i class="fas fa-info-circle"></i>'
        };

        // Actualizar contenido
        const iconEl = toast.querySelector('.toast-icon');
        const titleEl = toast.querySelector('.toast-title');
        const messageEl = toast.querySelector('.toast-message');

        if (iconEl) iconEl.innerHTML = icons[type] || icons.info;
        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        // Añadir botón de cerrar si no existe
        if (!toast.querySelector('.toast-close')) {
            const closeBtn = document.createElement('button');
            closeBtn.className = 'toast-close';
            closeBtn.onclick = () => this.close(toastId);
            closeBtn.innerHTML = '×';
            toast.appendChild(closeBtn);
        }

        // Auto-cerrar después de 3 segundos
        setTimeout(() => {
            this.close(toastId);
        }, 3000);
    }

    /**
     * Toast con promesa (útil para operaciones async)
     * Muestra loading, luego cambia a success/error según resultado
     */
    async promise(promise, messages = {}) {
        const defaults = {
            loading: 'Cargando...',
            success: 'Operación exitosa',
            error: 'Error en la operación'
        };

        const msgs = { ...defaults, ...messages };

        const toastId = this.loading(msgs.loading);

        try {
            const result = await promise;
            this.update(toastId, 'success', msgs.success);
            return result;
        } catch (error) {
            this.update(toastId, 'error', msgs.error, error.message);
            throw error;
        }
    }
}

// Instancia global
const Toast = new ToastNotification();

// Exportar para uso global
if (typeof window !== 'undefined') {
    window.Toast = Toast;
}

// Ejemplos de uso:
/*
// Básico
Toast.success('¡Guardado!', 'La propiedad se guardó correctamente');

// Con duración personalizada (5 segundos)
Toast.error('Error', 'No se pudo conectar', { duration: 5000 });

// Sin auto-cerrar (requiere click manual)
Toast.warning('Atención', 'Revisa los datos', { duration: 0 });

// Toast de carga
const loadingToast = Toast.loading('Guardando...', 'Por favor espera');
// Después de la operación:
Toast.update(loadingToast, 'success', '¡Listo!', 'Propiedad guardada');

// Con promesa (auto-maneja loading/success/error)
await Toast.promise(
    fetch('/api/properties').then(r => r.json()),
    {
        loading: 'Cargando propiedades...',
        success: 'Propiedades cargadas',
        error: 'Error al cargar'
    }
);
*/
