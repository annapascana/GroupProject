// CrimsonCollab Profile Page JavaScript

// Global variables
let currentUser = null;
let originalFormData = {};
let interests = [];
let skills = [];

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!userManager.isLoggedIn()) {
        showNotification('Please log in to access your profile.', 'danger');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return;
    }
    
    initializeProfilePage();
});

// Initialize Profile Page
function initializeProfilePage() {
    loadUserProfile();
    setupFormValidation();
    setupFormSubmission();
    setupSocialAccounts();
    setupInterestsAndSkills();
    setupAvatarUpload();
    setupQuickActions();
    setupAccessibility();
    
    // Refresh statistics when page becomes visible
    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            refreshStatistics();
        }
    });
    
    // Refresh statistics when window gains focus
    window.addEventListener('focus', refreshStatistics);
}

// Load User Profile
async function loadUserProfile() {
    currentUser = userManager.getCurrentUser();
    if (!currentUser) {
        showNotification('Unable to load user profile.', 'danger');
        return;
    }
    
    // Clear old avatar data to free up space
    clearOldAvatarData();
    
    // Try to load profile from backend API first
    try {
        const token = localStorage.getItem('crimsonCollab_session');
        if (token) {
            const session = JSON.parse(token);
            const authToken = session.token || session.jwt;
            
            if (authToken) {
                const response = await fetch('http://localhost:3000/api/users/profile', {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });
                
                if (response.ok) {
                    const profileData = await response.json();
                    currentUser = {
                        ...currentUser,
                        ...profileData
                    };
                }
            }
        }
    } catch (error) {
        console.log('Failed to load profile from API, using localStorage data:', error);
    }
    
    // Update profile header
    updateProfileHeader();
    
    // Load form data
    loadFormData();
    
    // Update social accounts
    updateSocialAccounts();
    
    // Load interests and skills
    loadInterestsAndSkills();
    
    // Update statistics
    updateStatistics();
}

// Update Profile Header
function updateProfileHeader() {
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileRole = document.getElementById('profileRole');
    const profileAvatar = document.getElementById('profileAvatar');
    
    if (profileName) {
        profileName.textContent = `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    if (profileEmail) {
        profileEmail.textContent = currentUser.email;
    }
    
    if (profileRole) {
        profileRole.textContent = currentUser.role || 'User';
    }
    
    if (profileAvatar) {
        // Generate avatar with user initials
        const initials = (currentUser.firstName?.[0] || '') + (currentUser.lastName?.[0] || '');
        console.log('Profile avatar update - firstName:', currentUser.firstName, 'lastName:', currentUser.lastName, 'initials:', initials);
        if (initials) {
            console.log('Generating profile avatar with initials:', initials);
            profileAvatar.src = generateDefaultAvatar(initials);
        } else {
            console.log('No initials available for profile avatar');
        }
    } else {
        console.log('Profile avatar element not found');
    }
}

// Load Form Data
function loadFormData() {
    const formFields = [
        'firstName', 'lastName', 'email', 'dateOfBirth', 'bio',
        'phoneNumber', 'alternateEmail', 'address', 'city', 'state', 'zipCode',
        'timezone', 'language', 'emailNotifications', 'smsNotifications',
        'profilePublic', 'showOnlineStatus'
    ];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            let value = '';
            
            if (field.type === 'checkbox') {
                value = currentUser.profile?.[fieldId] || false;
                field.checked = value;
            } else {
                value = currentUser.profile?.[fieldId] || currentUser[fieldId] || '';
                field.value = value;
            }
            
            // Store original value for reset functionality
            originalFormData[fieldId] = value;
        }
    });
}

// Update Social Accounts
function updateSocialAccounts() {
    const socialProviders = ['google', 'github', 'microsoft'];
    
    socialProviders.forEach(provider => {
        const statusElement = document.getElementById(`${provider}Status`);
        const connectBtn = document.getElementById(`${provider}ConnectBtn`);
        
        if (currentUser.socialProvider === provider) {
            if (statusElement) {
                statusElement.textContent = 'Connected';
                statusElement.classList.add('connected');
            }
            if (connectBtn) {
                connectBtn.textContent = 'Disconnect';
                connectBtn.classList.remove('btn-outline-primary');
                connectBtn.classList.add('btn-outline-danger');
            }
        } else {
            if (statusElement) {
                statusElement.textContent = 'Not connected';
                statusElement.classList.remove('connected');
            }
            if (connectBtn) {
                connectBtn.textContent = 'Connect';
                connectBtn.classList.remove('btn-outline-danger');
                connectBtn.classList.add('btn-outline-primary');
            }
        }
    });
}

// Load Interests and Skills
function loadInterestsAndSkills() {
    interests = currentUser.profile?.interests || [];
    skills = currentUser.profile?.skills || [];
    
    renderInterests();
    renderSkills();
}

// Render Interests
function renderInterests() {
    const container = document.getElementById('interestsTags');
    if (!container) return;
    
    container.innerHTML = '';
    
    interests.forEach((interest, index) => {
        const tag = createTag(interest, 'interest', index);
        container.appendChild(tag);
    });
}

// Render Skills
function renderSkills() {
    const container = document.getElementById('skillsTags');
    if (!container) return;
    
    container.innerHTML = '';
    
    skills.forEach((skill, index) => {
        const tag = createTag(skill, 'skill', index);
        container.appendChild(tag);
    });
}

// Create Tag Element
function createTag(text, type, index) {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
        <span>${text}</span>
        <button type="button" class="remove-tag" onclick="remove${type.charAt(0).toUpperCase() + type.slice(1)}(${index})">
            <i class="bi bi-x"></i>
        </button>
    `;
    return tag;
}

// Add Interest
function addInterest() {
    const input = document.getElementById('interestsInput');
    const value = input.value.trim();
    
    if (value && !interests.includes(value)) {
        interests.push(value);
        renderInterests();
        input.value = '';
    }
}

// Add Skill
function addSkill() {
    const input = document.getElementById('skillsInput');
    const value = input.value.trim();
    
    if (value && !skills.includes(value)) {
        skills.push(value);
        renderSkills();
        input.value = '';
    }
}

// Remove Interest
function removeInterest(index) {
    interests.splice(index, 1);
    renderInterests();
}

// Remove Skill
function removeSkill(index) {
    skills.splice(index, 1);
    renderSkills();
}

// Setup Form Validation
function setupFormValidation() {
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            if (this.classList.contains('is-invalid')) {
                validateField(this);
            }
        });
    });
}

// Validate Field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing validation classes
    field.classList.remove('is-valid', 'is-invalid');
    
    // Required field check
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required.';
    } else if (value) {
        // Specific validation based on field type
        switch (fieldName) {
            case 'email':
            case 'alternateEmail':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
                
            case 'phoneNumber':
                if (!isValidPhoneNumber(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number.';
                }
                break;
                
            case 'zipCode':
                if (!isValidZipCode(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid ZIP code.';
                }
                break;
                
            case 'firstName':
            case 'lastName':
                if (value.length < 2) {
                    isValid = false;
                    errorMessage = 'Name must be at least 2 characters long.';
                }
                break;
        }
    }
    
    // Apply validation classes and messages
    if (isValid) {
        field.classList.add('is-valid');
        clearFieldError(field);
    } else {
        field.classList.add('is-invalid');
        showFieldError(field, errorMessage);
    }
    
    return isValid;
}

// Validation Helper Functions
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhoneNumber(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

function isValidZipCode(zip) {
    const zipRegex = /^\d{5}(-\d{4})?$/;
    return zipRegex.test(zip);
}

// Show Field Error
function showFieldError(field, message) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
    }
}

// Clear Field Error
function clearFieldError(field) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = '';
    }
}

// Setup Form Submission
function setupFormSubmission() {
    const form = document.getElementById('profileForm');
    form.addEventListener('submit', handleFormSubmission);
}

// Handle Form Submission
function handleFormSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required], select[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    if (!isFormValid) {
        showNotification('Please fix the errors above.', 'danger');
        return;
    }
    
    // Show loading state
    setButtonLoading(submitBtn, true);
    
    // Collect form data
    const formData = collectFormData();
    
    // Update user profile
    setTimeout(() => {
        const result = userManager.updateUserProfile(currentUser.id, formData);
        
        if (result.success) {
            showNotification('Profile updated successfully!', 'success');
            currentUser = result.user;
            updateProfileHeader();
            originalFormData = { ...formData };
        } else {
            showNotification(result.message, 'danger');
        }
        
        setButtonLoading(submitBtn, false);
    }, 1000);
}

// Collect Form Data
function collectFormData() {
    const formFields = [
        'firstName', 'lastName', 'email', 'dateOfBirth', 'bio',
        'phoneNumber', 'alternateEmail', 'address', 'city', 'state', 'zipCode',
        'timezone', 'language', 'emailNotifications', 'smsNotifications',
        'profilePublic', 'showOnlineStatus'
    ];
    
    const formData = {
        profile: {
            interests: interests,
            skills: skills
        }
    };
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'checkbox') {
                formData.profile[fieldId] = field.checked;
            } else {
                formData.profile[fieldId] = field.value.trim();
            }
        }
    });
    
    // Update main user fields
    formData.firstName = formData.profile.firstName;
    formData.lastName = formData.profile.lastName;
    formData.email = formData.profile.email;
    
    return formData;
}

// Set Button Loading State
function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (isLoading) {
        btnText.classList.add('d-none');
        btnLoading.classList.remove('d-none');
        button.disabled = true;
    } else {
        btnText.classList.remove('d-none');
        btnLoading.classList.add('d-none');
        button.disabled = false;
    }
}

// Setup Social Accounts
function setupSocialAccounts() {
    const socialProviders = ['google', 'github', 'microsoft'];
    
    socialProviders.forEach(provider => {
        const connectBtn = document.getElementById(`${provider}ConnectBtn`);
        if (connectBtn) {
            connectBtn.addEventListener('click', () => {
                handleSocialAccountAction(provider);
            });
        }
    });
}

// Handle Social Account Action
function handleSocialAccountAction(provider) {
    const isConnected = currentUser.socialProvider === provider;
    
    if (isConnected) {
        // Disconnect social account
        if (confirm(`Are you sure you want to disconnect your ${provider} account?`)) {
            disconnectSocialAccount(provider);
        }
    } else {
        // Connect social account
        connectSocialAccount(provider);
    }
}

// Connect Social Account
function connectSocialAccount(provider) {
    showNotification(`Connecting to ${provider}...`, 'info');
    
    // Simulate social account connection
    setTimeout(() => {
        const mockSocialData = {
            provider: provider,
            email: currentUser.email,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            avatar: `https://via.placeholder.com/150/4285f4/ffffff?text=${provider.charAt(0).toUpperCase()}`
        };
        
        const result = userManager.updateUserProfile(currentUser.id, {
            socialProvider: provider,
            avatar: mockSocialData.avatar,
            profile: {
                ...currentUser.profile,
                avatar: mockSocialData.avatar
            }
        });
        
        if (result.success) {
            showNotification(`Successfully connected to ${provider}!`, 'success');
            currentUser = result.user;
            updateSocialAccounts();
        } else {
            showNotification(`Failed to connect to ${provider}.`, 'danger');
        }
    }, 1500);
}

// Disconnect Social Account
function disconnectSocialAccount(provider) {
    showNotification(`Disconnecting from ${provider}...`, 'info');
    
    setTimeout(() => {
        const result = userManager.updateUserProfile(currentUser.id, {
            socialProvider: null,
            avatar: null,
            profile: {
                ...currentUser.profile,
                avatar: null
            }
        });
        
        if (result.success) {
            showNotification(`Successfully disconnected from ${provider}!`, 'success');
            currentUser = result.user;
            updateSocialAccounts();
            updateProfileHeader();
        } else {
            showNotification(`Failed to disconnect from ${provider}.`, 'danger');
        }
    }, 1000);
}

// Setup Interests and Skills
function setupInterestsAndSkills() {
    const interestsInput = document.getElementById('interestsInput');
    const skillsInput = document.getElementById('skillsInput');
    
    if (interestsInput) {
        interestsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addInterest();
            }
        });
    }
    
    if (skillsInput) {
        skillsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
            }
        });
    }
}

// Avatar functionality removed - using initials only

// Clear old avatar data to free up localStorage space
function clearOldAvatarData() {
    try {
        const keys = Object.keys(localStorage);
        const avatarKeys = keys.filter(key => key.startsWith('user_avatar_'));
        
        // Remove all avatar data since we're not using it anymore
        avatarKeys.forEach(key => {
            localStorage.removeItem(key);
            console.log('Cleared avatar data:', key);
        });
    } catch (error) {
        console.error('Error clearing avatar data:', error);
    }
}

// Generate default avatar with user initials
function generateDefaultAvatar(initials) {
    console.log('Profile generateDefaultAvatar called with initials:', initials);
    const canvas = document.createElement('canvas');
    canvas.width = 150;
    canvas.height = 150;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#9E1B32';
    ctx.fillRect(0, 0, 150, 150);
    
    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(initials.toUpperCase(), 75, 75);
    
    const dataUrl = canvas.toDataURL();
    console.log('Profile generated avatar data URL length:', dataUrl.length);
    return dataUrl;
}

// Setup Quick Actions
function setupQuickActions() {
    // Quick action buttons are handled by onclick attributes
}

// Scroll to Section
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// Reset Form
function resetForm() {
    if (confirm('Are you sure you want to reset all changes?')) {
        loadFormData();
        loadInterestsAndSkills();
        showNotification('Form reset to original values.', 'info');
    }
}

// Refresh Statistics (call this when returning to profile page)
function refreshStatistics() {
    updateStatistics();
}

// Update Statistics
function updateStatistics() {
    // Calculate accurate statistics from user data
    const collaborationsCount = document.getElementById('collaborationsCount');
    const favoritesCount = document.getElementById('favoritesCount');
    const messagesCount = document.getElementById('messagesCount');
    
    // Calculate collaborations count from user activity
    if (collaborationsCount) {
        const userActivity = JSON.parse(localStorage.getItem('userActivity') || '[]');
        const collaborationActivities = userActivity.filter(activity => 
            ['travel', 'study', 'workout', 'friend', 'innovate', 'message'].includes(activity.type)
        );
        collaborationsCount.textContent = collaborationActivities.length;
    }
    
    // Calculate favorites count from dashboard favorites
    if (favoritesCount) {
        const favorites = JSON.parse(localStorage.getItem('dashboard_favorites') || '[]');
        favoritesCount.textContent = favorites.length;
    }
    
    // Calculate messages count from user messages
    if (messagesCount) {
        const userMessages = JSON.parse(localStorage.getItem('userMessages') || '[]');
        let totalMessages = 0;
        userMessages.forEach(conversation => {
            totalMessages += conversation.messages.length;
        });
        messagesCount.textContent = totalMessages;
    }
}

// Setup Accessibility
function setupAccessibility() {
    // Add ARIA labels to form elements
    const form = document.getElementById('profileForm');
    const inputs = form.querySelectorAll('input, select, textarea');
    
    inputs.forEach(input => {
        if (!input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
            const label = form.querySelector(`label[for="${input.id}"]`);
            if (label) {
                input.setAttribute('aria-labelledby', label.id || input.id + '-label');
            }
        }
    });
    
    // Add keyboard navigation for tags
    const tagButtons = document.querySelectorAll('.remove-tag');
    tagButtons.forEach(button => {
        button.setAttribute('aria-label', 'Remove tag');
    });
}

// Handle Sign Out
function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        userManager.clearSession();
        showNotification('Signed out successfully.', 'success');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1000);
    }
}

// Show Notification
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-radius: 12px;
    `;
    
    notification.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="bi bi-${getNotificationIcon(type)} me-2"></i>
            <span>${message}</span>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Get Notification Icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle-fill',
        danger: 'exclamation-triangle-fill',
        warning: 'exclamation-triangle-fill',
        info: 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// Export functions for global access
window.scrollToSection = scrollToSection;
window.resetForm = resetForm;
window.addInterest = addInterest;
window.addSkill = addSkill;
window.removeInterest = removeInterest;
window.removeSkill = removeSkill;
window.handleSignOut = handleSignOut;

// Initialize profile page
document.addEventListener('DOMContentLoaded', function() {
    // Wait for userManager to be available
    setTimeout(() => {
        if (typeof userManager !== 'undefined') {
            loadUserProfile();
            setupFormValidation();
            setupInterestsAndSkills();
            setupQuickActions();
            setupAccessibility();
            
            // Listen for visibility change to refresh statistics
            document.addEventListener('visibilitychange', function() {
                if (!document.hidden) {
                    refreshStatistics();
                }
            });
            
            // Listen for focus to refresh statistics
            window.addEventListener('focus', refreshStatistics);
        } else {
            console.error('userManager not available');
            showNotification('Unable to load user data.', 'danger');
        }
    }, 100);
});
