// Tutor Profile Page JavaScript

let isEditMode = false;
let originalData = {};
let originalSchedule = {};
let allSubjects = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        await loadProfile();
        await loadSubjects(); 
        await loadSchedule();
    } catch (error) {
        console.error('Error initializing profile page:', error);
        showError('Failed to load profile data');
    }
}

// Load user profile
async function loadProfile() {
    try {
        const response = await fetch('/api/profile', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load profile');
        }

        const data = await response.json();
        const profile = data.profile;

        // Store original data
        originalData = { ...profile };

        // Update display values
        document.getElementById('display-firstName').textContent = profile.firstName || 'Not set';
        document.getElementById('display-lastName').textContent = profile.lastName || 'Not set';
        document.getElementById('display-email').textContent = profile.email || 'Not set';
        document.getElementById('display-phoneNumber').textContent = profile.phoneNumber || 'Not set';
        document.getElementById('display-bio').textContent = profile.bio || 'Tell students about your teaching experience...';

        // Update tutor-specific info
        if (profile.tutorProfile) {
            const tutorProfile = profile.tutorProfile;
            document.getElementById('display-experienceYears').textContent = 
                tutorProfile.experienceYears ? `${tutorProfile.experienceYears} years` : 'Not set';
            document.getElementById('display-hourlyRate').textContent = 
                tutorProfile.hourlyRate ? `$${tutorProfile.hourlyRate}/hour` : 'Not set';

            // Update edit inputs for tutor data
            document.getElementById('edit-experienceYears').value = tutorProfile.experienceYears || '';
            document.getElementById('edit-hourlyRate').value = tutorProfile.hourlyRate || '';

            // Update subjects display
            updateSubjectsDisplay(tutorProfile.subjects || []);
            
            // Update subject checkboxes
            const subjectIds = (tutorProfile.subjects || []).map(s => s.id);
            subjectIds.forEach(subjectId => {
                const checkbox = document.getElementById(`subject-${subjectId}`);
                if (checkbox) {
                    checkbox.checked = true;
                    updateSubjectItem(checkbox.parentElement);
                }
            });
        }

        // Update avatar
        updateAvatar(profile.firstName, profile.lastName, profile.profileImage);

        // Update edit inputs
        document.getElementById('edit-firstName').value = profile.firstName || '';
        document.getElementById('edit-lastName').value = profile.lastName || '';
        document.getElementById('edit-email').value = profile.email || '';
        document.getElementById('edit-phoneNumber').value = profile.phoneNumber || '';
        document.getElementById('edit-bio').value = profile.bio || '';

    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile');
    }
}

// Load all subjects
async function loadSubjects() {
    try {
        const response = await fetch('/api/subjects');
        if (!response.ok) {
            throw new Error('Failed to load subjects');
        }

        const data = await response.json();
        allSubjects = data.subjects;

        // Create subjects grid for editing
        const subjectsGrid = document.getElementById('subjects-grid');
        subjectsGrid.innerHTML = '';

        allSubjects.forEach(subject => {
            const subjectItem = document.createElement('div');
            subjectItem.className = 'subject-checkbox';
            subjectItem.innerHTML = `
                <input type="checkbox" id="subject-${subject.id}" value="${subject.id}">
                <label for="subject-${subject.id}">
                    <span>${subject.icon}</span>
                    ${subject.name}
                </label>
            `;
            subjectsGrid.appendChild(subjectItem);

            // Add click handler for the whole item
            subjectItem.addEventListener('click', function(e) {
                if (e.target.type !== 'checkbox') {
                    const checkbox = subjectItem.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                }
                updateSubjectItem(subjectItem);
            });

            // Add change handler for checkbox
            const checkbox = subjectItem.querySelector('input[type="checkbox"]');
            checkbox.addEventListener('change', function() {
                updateSubjectItem(subjectItem);
            });
        });

    } catch (error) {
        console.error('Error loading subjects:', error);
        showError('Failed to load subjects');
    }
}

// Load tutor schedule
async function loadSchedule() {
    try {
        const response = await fetch('/api/profile/schedule', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                // Not a tutor, hide schedule section
                return;
            }
            throw new Error('Failed to load schedule');
        }

        const data = await response.json();
        const schedule = data.schedule;

        // Store original schedule
        originalSchedule = { ...schedule };

        // Update schedule display
        updateScheduleDisplay(schedule.availability || []);

        // Update schedule edit form
        updateScheduleEditForm(schedule.availability || []);

    } catch (error) {
        console.error('Error loading schedule:', error);
        showError('Failed to load schedule');
    }
}

// Update avatar display
function updateAvatar(firstName, lastName, profileImage) {
    const avatarImg = document.getElementById('profile-image');
    const avatarPlaceholder = document.getElementById('avatar-placeholder');
    const avatarInitials = document.getElementById('avatar-initials');

    if (profileImage) {
        avatarImg.src = profileImage;
        avatarImg.style.display = 'block';
        avatarPlaceholder.style.display = 'none';
    } else {
        avatarImg.style.display = 'none';
        avatarPlaceholder.style.display = 'flex';
        
        const initials = ((firstName || 'T').charAt(0) + (lastName || 'U').charAt(0)).toUpperCase();
        avatarInitials.textContent = initials;
    }
}

// Update subjects display
function updateSubjectsDisplay(subjects) {
    const subjectsDisplay = document.getElementById('subjects-display');
    
    if (!subjects || subjects.length === 0) {
        subjectsDisplay.innerHTML = '<div class="loading-subjects">No subjects selected</div>';
        return;
    }

    subjectsDisplay.innerHTML = '';
    subjects.forEach(subject => {
        const subjectTag = document.createElement('div');
        subjectTag.className = 'subject-tag';
        subjectTag.innerHTML = `
            <span>${subject.icon}</span>
            ${subject.name}
        `;
        subjectsDisplay.appendChild(subjectTag);
    });
}

// Update schedule display
function updateScheduleDisplay(availability) {
    const scheduleDisplay = document.getElementById('schedule-display');
    
    if (!availability || availability.length === 0) {
        scheduleDisplay.innerHTML = '<div class="loading-schedule">No availability set</div>';
        return;
    }

    scheduleDisplay.innerHTML = '';
    availability.forEach(slot => {
        const scheduleItem = document.createElement('div');
        scheduleItem.className = 'schedule-item';
        scheduleItem.innerHTML = `
            <div class="schedule-day">${capitalizeFirst(slot.day)}</div>
            <div class="schedule-time">${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}</div>
        `;
        scheduleDisplay.appendChild(scheduleItem);
    });
}

// Update schedule edit form
function updateScheduleEditForm(availability) {
    // Reset all checkboxes and inputs
    document.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.checked = false;
        const daySchedule = checkbox.closest('.day-schedule');
        daySchedule.classList.remove('active');
    });

    document.querySelectorAll('.time-input').forEach(input => {
        input.value = '';
    });

    // Set availability data
    availability.forEach(slot => {
        const checkbox = document.querySelector(`input[value="${slot.day}"]`);
        if (checkbox) {
            checkbox.checked = true;
            const daySchedule = checkbox.closest('.day-schedule');
            daySchedule.classList.add('active');
            
            const startTimeInput = daySchedule.querySelector('.start-time');
            const endTimeInput = daySchedule.querySelector('.end-time');
            
            if (startTimeInput) startTimeInput.value = slot.startTime;
            if (endTimeInput) endTimeInput.value = slot.endTime;
        }
    });
}

// Update subject checkbox item appearance
function updateSubjectItem(item) {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
    }
}

// Setup schedule checkbox handlers
document.addEventListener('DOMContentLoaded', function() {
    // Add handlers for day checkboxes
    document.querySelectorAll('.day-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const daySchedule = checkbox.closest('.day-schedule');
            if (checkbox.checked) {
                daySchedule.classList.add('active');
            } else {
                daySchedule.classList.remove('active');
                // Clear time inputs
                daySchedule.querySelectorAll('.time-input').forEach(input => {
                    input.value = '';
                });
            }
        });
    });
});

// Toggle edit mode
function toggleEditMode() {
    isEditMode = !isEditMode;
    
    const editBtn = document.getElementById('edit-btn');
    const profileActions = document.getElementById('profile-actions');
    const changePhotoBtn = document.getElementById('change-photo-btn');

    if (isEditMode) {
        // Enter edit mode
        editBtn.innerHTML = '<span class="edit-icon">❌</span>';
        profileActions.style.display = 'flex';
        changePhotoBtn.style.display = 'block';
        
        // Show edit inputs, hide display values
        showEditInputs();
    } else {
        // Exit edit mode
        editBtn.innerHTML = '<span class="edit-icon">✏️</span>';
        profileActions.style.display = 'none';
        changePhotoBtn.style.display = 'none';
        
        // Show display values, hide edit inputs
        showDisplayValues();
        
        // Reset to original values
        resetToOriginalValues();
    }
}

// Show edit inputs
function showEditInputs() {
    // Basic info
    document.querySelectorAll('.display-value').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.edit-input').forEach(el => el.style.display = 'block');
    
    // Subjects
    document.getElementById('subjects-display').style.display = 'none';
    document.getElementById('subjects-edit').style.display = 'block';
    
    // Schedule
    document.getElementById('schedule-display').style.display = 'none';
    document.getElementById('schedule-edit').style.display = 'block';
}

// Show display values
function showDisplayValues() {
    // Basic info
    document.querySelectorAll('.display-value').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.edit-input').forEach(el => el.style.display = 'none');
    
    // Subjects
    document.getElementById('subjects-display').style.display = 'flex';
    document.getElementById('subjects-edit').style.display = 'none';
    
    // Schedule
    document.getElementById('schedule-display').style.display = 'block';
    document.getElementById('schedule-edit').style.display = 'none';
}

// Reset to original values
function resetToOriginalValues() {
    document.getElementById('edit-firstName').value = originalData.firstName || '';
    document.getElementById('edit-lastName').value = originalData.lastName || '';
    document.getElementById('edit-email').value = originalData.email || '';
    document.getElementById('edit-phoneNumber').value = originalData.phoneNumber || '';
    document.getElementById('edit-bio').value = originalData.bio || '';
    
    // Reset schedule
    updateScheduleEditForm(originalSchedule.availability || []);
}

// Cancel edit
function cancelEdit() {
    toggleEditMode();
}

// Save profile
async function saveProfile() {
    try {
        showLoadingOverlay();

        // Collect basic profile data
        const profileData = {
            firstName: document.getElementById('edit-firstName').value.trim(),
            lastName: document.getElementById('edit-lastName').value.trim(),
            email: document.getElementById('edit-email').value.trim(),
            phoneNumber: document.getElementById('edit-phoneNumber').value.trim(),
            bio: document.getElementById('edit-bio').value.trim()
        };

        // Save basic profile
        const profileResponse = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(profileData)
        });

        if (!profileResponse.ok) {
            throw new Error('Failed to update profile');
        }

        // Collect schedule data
        const availability = [];
        document.querySelectorAll('.day-schedule').forEach(dayElement => {
            const checkbox = dayElement.querySelector('.day-checkbox');
            if (checkbox.checked) {
                const day = checkbox.value;
                const startTime = dayElement.querySelector('.start-time').value;
                const endTime = dayElement.querySelector('.end-time').value;
                
                if (startTime && endTime) {
                    availability.push({
                        day,
                        startTime,
                        endTime
                    });
                }
            }
        });

        const scheduleData = {
            availability,
            hourlyRate: parseInt(document.getElementById('edit-hourlyRate').value) || null,
            experienceYears: parseInt(document.getElementById('edit-experienceYears').value) || null
        };

        // Save schedule
        const scheduleResponse = await fetch('/api/profile/schedule', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(scheduleData)
        });

        if (!scheduleResponse.ok) {
            throw new Error('Failed to update schedule');
        }

        // Note: Subject update would require additional API endpoint for tutor subjects
        // For now, we'll skip this part

        // Reload profile data
        await loadProfile();
        await loadSchedule();

        // Exit edit mode
        toggleEditMode();
        
        showSuccess('Profile updated successfully!');

    } catch (error) {
        console.error('Error saving profile:', error);
        showError('Failed to save profile');
    } finally {
        hideLoadingOverlay();
    }
}

// Password change functions
function showPasswordChange() {
    document.getElementById('show-password-btn').style.display = 'none';
    document.getElementById('password-change-form').style.display = 'block';
}

function hidePasswordChange() {
    document.getElementById('show-password-btn').style.display = 'block';
    document.getElementById('password-change-form').style.display = 'none';
    
    // Clear password fields
    document.getElementById('current-password').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';
}

async function changePassword() {
    try {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showError('All password fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            showError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            showError('New password must be at least 6 characters');
            return;
        }

        showLoadingOverlay();

        const response = await fetch('/api/profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to change password');
        }

        hidePasswordChange();
        showSuccess('Password changed successfully!');

    } catch (error) {
        console.error('Error changing password:', error);
        showError(error.message);
    } finally {
        hideLoadingOverlay();
    }
}

// Utility functions
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatTime(time) {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// UI Helper functions
function showLoadingOverlay() {
    document.getElementById('loading-overlay').classList.remove('hidden');
}

function hideLoadingOverlay() {
    document.getElementById('loading-overlay').classList.add('hidden');
}

function showError(message) {
    // Simple alert for now - could be enhanced with custom modal
    alert('Error: ' + message);
}

function showSuccess(message) {
    // Simple alert for now - could be enhanced with custom modal
    alert(message);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    }
}

// Navigation function
function goBack() {
    window.history.back();
}

function goHome() {
    window.location.href = '../index.html';
}