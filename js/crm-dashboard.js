/**
 * DOMUS-IA CRM DASHBOARD
 * Sistema de gestión de propiedades inmobiliarias
 */

class CRMDashboard {
    constructor() {
        this.properties = [];
        this.filteredProperties = [];
        this.userEmail = null;
        this.userName = null;
        
        this.init();
    }
    
    /**
     * Inicializar el CRM
     */
    async init() {
        console.log('🏠 Inicializando CRM Dashboard...');
        
        // Verificar autenticación
        if (!this.checkAuth()) {
            window.location.href = 'index.html';
            return;
        }
        
        // Configurar navegación
        this.setupNavigation();
        
        // Configurar filtros
        this.setupFilters();
        
        // Configurar dropdown de exportación
        this.setupExportDropdown();
        
        // Cargar propiedades
        await this.loadProperties();
        
        console.log('✅ CRM Dashboard inicializado');
    }
    
    /**
     * Verificar autenticación del usuario
     */
    checkAuth() {
        // Intentar cargar desde authSystem
        if (window.authSystem && window.authSystem.isAuthenticated()) {
            const user = window.authSystem.getCurrentUser();
            this.userEmail = user.email;
            this.userName = user.name;
            
            // Actualizar UI
            document.getElementById('userName').textContent = this.userName;
            
            return true;
        }
        
        // Intentar cargar desde session
        const sessionData = localStorage.getItem('domusIA_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.userEmail = session.email;
                this.userName = session.name;
                
                // Actualizar UI
                document.getElementById('userName').textContent = this.userName;
                
                return true;
            } catch (error) {
                console.error('Error parseando sesión:', error);
            }
        }
        
        console.log('⚠️ Usuario no autenticado');
        return false;
    }
    
    /**
     * Configurar navegación entre secciones
     */
    setupNavigation() {
        const navItems = document.querySelectorAll('.crm-nav-item[data-section]');
        
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const section = item.dataset.section;
                this.showSection(section);
                
                // Actualizar active state
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }
    
    /**
     * Mostrar sección específica
     */
    showSection(section) {
        // Si selecciona Chat, redirigir a index.html
        if (section === 'chat') {
            window.location.href = 'index.html#chat';
            return;
        }
        
        // Ocultar todas las secciones
        document.querySelectorAll('.crm-section').forEach(s => {
            s.classList.remove('active');
        });
        
        // Mostrar sección seleccionada
        const sectionId = section + 'Section';
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement) {
            sectionElement.classList.add('active');
        }
        
        // Si es propiedades, actualizar lista
        if (section === 'properties') {
            this.renderProperties();
        }
    }
    
    /**
     * Configurar filtros y búsqueda
     */
    setupFilters() {
        const searchInput = document.getElementById('searchInput');
        const filterCity = document.getElementById('filterCity');
        const filterType = document.getElementById('filterType');
        const filterStatus = document.getElementById('filterStatus');
        const sortBy = document.getElementById('sortBy');
        
        // Debounce para búsqueda
        let searchTimeout;
        searchInput?.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                this.applyFilters();
            }, 300);
        });
        
        filterCity?.addEventListener('change', () => this.applyFilters());
        filterType?.addEventListener('change', () => this.applyFilters());
        filterStatus?.addEventListener('change', () => this.applyFilters());
        sortBy?.addEventListener('change', () => this.applyFilters());
    }
    
    /**
     * Aplicar filtros a las propiedades
     */
    applyFilters() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const cityFilter = document.getElementById('filterCity')?.value || '';
        const typeFilter = document.getElementById('filterType')?.value || '';
        const statusFilter = document.getElementById('filterStatus')?.value || '';
        const sortBy = document.getElementById('sortBy')?.value || '';
        
        // Filtrar
        this.filteredProperties = this.properties.filter(property => {
            // Búsqueda por texto
            const matchesSearch = !searchTerm || 
                property.address?.toLowerCase().includes(searchTerm) ||
                property.city?.toLowerCase().includes(searchTerm) ||
                property.description?.toLowerCase().includes(searchTerm);
            
            // Filtro por ciudad
            const matchesCity = !cityFilter || property.city === cityFilter;
            
            // Filtro por tipo
            const matchesType = !typeFilter || property.property_type === typeFilter;
            
            // Filtro por estado
            const matchesStatus = !statusFilter || property.status === statusFilter;
            
            return matchesSearch && matchesCity && matchesType && matchesStatus;
        });
        
        // Ordenar
        if (sortBy) {
            this.sortProperties(sortBy);
        }
        
        this.renderProperties();
    }
    
    /**
     * Ordenar propiedades según criterio
     * @param {String} sortBy - Criterio de ordenamiento
     */
    sortProperties(sortBy) {
        const [field, direction] = sortBy.split('_');
        
        this.filteredProperties.sort((a, b) => {
            let valueA, valueB;
            
            switch (field) {
                case 'created':
                    valueA = new Date(a.created_at || 0);
                    valueB = new Date(b.created_at || 0);
                    break;
                case 'price':
                    valueA = a.price || 0;
                    valueB = b.price || 0;
                    break;
                case 'surface':
                    valueA = a.surface_m2 || 0;
                    valueB = b.surface_m2 || 0;
                    break;
                case 'city':
                    valueA = (a.city || '').toLowerCase();
                    valueB = (b.city || '').toLowerCase();
                    break;
                default:
                    return 0;
            }
            
            // Comparar según dirección
            if (direction === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    }
    
    /**
     * Cargar propiedades desde la API
     */
    async loadProperties() {
        // Mostrar estado de carga
        const container = document.getElementById('propertiesList');
        if (container) {
            container.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: #6b7280;">
                    <div class="toast-loader" style="margin: 0 auto 16px; width: 40px; height: 40px; border-width: 4px;"></div>
                    <p style="font-size: 16px; font-weight: 500;">Cargando propiedades...</p>
                </div>
            `;
        }
        
        try {
            console.log('📥 Cargando propiedades...');
            
            const response = await fetch(`/api/properties?userEmail=${encodeURIComponent(this.userEmail)}`);
            const data = await response.json();
            
            if (response.ok && data.success) {
                this.properties = data.properties || [];
                this.filteredProperties = [...this.properties];
                
                console.log(`✅ ${this.properties.length} propiedades cargadas`);
                
                // Actualizar UI
                this.updateStats();
                this.populateCityFilter();
                this.renderProperties();
            } else {
                throw new Error(data.error || 'Error cargando propiedades');
            }
        } catch (error) {
            console.error('❌ Error cargando propiedades:', error);
            this.showError('Error al cargar las propiedades');
        }
    }
    
    /**
     * Actualizar estadísticas del dashboard
     */
    updateStats() {
        const total = this.properties.length;
        const available = this.properties.filter(p => p.status === 'disponible').length;
        const cities = new Set(this.properties.map(p => p.city).filter(Boolean)).size;
        const totalValue = this.properties.reduce((sum, p) => sum + (p.price || 0), 0);
        
        document.getElementById('statTotal').textContent = total;
        document.getElementById('statAvailable').textContent = available;
        document.getElementById('statCities').textContent = cities;
        document.getElementById('statValue').textContent = this.formatPrice(totalValue);
    }
    
    /**
     * Poblar filtro de ciudades
     */
    populateCityFilter() {
        const cities = [...new Set(this.properties.map(p => p.city).filter(Boolean))].sort();
        const filterCity = document.getElementById('filterCity');
        
        if (filterCity) {
            // Limpiar opciones existentes (excepto la primera)
            filterCity.innerHTML = '<option value="">Todas las ciudades</option>';
            
            cities.forEach(city => {
                const option = document.createElement('option');
                option.value = city;
                option.textContent = city;
                filterCity.appendChild(option);
            });
        }
    }
    
    /**
     * Renderizar lista de propiedades
     */
    renderProperties() {
        const container = document.getElementById('propertiesList');
        const loadingState = document.getElementById('loadingState');
        const emptyState = document.getElementById('emptyState');
        
        // Ocultar estados
        if (loadingState) loadingState.style.display = 'none';
        if (emptyState) emptyState.classList.add('hidden');
        
        // Limpiar propiedades existentes
        const existingCards = container.querySelectorAll('.property-card');
        existingCards.forEach(card => card.remove());
        
        // Si no hay propiedades
        if (this.filteredProperties.length === 0) {
            if (this.properties.length === 0) {
                // No hay propiedades en absoluto
                if (emptyState) emptyState.classList.remove('hidden');
            } else {
                // Hay propiedades pero no coinciden con filtros
                container.insertAdjacentHTML('beforeend', `
                    <div class="text-center py-12">
                        <i class="fas fa-filter text-4xl text-gray-300 mb-4"></i>
                        <p class="text-gray-600">No se encontraron propiedades con estos filtros</p>
                    </div>
                `);
            }
            return;
        }
        
        // Renderizar cada propiedad
        this.filteredProperties.forEach(property => {
            container.insertAdjacentHTML('beforeend', this.createPropertyCard(property));
        });
    }
    
    /**
     * Crear tarjeta HTML de propiedad
     */
    createPropertyCard(property) {
        const statusClass = property.status || 'disponible';
        const statusLabel = this.getStatusLabel(statusClass);
        
        return `
            <div class="property-card" data-property-id="${property.id}">
                <div class="property-header">
                    <div class="property-title">
                        <h3>${this.getPropertyTitle(property)}</h3>
                        <p class="property-address">
                            <i class="fas fa-map-marker-alt"></i>
                            ${property.address || 'Sin dirección'} ${property.city ? '• ' + property.city : ''}
                        </p>
                    </div>
                    <span class="property-badge ${statusClass}">${statusLabel}</span>
                </div>
                
                <div class="property-details">
                    ${property.price ? `
                        <div class="property-detail">
                            <i class="fas fa-euro-sign"></i>
                            <span>${this.formatPrice(property.price)}</span>
                        </div>
                    ` : ''}
                    ${property.surface_m2 ? `
                        <div class="property-detail">
                            <i class="fas fa-ruler-combined"></i>
                            <span>${property.surface_m2}m²</span>
                        </div>
                    ` : ''}
                    ${property.rooms ? `
                        <div class="property-detail">
                            <i class="fas fa-bed"></i>
                            <span>${property.rooms} hab.</span>
                        </div>
                    ` : ''}
                    ${property.bathrooms ? `
                        <div class="property-detail">
                            <i class="fas fa-bath"></i>
                            <span>${property.bathrooms} baños</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="property-actions">
                    <button onclick="crmDashboard.viewProperty('${property.id}')" class="btn-primary btn-sm">
                        <i class="fas fa-eye"></i> Ver
                    </button>
                    <button onclick="crmDashboard.editProperty('${property.id}')" class="btn-secondary btn-sm">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button onclick="crmDashboard.deleteProperty('${property.id}')" class="btn-danger btn-sm">
                        <i class="fas fa-trash"></i> Eliminar
                    </button>
                </div>
            </div>
        `;
    }
    
    /**
     * Ver detalles de propiedad
     */
    viewProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;
        
        const modalBody = document.getElementById('viewModalBody');
        modalBody.innerHTML = `
            <div class="space-y-4">
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">📍 Ubicación</h4>
                    <p class="text-gray-600">${property.address || 'Sin dirección'}</p>
                    <p class="text-gray-600">${property.city || 'Sin ciudad'}</p>
                </div>
                
                ${property.price ? `
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">💰 Precio</h4>
                        <p class="text-2xl font-bold text-gold-600">${this.formatPrice(property.price)}</p>
                    </div>
                ` : ''}
                
                <div>
                    <h4 class="font-semibold text-gray-700 mb-2">📊 Características</h4>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><strong>Tipo:</strong> ${property.property_type || 'Sin especificar'}</div>
                        <div><strong>Estado:</strong> ${this.getStatusLabel(property.status)}</div>
                        ${property.surface_m2 ? `<div><strong>Superficie:</strong> ${property.surface_m2}m²</div>` : ''}
                        ${property.rooms ? `<div><strong>Habitaciones:</strong> ${property.rooms}</div>` : ''}
                        ${property.bathrooms ? `<div><strong>Baños:</strong> ${property.bathrooms}</div>` : ''}
                    </div>
                </div>
                
                ${property.description ? `
                    <div>
                        <h4 class="font-semibold text-gray-700 mb-2">📝 Descripción</h4>
                        <p class="text-gray-600 text-sm">${property.description}</p>
                    </div>
                ` : ''}
                
                <div class="text-xs text-gray-400">
                    <p>ID: ${property.id}</p>
                    <p>Creado: ${new Date(property.created_at).toLocaleString('es-ES')}</p>
                </div>
            </div>
        `;
        
        this.openModal('viewModal');
    }
    
    /**
     * Editar propiedad
     */
    editProperty(propertyId) {
        const property = this.properties.find(p => p.id === propertyId);
        if (!property) return;
        
        // Rellenar formulario
        document.getElementById('editPropertyId').value = property.id;
        document.getElementById('editAddress').value = property.address || '';
        document.getElementById('editCity').value = property.city || '';
        document.getElementById('editType').value = property.property_type || 'piso';
        document.getElementById('editStatus').value = property.status || 'disponible';
        document.getElementById('editPrice').value = property.price || '';
        document.getElementById('editSurface').value = property.surface_m2 || '';
        document.getElementById('editRooms').value = property.rooms || '';
        document.getElementById('editBathrooms').value = property.bathrooms || '';
        document.getElementById('editDescription').value = property.description || '';
        
        this.openModal('editModal');
        
        // Configurar validación en tiempo real
        if (window.FormValidation) {
            setTimeout(() => {
                window.FormValidation.setupRealTimeValidation('editPropertyForm');
            }, 100);
        }
    }
    
    /**
     * Guardar cambios de propiedad
     */
    async savePropertyChanges(event) {
        event.preventDefault();
        
        const propertyId = document.getElementById('editPropertyId').value;
        const propertyData = {
            address: document.getElementById('editAddress').value,
            city: document.getElementById('editCity').value,
            property_type: document.getElementById('editType').value,
            status: document.getElementById('editStatus').value,
            price: document.getElementById('editPrice').value,
            surface_m2: document.getElementById('editSurface').value,
            rooms: document.getElementById('editRooms').value,
            bathrooms: document.getElementById('editBathrooms').value,
            description: document.getElementById('editDescription').value
        };
        
        // Validar formulario
        if (window.FormValidation) {
            const validation = window.FormValidation.validatePropertyForm(propertyData);
            
            if (!validation.isValid) {
                // Mostrar errores en el formulario
                window.FormValidation.displayErrors('editPropertyForm', validation.errors);
                
                // Mostrar toast con resumen de errores
                const errorCount = Object.keys(validation.errors).length;
                this.showError(
                    'Errores en el formulario', 
                    `Por favor corrige ${errorCount} ${errorCount === 1 ? 'error' : 'errores'} antes de continuar`
                );
                
                return;
            }
        }
        
        // Convertir valores numéricos
        propertyData.price = parseFloat(propertyData.price) || null;
        propertyData.surface_m2 = parseFloat(propertyData.surface_m2) || null;
        propertyData.rooms = parseInt(propertyData.rooms) || null;
        propertyData.bathrooms = parseInt(propertyData.bathrooms) || null;
        
        // Deshabilitar botón de guardar
        const submitBtn = event.target.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<div class="toast-loader" style="margin: 0 auto;"></div> Guardando...';
        }
        
        const loadingToast = this.showLoading('Guardando cambios', 'Actualizando propiedad...');
        
        try {
            const response = await fetch(`/api/properties?propertyId=${propertyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userEmail: this.userEmail,
                    propertyData
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Propiedad actualizada');
                
                // Actualizar toast de loading a success
                if (loadingToast) {
                    this.updateToast(loadingToast, 'success', 'Propiedad actualizada', 'Los cambios se guardaron correctamente');
                } else {
                    this.showSuccess('Propiedad actualizada', 'Los cambios se guardaron correctamente');
                }
                
                // Resetear estado de modificación del formulario
                if (window.resetFormModified) {
                    window.resetFormModified();
                }
                
                this.closeModal('editModal');
                await this.loadProperties();
            } else {
                throw new Error(data.error || 'Error actualizando propiedad');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            
            // Actualizar toast de loading a error
            if (loadingToast) {
                this.updateToast(loadingToast, 'error', 'Error al actualizar', error.message);
            } else {
                this.showError('Error al actualizar', error.message);
            }
        } finally {
            // Rehabilitar botón
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Guardar Cambios';
            }
        }
    }
    
    /**
     * Eliminar propiedad (mostrar confirmación)
     */
    deleteProperty(propertyId) {
        document.getElementById('deletePropertyId').value = propertyId;
        this.openModal('deleteModal');
    }
    
    /**
     * Confirmar eliminación
     */
    async confirmDelete() {
        const propertyId = document.getElementById('deletePropertyId').value;
        
        // Deshabilitar botón de eliminar
        const deleteBtn = document.querySelector('#deleteModal button[onclick*="confirmDelete"]');
        if (deleteBtn) {
            deleteBtn.disabled = true;
            deleteBtn.innerHTML = '<div class="toast-loader" style="margin: 0 auto;"></div> Eliminando...';
        }
        
        const loadingToast = this.showLoading('Eliminando propiedad', 'Por favor espera...');
        
        try {
            const response = await fetch('/api/properties', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userEmail: this.userEmail,
                    propertyId
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                console.log('✅ Propiedad eliminada');
                
                // Añadir clase de animación antes de eliminar
                const propertyCard = document.querySelector(`[data-property-id="${propertyId}"]`);
                if (propertyCard) {
                    propertyCard.classList.add('removing');
                    
                    // Esperar a que termine la animación
                    await new Promise(resolve => setTimeout(resolve, 300));
                }
                
                // Actualizar toast de loading a success
                if (loadingToast) {
                    this.updateToast(loadingToast, 'success', 'Propiedad eliminada', 'La propiedad se eliminó correctamente');
                } else {
                    this.showSuccess('Propiedad eliminada', 'La propiedad se eliminó correctamente');
                }
                
                this.closeModal('deleteModal');
                await this.loadProperties();
            } else {
                throw new Error(data.error || 'Error eliminando propiedad');
            }
        } catch (error) {
            console.error('❌ Error:', error);
            
            // Actualizar toast de loading a error
            if (loadingToast) {
                this.updateToast(loadingToast, 'error', 'Error al eliminar', error.message);
            } else {
                this.showError('Error al eliminar', error.message);
            }
        } finally {
            // Rehabilitar botón
            if (deleteBtn) {
                deleteBtn.disabled = false;
                deleteBtn.innerHTML = 'Eliminar';
            }
        }
    }
    
    /**
     * Utilidades
     */
    
    getPropertyTitle(property) {
        const type = property.property_type || 'Propiedad';
        const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
        return `${typeCapitalized} en ${property.city || 'Sin ubicación'}`;
    }
    
    getStatusLabel(status) {
        const labels = {
            disponible: 'Disponible',
            reservado: 'Reservado',
            vendido: 'Vendido'
        };
        return labels[status] || status;
    }
    
    formatPrice(price) {
        if (!price) return '0€';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(price);
    }
    
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    showSuccess(message, details = '') {
        if (window.Toast) {
            window.Toast.success(message, details);
        } else {
            alert('✅ ' + message);
        }
    }
    
    showError(message, details = '') {
        if (window.Toast) {
            window.Toast.error(message, details);
        } else {
            alert('❌ ' + message);
        }
    }
    
    showLoading(message, details = '') {
        if (window.Toast) {
            return window.Toast.loading(message, details);
        }
        return null;
    }
    
    updateToast(toastId, type, message, details = '') {
        if (window.Toast && toastId) {
            window.Toast.update(toastId, type, message, details);
        }
    }
    
    /**
     * 📊 Exportar vista actual (filtrada o completa)
     * @param {String} format - 'csv' o 'excel'
     */
    exportCurrentView(format = 'csv') {
        // Usar propiedades filtradas si hay filtros activos
        const propertiesToExport = this.filteredProperties.length > 0 
            ? this.filteredProperties 
            : this.properties;
        
        if (!window.CRMExport) {
            this.showError('Sistema de exportación no disponible', 'Por favor recarga la página');
            return;
        }
        
        if (format === 'excel') {
            window.CRMExport.exportToExcel(propertiesToExport);
        } else {
            window.CRMExport.exportToCSV(propertiesToExport);
        }
    }
    
    /**
     * 📊 Exportar resumen estadístico
     */
    exportSummaryReport() {
        if (!window.CRMExport) {
            this.showError('Sistema de exportación no disponible', 'Por favor recarga la página');
            return;
        }
        
        // Preparar estadísticas
        const stats = {
            total: this.properties.length,
            available: this.properties.filter(p => p.status === 'disponible').length,
            cities: new Set(this.properties.map(p => p.city).filter(Boolean)).size,
            totalValue: this.properties.reduce((sum, p) => sum + (p.price || 0), 0)
        };
        
        window.CRMExport.exportSummary(this.properties, stats);
    }
    
    /**
     * 🎯 Toggle del dropdown de exportación
     */
    setupExportDropdown() {
        const dropdownBtn = document.getElementById('exportDropdownBtn');
        const dropdown = document.getElementById('exportDropdown');
        
        if (!dropdownBtn || !dropdown) return;
        
        // Toggle dropdown
        dropdownBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdown.classList.toggle('hidden');
            dropdown.classList.toggle('show');
        });
        
        // Cerrar al hacer click fuera
        document.addEventListener('click', (e) => {
            if (!dropdown.classList.contains('hidden') && 
                !dropdown.contains(e.target) && 
                e.target !== dropdownBtn) {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('show');
            }
        });
        
        // Cerrar al hacer click en una opción
        dropdown.querySelectorAll('.export-option').forEach(option => {
            option.addEventListener('click', () => {
                dropdown.classList.add('hidden');
                dropdown.classList.remove('show');
            });
        });
    }
}

/**
 * Funciones globales
 */

function closeModal(modalId) {
    window.crmDashboard.closeModal(modalId);
}

async function savePropertyChanges(event) {
    await window.crmDashboard.savePropertyChanges(event);
}

async function confirmDelete() {
    await window.crmDashboard.confirmDelete();
}

function logout() {
    if (window.authSystem) {
        window.authSystem.logout();
    } else {
        localStorage.removeItem('domusIA_session');
        localStorage.removeItem('domusIAEspana_userData');
    }
    window.location.href = 'index.html';
}

function showNewPropertyModal() {
    alert('Esta funcionalidad estará disponible próximamente. Por ahora, usa el chat con Sofía para añadir propiedades automáticamente.');
}

/**
 * Inicializar cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
    window.crmDashboard = new CRMDashboard();
});
