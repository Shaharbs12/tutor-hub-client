// Logout functionality
const LogoutManager = {
    init() {
        this.addLogoutButton();
        this.bindEvents();
    },

    addLogoutButton() {
        // Check if we're on the home page, login page, or register page
        const isHomePage = window.location.pathname.endsWith('index.html') || 
                          window.location.pathname.endsWith('/') ||
                          window.location.pathname === '';
        
        const isLoginPage = window.location.pathname.includes('login.html');
        const isRegisterPage = window.location.pathname.includes('register.html');
        
        if (isHomePage || isLoginPage || isRegisterPage) {
            document.body.classList.add('home-page');
            return; // Don't add logout button on home, login, or register pages
        }

        // Create logout button
        const logoutButton = document.createElement('button');
        logoutButton.className = 'logout-button';
        logoutButton.innerHTML = `
            <span class="logout-icon">🚪</span>
            <span>Logout</span>
        `;
        
        document.body.appendChild(logoutButton);
    },

    bindEvents() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.logout-button')) {
                this.handleLogout();
            }
        });
    },

    handleLogout() {
        // Clear user data from localStorage
        localStorage.removeItem('tutorHub_token');
        localStorage.removeItem('tutorHub_user');
        localStorage.removeItem('chatStudent');
        
        // Show logout message
        this.showLogoutMessage();
        
        // Redirect to home page after a short delay
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    },

    showLogoutMessage() {
        // Create logout message
        const message = document.createElement('div');
        message.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, #2ed573, #1e90ff);
            color: white;
            padding: 20px 30px;
            border-radius: 15px;
            font-size: 16px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 8px 25px rgba(46, 213, 115, 0.3);
            animation: fadeInOut 1.5s ease;
        `;
        message.textContent = 'Logging out...';
        
        // Add animation keyframes
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(message);
        
        // Remove message after animation
        setTimeout(() => {
            if (message.parentNode) {
                message.remove();
            }
        }, 1500);
    }
};

// Initialize logout manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    LogoutManager.init();
}); 