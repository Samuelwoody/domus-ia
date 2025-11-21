// ============================================
// PERFIL PROFESIONAL - DOMUS-IA
// Gestión completa del perfil empresarial
// ============================================

// Estado global
let currentProfile = null;
let originalProfile = null;
let isEditMode = false;
let currentAgents = [];

// Cloudinary config
const CLOUDINARY_CLOUD_NAME = 'di5ecu2co'; // Cloud name correcto
const CLOUDINARY_UPLOAD_PRESET = 'domus_ia_logos'; // Preset específico para logos

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ Perfil Profesional - Inicializando...');
    
    // Verificar autenticación - LEER DE domusIA_session
    let userEmail = null;
    let userName = null;
    let userType = null;
    
    const authSession = localStorage.getItem('domusIA_session');
    if (authSession) {
        try {
            const session = JSON.parse(authSession);
            if (session.user && session.token) {
                userEmail = session.user.email;
                userName = session.user.name;
                userType = session.user.userType;
                console.log('✅ Usuario autenticado:', userName, `(${userType})`);
            }
        } catch (error) {
            console.error('Error leyendo sesión:', error);
        }
    }
    
    if (!userEmail) {
        console.log('❌ Usuario no autenticado');
        window.location.href = 'index.html'; // ✅ Redirigir a index para que haga login
        return;
    }
    
    // Verificar que sea profesional
    if (userType !== 'profesional') {
        console.log('❌ Usuario no es profesional');
        showToast('Solo usuarios profesionales pueden acceder a esta página', 'error');
        setTimeout(() => {
            window.location.href = 'crm.html';
        }, 2000);
        return;
    }
    
    // Actualizar nombre de usuario en header
    document.getElementById('userName').textContent = userName || 'Usuario';
    
    // Cargar perfil
    await loadProfile(userEmail);
    
    // Event listeners
    setupEventListeners();
    
    console.log('✅ Perfil Profesional - Listo');
});

// ============================================
// CARGAR PERFIL
// ============================================

async function loadProfile(email) {
    const loadingState = document.getElementById('loadingState');
    const profileContent = document.getElementById('profileContent');
    const emptyState = document.getElementById('emptyState');
    const errorState = document.getElementById('errorState');
    
    try {
        console.log('📥 Cargando perfil para:', email);
        
        const response = await fetch(`/api/professional-profile?email=${encodeURIComponent(email)}`);
        
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Datos recibidos:', data);
        
        if (data.profile && data.profile.onboarding_completed) {
            currentProfile = data.profile;
            originalProfile = JSON.parse(JSON.stringify(data.profile)); // Deep copy
            
            // Ocultar loading y mostrar perfil
            loadingState.style.display = 'none';
            profileContent.style.display = 'block';
            
            // Renderizar perfil
            renderProfile(currentProfile);
            
            showToast('Perfil cargado correctamente', 'success');
        } else {
            // Perfil no completado
            console.log('⚠️ Perfil no completado');
            loadingState.style.display = 'none';
            emptyState.style.display = 'flex';
        }
        
    } catch (error) {
        console.error('❌ Error cargando perfil:', error);
        loadingState.style.display = 'none';
        errorState.style.display = 'flex';
        document.getElementById('errorMessage').textContent = error.message;
    }
}

// ============================================
// RENDERIZAR PERFIL
// ============================================

function renderProfile(profile) {
    console.log('🎨 Renderizando perfil...', profile);
    
    // Sección Empresa
    document.getElementById('companyName').value = profile.company_name || '';
    document.getElementById('companySlogan').value = profile.company_slogan || '';
    
    // Logo
    if (profile.company_logo_url) {
        document.getElementById('logoImage').src = profile.company_logo_url;
        document.getElementById('logoImage').style.display = 'block';
        document.getElementById('logoPlaceholder').style.display = 'none';
        document.getElementById('removeLogoBtn').style.display = 'inline-flex';
    } else {
        document.getElementById('logoImage').style.display = 'none';
        document.getElementById('logoPlaceholder').style.display = 'flex';
        document.getElementById('removeLogoBtn').style.display = 'none';
    }
    
    // Sección Ubicación
    document.getElementById('streetAddress').value = profile.street_address || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('stateProvince').value = profile.state_province || '';
    document.getElementById('postalCode').value = profile.postal_code || '';
    document.getElementById('country').value = profile.country || 'España';
    
    // Sección Contacto
    document.getElementById('corporateEmail').value = profile.corporate_email || '';
    document.getElementById('corporatePhone').value = profile.corporate_phone || '';
    document.getElementById('mobilePhone').value = profile.mobile_phone || '';
    
    // Sección Redes Sociales
    document.getElementById('websiteUrl').value = profile.website_url || '';
    document.getElementById('facebookUrl').value = profile.facebook_url || '';
    document.getElementById('instagramUrl').value = profile.instagram_url || '';
    document.getElementById('linkedinUrl').value = profile.linkedin_url || '';
    document.getElementById('twitterUrl').value = profile.twitter_url || '';
    document.getElementById('youtubeUrl').value = profile.youtube_url || '';
    
    // Sección Gerente
    document.getElementById('managerName').value = profile.manager_name || '';
    document.getElementById('managerPosition').value = profile.manager_position || '';
    document.getElementById('managerEmail').value = profile.manager_email || '';
    document.getElementById('managerPhone').value = profile.manager_phone || '';
    document.getElementById('managerBio').value = profile.manager_bio || '';
    
    // Sección Agentes
    currentAgents = Array.isArray(profile.agents) ? profile.agents : [];
    renderAgents();
    
    // Footer - Fechas
    const updatedDate = profile.updated_at ? new Date(profile.updated_at).toLocaleString('es-ES') : '-';
    const createdDate = profile.created_at ? new Date(profile.created_at).toLocaleString('es-ES') : '-';
    document.getElementById('lastUpdated').textContent = updatedDate;
    document.getElementById('createdAt').textContent = createdDate;
}

// ============================================
// RENDERIZAR AGENTES
// ============================================

function renderAgents() {
    const agentsList = document.getElementById('agentsList');
    const noAgents = document.getElementById('noAgents');
    
    if (currentAgents.length === 0) {
        agentsList.style.display = 'none';
        noAgents.style.display = 'block';
    } else {
        agentsList.style.display = 'grid';
        noAgents.style.display = 'none';
        
        agentsList.innerHTML = currentAgents.map((agent, index) => `
            <div class="agent-card" data-index="${index}">
                <div class="agent-card-header">
                    <div>
                        <div class="agent-name">${agent.name || 'Sin nombre'}</div>
                        ${agent.specialty ? `<span class="agent-specialty">${agent.specialty}</span>` : ''}
                    </div>
                    <div class="agent-actions" style="display: ${isEditMode ? 'flex' : 'none'};">
                        <button class="agent-edit-btn" onclick="editAgent(${index})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="agent-delete-btn" onclick="deleteAgent(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="agent-info">
                    ${agent.email ? `
                        <div class="agent-info-item">
                            <i class="fas fa-envelope"></i>
                            <span>${agent.email}</span>
                        </div>
                    ` : ''}
                    ${agent.phone ? `
                        <div class="agent-info-item">
                            <i class="fas fa-phone"></i>
                            <span>${agent.phone}</span>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }
}

// ============================================
// EVENT LISTENERS
// ============================================

function setupEventListeners() {
    // Botón Editar
    document.getElementById('editBtn').addEventListener('click', enterEditMode);
    
    // Botón Guardar
    document.getElementById('saveBtn').addEventListener('click', saveProfile);
    
    // Botón Cancelar
    document.getElementById('cancelBtn').addEventListener('click', cancelEdit);
    
    // Logo upload
    document.getElementById('uploadLogoBtn').addEventListener('click', () => {
        document.getElementById('logoInput').click();
    });
    
    document.getElementById('logoInput').addEventListener('change', handleLogoUpload);
    
    document.getElementById('removeLogoBtn').addEventListener('click', removeLogo);
    
    // Añadir agente
    document.getElementById('addAgentBtn').addEventListener('click', openAddAgentModal);
    
    // Guardar agente desde modal
    document.getElementById('saveAgentBtn').addEventListener('click', saveAgent);
    
    // Cerrar modal con ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAgentModal();
        }
    });
}

// ============================================
// MODO EDICIÓN
// ============================================

function enterEditMode() {
    isEditMode = true;
    
    // Cambiar botones
    document.getElementById('editBtn').style.display = 'none';
    document.getElementById('saveBtn').style.display = 'inline-flex';
    document.getElementById('cancelBtn').style.display = 'inline-flex';
    
    // Habilitar campos
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        if (input.id !== 'companyName') { // Nombre de empresa no editable
            input.removeAttribute('readonly');
        }
    });
    
    // Mostrar acciones de logo
    document.getElementById('logoActions').style.display = 'flex';
    
    // Mostrar botón añadir agente
    document.getElementById('addAgentBtn').style.display = 'inline-flex';
    
    // Mostrar acciones de agentes
    renderAgents();
    
    showAlert('Modo edición activado. Realiza los cambios y guarda.', 'info');
}

function cancelEdit() {
    isEditMode = false;
    
    // Restaurar perfil original
    currentProfile = JSON.parse(JSON.stringify(originalProfile));
    currentAgents = Array.isArray(originalProfile.agents) ? originalProfile.agents : [];
    
    // Renderizar de nuevo
    renderProfile(currentProfile);
    
    // Cambiar botones
    document.getElementById('editBtn').style.display = 'inline-flex';
    document.getElementById('saveBtn').style.display = 'none';
    document.getElementById('cancelBtn').style.display = 'none';
    
    // Deshabilitar campos
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.setAttribute('readonly', true);
    });
    
    // Ocultar acciones
    document.getElementById('logoActions').style.display = 'none';
    document.getElementById('addAgentBtn').style.display = 'none';
    
    showAlert('Cambios cancelados', 'info');
}

// ============================================
// GUARDAR PERFIL
// ============================================

async function saveProfile() {
    console.log('💾 Guardando perfil...');
    
    // Validar campos obligatorios
    const companyName = document.getElementById('companyName').value.trim();
    const corporateEmail = document.getElementById('corporateEmail').value.trim();
    
    if (!companyName) {
        showAlert('El nombre de la empresa es obligatorio', 'error');
        return;
    }
    
    if (!corporateEmail) {
        showAlert('El email corporativo es obligatorio', 'error');
        return;
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(corporateEmail)) {
        showAlert('El email corporativo no es válido', 'error');
        return;
    }
    
    // Deshabilitar botón guardar
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        // Helper: Convertir strings vacíos a null
        const toNullIfEmpty = (value) => value && value.trim() !== '' ? value.trim() : null;
        
        // Recopilar datos del formulario
        const profileData = {
            company_name: companyName,
            company_slogan: toNullIfEmpty(document.getElementById('companySlogan').value),
            company_logo_url: document.getElementById('logoImage').src && document.getElementById('logoImage').src !== '' && document.getElementById('logoImage').src !== window.location.href ? document.getElementById('logoImage').src : null,
            
            street_address: toNullIfEmpty(document.getElementById('streetAddress').value),
            city: toNullIfEmpty(document.getElementById('city').value),
            state_province: toNullIfEmpty(document.getElementById('stateProvince').value),
            postal_code: toNullIfEmpty(document.getElementById('postalCode').value),
            country: toNullIfEmpty(document.getElementById('country').value) || 'España',
            
            corporate_email: corporateEmail,
            corporate_phone: toNullIfEmpty(document.getElementById('corporatePhone').value),
            mobile_phone: toNullIfEmpty(document.getElementById('mobilePhone').value),
            
            website_url: toNullIfEmpty(document.getElementById('websiteUrl').value),
            facebook_url: toNullIfEmpty(document.getElementById('facebookUrl').value),
            instagram_url: toNullIfEmpty(document.getElementById('instagramUrl').value),
            linkedin_url: toNullIfEmpty(document.getElementById('linkedinUrl').value),
            twitter_url: toNullIfEmpty(document.getElementById('twitterUrl').value),
            youtube_url: toNullIfEmpty(document.getElementById('youtubeUrl').value),
            
            manager_name: toNullIfEmpty(document.getElementById('managerName').value),
            manager_position: toNullIfEmpty(document.getElementById('managerPosition').value),
            manager_email: toNullIfEmpty(document.getElementById('managerEmail').value),
            manager_phone: toNullIfEmpty(document.getElementById('managerPhone').value),
            manager_bio: toNullIfEmpty(document.getElementById('managerBio').value),
            
            agents: currentAgents || []
        };
        
        console.log('📊 Datos a guardar:', profileData);
        
        // Llamar API - Obtener email de la sesión actual
        let userEmail = null;
        const authSession = localStorage.getItem('domusIA_session');
        if (authSession) {
            try {
                const session = JSON.parse(authSession);
                userEmail = session.user?.email;
            } catch (error) {
                console.error('Error leyendo sesión:', error);
            }
        }
        
        if (!userEmail) {
            throw new Error('No se pudo obtener el email del usuario');
        }
        
        // Primero verificar si el perfil existe
        const checkResponse = await fetch(`/api/professional-profile?email=${encodeURIComponent(userEmail)}`);
        let profileExists = false;
        
        if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            profileExists = checkData.profile !== null;
        }
        
        // Usar POST (crear) o PUT (actualizar) según corresponda
        const response = await fetch('/api/professional-profile', {
            method: profileExists ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: userEmail,
                profileData
            })
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ Error del servidor:', errorData);
            throw new Error(errorData.error || errorData.details || 'Error al guardar perfil');
        }
        
        const result = await response.json();
        console.log('✅ Perfil guardado:', result);
        
        // Actualizar estado
        currentProfile = result.profile;
        originalProfile = JSON.parse(JSON.stringify(result.profile));
        
        // Salir de modo edición
        isEditMode = false;
        document.getElementById('editBtn').style.display = 'inline-flex';
        document.getElementById('saveBtn').style.display = 'none';
        document.getElementById('cancelBtn').style.display = 'none';
        
        // Deshabilitar campos
        const inputs = document.querySelectorAll('.form-control');
        inputs.forEach(input => {
            input.setAttribute('readonly', true);
        });
        
        // Ocultar acciones
        document.getElementById('logoActions').style.display = 'none';
        document.getElementById('addAgentBtn').style.display = 'none';
        
        renderAgents();
        
        showAlert('✅ Perfil guardado correctamente', 'success');
        showToast('Perfil actualizado', 'success');
        
    } catch (error) {
        console.error('❌ Error guardando perfil:', error);
        showAlert(`Error al guardar: ${error.message}`, 'error');
        showToast('Error al guardar perfil', 'error');
    } finally {
        // Rehabilitar botón
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fas fa-save"></i> Guardar Cambios';
    }
}

// ============================================
// LOGO UPLOAD
// ============================================

async function handleLogoUpload(event) {
    const file = event.target.files[0];
    
    if (!file) return;
    
    // Validar tipo
    if (!file.type.startsWith('image/')) {
        showAlert('Solo se permiten archivos de imagen', 'error');
        return;
    }
    
    // Validar tamaño (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showAlert('El archivo es demasiado grande. Máximo 5MB', 'error');
        return;
    }
    
    console.log('📤 Subiendo logo a Cloudinary...');
    console.log('🔍 Cloud Name:', CLOUDINARY_CLOUD_NAME);
    console.log('🔍 Upload Preset:', CLOUDINARY_UPLOAD_PRESET);
    console.log('🔍 File:', file.name, file.type, file.size);
    showToast('Subiendo logo...', 'info');
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
        // Folder ya está definido en el preset (domus-ia/logos)
        
        const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
        console.log('🔍 URL:', url);
        
        const response = await fetch(url, {
            method: 'POST',
            body: formData
        });
        
        console.log('🔍 Response Status:', response.status);
        console.log('🔍 Response OK:', response.ok);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('❌ Error Response:', errorData);
            throw new Error(errorData?.error?.message || 'Error al subir imagen');
        }
        
        const data = await response.json();
        console.log('✅ Logo subido:', data.secure_url);
        
        // Actualizar preview
        document.getElementById('logoImage').src = data.secure_url;
        document.getElementById('logoImage').style.display = 'block';
        document.getElementById('logoPlaceholder').style.display = 'none';
        document.getElementById('removeLogoBtn').style.display = 'inline-flex';
        
        showToast('Logo subido correctamente', 'success');
        
    } catch (error) {
        console.error('❌ Error subiendo logo:', error);
        showAlert('Error al subir el logo', 'error');
        showToast('Error al subir logo', 'error');
    }
    
    // Limpiar input
    event.target.value = '';
}

function removeLogo() {
    if (confirm('¿Estás seguro de que quieres eliminar el logo?')) {
        document.getElementById('logoImage').src = '';
        document.getElementById('logoImage').style.display = 'none';
        document.getElementById('logoPlaceholder').style.display = 'flex';
        document.getElementById('removeLogoBtn').style.display = 'none';
        
        showToast('Logo eliminado', 'info');
    }
}

// ============================================
// GESTIÓN DE AGENTES
// ============================================

function openAddAgentModal() {
    document.getElementById('agentModalTitle').innerHTML = '<i class="fas fa-user-plus"></i> Añadir Agente';
    document.getElementById('agentEditIndex').value = '';
    document.getElementById('agentName').value = '';
    document.getElementById('agentEmail').value = '';
    document.getElementById('agentPhone').value = '';
    document.getElementById('agentSpecialty').value = '';
    
    document.getElementById('agentModal').classList.add('active');
}

function editAgent(index) {
    const agent = currentAgents[index];
    
    document.getElementById('agentModalTitle').innerHTML = '<i class="fas fa-user-edit"></i> Editar Agente';
    document.getElementById('agentEditIndex').value = index;
    document.getElementById('agentName').value = agent.name || '';
    document.getElementById('agentEmail').value = agent.email || '';
    document.getElementById('agentPhone').value = agent.phone || '';
    document.getElementById('agentSpecialty').value = agent.specialty || '';
    
    document.getElementById('agentModal').classList.add('active');
}

function saveAgent() {
    const name = document.getElementById('agentName').value.trim();
    
    if (!name) {
        showToast('El nombre del agente es obligatorio', 'error');
        return;
    }
    
    const agent = {
        name,
        email: document.getElementById('agentEmail').value.trim(),
        phone: document.getElementById('agentPhone').value.trim(),
        specialty: document.getElementById('agentSpecialty').value
    };
    
    const editIndex = document.getElementById('agentEditIndex').value;
    
    if (editIndex === '') {
        // Añadir nuevo
        currentAgents.push(agent);
        showToast('Agente añadido', 'success');
    } else {
        // Editar existente
        currentAgents[parseInt(editIndex)] = agent;
        showToast('Agente actualizado', 'success');
    }
    
    renderAgents();
    closeAgentModal();
}

function deleteAgent(index) {
    if (confirm('¿Estás seguro de que quieres eliminar este agente?')) {
        currentAgents.splice(index, 1);
        renderAgents();
        showToast('Agente eliminado', 'info');
    }
}

function closeAgentModal() {
    document.getElementById('agentModal').classList.remove('active');
}

// ============================================
// ALERTAS Y NOTIFICACIONES
// ============================================

function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;
    
    alertContainer.innerHTML = '';
    alertContainer.appendChild(alert);
    
    // Auto-hide después de 5 segundos
    setTimeout(() => {
        alert.remove();
    }, 5000);
}

function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-times-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span class="toast-message">${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-hide después de 3 segundos
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// ABRIR CHAT CON SOFÍA
// ============================================

function openChatWithMessage() {
    // Guardar mensaje en localStorage para que index.html lo detecte
    localStorage.setItem('pendingChatMessage', 'Hola Sofía, necesito completar mi perfil profesional. ¿Puedes ayudarme?');
    
    // Redirigir a index.html con hash al chat
    window.location.href = 'index.html#chat';
}

// ============================================
// LOGOUT
// ============================================

function logout() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Usar el sistema de autenticación global si existe
        if (window.authSystem) {
            window.authSystem.logout();
        } else {
            // Fallback: limpiar manualmente
            localStorage.clear();
            window.location.href = 'index.html'; // ✅ Redirigir a index
        }
    }
}
