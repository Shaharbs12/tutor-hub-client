// Tutors page functionality
const TutorsPage = {
    tutors: [],
    currentSubject: null,
    
    init() {
        console.log('TutorsPage.init() called');
        
        // Test if container exists
        const container = document.getElementById('tutors-list');
        console.log('Container exists:', !!container);
        if (container) {
            console.log('Container display style:', container.style.display);
            console.log('Container visibility:', container.style.visibility);
            console.log('Container offsetHeight:', container.offsetHeight);
        }
        
        this.loadSubjectFromURL();
        console.log('Subject loaded:', this.currentSubject);
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
            } else {
                // If not in localStorage, create a basic subject object from the ID
                // We'll get the full subject info from the API response
                this.currentSubject = { id: parseInt(subjectId) };
            }
            console.log('Loaded subject from URL:', this.currentSubject);
        }
        
        this.updatePageTitle();
    },
    
    updatePageTitle() {
        const titleElement = document.getElementById('page-title');
        const welcomeMessage = document.getElementById('welcome-message');
        
        if (titleElement) {
            if (this.currentSubject && this.currentSubject.id) {
                const subjectName = this.capitalizeFirst(this.currentSubject.name);
                titleElement.textContent = `${subjectName} Tutors (All Available):`;
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
            console.log('Starting loadTutors...');
            console.log('Current subject:', this.currentSubject);
            
            if (this.currentSubject && this.currentSubject.id) {
                try {
                    // Use the new endpoint to get tutors for specific subject
                    console.log('Loading tutors for subject:', this.currentSubject);
                    const subjectUrl = `/tutors/subject/${this.currentSubject.id}`;
                    console.log('API URL:', subjectUrl);
                    response = await API.get(subjectUrl);
                    console.log('API Response:', response);
                    this.tutors = response.tutors || [];
                    console.log('Tutors array:', this.tutors);
                    
                    // If no tutors found for this subject, show a message
                    if (this.tutors.length === 0) {
                        this.showInfoMessage(`No tutors found for ${this.currentSubject.name}. Showing all available tutors.`);
                        // Get all tutors as fallback
                        console.log('Getting all tutors as fallback...');
                        response = await API.get('/tutors');
                        this.tutors = response.tutors || [];
                        console.log('Fallback tutors:', this.tutors);
                    } else {
                        this.showInfoMessage(`Found ${this.tutors.length} tutors for ${this.currentSubject.name}`);
                        this.renderTutors();    
                    }
                } catch (error) {
                    console.log('Subject-specific endpoint failed, showing all tutors');
                    console.error('Subject API error:', error);
                    this.showInfoMessage(`Showing all available tutors for ${this.currentSubject.name}.`);
                    // Fallback: get all tutors
                    response = await API.get('/tutors');
                    this.tutors = response.tutors || [];
                }
            } else {
                // Get all tutors
                console.log('Getting all tutors...');
                response = await API.get('/tutors');
                console.log('All tutors response:', response);
                this.tutors = response.tutors || [];
            }
            
            console.log('Final tutors array before rendering:', this.tutors);
            console.log('Tutors array length:', this.tutors.length);
            console.log('First tutor sample:', this.tutors[0]);
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
        console.log('renderTutors called with tutors:', this.tutors);
        const container = document.getElementById('tutors-list');
        const emptyState = document.getElementById('empty-state');
        const loading = document.getElementById('loading');
        const infoMessage = document.getElementById('info-message');
        
        console.log('Container element:', container);
        console.log('Empty state element:', emptyState);
        console.log('Loading element:', loading);
        console.log('Info message element:', infoMessage);
        
        // Hide loading first
        if (loading) {
            loading.style.display = 'none';
            console.log('Hidden loading element');
        }
        
        if (!this.tutors || this.tutors.length === 0) {
            console.log('No tutors found, showing empty state');
            if (container) container.style.display = 'none';
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }
        
        console.log(`Rendering ${this.tutors.length} tutors`);
        if (container) {
            container.style.display = 'flex';
            container.innerHTML = '';
            console.log('Set container to flex and cleared innerHTML');
        } else {
            console.error('Container element not found!');
            return;
        }
        if (emptyState) emptyState.style.display = 'none';
        
        // Render each tutor card
        this.tutors.forEach((tutor, index) => {
            console.log(`Creating card for tutor ${index}:`, tutor);
            const card = this.createTutorCard(tutor, index);
            if (container) {
                container.appendChild(card);
                console.log(`Appended card ${index} to container`);
            } else {
                console.error('Container not found when trying to append card');
            }
        });
        
        console.log('Finished rendering tutors');
        console.log('Container children count:', container ? container.children.length : 'container not found');
    },
    
    createTutorCard(tutor, index) {
        console.log('createTutorCard called with tutor:', tutor);
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
        
        // Format hourly rate
        const hourlyRate = tutor.hourlyRate || 0;
        const rateDisplay = hourlyRate > 0 ? `$${hourlyRate}/hr` : 'Rate not set';
        
        // Format experience
        const experience = tutor.experienceYears || 0;
        const experienceText = experience > 0 ? `${experience} years experience` : 'Experience not set';
        
        const cardHTML = `
            <div class="tutor-header">
                <div class="tutor-avatar">${initial}</div>
                <div class="tutor-info">
                    <div class="tutor-name">${tutor.user?.firstName || 'Unknown'} ${tutor.user?.lastName || 'Tutor'}</div>
                    <div class="tutor-location">📍 ${tutor.user?.city || 'Location not set'}</div>
                    <div class="tutor-rating">
                        <span class="stars">${ratingStars}</span>
                        <span class="rating-text">${rating}</span>
                    </div>
                </div>
            </div>
            <div class="tutor-details">
                <div class="tutor-subjects">
                    ${subjectTags || '<span class="subject-tag">No subjects listed</span>'}
                </div>
                <div class="tutor-rate">
                    <span class="rate-amount">${rateDisplay}</span>
                </div>
            </div>
            <div class="tutor-bio">
                <strong>About:</strong> ${tutor.bio || 'No bio available'}
            </div>
            <div class="tutor-experience">
                <strong>Experience:</strong> ${experienceText}
            </div>
        `;
        
        console.log('Card HTML:', cardHTML);
        card.innerHTML = cardHTML;
        
        // Add animation delay
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        console.log('Created card element:', card);
        console.log('Card outerHTML:', card.outerHTML);
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
    },

    showInfoMessage(message) {
        const infoMessage = document.getElementById('info-message');
        const infoText = document.getElementById('info-text');
        
        if (infoMessage && infoText) {
            infoText.textContent = message;
            infoMessage.style.display = 'block';
            console.log('Showing info message:', message);
            
            // Hide the info message after 2 seconds
            setTimeout(() => {
                infoMessage.style.display = 'none';
                console.log('Hidden info message');
            }, 2000);
        }
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TutorsPage.init();
});