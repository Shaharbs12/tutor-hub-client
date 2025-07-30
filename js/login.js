// Login page functionality

const Login = {
    init() {
        this.bindEvents();
        console.log('Login page initialized');
    },
    
    bindEvents() {
        const form = document.getElementById('login-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = form.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });
    },
    
    async handleSubmit(e) {
        e.preventDefault();
        
        const submitBtn = document.getElementById('submit-btn');
        const formData = new FormData(e.target);
        
        // Validate form
        if (!this.validateForm()) {
            return;
        }
        
        // Show loading state
        this.setLoadingState(true);
        
        try {
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };
            
            console.log('Logging in user:', { email: loginData.email });
            
            const response = await API.post('/auth/login', loginData);
            
            if (response.token) {
                // Store token and user data
                localStorage.setItem('tutorHub_token', response.token);
                localStorage.setItem('tutorHub_user', JSON.stringify(response.user));
                
                this.showMessage('Login successful! Redirecting...', 'success');
                
                // Redirect based on user type
                setTimeout(() => {
                    const userType = response.user.userType;
                    if (userType === 'tutor') {
                        window.location.href = 'tutor-dashboard.html';
                    } else {
                        window.location.href = 'subjects.html'; // Redirect student to subjects page
                    }
                }, 2000);
            }
            
        } catch (error) {
            console.error('Login error:', error);
            this.showMessage(error.message || 'Login failed. Please check your credentials.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    },
    
    validateForm() {
        let isValid = true;
        const form = document.getElementById('login-form');
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Email validation
        const email = form.querySelector('#email');
        if (!Utils.isValidEmail(email.value)) {
            this.showFieldError(email, 'Please enter a valid email address');
            isValid = false;
        }
        
        return isValid;
    },
    
    validateField(field) {
        const value = field.value.trim();
        
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'This field is required');
            return false;
        }
        
        if (field.type === 'email' && value && !Utils.isValidEmail(value)) {
            this.showFieldError(field, 'Please enter a valid email address');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    },
    
    showFieldError(field, message) {
        this.clearFieldError(field);
        
        field.classList.add('error');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            color: #ff4757;
            font-size: 12px;
            margin-top: 5px;
            animation: slideInFromTop 0.3s ease;
        `;
        
        field.parentNode.appendChild(errorDiv);
    },
    
    clearFieldError(field) {
        field.classList.remove('error');
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    },
    
    setLoadingState(loading) {
        const submitBtn = document.getElementById('submit-btn');
        const form = document.getElementById('login-form');
        
        if (loading) {
            submitBtn.classList.add('loading');
            submitBtn.disabled = true;
            form.style.pointerEvents = 'none';
        } else {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            form.style.pointerEvents = 'auto';
        }
    },
    
    showMessage(message, type) {
        const container = document.getElementById('message-container');
        container.innerHTML = '';
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `${type}-message`;
        messageDiv.textContent = message;
        
        container.appendChild(messageDiv);
        
        // Auto-remove error messages after 5 seconds
        if (type === 'error') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 5000);
        }
    }
};

// Global functions
function goBack() {
    window.history.back();
}

function goHome() {
    window.location.href = '../index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Login.init();
}); 