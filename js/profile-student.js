// Student Profile Page JavaScript

let isEditMode = false;
let originalData = {};
let allSubjects = [];

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    try {
        await loadProfile();
        await loadSubjects();
        await loadPreferences();
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
        document.getElementById('display-bio').textContent = profile.bio || 'Tell us about yourself...';

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

// Load student preferences
async function loadPreferences() {
    try {
        const response = await fetch('/api/profile/preferences', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (!response.ok) {
            if (response.status === 403) {
                // Not a student, hide preferences section
                return;
            }
            throw new Error('Failed to load preferences');
        }

        const data = await response.json();
        const preferences = data.preferences;

        // Update display values
        document.getElementById('display-gradeLevel').textContent = 
            formatGradeLevel(preferences.gradeLevel) || 'Not set';
        document.getElementById('display-learningStyle').textContent = 
            formatLearningStyle(preferences.learningStyle) || 'Not set';

        // Update edit inputs
        document.getElementById('edit-gradeLevel').value = preferences.gradeLevel || '';
        document.getElementById('edit-learningStyle').value = preferences.learningStyle || '';

        // Update preferred subjects display
        updateSubjectsDisplay(preferences.preferredSubjects || []);

        // Update checkboxes
        const preferredSubjectIds = (preferences.preferredSubjects || []).map(s => s.id);
        preferredSubjectIds.forEach(subjectId => {
            const checkbox = document.getElementById(`subject-${subjectId}`);
            if (checkbox) {
                checkbox.checked = true;
                updateSubjectItem(checkbox.parentElement);
            }
        });

    } catch (error) {
        console.error('Error loading preferences:', error);
        showError('Failed to load preferences');
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
        
        const initials = ((firstName || 'S').charAt(0) + (lastName || 'T').charAt(0)).toUpperCase();
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

// Update subject checkbox item appearance
function updateSubjectItem(item) {
    const checkbox = item.querySelector('input[type="checkbox"]');
    if (checkbox.checked) {
        item.classList.add('selected');
    } else {
        item.classList.remove('selected');
    }
}

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
}

// Show display values
function showDisplayValues() {
    // Basic info
    document.querySelectorAll('.display-value').forEach(el => el.style.display = 'block');
    document.querySelectorAll('.edit-input').forEach(el => el.style.display = 'none');
    
    // Subjects
    document.getElementById('subjects-display').style.display = 'flex';
    document.getElementById('subjects-edit').style.display = 'none';
}

// Reset to original values
function resetToOriginalValues() {
    document.getElementById('edit-firstName').value = originalData.firstName || '';
    document.getElementById('edit-lastName').value = originalData.lastName || '';
    document.getElementById('edit-email').value = originalData.email || '';
    document.getElementById('edit-phoneNumber').value = originalData.phoneNumber || '';
    document.getElementById('edit-bio').value = originalData.bio || '';
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

        // Collect preferences data
        const gradeLevel = document.getElementById('edit-gradeLevel').value;
        const learningStyle = document.getElementById('edit-learningStyle').value;
        const preferredSubjectIds = Array.from(document.querySelectorAll('#subjects-grid input[type="checkbox"]:checked'))
            .map(checkbox => parseInt(checkbox.value));

        const preferencesData = {
            gradeLevel: gradeLevel || null,
            learningStyle: learningStyle || null,
            preferredSubjectIds
        };

        // Save preferences
        const preferencesResponse = await fetch('/api/profile/preferences', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(preferencesData)
        });

        if (!preferencesResponse.ok) {
            throw new Error('Failed to update preferences');
        }

        // Reload profile data
        await loadProfile();
        await loadPreferences();

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
function formatGradeLevel(level) {
    const levels = {
        'elementary': 'Elementary (K-5)',
        'middle': 'Middle School (6-8)',
        'high': 'High School (9-12)',
        'college': 'College',
        'adult': 'Adult Learning'
    };
    return levels[level] || level;
}

function formatLearningStyle(style) {
    const styles = {
        'visual': 'Visual',
        'auditory': 'Auditory',
        'kinesthetic': 'Kinesthetic',
        'reading': 'Reading/Writing'
    };
    return styles[style] || style;
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