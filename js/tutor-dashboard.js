// Tutor Dashboard functionality

const TutorDashboard = {
    currentUser: null,
    students: [],
    
    init() {
        this.loadUserInfo();
        this.loadStudents();
        this.bindEvents();
        console.log('Tutor Dashboard initialized');
    },
    
    async loadUserInfo() {
        try {
            const user = JSON.parse(localStorage.getItem('tutorHub_user'));
            if (user) {
                this.currentUser = user;
                document.getElementById('user-name').textContent = `${user.firstName} ${user.lastName}`;
            }
        } catch (error) {
            console.error('Error loading user info:', error);
        }
    },
    
    async loadStudents() {
        try {
            this.showLoading(true);
            
            const response = await API.get('/students');
            this.students = response.students || [];
            
            this.updateStats();
            this.renderStudents();
            
        } catch (error) {
            console.error('Failed to load students:', error);
            this.showMessage('Failed to load students. Please try again.', 'error');
            this.students = [];
            this.renderStudents();
        } finally {
            this.showLoading(false);
        }
    },
    
    updateStats() {
        // Update stats based on real data
        document.getElementById('total-students').textContent = this.students.length;
        
        // For now, use placeholder data for other stats
        // In a real app, these would come from the backend
        document.getElementById('avg-rating').textContent = '4.8';
        document.getElementById('total-earnings').textContent = '₪1,250';
    },
    
    renderStudents() {
        const container = document.getElementById('students-list');
        const emptyState = document.getElementById('empty-state');
        
        if (this.students.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'flex';
            return;
        }
        
        container.style.display = 'flex';
        emptyState.style.display = 'none';
        container.innerHTML = '';
        
        this.students.forEach((student, index) => {
            const card = this.createStudentCard(student, index);
            container.appendChild(card);
        });
    },
    
    createStudentCard(student, index) {
        const card = document.createElement('div');
        card.className = 'student-card';
        card.dataset.studentId = student.id;
        
        // Generate avatar initial
        const initial = student.user?.firstName?.charAt(0) || '👤';
        
        // Format subjects
        const subjects = student.preferredSubjects || [];
        const subjectTags = subjects.map(subject => 
            `<span class="subject-tag">${subject.name}</span>`
        ).join('');
        
        card.innerHTML = `
            <div class="student-avatar">${initial}</div>
            <div class="student-info">
                <div class="student-name">${student.user?.firstName} ${student.user?.lastName}</div>
                <div class="student-location">📍 ${student.user?.city || 'Location not set'}</div>
                <div class="student-subjects">
                    ${subjectTags || '<span class="subject-tag">No subjects selected</span>'}
                </div>
            </div>
        `;
        
        // Add animation delay
        card.style.animationDelay = `${(index + 1) * 0.1}s`;
        
        return card;
    },
    
    bindEvents() {
        // Navigation events
        document.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                this.handleNavigation(navItem.dataset.page);
            }
        });
        
        // Student card clicks
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.student-card');
            if (card) {
                this.selectStudent(card);
            }
        });
    },
    
    selectStudent(card) {
        const studentId = card.dataset.studentId;
        const student = this.students.find(s => s.id.toString() === studentId);
        
        if (student) {
            console.log('Student selected:', student);
            
            // Visual feedback
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
                card.style.transform = '';
                this.startChatWithStudent(student);
            }, 150);
        }
    },
    
    startChatWithStudent(student) {
        // Store student info for chat
        localStorage.setItem('chatStudent', JSON.stringify({
            id: student.id,
            name: `${student.user?.firstName} ${student.user?.lastName}`,
            avatar: student.user?.firstName?.charAt(0) || '👤'
        }));
        
        // Navigate to chat
        window.location.href = `chat.html?student=${student.id}`;
    },
    
    handleNavigation(page) {
        console.log('Navigating to:', page);
        
        switch (page) {
            case 'dashboard':
                // Already on dashboard
                break;
            case 'students':
                // Could navigate to a detailed students page
                console.log('Students page - already showing students');
                break;
            case 'chat':
                window.location.href = 'chat-list.html';
                break;
            case 'profile':
                window.location.href = 'profile-tutor.html';
                break;
        }
    },
    
    showLoading(show) {
        const loading = document.getElementById('loading');
        const mainContent = document.querySelector('.dashboard-container');
        
        if (show) {
            loading.style.display = 'flex';
            mainContent.style.opacity = '0.5';
        } else {
            loading.style.display = 'none';
            mainContent.style.opacity = '1';
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
    TutorDashboard.init();
}); 