// Tutor Profile page functionality

const TutorProfile = {
    tutorId: null,
    tutor: null,
    
    init() {
        this.getTutorIdFromURL();
        this.loadTutorProfile();
        this.bindEvents();
        console.log('Tutor profile page initialized for ID:', this.tutorId);
    },
    
    getTutorIdFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.tutorId = urlParams.get('id');
    },
    
    async loadTutorProfile() {
        if (!this.tutorId) {
            this.showError('No tutor selected');
            return;
        }
        
        try {
            this.showLoading(true);
            
            let response;
            try {
                response = await API.get(`/tutors/${this.tutorId}`);
                this.tutor = response.tutor;
            } catch (error) {
                // If API fails, use mock data
                this.tutor = this.getMockTutor(this.tutorId);
            }
            
            if (this.tutor) {
                this.renderProfile();
            } else {
                this.showError('Tutor not found');
            }
            
        } catch (error) {
            console.error('Failed to load tutor profile:', error);
            this.showError('Failed to load tutor profile');
        } finally {
            this.showLoading(false);
        }
    },
    
    getMockTutor(id) {
        const mockTutors = {
            '1': {
                id: 1,
                user: {
                    id: 1,
                    firstName: 'Ms.',
                    lastName: 'Margarita',
                    city: 'Tel Aviv',
                    profileImage: null
                },
                bio: 'Experienced math tutor with 8 years of teaching experience. Specializing in algebra, calculus, and statistics. I love helping students build confidence in mathematics.',
                rating: 5.0,
                totalReviews: 45,
                hourlyRate: 150,
                experienceYears: 8,
                subjects: [{ name: 'Math' }, { name: 'Statistics' }],
                isVerified: true
            },
            '2': {
                id: 2,
                user: {
                    id: 2,
                    firstName: 'Mr.',
                    lastName: 'Shahrukh',
                    city: 'Jerusalem',
                    profileImage: null
                },
                bio: 'Professional English teacher with expertise in grammar, literature, and conversation. I make learning English fun and engaging.',
                rating: 3.5,
                totalReviews: 28,
                hourlyRate: 120,
                experienceYears: 5,
                subjects: [{ name: 'English' }, { name: 'Literature' }],
                isVerified: true
            },
            '3': {
                id: 3,
                user: {
                    id: 3,
                    firstName: 'Mr.',
                    lastName: 'Max',
                    city: 'Haifa',
                    profileImage: null
                },
                bio: 'Software developer and programming instructor. I teach Python, JavaScript, and web development to students of all levels.',
                rating: 2.0,
                totalReviews: 12,
                hourlyRate: 200,
                experienceYears: 3,
                subjects: [{ name: 'Programming' }, { name: 'JavaScript' }],
                isVerified: false
            }
        };
        
        return mockTutors[id] || null;
    },
    
    renderProfile() {
        const container = document.getElementById('profile-content');
        
        // Generate avatar initial
        const initial = this.tutor.user?.firstName?.charAt(0) || '👤';
        
        // Generate star rating
        const stars = this.generateStars(this.tutor.rating || 0);
        
        // Format subjects
        const subjects = this.tutor.subjects || [];
        const subjectTags = subjects.map(subject => 
            `<span class="subject-tag-large">${subject.name}</span>`
        ).join('');
        
        container.innerHTML = `
            <div class="tutor-profile">
                <div class="tutor-avatar-large">
                    ${initial}
                    ${this.tutor.isVerified ? '<div class="verified-badge">✓</div>' : ''}
                </div>
                
                <h1 class="tutor-name-large">${this.tutor.user?.firstName} ${this.tutor.user?.lastName}</h1>
                
                <div class="tutor-rating-large">
                    <div class="stars-large">${stars}</div>
                    <span class="rating-text-large">(${this.tutor.totalReviews || 0} reviews)</span>
                </div>
                
                <div class="tutor-location-large">
                    📍 ${this.tutor.user?.city || 'City Live'}
                </div>
                
                <div class="subjects-display">
                    ${subjectTags}
                </div>
                
                <div class="rate-display">
                    <span class="rate-amount-large">₪${this.tutor.hourlyRate || 0}</span>
                    <span class="rate-unit-large">per hour</span>
                </div>
                
                <div class="info-section">
                    <h3 class="section-title">Info:</h3>
                    <div class="info-box ${!this.tutor.bio ? 'empty' : ''}">
                        ${this.tutor.bio || 'No information available'}
                    </div>
                </div>
                
                <div class="city-live-section">
                    <h3 class="section-title">City Live:</h3>
                    <div class="city-live-box">
                        📍 ${this.tutor.user?.city || 'Location not specified'}
                    </div>
                </div>
                
                <button class="chat-button" onclick="TutorProfile.startChat()">
                    💬 Chat With
                </button>
            </div>
        `;
    },
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star-large">★</span>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<span class="star-large">☆</span>';
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star-large empty">☆</span>';
        }
        
        return stars;
    },
    
    bindEvents() {
        // Navigation events
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.handleNavigation(navItem.dataset.page);
            }
        });
    },
    
    startChat() {
        if (!this.tutor) {
            Utils.showError('Tutor information not available');
            return;
        }
        
        console.log('Starting chat with tutor:', this.tutor);
        
        // Store tutor info for chat
        localStorage.setItem('chatTutor', JSON.stringify({
            id: this.tutor.id,
            name: `${this.tutor.user?.firstName} ${this.tutor.user?.lastName}`,
            avatar: this.tutor.user?.firstName?.charAt(0) || '👤'
        }));
        
        // Navigate to chat
        window.location.href = `chat.html?tutor=${this.tutor.id}`;
    },
    
    handleNavigation(page) {
        console.log('Navigating to:', page);
        
        switch (page) {
            case 'search':
                window.location.href = 'subjects.html';
                break;
            case 'chat':
                window.location.href = 'chat.html';
                break;
            case 'profile':
                window.location.href = 'profile.html';
                break;
        }
    },
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        const content = document.getElementById('profile-content');
        
        if (show) {
            loading.style.display = 'flex';
            content.innerHTML = '';
            content.appendChild(loading);
        } else {
            loading.style.display = 'none';
        }
    },
    
    showError(message) {
        const container = document.getElementById('profile-content');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
                <h3>Error</h3>
                <p>${message}</p>
            </div>
        `;
    }
};

// Global functions
function goBack() {
    window.history.back();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TutorProfile.init();
});