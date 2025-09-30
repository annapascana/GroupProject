// CrimsonCollab Login Page JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    if (userManager.isLoggedIn()) {
        showNotification('You are already logged in. Redirecting to dashboard...', 'info');
        setTimeout(() => {
            window.location.href = './dashboard.html';
        }, 2000);
        return;
    }
    
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

// Social Login Setup (placeholder for future implementation)
function setupSocialLogin() {
    // Social login functionality not yet implemented
    // This function is called to prevent ReferenceError
    console.log('Social login setup - not yet implemented');
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
                    errorMessage = 'Please enter a valid .edu email address.';
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

// Email validation - must end with .edu
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidFormat = emailRegex.test(email);
    const isEduEmail = email.toLowerCase().endsWith('.edu');
    return isValidFormat && isEduEmail;
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
    
    // Get form data
    const email = formData.get('loginEmail') || document.getElementById('loginEmail').value;
    const password = formData.get('loginPassword') || document.getElementById('loginPassword').value;
    
    // Validate credentials using UserManager
    setTimeout(() => {
        const validation = userManager.validateLogin(email, password);
        
        if (validation.success) {
            // Create session
            const session = userManager.createSession(validation.user);
            
            if (session) {
                // Save user data to shared data service
                if (window.sharedDataService) {
                    window.sharedDataService.updateUserData({
                        name: validation.user.firstName + ' ' + validation.user.lastName,
                        email: validation.user.email
                    });
                }
                
                showNotification('Login successful! Redirecting...', 'success');
                
                // Redirect to dashboard after 2 seconds
                setTimeout(() => {
                    console.log('Redirecting to dashboard...');
                    window.location.href = './dashboard.html';
                }, 2000);
            } else {
                showNotification('Failed to create session. Please try again.', 'danger');
            }
        } else {
            showNotification(validation.message, 'danger');
        }
        
        setButtonLoading(form.querySelector('button[type="submit"]'), false);
    }, 1000);
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
    
    // Get form data
    const userData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('registerEmail').value.trim(),
        password: password
    };
    
    // Create account using UserManager
    setTimeout(() => {
        const result = userManager.createUser(userData);
        
        if (result.success) {
            // Save user data to shared data service
            if (window.sharedDataService) {
                window.sharedDataService.updateUserData({
                    name: userData.firstName + ' ' + userData.lastName,
                    email: userData.email
                });
            }
            
            showNotification('Account created successfully! You can now sign in.', 'success');
            
            // Clear form
            form.reset();
            
            // Switch to login tab
            const loginTab = document.getElementById('login-tab');
            if (loginTab) {
                loginTab.click();
            }
        } else {
            showNotification(result.message, 'danger');
        }
        
        setButtonLoading(form.querySelector('button[type="submit"]'), false);
    }, 1000);
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
        showNotification('Please enter a valid .edu email address.', 'danger');
        return;
    }
    
    // Check if user exists
    const user = userManager.findUserByEmail(email);
    console.log('Forgot password - User lookup for email:', email, 'Found:', user);
    if (!user) {
        showNotification('No account found with this email address.', 'danger');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;
    
    // Generate one-time password
    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    
    // Store OTP data for verification
    const otpData = {
        email: email,
        otp: otp,
        expiresAt: expirationTime.toISOString(),
        attempts: 0,
        maxAttempts: 3
    };
    
    localStorage.setItem('password_reset_otp', JSON.stringify(otpData));
    
    // Show OTP directly on the page
    setTimeout(() => {
        // Show success notification
        showNotification(`Password reset code generated! Your verification code is: ${otp}`, 'success');
        
        // Show OTP in a prominent alert
        const otpAlert = document.createElement('div');
        otpAlert.className = 'alert alert-info alert-dismissible fade show';
        otpAlert.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 1060;
            min-width: 350px;
            max-width: 400px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            border-radius: 12px;
        `;
        otpAlert.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="bi bi-shield-check me-2"></i>
                <div>
                    <strong>Your Verification Code:</strong><br>
                    <code style="background: #f8f9fa; padding: 8px 12px; border-radius: 6px; font-weight: bold; font-size: 18px; color: #9E1B32;">${otp}</code>
                </div>
                <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert"></button>
            </div>
        `;
        document.body.appendChild(otpAlert);
        
        // Auto-remove after 60 seconds
        setTimeout(() => {
            if (otpAlert.parentNode) {
                otpAlert.remove();
            }
        }, 60000);
        
        // Close forgot password modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('forgotPasswordModal'));
        modal.hide();
        
        // Reset form
        form.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        // Show OTP verification modal
        showOTPVerificationModal(email, otp);
        
        // Log OTP to console for reference
        console.log(`🔐 PASSWORD RESET OTP for ${email}: ${otp} (expires in 10 minutes)`);
        
    }, 1000);
}

// Generate 6-digit one-time password
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Show OTP verification modal
function showOTPVerificationModal(email, otp) {
    console.log('Showing OTP verification modal for email:', email, 'OTP:', otp);
    
    // Create OTP verification modal if it doesn't exist
    let modal = document.getElementById('otpVerificationModal');
    if (!modal) {
        modal = createOTPVerificationModal();
        document.body.appendChild(modal);
    }
    
    // Update email display
    const emailDisplay = modal.querySelector('#otpEmail');
    if (emailDisplay) {
        emailDisplay.textContent = email;
    }
    
    // Show OTP in development mode
    const devOtpAlert = modal.querySelector('#devOtpAlert');
    const devOtpCode = modal.querySelector('#devOtpCode');
    if (devOtpAlert && devOtpCode) {
        devOtpCode.textContent = otp;
        devOtpAlert.style.display = 'block';
    }
    
    // Clear OTP input
    const otpInput = modal.querySelector('#otpCode');
    if (otpInput) {
        otpInput.value = '';
    }
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Focus on OTP input
    setTimeout(() => {
        if (otpInput) {
            otpInput.focus();
        }
    }, 500);
}

// Create OTP verification modal
function createOTPVerificationModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'otpVerificationModal';
    modal.tabIndex = -1;
    modal.setAttribute('aria-labelledby', 'otpVerificationModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="otpVerificationModalLabel">
                        <i class="bi bi-shield-check me-2"></i>Verify One-Time Password
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="bi bi-shield-check text-primary" style="font-size: 3rem;"></i>
                        <h6 class="mt-3">Enter Verification Code</h6>
                        <p class="text-muted">Enter the 6-digit code shown above for:</p>
                        <strong id="otpEmail">user@example.com</strong>
                        
                        <!-- OTP Display -->
                        <div class="alert alert-info mt-3" id="devOtpAlert" style="display: none;">
                            <small><strong>Your Code:</strong> <code id="devOtpCode" style="background: #f8f9fa; padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 16px;"></code></small>
                        </div>
                    </div>
                    
                    <form id="otpVerificationForm">
                        <div class="mb-3">
                            <label for="otpCode" class="form-label">Enter verification code</label>
                            <input type="text" class="form-control text-center" id="otpCode" 
                                   placeholder="000000" maxlength="6" pattern="[0-9]{6}" required>
                            <div class="form-text">Code expires in <span id="otpTimer">10:00</span></div>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-primary">
                                <i class="bi bi-check-circle me-2"></i>Verify Code
                            </button>
                            <button type="button" class="btn btn-outline-secondary" onclick="resendOTP()">
                                <i class="bi bi-arrow-clockwise me-2"></i>Resend Code
                            </button>
                        </div>
                    </form>
                    
                    <div id="otpError" class="alert alert-danger mt-3 d-none" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <span id="otpErrorText">Invalid verification code.</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const form = modal.querySelector('#otpVerificationForm');
    form.addEventListener('submit', handleOTPVerification);
    
    const otpInput = modal.querySelector('#otpCode');
    otpInput.addEventListener('input', function() {
        // Auto-format as user types
        this.value = this.value.replace(/\D/g, '').slice(0, 6);
        
        // Auto-submit when 6 digits are entered
        if (this.value.length === 6) {
            setTimeout(() => {
                form.dispatchEvent(new Event('submit'));
            }, 500);
        }
    });
    
    // Start countdown timer
    startOTPTimer();
    
    return modal;
}

// Handle OTP verification
function handleOTPVerification(e) {
    e.preventDefault();
    
    const form = e.target;
    const otpCode = document.getElementById('otpCode').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    // Get stored OTP data
    const otpData = JSON.parse(localStorage.getItem('password_reset_otp') || '{}');
    console.log('OTP verification - Stored OTP data:', otpData);
    console.log('OTP verification - Entered code:', otpCode);
    
    if (!otpData.email || !otpData.otp) {
        console.error('OTP verification - No OTP data found');
        showOTPError('No verification code found. Please request a new one.');
        return;
    }
    
    // Check if OTP has expired
    if (new Date() > new Date(otpData.expiresAt)) {
        showOTPError('Verification code has expired. Please request a new one.');
        return;
    }
    
    // Check attempts
    if (otpData.attempts >= otpData.maxAttempts) {
        showOTPError('Too many failed attempts. Please request a new code.');
        return;
    }
    
    // Verify OTP
    if (otpCode === otpData.otp) {
        console.log('OTP verification - Code matches! Proceeding to password reset form');
        // Success - show password reset form
        submitBtn.textContent = 'Verifying...';
        submitBtn.disabled = true;
        
        setTimeout(() => {
            // Close OTP modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('otpVerificationModal'));
            if (modal) {
                modal.hide();
            }
            
            // Show password reset form
            console.log('OTP verification - Showing password reset form for email:', otpData.email);
            showPasswordResetForm(otpData.email);
            
            // Store email and timestamp for password reset
            localStorage.setItem('password_reset_email', otpData.email);
            localStorage.setItem('password_reset_time', new Date().toISOString());
            
            // Clear OTP data (but keep email and timestamp for password reset)
            localStorage.removeItem('password_reset_otp');
            
        }, 1000);
        
    } else {
        console.log('OTP verification - Code does not match');
        // Increment attempts
        otpData.attempts++;
        localStorage.setItem('password_reset_otp', JSON.stringify(otpData));
        
        const remainingAttempts = otpData.maxAttempts - otpData.attempts;
        showOTPError(`Invalid verification code. ${remainingAttempts} attempts remaining.`);
        
        // Clear input
        document.getElementById('otpCode').value = '';
    }
}

// Show OTP error
function showOTPError(message) {
    const errorDiv = document.getElementById('otpError');
    const errorText = document.getElementById('otpErrorText');
    
    errorText.textContent = message;
    errorDiv.classList.remove('d-none');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('d-none');
    }, 5000);
}

// Start OTP countdown timer
function startOTPTimer() {
    const timerElement = document.getElementById('otpTimer');
    if (!timerElement) return;
    
    const otpData = JSON.parse(localStorage.getItem('password_reset_otp') || '{}');
    if (!otpData.expiresAt) return;
    
    const updateTimer = () => {
        const now = new Date();
        const expiresAt = new Date(otpData.expiresAt);
        const timeLeft = expiresAt - now;
        
        if (timeLeft <= 0) {
            timerElement.textContent = 'Expired';
            timerElement.classList.add('text-danger');
            return;
        }
        
        const minutes = Math.floor(timeLeft / 60000);
        const seconds = Math.floor((timeLeft % 60000) / 1000);
        timerElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 60000) { // Last minute
            timerElement.classList.add('text-warning');
        }
    };
    
    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    
    // Clear interval when modal is hidden
    const modal = document.getElementById('otpVerificationModal');
    modal.addEventListener('hidden.bs.modal', () => {
        clearInterval(timerInterval);
    });
}

// Resend OTP
function resendOTP() {
    const otpData = JSON.parse(localStorage.getItem('password_reset_otp') || '{}');
    if (!otpData.email) return;
    
    // Generate new OTP
    const newOTP = generateOTP();
    const expirationTime = new Date(Date.now() + 10 * 60 * 1000);
    
    const newOtpData = {
        email: otpData.email,
        otp: newOTP,
        expiresAt: expirationTime.toISOString(),
        attempts: 0,
        maxAttempts: 3
    };
    
    localStorage.setItem('password_reset_otp', JSON.stringify(newOtpData));
    
    showNotification('New verification code sent to your email!', 'success');
    
    // Log new OTP to console for demo purposes
    console.log(`DEMO: New OTP for ${otpData.email} is: ${newOTP} (expires in 10 minutes)`);
    
    // Restart timer
    startOTPTimer();
}

// Show password reset form
function showPasswordResetForm(email) {
    // Create password reset modal if it doesn't exist
    let modal = document.getElementById('passwordResetModal');
    if (!modal) {
        modal = createPasswordResetModal();
        document.body.appendChild(modal);
    }
    
    // Update email display
    const emailDisplay = modal.querySelector('#resetEmailDisplay');
    if (emailDisplay) {
        emailDisplay.textContent = email;
    }
    
    // Show modal
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

// Create password reset modal
function createPasswordResetModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'passwordResetModal';
    modal.tabIndex = -1;
    modal.setAttribute('aria-labelledby', 'passwordResetModalLabel');
    modal.setAttribute('aria-hidden', 'true');
    
    modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="passwordResetModalLabel">
                        <i class="bi bi-key me-2"></i>Reset Password
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="bi bi-shield-lock text-success" style="font-size: 3rem;"></i>
                        <h6 class="mt-3">Create new password</h6>
                        <p class="text-muted">For account: <strong id="resetEmailDisplay">user@example.com</strong></p>
                    </div>
                    
                    <form id="passwordResetForm">
                        <div class="mb-3">
                            <label for="newPassword" class="form-label">New Password</label>
                            <div class="password-input-group">
                                <input type="password" class="form-control" id="newPassword" required>
                                <button type="button" class="password-toggle" onclick="togglePassword('newPassword')">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                            <div class="password-strength mt-2">
                                <div class="strength-bar">
                                    <div class="strength-fill"></div>
                                </div>
                                <div class="strength-text"></div>
                            </div>
                        </div>
                        
                        <div class="mb-3">
                            <label for="confirmNewPassword" class="form-label">Confirm New Password</label>
                            <div class="password-input-group">
                                <input type="password" class="form-control" id="confirmNewPassword" required>
                                <button type="button" class="password-toggle" onclick="togglePassword('confirmNewPassword')">
                                    <i class="bi bi-eye"></i>
                                </button>
                            </div>
                        </div>
                        
                        <div class="d-grid">
                            <button type="submit" class="btn btn-success">
                                <i class="bi bi-check-circle me-2"></i>Reset Password
                            </button>
                        </div>
                    </form>
                    
                    <div id="passwordResetError" class="alert alert-danger mt-3 d-none" role="alert">
                        <i class="bi bi-exclamation-triangle-fill me-2"></i>
                        <span id="passwordResetErrorText">Passwords do not match.</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    const form = modal.querySelector('#passwordResetForm');
    form.addEventListener('submit', handlePasswordReset);
    
    const newPasswordInput = modal.querySelector('#newPassword');
    newPasswordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    return modal;
}

// Handle password reset
function handlePasswordReset(e) {
    e.preventDefault();
    
    console.log('Password reset form submitted');
    
    const form = e.target;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    console.log('Password reset - New password length:', newPassword.length);
    console.log('Password reset - Confirm password length:', confirmPassword.length);
    
    // Validate passwords
    if (newPassword !== confirmPassword) {
        console.log('Password reset - Passwords do not match');
        showPasswordResetError('Passwords do not match.');
        return;
    }
    
    if (newPassword.length < 8) {
        console.log('Password reset - Password too short');
        showPasswordResetError('Password must be at least 8 characters long.');
        return;
    }
    
    // Get email from stored password reset data
    const email = localStorage.getItem('password_reset_email');
    console.log('Password reset - Retrieved email:', email);
    
    if (!email) {
        console.error('Password reset - No email found in localStorage');
        showPasswordResetError('Session expired. Please start the password reset process again.');
        return;
    }
    
    // Check if password reset session is still valid (within 15 minutes)
    const passwordResetTime = localStorage.getItem('password_reset_time');
    if (passwordResetTime) {
        const resetTime = new Date(passwordResetTime);
        const now = new Date();
        const timeDiff = now - resetTime;
        const fifteenMinutes = 15 * 60 * 1000; // 15 minutes in milliseconds
        
        if (timeDiff > fifteenMinutes) {
            console.log('Password reset - Session expired (older than 15 minutes)');
            localStorage.removeItem('password_reset_email');
            localStorage.removeItem('password_reset_time');
            showPasswordResetError('Session expired. Please start the password reset process again.');
            return;
        }
    }
    
    submitBtn.textContent = 'Resetting...';
    submitBtn.disabled = true;
    
    // Simulate password reset
    setTimeout(() => {
        try {
            // Update user password in UserManager
            const user = userManager.findUserByEmail(email);
            console.log('Password reset - Found user:', user);
            
            if (user) {
                // Hash the new password
                const hashedPassword = userManager.hashPassword(newPassword);
                console.log('Password reset - Password hashed successfully');
                
                // Update user password
                user.password = hashedPassword;
                userManager.saveUser(user);
                console.log('Password reset - User saved successfully');
                
                showNotification('Password reset successfully! You can now sign in with your new password.', 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('passwordResetModal'));
                if (modal) {
                    modal.hide();
                }
                
                // Clear any remaining password reset data
                localStorage.removeItem('password_reset_otp');
                localStorage.removeItem('password_reset_email');
                localStorage.removeItem('password_reset_time');
                
                // Reset form
                form.reset();
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                
            } else {
                console.error('Password reset - User not found for email:', email);
                showPasswordResetError('User not found. Please contact support.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        } catch (error) {
            console.error('Password reset error:', error);
            showPasswordResetError('An error occurred while resetting your password. Please try again.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }, 1000);
}

// Show password reset error
function showPasswordResetError(message) {
    const errorDiv = document.getElementById('passwordResetError');
    const errorText = document.getElementById('passwordResetErrorText');
    
    errorText.textContent = message;
    errorDiv.classList.remove('d-none');
    
    // Hide error after 5 seconds
    setTimeout(() => {
        errorDiv.classList.add('d-none');
    }, 5000);
}

// Debug function to check password reset session state
function checkPasswordResetSession() {
    const email = localStorage.getItem('password_reset_email');
    const timestamp = localStorage.getItem('password_reset_time');
    const otpData = localStorage.getItem('password_reset_otp');
    
    console.log('Password Reset Session State:');
    console.log('- Email:', email);
    console.log('- Timestamp:', timestamp);
    console.log('- OTP Data:', otpData);
    
    if (timestamp) {
        const resetTime = new Date(timestamp);
        const now = new Date();
        const timeDiff = now - resetTime;
        const minutesElapsed = Math.floor(timeDiff / (1000 * 60));
        console.log('- Minutes elapsed:', minutesElapsed);
        console.log('- Session valid:', timeDiff < (15 * 60 * 1000));
    }
    
    return { email, timestamp, otpData };
}

// Make debug function available globally
window.checkPasswordResetSession = checkPasswordResetSession;

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

// Initialize the login page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page initialized');
    
    // Setup form validation and submission
    setupFormSubmission();
    setupPasswordStrength();
    setupForgotPassword();
    setupAnimations();
    setupAccessibility();
    
    console.log('All login page features initialized');
});
