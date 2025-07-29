// Chat page functionality

const Chat = {
    currentConversation: null,
    currentUser: null,
    chatPartner: null,
    messages: [],
    isTyping: false,
    
    init() {
        this.loadUserData();
        this.getChatPartnerFromURL();
        this.setupEventListeners();
        this.loadConversation();
        console.log('Chat page initialized');
    },
    
    loadUserData() {
        const userData = localStorage.getItem('tutorHub_user');
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
    },
    
    getChatPartnerFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const tutorId = urlParams.get('tutor');
        
        // Try to get partner info from localStorage (set from tutor profile)
        const chatTutor = localStorage.getItem('chatTutor');
        if (chatTutor) {
            this.chatPartner = JSON.parse(chatTutor);
        } else if (tutorId) {
            // Fallback for direct URL access
            this.chatPartner = {
                id: tutorId,
                name: 'Tutor',
                avatar: 'T'
            };
        }
        
        this.updateChatHeader();
    },
    
    updateChatHeader() {
        if (this.chatPartner) {
            const avatar = document.getElementById('chat-avatar');
            const username = document.getElementById('chat-username');
            
            if (avatar) avatar.textContent = this.chatPartner.avatar || this.chatPartner.name.charAt(0);
            if (username) username.textContent = this.chatPartner.name || 'Chat';
        }
    },
    
    setupEventListeners() {
        const messageInput = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        // Input events
        messageInput.addEventListener('input', () => this.handleInputChange());
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Send button
        sendButton.addEventListener('click', () => this.sendMessage());
        
        // Quick actions
        document.addEventListener('click', (e) => {
            const actionBtn = e.target.closest('.quick-action-btn');
            if (actionBtn) {
                this.handleQuickAction(actionBtn.dataset.action);
            }
        });
        
        // Navigation
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.handleNavigation(navItem.dataset.page);
            }
        });
    },
    
    handleInputChange() {
        const input = document.getElementById('message-input');
        const sendButton = document.getElementById('send-button');
        
        const hasText = input.value.trim().length > 0;
        sendButton.disabled = !hasText;
        
        if (hasText) {
            sendButton.style.background = '#4A90E2';
        } else {
            sendButton.style.background = '#ccc';
        }
    },
    
    async loadConversation() {
        if (!this.chatPartner) {
            this.showEmptyState();
            return;
        }
        
        try {
            this.showLoading(true);
            
            // Try to load from API first
            try {
                const response = await API.get(`/conversations?partnerId=${this.chatPartner.id}`);
                this.currentConversation = response.conversation;
                this.messages = response.messages || [];
            } catch (error) {
                console.log('API not available, using mock data');
                this.loadMockConversation();
            }
            
            this.renderMessages();
            
        } catch (error) {
            console.error('Failed to load conversation:', error);
            this.loadMockConversation();
            this.renderMessages();
        } finally {
            this.showLoading(false);
        }
    },
    
    loadMockConversation() {
        // Sample conversation based on database seed data
        this.messages = [
            {
                id: 1,
                senderUserId: this.chatPartner.id,
                messageText: `Hello! I'd be happy to help you with your studies. What specific topics are you working on?`,
                messageType: 'text',
                isRead: true,
                createdAt: new Date(Date.now() - 3600000) // 1 hour ago
            },
            {
                id: 2,
                senderUserId: this.currentUser?.id || 'current',
                messageText: `Hi! I need help with calculus derivatives. I'm struggling with the chain rule and product rule.`,
                messageType: 'text',
                isRead: true,
                createdAt: new Date(Date.now() - 3000000) // 50 minutes ago
            },
            {
                id: 3,
                senderUserId: this.chatPartner.id,
                messageText: `Perfect! Those are common challenges. How about we schedule a session tomorrow at 3 PM? We can work through several examples together.`,
                messageType: 'text',
                isRead: false,
                createdAt: new Date(Date.now() - 1800000) // 30 minutes ago
            }
        ];
    },
    
    renderMessages() {
        const container = document.getElementById('messages-container');
        
        if (this.messages.length === 0) {
            this.showEmptyState();
            return;
        }
        
        container.innerHTML = '';
        
        this.messages.forEach(message => {
            const messageElement = this.createMessageElement(message);
            container.appendChild(messageElement);
        });
        
        // Scroll to bottom
        this.scrollToBottom();
    },
    
    createMessageElement(message) {
        const messageDiv = document.createElement('div');
        const isCurrentUser = message.senderUserId === this.currentUser?.id || message.senderUserId === 'current';
        
        messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
        
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.textContent = message.messageText;
        
        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = this.formatMessageTime(message.createdAt);
        
        messageDiv.appendChild(bubble);
        messageDiv.appendChild(time);
        
        // Add read status for sent messages
        if (isCurrentUser) {
            const status = document.createElement('div');
            status.className = `message-status ${message.isRead ? 'read' : 'sent'}`;
            status.textContent = message.isRead ? '✓✓' : '✓';
            messageDiv.appendChild(status);
        }
        
        return messageDiv;
    },
    
    formatMessageTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) {
            return 'Just now';
        } else if (diffInMinutes < 60) {
            return `${diffInMinutes}m ago`;
        } else if (diffInMinutes < 1440) {
            const hours = Math.floor(diffInMinutes / 60);
            return `${hours}h ago`;
        } else {
            return date.toLocaleDateString();
        }
    },
    
    async sendMessage() {
        const input = document.getElementById('message-input');
        const messageText = input.value.trim();
        
        if (!messageText) return;
        
        // Clear input immediately
        input.value = '';
        this.handleInputChange();
        
        // Create temporary message object
        const tempMessage = {
            id: Date.now(),
            senderUserId: this.currentUser?.id || 'current',
            messageText: messageText,
            messageType: 'text',
            isRead: false,
            createdAt: new Date()
        };
        
        // Add to messages array and render
        this.messages.push(tempMessage);
        this.renderMessages();
        
        try {
            // Try to send via API
            const response = await API.post('/messages', {
                conversationId: this.currentConversation?.id,
                recipientId: this.chatPartner.id,
                messageText: messageText,
                messageType: 'text'
            });
            
            // Update the temporary message with server response
            const messageIndex = this.messages.findIndex(m => m.id === tempMessage.id);
            if (messageIndex >= 0) {
                this.messages[messageIndex] = response.message;
                this.renderMessages();
            }
            
        } catch (error) {
            console.log('Message sent locally (API not available)');
            
            // Simulate tutor response after delay
            setTimeout(() => {
                this.simulateTutorResponse(messageText);
            }, 2000);
        }
    },
    
    simulateTutorResponse(originalMessage) {
        // Show typing indicator
        this.showTypingIndicator();
        
        setTimeout(() => {
            this.hideTypingIndicator();
            
            // Generate contextual response
            let response = this.generateTutorResponse(originalMessage);
            
            const responseMessage = {
                id: Date.now() + 1,
                senderUserId: this.chatPartner.id,
                messageText: response,
                messageType: 'text',
                isRead: false,
                createdAt: new Date()
            };
            
            this.messages.push(responseMessage);
            this.renderMessages();
        }, 1500);
    },
    
    generateTutorResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! How can I help you with your studies today?";
        } else if (lowerMessage.includes('math') || lowerMessage.includes('calculus')) {
            return "Great! I love helping with math. What specific topic would you like to work on?";
        } else if (lowerMessage.includes('when') || lowerMessage.includes('schedule')) {
            return "I'm available most weekdays from 2-6 PM. What works best for you?";
        } else if (lowerMessage.includes('thank')) {
            return "You're very welcome! I'm here to help you succeed. 😊";
        } else if (lowerMessage.includes('payment') || lowerMessage.includes('price')) {
            return "My rate is ₪150 per hour. We can discuss payment methods that work for you.";
        } else {
            return "That's a great question! Let me help you work through this step by step.";
        }
    },
    
    showTypingIndicator() {
        const container = document.getElementById('messages-container');
        
        const typingDiv = document.createElement('div');
        typingDiv.id = 'typing-indicator';
        typingDiv.className = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <span>Typing</span>
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        `;
        
        container.appendChild(typingDiv);
        this.scrollToBottom();
    },
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    },
    
    handleQuickAction(action) {
        switch (action) {
            case 'payment':
                this.showPaymentOptions();
                break;
            default:
                console.log('Quick action:', action);
        }
    },
    
    showPaymentOptions() {
        // Add a system message about payment
        const paymentMessage = {
            id: Date.now(),
            senderUserId: 'system',
            messageText: 'Payment methods: Credit Card, PayPal, Bank Transfer',
            messageType: 'payment',
            isRead: true,
            createdAt: new Date()
        };
        
        this.messages.push(paymentMessage);
        this.renderMessages();
    },
    
    handleNavigation(page) {
        switch (page) {
            case 'search':
                window.location.href = 'subjects.html';
                break;
            case 'chat':
                // Already on chat page
                break;
            case 'profile':
                window.location.href = 'profile.html';
                break;
        }
    },
    
    scrollToBottom() {
        const container = document.getElementById('messages-container');
        setTimeout(() => {
            container.scrollTop = container.scrollHeight;
        }, 100);
    },
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        const messages = document.getElementById('messages-container');
        
        if (show) {
            loading.style.display = 'flex';
            messages.style.display = 'none';
        } else {
            loading.style.display = 'none';
            messages.style.display = 'block';
        }
    },
    
    showEmptyState() {
        const emptyState = document.getElementById('empty-state');
        const messages = document.getElementById('messages-container');
        
        emptyState.style.display = 'flex';
        messages.style.display = 'none';
    }
};

// Global functions
function goBack() {
    // Go back to previous page or tutor profile
    if (document.referrer.includes('tutor-profile')) {
        window.history.back();
    } else {
        window.location.href = 'subjects.html';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Chat.init();
});