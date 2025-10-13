// Domus-IA España - Main JavaScript
// Author: MontCastell-AI
// Version: 1.0.0

class DomusIA {
    constructor() {
        this.isAuthenticated = false;
        this.userType = null; // 'particular', 'profesional', or null
        this.userName = null;
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
        
        this.init();
    }

    init() {
        this.loadUserData();
        this.bindEvents();
        this.updateUI();
        this.startCountdown();
        this.loadConversationHistory();
    }

    // ===== USER DATA MANAGEMENT =====
    loadUserData() {
        const userData = localStorage.getItem('domusIAEspana_userData');
        if (userData) {
            const data = JSON.parse(userData);
            this.isAuthenticated = data.isAuthenticated || false;
            this.userType = data.userType || null;
            this.userName = data.userName || null;
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
        }
    }

    saveUserData() {
        const userData = {
            isAuthenticated: this.isAuthenticated,
            userType: this.userType,
            userName: this.userName,
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
        document.getElementById('startChatBtn').addEventListener('click', () => this.openChat());
        document.getElementById('loginBtn').addEventListener('click', () => this.showAuthModal('login'));
        document.getElementById('registerBtn').addEventListener('click', () => this.showAuthModal('register'));
        
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
        
        if (mobileLoginBtn) {
            mobileLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAuthModal('login');
            });
        }
        
        // Chat functionality
        document.getElementById('closeChatBtn').addEventListener('click', () => this.closeChat());
        document.getElementById('chatForm').addEventListener('submit', (e) => this.handleChatSubmit(e));
        
        // File upload buttons
        this.initFileUpload();
        
        // Voice recording
        this.initVoiceRecording();
        
        // Modal backdrop clicks
        document.getElementById('chatModal').addEventListener('click', (e) => {
            if (e.target.id === 'chatModal') this.closeChat();
        });

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

    updateAuthButtons() {
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        
        if (this.isAuthenticated && this.userName) {
            loginBtn.textContent = `Hola, ${this.userName}`;
            registerBtn.textContent = 'Mi Cuenta';
        } else {
            loginBtn.textContent = 'Acceder';
            registerBtn.textContent = 'Comenzar Gratis';
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
        
        // Focus on input (delayed for mobile)
        setTimeout(() => {
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
                chatInput.focus();
            }
        }, this.isMobile() ? 300 : 100);
    }

    closeChat() {
        const chatModal = document.getElementById('chatModal');
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
    }

    initializeChat() {
        const welcomeMessage = this.getWelcomeMessage();
        this.addMessage('assistant', welcomeMessage, false);
        
        // API status check removed - GPT-4o is always active
        // No need to show demo message since backend is configured
    }

    getWelcomeMessage() {
        if (!this.isAuthenticated) {
            return "¡Hola! Soy Sofía, tu SuperAgente Inmobiliario General. Para brindarte la mejor ayuda, ¿podrías decirme tu nombre y si eres propietario particular o agente profesional?";
        }
        
        if (this.userType === 'particular') {
            return `¡Hola ${this.userName}! Como propietario particular, puedo ayudarte con estudios de mercado, preparación de tu inmueble, documentación, publicaciones de calidad y todo el proceso de venta. ¿En qué puedo asistirte hoy?`;
        } else if (this.userType === 'profesional') {
            return `¡Hola ${this.userName}! Como agente profesional, puedo ayudarte con formación avanzada, construcción de marca, captación premium, estrategias de negociación y todas las herramientas para hacer crecer tu negocio. ¿Qué necesitas?`;
        }
        
        return "¡Hola! Soy Sofía, tu SuperAgente Inmobiliario. ¿En qué puedo ayudarte hoy?";
    }

    async handleChatSubmit(e) {
        e.preventDefault();
        
        const input = document.getElementById('chatInput');
        const message = input.value.trim();
        
        // Permitir envío si hay mensaje o archivo
        if (!message && !this.currentFile) return;
        
        // Si no hay mensaje pero sí archivo, usar mensaje por defecto
        const finalMessage = message || (this.currentFileType === 'image' ? 
            '¿Qué ves en esta imagen?' : 
            'Por favor analiza este documento');
        
        // Check message limits for free users (TEMPORALMENTE DESACTIVADO)
        // TODO: Reactivar cuando Stripe esté conectado
        /*
        if (this.subscriptionPlan === 'free' && this.dailyMessageCount >= this.dailyMessageLimit) {
            this.showSubscriptionPrompt();
            return;
        }
        */
        
        // Guardar archivo actual para procesamiento
        const fileToProcess = this.currentFile;
        const fileTypeToProcess = this.currentFileType;
        const documentTextToProcess = this.currentDocumentText; // 🔥 GUARDAR TEXTO EXTRAÍDO
        
        // Clear input and file
        input.value = '';
        this.clearFileUpload();
        
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
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Process message with file if exists
            const response = await this.processMessage(finalMessage, fileToProcess, fileTypeToProcess, documentTextToProcess);
            this.hideTypingIndicator();
            
            // Add message with typing effect
            this.addMessage('assistant', response, true);
            
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

    async processMessage(message, file = null, fileType = null, documentText = null) {
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
        
        // Process with AI (con archivo si existe)
        return await this.generateAIResponse(message, file, fileType, documentText);
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
        
        this.saveUserData();
        this.updateAuthButtons();
        
        if (this.userType === 'particular') {
            return `¡Perfecto, ${this.userName || 'propietario'}! Como propietario particular, puedo ayudarte en todo el proceso de venta: desde el estudio de mercado hasta la firma en notaría. Te ofrezco consejos sobre preparación del inmueble, documentación necesaria, estrategias de precio y negociación con compradores. ¿Qué aspecto te interesa más?`;
        } else if (this.userType === 'profesional') {
            return `¡Excelente, ${this.userName || 'profesional'}! Como agente inmobiliario, tengo formación especializada de MontCastell-AI para ayudarte a construir tu marca, captar clientes premium, gestionar encargos VIP y cerrar más ventas. Puedo asesorarte en construcción de empresa, imagen corporativa, estrategias de captación y negociación avanzada. ¿En qué área quieres empezar?`;
        }
        
        return `Gracias ${this.userName || ''}. Para personalizar mejor mi ayuda, ¿podrías decirme si eres propietario particular que quiere vender o agente inmobiliario profesional?`;
    }

    async generateAIResponse(message, file = null, fileType = null, documentText = null) {
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
                    userPlan: this.subscriptionPlan || 'particular',
                    webSearch: 'auto'  // Búsqueda automática cuando sea necesario
                };
                
                // Añadir imagen si existe
                if (file && fileType === 'image') {
                    console.log('👁️ Enviando imagen para análisis Vision...');
                    const base64 = await this.fileToBase64(file);
                    requestBody.imageFile = base64.split(',')[1]; // Quitar prefijo data:image...
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
                    hasDocumentText: !!requestBody.documentText,
                    documentTextLength: requestBody.documentText?.length || 0,
                    documentTextPreview: requestBody.documentText?.substring(0, 100) || 'N/A'
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
                        
                        // 🎨 DETECCIÓN AUTOMÁTICA DE GENERACIÓN DE IMÁGENES
                        // Si Sofía dice que va a generar una imagen, hacerlo automáticamente
                        const imageGenTriggers = [
                            'voy a generar',
                            'generaré',
                            'crearemos',
                            'voy a crear',
                            'te genero',
                            'te creo',
                            'haré',
                            'crear una imagen',
                            'generar una imagen'
                        ];
                        
                        const shouldGenerateImage = imageGenTriggers.some(trigger => 
                            finalMessage.toLowerCase().includes(trigger)
                        );
                        
                        if (shouldGenerateImage) {
                            console.log('🎨 Sofía quiere generar imagen - Activando DALL-E automáticamente...');
                            
                            // Extraer descripción de la imagen del mensaje
                            // Buscar entre comillas o después de "imagen de/con/que"
                            let imagePrompt = message; // Usar mensaje original del usuario como base
                            
                            // Llamar a DALL-E automáticamente
                            setTimeout(async () => {
                                try {
                                    console.log('🎨 Generando imagen con DALL-E:', imagePrompt);
                                    const imageResult = await this.sofiaAI.generateImage(imagePrompt);
                                    
                                    if (imageResult && imageResult.url) {
                                        // Añadir imagen generada al chat
                                        const imageHtml = `<div class="generated-image-container mt-4 p-4 bg-gray-50 rounded-lg">
                                            <p class="text-sm text-gray-600 mb-2">✨ Imagen generada con DALL-E 3:</p>
                                            <img src="${imageResult.url}" alt="Imagen generada" class="w-full rounded-lg shadow-md" />
                                            <p class="text-xs text-gray-500 mt-2">${imageResult.revised_prompt || imagePrompt}</p>
                                        </div>`;
                                        
                                        // Añadir al último mensaje de Sofía
                                        const lastAssistantMessage = document.querySelector('.message.assistant:last-child .message-content');
                                        if (lastAssistantMessage) {
                            lastAssistantMessage.innerHTML += imageHtml;
                                            this.scrollToBottom();
                                        }
                                    }
                                } catch (error) {
                                    console.error('❌ Error generando imagen automáticamente:', error);
                                    // Añadir mensaje de error al chat
                                    const errorMsg = `<p class="text-red-600 mt-2">⚠️ Lo siento, hubo un problema al generar la imagen. ¿Puedes intentarlo de nuevo?</p>`;
                                    const lastAssistantMessage = document.querySelector('.message.assistant:last-child .message-content');
                                    if (lastAssistantMessage) {
                                        lastAssistantMessage.innerHTML += errorMsg;
                                    }
                                }
                            }, 1000); // Esperar 1 segundo después de mostrar el mensaje
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
        
        // Si hay archivo, dar respuesta especial
        if (file) {
            if (fileType === 'image') {
                return "🖼️ He visto tu imagen. En modo demo no puedo analizarla completamente, pero una vez conectado a OpenAI Vision podré identificar características de la propiedad, detectar problemas, sugerir mejoras de home staging, y más.";
            } else {
                return "📄 He recibido tu documento. En modo demo no puedo procesarlo, pero cuando esté conectado podré extraer información clave, analizar contratos, revisar escrituras, y darte un resumen ejecutivo.";
            }
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
            const reader = new FileReader();
            reader.onload = async function() {
                try {
                    // Configure PDF.js worker
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                    
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
    }
    
    formatMessageContent(content) {
        // Convertir markdown-style bold PRIMERO
        let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Separar por párrafos (doble salto de línea o punto seguido de salto)
        // Esto crea párrafos más naturales
        formatted = formatted
            .replace(/\.\s*\n/g, '.</p><p class="mb-4">') // Punto + salto = nuevo párrafo
            .replace(/\n\n+/g, '</p><p class="mb-4">') // Doble salto = nuevo párrafo
            .replace(/\n/g, ' '); // Salto simple = espacio
        
        // Envolver en párrafos si no está ya envuelto
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
    
    async typeMessage(element, content, speed = 60) {
        // 🚀 MODO INSTANTÁNEO: Mostrar todo el mensaje de una vez
        element.innerHTML = content;
        return Promise.resolve();
        
        /* CÓDIGO ORIGINAL DEL EFECTO TYPING (DESACTIVADO)
        // Speed: characters per second (60 = rápido pero legible)
        const delay = 1000 / speed;
        
        // Remove HTML tags for character-by-character typing
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const textContent = tempDiv.textContent || tempDiv.innerText;
        
        let currentText = '';
        let currentIndex = 0;
        
        return new Promise((resolve) => {
            const typeChar = () => {
                if (currentIndex < textContent.length) {
                    currentText += textContent[currentIndex];
                    
                    // Re-apply formatting to visible text
                    element.innerHTML = this.formatMessageContent(currentText);
                    
                    currentIndex++;
                    
                    // Auto-scroll during typing
                    this.scrollToBottom();
                    
                    setTimeout(typeChar, delay);
                } else {
                    // Ensure final formatted content is displayed
                    element.innerHTML = content;
                    this.scrollToBottom();
                    resolve();
                }
            };
            
            typeChar();
        */
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

    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typingIndicator';
        typingDiv.className = 'flex justify-start mb-4';
        typingDiv.innerHTML = `
            <div class="flex space-x-3">
                <img src="images/sofia-avatar.jpg" alt="Sofía" class="w-10 h-10 rounded-full object-cover flex-shrink-0 shadow-md">
                <div class="typing-indicator">
                    <div class="typing-dots">
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                        <div class="typing-dot"></div>
                    </div>
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
    showSubscriptionPrompt() {
        this.addMessage('assistant', `Has alcanzado el límite de 15 mensajes diarios del plan gratuito. Para continuar con acceso ilimitado y todas las funcionalidades avanzadas de Sofía, puedes suscribirte a un plan premium.
        
        🏠 **Plan Particular** - €99/mes (antes €299)
        💼 **Plan Profesional** - €199/mes (antes €499)
        
        Los precios promocionales son válidos hasta el 31 de diciembre de 2025. ¿Te gustaría conocer más detalles?`);
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
    
    handleImageUpload(file) {
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
        
        this.currentFile = file;
        this.currentFileType = 'image';
        
        // Mostrar preview
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
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.maxAlternatives = 1;

        this.isRecording = false;

        // Voice button click handler
        voiceBtn.addEventListener('click', () => {
            if (this.isRecording) {
                this.stopRecording();
            } else {
                this.startRecording();
            }
        });

        // Recognition result handler
        this.recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const chatInput = document.getElementById('chatInput');
            
            // Append to existing text or replace
            if (chatInput.value.trim()) {
                chatInput.value += ' ' + transcript;
            } else {
                chatInput.value = transcript;
            }
            
            // Focus input
            chatInput.focus();
        };

        // Recognition end handler
        this.recognition.onend = () => {
            this.stopRecording();
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
            
            // Update button UI
            voiceBtn.classList.remove('bg-gray-100', 'text-domus-navy');
            voiceBtn.classList.add('bg-domus-accent', 'text-white', 'animate-pulse');
            voiceBtn.innerHTML = '<i class="fas fa-stop"></i>';
            voiceBtn.title = 'Click para detener';
            
            // Show recording indicator
            this.showVoiceMessage('🎤 Escuchando... Habla ahora', true);
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
        
        // Reset button UI
        voiceBtn.classList.remove('bg-domus-accent', 'text-white', 'animate-pulse');
        voiceBtn.classList.add('bg-gray-100', 'text-domus-navy');
        voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        voiceBtn.title = 'Click para hablar';
        
        // Hide recording indicator
        this.hideVoiceMessage();
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
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    window.domusIA = new DomusIA();
});

// ===== GLOBAL UTILITIES =====
window.openChat = () => window.domusIA.openChat();
window.closeChat = () => window.domusIA.closeChat();

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
}
*/
