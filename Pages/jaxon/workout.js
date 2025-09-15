// CrimsonCollab Workout Buddy Finder JavaScript

// Sample workout buddy data (in a real app, this would come from a database)
const workoutBuddies = [
    {
        id: 1,
        name: "Sarah Johnson",
        email: "sjohnson@ua.edu",
        gender: "female",
        year: "junior",
        goals: ["weight-loss", "cardio"],
        experienceLevel: "intermediate",
        availableTimes: ["morning", "evening"],
        preferredLocation: "student-recreation-center",
        bio: "Hey! I'm a junior studying business and I'm looking for a workout buddy to help me stay motivated. I love cardio and want to lose some weight. I'm usually free in the mornings and evenings.",
        matchPercentage: 95
    },
    {
        id: 2,
        name: "Mike Chen",
        email: "mchen@ua.edu",
        gender: "male",
        year: "sophomore",
        goals: ["muscle-gain", "strength"],
        experienceLevel: "beginner",
        availableTimes: ["afternoon", "evening"],
        preferredLocation: "student-recreation-center",
        bio: "New to working out and looking for someone to show me the ropes! I want to build muscle and get stronger. Available most afternoons and evenings.",
        matchPercentage: 78
    },
    {
        id: 3,
        name: "Alex Rivera",
        email: "arivera@ua.edu",
        gender: "non-binary",
        year: "senior",
        goals: ["flexibility", "general-fitness"],
        experienceLevel: "advanced",
        availableTimes: ["morning", "afternoon"],
        preferredLocation: "foster-auditorium",
        bio: "Yoga and flexibility enthusiast! I'm graduating soon and want to maintain my fitness routine. Looking for someone who enjoys yoga and general fitness.",
        matchPercentage: 82
    },
    {
        id: 4,
        name: "Emma Davis",
        email: "edavis@ua.edu",
        gender: "female",
        year: "freshman",
        goals: ["cardio", "general-fitness"],
        experienceLevel: "beginner",
        availableTimes: ["morning", "night"],
        preferredLocation: "outdoor-facilities",
        bio: "Freshman here! I love running and outdoor activities. Looking for a workout buddy to explore campus fitness options with me.",
        matchPercentage: 88
    },
    {
        id: 5,
        name: "David Wilson",
        email: "dwilson@ua.edu",
        gender: "male",
        year: "graduate",
        goals: ["strength", "sports-specific"],
        experienceLevel: "advanced",
        availableTimes: ["evening", "night"],
        preferredLocation: "coleman-coliseum",
        bio: "Graduate student and former athlete. Looking for someone serious about strength training and sports-specific workouts.",
        matchPercentage: 73
    },
    {
        id: 6,
        name: "Jordan Taylor",
        email: "jtaylor@ua.edu",
        gender: "female",
        year: "junior",
        goals: ["weight-loss", "cardio", "flexibility"],
        experienceLevel: "intermediate",
        availableTimes: ["morning", "afternoon", "evening"],
        preferredLocation: "student-recreation-center",
        bio: "Balanced approach to fitness! I enjoy mixing cardio, strength, and flexibility work. Very flexible with scheduling.",
        matchPercentage: 91
    }
];

// Global variables
let currentUser = null;
let searchResults = [];
let currentFilters = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadUserProfile();
    setupFormValidation();
}

// Event Listeners
function setupEventListeners() {
    // Search form submission
    const searchForm = document.getElementById('searchForm');
    if (searchForm) {
        searchForm.addEventListener('submit', handleSearch);
    }

    // Profile form submission
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileCreation);
    }

    // Real-time search as user types
    const searchInputs = document.querySelectorAll('#searchForm input, #searchForm select');
    searchInputs.forEach(input => {
        input.addEventListener('change', debounce(handleSearch, 500));
    });
}

// Search functionality
function handleSearch(event) {
    if (event) {
        event.preventDefault();
    }

    const formData = new FormData(document.getElementById('searchForm'));
    currentFilters = {
        genderPreference: formData.get('genderPreference'),
        workoutGoals: formData.get('workoutGoals'),
        experienceLevel: formData.get('experienceLevel'),
        availableTimes: formData.getAll('availableTimes'),
        preferredLocation: formData.get('preferredLocation')
    };

    // Filter workout buddies based on criteria
    searchResults = filterWorkoutBuddies(currentFilters);
    
    // Display results
    displaySearchResults(searchResults);
    
    // Show results section
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Filter workout buddies based on search criteria
function filterWorkoutBuddies(filters) {
    return workoutBuddies.filter(buddy => {
        // Gender preference filter
        if (filters.genderPreference && filters.genderPreference !== 'no-preference') {
            if (filters.genderPreference !== buddy.gender) {
                return false;
            }
        }

        // Workout goals filter
        if (filters.workoutGoals) {
            if (!buddy.goals.includes(filters.workoutGoals)) {
                return false;
            }
        }

        // Experience level filter
        if (filters.experienceLevel) {
            if (filters.experienceLevel !== buddy.experienceLevel) {
                return false;
            }
        }

        // Available times filter
        if (filters.availableTimes && filters.availableTimes.length > 0) {
            const hasMatchingTime = filters.availableTimes.some(time => 
                buddy.availableTimes.includes(time)
            );
            if (!hasMatchingTime) {
                return false;
            }
        }

        // Preferred location filter
        if (filters.preferredLocation) {
            if (filters.preferredLocation !== buddy.preferredLocation) {
                return false;
            }
        }

        return true;
    }).map(buddy => {
        // Calculate match percentage
        buddy.matchPercentage = calculateMatchPercentage(buddy, filters);
        return buddy;
    }).sort((a, b) => b.matchPercentage - a.matchPercentage); // Sort by match percentage
}

// Calculate match percentage based on criteria
function calculateMatchPercentage(buddy, filters) {
    let score = 0;
    let totalCriteria = 0;

    // Gender preference (20 points)
    totalCriteria += 20;
    if (!filters.genderPreference || filters.genderPreference === 'no-preference') {
        score += 20;
    } else if (filters.genderPreference === buddy.gender) {
        score += 20;
    }

    // Workout goals (30 points)
    totalCriteria += 30;
    if (!filters.workoutGoals) {
        score += 30;
    } else if (buddy.goals.includes(filters.workoutGoals)) {
        score += 30;
    }

    // Experience level (20 points)
    totalCriteria += 20;
    if (!filters.experienceLevel) {
        score += 20;
    } else if (filters.experienceLevel === buddy.experienceLevel) {
        score += 20;
    }

    // Available times (20 points)
    totalCriteria += 20;
    if (!filters.availableTimes || filters.availableTimes.length === 0) {
        score += 20;
    } else {
        const matchingTimes = filters.availableTimes.filter(time => 
            buddy.availableTimes.includes(time)
        ).length;
        score += (matchingTimes / filters.availableTimes.length) * 20;
    }

    // Preferred location (10 points)
    totalCriteria += 10;
    if (!filters.preferredLocation) {
        score += 10;
    } else if (filters.preferredLocation === buddy.preferredLocation) {
        score += 10;
    }

    return Math.round((score / totalCriteria) * 100);
}

// Display search results
function displaySearchResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    const resultsCount = document.getElementById('resultsCount');
    
    if (!resultsGrid || !resultsCount) return;

    // Update results count
    resultsCount.textContent = `${results.length} match${results.length !== 1 ? 'es' : ''} found`;
    resultsCount.className = `badge ${results.length > 0 ? 'bg-crimson' : 'bg-secondary'} fs-6`;

    // Clear previous results
    resultsGrid.innerHTML = '';

    if (results.length === 0) {
        resultsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-search display-1 text-muted mb-3"></i>
                <h3 class="text-muted">No matches found</h3>
                <p class="text-muted">Try adjusting your search criteria to find more workout buddies.</p>
                <button class="btn btn-crimson" onclick="clearFilters()">
                    <i class="bi bi-arrow-clockwise me-2"></i>Clear Filters
                </button>
            </div>
        `;
        return;
    }

    // Display results
    results.forEach((buddy, index) => {
        const buddyCard = createBuddyCard(buddy);
        buddyCard.style.animationDelay = `${index * 0.1}s`;
        resultsGrid.appendChild(buddyCard);
    });
}

// Create buddy card element
function createBuddyCard(buddy) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';
    
    const goalsText = buddy.goals.map(goal => 
        goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
    ).join(', ');

    const availabilityText = buddy.availableTimes.map(time => {
        const timeMap = {
            'morning': 'Morning (6-10 AM)',
            'afternoon': 'Afternoon (12-4 PM)',
            'evening': 'Evening (5-9 PM)',
            'night': 'Night (9-11 PM)'
        };
        return timeMap[time] || time;
    }).join(', ');

    const locationMap = {
        'student-recreation-center': 'Student Recreation Center',
        'foster-auditorium': 'Foster Auditorium',
        'coleman-coliseum': 'Coleman Coliseum',
        'outdoor-facilities': 'Outdoor Facilities',
        'off-campus-gyms': 'Off-Campus Gyms'
    };

    col.innerHTML = `
        <div class="buddy-card fade-in">
            <div class="buddy-card-header">
                <div class="match-percentage">${buddy.matchPercentage}% Match</div>
                <div class="buddy-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <div class="buddy-name">${buddy.name}</div>
                <div class="buddy-year">${buddy.year.charAt(0).toUpperCase() + buddy.year.slice(1)} • ${buddy.experienceLevel.charAt(0).toUpperCase() + buddy.experienceLevel.slice(1)}</div>
            </div>
            <div class="buddy-card-body">
                <div class="buddy-goals">
                    ${buddy.goals.map(goal => 
                        `<span class="goal-badge">${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`
                    ).join('')}
                </div>
                <div class="buddy-bio">${buddy.bio}</div>
                <div class="buddy-availability">
                    <div class="availability-title">
                        <i class="bi bi-clock me-1"></i>Available Times:
                    </div>
                    <div class="availability-slots">
                        ${buddy.availableTimes.map(time => {
                            const timeMap = {
                                'morning': 'Morning',
                                'afternoon': 'Afternoon',
                                'evening': 'Evening',
                                'night': 'Night'
                            };
                            return `<span class="availability-badge">${timeMap[time] || time}</span>`;
                        }).join('')}
                    </div>
                </div>
                <div class="buddy-location mb-3">
                    <small class="text-muted">
                        <i class="bi bi-geo-alt me-1"></i>Prefers: ${locationMap[buddy.preferredLocation] || buddy.preferredLocation}
                    </small>
                </div>
                <div class="buddy-actions">
                    <button class="btn btn-crimson btn-sm flex-fill" onclick="connectWithBuddy(${buddy.id})">
                        <i class="bi bi-heart me-1"></i>Connect
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewBuddyProfile(${buddy.id})">
                        <i class="bi bi-eye me-1"></i>View Profile
                    </button>
                </div>
            </div>
        </div>
    `;

    return col;
}

// Connect with a workout buddy
function connectWithBuddy(buddyId) {
    const buddy = workoutBuddies.find(b => b.id === buddyId);
    if (!buddy) return;

    // Show confirmation modal or notification
    showNotification(`Connection request sent to ${buddy.name}! They'll be notified via email.`, 'success');
    
    // In a real app, this would send a request to the backend
    console.log(`Connecting with ${buddy.name} (${buddy.email})`);
}

// View buddy profile
function viewBuddyProfile(buddyId) {
    const buddy = workoutBuddies.find(b => b.id === buddyId);
    if (!buddy) return;

    // Create and show profile modal
    const modalHtml = `
        <div class="modal fade" id="buddyProfileModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-crimson text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-person-circle me-2"></i>${buddy.name}'s Profile
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center">
                                <div class="buddy-avatar mb-3" style="width: 120px; height: 120px; margin: 0 auto;">
                                    <i class="bi bi-person-circle" style="font-size: 4rem;"></i>
                                </div>
                                <h5>${buddy.name}</h5>
                                <p class="text-muted">${buddy.year.charAt(0).toUpperCase() + buddy.year.slice(1)} • ${buddy.experienceLevel.charAt(0).toUpperCase() + buddy.experienceLevel.slice(1)}</p>
                            </div>
                            <div class="col-md-8">
                                <h6>Workout Goals:</h6>
                                <div class="buddy-goals mb-3">
                                    ${buddy.goals.map(goal => 
                                        `<span class="goal-badge">${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`
                                    ).join('')}
                                </div>
                                <h6>Available Times:</h6>
                                <p class="mb-3">${buddy.availableTimes.map(time => {
                                    const timeMap = {
                                        'morning': 'Morning (6-10 AM)',
                                        'afternoon': 'Afternoon (12-4 PM)',
                                        'evening': 'Evening (5-9 PM)',
                                        'night': 'Night (9-11 PM)'
                                    };
                                    return timeMap[time] || time;
                                }).join(', ')}</p>
                                <h6>Preferred Location:</h6>
                                <p class="mb-3">${locationMap[buddy.preferredLocation] || buddy.preferredLocation}</p>
                                <h6>Bio:</h6>
                                <p>${buddy.bio}</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-crimson" onclick="connectWithBuddy(${buddy.id}); bootstrap.Modal.getInstance(document.getElementById('buddyProfileModal')).hide();">
                            <i class="bi bi-heart me-2"></i>Connect
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Remove existing modal if any
    const existingModal = document.getElementById('buddyProfileModal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('buddyProfileModal'));
    modal.show();
}

// Profile creation
function showCreateProfile() {
    // Update modal title and button
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-person-plus me-2"></i>Create Your Workout Profile';
    document.querySelector('#createProfileModal .btn-crimson').innerHTML = '<i class="bi bi-check-circle me-2"></i>Create Profile';
    
    const modal = new bootstrap.Modal(document.getElementById('createProfileModal'));
    modal.show();
}

function createProfile() {
    const form = document.getElementById('profileForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!validateProfileForm()) {
        return;
    }

    // Check if this is an update or new profile
    const isUpdate = currentUser !== null;

    // Create user profile with all fields
    currentUser = {
        name: formData.get('profileName'),
        email: formData.get('profileEmail'),
        gender: formData.get('profileGender'),
        year: formData.get('profileYear'),
        age: formData.get('profileAge'),
        experience: formData.get('profileExperience'),
        preferredTime: formData.get('profilePreferredTime'),
        location: formData.get('profileLocation'),
        goals: [formData.get('profileGoals')],
        bio: formData.get('profileBio'),
        createdAt: isUpdate ? currentUser.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Save to localStorage (in a real app, this would go to a database)
    localStorage.setItem('currentUser', JSON.stringify(currentUser));

    // Show success message
    showNotification(isUpdate ? 'Profile updated successfully!' : 'Profile created successfully! You can now search for workout buddies.', 'success');

    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createProfileModal'));
    modal.hide();

    // Clear form
    form.reset();

    // Display the profile
    displayUserProfile();
}

function validateProfileForm() {
    const requiredFields = ['profileName', 'profileEmail', 'profileGender', 'profileYear', 'profileGoals'];
    let isValid = true;

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    // Email validation removed - all emails are considered valid

    return isValid;
}

// Load user profile from localStorage
function loadUserProfile() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        displayUserProfile();
    }
}

// Display user profile
function displayUserProfile() {
    if (!currentUser) return;

    const profileSection = document.getElementById('profileSection');
    const profileContent = document.getElementById('profileContent');
    
    if (!profileSection || !profileContent) return;

    // Show profile section
    profileSection.style.display = 'block';

    // Create profile content HTML
    const profileHtml = `
        <div class="profile-info-group">
            <h6><i class="bi bi-person"></i> Personal Information</h6>
            <p><strong>Name:</strong> ${currentUser.name}</p>
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Age:</strong> ${currentUser.age || 'Not specified'}</p>
            <p><strong>Gender:</strong> ${currentUser.gender ? currentUser.gender.charAt(0).toUpperCase() + currentUser.gender.slice(1) : 'Not specified'}</p>
        </div>
        
        <div class="profile-info-group">
            <h6><i class="bi bi-mortarboard"></i> Academic Information</h6>
            <p><strong>Academic Year:</strong> ${currentUser.year ? currentUser.year.charAt(0).toUpperCase() + currentUser.year.slice(1) : 'Not specified'}</p>
        </div>
        
        <div class="profile-info-group">
            <h6><i class="bi bi-heart-pulse"></i> Fitness Information</h6>
            <p><strong>Experience Level:</strong> ${currentUser.experience ? currentUser.experience.charAt(0).toUpperCase() + currentUser.experience.slice(1) : 'Not specified'}</p>
            <p><strong>Primary Goal:</strong> ${currentUser.goals && currentUser.goals[0] ? currentUser.goals[0].replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}</p>
        </div>
        
        <div class="profile-info-group">
            <h6><i class="bi bi-clock"></i> Preferences</h6>
            <p><strong>Preferred Time:</strong> ${currentUser.preferredTime ? currentUser.preferredTime.charAt(0).toUpperCase() + currentUser.preferredTime.slice(1) : 'Not specified'}</p>
            <p><strong>Preferred Location:</strong> ${currentUser.location ? currentUser.location.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Not specified'}</p>
        </div>
        
        <div class="profile-bio">
            <h6><i class="bi bi-chat-text"></i> Bio</h6>
            <p>${currentUser.bio || 'No bio provided yet.'}</p>
        </div>
    `;

    profileContent.innerHTML = profileHtml;

    // Scroll to profile section
    profileSection.scrollIntoView({ behavior: 'smooth' });
}

// Edit profile function
function editProfile() {
    if (!currentUser) {
        showCreateProfile();
        return;
    }

    // Update modal title and button for editing
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-pencil me-2"></i>Edit Your Workout Profile';
    document.querySelector('#createProfileModal .btn-crimson').innerHTML = '<i class="bi bi-check-circle me-2"></i>Update Profile';

    // Populate form with existing data
    document.getElementById('profileName').value = currentUser.name || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profileGender').value = currentUser.gender || '';
    document.getElementById('profileYear').value = currentUser.year || '';
    document.getElementById('profileAge').value = currentUser.age || '';
    document.getElementById('profileExperience').value = currentUser.experience || '';
    document.getElementById('profilePreferredTime').value = currentUser.preferredTime || '';
    document.getElementById('profileLocation').value = currentUser.location || '';
    document.getElementById('profileGoals').value = currentUser.goals && currentUser.goals[0] ? currentUser.goals[0] : '';
    document.getElementById('profileBio').value = currentUser.bio || '';

    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('createProfileModal'));
    modal.show();
}

// Utility functions
function scrollToSearch() {
    const searchSection = document.getElementById('searchSection');
    if (searchSection) {
        searchSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function clearFilters() {
    document.getElementById('searchForm').reset();
    currentFilters = {};
    searchResults = [];
    const resultsSection = document.getElementById('resultsSection');
    if (resultsSection) {
        resultsSection.style.display = 'none';
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1050;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    notification.innerHTML = `
        ${message}
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

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Form validation setup
function setupFormValidation() {
    const form = document.getElementById('profileForm');
    if (form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.classList.add('is-invalid');
                } else {
                    this.classList.remove('is-invalid');
                }
            });
        });
    }
}

// Export functions for global access
window.connectWithBuddy = connectWithBuddy;
window.viewBuddyProfile = viewBuddyProfile;
window.showCreateProfile = showCreateProfile;
window.createProfile = createProfile;
window.editProfile = editProfile;
window.scrollToSearch = scrollToSearch;
window.clearFilters = clearFilters;
