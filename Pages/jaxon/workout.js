// CrimsonCollab Workout Buddy Finder JavaScript

// Dark Mode Functionality
function toggleDarkMode() {
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        darkModeIcon.className = 'bi bi-sun-fill';
        darkModeText.textContent = 'Light Mode';
        localStorage.setItem('darkMode', 'enabled');
    } else {
        darkModeIcon.className = 'bi bi-moon-fill';
        darkModeText.textContent = 'Dark Mode';
        localStorage.setItem('darkMode', 'disabled');
    }
}

// Initialize dark mode on page load
document.addEventListener('DOMContentLoaded', function() {
    const darkMode = localStorage.getItem('darkMode');
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    if (darkMode === 'enabled') {
        body.classList.add('dark-mode');
        darkModeIcon.className = 'bi bi-sun-fill';
        darkModeText.textContent = 'Light Mode';
    }
});

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
let connections = []; // Track user connections
let connectionRequests = []; // Track pending connection requests

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    loadUserProfile();
    loadConnections();
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
                    ${getConnectionButton(buddy.id)}
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

    // Check if already connected or request pending
    const existingConnection = connections.find(c => c.buddyId === buddyId);
    const existingRequest = connectionRequests.find(r => r.buddyId === buddyId);
    
    if (existingConnection) {
        showNotification(`You're already connected with ${buddy.name}!`, 'info');
        return;
    }
    
    if (existingRequest) {
        showNotification(`Connection request already sent to ${buddy.name}!`, 'info');
        return;
    }

    // Add to connection requests
    const request = {
        id: Date.now(),
        buddyId: buddyId,
        buddyName: buddy.name,
        buddyEmail: buddy.email,
        status: 'pending',
        sentAt: new Date().toISOString()
    };
    
    connectionRequests.push(request);
    saveConnections();
    
    // Show success notification with more details
    showConnectionNotification(buddy.name, buddy.email);
    
    // Update the button state
    updateConnectionButton(buddyId, 'pending');
    
    console.log(`Connection request sent to ${buddy.name} (${buddy.email})`);
}

// View buddy profile
function viewBuddyProfile(buddyId) {
    const buddy = workoutBuddies.find(b => b.id === buddyId);
    if (!buddy) return;

    const connectionStatus = getConnectionStatus(buddyId);
    const locationMap = {
        'student-recreation-center': 'Student Recreation Center',
        'foster-auditorium': 'Foster Auditorium',
        'coleman-coliseum': 'Coleman Coliseum',
        'outdoor-facilities': 'Outdoor Facilities',
        'off-campus-gyms': 'Off-Campus Gyms'
    };

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
                                <div class="buddy-avatar mb-3" style="width: 120px; height: 120px; margin: 0 auto; background: var(--crimson-gradient); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                                    <i class="bi bi-person-circle" style="font-size: 4rem; color: white;"></i>
                                </div>
                                <h5>${buddy.name}</h5>
                                <p class="text-muted">${buddy.year.charAt(0).toUpperCase() + buddy.year.slice(1)} • ${buddy.experienceLevel.charAt(0).toUpperCase() + buddy.experienceLevel.slice(1)}</p>
                                <div class="connection-status-badge mb-3">
                                    ${getConnectionStatusBadge(connectionStatus)}
                                </div>
                            </div>
                            <div class="col-md-8">
                                <div class="profile-details">
                                    <div class="detail-section mb-3">
                                        <h6><i class="bi bi-bullseye me-2"></i>Workout Goals:</h6>
                                        <div class="buddy-goals">
                                            ${buddy.goals.map(goal => 
                                                `<span class="goal-badge">${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`
                                            ).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="detail-section mb-3">
                                        <h6><i class="bi bi-clock me-2"></i>Available Times:</h6>
                                        <div class="availability-display">
                                            ${buddy.availableTimes.map(time => {
                                                const timeMap = {
                                                    'morning': 'Morning (6-10 AM)',
                                                    'afternoon': 'Afternoon (12-4 PM)',
                                                    'evening': 'Evening (5-9 PM)',
                                                    'night': 'Night (9-11 PM)'
                                                };
                                                return `<span class="availability-badge">${timeMap[time] || time}</span>`;
                                            }).join('')}
                                        </div>
                                    </div>
                                    
                                    <div class="detail-section mb-3">
                                        <h6><i class="bi bi-geo-alt me-2"></i>Preferred Location:</h6>
                                        <p class="mb-0">${locationMap[buddy.preferredLocation] || buddy.preferredLocation}</p>
                                    </div>
                                    
                                    <div class="detail-section">
                                        <h6><i class="bi bi-chat-text me-2"></i>About ${buddy.name.split(' ')[0]}:</h6>
                                        <p class="bio-text">${buddy.bio}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        ${getConnectionButtonForModal(buddyId, connectionStatus)}
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

function getConnectionStatusBadge(status) {
    switch (status) {
        case 'connected':
            return '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Connected</span>';
        case 'pending':
            return '<span class="badge bg-warning"><i class="bi bi-clock me-1"></i>Request Sent</span>';
        default:
            return '<span class="badge bg-secondary"><i class="bi bi-person-plus me-1"></i>Not Connected</span>';
    }
}

function getConnectionButtonForModal(buddyId, status) {
    switch (status) {
        case 'connected':
            return `<button type="button" class="btn btn-success" disabled>
                        <i class="bi bi-check-circle me-2"></i>Already Connected
                    </button>`;
        case 'pending':
            return `<button type="button" class="btn btn-secondary" disabled>
                        <i class="bi bi-clock me-2"></i>Request Sent
                    </button>`;
        default:
            return `<button type="button" class="btn btn-crimson" onclick="connectWithBuddy(${buddyId}); bootstrap.Modal.getInstance(document.getElementById('buddyProfileModal')).hide();">
                        <i class="bi bi-heart me-2"></i>Connect
                    </button>`;
    }
}

// Profile creation
function showCreateProfile() {
    // Update modal title and button
    document.getElementById('modalTitle').innerHTML = '<i class="bi bi-person-plus me-2"></i>Create Your Workout Profile';
    document.querySelector('#createProfileModal .btn-crimson').innerHTML = '<i class="bi bi-check-circle me-2"></i>Create Profile';
    
    // Auto-generate email if user has an account
    const userEmail = getCurrentUserEmail();
    if (userEmail) {
        document.getElementById('profileEmail').value = userEmail;
        document.getElementById('profileEmail').readOnly = true;
        document.getElementById('profileEmail').classList.add('bg-light');
    } else {
        document.getElementById('profileEmail').readOnly = false;
        document.getElementById('profileEmail').classList.remove('bg-light');
    }
    
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
        id: isUpdate ? currentUser.id : Date.now(), // Generate unique ID for new profiles
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
    try {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Also save to a profiles list for potential future features
        const profiles = JSON.parse(localStorage.getItem('userProfiles') || '[]');
        const existingIndex = profiles.findIndex(p => p.id === currentUser.id);
        
        if (existingIndex >= 0) {
            profiles[existingIndex] = currentUser;
        } else {
            profiles.push(currentUser);
        }
        
        localStorage.setItem('userProfiles', JSON.stringify(profiles));
        
        // Show success message
        showNotification(isUpdate ? 'Profile updated successfully!' : 'Profile created successfully! You can now search for workout buddies.', 'success');

        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('createProfileModal'));
        modal.hide();

        // Clear form
        form.reset();

        // Display the profile
        displayUserProfile();
        
    } catch (error) {
        console.error('Error saving profile:', error);
        showNotification('Error saving profile. Please try again.', 'danger');
    }
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
    try {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            displayUserProfile();
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Clear corrupted data
        localStorage.removeItem('currentUser');
        showNotification('Profile data was corrupted and has been reset.', 'warning');
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

    // Make email field read-only when editing
    document.getElementById('profileEmail').readOnly = true;
    document.getElementById('profileEmail').classList.add('bg-light');

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

// Connection management functions
function loadConnections() {
    const savedConnections = localStorage.getItem('connections');
    const savedRequests = localStorage.getItem('connectionRequests');
    
    if (savedConnections) {
        connections = JSON.parse(savedConnections);
    }
    
    if (savedRequests) {
        connectionRequests = JSON.parse(savedRequests);
    }
}

function saveConnections() {
    localStorage.setItem('connections', JSON.stringify(connections));
    localStorage.setItem('connectionRequests', JSON.stringify(connectionRequests));
}

function showConnectionNotification(buddyName, buddyEmail) {
    const notification = document.createElement('div');
    notification.className = 'connection-notification alert alert-success alert-dismissible fade show';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        z-index: 1050;
        min-width: 350px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        border-left: 4px solid var(--warning);
    `;

    notification.innerHTML = `
        <div class="d-flex align-items-start">
            <i class="bi bi-check-circle-fill text-success me-2" style="font-size: 1.2rem;"></i>
            <div>
                <h6 class="mb-1">Connection Request Sent!</h6>
                <p class="mb-1">Your request has been sent to <strong>${buddyName}</strong></p>
                <small class="text-muted">They'll be notified at ${buddyEmail}</small>
            </div>
        </div>
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    // Auto remove after 7 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 7000);
}

function updateConnectionButton(buddyId, status) {
    const buttons = document.querySelectorAll(`[onclick*="connectWithBuddy(${buddyId})"]`);
    buttons.forEach(button => {
        if (status === 'pending') {
            button.innerHTML = '<i class="bi bi-clock me-1"></i>Request Sent';
            button.classList.remove('btn-crimson');
            button.classList.add('btn-secondary');
            button.disabled = true;
        } else if (status === 'connected') {
            button.innerHTML = '<i class="bi bi-check-circle me-1"></i>Connected';
            button.classList.remove('btn-crimson');
            button.classList.add('btn-success');
            button.disabled = true;
        }
    });
}

function getConnectionStatus(buddyId) {
    const connection = connections.find(c => c.buddyId === buddyId);
    const request = connectionRequests.find(r => r.buddyId === buddyId);
    
    if (connection) return 'connected';
    if (request) return 'pending';
    return 'none';
}

function getConnectionButton(buddyId) {
    const status = getConnectionStatus(buddyId);
    
    switch (status) {
        case 'connected':
            return `<button class="btn btn-success btn-sm flex-fill" disabled>
                        <i class="bi bi-check-circle me-1"></i>Connected
                    </button>`;
        case 'pending':
            return `<button class="btn btn-secondary btn-sm flex-fill" disabled>
                        <i class="bi bi-clock me-1"></i>Request Sent
                    </button>`;
        default:
            return `<button class="btn btn-crimson btn-sm flex-fill" onclick="connectWithBuddy(${buddyId})">
                        <i class="bi bi-heart me-1"></i>Connect
                    </button>`;
    }
}

function getCurrentUserEmail() {
    // Try to get email from localStorage (simulating logged-in user)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        const user = JSON.parse(savedUser);
        return user.email;
    }
    
    // In a real app, this would come from authentication system
    // For demo purposes, we'll simulate a logged-in user
    const demoEmail = 'student@ua.edu';
    return demoEmail;
}

// Matches functionality
function showMatches() {
    // Hide other sections
    document.getElementById('profileSection').style.display = 'none';
    document.getElementById('searchSection').style.display = 'none';
    document.getElementById('resultsSection').style.display = 'none';
    
    // Show matches section
    const matchesSection = document.getElementById('matchesSection');
    matchesSection.style.display = 'block';
    matchesSection.scrollIntoView({ behavior: 'smooth' });
    
    // Load and display matches
    loadMatches();
}

function loadMatches() {
    // Update counts
    document.getElementById('connectionsCount').textContent = connections.length;
    document.getElementById('requestsCount').textContent = connectionRequests.length;
    
    // Display connections
    displayConnections();
    
    // Display pending requests
    displayPendingRequests();
}

function displayConnections() {
    const connectionsGrid = document.getElementById('connectionsGrid');
    connectionsGrid.innerHTML = '';
    
    if (connections.length === 0) {
        connectionsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-heart display-1 text-muted mb-3"></i>
                <h3 class="text-muted">No connections yet</h3>
                <p class="text-muted">Start connecting with workout buddies to see them here!</p>
                <button class="btn btn-crimson" onclick="scrollToSearch()">
                    <i class="bi bi-search me-2"></i>Find Buddies
                </button>
            </div>
        `;
        return;
    }
    
    connections.forEach(connection => {
        const buddy = workoutBuddies.find(b => b.id === connection.buddyId);
        if (buddy) {
            const connectionCard = createConnectionCard(buddy, connection);
            connectionsGrid.appendChild(connectionCard);
        }
    });
}

function displayPendingRequests() {
    const requestsGrid = document.getElementById('requestsGrid');
    requestsGrid.innerHTML = '';
    
    if (connectionRequests.length === 0) {
        requestsGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="bi bi-clock display-1 text-muted mb-3"></i>
                <h3 class="text-muted">No pending requests</h3>
                <p class="text-muted">Your connection requests will appear here.</p>
            </div>
        `;
        return;
    }
    
    connectionRequests.forEach(request => {
        const buddy = workoutBuddies.find(b => b.id === request.buddyId);
        if (buddy) {
            const requestCard = createRequestCard(buddy, request);
            requestsGrid.appendChild(requestCard);
        }
    });
}

function createConnectionCard(buddy, connection) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';
    
    col.innerHTML = `
        <div class="connection-card">
            <div class="connection-header">
                <div class="connection-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <div class="connection-info">
                    <h5>${buddy.name}</h5>
                    <p class="text-muted">Connected since ${new Date(connection.connectedAt).toLocaleDateString()}</p>
                </div>
                <div class="connection-status">
                    <span class="badge bg-success">Connected</span>
                </div>
            </div>
            <div class="connection-body">
                <div class="connection-goals">
                    ${buddy.goals.map(goal => 
                        `<span class="goal-badge">${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`
                    ).join('')}
                </div>
                <p class="connection-bio">${buddy.bio}</p>
                <div class="connection-actions">
                    <button class="btn btn-outline-crimson btn-sm" onclick="viewBuddyProfile(${buddy.id})">
                        <i class="bi bi-eye me-1"></i>View Profile
                    </button>
                    <button class="btn btn-crimson btn-sm" onclick="messageBuddy(${buddy.id})">
                        <i class="bi bi-chat me-1"></i>Message
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function createRequestCard(buddy, request) {
    const col = document.createElement('div');
    col.className = 'col-lg-4 col-md-6';
    
    col.innerHTML = `
        <div class="request-card">
            <div class="request-header">
                <div class="request-avatar">
                    <i class="bi bi-person-circle"></i>
                </div>
                <div class="request-info">
                    <h5>${buddy.name}</h5>
                    <p class="text-muted">Request sent ${new Date(request.sentAt).toLocaleDateString()}</p>
                </div>
                <div class="request-status">
                    <span class="badge bg-warning">Pending</span>
                </div>
            </div>
            <div class="request-body">
                <div class="request-goals">
                    ${buddy.goals.map(goal => 
                        `<span class="goal-badge">${goal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>`
                    ).join('')}
                </div>
                <p class="request-bio">${buddy.bio}</p>
                <div class="request-actions">
                    <button class="btn btn-outline-secondary btn-sm" onclick="viewBuddyProfile(${buddy.id})">
                        <i class="bi bi-eye me-1"></i>View Profile
                    </button>
                    <button class="btn btn-outline-danger btn-sm" onclick="cancelRequest(${request.id})">
                        <i class="bi bi-x-circle me-1"></i>Cancel
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

function messageBuddy(buddyId) {
    const buddy = workoutBuddies.find(b => b.id === buddyId);
    if (!buddy) return;
    
    showNotification(`Messaging feature coming soon! You can contact ${buddy.name} at ${buddy.email}`, 'info');
}

function cancelRequest(requestId) {
    const requestIndex = connectionRequests.findIndex(r => r.id === requestId);
    if (requestIndex === -1) return;
    
    const request = connectionRequests[requestIndex];
    connectionRequests.splice(requestIndex, 1);
    saveConnections();
    
    showNotification(`Connection request to ${request.buddyName} cancelled`, 'info');
    loadMatches();
}

// Export functions for global access
window.connectWithBuddy = connectWithBuddy;
window.viewBuddyProfile = viewBuddyProfile;
window.showCreateProfile = showCreateProfile;
window.createProfile = createProfile;
window.editProfile = editProfile;
window.scrollToSearch = scrollToSearch;
window.clearFilters = clearFilters;
window.showMatches = showMatches;
window.messageBuddy = messageBuddy;
window.cancelRequest = cancelRequest;
