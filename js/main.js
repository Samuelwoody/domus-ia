// Domus-IA España - Main JavaScript
// Author: MontCastell-AI
// Version: 1.0.0

class DomusIA {
    constructor() {
        this.isAuthenticated = false;
        this.userType = null; // 'particular', 'profesional', or null
        this.userName = null;
        this.userEmail = null; // ← NUEVO: Para memoria persistente CRM
        this.subscriptionPlan = 'free'; // 'free', 'particular', 'profesional'
        this.dailyMessageCount = 0;
        this.dailyMessageLimit = 15;
        this.apiKey = null; // Will be set when user subscribes
        this.conversationHistory = [];
        
        // File upload properties
        this.currentFile = null;
        this.currentFileType = null;
        this.currentDocumentText = null;
        
        // Initialize Sofia AI
        this.sofiaAI = new SofiaAI();
        
        // 🏠 CRM: Property Detector (inicializar solo si la clase existe)
        this.propertyDetector = null;
        if (typeof PropertyDetector !== 'undefined') {
            this.propertyDetector = new PropertyDetector();
        }
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.updateUI();
        this.startCountdown();
        this.loadConversationHistory();
        
        // Abrir chat automáticamente si viene de CRM
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('openChat') === 'true') {
            setTimeout(() => {
                this.openChat();
                // Limpiar el parámetro de la URL
                window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
            }, 500);
        }
    }

    // ===== USER DATA MANAGEMENT =====
    loadUserData() {
        // PRIORIDAD 1: Leer desde sesión de auth.js (nuevo sistema)
        const authSession = localStorage.getItem('domusIA_session');
        if (authSession) {
            try {
                const session = JSON.parse(authSession);
                if (session.user && session.token) {
                    this.isAuthenticated = true;
                    this.userName = session.user.name;
                    this.userEmail = session.user.email;
                    this.userType = session.user.userType;
                    this.subscriptionPlan = session.user.subscriptionPlan || 'free';
                    console.log('✅ Usuario cargado desde auth session:', this.userName);
                    
                    // Migrar dailyMessageCount del sistema legacy si existe
                    const legacyData = localStorage.getItem('domusIAEspana_userData');
                    if (legacyData) {
                        const legacy = JSON.parse(legacyData);
                        this.dailyMessageCount = legacy.dailyMessageCount || 0;
                        this.apiKey = legacy.apiKey || null;
                        
                        // Reset daily count if it's a new day
                        const lastUsageDate = legacy.lastUsageDate;
                        const today = new Date().toDateString();
                        if (lastUsageDate !== today) {
                            this.dailyMessageCount = 0;
                        }
                    }
                    return;
                }
            } catch (error) {
                console.error('Error leyendo auth session:', error);
            }
        }
        
        // FALLBACK: Leer de userData legacy (sistema antiguo)
        const userData = localStorage.getItem('domusIAEspana_userData');
        if (userData) {
            try {
                const data = JSON.parse(userData);
                this.isAuthenticated = data.isAuthenticated || false;
                this.userType = data.userType || null;
                this.userName = data.userName || null;
                this.userEmail = data.userEmail || null;
                this.subscriptionPlan = data.subscriptionPlan || 'free';
                this.dailyMessageCount = data.dailyMessageCount || 0;
                this.apiKey = data.apiKey || null;
                
                // Reset daily count if it's a new day
                const lastUsageDate = data.lastUsageDate;
                const today = new Date().toDateString();
                if (lastUsageDate !== today) {
                    this.dailyMessageCount = 0;
                    this.saveUserData();
                }
                console.log('📦 Usuario cargado desde userData legacy:', this.userName);
            } catch (error) {
                console.error('Error cargando userData legacy:', error);
            }
        }
    }

    saveUserData() {
        const userData = {
            isAuthenticated: this.isAuthenticated,
            userType: this.userType,
            userName: this.userName,
            userEmail: this.userEmail, // ← NUEVO
            subscriptionPlan: this.subscriptionPlan,
            dailyMessageCount: this.dailyMessageCount,
            apiKey: this.apiKey,
            lastUsageDate: new Date().toDateString()
        };
        localStorage.setItem('domusIAEspana_userData', JSON.stringify(userData));
    }

    loadConversationHistory() {
        const history = localStorage.getItem('domusIAEspana_conversation');
        if (history) {
            this.conversationHistory = JSON.parse(history);
        }
    }

    saveConversationHistory() {
        localStorage.setItem('domusIAEspana_conversation', JSON.stringify(this.conversationHistory));
    }

    // ===== EVENT BINDING =====
    bindEvents() {
        // Navigation
        const startChatBtn = document.getElementById('startChatBtn');
        if (startChatBtn) {
            startChatBtn.addEventListener('click', () => this.openChat());
        }
        
        // Login/Register ahora usan funciones globales de auth.js (onclick en HTML)
        // document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal('login'));
        // document.getElementById('registerBtn').addEventListener('click', () => this.showAuthModal('register'));
        
        // Mobile menu
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        const mobileLoginBtn = document.getElementById('mobileLoginBtn');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.toggle('fa-bars');
                icon.classList.toggle('fa-times');
            });
            
            // Close menu when clicking on links
            mobileMenu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    const icon = mobileMenuBtn.querySelector('i');
                    icon.classList.remove('fa-times');
                    icon.classList.add('fa-bars');
                });
            });
        }
        
        // Mobile login ahora usa función global de auth.js (onclick en HTML)
        // if (mobileLoginBtn) {
        //     mobileLoginBtn.addEventListener('click', (e) => {
        //         e.preventDefault();
        //         this.showAuthModal('login');
        //     });
        // }
        
        // Chat functionality
        const closeChatBtn = document.getElementById('closeChatBtn');
        const chatForm = document.getElementById('chatForm');
        
        if (closeChatBtn) {
            closeChatBtn.addEventListener('click', () => this.closeChat());
            console.log('✅ Event listener para closeChatBtn añadido correctamente');
        } else {
            console.error('❌ ERROR: No se encuentra el elemento closeChatBtn');
        }
        
        if (chatForm) {
            chatForm.addEventListener('submit', (e) => this.handleChatSubmit(e));
        }
        
        // File upload buttons
        this.initFileUpload();
        
        // Voice recording
        this.initVoiceRecording();
        
        // Modal backdrop clicks
        const chatModal = document.getElementById('chatModal');
        if (chatModal) {
            chatModal.addEventListener('click', (e) => {
                if (e.target.id === 'chatModal') this.closeChat();
            });
        }

        // Pricing and action buttons (will be added dynamically)
        this.bindActionButtons();

        // Smooth scrolling for navigation
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.closeChat();
            if (e.ctrlKey && e.key === 'k') {
                e.preventDefault();
                this.openChat();
            }
        });
    }

    // ===== UI UPDATES =====
    updateUI() {
        this.updateMessageCounter();
        this.updateAuthButtons();
    }

    updateMessageCounter() {
        const counter = document.getElementById('messageCount');
        if (counter) {
            counter.textContent = this.dailyMessageCount;
            
            // Update plan info
            const planInfo = this.subscriptionPlan === 'free' ? 
                `${this.dailyMessageCount}/15 (Plan Gratuito)` :
                'Ilimitado (Plan Premium)';
            
            counter.parentElement.innerHTML = `Mensajes hoy: <span id="messageCount">${this.dailyMessageCount}</span>/${this.subscriptionPlan === 'free' ? '15' : '∞'} (${this.subscriptionPlan === 'free' ? 'Plan Gratuito' : 'Plan Premium'})`;
        }
    }

    showAccountPanel() {
        // Crear modal de cuenta de usuario
        let accountModal = document.getElementById('accountModal');
        if (!accountModal) {
            accountModal = document.createElement('div');
            accountModal.id = 'accountModal';
            accountModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
            accountModal.innerHTML = `
                <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                    <button onclick="document.getElementById('accountModal').remove()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                        <i class="fas fa-times text-xl"></i>
                    </button>
                    
                    <h2 class="text-2xl font-bold text-domus-navy mb-4">Mi Cuenta</h2>
                    
                    <div class="space-y-4">
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-domus-sage">Nombre</p>
                            <p class="font-semibold text-domus-navy">${this.userName || 'Usuario'}</p>
                        </div>
                        
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-domus-sage">Email</p>
                            <p class="font-semibold text-domus-navy">${this.userEmail || 'No disponible'}</p>
                        </div>
                        
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-domus-sage">Tipo de cuenta</p>
                            <p class="font-semibold text-domus-navy capitalize">${this.userType || 'Particular'}</p>
                        </div>
                        
                        <div class="p-4 bg-gray-50 rounded-lg">
                            <p class="text-sm text-domus-sage">Plan</p>
                            <p class="font-semibold text-domus-navy">${this.subscriptionPlan === 'free' ? 'Plan Gratuito' : 'Plan Premium'}</p>
                        </div>
                        
                        <button onclick="if(confirm('¿Seguro que deseas cerrar sesión?')) window.authSystem.logout();" 
                                class="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors">
                            <i class="fas fa-sign-out-alt mr-2"></i>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            `;
            document.body.appendChild(accountModal);
        } else {
            accountModal.classList.remove('hidden');
        }
    }
    
    updateAuthButtons() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const crmNavLink = document.getElementById('crmNavLink');
        const crmNavLinkMobile = document.getElementById('crmNavLinkMobile');
        
        if (this.isAuthenticated && this.userName) {
            loginBtn.textContent = `Hola, ${this.userName}`;
            registerBtn.textContent = 'Mi Cuenta';
            
            // Cambiar el onclick de registerBtn a mostrar panel de cuenta
            registerBtn.onclick = () => this.showAccountPanel();
            
            // Mostrar links de CRM en navegación
            if (crmNavLink) crmNavLink.classList.remove('hidden');
            if (crmNavLinkMobile) crmNavLinkMobile.classList.remove('hidden');
            
            // Añadir botón al CRM si no existe
            if (!document.getElementById('crmBtn')) {
                const crmBtn = document.createElement('a');
                crmBtn.id = 'crmBtn';
                crmBtn.href = 'crm.html';
                crmBtn.className = 'bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:opacity-90 transition-all text-sm md:text-base inline-flex items-center gap-2';
                crmBtn.innerHTML = '<i class="fas fa-th-large"></i><span class="hidden md:inline">Mi CRM</span>';
                
                // Insertar antes del botón de registro
                registerBtn.parentElement.insertBefore(crmBtn, registerBtn);
            }
        } else {
            loginBtn.textContent = 'Acceder';
            registerBtn.textContent = 'Comenzar Gratis';
            
            // Restaurar el onclick original
            registerBtn.onclick = () => showRegisterModal();
            
            // Ocultar links de CRM en navegación
            if (crmNavLink) crmNavLink.classList.add('hidden');
            if (crmNavLinkMobile) crmNavLinkMobile.classList.add('hidden');
            
            // Remover botón CRM si existe
            const crmBtn = document.getElementById('crmBtn');
            if (crmBtn) {
                crmBtn.remove();
            }
        }
    }

    // ===== CHAT FUNCTIONALITY =====
    openChat() {
        const chatModal = document.getElementById('chatModal');
        chatModal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        document.body.classList.add('chat-open');
        
        // Initialize chat if empty
        const messagesContainer = document.getElementById('chatMessages');
        if (messagesContainer.children.length === 0) {
            this.initializeChat();
        }
        
        // Setup mobile keyboard handling
        this.setupMobileKeyboardHandling();
        
        // Bind voice button if it wasn't bound during initial load
        if (typeof bindVoiceButtonIfNeeded === 'function') {
            bindVoiceButtonIfNeeded();
        }
        
        // Focus on input (delayed for mobile)
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, this.isMobile() ? 300 : 100);
    }

    closeChat() {
        console.log('🔴 Cerrando chat...');
        const chatModal = document.getElementById('chatModal');
        if (!chatModal) {
            console.error('❌ ERROR: No se encuentra el elemento chatModal');
            return;
        }
        
        chatModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
        document.body.classList.remove('chat-open');
        
        // Clean up mobile keyboard handling
        this.cleanupMobileKeyboardHandling();
        
        // Blur input to close keyboard on mobile
        const chatInput = document.getElementById('chatInput');
        if (chatInput) {
            chatInput.blur();
        }
        
        console.log('✅ Chat cerrado correctamente');
    }

    initializeChat() {
        const welcomeMessage = this.getWelcomeMessage();
        this.addMessage('assistant', welcomeMessage, false);
        
        // API status check removed - GPT-4o is always active
        // No need to show demo message since backend is configured
    }

    getWelcomeMessage() {
        // Mensaje base con explicación de capacidades
        const voiceCapabilities = `

💡 **Dos formas de interactuar conmigo:**

🔊 **Arriba a la derecha** verás un botón blanco. Si lo activas, podrás **escuchar mis mensajes** en vez de leerlos. Perfecto si prefieres audio mientras haces otras cosas.

🎤 **Abajo junto al campo de texto** hay un botón de micrófono. **Úsalo para hablar en vez de escribir:**
- Haz click en el micrófono y empieza a hablar
- Cuando hagas una pausa de más de 1.5 segundos, lo que dijiste se escribirá automáticamente
- Para continuar tu mensaje: respira, vuelve a hacer click en el micrófono y sigue hablando
- Cuando termines todo tu mensaje, dale a enviar

¡Así es mucho más cómodo! 😊`;

        if (!this.isAuthenticated) {
            return `¡Hola! Soy Sofía, tu SuperAgente Inmobiliario General.${voiceCapabilities}

Para brindarte la mejor ayuda, ¿podrías decirme tu nombre y si eres propietario particular o agente profesional?`;
        }
        
        if (this.userType === 'particular') {
            return `¡Hola ${this.userName}! Como propietario particular, puedo ayudarte con estudios de mercado, preparación de tu inmueble, documentación, publicaciones de calidad y todo el proceso de venta.${voiceCapabilities}

¿En qué puedo asistirte hoy?`;
        } else if (this.userType === 'profesional') {
            return `¡Hola ${this.userName}! Como agente profesional, puedo ayudarte con formación avanzada, construcción de marca, captación premium, estrategias de negociación y todas las herramientas para hacer crecer tu negocio.${voiceCapabilities}

¿Qué necesitas?`;
        }
        
        return `¡Hola! Soy Sofía, tu SuperAgente Inmobiliario.${voiceCapabilities}

¿En qué puedo ayudarte hoy?`;
    }

    async handleChatSubmit(e) {
        e.preventDefault();
        
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        // Permitir envío si hay mensaje o archivo
        if (!message && !this.currentFile) return;
        
        // 🧠 DETECCIÓN INTELIGENTE: ¿Usuario especificó qué hacer con imagen?
        const hasMessage = message && message.trim().length > 0;
        const hasImage = this.currentFileType === 'image';
        
        // Si hay imagen + mensaje, guardar para decisión inteligente
        if (hasImage && hasMessage) {
            this.lastUserMessageWithImage = message;
        }
        
        // Si no hay mensaje pero sí archivo, usar mensaje por defecto
        const finalMessage = message || (this.currentFileType === 'image' ? 
            '¿Qué ves en esta imagen?' : 
            'Por favor analiza este documento');
        
        // Verificar límites de mensajes
        
        // 🔥 NUEVA LÓGICA: Enviar tanto archivo como URL de Cloudinary
        // Vision API necesita la imagen en CADA mensaje
        // Replicate puede buscar en historial
        const hasCloudinaryUrl = !!this.currentUploadedImageUrl;
        const cloudinaryUrlToSend = hasCloudinaryUrl ? this.currentUploadedImageUrl : null;
        
        // Siempre enviar el archivo si existe (para Vision API)
        const fileToProcess = this.currentFile;
        const fileTypeToProcess = this.currentFileType;
        const documentTextToProcess = this.currentDocumentText; // 🔥 GUARDAR TEXTO EXTRAÍDO
        
        console.log('📤 Enviando mensaje:', {
            hasCloudinaryUrl: hasCloudinaryUrl,
            cloudinaryUrl: this.currentUploadedImageUrl,
            willSendFile: !!fileToProcess,
            fileType: fileTypeToProcess
        });
        
        // Clear input and file
        input.value = '';
        this.clearFileUpload();
        
        // 🔥 NO LIMPIAR currentUploadedImageUrl AQUÍ
        // La URL permanece disponible para mensajes subsecuentes ("añade muebles", etc.)
        // El backend la encontrará en el historial de conversación
        
        // Add user message (con indicador de archivo si existe)
        let displayMessage = finalMessage;
        if (fileToProcess) {
            const fileIcon = fileTypeToProcess === 'image' ? '🖼️' : '📄';
            displayMessage = `${fileIcon} ${finalMessage}\n<small class="text-gray-500">${fileToProcess.name}</small>`;
        }
        this.addMessage('user', displayMessage);
        
        // Update message count
        this.dailyMessageCount++;
        this.saveUserData();
        this.updateMessageCounter();
        
        // 📧 EMAIL CAPTURE: Incrementar contador de mensajes
        if (window.emailCapture) {
            window.emailCapture.incrementMessageCount();
        }
        
        // Detectar si el mensaje pide generar una imagen
        const isImageRequest = this.detectImageRequest(finalMessage);
        console.log('🔍 Mensaje:', finalMessage);
        console.log('🎨 ¿Es petición de imagen?', isImageRequest);
        
        // Show typing indicator (con mensaje especial si es generación de imagen)
        this.showTypingIndicator(isImageRequest);
        
        try {
            // Process message with file if exists (y URL de Cloudinary si está disponible)
            const response = await this.processMessage(finalMessage, fileToProcess, fileTypeToProcess, documentTextToProcess, cloudinaryUrlToSend);
            this.hideTypingIndicator();
            
            // Add message with typing effect
            this.addMessage('assistant', response, true);
            
            // 🏠 CRM: Detectar si hay propiedad en la conversación
            this.detectPropertyInConversation(finalMessage, response);
            
            // Save conversation
            this.conversationHistory.push(
                { role: 'user', content: finalMessage, timestamp: new Date().toISOString() },
                { role: 'assistant', content: response, timestamp: new Date().toISOString() }
            );
            this.saveConversationHistory();
            
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage('assistant', 'Disculpa, he tenido un problema técnico. ¿Podrías repetir tu mensaje?', false);
            console.error('Chat error:', error);
        }
    }

    detectImageRequest(message) {
        const lowerMessage = message.toLowerCase();
        const imageKeywords = [
            'crea una imagen', 'genera una imagen', 'genera una foto', 'crea una foto',
            'muestra cómo se vería', 'muestra como se veria', 'diseña un', 'disena un',
            'quiero ver', 'haz una imagen', 'genera un render', 'crea un render',
            'muéstrame', 'muestrame', 'visualiza', 'crea un diseño', 'crea un diseno',
            'crea un', 'genera un', 'haz un', 'dibuja', 'diseña', 'disena',
            'imagen de', 'foto de', 'render de', 'visualización de', 'visualizacion de'
        ];
        
        return imageKeywords.some(keyword => lowerMessage.includes(keyword));
    }

    async processMessage(message, file = null, fileType = null, documentText = null, cloudinaryUrl = null) {
        // Handle document analysis if message starts with DOCUMENTO:
        if (message.startsWith('DOCUMENTO:')) {
            const docContent = message.replace('DOCUMENTO:', '').trim();
            if (this.sofiaAI.isAPIConfigured()) {
                try {
                    const analysis = await this.sofiaAI.analyzeDocument(docContent);
                    return `📄 **Análisis de Documento Completado**\n\n${analysis}`;
                } catch (error) {
                    return "No he podido analizar el documento completamente. Te puedo dar consejos generales sobre documentación inmobiliaria.";
                }
            } else {
                return "Para análisis detallado de documentos necesitas el plan premium. Te puedo dar consejos generales sobre qué buscar en documentos inmobiliarios.";
            }
        }
        
        // Detect user type if not authenticated
        if (!this.isAuthenticated) {
            const userInfo = this.detectUserFromMessage(message);
            if (userInfo.name || userInfo.type) {
                return this.handleUserRegistration(userInfo, message);
            }
        }
        
        // Check for advanced features requests
        const advancedResponse = await this.handleAdvancedFeatures(message);
        if (advancedResponse) {
            return advancedResponse;
        }
        
        // Process with AI (con archivo y URL de Cloudinary si existen)
        return await this.generateAIResponse(message, file, fileType, documentText, cloudinaryUrl);
    }

    detectUserFromMessage(message) {
        const lowerMessage = message.toLowerCase();
        const nameMatch = message.match(/(?:me llamo|soy|mi nombre es)\s+([a-záéíóúüñ]+)/i);
        
        let type = null;
        let name = nameMatch ? nameMatch[1] : null;
        
        // Detect user type
        if (lowerMessage.includes('particular') || lowerMessage.includes('propietario') || lowerMessage.includes('vendo mi casa') || lowerMessage.includes('quiero vender')) {
            type = 'particular';
        } else if (lowerMessage.includes('profesional') || lowerMessage.includes('agente') || lowerMessage.includes('inmobiliario') || lowerMessage.includes('trabajo en') || lowerMessage.includes('soy del sector')) {
            type = 'profesional';
        }
        
        return { name, type };
    }

    handleUserRegistration(userInfo, originalMessage) {
        if (userInfo.name) {
            this.userName = userInfo.name;
            this.isAuthenticated = true;
        }
        
        if (userInfo.type) {
            this.userType = userInfo.type;
        }
        
        // ← NUEVO: Pedir email para CRM (opcional, no bloqueante)
        if (!this.userEmail && this.userName) {
            setTimeout(() => {
                const email = prompt(`${this.userName}, para poder guardar tu historial y propiedades, ¿cuál es tu email? (opcional, puedes cancelar)`);
                if (email && email.includes('@')) {
                    this.userEmail = email;
                    this.saveUserData();
                    console.log('✅ Email guardado para memoria CRM');
                }
            }, 2000); // Esperar 2s para no ser intrusivo
        }
        
        this.saveUserData();
        this.updateAuthButtons();
        
        if (this.userType === 'particular') {
            return `¡Perfecto, ${this.userName || 'propietario'}! Como propietario particular, puedo ayudarte en todo el proceso de venta: desde el estudio de mercado hasta la firma en notaría. Te ofrezco consejos sobre preparación del inmueble, documentación necesaria, estrategias de precio y negociación con compradores. ¿Qué aspecto te interesa más?`;
        } else if (this.userType === 'profesional') {
            return `¡Excelente, ${this.userName || 'profesional'}! Como agente inmobiliario, tengo formación especializada de MontCastell-AI para ayudarte a construir tu marca, captar clientes premium, gestionar encargos VIP y cerrar más ventas. Puedo asesorarte en construcción de empresa, imagen corporativa, estrategias de captación y negociación avanzada. ¿En qué área quieres empezar?`;
        }
        
        return `Gracias ${this.userName || ''}. Para personalizar mejor mi ayuda, ¿podrías decirme si eres propietario particular que quiere vender o agente inmobiliario profesional?`;
    }

    async generateAIResponse(message, file = null, fileType = null, documentText = null, cloudinaryUrl = null) {
        // Try to use Vercel/Netlify Function (ChatGPT real via backend)
        const endpoints = [
            '/api/chat',                      // Vercel
            '/.netlify/functions/chat'        // Netlify (fallback)
        ];

        for (const endpoint of endpoints) {
            try {
                // 🧠 HISTORIAL COMPLETO: Enviar últimos 10 mensajes para contexto
                const recentHistory = this.conversationHistory.slice(-10); // Últimos 10 mensajes
                const messagesWithHistory = [
                    ...recentHistory,
                    { role: 'user', content: message }
                ];
                
                // Preparar body con archivo si existe
                const requestBody = {
                    messages: messagesWithHistory, // Historial completo en lugar de solo mensaje actual
                    userType: this.userType,
                    userName: this.userName,
                    userEmail: this.userEmail, // ← NUEVO: Para memoria persistente CRM
                    userPlan: this.subscriptionPlan || 'particular',
                    webSearch: 'auto'  // Búsqueda automática cuando sea necesario
                };
                
                // Añadir imagen si existe
                if (file && fileType === 'image') {
                    console.log('👁️ Enviando imagen para análisis Vision...');
                    const base64 = await this.fileToBase64(file);
                    requestBody.imageFile = base64.split(',')[1]; // Quitar prefijo data:image...
                }
                
                // 🔥 FIX: Si hay URL de Cloudinary, enviarla para Vision API
                // Nota: Esto permite que GPT-4o vea la imagen subida a Cloudinary
                if (cloudinaryUrl) {
                    console.log('🌐 Enviando URL de Cloudinary para Vision API:', cloudinaryUrl);
                    requestBody.imageUrl = cloudinaryUrl;
                }
                
                // Añadir documento si existe
                if (file && fileType === 'document') {
                    console.log('📄 Enviando documento para análisis...');
                    console.log('📄 documentText recibido:', !!documentText);
                    console.log('📄 Longitud documentText:', documentText?.length || 0);
                    
                    // Usar texto extraído si está disponible
                    if (documentText && documentText.trim().length > 0) {
                        const wordCount = documentText.split(/\s+/).filter(w => w.length > 0).length;
                        console.log(`📄 Texto extraído: ${wordCount} palabras`);
                        console.log(`📄 Primeros 100 chars:`, documentText.substring(0, 100));
                        
                        // Limitar a primeras 8000 palabras para no exceder límites de tokens
                        const words = documentText.split(/\s+/).filter(w => w.length > 0);
                        const limitedText = words.slice(0, 8000).join(' ');
                        
                        requestBody.documentText = `[Documento: ${file.name}]\n\n${limitedText}`;
                        
                        if (words.length > 8000) {
                            requestBody.documentText += `\n\n[NOTA: Documento truncado. Mostrando primeras 8000 de ${words.length} palabras totales]`;
                        }
                    } else {
                        // Fallback si no se pudo extraer texto
                        console.error('❌ documentText vacío o null');
                        requestBody.documentText = `[Documento: ${file.name} - ${(file.size/1024).toFixed(1)}KB]\n\nNOTA: No se pudo extraer el texto del documento.`;
                    }
                }
                
                console.log('🚀 Enviando request al backend:', {
                    endpoint: endpoint,
                    hasImageFile: !!requestBody.imageFile,
                    hasImageUrl: !!requestBody.imageUrl,
                    hasDocumentText: !!requestBody.documentText
                });
                
                const response = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(requestBody)
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success) {
                        let logMessage = '✅ ChatGPT Real (GPT-4o)';
                        if (data.visionUsed) logMessage += ' + Vision API';
                        if (data.webSearchUsed) logMessage += ' + Web Search';
                        logMessage += ' - Tokens: ' + data.tokensUsed;
                        
                        console.log(logMessage);
                        
                        // Añadir fuentes si hay búsqueda web
                        let finalMessage = data.message;
                        if (data.webSearchUsed && data.sources && data.sources.length > 0) {
                            finalMessage += '\n\n---\n📚 **Fuentes consultadas:**\n';
                            data.sources.forEach((source, i) => {
                                finalMessage += `${i + 1}. [${source.title}](${source.url})\n`;
                            });
                        }
                        
                        // 🎨 NUEVA LÓGICA: Function Calling automático desde backend
                        // Si el backend ya generó/editó la imagen (DALL-E o Replicate), mostrarla
                        if (data.imageUrl && (data.dalleUsed || data.replicateUsed || data.imageEdited)) {
                            const imageSource = data.replicateUsed ? 'Replicate SDXL (edición real)' : 
                                              data.dalleUsed ? 'DALL-E 3 (generación)' : 'IA';
                            
                            console.log(`✅ Backend usó ${imageSource} - Imagen lista:`, data.imageUrl);
                            console.log('🖼️ URL de la imagen:', data.imageUrl);
                            
                            if (data.structurePreserved) {
                                console.log('🏗️ Estructura original preservada ✓');
                            }
                            
                            // Guardar referencia a imageUrl para usarla después del efecto typing
                            this.pendingImageUrl = data.imageUrl;
                            this.pendingImageData = data;
                        }
                        
                        // 🎨 FALLBACK: Detección manual (por si Function Calling falla)
                        // Si Sofía dice que va a generar una imagen pero no vino imageUrl, usar método anterior
                        const imageGenTriggers = [
                            'voy a generar',
                            'generaré',
                            'te generaré',
                            'voy a crear',
                            'crearé',
                            'te crearé',
                            'te genero',
                            'te creo',
                            'haré una imagen',
                            'haré un render',
                            'crear una imagen',
                            'generar una imagen',
                            'crear un render',
                            'generar un render',
                            'visualizar',
                            'visualizaré',
                            'diseñaré',
                            'voy a diseñar'
                        ];
                        
                        const shouldGenerateImage = imageGenTriggers.some(trigger => 
                            finalMessage.toLowerCase().includes(trigger)
                        );
                        
                        // Solo usar fallback si NO vino imageUrl del backend
                        if (shouldGenerateImage && !data.imageUrl) {
                            console.log('🎨 Sofía quiere generar imagen - Activando DALL-E automáticamente...');
                            
                            // Extraer descripción de la imagen del mensaje
                            let imagePrompt = message; // Usar mensaje original del usuario como base
                            
                            // ⚠️ IMPORTANTE: Esperar un momento para que el DOM se actualice completamente
                            // Esto asegura que el mensaje de Sofía esté completamente renderizado
                            setTimeout(async () => {
                                try {
                                    // Obtener el último mensaje de Sofía
                                    const messagesContainer = document.getElementById('chatMessages');
                                    const allMessages = messagesContainer.querySelectorAll('.chat-message.assistant');
                                    const lastSofiaMessage = allMessages[allMessages.length - 1];
                                    
                                    if (!lastSofiaMessage) {
                                        console.error('❌ No se encontró el mensaje de Sofía para insertar la imagen');
                                        return;
                                    }
                                    
                                    const contentDiv = lastSofiaMessage.querySelector('.message-content');
                                    if (!contentDiv) {
                                        console.error('❌ No se encontró el contenido del mensaje');
                                        return;
                                    }
                                    
                                    // Crear un ID único para este proceso de generación
                                    const generationId = 'dalle-' + Date.now();
                                    
                                    // Insertar indicador de carga MINIMALISTA con colores de la paleta
                                    const loadingHtml = `<div id="${generationId}" class="dalle-loading-container" style="margin-top: 16px; padding: 20px; background: rgba(212, 175, 55, 0.03); border-radius: 12px; border: 1px dashed rgba(212, 175, 55, 0.3); backdrop-filter: blur(10px);">
                                        <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                                            <div style="animation: spin 1.5s linear infinite;">
                                                <svg style="width: 32px; height: 32px; color: #d4af37;" fill="none" viewBox="0 0 24 24">
                                                    <circle style="opacity: 0.2;" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3"></circle>
                                                    <path style="opacity: 0.8;" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                            </div>
                                            <div style="text-align: center;">
                                                <p style="font-size: 13px; font-weight: 500; color: #2c0a0e; margin-bottom: 4px;">Creando imagen...</p>
                                                <p style="font-size: 11px; color: #6b7280;">Esto puede tardar 10-15 segundos</p>
                                            </div>
                                        </div>
                                    </div>`;
                                    
                                    contentDiv.insertAdjacentHTML('beforeend', loadingHtml);
                                    this.scrollToBottom();
                                    
                                    console.log('✅ Indicador de carga insertado correctamente');
                                    console.log('🎨 Generando imagen con DALL-E:', imagePrompt);
                                    
                                    // Generar imagen con DALL-E
                                    const imageUrl = await this.sofiaAI.generateImage(imagePrompt);
                                    
                                    console.log('✅ Imagen generada:', imageUrl);
                                    
                                    // Buscar y eliminar el indicador de carga
                                    const loadingElement = document.getElementById(generationId);
                                    if (loadingElement) {
                                        loadingElement.remove();
                                        console.log('✅ Indicador de carga eliminado');
                                    }
                                    
                                    if (imageUrl) {
                                        // Insertar imagen generada con botones de acción
                                        const isPermanent = data.isPermanent !== false; // Por defecto true si no se especifica
                                        const permanentBadge = isPermanent ? '<span style="font-size: 9px; color: #10b981; font-weight: 600;">✓ Enlace permanente</span>' : '<span style="font-size: 9px; color: #f59e0b; font-weight: 600;">⚠ Enlace temporal (1h)</span>';
                                        
                                        const imageHtml = `<div class="generated-image-container" style="margin-top: 16px; position: relative;">
                                            <img src="${imageUrl}" alt="Imagen generada por DALL-E 3" 
                                                 style="width: 100%; border-radius: 8px; 
                                                 box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
                                                 opacity: 0; transition: opacity 0.5s ease-in-out;" 
                                                 onload="this.style.opacity='1'" />
                                            
                                            <!-- Botones de acción -->
                                            <div style="display: flex; gap: 8px; margin-top: 12px; justify-content: center; flex-wrap: wrap;">
                                                <button onclick="window.downloadDalleImage('${imageUrl}')" 
                                                        style="padding: 8px 16px; background: linear-gradient(135deg, #d4af37 0%, #aa8929 100%); 
                                                        color: white; border: none; border-radius: 6px; cursor: pointer; 
                                                        font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px;
                                                        transition: transform 0.2s; box-shadow: 0 2px 4px rgba(212, 175, 55, 0.3);" 
                                                        onmouseover="this.style.transform='scale(1.05)'" 
                                                        onmouseout="this.style.transform='scale(1)'">
                                                    <i class="fas fa-download"></i> Descargar
                                                </button>
                                                
                                                <button onclick="window.editDalleImage('${imageUrl}')" 
                                                        style="padding: 8px 16px; background: rgba(212, 175, 55, 0.1); 
                                                        color: #d4af37; border: 1px solid #d4af37; border-radius: 6px; cursor: pointer; 
                                                        font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px;
                                                        transition: all 0.2s;" 
                                                        onmouseover="this.style.background='rgba(212, 175, 55, 0.2)'" 
                                                        onmouseout="this.style.background='rgba(212, 175, 55, 0.1)'">
                                                    <i class="fas fa-edit"></i> Editar
                                                </button>
                                                
                                                <button onclick="window.createVariation('${imageUrl}')" 
                                                        style="padding: 8px 16px; background: rgba(212, 175, 55, 0.1); 
                                                        color: #d4af37; border: 1px solid #d4af37; border-radius: 6px; cursor: pointer; 
                                                        font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px;
                                                        transition: all 0.2s;" 
                                                        onmouseover="this.style.background='rgba(212, 175, 55, 0.2)'" 
                                                        onmouseout="this.style.background='rgba(212, 175, 55, 0.1)'">
                                                    <i class="fas fa-magic"></i> Variación
                                                </button>
                                            </div>
                                            
                                            <p style="font-size: 10px; color: #9ca3af; margin-top: 8px; text-align: center; font-weight: 400; display: flex; align-items: center; justify-content: center; gap: 8px;">
                                                <span>Generado con DALL-E 3</span>
                                                <span style="color: #6b7280;">•</span>
                                                ${permanentBadge}
                                            </p>
                                        </div>`;
                                        
                                        // Volver a buscar el contentDiv por si acaso
                                        const updatedContentDiv = lastSofiaMessage.querySelector('.message-content');
                                        if (updatedContentDiv) {
                                            updatedContentDiv.insertAdjacentHTML('beforeend', imageHtml);
                                            this.scrollToBottom();
                                            console.log('✅ Imagen insertada correctamente en el chat');
                                        } else {
                                            console.error('❌ No se pudo encontrar el contentDiv para insertar la imagen');
                                        }
                                    } else {
                                        console.error('❌ No se recibió URL de imagen de DALL-E');
                                    }
                                    
                                } catch (error) {
                                    console.error('❌ Error en proceso DALL-E:', error);
                                    
                                    // Buscar y eliminar indicador de carga si existe
                                    const loadingDivs = document.querySelectorAll('.dalle-loading-container');
                                    loadingDivs.forEach(div => div.remove());
                                    
                                    // Mostrar mensaje de error
                                    const messagesContainer = document.getElementById('chatMessages');
                                    const allMessages = messagesContainer.querySelectorAll('.chat-message.assistant');
                                    const lastSofiaMessage = allMessages[allMessages.length - 1];
                                    
                                    if (lastSofiaMessage) {
                                        const contentDiv = lastSofiaMessage.querySelector('.message-content');
                                        if (contentDiv) {
                                            const errorMsg = `<div style="margin-top: 16px; padding: 12px; background-color: rgb(254 242 242); border: 1px solid rgb(254 202 202); border-radius: 8px;">
                                                <p style="font-size: 14px; color: rgb(220 38 38);">⚠️ Error al generar la imagen</p>
                                                <p style="font-size: 12px; color: rgb(239 68 68); margin-top: 4px;">Por favor, intenta de nuevo o reformula tu petición.</p>
                                            </div>`;
                                            contentDiv.insertAdjacentHTML('beforeend', errorMsg);
                                            this.scrollToBottom();
                                        }
                                    }
                                }
                            }, 1000); // Esperar 1 segundo para asegurar que el DOM está listo
                        }
                        
                        return finalMessage;
                    }
                }
            } catch (error) {
                // Try next endpoint
                console.error('Error en endpoint:', endpoint, error);
                continue;
            }
        }
        
        // If all backends fail, use mock
        console.warn('⚠️ Backend no disponible, usando respuestas simuladas');
        console.log('ℹ️ Para ChatGPT real, despliega en Vercel o Netlify.');
        
        // Si hay archivo adjunto, agregar contexto al mensaje
        if (fileType === 'image') {
            return "🖼️ He visto tu imagen. En modo demo no puedo analizarla completamente, pero puedo darte consejos generales basados en la descripción.";
        }
        if (fileType === 'document') {
            return "📄 He recibido tu documento. En modo demo no puedo procesarlo completamente, pero puedo responder preguntas generales sobre documentación inmobiliaria.";
        }
        
        // Mock AI responses as fallback
        const responses = this.getContextualResponses(message);
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
        
        // Return appropriate response
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    // Helper: Convertir archivo a Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(file);
        });
    }

    // Helper: Extraer texto de PDF
    async extractTextFromPDF(file) {
        return new Promise((resolve, reject) => {
            // Check if PDF.js is loaded
            if (typeof pdfjsLib === 'undefined') {
                console.warn('⚠️ PDF.js no disponible - Enviando documento sin extraer texto');
                resolve('[Documento PDF - Extracción de texto no disponible en este momento]');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    // Configure PDF.js worker (jsDelivr CDN)
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js';
                    
                    const typedArray = new Uint8Array(this.result);
                    const pdf = await pdfjsLib.getDocument(typedArray).promise;
                    
                    let fullText = '';
                    
                    // Extract text from each page
                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                        const page = await pdf.getPage(pageNum);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map(item => item.str).join(' ');
                        fullText += `\n--- Página ${pageNum} ---\n${pageText}\n`;
                    }
                    
                    resolve(fullText.trim());
                } catch (error) {
                    console.error('Error extrayendo texto del PDF:', error);
                    reject(error);
                }
            };
            reader.onerror = error => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    // Helper: Extraer texto de Word (.docx)
    async extractTextFromWord(file) {
        return new Promise((resolve, reject) => {
            // Check if Mammoth is loaded
            if (typeof mammoth === 'undefined') {
                console.warn('⚠️ Mammoth no disponible - Enviando documento sin extraer texto');
                resolve('[Documento Word - Extracción de texto no disponible en este momento]');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    const arrayBuffer = this.result;
                    const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
                    resolve(result.value);
                } catch (error) {
                    console.error('Error extrayendo texto del Word:', error);
                    reject(error);
                }
            };
            reader.onerror = error => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    // Helper: Extraer texto de Excel (.xlsx, .xls)
    async extractTextFromExcel(file) {
        return new Promise((resolve, reject) => {
            // Check if XLSX is loaded
            if (typeof XLSX === 'undefined') {
                console.warn('⚠️ XLSX no disponible - Enviando documento sin extraer texto');
                resolve('[Documento Excel - Extracción de texto no disponible en este momento]');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function() {
                try {
                    const data = new Uint8Array(this.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    let fullText = '';
                    
                    // Process each sheet
                    workbook.SheetNames.forEach((sheetName, index) => {
                        const worksheet = workbook.Sheets[sheetName];
                        const sheetText = XLSX.utils.sheet_to_txt(worksheet);
                        fullText += `\n--- Hoja ${index + 1}: ${sheetName} ---\n${sheetText}\n`;
                    });
                    
                    resolve(fullText.trim());
                } catch (error) {
                    console.error('Error extrayendo texto del Excel:', error);
                    reject(error);
                }
            };
            reader.onerror = error => reject(error);
            reader.readAsArrayBuffer(file);
        });
    }

    getContextualResponses(message) {
        const lowerMessage = message.toLowerCase();
        
        // Responses for professionals
        if (this.userType === 'profesional') {
            if (lowerMessage.includes('captación') || lowerMessage.includes('conseguir clientes')) {
                return [
                    "Para captación efectiva, te recomiendo el sistema de embudo premium: 1) Contenido de valor en redes sociales sobre el mercado local, 2) Landing pages específicas por zona, 3) Webinars educativos para propietarios, 4) Networking estratégico con otros profesionales. ¿Quieres que profundice en alguna estrategia?",
                    "La captación moderna se basa en autoridad y confianza. Crea informes de mercado mensuales, publica casos de éxito, haz videos educativos y mantén presencia constante en tu zona objetivo. El marketing de contenidos genera un 3x más leads que la publicidad tradicional."
                ];
            }
            
            if (lowerMessage.includes('precio') || lowerMessage.includes('valoración')) {
                return [
                    "Para ajustes de precio profesionales: 1) Análisis comparativo de mercado (CMA) con propiedades similares vendidas en 6 meses, 2) Factores de ubicación, estado y características únicas, 3) Tendencias del mercado local, 4) Tiempo en mercado objetivo. Puedo ayudarte a crear informes detallados con datos reales.",
                    "El pricing estratégico es clave: precio inicial ligeramente por encima del valor de mercado para generar interés, pero con flexibilidad para ajustar según feedback. Un inmueble bien tasado vende 23% más rápido que uno sobrevalorado."
                ];
            }
            
            if (lowerMessage.includes('negociación') || lowerMessage.includes('cierre')) {
                return [
                    "En negociación inmobiliaria: 1) Escucha activa para entender motivaciones reales, 2) Crea valor más allá del precio (condiciones, plazos, extras), 3) Usa la técnica del 'yes ladder', 4) Siempre ten plan B preparado. La clave es hacer que todas las partes se sientan ganadoras.",
                    "Para cerrar ventas efectivamente: presenta beneficios emocionales, no solo características; usa prueba social con testimonios; crea urgencia genuina con datos de mercado; y siempre confirma el siguiente paso concreto."
                ];
            }
        }
        
        // Responses for particulares
        if (this.userType === 'particular') {
            if (lowerMessage.includes('preparar') || lowerMessage.includes('reformar')) {
                return [
                    "Para preparar tu inmueble: 1) Despersonaliza espacios quitando fotos y objetos muy personales, 2) Maximiza la luz natural, 3) Pequeñas reparaciones (grifos, pintura, silicona), 4) Home staging básico con plantas y aromas neutros. Una buena presentación puede aumentar el valor percibido hasta un 10%.",
                    "Prioriza estas mejoras: limpieza profunda, orden extremo, iluminación LED cálida, neutralizar olores, reparar desperfectos visibles. No hagas reformas costosas - mejor ajusta el precio. Los compradores prefieren personalizar ellos mismos."
                ];
            }
            
            if (lowerMessage.includes('documentos') || lowerMessage.includes('papeles')) {
                return [
                    "Documentación esencial: 1) Escritura de propiedad actualizada, 2) Nota simple registral (max 3 meses), 3) Cédula de habitabilidad vigente, 4) Certificado energético, 5) IBI últimos años, 6) Estatutos y cuentas anuales si es comunidad. Todo debe estar en orden antes de publicar.",
                    "Papeles que necesitas: título de propiedad, certificado energético (obligatorio), cédula de habitabilidad, recibos IBI y comunidad al día, planos si los tienes. Si hay hipoteca, necesitarás certificación de deuda pendiente del banco."
                ];
            }
            
            if (lowerMessage.includes('precio') || lowerMessage.includes('valor')) {
                return [
                    "Para valorar correctamente: 1) Busca ventas recientes en tu zona (max 6 meses), 2) Ajusta por diferencias (piso, orientación, estado), 3) Considera tendencia del mercado local, 4) Ten en cuenta gastos de venta (5-10% del precio). Un precio realista vende más rápido que uno optimista.",
                    "El precio correcto es el que equilibra tus expectativas con la realidad del mercado. Mejor empezar ligeramente bajo y generar interés múltiple que alto y esperar meses. Cada mes extra en venta suele costar más que un pequeño descuento inicial."
                ];
            }
        }
        
        // General real estate responses
        const generalResponses = [
            "Como experta inmobiliaria, te puedo ayudar con cualquier aspecto del proceso. ¿Hay algo específico en lo que necesites orientación?",
            "El mercado inmobiliario tiene sus particularidades. Cuéntame más detalles sobre tu situación para darte consejos más precisos.",
            "Cada operación inmobiliaria es única. Para ayudarte mejor, ¿podrías darme más contexto sobre tu inmueble o situación?",
            "En mi experiencia como SuperAgente Inmobiliario, la clave está en los detalles. ¿Qué aspectos específicos te preocupan más?",
            "Te puedo asistir con formación, estrategias de venta, valoraciones, documentación y mucho más. ¿Por dónde empezamos?"
        ];
        
        return generalResponses;
    }

    addMessage(sender, content, useTypingEffect = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `flex ${sender === 'user' ? 'justify-end' : 'justify-start'} mb-4 chat-message ${sender}`;
        
        const timestamp = new Date().toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        if (sender === 'assistant') {
            // Format content with better paragraph structure
            const formattedContent = this.formatMessageContent(content);
            
            messageDiv.innerHTML = `
                <div class="flex space-x-3 max-w-4xl">
                    <img src="images/sofia-avatar.jpg" alt="Sofía" class="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-md">
                    <div class="message-bubble assistant p-3">
                        <div class="flex items-center space-x-2 mb-1">
                            <span class="font-semibold text-sm text-domus-gold">Sofía</span>
                            <span class="text-xs text-gray-500">${timestamp}</span>
                        </div>
                        <div class="message-content text-sm text-domus-navy leading-relaxed">${useTypingEffect ? '' : formattedContent}</div>
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="flex space-x-3 justify-end max-w-4xl">
                    <div class="message-bubble user p-3">
                        <div class="flex items-center space-x-2 mb-1 justify-end">
                            <span class="text-xs text-white/80">${timestamp}</span>
                            <span class="font-semibold text-sm text-white">Tú</span>
                        </div>
                        <p class="text-sm text-white leading-relaxed">${content}</p>
                    </div>
                    <div class="message-avatar user">
                        <i class="fas fa-user text-sm"></i>
                    </div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        
        // Apply typing effect for assistant messages if requested
        if (sender === 'assistant' && useTypingEffect) {
            const contentElement = messageDiv.querySelector('.message-content');
            this.typeMessage(contentElement, this.formatMessageContent(content));
        } else {
            // Smooth scroll to bottom with mobile consideration
            this.scrollToBottom();
        }
        
        // 🔊 NUEVO: Leer mensaje de Sofía con voz si está activado
        if (sender === 'assistant' && typeof voiceReader !== 'undefined' && voiceReader) {
            voiceReader.readSofiaMessage(content);
        }
    }
    
    formatMessageContent(content) {
        if (!content) return '';
        
        // Convertir markdown-style bold con gradiente (solo pares completos)
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong class="gradient-text">$1</strong>');
        
        // Si hay ** sin cerrar al final (durante typing), cerrarlo temporalmente
        const asteriskCount = (formatted.match(/\*\*/g) || []).length;
        if (asteriskCount % 2 !== 0) {
            formatted += '**';
            formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong class="gradient-text">$1</strong>');
        }
        
        // Separar por párrafos
        formatted = formatted
            .replace(/\.\s*\n/g, '.</p><p class="mb-4">') // Punto + salto = nuevo párrafo
            .replace(/\n\n+/g, '</p><p class="mb-4">') // Doble salto = nuevo párrafo
            .replace(/\n/g, ' '); // Salto simple = espacio
        
        // Envolver en párrafos
        if (!formatted.startsWith('<p')) {
            formatted = '<p class="mb-4">' + formatted;
        }
        if (!formatted.endsWith('</p>')) {
            formatted = formatted + '</p>';
        }
        
        // Convertir listas con viñetas
        formatted = formatted.replace(/^[-•]\s/gm, '<span class="inline-block w-2 h-2 bg-domus-gold rounded-full mr-2"></span>');
        
        // Limpiar párrafos vacíos
        formatted = formatted.replace(/<p class="mb-4">\s*<\/p>/g, '');
        
        return formatted;
    }
    
    async typeMessage(element, content, speed = 500) {
        // 🎯 EFECTO ESCRITURA CASI INSTANTÁNEA (100 palabras/seg ≈ 500 chars/seg)
        console.log('⌨️ Iniciando typeMessage con speed:', speed);
        
        const delay = 1000 / speed;
        
        // Añadir clase 'typing' para mostrar cursor parpadeante
        element.classList.add('typing');
        
        // Extraer texto plano para saber longitud
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        
        let currentText = '';
        let currentIndex = 0;
        
        // Flag para permitir skip con click
        let skipTyping = false;
        
        // Función para skip
        const skipHandler = () => {
            skipTyping = true;
        };
        
        // Añadir evento de click para skip
        element.addEventListener('click', skipHandler, { once: true });
        
        return new Promise((resolve) => {
            const typeChar = () => {
                // Si usuario hace click, mostrar todo inmediatamente
                if (skipTyping || currentIndex >= textContent.length) {
                    element.classList.remove('typing');
                    element.innerHTML = content;
                    this.scrollToBottom();
                    element.removeEventListener('click', skipHandler);
                    
                    // 🖼️ INSERTAR IMAGEN DALL-E SI HAY UNA PENDIENTE
                    if (this.pendingImageUrl) {
                        console.log('🖼️ Insertando imagen DALL-E...');
                        setTimeout(() => {
                            this.insertPendingImage(element);
                        }, 100);
                    }
                    
                    console.log('✅ TypeMessage completado');
                    resolve();
                    return;
                }
                
                // Añadir siguiente carácter
                currentText += textContent[currentIndex];
                currentIndex++;
                
                // Aplicar formato HTML al texto acumulado
                element.innerHTML = this.formatMessageContent(currentText);
                
                // Auto-scroll cada 20 caracteres (optimizado para alta velocidad)
                if (currentIndex % 20 === 0) {
                    this.scrollToBottom();
                }
                
                // Continuar con siguiente carácter
                setTimeout(typeChar, delay);
            };
            
            // Iniciar escritura
            console.log('⌨️ Comenzando escritura de', textContent.length, 'caracteres');
            typeChar();
        });
    }
    
    insertPendingImage(contentElement) {
        if (!this.pendingImageUrl) return;
        
        console.log('🖼️ Insertando imagen:', this.pendingImageUrl);
        
        // 🔥 Detectar si es Replicate (edición) o DALL-E (generación)
        const isReplicate = this.pendingImageData?.replicateUsed || this.pendingImageData?.imageEdited;
        const imageSource = isReplicate ? 'Replicate SDXL (edición)' : 'DALL-E 3 (generación)';
        const altText = isReplicate ? 'Imagen editada con Replicate SDXL' : 'Imagen generada por DALL-E 3';
        
        // Badge de estructura preservada si es Replicate
        const structureBadge = (isReplicate && this.pendingImageData?.structurePreserved) 
            ? '<span style="font-size: 9px; color: #10b981; font-weight: 600;">✓ Estructura original preservada</span>'
            : '';
        
        console.log(`📦 Tipo de imagen: ${imageSource}`, {
            isReplicate,
            structurePreserved: this.pendingImageData?.structurePreserved
        });
        
        // Crear HTML de la imagen con botón de descarga
        const imageHtml = `
            <div class="generated-image-container" style="margin-top: 16px; padding: 16px; background: linear-gradient(135deg, rgba(212, 175, 55, 0.05), rgba(184, 134, 11, 0.02)); border-radius: 12px; border: 1px solid rgba(212, 175, 55, 0.2);">
                <img src="${this.pendingImageUrl}" 
                     alt="${altText}" 
                     style="width: 100%; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: block;" 
                     onload="console.log('✅ Imagen cargada correctamente'); this.style.opacity='1';"
                     onerror="console.error('❌ Error al cargar imagen:', this.src);" />
                
                <div style="margin-top: 12px; display: flex; gap: 8px; justify-content: center;">
                    <button onclick="window.downloadDalleImage('${this.pendingImageUrl}')" 
                            style="padding: 8px 16px; background: linear-gradient(135deg, #d4af37 0%, #aa8929 100%); color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500; display: flex; align-items: center; gap: 6px; transition: transform 0.2s;" 
                            onmouseover="this.style.transform='scale(1.05)'" 
                            onmouseout="this.style.transform='scale(1)'">
                        <i class="fas fa-download"></i> Descargar
                    </button>
                </div>
                
                <p style="font-size: 10px; color: #9ca3af; margin-top: 8px; text-align: center; display: flex; align-items: center; justify-content: center; gap: 8px;">
                    <span>${imageSource}</span>
                    ${structureBadge ? '<span style="color: #6b7280;">•</span>' + structureBadge : ''}
                </p>
            </div>
        `;
        
        contentElement.insertAdjacentHTML('beforeend', imageHtml);
        this.scrollToBottom();
        
        console.log('✅ Imagen insertada en el DOM');
        
        // Limpiar pendiente
        this.pendingImageUrl = null;
        this.pendingImageData = null;
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatMessages');
        
        if (this.isMobile()) {
            // On mobile, use requestAnimationFrame for smoother scrolling
            requestAnimationFrame(() => {
                messagesContainer.scrollTo({
                    top: messagesContainer.scrollHeight,
                    behavior: 'smooth'
                });
            });
        } else {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    showTypingIndicator(isGeneratingImage = false) {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex justify-start mb-4';
        
        // Debug: verificar si detectó generación de imagen
        if (isGeneratingImage) {
            console.log('✨ Mostrando indicador: "Produciendo imagen..."');
        }
        
        // Mensaje especial si está generando imagen
        const statusText = isGeneratingImage 
            ? '<div class="mt-1 font-bold" style="color: #D4AF37; font-size: 15px; letter-spacing: 0.3px;">✨ Produciendo imagen...</div>'
            : '';
        
        typingDiv.innerHTML = `
            <div class="flex space-x-3">
                <img src="images/sofia-avatar.jpg" alt="Sofía" class="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-md">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
                    ${statusText}
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) {
            indicator.remove();
        }
    }

    // ===== SUBSCRIPTION MANAGEMENT =====
    // ✅ DESACTIVADO EN FASE DE PRUEBA
    showSubscriptionPrompt() {
        // Mostrar aviso cada 100 mensajes para recordar upgrade
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-2xl p-8 max-w-md w-full">
                <div class="text-center space-y-4">
                    <div class="w-16 h-16 bg-domus-accent/10 rounded-full flex items-center justify-center mx-auto">
                        <i class="fas fa-rocket text-domus-accent text-2xl"></i>
                    </div>
                    <h3 class="text-2xl font-bold text-domus-navy">Actualización Disponible</h3>
                    <p class="text-domus-sage">
                        Has utilizado bastante Sofía. Para acceso ilimitado y funciones avanzadas, considera actualizar tu plan.
                    </p>
                    <div class="flex gap-3">
                        <button onclick="this.closest('.fixed').remove()" 
                                class="flex-1 py-3 px-6 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">
                            Ahora no
                        </button>
                        <button onclick="window.location.href='/#planes'; this.closest('.fixed').remove()" 
                                class="flex-1 py-3 px-6 bg-domus-accent text-white rounded-xl font-semibold hover:bg-domus-accent/90 transition-all">
                            Ver Planes
                        </button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    handlePricingSelect(e) {
        const planType = e.target.dataset.plan;
        // Here you would integrate with your payment system
        console.log(`Selected plan: ${planType}`);
        alert(`Funcionalidad de pago para plan ${planType} próximamente disponible.`);
    }

    // ===== COUNTDOWN TIMER =====
    startCountdown() {
        const countdownElement = document.getElementById('countdown');
        if (!countdownElement) return;
        
        const targetDate = new Date('2025-12-31T23:59:59').getTime();
        
        const updateCountdown = () => {
            const now = new Date().getTime();
            const distance = targetDate - now;
            
            if (distance < 0) {
                countdownElement.innerHTML = '<span class="countdown-item"><span class="countdown-number">¡Oferta terminada!</span></span>';
                return;
            }
            
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            countdownElement.innerHTML = `
                <div class="countdown-item">
                    <span class="countdown-number">${days}</span>
                    <span class="countdown-label">días</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${hours}</span>
                    <span class="countdown-label">horas</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${minutes}</span>
                    <span class="countdown-label">min</span>
                </div>
                <div class="countdown-item">
                    <span class="countdown-number">${seconds}</span>
                    <span class="countdown-label">seg</span>
                </div>
            `;
        };
        
        updateCountdown();
        setInterval(updateCountdown, 1000);
    }

    // ===== ACTION BUTTONS MANAGEMENT =====
    bindActionButtons() {
        // Bind all action buttons when they're available
        setTimeout(() => {
            document.querySelectorAll('button').forEach(btn => {
                const text = btn.textContent.trim();
                
                // Empezar como Agente/Propietario
                if (text.includes('Empezar como')) {
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        const userType = text.includes('Agente') ? 'profesional' : 'particular';
                        this.setUserTypeAndOpenChat(userType);
                    });
                }
                
                // Pricing buttons
                if (text.includes('Elegir') || text.includes('Comenzar Gratis') || text.includes('Comenzar')) {
                    btn.addEventListener('click', (e) => this.handlePricingSelect(e));
                }
            });
        }, 100);
    }

    setUserTypeAndOpenChat(userType) {
        this.userType = userType;
        this.isAuthenticated = true;
        this.saveUserData();
        this.openChat();
    }

    handlePricingSelect(e) {
        const buttonText = e.target.textContent;
        let planType = 'free';
        
        if (buttonText.includes('Profesional')) {
            planType = 'profesional';
        } else if (buttonText.includes('Particular')) {
            planType = 'particular';
        }
        
        if (planType === 'free') {
            this.showAuthModal('register');
        } else {
            this.showSubscriptionModal(planType);
        }
    }

    async showSubscriptionModal(planType) {
        const planInfo = {
            'particular': {
                name: 'Plan Particular',
                price: '€99/mes',
                features: ['500 mensajes/mes', '10 imágenes DALL-E', '100 análisis Vision', '50 documentos']
            },
            'profesional': {
                name: 'Plan Profesional',
                price: '€199/mes',
                features: ['1,000 mensajes/mes', '30 imágenes DALL-E', '300 análisis Vision', '150 documentos']
            },
            'premium': {
                name: 'Plan Premium',
                price: '€399/mes',
                features: ['3,000 mensajes/mes', '100 imágenes DALL-E', 'Vision ilimitado', '500 documentos']
            }
        };
        
        const plan = planInfo[planType];
        
        let message = `¡Perfecto! Has seleccionado el ${plan.name} - ${plan.price}\n\n`;
        message += `✨ Incluye:\n`;
        plan.features.forEach(feature => {
            message += `• ${feature}\n`;
        });
        message += `\n💳 ¿Deseas suscribirte ahora?`;
        
        if (confirm(message)) {
            // TODO: Integrar con sistema de pagos cuando esté listo
            if (window.paymentSystem && !window.paymentSystem.isDemo) {
                try {
                    const userId = this.userId || 'user_' + Date.now();
                    const userEmail = this.userEmail || prompt('Introduce tu email:');
                    
                    await window.paymentSystem.createCheckoutSession(planType, userId, userEmail);
                } catch (error) {
                    alert('Error al procesar el pago: ' + error.message);
                }
            } else {
                // Modo demo - Activar plan temporalmente
                alert(`🎭 MODO DEMO\n\nEn producción, aquí se abriría el checkout de Stripe.\n\nPor ahora, te activamos el plan temporalmente.`);
                
                this.subscriptionPlan = planType;
                this.isAuthenticated = true;
                this.userName = prompt('¿Cómo te llamas?') || 'Usuario';
                this.userType = planType === 'particular' ? 'particular' : 'profesional';
                this.saveUserData();
                this.updateUI();
                this.openChat();
            }
        }
    }

    // ===== ADVANCED FEATURES INTEGRATION =====
    async handleAdvancedFeatures(message) {
        const lowerMessage = message.toLowerCase();
        
        // Image analysis request
        if (lowerMessage.includes('analizar imagen') || lowerMessage.includes('analizar foto')) {
            return await this.handleImageAnalysis();
        }
        
        // Image generation request  
        if (lowerMessage.includes('generar imagen') || lowerMessage.includes('crear imagen')) {
            return await this.handleImageGeneration(message);
        }
        
        // Market report request
        if (lowerMessage.includes('informe de mercado') || lowerMessage.includes('estudio de mercado')) {
            return await this.handleMarketReport(message);
        }
        
        // Role play request
        if (lowerMessage.includes('practicar') || lowerMessage.includes('roleplay') || lowerMessage.includes('simular')) {
            return await this.handleRolePlay(message);
        }
        
        // Document analysis
        if (lowerMessage.includes('analizar documento') || lowerMessage.includes('revisar contrato')) {
            return await this.handleDocumentAnalysis();
        }
        
        return null; // No advanced feature detected
    }

    async handleImageAnalysis() {
        if (!this.sofiaAI.isAPIConfigured()) {
            return "Para analizar imágenes necesitas el plan premium con API configurada. ¿Te gustaría actualizarte?";
        }
        
        const imageUrl = prompt("Por favor, proporciona la URL de la imagen que quieres analizar:");
        if (!imageUrl) return "Análisis cancelado.";
        
        try {
            const analysis = await this.sofiaAI.analyzeImage(imageUrl, "Analiza esta imagen inmobiliaria y proporciona consejos profesionales.");
            return `📸 **Análisis de Imagen Completado**\n\n${analysis}`;
        } catch (error) {
            return "No he podido analizar la imagen. Verifica que la URL sea válida y tu API esté configurada correctamente.";
        }
    }

    async handleImageGeneration(message) {
        // Verificar límites según el plan
        const limits = {
            'free': 0,
            'particular': 10,
            'profesional': 30,
            'premium': 100
        };
        
        const userLimit = limits[this.subscriptionPlan] || 0;
        
        if (userLimit === 0) {
            return "🎨 La generación de imágenes con DALL-E 3 está disponible desde el plan Particular (10 imágenes/mes).\n\n¿Te gustaría actualizar tu plan?";
        }
        
        // TODO: Implementar tracking real de uso de DALL-E cuando tengas base de datos
        // Por ahora, permitir uso
        
        const prompt = message.replace(/generar imagen|crear imagen|genera|crea/gi, '').trim();
        if (!prompt) {
            return "Por favor, describe qué imagen quieres que genere.\n\nEjemplo: 'Genera una imagen de un salón moderno con luz natural'";
        }
        
        try {
            // Mostrar mensaje de "generando"
            const loadingMessage = this.addMessage('assistant', "🎨 Generando imagen con DALL-E 3... Esto puede tardar 10-30 segundos.");
            
            const imageUrl = await this.sofiaAI.generateImage(prompt, '1024x1024', 'standard', this.subscriptionPlan);
            
            // Eliminar mensaje de "generando"
            if (loadingMessage && loadingMessage.parentNode) {
                loadingMessage.parentNode.removeChild(loadingMessage);
            }
            
            // Crear mensaje con la imagen
            const imageResponse = `🎨 **Imagen Generada con DALL-E 3**\n\n![Imagen generada](${imageUrl})\n\n*Imagen creada: "${prompt}"*\n\n💡 Límite mensual: ${userLimit} imágenes (Plan ${this.subscriptionPlan})`;
            
            return imageResponse;
            
        } catch (error) {
            console.error('Error generando imagen:', error);
            return "❌ No he podido generar la imagen. " + error.message + "\n\nIntenta con una descripción diferente o contacta con soporte si el problema persiste.";
        }
    }

    async handleMarketReport(message) {
        if (!this.sofiaAI.isAPIConfigured() && this.subscriptionPlan === 'free') {
            return "Los informes de mercado detallados están disponibles en planes premium. Te puedo dar información básica, ¿qué zona te interesa?";
        }
        
        const location = prompt("¿Para qué zona necesitas el informe de mercado?");
        const propertyType = prompt("¿Qué tipo de propiedad? (piso, casa, local, etc.)");
        
        if (!location || !propertyType) return "Informe cancelado.";
        
        try {
            const report = await this.sofiaAI.generateMarketReport(location, propertyType, this.userType);
            return `📊 **Informe de Mercado - ${location}**\n\n${report}`;
        } catch (error) {
            return `No he podido generar el informe completo, pero puedo ayudarte con información básica sobre el mercado en ${location}. ¿Qué aspectos específicos te interesan?`;
        }
    }

    async handleRolePlay(message) {
        if (!this.sofiaAI.isAPIConfigured() && this.subscriptionPlan === 'free') {
            return "Las sesiones de práctica avanzadas están en planes premium. Puedo darte consejos básicos, ¿qué situación quieres practicar?";
        }
        
        const scenarios = {
            '1': 'negotiation',
            '2': 'objection_handling', 
            '3': 'price_justification',
            '4': 'first_visit',
            '5': 'closing_meeting'
        };
        
        const choice = prompt(`¿Qué quieres practicar?\n\n1. Negociación de precio\n2. Manejo de objeciones\n3. Justificación de precio\n4. Primera visita\n5. Cierre de venta\n\nElige (1-5):`);
        
        const scenarioType = scenarios[choice];
        if (!scenarioType) return "Opción no válida. Pregúntame específicamente qué quieres practicar.";
        
        try {
            const scenario = await this.sofiaAI.createRolePlayScenario(scenarioType, this.userType);
            return `🎭 **Sesión de Práctica Iniciada**\n\n${scenario}`;
        } catch (error) {
            return "Puedo ayudarte a practicar con consejos básicos. ¿Qué situación específica te gustaría mejorar?";
        }
    }

    async handleDocumentAnalysis() {
        if (!this.sofiaAI.isAPIConfigured()) {
            return "Para analizar documentos necesitas el plan premium. Puedo darte consejos generales sobre documentación inmobiliaria.";
        }
        
        alert("Para analizar documentos, por favor copia y pega el texto del documento en tu próximo mensaje, precedido de 'DOCUMENTO:'");
        return "📄 **Análisis de Documentos**\n\nPerfecto, en tu próximo mensaje incluye:\n\n`DOCUMENTO: [pega aquí el texto del documento]`\n\nY lo analizaré para ti con recomendaciones profesionales.";
    }

    // ===== MOBILE KEYBOARD HANDLING =====
    isMobile() {
        return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    setupMobileKeyboardHandling() {
        if (!this.isMobile()) return;
        
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');
        const chatModal = document.getElementById('chatModal');
        
        // Store original viewport height
        this.originalViewportHeight = window.innerHeight;
        
        // Handle input focus (keyboard appears)
        chatInput.addEventListener('focus', this.handleKeyboardOpen.bind(this));
        chatInput.addEventListener('blur', this.handleKeyboardClose.bind(this));
        
        // Handle viewport changes (for when keyboard appears/disappears)
        window.addEventListener('resize', this.handleViewportChange.bind(this));
        
        // Prevent zoom on iOS
        chatInput.addEventListener('touchstart', (e) => {
            chatInput.style.fontSize = '16px';
        });
        
        // Scroll to bottom when keyboard appears
        chatInput.addEventListener('focus', () => {
            setTimeout(() => {
                chatMessages.scrollTop = chatMessages.scrollHeight;
            }, 300);
        });
    }

    handleKeyboardOpen() {
        const chatMessages = document.getElementById('chatMessages');
        const chatModal = document.getElementById('chatModal');
        
        // Add class to indicate keyboard is open
        document.body.classList.add('keyboard-open');
        
        // No need to manually adjust height - flexbox handles it
        // Just ensure we scroll to bottom
        setTimeout(() => {
            this.scrollToBottom();
        }, 300);
    }

    handleKeyboardClose() {
        document.body.classList.remove('keyboard-open');
        
        // Flexbox handles the resizing automatically
        setTimeout(() => {
            this.scrollToBottom();
        }, 300);
    }

    handleViewportChange() {
        if (!this.isMobile()) return;
        
        const currentHeight = window.innerHeight;
        const heightDifference = this.originalViewportHeight - currentHeight;
        
        // If viewport height decreased significantly, keyboard is likely open
        if (heightDifference > 150) {
            this.handleKeyboardOpen();
        } else if (heightDifference < 50) {
            this.handleKeyboardClose();
        }
    }

    cleanupMobileKeyboardHandling() {
        if (!this.isMobile()) return;
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleViewportChange.bind(this));
        
        // Reset styles
        document.body.classList.remove('keyboard-open');
    }

    // ===== FILE UPLOAD =====
    initFileUpload() {
        // Estado para almacenar archivos seleccionados
        this.currentFile = null;
        this.currentFileType = null; // 'image' | 'document'
        
        const uploadImageBtn = document.getElementById('uploadImageBtn');
        const uploadDocBtn = document.getElementById('uploadDocBtn');
        const imageInput = document.getElementById('imageInput');
        const documentInput = document.getElementById('documentInput');
        const removeFileBtn = document.getElementById('removeFileBtn');
        
        // Botón subir imagen
        if (uploadImageBtn && imageInput) {
            uploadImageBtn.addEventListener('click', () => {
                imageInput.click();
            });
            
            imageInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImageUpload(file);
                }
            });
        }
        
        // Botón subir documento
        if (uploadDocBtn && documentInput) {
            uploadDocBtn.addEventListener('click', () => {
                documentInput.click();
            });
            
            documentInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleDocumentUpload(file);
                }
            });
        }
        
        // Botón remover archivo
        if (removeFileBtn) {
            removeFileBtn.addEventListener('click', () => {
                this.clearFileUpload();
            });
        }
    }
    
    async handleImageUpload(file) {
        // Validar tamaño (máximo 10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert('⚠️ La imagen es demasiado grande. Máximo 10MB.');
            return;
        }
        
        // Validar tipo
        if (!file.type.startsWith('image/')) {
            alert('⚠️ Por favor selecciona un archivo de imagen válido.');
            return;
        }
        
        // 🔥 LIMPIAR URL ANTERIOR (si existe) antes de subir nueva imagen
        if (this.currentUploadedImageUrl) {
            console.log('🧹 Limpiando URL anterior antes de subir nueva imagen');
            this.currentUploadedImageUrl = null;
        }
        
        this.currentFile = file;
        this.currentFileType = 'image';
        
        // Mostrar preview local primero
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.getElementById('filePreview');
            const previewContent = document.getElementById('previewContent');
            
            previewContent.innerHTML = `
                <div class="flex items-center space-x-3">
                    <img src="${e.target.result}" alt="Preview" class="w-16 h-16 object-cover rounded">
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">📷 ${file.name}</p>
                        <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                </div>
            `;
            
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(file);
        
        console.log('🖼️ Imagen cargada:', file.name);
        console.log('✅ Imagen lista para enviar con el mensaje');
        
        // ✅ NUEVO FLUJO: Subir a Cloudinary en background, pero NO enviar automáticamente
        // La imagen se guardará y se enviará cuando el usuario haga clic en "Enviar"
        try {
            const publicUrl = await this.uploadImageToCloudinary(file);
            console.log('✅ Imagen subida a Cloudinary:', publicUrl);
            
            // Guardar URL para uso posterior con Replicate
            this.currentUploadedImageUrl = publicUrl;
            
            // Actualizar preview con indicador de "lista"
            const previewContent = document.getElementById('previewContent');
            if (previewContent) {
                const currentHTML = previewContent.innerHTML;
                previewContent.innerHTML = currentHTML.replace(
                    '</div>',
                    '<span class="text-xs text-green-600">✓ Lista para enviar</span></div>'
                );
            }
            
        } catch (error) {
            console.error('❌ Error subiendo a Cloudinary:', error);
            // Si falla Cloudinary, continuar con funcionalidad básica (Vision API)
            console.log('ℹ️ Imagen disponible solo para análisis (no para edición)');
        }
    }
    
    // ============================================================================
    // 🖼️ CLOUDINARY IMAGE UPLOAD
    // ============================================================================
    
    async uploadImageToCloudinary(file) {
        try {
            // Mostrar indicador de carga
            this.showUploadProgress('Subiendo imagen a la nube...');
            
            // CONFIGURACIÓN CLOUDINARY
            const CLOUDINARY_CLOUD_NAME = 'dfb6cd2ca'; // ✅ Cloud Name correcto
            const CLOUDINARY_API_KEY = '963855782996925';
            const CLOUDINARY_UPLOAD_PRESET = 'domus_ia_properties';
            
            // Crear FormData con API Key (requerida por configuración de cuenta)
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('api_key', CLOUDINARY_API_KEY); // ✅ Añadida API Key
            formData.append('folder', 'domus-properties');
            
            // Upload a Cloudinary (DIRECTO desde navegador)
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
                {
                    method: 'POST',
                    body: formData
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Cloudinary error: ${errorData.error?.message || 'Unknown error'}`);
            }
            
            const data = await response.json();
            
            // URL pública de la imagen
            const publicUrl = data.secure_url;
            
            console.log('✅ Imagen subida a Cloudinary:', publicUrl);
            
            this.hideUploadProgress();
            
            return publicUrl;
            
        } catch (error) {
            console.error('❌ Error subiendo a Cloudinary:', error);
            this.hideUploadProgress();
            throw error;
        }
    }
    
    // Mostrar imagen subida en el chat
    showImageInChat(imageUrl, fileName, userMessage = '') {
        const messagesContainer = document.getElementById('chatMessages');
        
        const previewHTML = `
            <div class="message user-message" style="max-width: 400px;">
                <div class="image-preview-container" style="position: relative;">
                    <img src="${imageUrl}" alt="${fileName}" 
                         style="max-width: 100%; border-radius: 12px; margin-bottom: 8px; cursor: pointer;"
                         onclick="window.open('${imageUrl}', '_blank')">
                    <p style="font-size: 12px; color: #666; margin: 0;">
                        📎 ${fileName}
                    </p>
                    <p style="font-size: 11px; color: #10b981; margin-top: 4px; font-weight: 500;">
                        ✅ Imagen lista para editar
                    </p>
                </div>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', previewHTML);
        this.scrollToBottom();
        
        // 🔥 CRÍTICO: Añadir URL al historial INMEDIATAMENTE (no esperar)
        console.log('📝 Añadiendo URL de Cloudinary al historial:', imageUrl);
        this.conversationHistory.push({
            role: 'user',
            content: `[IMAGEN SUBIDA] ${imageUrl}`,
            timestamp: new Date().toISOString()
        });
        this.saveConversationHistory();
        
        // 🧠 DETECCIÓN INTELIGENTE: ¿El usuario YA dijo qué quiere hacer?
        const lowerMessage = userMessage.toLowerCase();
        
        // Keywords para OPCIÓN A (editar contenido)
        const editKeywords = ['añade', 'anade', 'pon', 'muebles', 'limpia', 'quita', 'reforma', 
                             'cambia', 'pinta', 'mejora', 'ilumina', 'moderniza', 'staging'];
        
        // Keywords para OPCIÓN B (imagen publicitaria)
        const marketingKeywords = ['publicitaria', 'precio', 'logo', 'portada', 'anuncio', 
                                   'instagram', 'facebook', 'redes', 'marketing', 'venta'];
        
        // 🆕 Keywords para OPCIÓN C (análisis/descripción de visión)
        const analysisKeywords = ['describe', 'analiza', 'qué ves', 'que ves', 'explica', 
                                 'lee', 'leer', 'información', 'informacion', 'detalles', 
                                 'examina', 'revisa', 'estudia', 'dime sobre', 'qué hay', 
                                 'que hay', 'qué dice', 'que dice', 'identifica', 'reconoce'];
        
        const hasEditIntent = editKeywords.some(keyword => lowerMessage.includes(keyword));
        const hasMarketingIntent = marketingKeywords.some(keyword => lowerMessage.includes(keyword));
        const hasAnalysisIntent = analysisKeywords.some(keyword => lowerMessage.includes(keyword));
        
        // Si el usuario YA especificó qué quiere, NO preguntar opciones
        if (hasEditIntent || hasMarketingIntent || hasAnalysisIntent) {
            console.log('🧠 Usuario ya especificó intención:', 
                hasEditIntent ? 'EDITAR' : hasMarketingIntent ? 'MARKETING' : 'ANÁLISIS',
                '- No mostrar opciones');
            
            // Mensaje breve de confirmación
            setTimeout(() => {
                let confirmMessage;
                
                if (hasEditIntent) {
                    confirmMessage = '✅ Entendido, voy a mejorar tu imagen. Un momento...';
                } else if (hasMarketingIntent) {
                    confirmMessage = '✅ Entendido, voy a crear la imagen publicitaria. Un momento...';
                } else if (hasAnalysisIntent) {
                    confirmMessage = '👁️ Entendido, voy a analizar tu imagen en detalle. Un momento...';
                }
                
                this.addMessage('assistant', confirmMessage);
                
                this.conversationHistory.push({
                    role: 'assistant',
                    content: confirmMessage,
                    timestamp: new Date().toISOString()
                });
                this.saveConversationHistory();
            }, 300);
            
            return; // NO mostrar opciones
        }
        
        // Si NO especificó, mostrar opciones
        console.log('❓ Usuario no especificó intención - Mostrando opciones');
        
        setTimeout(() => {
            const sofiaMessage = '📸 ¡Perfecto! He recibido tu imagen.\n\n' +
                '**¿Qué quieres hacer con esta imagen?**\n\n' +
                '**🔧 OPCIÓN A: Mejorarla para el anuncio**\n' +
                '_(Añadir muebles, limpiar, reformar, cambiar colores)_\n' +
                '• "Añade muebles modernos"\n' +
                '• "Limpia el desorden"\n' +
                '• "Pinta las paredes de beige"\n' +
                '• "Cambia el suelo a parquet"\n\n' +
                '**🎨 OPCIÓN B: Crear imagen publicitaria de portada**\n' +
                '_(Añadir precio, logo, ubicación, características)_\n' +
                '• "Crea imagen publicitaria con precio 350.000€"\n' +
                '• "Añádele precio y logo para Instagram"\n\n' +
                '**👁️ OPCIÓN C: Analizar/Describir la imagen**\n' +
                '_(Descripción detallada, lectura de texto, análisis, asesoramiento)_\n' +
                '• "Describe esta imagen en detalle"\n' +
                '• "¿Qué ves en esta foto?"\n' +
                '• "Analiza esta propiedad"\n' +
                '• "Lee el texto del documento"\n\n' +
                '💡 Dime qué opción prefieres y te ayudo inmediatamente.';
            
            this.addMessage('assistant', sofiaMessage);
            
            // 🔥 CRÍTICO: Añadir también al historial
            this.conversationHistory.push({
                role: 'assistant',
                content: sofiaMessage,
                timestamp: new Date().toISOString()
            });
            this.saveConversationHistory();
        }, 800);
    }
    
    // Indicadores de progreso
    showUploadProgress(message) {
        const messagesContainer = document.getElementById('chatMessages');
        
        const progressHTML = `
            <div id="upload-progress" class="message assistant-message">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
                <p style="margin-top: 8px; font-size: 13px; color: #6b7280;">${message}</p>
            </div>
        `;
        
        messagesContainer.insertAdjacentHTML('beforeend', progressHTML);
        this.scrollToBottom();
    }
    
    hideUploadProgress() {
        const progressElement = document.getElementById('upload-progress');
        if (progressElement) {
            progressElement.remove();
        }
    }
    
    async handleDocumentUpload(file) {
        // Validar tamaño (máximo 20MB)
        if (file.size > 20 * 1024 * 1024) {
            alert('⚠️ El documento es demasiado grande. Máximo 20MB.');
            return;
        }
        
        // Validar tipo
        const validTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        
        if (!validTypes.includes(file.type)) {
            alert('⚠️ Tipo de documento no soportado. Usa PDF, Word o Excel.');
            return;
        }
        
        this.currentFile = file;
        this.currentFileType = 'document';
        
        // Mostrar preview con estado de procesamiento
        const previewContainer = document.getElementById('filePreview');
        const previewContent = document.getElementById('previewContent');
        
        const fileIcon = file.type.includes('pdf') ? '📄' : 
                        file.type.includes('word') ? '📝' : '📊';
        
        previewContent.innerHTML = `
            <div class="flex items-center space-x-3">
                <div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-3xl">
                    ${fileIcon}
                </div>
                <div class="flex-1">
                    <p class="text-sm font-medium text-gray-900">${file.name}</p>
                    <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
                    <p class="text-xs text-domus-gold animate-pulse">⏳ Extrayendo texto...</p>
                </div>
            </div>
        `;
        
        previewContainer.classList.remove('hidden');
        
        console.log('📄 Documento cargado:', file.name);
        
        // Extraer texto del documento
        try {
            let extractedText = '';
            
            if (file.type === 'application/pdf') {
                console.log('🔍 Extrayendo texto de PDF...');
                extractedText = await this.extractTextFromPDF(file);
            } else if (file.type.includes('word')) {
                console.log('🔍 Extrayendo texto de Word...');
                extractedText = await this.extractTextFromWord(file);
            } else if (file.type.includes('sheet') || file.type.includes('excel')) {
                console.log('🔍 Extrayendo texto de Excel...');
                extractedText = await this.extractTextFromExcel(file);
            }
            
            // Guardar texto extraído
            this.currentDocumentText = extractedText;
            
            // Actualizar preview con éxito
            const wordCount = extractedText.split(/\s+/).length;
            previewContent.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-3xl">
                        ${fileIcon}
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${file.name}</p>
                        <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB - ${wordCount} palabras extraídas</p>
                        <p class="text-xs text-green-600">✅ Texto extraído correctamente</p>
                    </div>
                </div>
            `;
            
            console.log(`✅ Texto extraído: ${wordCount} palabras`);
            
        } catch (error) {
            console.error('❌ Error extrayendo texto:', error);
            
            // Actualizar preview con error
            previewContent.innerHTML = `
                <div class="flex items-center space-x-3">
                    <div class="w-16 h-16 flex items-center justify-center bg-gray-100 rounded text-3xl">
                        ${fileIcon}
                    </div>
                    <div class="flex-1">
                        <p class="text-sm font-medium text-gray-900">${file.name}</p>
                        <p class="text-xs text-gray-500">${(file.size / 1024).toFixed(1)} KB</p>
                        <p class="text-xs text-red-600">⚠️ Error extrayendo texto - Intenta con otro archivo</p>
                    </div>
                </div>
            `;
            
            this.currentDocumentText = null;
        }
    }
    
    clearFileUpload() {
        this.currentFile = null;
        this.currentFileType = null;
        this.currentDocumentText = null; // Limpiar texto extraído
        
        // Limpiar inputs
        document.getElementById('imageInput').value = '';
        document.getElementById('documentInput').value = '';
        
        // Ocultar preview
        document.getElementById('filePreview').classList.add('hidden');
        
        console.log('🗑️ Archivo removido');
    }

    // ===== VOICE RECORDING =====
    initVoiceRecording() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!voiceBtn) return;

        // Check browser support
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn('Speech recognition not supported in this browser');
            voiceBtn.style.display = 'none';
            return;
        }

        // Initialize speech recognition
        this.recognition = new SpeechRecognition();
        this.recognition.lang = 'es-ES';
        this.recognition.continuous = true; // ✅ MODO CONTINUO
        this.recognition.interimResults = true; // ✅ RESULTADOS EN TIEMPO REAL
        this.recognition.maxAlternatives = 1;

        this.isRecording = false;
        this.silenceTimer = null; // Timer para detección de silencio
        this.lastSpeechTime = null; // Última vez que se detectó voz

        // Voice button click handler
        voiceBtn.addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });

        // Recognition result handler (mejorado con detección continua)
        this.recognition.onresult = (event) => {
            const chatInput = document.getElementById('chatInput');
            
            // Resetear timer de silencio cada vez que se detecta voz
            this.lastSpeechTime = Date.now();
            this.resetSilenceTimer();
            
            // Construir transcripción completa desde todos los resultados
            let transcript = '';
            for (let i = 0; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
            }
            
            // Actualizar input con transcripción completa
            chatInput.value = transcript;
            
            // Focus input
            chatInput.focus();
            
            console.log('🎤 Transcripción:', transcript);
        };

        // Recognition end handler (reiniciar si sigue activo)
        this.recognition.onend = () => {
            // Solo reiniciar si isRecording sigue true (no fue detenido manualmente)
            if (this.isRecording) {
                console.log('🔄 Reconocimiento finalizado, reiniciando...');
                try {
                    this.recognition.start();
                } catch (error) {
                    console.log('⚠️ No se pudo reiniciar reconocimiento');
                    this.stopRecording();
                }
            }
        };

        // Recognition error handler
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.stopRecording();
            
            if (event.error === 'no-speech') {
                this.showVoiceMessage('No se detectó voz. Inténtalo de nuevo.');
            } else if (event.error === 'not-allowed') {
                this.showVoiceMessage('Permiso de micrófono denegado. Actívalo en la configuración del navegador.');
            } else {
                this.showVoiceMessage('Error al reconocer voz. Inténtalo de nuevo.');
            }
        };
    }

    startRecording() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!voiceBtn || !this.recognition) return;

        try {
            this.recognition.start();
            this.isRecording = true;
            this.lastSpeechTime = Date.now();
            
            // Update button UI
            voiceBtn.classList.remove('bg-gray-100', 'text-domus-navy');
            voiceBtn.classList.add('bg-domus-accent', 'text-white', 'animate-pulse');
            voiceBtn.innerHTML = '<i class="fas fa-stop text-sm md:text-base"></i>';
            voiceBtn.title = 'Click para detener (o espera 4s sin hablar)';
            
            // Show recording indicator
            this.showVoiceMessage('🎤 Escuchando... Habla con pausas normales', true);
            
            // ✅ NUEVO: Iniciar detección de silencio de 4 segundos
            this.startSilenceDetection();
            
            console.log('🎤 Grabación iniciada en modo continuo');
        } catch (error) {
            console.error('Error starting recording:', error);
            this.stopRecording();
        }
    }

    stopRecording() {
        const voiceBtn = document.getElementById('voiceBtn');
        if (!voiceBtn) return;

        if (this.recognition && this.isRecording) {
            try {
                this.recognition.stop();
            } catch (error) {
                console.error('Error stopping recording:', error);
            }
        }
        
        this.isRecording = false;
        
        // ✅ NUEVO: Limpiar timer de detección de silencio
        if (this.silenceTimer) {
            clearInterval(this.silenceTimer);
            this.silenceTimer = null;
        }
        
        // Reset button UI
        voiceBtn.classList.remove('bg-domus-accent', 'text-white', 'animate-pulse');
        voiceBtn.classList.add('bg-gray-100', 'text-domus-navy');
        voiceBtn.innerHTML = '<i class="fas fa-microphone text-sm md:text-base"></i>';
        voiceBtn.title = 'Mantén presionado para hablar';
        
        // Hide recording indicator
        this.hideVoiceMessage();
        
        console.log('🎤 Grabación detenida');
    }

    showVoiceMessage(message, isPersistent = false) {
        // Remove existing message if any
        this.hideVoiceMessage();
        
        const chatMessages = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.id = 'voiceMessage';
        messageDiv.className = 'voice-recording-indicator flex justify-center mb-4';
        messageDiv.innerHTML = `
            <div class="bg-domus-accent/10 text-domus-accent px-4 py-2 rounded-lg text-sm font-medium">
                ${message}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        this.scrollToBottom();
        
        // Auto-hide after 3 seconds if not persistent
        if (!isPersistent) {
            setTimeout(() => this.hideVoiceMessage(), 3000);
        }
    }

    hideVoiceMessage() {
        const voiceMessage = document.getElementById('voiceMessage');
        if (voiceMessage) {
            voiceMessage.remove();
        }
    }

    // ✅ NUEVO: Detección de silencio de 4 segundos
    startSilenceDetection() {
        // Limpiar timer existente si hay
        if (this.silenceTimer) {
            clearInterval(this.silenceTimer);
        }
        
        // Verificar cada 500ms si han pasado 4 segundos sin hablar
        this.silenceTimer = setInterval(() => {
            const timeSinceLastSpeech = Date.now() - this.lastSpeechTime;
            
            if (timeSinceLastSpeech >= 4000) { // 4 segundos
                console.log('🔇 4 segundos de silencio detectados, deteniendo grabación');
                this.showVoiceMessage('⏸️ Grabación detenida por silencio', false);
                this.stopRecording();
            }
        }, 500);
    }
    
    resetSilenceTimer() {
        // Simplemente actualizar el timestamp, el timer verifica automáticamente
        this.lastSpeechTime = Date.now();
    }

    // ===== AUTHENTICATION MODALS =====
    showAuthModal(type) {
        // This would show login/register modal
        // For now, just simulate quick registration
        if (type === 'register') {
            const name = prompt('¿Cuál es tu nombre?');
            if (name) {
                const userType = confirm('¿Eres agente profesional? (OK = Sí, Cancelar = Propietario particular)') ? 'profesional' : 'particular';
                
                this.userName = name;
                this.userType = userType;
                this.isAuthenticated = true;
                this.saveUserData();
                this.updateAuthButtons();
                
                alert(`¡Bienvenido/a ${name}! Ya puedes hablar con Sofía como ${userType}.`);
                this.openChat();
            }
        }
    }

    // ============================================
    // 🏠 CRM: PROPERTY DETECTION & MANAGEMENT
    // ============================================
    
    /**
     * Detectar propiedades en conversación (usuario + Sofía)
     */
    detectPropertyInConversation(userMessage, sofiaResponse) {
        // Verificar que PropertyDetector esté disponible
        if (!this.propertyDetector) {
            console.warn('⚠️ PropertyDetector no disponible');
            return;
        }
        
        // Combinar ambos mensajes para mejor detección
        const fullConversation = `${userMessage} ${sofiaResponse}`;
        
        // Detectar propiedad
        const propertyData = this.propertyDetector.extractPropertyData(fullConversation);
        
        if (propertyData && propertyData.confidence >= 40) {
            console.log('🏠 Propiedad detectada:', propertyData);
            
            // Mostrar modal de confirmación (con delay para no interrumpir lectura)
            setTimeout(() => {
                this.showPropertyConfirmationModal(propertyData, userMessage);
            }, 1500);
        }
    }
    
    /**
     * Mostrar modal de confirmación de propiedad
     */
    showPropertyConfirmationModal(propertyData, originalMessage) {
        // Verificar que el usuario tenga email (necesario para CRM)
        if (!this.userEmail) {
            console.log('⚠️ Usuario sin email, no se puede guardar en CRM');
            return;
        }
        
        // Crear modal si no existe
        let modal = document.getElementById('propertyModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'propertyModal';
            modal.className = 'property-modal hidden';
            document.body.appendChild(modal);
        }
        
        // Generar contenido del modal
        const summary = this.propertyDetector.generateSummary(propertyData);
        const display = this.propertyDetector.formatForDisplay(propertyData);
        
        modal.innerHTML = `
            <div class="property-modal-overlay" onclick="window.domusIA.closePropertyModal()"></div>
            <div class="property-modal-content">
                <div class="property-modal-header">
                    <h3>🏠 Propiedad detectada</h3>
                    <button onclick="window.domusIA.closePropertyModal()" class="property-modal-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div class="property-modal-body">
                    <div class="property-summary">
                        <p class="text-lg font-semibold text-gray-800 mb-3">${summary}</p>
                        <p class="text-sm text-gray-600 mb-4">${display}</p>
                    </div>
                    
                    <div class="property-confidence">
                        <div class="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Confianza de detección</span>
                            <span>${propertyData.confidence}%</span>
                        </div>
                        <div class="property-confidence-bar">
                            <div class="property-confidence-fill" style="width: ${propertyData.confidence}%"></div>
                        </div>
                    </div>
                    
                    <div class="property-details">
                        <h4 class="text-sm font-semibold text-gray-700 mb-2">📋 Detalles extraídos:</h4>
                        <ul class="text-sm text-gray-600 space-y-1">
                            ${propertyData.property_type ? `<li><strong>Tipo:</strong> ${propertyData.property_type}</li>` : ''}
                            ${propertyData.address ? `<li><strong>Dirección:</strong> ${propertyData.address}</li>` : ''}
                            ${propertyData.city ? `<li><strong>Ciudad:</strong> ${propertyData.city}</li>` : ''}
                            ${propertyData.price ? `<li><strong>Precio:</strong> ${this.propertyDetector.formatPrice(propertyData.price)}</li>` : ''}
                            ${propertyData.surface_m2 ? `<li><strong>Superficie:</strong> ${propertyData.surface_m2}m²</li>` : ''}
                            ${propertyData.rooms ? `<li><strong>Habitaciones:</strong> ${propertyData.rooms}</li>` : ''}
                            ${propertyData.bathrooms ? `<li><strong>Baños:</strong> ${propertyData.bathrooms}</li>` : ''}
                        </ul>
                    </div>
                </div>
                
                <div class="property-modal-footer">
                    <button onclick="window.domusIA.closePropertyModal()" class="property-btn-cancel">
                        ❌ No guardar
                    </button>
                    <button onclick="window.domusIA.savePropertyToCRM()" class="property-btn-save">
                        ✅ Guardar en CRM
                    </button>
                </div>
            </div>
        `;
        
        // Guardar datos temporalmente para cuando el usuario confirme
        this.tempPropertyData = {
            ...propertyData,
            userName: this.userName,
            userType: this.userType,
            raw_text: originalMessage
        };
        
        // Mostrar modal con animación
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
    }
    
    /**
     * Cerrar modal de propiedad
     */
    closePropertyModal() {
        const modal = document.getElementById('propertyModal');
        if (modal) {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        }
        this.tempPropertyData = null;
    }
    
    /**
     * Guardar propiedad en CRM (llamada API)
     */
    async savePropertyToCRM() {
        if (!this.tempPropertyData || !this.userEmail) {
            console.error('❌ No hay datos de propiedad o email');
            return;
        }
        
        // IMPORTANTE: Guardar referencia a los datos ANTES de cerrar el modal
        const propertyDataToSave = { ...this.tempPropertyData };
        
        // Cerrar modal
        this.closePropertyModal();
        
        // Mostrar mensaje de guardando
        this.addMessage('assistant', '💾 Guardando propiedad en tu CRM...', false);
        
        try {
            console.log('📤 Enviando datos al backend:', {
                userEmail: this.userEmail,
                propertyData: propertyDataToSave
            });
            
            const response = await fetch('/api/properties', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userEmail: this.userEmail,
                    propertyData: propertyDataToSave
                })
            });
            
            const data = await response.json();
            
            console.log('📥 Respuesta del backend:', {
                status: response.status,
                ok: response.ok,
                data: data
            });
            
            if (response.ok && data.success) {
                // Éxito
                const summary = this.propertyDetector.generateSummary(propertyDataToSave);
                this.addMessage('assistant', 
                    `✅ ¡Propiedad guardada exitosamente en tu CRM!\n\n` +
                    `📍 ${summary}\n` +
                    `🆔 ID: ${data.property.id.substring(0, 8)}...\n\n` +
                    `Puedes verla en tu panel CRM cuando lo implementemos en la Fase 5.`, 
                    false
                );
                
                console.log('✅ Propiedad guardada:', data.property);
            } else {
                throw new Error(data.error || 'Error desconocido');
            }
        } catch (error) {
            console.error('❌ Error guardando propiedad:', error);
            this.addMessage('assistant', 
                `⚠️ No pude guardar la propiedad en el CRM. ` +
                `Esto puede ser porque la base de datos aún no está configurada. ` +
                `Error: ${error.message}`, 
                false
            );
        } finally {
            // Ya se limpió en closePropertyModal
        }
    }
}

// ===== CONTACT MODAL =====
function openContactModal(event) {
    if (event) event.preventDefault();
    
    // Crear modal de contacto si no existe
    let contactModal = document.getElementById('contactModal');
    if (!contactModal) {
        contactModal = document.createElement('div');
        contactModal.id = 'contactModal';
        contactModal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
        contactModal.innerHTML = `
            <div class="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                <button onclick="closeContactModal()" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                    <i class="fas fa-times text-xl"></i>
                </button>
                
                <h2 class="text-2xl font-bold text-domus-navy mb-4">Contáctanos</h2>
                <p class="text-domus-sage mb-6">¿Tienes alguna pregunta? Estamos aquí para ayudarte.</p>
                
                <div class="space-y-4">
                    <!-- Email -->
                    <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <i class="fas fa-envelope text-domus-accent text-xl"></i>
                        <div>
                            <p class="text-sm text-domus-sage">Email</p>
                            <a href="mailto:soporte@domus-ia.com" class="text-domus-navy font-semibold hover:text-domus-accent">
                                soporte@domus-ia.com
                            </a>
                        </div>
                    </div>
                    
                    <!-- Teléfono -->
                    <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <i class="fas fa-phone text-domus-accent text-xl"></i>
                        <div>
                            <p class="text-sm text-domus-sage">Teléfono</p>
                            <a href="tel:+34900123456" class="text-domus-navy font-semibold hover:text-domus-accent">
                                +34 900 123 456
                            </a>
                        </div>
                    </div>
                    
                    <!-- WhatsApp -->
                    <div class="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <i class="fab fa-whatsapp text-domus-accent text-xl"></i>
                        <div>
                            <p class="text-sm text-domus-sage">WhatsApp</p>
                            <a href="https://wa.me/34900123456" target="_blank" class="text-domus-navy font-semibold hover:text-domus-accent">
                                Chatear por WhatsApp
                            </a>
                        </div>
                    </div>
                    
                    <!-- Chat con Sofía -->
                    <button onclick="closeContactModal(); openChatWindow();" class="w-full bg-gradient-to-r from-domus-silver to-domus-accent text-white py-3 rounded-lg hover:opacity-90 transition-all font-semibold">
                        <i class="fas fa-comment-dots mr-2"></i>
                        O chatea con Sofía IA
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(contactModal);
    }
    
    contactModal.classList.remove('hidden');
}

function closeContactModal() {
    const contactModal = document.getElementById('contactModal');
    if (contactModal) {
        contactModal.classList.add('hidden');
    }
}

function openChatWindow(event) {
    if (event) event.preventDefault();
    if (window.domusIA) {
        window.domusIA.openChat();
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.domusIA = new DomusIA();
});

// ===== GLOBAL UTILITIES =====
window.openChat = () => window.domusIA.openChat();
window.closeChat = () => window.domusIA.closeChat();
window.openContactModal = openContactModal;
window.closeContactModal = closeContactModal;
window.openChatWindow = openChatWindow;

// ===== DIAGNOSTIC FUNCTION =====
window.diagnosticoChat = function() {
    console.log('🔍 === DIAGNÓSTICO DEL CHAT ===');
    
    const chatModal = document.getElementById('chatModal');
    const closeChatBtn = document.getElementById('closeChatBtn');
    const chatForm = document.getElementById('chatForm');
    
    console.log('chatModal existe:', !!chatModal);
    console.log('closeChatBtn existe:', !!closeChatBtn);
    console.log('chatForm existe:', !!chatForm);
    
    if (chatModal) {
        console.log('chatModal clases:', chatModal.className);
        console.log('chatModal está visible:', !chatModal.classList.contains('hidden'));
    }
    
    if (closeChatBtn) {
        console.log('closeChatBtn clases:', closeChatBtn.className);
        console.log('closeChatBtn computed style display:', window.getComputedStyle(closeChatBtn).display);
        console.log('closeChatBtn computed style pointer-events:', window.getComputedStyle(closeChatBtn).pointerEvents);
        console.log('closeChatBtn onclick:', closeChatBtn.onclick);
        
        // Intentar click programático
        console.log('🧪 Intentando click programático...');
        closeChatBtn.click();
    }
    
    console.log('=== FIN DIAGNÓSTICO ===');
};

// ===== DALL-E IMAGE ACTIONS =====
/**
 * Descargar imagen DALL-E
 */
window.downloadDalleImage = function(imageUrl) {
    console.log('📥 Descargando imagen:', imageUrl);
    
    // Abrir en nueva pestaña (el usuario puede hacer clic derecho y guardar)
    window.open(imageUrl, '_blank');
    
    console.log('✅ Imagen abierta en nueva pestaña');
};

/**
 * Editar imagen DALL-E (pide a Sofía que la edite)
 */
window.editDalleImage = function(imageUrl) {
    console.log('✏️ Solicitar edición de imagen:', imageUrl);
    
    // Enfocar el input del chat
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.value = 'Quiero editar esta imagen: ';
        chatInput.focus();
        
        // Scroll al input en mobile
        if (window.domusIA && window.domusIA.isMobile()) {
            chatInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
    
    console.log('💡 Usuario debe especificar qué cambios quiere hacer');
};

/**
 * Crear variación de imagen DALL-E
 */
window.createVariation = function(imageUrl) {
    console.log('🎨 Solicitar variación de imagen:', imageUrl);
    
    // Enviar mensaje automático a Sofía
    const chatInput = document.getElementById('chatInput');
    if (chatInput && window.domusIA) {
        chatInput.value = 'Crea una variación creativa de la última imagen que generaste, manteniendo el estilo general pero con cambios artísticos interesantes.';
        
        // Simular envío automático
        const sendButton = document.querySelector('button[onclick*="sendMessage"]');
        if (sendButton) {
            setTimeout(() => {
                sendButton.click();
            }, 300);
        }
    }
    
    console.log('✅ Solicitando variación a Sofía');
};

// ===== SERVICE WORKER REGISTRATION =====
// TEMPORALMENTE DESACTIVADO para debugging backend
/*
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
            })
            .catch((registrationError) => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
*/
