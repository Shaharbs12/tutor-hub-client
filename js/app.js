// App-specific functionality and utilities

// API configuration
const API = {
    baseURL: '/api',
    
    // Generic fetch wrapper
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };
        
        // Add auth token if available
        const token = localStorage.getItem('tutorHub_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    },
    
    // GET request
    get(endpoint, options = {}) {
        return this.request(endpoint, { method: 'GET', ...options });
    },
    
    // POST request
    post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data),
            ...options
        });
    },
    
    // PUT request
    put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data),
            ...options
        });
    },
    
    // DELETE request
    delete(endpoint, options = {}) {
        return this.request(endpoint, { method: 'DELETE', ...options });
    }
};

// Utility functions
const Utils = {
    // Show loading state
    showLoading(element) {
        if (element) {
            element.classList.add('loading');
        }
    },
    
    // Hide loading state
    hideLoading(element) {
        if (element) {
            element.classList.remove('loading');
        }
    },
    
    // Show error message
    showError(message, container = document.body) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff4757;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        container.appendChild(errorDiv);
        
        // Remove after 5 seconds
        setTimeout(() => {
            errorDiv.remove();
        }, 5000);
    },
    
    // Show success message
    showSuccess(message, container = document.body) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        successDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #2ed573;
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        container.appendChild(successDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successDiv.remove();
        }, 3000);
    },
    
    // Validate email
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone number
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    },
    
    // Format phone number
    formatPhone(phone) {
        return phone.replace(/\s/g, '').replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Logout function
    logout() {
        // Clear local storage
        localStorage.removeItem('tutorHub_token');
        localStorage.removeItem('tutorHub_user');
        
        // Redirect to home page
        window.location.href = '/';
        
        // Show logout message
        this.showSuccess('Logged out successfully');
    },
    
    // Check if user is authenticated
    isAuthenticated() {
        const token = localStorage.getItem('tutorHub_token');
        const user = localStorage.getItem('tutorHub_user');
        return !!(token && user);
    },
    
    // Get current user
    getCurrentUser() {
        const user = localStorage.getItem('tutorHub_user');
        return user ? JSON.parse(user) : null;
    }
};

// Navigation utilities
const Navigation = {
    // Handle bottom navigation clicks
    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.bindNavigationEvents();
        });
    },
    
    bindNavigationEvents() {
        // Handle navigation item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.navigateTo(page);
            });
        });
    },
    
    navigateTo(page) {
        switch(page) {
            case 'search':
                window.location.href = '/pages/subjects.html';
                break;
            case 'chat':
                window.location.href = '/pages/chat-list.html';
                break;
            case 'profile':
                this.navigateToProfile();
                break;
            default:
                console.warn('Unknown navigation page:', page);
        }
    },
    
    navigateToProfile() {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userType = user.userType;
        
        if (userType === 'student') {
            window.location.href = '/pages/profile-student.html';
        } else if (userType === 'tutor') {
            window.location.href = '/pages/profile-tutor.html';
        } else {
            console.error('Unknown user type:', userType);
            window.location.href = '/';
        }
    },
    
    // Set active navigation item
    setActiveNavItem(page) {
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeItem = document.querySelector(`[data-page="${page}"]`);
        if (activeItem) {
            activeItem.classList.add('active');
        }
    }
};

// Initialize navigation
Navigation.init();

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
`;
document.head.appendChild(style);