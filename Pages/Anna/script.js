// UA Friend Match - Simplified JavaScript

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('UA Friend Match initialized');
    checkProfileStatus();
});

// Check if user has a profile
function checkProfileStatus() {
    const hasProfile = localStorage.getItem('uaFriendMatch_profileCreated') === 'true';
    console.log('Profile exists:', hasProfile);
    
    if (hasProfile) {
        showMainApp();
    } else {
        showProfileCreation();
    }
}

// Show profile creation section
function showProfileCreation() {
    console.log('Showing profile creation');
    document.getElementById('profileCreation').style.display = 'block';
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('mainAppContent').style.display = 'none';
    document.getElementById('mainNavLinks').style.display = 'none';
}

// Show profile form
function showProfileForm() {
    console.log('Showing profile form');
    document.getElementById('profileCreation').style.display = 'none';
    document.getElementById('profileForm').style.display = 'block';
    document.getElementById('mainAppContent').style.display = 'none';
}

// Go back to profile creation prompt
function goBackToPrompt() {
    showProfileCreation();
}

// Show main app
function showMainApp() {
    console.log('Showing main app');
    document.getElementById('profileCreation').style.display = 'none';
    document.getElementById('profileForm').style.display = 'none';
    document.getElementById('mainAppContent').style.display = 'block';
    document.getElementById('mainNavLinks').style.display = 'flex';
    
    // Show home section by default
    showSection('home');
}

// Show specific section
function showSection(sectionId) {
    console.log('Showing section:', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.style.display = 'block';
    }
    
    // Update active nav link
    updateActiveNavLink(sectionId);
}

// Update active navigation link
function updateActiveNavLink(sectionId) {
    const navLinks = document.querySelectorAll('#mainNavLinks .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate the correct nav link
    const targetLink = document.querySelector(`#mainNavLinks .nav-link[onclick*="${sectionId}"]`);
    if (targetLink) {
        targetLink.classList.add('active');
    }
}

// Add interest
function addInterest() {
    const interestSelect = document.getElementById('interestSelect');
    const selectedInterest = interestSelect.value;
    
    if (selectedInterest) {
        const selectedInterests = document.getElementById('selectedInterests');
        const badge = document.createElement('span');
        badge.className = 'badge bg-primary me-2 mb-2';
        badge.innerHTML = `${selectedInterest} <i class="bi bi-x" onclick="removeInterest('${selectedInterest}')"></i>`;
        selectedInterests.appendChild(badge);
        
        interestSelect.value = '';
        showNotification(`Added ${selectedInterest} to your interests!`, 'success');
    }
}

// Remove interest
function removeInterest(interestName) {
    const badges = document.querySelectorAll('.selected-interests .badge');
    badges.forEach(badge => {
        if (badge.textContent.includes(interestName)) {
            badge.remove();
            showNotification(`Removed ${interestName} from your interests.`, 'info');
        }
    });
}

// Add looking for item
function addLookingFor() {
    const lookingForItems = document.getElementById('lookingForItems');
    const newItem = document.createElement('div');
    newItem.className = 'looking-for-item';
    newItem.innerHTML = `
        <input type="text" class="form-control" placeholder="What are you looking for?">
        <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeLookingFor(this)">
            <i class="bi bi-x"></i>
        </button>
    `;
    lookingForItems.appendChild(newItem);
}

// Remove looking for item
function removeLookingFor(button) {
    button.closest('.looking-for-item').remove();
}

// Save profile
function saveProfile() {
    console.log('Saving profile...');
    
    // Get form data
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const major = document.getElementById('major').value.trim();
    const year = document.getElementById('year').value;
    const bio = document.getElementById('bio').value.trim();
    
    // Validate required fields
    if (!firstName || !lastName || !major || !year) {
        showNotification('Please fill in all required fields.', 'danger');
        return;
    }
    
    // Get interests
    const interestBadges = document.querySelectorAll('.selected-interests .badge');
    const interests = Array.from(interestBadges).map(badge => 
        badge.textContent.replace(' ×', '').trim()
    );
    
    // Get looking for items
    const lookingForInputs = document.querySelectorAll('#lookingForItems .form-control');
    const lookingFor = Array.from(lookingForInputs)
        .map(input => input.value.trim())
        .filter(value => value);
    
    // Create profile data
    const profileData = {
        firstName,
        lastName,
        major,
        year,
        bio,
        interests,
        lookingFor
    };
    
    // Save to localStorage
    localStorage.setItem('uaFriendMatch_profileCreated', 'true');
    localStorage.setItem('uaFriendMatch_profileData', JSON.stringify(profileData));
    
    console.log('Profile saved:', profileData);
    
    // Show success message
    showNotification('Profile created successfully!', 'success');
    
    // Update profile display
    updateProfileDisplay(profileData);
    
    // Show main app
    setTimeout(() => {
        showMainApp();
    }, 1500);
}

// Update profile display
function updateProfileDisplay(profileData) {
    // Update profile header
    document.getElementById('profileName').textContent = `${profileData.firstName} ${profileData.lastName}`;
    document.getElementById('profileDetails').textContent = `${profileData.major} • ${profileData.year.charAt(0).toUpperCase() + profileData.year.slice(1)}`;
    
    // Update bio
    if (profileData.bio) {
        document.getElementById('profileBio').textContent = profileData.bio;
    }
    
    // Update interests
    const interestsContainer = document.getElementById('profileInterests');
    if (profileData.interests.length > 0) {
        interestsContainer.innerHTML = profileData.interests
            .map(interest => `<span class="badge bg-primary">${interest}</span>`)
            .join('');
    }
    
    // Update looking for
    const lookingForList = document.getElementById('profileLookingFor');
    if (profileData.lookingFor.length > 0) {
        lookingForList.innerHTML = profileData.lookingFor
            .map(item => `<li>${item}</li>`)
            .join('');
    }
}

// Friend Match Functions
function findMatches() {
    showNotification('Finding potential matches...', 'info');
    
    setTimeout(() => {
        showNotification('Found 5 potential matches! Check out the Quick Match section.', 'success');
    }, 2000);
}

function viewConnections() {
    showNotification('Loading your connections...', 'info');
    
    setTimeout(() => {
        showSection('matches');
        showNotification('Showing your current connections.', 'success');
    }, 1000);
}

function likeMatch(matchId) {
    showNotification(`You liked ${matchId}!`, 'success');
    
    setTimeout(() => {
        showNotification('It\'s a match! You can now message each other.', 'success');
        moveToMatches(matchId);
        hideQuickMatch();
    }, 1000);
}

function passMatch(matchId) {
    showNotification(`You passed on ${matchId}.`, 'info');
    hideQuickMatch();
    
    setTimeout(() => {
        showNotification('Loading next potential match...', 'info');
        loadNextQuickMatch();
    }, 1000);
}

function hideQuickMatch() {
    const quickMatchCard = document.querySelector('.quick-match-card');
    if (quickMatchCard) {
        quickMatchCard.style.opacity = '0';
        quickMatchCard.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            quickMatchCard.style.display = 'none';
        }, 300);
    }
}

function loadNextQuickMatch() {
    const quickMatchCard = document.querySelector('.quick-match-card');
    if (quickMatchCard) {
        // Show loading state
        quickMatchCard.innerHTML = `
            <div class="text-center">
                <div class="spinner-border text-primary mb-3" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p>Finding your next match...</p>
            </div>
        `;
        quickMatchCard.style.display = 'block';
        quickMatchCard.style.opacity = '1';
        quickMatchCard.style.transform = 'translateY(0)';
        
        // Simulate loading new match
        setTimeout(() => {
            const newMatch = getRandomMatch();
            quickMatchCard.innerHTML = `
                <div class="match-profile">
                    <div class="profile-avatar">
                        <i class="bi bi-person-circle"></i>
                    </div>
                    <div class="profile-info">
                        <h4>${newMatch.name}</h4>
                        <p class="text-muted">${newMatch.major} • ${newMatch.year}</p>
                        <div class="interests">
                            ${newMatch.interests.map(interest => `<span class="badge bg-primary">${interest}</span>`).join('')}
                        </div>
                    </div>
                </div>
                <div class="match-actions">
                    <button class="btn btn-success btn-lg" onclick="likeMatch('${newMatch.id}')">
                        <i class="bi bi-heart-fill"></i> Like
                    </button>
                    <button class="btn btn-outline-secondary btn-lg" onclick="passMatch('${newMatch.id}')">
                        <i class="bi bi-x"></i> Pass
                    </button>
                </div>
            `;
        }, 2000);
    }
}

function getRandomMatch() {
    const matches = [
        {
            id: 'mike',
            name: 'Mike Rodriguez',
            major: 'Engineering',
            year: 'Senior',
            interests: ['Sports', 'Music', 'Gaming']
        },
        {
            id: 'emma',
            name: 'Emma Wilson',
            major: 'Business',
            year: 'Junior',
            interests: ['Art', 'Reading', 'Coffee']
        },
        {
            id: 'david',
            name: 'David Kim',
            major: 'Computer Science',
            year: 'Sophomore',
            interests: ['Programming', 'Gaming', 'Fitness']
        },
        {
            id: 'sophia',
            name: 'Sophia Martinez',
            major: 'Psychology',
            year: 'Senior',
            interests: ['Photography', 'Travel', 'Music']
        }
    ];
    
    return matches[Math.floor(Math.random() * matches.length)];
}

function moveToMatches(matchId) {
    const matchesGrid = document.querySelector('.matches-grid');
    if (matchesGrid) {
        const matchData = getRandomMatch();
        const newMatchCard = document.createElement('div');
        newMatchCard.className = 'match-card';
        newMatchCard.innerHTML = `
            <div class="match-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="match-info">
                <h4>${matchData.name}</h4>
                <p class="text-muted">${matchData.major} • ${matchData.year}</p>
                <div class="interests">
                    ${matchData.interests.map(interest => `<span class="badge bg-primary">${interest}</span>`).join('')}
                </div>
            </div>
            <div class="match-actions">
                <button class="btn btn-primary" onclick="messageMatch('${matchData.id}')">
                    <i class="bi bi-chat"></i> Message
                </button>
            </div>
        `;
        
        matchesGrid.appendChild(newMatchCard);
        
        // Add animation
        newMatchCard.style.opacity = '0';
        newMatchCard.style.transform = 'translateY(20px)';
        setTimeout(() => {
            newMatchCard.style.transition = 'all 0.5s ease';
            newMatchCard.style.opacity = '1';
            newMatchCard.style.transform = 'translateY(0)';
        }, 100);
    }
}

function messageMatch(matchId) {
    showNotification(`Opening conversation with ${matchId}...`, 'info');
    
    setTimeout(() => {
        showSection('messages');
        showNotification('Conversation opened!', 'success');
    }, 1000);
}

function openConversation(conversationId) {
    showNotification(`Opening conversation with ${conversationId}...`, 'info');
    
    setTimeout(() => {
        showNotification('Chat interface would open here!', 'success');
    }, 1000);
}

function editProfile() {
    showNotification('Edit profile feature coming soon!', 'info');
}

// Notification System
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
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle-fill',
        danger: 'exclamation-triangle-fill',
        warning: 'exclamation-triangle-fill',
        info: 'info-circle-fill'
    };
    return icons[type] || 'info-circle-fill';
}

// Debug functions
window.clearProfileData = function() {
    localStorage.removeItem('uaFriendMatch_profileCreated');
    localStorage.removeItem('uaFriendMatch_profileData');
    console.log('Profile data cleared - refresh page to test');
    location.reload();
};

window.checkProfileStatus = checkProfileStatus;