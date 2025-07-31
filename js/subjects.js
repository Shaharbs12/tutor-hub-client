// Subjects page functionality
const SubjectsPage = {
    subjects: [],
    currentSubject: null,
    
    init() {
        this.loadSubjects();
        this.bindEvents();
        console.log('Subjects page initialized');
    },
    
    async loadSubjects() {
        try {
            this.showLoading(true);
            console.log('🔄 Loading subjects from API...');
            
            const response = await API.get('/subjects');
            console.log('📡 API Response:', response);
            
            this.subjects = response.subjects || [];
            console.log(`✅ Loaded ${this.subjects.length} subjects:`, this.subjects);
            
            this.renderSubjects();
            
        } catch (error) {
            console.error('❌ Failed to load subjects:', error);
            this.showMessage('Failed to load subjects. Please try again.', 'error');
            this.subjects = [];
            this.renderSubjects();
        } finally {
            this.showLoading(false);
        }
    },
    
    renderSubjects() {
        const container = document.getElementById('subjects-grid');
        if (!container) {
            console.error('❌ Subjects grid container not found');
            return;
        }
        
        console.log(`🎨 Rendering ${this.subjects.length} subjects...`);
        container.innerHTML = '';
        
        if (this.subjects.length === 0) {
            console.log('⚠️ No subjects to render');
            container.innerHTML = '<div class="no-subjects">No subjects available</div>';
            return;
        }
        
        this.subjects.forEach((subject, index) => {
            console.log(`📝 Creating card for subject ${index + 1}:`, subject);
            const card = this.createSubjectCard(subject);
            container.appendChild(card);
        });
        
        console.log('✅ Subjects rendered successfully');
    },
    
    createSubjectCard(subject) {
        const card = document.createElement('div');
        card.className = 'subject-card';
        card.dataset.subjectId = subject.id;
        
        // Use the database fields
        const subjectName = subject.name || 'Unknown Subject';
        const subjectIcon = subject.icon || '📚';
        const subjectNameHe = subject.nameHe || '';
        const subjectColor = subject.color || '#4A90E2';
        
        card.innerHTML = `
            <div class="subject-icon" style="background-color: ${subjectColor}20; color: ${subjectColor}">${subjectIcon}</div>
            <div class="subject-info">
                <h3 class="subject-name">${subjectName}</h3>
                ${subjectNameHe ? `<p class="subject-name-he">${subjectNameHe}</p>` : ''}
            </div>
            <div class="subject-arrow">→</div>
        `;
        
        console.log(`🎴 Created card for: ${subjectName} (ID: ${subject.id})`);
        return card;
    },
    
    bindEvents() {
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.subject-card');
            if (card) {
                this.selectSubject(card);
            }
        });
    },
    
    selectSubject(card) {
        const subjectId = card.dataset.subjectId;
        const subject = this.subjects.find(s => s.id.toString() === subjectId);
        
        if (subject) {
            console.log('Subject selected:', subject);
            
            // Visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
                this.showTutorsForSubject(subject);
            }, 150);
        }
    },
    
    showTutorsForSubject(subject) {
        // Store subject info for tutors page
        localStorage.setItem('selectedSubject', JSON.stringify({
            id: subject.id,
            name: subject.name,
            icon: subject.icon
        }));
        
        // Navigate to tutors page with subject filter
        window.location.href = `tutors.html?subject=${subject.id}`;
    },
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        const mainContent = document.querySelector('.subjects-container');
        
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
    SubjectsPage.init();
});