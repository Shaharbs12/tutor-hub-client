// Subjects page functionality

const Subjects = {
    subjects: [],
    selectedSubject: null,
    
    init() {
        this.loadSubjects();
        this.bindEvents();
        this.setupNavigation();
        console.log('Subjects page initialized');
    },
    
    async loadSubjects() {
        try {
            this.showLoading(true);
            
            const response = await API.get('/subjects');
            this.subjects = response.subjects || [];
            
            this.renderSubjects();
            
        } catch (error) {
            console.error('Failed to load subjects:', error);
            Utils.showError('Failed to load subjects. Please try again.');
        } finally {
            this.showLoading(false);
        }
    },
    
    renderSubjects() {
        const grid = document.getElementById('subjects-grid');
        if (!grid) return;
        
        // If no subjects from API, use static subjects
        if (this.subjects.length === 0) {
            this.subjects = [
                { id: 1, name: 'Math', icon: '📊', color: '#4A90E2' },
                { id: 2, name: 'English', icon: '📖', color: '#F5A623' },
                { id: 3, name: 'Programming', icon: '💻', color: '#7B68EE' },
                { id: 4, name: 'Physics', icon: '⚛️', color: '#50E3C2' },
                { id: 5, name: 'Chemistry', icon: '🧪', color: '#BD10E0' },
                { id: 6, name: 'French', icon: '🇫🇷', color: '#B8E986' }
            ];
        }
        
        // Clear existing content
        grid.innerHTML = '';
        
        this.subjects.forEach((subject, index) => {
            const card = this.createSubjectCard(subject, index);
            grid.appendChild(card);
        });
    },
    
    createSubjectCard(subject, index) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.dataset.subject = subject.name.toLowerCase();
        card.dataset.subjectId = subject.id;
        
        const displayName = subject.name === 'Programming' ? 'Prog' : subject.name;
        
        card.innerHTML = `
            <div class="subject-icon ${subject.name.toLowerCase()}-bg">
                ${subject.icon}
            </div>
            <h3>${displayName}</h3>
        `;
        
        // Add animation delay
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        return card;
    },
    
    bindEvents() {
        // Subject card clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.subject-card');
            if (card) {
                this.selectSubject(card);
            }
        });
        
        // Navigation events
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.handleNavigation(navItem.dataset.page);
            }
        });
    },
    
    selectSubject(card) {
        const subjectId = card.dataset.subjectId;
        const subjectName = card.dataset.subject;
        
        // Visual feedback
        card.classList.add('selected');
        
        // Store selection
        this.selectedSubject = {
            id: subjectId,
            name: subjectName
        };
        
        console.log('Subject selected:', this.selectedSubject);
        
        // Navigate to tutors list after short delay
        setTimeout(() => {
            this.navigateToTutors(subjectId, subjectName);
        }, 300);
    },
    
    navigateToTutors(subjectId, subjectName) {
        const params = new URLSearchParams({
            subject: subjectId,
            name: subjectName
        });
        
        window.location.href = `tutors.html?${params.toString()}`;
    },
    
    setupNavigation() {
        // Set active nav item
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // In subjects page, no specific nav item is active
        // or you could make the search active since this is where users search for tutors
        const searchNav = document.querySelector('[data-page="search"]');
        if (searchNav) {
            searchNav.classList.add('active');
        }
    },
    
    handleNavigation(page) {
        console.log('Navigating to:', page);
        
        switch (page) {
            case 'search':
                // Stay on current page or go to search
                this.showSearchInterface();
                break;
            case 'chat':
                window.location.href = 'chat.html';
                break;
            case 'profile':
                window.location.href = 'profile.html';
                break;
        }
    },
    
    showSearchInterface() {
        // Could implement a search overlay or redirect to search page
        console.log('Search interface requested');
        // For now, we'll just show that this is the search interface
        Utils.showSuccess('You are already in the subject selection interface!');
    },
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('subjects-grid');
        
        if (show) {
            loading.style.display = 'flex';
            grid.style.display = 'none';
        } else {
            loading.style.display = 'none';
            grid.style.display = 'grid';
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
    Subjects.init();
});