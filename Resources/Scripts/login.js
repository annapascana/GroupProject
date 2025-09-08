// CrimsonCollab Login Page JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeLoginPage();
});

// Initialize all login page functionality
function initializeLoginPage() {
    setupFormValidation();
    setupPasswordStrength();
    setupFormSubmission();
    setupSocialLogin();
    setupForgotPassword();
    setupAnimations();
    setupAccessibility();
}

// Form Validation
function setupFormValidation() {
    const forms = document.querySelectorAll('.auth-form');
    
    forms.forEach(form => {
        const inputs = form.querySelectorAll('input[required]');
        
        inputs.forEach(input => {
            // Real-time validation
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    validateField(this);
                }
            });
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id;
    let isValid = true;
    let errorMessage = '';
    
    // Remove existing validation classes
    field.classList.remove('is-valid', 'is-invalid');
    
    // Required field check
    if (!value) {
        isValid = false;
        errorMessage = 'This field is required.';
    } else {
        // Specific validation based on field type
        switch (fieldName) {
            case 'loginEmail':
            case 'registerEmail':
            case 'resetEmail':
                if (!isValidEmail(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address.';
                }
                break;
                
            case 'registerPassword':
                const strength = checkPasswordStrength(value);
                if (strength.score < 2) {
                    isValid = false;
                    errorMessage = 'Password must be at least 8 characters with uppercase, lowercase, and numbers.';
                }
                break;
                
            case 'confirmPassword':
                const password = document.getElementById('registerPassword').value;
                if (value !== password) {
                    isValid = false;
                    errorMessage = 'Passwords do not match.';
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

// Email validation
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show field error
function showFieldError(field, message) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = message;
    }
}

// Clear field error
function clearFieldError(field) {
    const feedback = field.parentNode.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.textContent = '';
    }
}

// Password Strength Checker
function setupPasswordStrength() {
    const passwordField = document.getElementById('registerPassword');
    if (!passwordField) return;
    
    passwordField.addEventListener('input', function() {
        const password = this.value;
        const strength = checkPasswordStrength(password);
        updatePasswordStrengthUI(strength);
    });
}

// Check password strength
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score++;
    else feedback.push('At least 8 characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Uppercase letter');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Lowercase letter');
    
    // Number check
    if (/\d/.test(password)) score++;
    else feedback.push('Number');
    
    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    else feedback.push('Special character');
    
    return {
        score: score,
        feedback: feedback,
        strength: getStrengthLevel(score)
    };
}

// Get strength level
function getStrengthLevel(score) {
    if (score < 2) return 'weak';
    if (score < 3) return 'fair';
    if (score < 4) return 'good';
    return 'strong';
}

// Update password strength UI
function updatePasswordStrengthUI(strength) {
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (!strengthFill || !strengthText) return;
    
    // Reset classes
    strengthFill.className = 'strength-fill';
    
    // Update strength bar
    strengthFill.classList.add(strength.strength);
    
    // Update text
    const strengthMessages = {
        weak: 'Weak password',
        fair: 'Fair password',
        good: 'Good password',
        strong: 'Strong password'
    };
    
    strengthText.textContent = strengthMessages[strength.strength];
    strengthText.className = `strength-text text-${strength.strength === 'weak' ? 'danger' : strength.strength === 'fair' ? 'warning' : 'success'}`;
}

// Toggle password visibility
function togglePassword(fieldId) {
    const field = document.getElementById(fieldId);
    const toggle = field.parentNode.querySelector('.password-toggle i');
    
    if (field.type === 'password') {
        field.type = 'text';
        toggle.className = 'bi bi-eye-slash';
    } else {
        field.type = 'password';
        toggle.className = 'bi bi-eye';
    }
}

// Form Submission
function setupFormSubmission() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
}

// Handle login form submission
function handleLogin(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
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
    setButtonLoading(form.querySelector('button[type="submit"]'), true);
    
    // Simulate API call
    setTimeout(() => {
        const email = formData.get('loginEmail') || document.getElementById('loginEmail').value;
        const password = formData.get('loginPassword') || document.getElementById('loginPassword').value;
        
        // Simulate authentication
        if (email && password) {
            showNotification('Login successful! Redirecting...', 'success');
            
            // Simulate redirect after 2 seconds
            setTimeout(() => {
                // Redirect to dashboard
                console.log('Redirecting to dashboard...');
                window.location.href = './dashboard.html';
            }, 2000);
        } else {
            showNotification('Invalid email or password.', 'danger');
        }
        
        setButtonLoading(form.querySelector('button[type="submit"]'), false);
    }, 2000);
}

// Handle register form submission
function handleRegister(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    
    // Validate all fields
    const inputs = form.querySelectorAll('input[required]');
    let isFormValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isFormValid = false;
        }
    });
    
    // Check password confirmation
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showNotification('Passwords do not match.', 'danger');
        isFormValid = false;
    }
    
    if (!isFormValid) {
        showNotification('Please fix the errors above.', 'danger');
        return;
    }
    
    // Show loading state
    setButtonLoading(form.querySelector('button[type="submit"]'), true);
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Account created successfully! Please check your email to verify your account.', 'success');
        
        // Clear form
        form.reset();
        
        // Switch to login tab
        const loginTab = document.getElementById('login-tab');
        if (loginTab) {
            loginTab.click();
        }
        
        setButtonLoading(form.querySelector('button[type="submit"]'), false);
    }, 2000);
}

// Set button loading state
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

// Social Login
function setupSocialLogin() {
    // Social login buttons are handled by onclick attributes
}

function socialLogin(provider) {
    showNotification(`Redirecting to ${provider} login...`, 'info');
    
    // Simulate social login redirect
    setTimeout(() => {
        console.log(`Social login with ${provider}`);
        // In a real app, redirect to OAuth provider
        // window.location.href = `/auth/${provider}`;
    }, 1000);
}

// Forgot Password
function setupForgotPassword() {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    
    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', handleForgotPassword);
    }
}

function showForgotPassword() {
    const modal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));
    modal.show();
}

function handleForgotPassword(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = document.getElementById('resetEmail').value;
    
    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'danger');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Password reset link sent to your email.', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }, 2000);
}

// Show notification
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

// Get notification icon
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle-fill',
        danger: 'exclamation-triangle-fill',
        warning: 'exclamation-triangle-fill',
        info: 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// Setup animations
function setupAnimations() {
    // Add fade-in animation to login card
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.classList.add('fade-in');
    }
    
    // Animate background shapes
    const shapes = document.querySelectorAll('.shape');
    shapes.forEach((shape, index) => {
        shape.style.animationDelay = `${index * 2}s`;
    });
}

// Setup accessibility
function setupAccessibility() {
    // Add ARIA labels to password toggle buttons
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
        toggle.setAttribute('aria-label', 'Toggle password visibility');
        toggle.setAttribute('type', 'button');
    });
    
    // Add ARIA labels to social login buttons
    const socialButtons = document.querySelectorAll('.social-btn');
    socialButtons.forEach(button => {
        const provider = button.textContent.trim();
        button.setAttribute('aria-label', `Login with ${provider}`);
    });
    
    // Focus management for modals
    const modal = document.getElementById('forgotPasswordModal');
    if (modal) {
        modal.addEventListener('shown.bs.modal', function() {
            const firstInput = this.querySelector('input');
            if (firstInput) {
                firstInput.focus();
            }
        });
    }
}

// Utility functions
const utils = {
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Format error message
    formatErrorMessage: function(fieldName, error) {
        const messages = {
            required: `${fieldName} is required.`,
            email: 'Please enter a valid email address.',
            password: 'Password must be at least 8 characters long.',
            match: 'Passwords do not match.'
        };
        return messages[error] || 'Invalid input.';
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};

// Export utils for potential external use
window.CrimsonCollabUtils = utils;
