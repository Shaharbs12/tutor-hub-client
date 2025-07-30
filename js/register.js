// Registration page functionality

const Register = {
    userType: null,
    
    init() {
        this.getUserTypeFromURL();
        this.setupForm();
        this.bindEvents();
        console.log('Registration page initialized for:', this.userType);
    },
    
    getUserTypeFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.userType = urlParams.get('type') || 'student';
        
        // Update UI based on user type
        document.body.className = `${this.userType}-mode`;
        this.updateFormForUserType();
    },
    
    updateFormForUserType() {
        const specialtyGroup = document.getElementById('specialty-group');
        const learningGoalGroup = document.getElementById('learning-goal-group');
        
        if (this.userType === 'tutor') {
            specialtyGroup.style.display = 'flex';
            learningGoalGroup.style.display = 'none';
        } else {
            specialtyGroup.style.display = 'none';
            learningGoalGroup.style.display = 'flex';
        }
    },
    
    setupForm() {
        const form = document.getElementById('registration-form');
        const submitBtn = document.getElementById('submit-btn');
        
        // Update button text based on user type
        const btnText = submitBtn.querySelector('.btn-text');
        btnText.textContent = 'Continue';
    },
    
    bindEvents() {
        const form = document.getElementById('registration-form');
        form.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, select');
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
            const registrationData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                password: formData.get('password'),
                phone: formData.get('phone'),
                city: formData.get('city'),
                userType: this.userType,
                languagePreference: App.currentLanguage || 'en'
            };
            
            // Add user type specific data
            if (this.userType === 'tutor') {
                registrationData.specialty = formData.get('specialty');
            } else {
                registrationData.learningGoal = formData.get('learningGoal');
            }
            
            console.log('Registering user:', registrationData);
            
            const response = await API.post('/auth/register', registrationData);
            
            if (response.token) {
                // Store token
                localStorage.setItem('tutorHub_token', response.token);
                localStorage.setItem('tutorHub_user', JSON.stringify(response.user));
                
                this.showMessage('Registration successful! Redirecting...', 'success');
                
                // Redirect based on user type
                setTimeout(() => {
                    if (this.userType === 'tutor') {
                        window.location.href = 'tutor-dashboard.html';
                    } else {
                        window.location.href = 'subjects.html'; // Redirect student to subjects page
                    }
                }, 2000);
            }
            
        } catch (error) {
            console.error('Registration error:', error);
            this.showMessage(error.message || 'Registration failed. Please try again.', 'error');
        } finally {
            this.setLoadingState(false);
        }
    },
    
    validateForm() {
        let isValid = true;
        const form = document.getElementById('registration-form');
        const inputs = form.querySelectorAll('input[required], select[required]');
        
        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });
        
        // Additional password validation
        const password = form.querySelector('#password');
        if (password.value.length < 6) {
            this.showFieldError(password, 'Password must be at least 6 characters');
            isValid = false;
        }
        
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
        
        if (field.type === 'tel' && value && !Utils.isValidPhone(value)) {
            this.showFieldError(field, 'Please enter a valid phone number');
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
        const form = document.getElementById('registration-form');
        
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
    Register.init();
});