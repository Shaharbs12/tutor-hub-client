// Tutor Dashboard JavaScript

const TutorDashboard = {
    currentUser: null,
    stats: {
        totalStudents: 0,
        monthlyEarnings: 0,
        rating: 4.8,
        sessionsThisWeek: 0
    },
    todaySchedule: [],
    recentStudents: [],
    
    init() {
        this.loadUserData();
        this.loadDashboardData();
        this.bindEvents();
        this.setupNavigation();
        console.log('Tutor Dashboard initialized');
    },
    
    async loadUserData() {
        try {
            const user = Utils.getCurrentUser();
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            this.currentUser = user;
            document.getElementById('tutor-name').textContent = user.firstName || 'Tutor';
            
        } catch (error) {
            console.error('Error loading user data:', error);
            Utils.showError('Failed to load user data');
        }
    },
    
    async loadDashboardData() {
        try {
            // Load stats
            await this.loadStats();
            
            // Load today's schedule
            await this.loadTodaySchedule();
            
            // Load recent students
            await this.loadRecentStudents();
            
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            Utils.showError('Failed to load dashboard data');
        }
    },
    
    async loadStats() {
        try {
            // In a real app, this would be an API call
            // For now, using mock data
            this.stats = {
                totalStudents: 12,
                monthlyEarnings: 2400,
                rating: 4.8,
                sessionsThisWeek: 8
            };
            
            this.updateStatsDisplay();
            
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    },
    
    updateStatsDisplay() {
        document.getElementById('total-students').textContent = this.stats.totalStudents;
        document.getElementById('monthly-earnings').textContent = `$${this.stats.monthlyEarnings}`;
        document.getElementById('rating').textContent = this.stats.rating;
        document.getElementById('sessions-this-week').textContent = this.stats.sessionsThisWeek;
    },
    
    async loadTodaySchedule() {
        try {
            // Mock schedule data
            this.todaySchedule = [
                {
                    id: 1,
                    time: '09:00',
                    studentName: 'Sarah Johnson',
                    subject: 'Math',
                    status: 'upcoming'
                },
                {
                    id: 2,
                    time: '11:30',
                    studentName: 'Mike Chen',
                    subject: 'Physics',
                    status: 'ongoing'
                },
                {
                    id: 3,
                    time: '14:00',
                    studentName: 'Emma Davis',
                    subject: 'English',
                    status: 'upcoming'
                }
            ];
            
            this.renderTodaySchedule();
            
        } catch (error) {
            console.error('Error loading schedule:', error);
        }
    },
    
    renderTodaySchedule() {
        const scheduleContainer = document.getElementById('today-schedule');
        const emptySchedule = document.getElementById('empty-schedule');
        
        if (this.todaySchedule.length === 0) {
            scheduleContainer.style.display = 'none';
            emptySchedule.style.display = 'block';
            return;
        }
        
        scheduleContainer.style.display = 'block';
        emptySchedule.style.display = 'none';
        
        scheduleContainer.innerHTML = '';
        
        this.todaySchedule.forEach(session => {
            const scheduleItem = this.createScheduleItem(session);
            scheduleContainer.appendChild(scheduleItem);
        });
    },
    
    createScheduleItem(session) {
        const item = document.createElement('div');
        item.className = 'schedule-item';
        item.innerHTML = `
            <div class="schedule-time">${session.time}</div>
            <div class="schedule-info">
                <div class="schedule-student">${session.studentName}</div>
                <div class="schedule-subject">${session.subject}</div>
            </div>
            <div class="schedule-status ${session.status}">${session.status}</div>
        `;
        
        return item;
    },
    
    async loadRecentStudents() {
        try {
            // Mock students data
            this.recentStudents = [
                {
                    id: 1,
                    name: 'Sarah Johnson',
                    subject: 'Math',
                    rating: 5,
                    lastSession: '2 days ago'
                },
                {
                    id: 2,
                    name: 'Mike Chen',
                    subject: 'Physics',
                    rating: 4,
                    lastSession: '1 day ago'
                },
                {
                    id: 3,
                    name: 'Emma Davis',
                    subject: 'English',
                    rating: 5,
                    lastSession: '3 days ago'
                }
            ];
            
            this.renderRecentStudents();
            
        } catch (error) {
            console.error('Error loading students:', error);
        }
    },
    
    renderRecentStudents() {
        const studentsContainer = document.getElementById('recent-students');
        const emptyStudents = document.getElementById('empty-students');
        
        if (this.recentStudents.length === 0) {
            studentsContainer.style.display = 'none';
            emptyStudents.style.display = 'block';
            return;
        }
        
        studentsContainer.style.display = 'block';
        emptyStudents.style.display = 'none';
        
        studentsContainer.innerHTML = '';
        
        this.recentStudents.forEach(student => {
            const studentItem = this.createStudentItem(student);
            studentsContainer.appendChild(studentItem);
        });
    },
    
    createStudentItem(student) {
        const item = document.createElement('div');
        item.className = 'student-item';
        
        const initials = student.name.split(' ').map(n => n[0]).join('');
        
        item.innerHTML = `
            <div class="student-avatar">${initials}</div>
            <div class="student-info">
                <div class="student-name">${student.name}</div>
                <div class="student-subject">${student.subject} • ${student.lastSession}</div>
            </div>
            <div class="student-rating">
                ⭐ ${student.rating}
            </div>
        `;
        
        return item;
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
    
    setupNavigation() {
        // Set active navigation item
        const currentPage = 'dashboard';
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-page="${currentPage}"]`).classList.add('active');
    },
    
    handleNavigation(page) {
        switch(page) {
            case 'dashboard':
                // Already on dashboard
                break;
            case 'students':
                window.location.href = 'tutor-students.html';
                break;
            case 'schedule':
                window.location.href = 'tutor-schedule.html';
                break;
            case 'profile':
                window.location.href = 'profile-tutor.html';
                break;
            default:
                console.warn('Unknown navigation page:', page);
        }
    }
};

// Global functions for quick actions
function startSession() {
    // In a real app, this would start a video session
    Utils.showSuccess('Starting session...');
    setTimeout(() => {
        window.location.href = 'tutor-session.html';
    }, 1000);
}

function updateAvailability() {
    window.location.href = 'tutor-availability.html';
}

function viewMessages() {
    window.location.href = 'chat-list.html';
}

function viewEarnings() {
    window.location.href = 'tutor-earnings.html';
}

function viewFullSchedule() {
    window.location.href = 'tutor-schedule.html';
}

function viewAllStudents() {
    window.location.href = 'tutor-students.html';
}

function editProfile() {
    window.location.href = 'profile-tutor.html';
}

function goHome() {
    window.location.href = '../index.html';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    TutorDashboard.init();
}); 