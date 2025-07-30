// Tutors page functionality
const TutorsPage = {
    tutors: [],
    currentSubject: null,
    
    init() {
        this.loadSubjectFromURL();
        this.loadTutors();
        this.bindEvents();
        console.log('Tutors page initialized');
    },
    
    loadSubjectFromURL() {
        // Get subject from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const subjectId = urlParams.get('subject');
        
        if (subjectId) {
            // Get subject info from localStorage (set by subjects page)
            const subjectInfo = localStorage.getItem('selectedSubject');
            if (subjectInfo) {
                this.currentSubject = JSON.parse(subjectInfo);
            }
        }
        
        this.updatePageTitle();
    },
    
    updatePageTitle() {
        const titleElement = document.getElementById('page-title');
        const welcomeMessage = document.getElementById('welcome-message');
        
        if (titleElement) {
            if (this.currentSubject && this.currentSubject.id) {
                const subjectName = this.capitalizeFirst(this.currentSubject.name);
                titleElement.textContent = `${subjectName} Tutors:`;
                if (welcomeMessage) welcomeMessage.style.display = 'none'; // Hide welcome message
            } else {
                titleElement.textContent = 'Available Tutors:'; // Show all tutors
                if (welcomeMessage) welcomeMessage.style.display = 'block'; // Show welcome message
            }
        }
    },
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    async loadTutors() {
        try {
            this.showLoading(true);
            
            let response;
            if (this.currentSubject && this.currentSubject.id) {
                try {
                    // Try to get tutors for specific subject
                    response = await API.get(`/subjects/${this.currentSubject.id}/tutors`);
                    this.tutors = response.tutors || [];
                } catch (error) {
                    console.log('Subject-specific endpoint failed, falling back to all tutors');
                    // Fallback: get all tutors and filter on frontend
                    response = await API.get('/tutors');
                    const allTutors = response.tutors || [];
                    
                    // Filter tutors by subject (this is a simple check, in real app you'd check the subjects array)
                    // For now, we'll show all tutors since the subject relationship might not be working
                    this.tutors = allTutors;
                }
            } else {
                // Get all tutors
                response = await API.get('/tutors');
                this.tutors = response.tutors || [];
            }
            
            this.renderTutors();
            
        } catch (error) {
            console.error('Failed to load tutors:', error);
            this.showMessage('Failed to load tutors. Please try again.', 'error');
            this.tutors = [];
            this.renderTutors();
        } finally {
            this.showLoading(false);
        }
    },
    
    renderTutors() {
        const container = document.getElementById('tutors-list');
        const emptyState = document.getElementById('empty-state');
        
        if (this.tutors.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        
        container.style.display = 'flex';
        emptyState.style.display = 'none';
        container.innerHTML = '';
        
        this.tutors.forEach((tutor, index) => {
            const card = this.createTutorCard(tutor, index);
            container.appendChild(card);
        });
    },
    
    createTutorCard(tutor, index) {
        const card = document.createElement('div');
        card.className = 'tutor-card';
        card.dataset.tutorId = tutor.id;
        
        // Generate avatar initial
        const initial = tutor.user?.firstName?.charAt(0) || '👤';
        
        // Format subjects
        const subjects = tutor.subjects || [];
        const subjectTags = subjects.map(subject => 
            `<span class="subject-tag">${subject.name}</span>`
        ).join('');
        
        // Format rating
        const rating = tutor.rating || 0;
        const ratingStars = '⭐'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
        
        card.innerHTML = `
            <div class="tutor-avatar">${initial}</div>
            <div class="tutor-info">
                <div class="tutor-name">${tutor.user?.firstName} ${tutor.user?.lastName}</div>
                <div class="tutor-location">📍 ${tutor.user?.city || 'Location not set'}</div>
                <div class="tutor-rating">${ratingStars} ${rating.toFixed(1)}</div>
                <div class="tutor-subjects">
                    ${subjectTags || '<span class="subject-tag">No subjects listed</span>'}
                </div>
                <div class="tutor-bio">${tutor.bio || 'No bio available'}</div>
            </div>
        `;
        
        // Add animation delay
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        return card;
    },
    
    bindEvents() {
        // Tutor card clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.tutor-card');
            if (card) {
                this.selectTutor(card);
            }
        });
        
        // Back to subjects button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.back-to-subjects')) {
                this.goBackToSubjects();
            }
        });
    },
    
    selectTutor(card) {
        const tutorId = card.dataset.tutorId;
        const tutor = this.tutors.find(t => t.id.toString() === tutorId);
        
        if (tutor) {
            console.log('Tutor selected:', tutor);
            
            // Visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
                this.startChatWithTutor(tutor);
            }, 150);
        }
    },
    
    startChatWithTutor(tutor) {
        // Store tutor info for chat
        localStorage.setItem('chatTutor', JSON.stringify({
            id: tutor.id,
            name: `${tutor.user?.firstName} ${tutor.user?.lastName}`,
            avatar: tutor.user?.firstName?.charAt(0) || '👤'
        }));
        
        // Navigate to chat
        window.location.href = `chat.html?tutor=${tutor.id}`;
    },
    
    goBackToSubjects() {
        // Clear selected subject
        localStorage.removeItem('selectedSubject');
        window.location.href = 'subjects.html';
    },
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        const mainContent = document.querySelector('.tutors-container');
        
        if (show) {
            if (loading) loading.style.display = 'flex';
            if (mainContent) mainContent.style.opacity = '0.5';
        } else {
            if (loading) loading.style.display = 'none';
            if (mainContent) mainContent.style.opacity = '1';
        }
    },
    
    showMessage(message, type) {
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
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TutorsPage.init();
});