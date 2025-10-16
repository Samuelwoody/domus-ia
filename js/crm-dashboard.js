/**
 * 🏠 DOMUS-IA CRM DASHBOARD
 * @version 2.0
 */

class CRMDashboard {
    constructor() {
        this.userEmail = null;
        this.properties = [];
        this.contacts = [];
        this.tasks = [];
        
        this.init();
    }
    
    async init() {
        this.loadUserData();
        await this.loadAllData();
        this.renderDashboard();
    }
    
    loadUserData() {
        const userData = localStorage.getItem('domusIAEspana_userData');
        if (userData) {
            const data = JSON.parse(userData);
            this.userEmail = data.userEmail;
        }
    }
    
    async loadAllData() {
        if (!this.userEmail) {
            this.loadMockData();
            return;
        }
        
        try {
            const res = await fetch(`/api/properties?userEmail=${this.userEmail}`);
            if (res.ok) {
                const data = await res.json();
                this.properties = data.properties || [];
            }
        } catch (error) {
            console.error('Error:', error);
            this.loadMockData();
        }
    }
    
    loadMockData() {
        this.properties = [
            {
                id: '1',
                address: 'Calle Goya 45',
                city: 'Madrid',
                property_type: 'piso',
                price: 350000,
                surface_m2: 120,
                rooms: 3,
                bathrooms: 2,
                status: 'disponible'
            }
        ];
    }
    
    renderDashboard() {
        document.getElementById('stat-properties').textContent = this.properties.length;
        document.getElementById('stat-contacts').textContent = this.contacts.length;
        document.getElementById('stat-tasks').textContent = this.tasks.length;
        
        const totalValue = this.properties.reduce((sum, p) => sum + (p.price || 0), 0);
        document.getElementById('stat-value').textContent = this.formatPrice(totalValue);
    }
    
    renderProperties() {
        const grid = document.getElementById('propertiesGrid');
        
        if (this.properties.length === 0) {
            grid.innerHTML = `
                <div class="col-span-full text-center py-16">
                    <p class="text-gray-400 mb-4">No hay propiedades</p>
                    <button onclick="openSofiaChat()" class="bg-gradient-to-r from-domus-gold to-domus-accent text-white px-6 py-3 rounded-lg">
                        Hablar con Sofía
                    </button>
                </div>
            `;
            return;
        }
        
        grid.innerHTML = this.properties.map(p => this.createPropertyCard(p)).join('');
    }
    
    createPropertyCard(property) {
        const typeIcons = {
            piso: 'fa-building',
            casa: 'fa-home',
            local: 'fa-store',
            terreno: 'fa-mountain'
        };
        
        return `
            <div class="property-card p-4">
                <div class="bg-gradient-to-br from-domus-gold to-domus-accent h-40 rounded-lg flex items-center justify-center mb-4">
                    <i class="fas ${typeIcons[property.property_type] || 'fa-building'} text-white text-5xl"></i>
                </div>
                <div class="flex justify-between items-start mb-2">
                    <h3 class="font-semibold text-gray-900">${property.address}</h3>
                    <span class="property-status status-${property.status}">${property.status}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${property.city || ''}</p>
                <div class="flex justify-between text-sm text-gray-600 mb-3">
                    <span>${this.formatPrice(property.price)}</span>
                    <span>${property.surface_m2}m²</span>
                </div>
                <button onclick="talkAboutProperty('${property.id}')" class="w-full bg-gradient-to-r from-domus-gold to-domus-accent text-white py-2 rounded-lg text-sm">
                    <i class="fas fa-comment-dots mr-2"></i>Hablar con Sofía
                </button>
            </div>
        `;
    }
    
    formatPrice(price) {
        if (!price) return '0€';
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'EUR',
            maximumFractionDigits: 0
        }).format(price);
    }
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.add('hidden');
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const selectedTab = document.getElementById(`${tabName}-tab`);
    if (selectedTab) {
        selectedTab.classList.remove('hidden');
        selectedTab.classList.add('active');
    }
    
    const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedBtn) {
        selectedBtn.classList.add('active');
    }
    
    if (tabName === 'properties') {
        window.crmDashboard.renderProperties();
    }
}

function openSofiaChat() {
    window.location.href = 'index.html#chat';
}

function talkAboutProperty(propertyId) {
    localStorage.setItem('crm_context_property', propertyId);
    window.location.href = 'index.html#chat';
}

document.addEventListener('DOMContentLoaded', () => {
    window.crmDashboard = new CRMDashboard();
});
