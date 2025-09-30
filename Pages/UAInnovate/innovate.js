// UA Innovate Profile Creation JavaScript

document.addEventListener('DOMContentLoaded', function() {
    const profileForm = document.getElementById('profileForm');
    const yearSelect = document.getElementById('year');
    const majorInput = document.getElementById('major');
    const misSemesterGroup = document.getElementById('misSemesterGroup');
    const misSemesterSelect = document.getElementById('misSemester');
    const technicalSkillsTextarea = document.getElementById('technicalSkills');
    const interestsTextarea = document.getElementById('interests');
    const clearFormBtn = document.getElementById('clearForm');
    const profileSummary = document.getElementById('profileSummary');
    const profileDetails = document.getElementById('profileDetails');
    const editProfileBtn = document.getElementById('editProfile');

    // Check if user is MIS major and show/hide semester field
    function toggleMISSemester() {
        const majorValue = majorInput.value.toLowerCase().trim();
        const isMIS = majorValue.includes('mis') || 
                     majorValue.includes('management information systems') ||
                     majorValue.includes('information systems');
        
        if (isMIS) {
            misSemesterGroup.style.display = 'block';
            misSemesterSelect.required = true;
        } else {
            misSemesterGroup.style.display = 'none';
            misSemesterSelect.required = false;
            misSemesterSelect.value = '';
        }
    }

    // Event listener for major input changes
    majorInput.addEventListener('input', toggleMISSemester);
    majorInput.addEventListener('blur', toggleMISSemester);

    // Form validation
    function validateForm() {
        const year = yearSelect.value;
        const major = majorInput.value.trim();
        const isMIS = major.toLowerCase().includes('mis') || 
                     major.toLowerCase().includes('management information systems') ||
                     major.toLowerCase().includes('information systems');
        const misSemester = misSemesterSelect.value;

        if (!year) {
            showError('Please select your academic year.');
            return false;
        }

        if (!major) {
            showError('Please enter your major.');
            return false;
        }

        if (isMIS && !misSemester) {
            showError('Please select your semester in the MIS program.');
            return false;
        }

        return true;
    }

    // Show error message
    function showError(message) {
        // Remove existing error messages
        const existingError = document.querySelector('.error-message');
        if (existingError) {
            existingError.remove();
        }

        // Create new error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.cssText = `
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 8px;
            margin: 15px 0;
            border: 1px solid #f5c6cb;
            text-align: center;
            font-weight: 600;
        `;
        errorDiv.textContent = message;

        // Insert error message at the top of the form
        const formContainer = document.querySelector('.profile-form-container');
        formContainer.insertBefore(errorDiv, profileForm);

        // Auto-remove error after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.remove();
            }
        }, 5000);
    }

    // Format technical skills
    function formatTechnicalSkills(skills) {
        if (!skills.trim()) return 'None specified';
        
        // Split by comma or newline and clean up
        const skillsArray = skills.split(/[,\n]/)
            .map(skill => skill.trim())
            .filter(skill => skill.length > 0);
        
        return skillsArray.length > 0 ? skillsArray.join(', ') : 'None specified';
    }

    // Create profile summary HTML
    function createProfileSummary(profileData) {
        const isMIS = profileData.major.toLowerCase().includes('mis') || 
                     profileData.major.toLowerCase().includes('management information systems') ||
                     profileData.major.toLowerCase().includes('information systems');

        let summaryHTML = `
            <div class="profile-detail-item">
                <span class="profile-detail-label">Academic Year</span>
                <span class="profile-detail-value">${profileData.year.charAt(0).toUpperCase() + profileData.year.slice(1)}</span>
            </div>
            <div class="profile-detail-item">
                <span class="profile-detail-label">Major</span>
                <span class="profile-detail-value">${profileData.major}</span>
            </div>
        `;

        if (isMIS && profileData.misSemester) {
            summaryHTML += `
                <div class="profile-detail-item">
                    <span class="profile-detail-label">MIS Program Semester</span>
                    <span class="profile-detail-value">Semester ${profileData.misSemester}</span>
                </div>
            `;
        }

        summaryHTML += `
            <div class="profile-detail-item">
                <span class="profile-detail-label">Technical Skills</span>
                <span class="profile-detail-value">${formatTechnicalSkills(profileData.technicalSkills)}</span>
            </div>
        `;

        if (profileData.interests.trim()) {
            summaryHTML += `
                <div class="profile-detail-item">
                    <span class="profile-detail-label">Innovation Interests</span>
                    <span class="profile-detail-value">${profileData.interests}</span>
                </div>
            `;
        }

        return summaryHTML;
    }

    // Handle form submission
    profileForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        // Show loading state
        profileForm.classList.add('loading');

        try {
            // Collect form data
            const profileData = {
                year: yearSelect.value,
                major: majorInput.value.trim(),
                misSemester: misSemesterSelect.value,
                technicalSkills: technicalSkillsTextarea.value.trim(),
                interests: interestsTextarea.value.trim()
            };

            // Check if user already has a profile
            const existingUserId = localStorage.getItem('uaInnovateUserId');
            const existingProfile = localStorage.getItem('uaInnovateProfile');
            
            let userId;
            if (existingUserId && existingProfile) {
                // User already has a profile, keep the same ID
                userId = existingUserId;
                console.log('Updating existing profile for user:', userId);
            } else {
                // Create new user profile
                userId = 'user_' + Date.now();
                console.log('Creating new profile for user:', userId);
                
                // Initialize empty groups array for new user
                localStorage.setItem('myGroups', JSON.stringify([]));
            }
            
            // Save/update user profile
            localStorage.setItem('uaInnovateUserId', userId);
            localStorage.setItem('uaInnovateProfile', JSON.stringify(profileData));
            
            // Add/update in allProfiles for search functionality
            const allProfiles = JSON.parse(localStorage.getItem('allProfiles') || '[]');
            const userProfile = { ...profileData, userId: userId };
            
            // Check if user already exists in allProfiles
            const existingIndex = allProfiles.findIndex(p => p.userId === userId);
            if (existingIndex !== -1) {
                // Update existing profile
                allProfiles[existingIndex] = userProfile;
            } else {
                // Add new profile
                allProfiles.push(userProfile);
            }
            
            localStorage.setItem('allProfiles', JSON.stringify(allProfiles));

            // Remove loading state
            profileForm.classList.remove('loading');

            // Redirect to innovate dashboard immediately
            window.location.href = './dashboard.html';
        } catch (error) {
            console.error('Error creating profile:', error);
            showError('Failed to create profile. Please try again.');
            profileForm.classList.remove('loading');
        }
    });

    // Handle clear form button
    clearFormBtn.addEventListener('click', function() {
        if (confirm('Are you sure you want to clear all form data?')) {
            profileForm.reset();
            misSemesterGroup.style.display = 'none';
            misSemesterSelect.required = false;
            
            // Remove any error messages
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
        }
    });

    // Handle edit profile button
    editProfileBtn.addEventListener('click', function() {
        // Show form and hide summary
        document.querySelector('.profile-form-container').style.display = 'block';
        profileSummary.style.display = 'none';
        
        // Scroll to form
        document.querySelector('.profile-form-container').scrollIntoView({ 
            behavior: 'smooth' 
        });
    });

    // Check for existing profile and redirect if found
    function checkExistingProfile() {
        const existingProfile = localStorage.getItem('uaInnovateProfile');
        const existingUserId = localStorage.getItem('uaInnovateUserId');
        
        if (existingProfile && existingUserId) {
            try {
                const profileData = JSON.parse(existingProfile);
                console.log('Existing profile found, redirecting to dashboard...');
                window.location.href = './dashboard.html';
                return;
            } catch (error) {
                console.error('Error parsing existing profile:', error);
                // Clear corrupted data and continue with fresh start
                localStorage.removeItem('uaInnovateProfile');
                localStorage.removeItem('uaInnovateUserId');
            }
        }
        
        console.log('No existing profile found, showing profile creation form');
    }

    // Initialize the page
    checkExistingProfile();

    // Add some interactive enhancements
    majorInput.addEventListener('input', function() {
        // Auto-capitalize first letter of each word
        const words = this.value.split(' ');
        const capitalizedWords = words.map(word => 
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        );
        this.value = capitalizedWords.join(' ');
    });

    // Add smooth transitions
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            animation: slideDown 0.3s ease-out;
        }
        
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
    `;
    document.head.appendChild(style);

    // Theme toggle functionality
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const body = document.body;

    // Load saved theme
    const savedTheme = localStorage.getItem('uaInnovateTheme') || 'light';
    if (savedTheme === 'dark') {
        body.setAttribute('data-theme', 'dark');
        themeIcon.className = 'bi bi-sun-fill';
    }

    // Theme toggle event listener
    themeToggle.addEventListener('click', function() {
        if (body.getAttribute('data-theme') === 'dark') {
            body.removeAttribute('data-theme');
            themeIcon.className = 'bi bi-moon-fill';
            localStorage.setItem('uaInnovateTheme', 'light');
        } else {
            body.setAttribute('data-theme', 'dark');
            themeIcon.className = 'bi bi-sun-fill';
            localStorage.setItem('uaInnovateTheme', 'dark');
        }
    });
});