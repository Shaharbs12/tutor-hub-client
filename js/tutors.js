// Tutors page functionality

const Tutors = {
    tutors: [],
    currentSubject: null,
    
    init() {
        this.getSubjectFromURL();
        this.updatePageTitle();
        this.loadTutors();
        this.bindEvents();
        console.log('Tutors page initialized for subject:', this.currentSubject);
    },
    
    getSubjectFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        this.currentSubject = {
            id: urlParams.get('subject'),
            name: urlParams.get('name') || 'Unknown'
        };
    },
    
    updatePageTitle() {
        const titleElement = document.getElementById('page-title');
        if (titleElement && this.currentSubject) {
            const subjectName = this.capitalizeFirst(this.currentSubject.name);
            titleElement.textContent = `${subjectName} Tutors:`;
        }
    },
    
    async loadTutors() {
        try {
            this.showLoading(true);
            
            let response;
            if (this.currentSubject && this.currentSubject.id) {
                // Get tutors for specific subject
                response = await API.get(`/subjects/${this.currentSubject.id}/tutors`);
                this.tutors = response.tutors || [];
            } else {
                // Get all tutors
                response = await API.get('/tutors');
                this.tutors = response.tutors || [];
            }
            
            // If no tutors from API, use mock data
            if (this.tutors.length === 0) {
                this.tutors = this.getMockTutors();
            }
            
            this.renderTutors();
            
        } catch (error) {
            console.error('Failed to load tutors:', error);
            // Show mock data on error
            this.tutors = this.getMockTutors();
            this.renderTutors();
        } finally {
            this.showLoading(false);
        }
    },
    
    getMockTutors() {
        const subjectName = this.currentSubject?.name?.toLowerCase();
        
        // Sample tutors based on Figma designs
        const allTutors = [
            {
                id: 1,
                user: {
                    id: 1,
                    firstName: 'Ms.',
                    lastName: 'Margarita',
                    city: 'Tel Aviv',
                    profileImage: null
                },
                rating: 5.0,
                totalReviews: 45,
                hourlyRate: 150,
                subjects: [{ name: 'Math' }],
                isVerified: true
            },
            {
                id: 2,
                user: {
                    id: 2,
                    firstName: 'Mr.',
                    lastName: 'Shahrukh',
                    city: 'Jerusalem',
                    profileImage: null
                },
                rating: 3.5,
                totalReviews: 28,
                hourlyRate: 120,
                subjects: [{ name: 'English' }],
                isVerified: true
            },
            {
                id: 3,
                user: {
                    id: 3,
                    firstName: 'Mr.',
                    lastName: 'Max',
                    city: 'Haifa',
                    profileImage: null
                },
                rating: 2.0,
                totalReviews: 12,
                hourlyRate: 200,
                subjects: [{ name: 'Programming' }],
                isVerified: false
            }
        ];
        
        // Filter by subject if specified
        if (subjectName && subjectName !== 'unknown') {
            return allTutors.filter(tutor => 
                tutor.subjects.some(subject => 
                    subject.name.toLowerCase().includes(subjectName) ||
                    subjectName.includes(subject.name.toLowerCase())
                )
            );
        }
        
        return allTutors;
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
        if (tutor.isVerified) card.classList.add('verified');
        
        card.dataset.tutorId = tutor.id || tutor.user?.id;
        
        // Generate avatar initial
        const initial = tutor.user?.firstName?.charAt(0) || '👤';
        
        // Generate star rating
        const stars = this.generateStars(tutor.rating || 0);
        
        // Format subjects
        const subjects = tutor.subjects || [];
        const subjectTags = subjects.map(subject => 
            `<span class="subject-tag">${subject.name}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="tutor-header">
                <div class="tutor-avatar">${initial}</div>
                <div class="tutor-info">
                    <h3 class="tutor-name">${tutor.user?.firstName} ${tutor.user?.lastName}</h3>
                    <div class="tutor-rating">
                        <div class="stars">${stars}</div>
                        <span class="rating-text">(${tutor.totalReviews || 0} reviews)</span>
                    </div>
                    <div class="tutor-location">📍 ${tutor.user?.city || 'City Live'}</div>
                </div>
            </div>
            <div class="tutor-details">
                <div class="tutor-subjects">
                    ${subjectTags}
                </div>
                <div class="tutor-rate">
                    <span class="rate-amount">₪${tutor.hourlyRate || 0}</span>
                    <span class="rate-unit">per hour</span>
                </div>
            </div>
        `;
        
        // Add animation delay
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        return card;
    },
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="star">★</span>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<span class="star">☆</span>'; // You could use a half-star character
        }
        
        // Empty stars
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="star empty">☆</span>';
        }
        
        return stars;
    },
    
    bindEvents() {
        // Tutor card clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.tutor-card');
            if (card) {
                this.selectTutor(card);
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
    
    selectTutor(card) {
        const tutorId = card.dataset.tutorId;
        const tutor = this.tutors.find(t => (t.id || t.user?.id).toString() === tutorId);
        
        if (tutor) {
            console.log('Tutor selected:', tutor);
            
            // Visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
                this.navigateToTutorProfile(tutorId);
            }, 150);
        }
    },
    
    navigateToTutorProfile(tutorId) {
        window.location.href = `tutor-profile.html?id=${tutorId}`;
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
        const list = document.getElementById('tutors-list');
        
        if (show) {
            loading.style.display = 'flex';
            list.style.display = 'none';
        } else {
            loading.style.display = 'none';
            list.style.display = 'flex';
        }
    },
    
    capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};

// Global functions
function goBack() {
    window.location.href = 'subjects.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    Tutors.init();
});