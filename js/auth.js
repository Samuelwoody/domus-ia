// js/auth.js
// Sistema de autenticación - Los usuarios NO necesitan API keys

class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.token = null;
        this.loadSession();
    }

    // Cargar sesión desde localStorage
    loadSession() {
        const sessionData = localStorage.getItem('domusIA_session');
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                this.currentUser = session.user;
                this.token = session.token;
                console.log('✅ Sesión cargada:', this.currentUser.name);
            } catch (error) {
                console.error('Error cargando sesión:', error);
                this.clearSession();
            }
        }
    }

    // Guardar sesión
    saveSession() {
        const sessionData = {
            user: this.currentUser,
            token: this.token
        };
        localStorage.setItem('domusIA_session', JSON.stringify(sessionData));
    }

    // Limpiar sesión
    clearSession() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('domusIA_session');
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return this.currentUser !== null && this.token !== null;
    }

    // Registrar nuevo usuario
    async register(userData) {
        try {
            const { name, email, password, userType, businessDocument } = userData;

            // Validaciones frontend
            if (!name || !email || !password || !userType) {
                throw new Error('Todos los campos son requeridos');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            if (password.length < 6) {
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            if (userType === 'profesional' && !businessDocument) {
                throw new Error('Los profesionales deben proporcionar CIF/NIF');
            }

            // Llamar al backend
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    userType,
                    businessDocument: businessDocument || null
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al registrar usuario');
            }

            // Guardar sesión
            this.currentUser = data.user;
            this.token = data.token;
            this.saveSession();

            console.log('✅ Usuario registrado:', this.currentUser.name);

            return {
                success: true,
                user: this.currentUser,
                message: data.demo ? 'Cuenta creada en modo demo' : 'Cuenta creada exitosamente'
            };

        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }

    // Iniciar sesión
    async login(email, password) {
        try {
            // Validaciones frontend
            if (!email || !password) {
                throw new Error('Email y contraseña requeridos');
            }

            if (!this.isValidEmail(email)) {
                throw new Error('Email inválido');
            }

            // Llamar al backend
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Error al iniciar sesión');
            }

            // Guardar sesión
            this.currentUser = data.user;
            this.token = data.token;
            this.saveSession();

            console.log('✅ Login exitoso:', this.currentUser.name);

            return {
                success: true,
                user: this.currentUser,
                message: 'Sesión iniciada'
            };

        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    }

    // Cerrar sesión
    logout() {
        console.log('👋 Cerrando sesión:', this.currentUser.name);
        this.clearSession();
        window.location.reload(); // Recargar página
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obtener token para requests autenticados
    getAuthHeader() {
        return {
            'Authorization': `Bearer ${this.token}`
        };
    }

    // Validar email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    // Verificar si es profesional
    isProfessional() {
        return this.currentUser?.userType === 'profesional';
    }

    // Verificar si es particular
    isParticular() {
        return this.currentUser?.userType === 'particular';
    }

    // Obtener información del plan
    getPlanInfo() {
        if (!this.currentUser) return null;
        
        return {
            plan: this.currentUser.subscriptionPlan || 'free',
            status: this.currentUser.subscriptionStatus || 'active',
            usage: this.currentUser.usage || {
                messages: 0,
                dalle: 0,
                vision: 0,
                documents: 0
            }
        };
    }
}

// Exportar instancia global
window.AuthSystem = AuthSystem;
window.authSystem = new AuthSystem();

// Funciones globales para usar en HTML
window.showRegisterModal = function() {
    document.getElementById('registerModal')?.classList.remove('hidden');
};

window.showLoginModal = function() {
    document.getElementById('loginModal')?.classList.remove('hidden');
};

window.closeAuthModals = function() {
    document.getElementById('registerModal')?.classList.add('hidden');
    document.getElementById('loginModal')?.classList.add('hidden');
};

window.handleRegister = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!submitBtn) {
        console.error('❌ Submit button not found');
        return;
    }
    
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Registrando...';
        
        // Validar que authSystem esté disponible
        if (!window.authSystem) {
            throw new Error('Sistema de autenticación no disponible. Recarga la página.');
        }
        
        const userData = {
            name: form.name.value,
            email: form.email.value,
            password: form.password.value,
            userType: form.userType.value,
            businessDocument: form.businessDocument?.value || null
        };
        
        console.log('📝 Iniciando registro con datos:', {
            ...userData,
            password: '***' // No loguear la contraseña
        });
        
        const result = await window.authSystem.register(userData);
        
        console.log('✅ Registro completado:', result);
        
        alert(result.message);
        window.closeAuthModals();
        
        // Forzar actualización UI inmediata
        if (window.domusIA) {
            window.domusIA.loadUserData();
            window.domusIA.updateUI();
        }
        
        // Recargar página para actualizar UI
        setTimeout(() => window.location.reload(), 500);
        
    } catch (error) {
        console.error('❌ Error en handleRegister:', error);
        alert('Error: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};

window.handleLogin = async function(event) {
    event.preventDefault();
    
    const form = event.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    if (!submitBtn) {
        console.error('❌ Submit button not found');
        return;
    }
    
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Iniciando sesión...';
        
        // Validar que authSystem esté disponible
        if (!window.authSystem) {
            throw new Error('Sistema de autenticación no disponible. Recarga la página.');
        }
        
        const email = form.email.value;
        const password = form.password.value;
        
        console.log('🔐 Iniciando login para:', email);
        
        const result = await window.authSystem.login(email, password);
        
        console.log('✅ Login completado:', result);
        
        alert(result.message);
        window.closeAuthModals();
        
        // Forzar actualización UI inmediata
        if (window.domusIA) {
            window.domusIA.loadUserData();
            window.domusIA.updateUI();
        }
        
        // Recargar página para actualizar UI
        setTimeout(() => window.location.reload(), 500);
        
    } catch (error) {
        console.error('❌ Error en handleLogin:', error);
        alert('Error: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
};

window.handleLogout = function() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
        window.authSystem.logout();
    }
};

// Mostrar/ocultar campo de CIF según tipo de usuario
window.toggleBusinessDocument = function(select) {
    const businessDocField = document.getElementById('businessDocumentField');
    if (businessDocField) {
        if (select.value === 'profesional') {
            businessDocField.classList.remove('hidden');
            businessDocField.querySelector('input').required = true;
        } else {
            businessDocField.classList.add('hidden');
            businessDocField.querySelector('input').required = false;
        }
    }
};

console.log('🔐 Sistema de autenticación inicializado');
