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
        // Check if this is a new profile (just created)
        const profileData = JSON.parse(localStorage.getItem('uaFriendMatch_profileData') || '{}');
        const isNewProfile = profileData.isNewProfile === true;
        
        if (isNewProfile) {
            // Mark profile as no longer new
            profileData.isNewProfile = false;
            localStorage.setItem('uaFriendMatch_profileData', JSON.stringify(profileData));
        }
        
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
    
    // Initialize messages display if showing messages section
    if (sectionId === 'messages') {
        initializeMessagesDisplay();
    }
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
        lookingFor,
        isNewProfile: true  // Mark as new profile
    };
    
    console.log('Profile created for new user');
    
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
        generatePotentialMatches();
        showNotification('Found potential matches! Check them out below.', 'success');
    }, 2000);
}

// Generate potential matches in the Potential Matches section
function generatePotentialMatches() {
    const container = document.getElementById('potentialMatchesContainer');
    if (!container) return;
    
    // Clear existing content
    container.innerHTML = '';
    
    // Generate 3-5 random potential matches
    const numMatches = Math.floor(Math.random() * 3) + 3; // 3-5 matches
    const matches = [];
    
    for (let i = 0; i < numMatches; i++) {
        matches.push(getRandomMatch());
    }
    
    // Create matches grid
    const matchesGrid = document.createElement('div');
    matchesGrid.className = 'potential-matches-grid';
    matchesGrid.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        margin-top: 2rem;
    `;
    
    matches.forEach(match => {
        const matchCard = createPotentialMatchCard(match);
        matchesGrid.appendChild(matchCard);
    });
    
    container.appendChild(matchesGrid);
}

// Create a potential match card
function createPotentialMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'potential-match-card';
    card.style.cssText = `
        background: white;
        border-radius: 15px;
        padding: 1.5rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        text-align: center;
        transition: all 0.3s ease;
    `;
    
    card.innerHTML = `
        <div class="match-avatar" style="
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #dc143c 0%, #b0112e 100%);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1rem;
            color: white;
            font-size: 2rem;
        ">
            <i class="bi bi-person-circle"></i>
        </div>
        <div class="match-info">
            <h4 style="color: #343a40; font-weight: 600; margin-bottom: 0.5rem;">${match.name}</h4>
            <p class="text-muted" style="margin-bottom: 1rem;">${match.major} • ${match.year}</p>
            <div class="interests" style="
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                justify-content: center;
                margin-bottom: 1.5rem;
            ">
                ${match.interests.map(interest => `<span class="badge bg-primary">${interest}</span>`).join('')}
            </div>
        </div>
        <div class="match-actions" style="display: flex; gap: 1rem; justify-content: center;">
            <button class="btn btn-success" onclick="likePotentialMatch('${match.id}')" style="
                min-width: 100px;
                padding: 0.5rem 1rem;
                font-weight: 600;
                border-radius: 25px;
            ">
                <i class="bi bi-heart-fill"></i> Like
            </button>
            <button class="btn btn-outline-secondary" onclick="passPotentialMatch('${match.id}')" style="
                min-width: 100px;
                padding: 0.5rem 1rem;
                font-weight: 600;
                border-radius: 25px;
            ">
                <i class="bi bi-x"></i> Pass
            </button>
        </div>
    `;
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-5px)';
        card.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.15)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
        card.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.1)';
    });
    
    return card;
}

// Handle liking a potential match
function likePotentialMatch(matchId) {
    console.log('User liked potential match:', matchId);
    
    // Find the match card that was liked
    const matchCards = document.querySelectorAll('.potential-match-card');
    let matchData = null;
    
    matchCards.forEach(card => {
        const likeButton = card.querySelector(`button[onclick*="${matchId}"]`);
        if (likeButton) {
            const nameElement = card.querySelector('h4');
            const detailsElement = card.querySelector('.text-muted');
            const interestsElements = card.querySelectorAll('.badge');
            
            if (nameElement && detailsElement) {
                const name = nameElement.textContent;
                const details = detailsElement.textContent;
                const [major, year] = details.split(' • ');
                const interests = Array.from(interestsElements).map(el => el.textContent.trim());
                
                matchData = {
                    id: matchId,
                    name: name,
                    major: major,
                    year: year,
                    interests: interests,
                    likedAt: new Date().toISOString() // Add timestamp for verification
                };
            }
        }
    });
    
    if (matchData) {
        showNotification(`You liked ${matchData.name}!`, 'success');
        
        setTimeout(() => {
            showNotification('It\'s a match! You can now message each other.', 'success');
            addMatchedUser(matchData);
            removePotentialMatchCard(matchId);
        }, 1000);
    } else {
        console.error('Could not find match data for ID:', matchId);
        showNotification('Error: Could not process your like. Please try again.', 'danger');
    }
}

// Handle passing on a potential match
function passPotentialMatch(matchId) {
    showNotification(`You passed on this match.`, 'info');
    removePotentialMatchCard(matchId);
}

// Remove a potential match card from the display
function removePotentialMatchCard(matchId) {
    const matchCards = document.querySelectorAll('.potential-match-card');
    matchCards.forEach(card => {
        const likeButton = card.querySelector(`button[onclick*="${matchId}"]`);
        if (likeButton) {
            // Add fade out animation
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '0';
            card.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                card.remove();
                checkIfNoMoreMatches();
            }, 500);
        }
    });
}

// Check if there are no more potential matches and show empty state
function checkIfNoMoreMatches() {
    const container = document.getElementById('potentialMatchesContainer');
    const remainingCards = container.querySelectorAll('.potential-match-card');
    
    if (remainingCards.length === 0) {
        container.innerHTML = `
            <div class="text-center">
                <div class="empty-potential-matches">
                    <div class="empty-icon mb-3">
                        <i class="bi bi-people" style="font-size: 4rem; color: #dc143c; opacity: 0.3;"></i>
                    </div>
                    <h4 class="text-muted">No more potential matches</h4>
                    <p class="text-muted">Click "Find Matches" again to discover more people!</p>
                </div>
            </div>
        `;
    }
}

function viewConnections() {
    showNotification('Loading your messages...', 'info');
    
    setTimeout(() => {
        showSection('messages');
        initializeMessagesDisplay();
        showNotification('Showing your messages.', 'success');
    }, 1000);
}

// Add a matched user to the list
function addMatchedUser(matchData) {
    const matchedUsers = JSON.parse(localStorage.getItem('uaFriendMatch_matchedUsers') || '[]');
    
    // Check if user already exists
    const existingUser = matchedUsers.find(user => user.id === matchData.id);
    if (!existingUser) {
        matchedUsers.push({
            ...matchData,
            matchedAt: new Date().toISOString(),
            messages: []
        });
        localStorage.setItem('uaFriendMatch_matchedUsers', JSON.stringify(matchedUsers));
        console.log('Added matched user:', matchData.name);
    }
}

// Initialize messages display
function initializeMessagesDisplay() {
    const matchedUsersList = document.getElementById('matchedUsersList');
    if (!matchedUsersList) return;
    
    const matchedUsers = JSON.parse(localStorage.getItem('uaFriendMatch_matchedUsers') || '[]');
    
    if (matchedUsers.length === 0) {
        matchedUsersList.innerHTML = `
            <div class="text-center text-muted">
                <i class="bi bi-heart" style="font-size: 2rem; opacity: 0.3;"></i>
                <p class="mt-2">No matches yet</p>
                <small>Like someone to start messaging!</small>
            </div>
        `;
    } else {
        matchedUsersList.innerHTML = '';
        matchedUsers.forEach(user => {
            const userItem = createMatchedUserItem(user);
            matchedUsersList.appendChild(userItem);
        });
    }
}

// Create a matched user item
function createMatchedUserItem(user) {
    const item = document.createElement('div');
    item.className = 'matched-user-item';
    item.onclick = () => selectUserToMessage(user);
    
    item.innerHTML = `
        <div class="matched-user-avatar">
            <i class="bi bi-person-circle"></i>
        </div>
        <div class="matched-user-info">
            <h6>${user.name}</h6>
            <p>${user.major} • ${user.year}</p>
        </div>
    `;
    
    return item;
}

// Select a user to message
function selectUserToMessage(user) {
    // Remove active class from all items
    document.querySelectorAll('.matched-user-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to selected item
    event.currentTarget.classList.add('active');
    
    // Show chat interface
    showChatInterface(user);
}

// Show chat interface for selected user
function showChatInterface(user) {
    const chatArea = document.getElementById('chatArea');
    if (!chatArea) return;
    
    chatArea.innerHTML = `
        <div class="chat-header">
            <div class="chat-header-avatar">
                <i class="bi bi-person-circle"></i>
            </div>
            <div class="chat-header-info">
                <h5>${user.name}</h5>
                <p>${user.major} • ${user.year}</p>
            </div>
        </div>
        <div class="chat-messages" id="chatMessages">
            ${renderMessages(user.messages || [])}
        </div>
        <div class="chat-input-area">
            <input type="text" class="chat-input" id="messageInput" placeholder="Type a message..." onkeypress="handleMessageKeyPress(event, '${user.id}')">
            <button class="send-button" onclick="sendMessage('${user.id}')">
                <i class="bi bi-send"></i>
            </button>
        </div>
    `;
    
    // Scroll to bottom of messages
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// Render messages
function renderMessages(messages) {
    if (messages.length === 0) {
        return `
            <div class="text-center text-muted">
                <p>No messages yet. Start the conversation!</p>
            </div>
        `;
    }
    
    return messages.map(message => `
        <div class="message ${message.sender === 'user' ? 'message-sent' : 'message-received'}">
            <div class="message-content">
                <p>${message.text}</p>
                <small class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</small>
            </div>
        </div>
    `).join('');
}

// Handle message input key press
function handleMessageKeyPress(event, userId) {
    if (event.key === 'Enter') {
        sendMessage(userId);
    }
}

// Send a message
function sendMessage(userId) {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText) return;
    
    // Get matched users
    const matchedUsers = JSON.parse(localStorage.getItem('uaFriendMatch_matchedUsers') || '[]');
    const user = matchedUsers.find(u => u.id === userId);
    
    if (user) {
        // Add message to user's messages
        if (!user.messages) user.messages = [];
        user.messages.push({
            text: messageText,
            sender: 'user',
            timestamp: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('uaFriendMatch_matchedUsers', JSON.stringify(matchedUsers));
        
        // Clear input
        messageInput.value = '';
        
        // Re-render messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = renderMessages(user.messages);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        // Simulate response after a delay
        setTimeout(() => {
            simulateResponse(userId);
        }, 1000 + Math.random() * 2000);
    }
}

// Simulate a response from the matched user
function simulateResponse(userId) {
    const responses = [
        "Hey! How are you doing?",
        "That sounds great!",
        "I'd love to hang out sometime!",
        "What are you up to this weekend?",
        "That's so cool!",
        "I'm doing well, thanks for asking!",
        "Want to grab coffee sometime?",
        "I'm free this afternoon if you want to meet up!",
        "That's awesome!",
        "I'm really excited to get to know you better!"
    ];
    
    const matchedUsers = JSON.parse(localStorage.getItem('uaFriendMatch_matchedUsers') || '[]');
    const user = matchedUsers.find(u => u.id === userId);
    
    if (user) {
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        if (!user.messages) user.messages = [];
        user.messages.push({
            text: randomResponse,
            sender: 'match',
            timestamp: new Date().toISOString()
        });
        
        // Save back to localStorage
        localStorage.setItem('uaFriendMatch_matchedUsers', JSON.stringify(matchedUsers));
        
        // Re-render messages
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.innerHTML = renderMessages(user.messages);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
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