// Main JavaScript functionality for Tutor Hub

// Global app state
const App = {
    currentUser: null,
    currentLanguage: 'en',
    selectedUserType: null,
    
    // Initialize the application
    init() {
        this.bindEvents();
        this.loadLanguage();
        this.checkAuthStatus();
        console.log('Tutor Hub initialized');
    },
    
    // Bind event listeners
    bindEvents() {
        // Language selector
        document.querySelectorAll('.flag').forEach(flag => {
            flag.addEventListener('click', (e) => this.changeLanguage(e.target.dataset.lang));
        });
        
        // User type selection
        document.querySelectorAll('.user-type-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.selectUserType(e.currentTarget.dataset.type));
        });
        
        // Auth buttons
        const signupBtn = document.getElementById('signup-btn');
        const loginBtn = document.getElementById('login-btn');
        const loginLink = document.querySelector('.login-link');
        
        if (signupBtn) {
            signupBtn.addEventListener('click', () => this.handleSignup());
        }
        
        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.handleLogin());
        }
        
        if (loginLink) {
            loginLink.addEventListener('click', () => this.handleLogin());
        }
    },
    
    // Handle sign up button click
    handleSignup() {
        if (this.selectedUserType) {
            // Navigate to registration with selected user type
            window.location.href = `pages/register.html?type=${this.selectedUserType}`;
        } else {
            // Show user type selection first
            this.showUserTypeSelection();
        }
    },
    
    // Handle login button click
    handleLogin() {
        window.location.href = 'pages/login.html';
    },
    
    // Show user type selection modal or message
    showUserTypeSelection() {
        // Highlight user type selection
        const userTypeSection = document.querySelector('.user-type-selection');
        if (userTypeSection) {
            userTypeSection.style.animation = 'pulse 0.5s ease-in-out';
            setTimeout(() => {
                userTypeSection.style.animation = '';
            }, 500);
        }
        
        // Show message
        this.showMessage('Please select whether you want to be a Student or Tutor first', 'info');
    },
    
    // Show message to user
    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#3742fa'};
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            z-index: 1000;
            animation: slideInFromTop 0.3s ease;
        `;
        
        document.body.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 3000);
    },
    
    // Check if user is already authenticated
    checkAuthStatus() {
        const token = localStorage.getItem('tutorHub_token');
        const user = localStorage.getItem('tutorHub_user');
        
        if (token && user) {
            // User is logged in, redirect to appropriate page
            const userData = JSON.parse(user);
            if (userData.userType === 'tutor') {
                window.location.href = 'pages/tutor-dashboard.html';
            } else {
                window.location.href = 'pages/subjects.html';
            }
        }
    },
    
    // Change language
    changeLanguage(lang) {
        this.currentLanguage = lang;
        
        // Update flag UI
        document.querySelectorAll('.flag').forEach(flag => {
            flag.classList.remove('active');
        });
        document.querySelector(`[data-lang="${lang}"]`).classList.add('active');

        // Switch flag images based on selected language
        const flagElements = document.querySelectorAll('.flag');
        flagElements.forEach(flag => {
            if (flag.dataset.lang === 'en') {
                flag.src = 'images/USlogo.jpg';
            } else if (flag.dataset.lang === 'he') {
                flag.src = 'images/israelLogo.png';
            }
        });
        
        // Update text content based on language
        this.updateLanguageContent();
        
        // Save language preference
        this.saveLanguage();
        
        console.log(`Language changed to: ${lang}`);
    },
    
    // Update content based on selected language
    updateLanguageContent() {
        const content = {
            en: {
                title: 'TUTOR HUB',
                tagline: 'LEARN BETTER',
                selectionText: 'First, update us if you want to be:',
                student: 'Student',
                tutor: 'Tutor',
                or: 'Or',
                signup: 'Sign Up',
                login: 'Login',
                authText: 'Already have an account?',
                loginLink: 'Login here'
            },
            he: {
                title: 'TUTOR HUB',
                tagline: 'LEARN BETTER',
                selectionText: 'קודם עדכנו אותנו אם אתה רוצה להיות:',
                student: 'סטודנט',
                tutor: 'מורה פרטי',
                or: 'או',
                signup: 'הרשמה',
                login: 'התחברות',
                authText: 'כבר יש לך חשבון?',
                loginLink: 'התחבר כאן'
            }
        };
        
        const texts = content[this.currentLanguage];
        
        // Update text content
        const selectionText = document.querySelector('.selection-text');
        if (selectionText) selectionText.textContent = texts.selectionText;
        
        const studentBtn = document.querySelector('.student-btn');
        if (studentBtn) studentBtn.lastChild.textContent = texts.student;
        
        const tutorBtn = document.querySelector('.tutor-btn');
        if (tutorBtn) tutorBtn.lastChild.textContent = texts.tutor;
        
        const orText = document.querySelector('.or-text');
        if (orText) orText.textContent = texts.or;
        
        // Update auth buttons
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) signupBtn.querySelector('.btn-text').textContent = texts.signup;
        
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) loginBtn.querySelector('.btn-text').textContent = texts.login;
        
        const authText = document.querySelector('.auth-text');
        if (authText) {
            authText.innerHTML = `${texts.authText} <span class="login-link">${texts.loginLink}</span>`;
        }
    },
    
    // Select user type
    selectUserType(type) {
        this.selectedUserType = type;
        console.log(`User type selected: ${type}`);
        
        // Add visual feedback
        document.querySelectorAll('.user-type-btn').forEach(btn => {
            btn.style.opacity = '0.6';
        });
        
        const selectedBtn = document.querySelector(`[data-type="${type}"]`);
        selectedBtn.style.opacity = '1';
        selectedBtn.style.transform = 'scale(1.05)';
        
        // Enable sign up button
        const signupBtn = document.getElementById('signup-btn');
        if (signupBtn) {
            signupBtn.disabled = false;
            signupBtn.style.opacity = '1';
        }
    },
    
    // Navigate to registration page
    navigateToRegistration(userType) {
        console.log(`Navigating to ${userType} registration...`);
        
        // Navigate to registration page with user type
        window.location.href = `pages/register.html?type=${userType}`;
    },
    
    // Load saved language preference
    loadLanguage() {
        const savedLang = localStorage.getItem('tutorHub_language') || 'en';
        this.changeLanguage(savedLang);
    },
    
    // Save language preference
    saveLanguage() {
        localStorage.setItem('tutorHub_language', this.currentLanguage);
    },
    
    // Navigate to profile page based on user type
    navigateToProfile() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userType = user.userType;
        
        if (userType === 'student') {
            window.location.href = '/pages/profile-student.html';
        } else if (userType === 'tutor') {
            window.location.href = '/pages/tutor-dashboard.html';
        } else {
            console.error('Unknown user type:', userType);
            window.location.href = '/';
        }
    }
};

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});