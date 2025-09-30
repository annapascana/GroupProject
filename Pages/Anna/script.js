// UA Friend Match - Simplified JavaScript

// Get current user ID for user-specific data
function getCurrentUserId() {
    // Try shared data service first - get user data and create ID from email
    if (window.sharedDataService) {
        const userData = window.sharedDataService.getUserData();
        if (userData && userData.email) {
            // Create a consistent user ID from email
            const userId = 'user_' + userData.email.replace(/[^a-zA-Z0-9]/g, '_');
            return userId;
        }
    }
    
    // Try UA Innovate user ID
    let fallbackUserId = localStorage.getItem('uaInnovateUserId');
    if (fallbackUserId) return fallbackUserId;
    
    // Try travel user ID
    fallbackUserId = localStorage.getItem('travelUserId');
    if (fallbackUserId) return fallbackUserId;
    
    // Try workout user ID
    fallbackUserId = localStorage.getItem('workoutUserId');
    if (fallbackUserId) return fallbackUserId;
    
    // Generate a new user ID if none exists
    fallbackUserId = 'friend_match_user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('friendMatchUserId', fallbackUserId);
    return fallbackUserId;
}

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
function initializeDarkMode() {
    const darkMode = localStorage.getItem('darkMode');
    const body = document.body;
    const darkModeIcon = document.getElementById('darkModeIcon');
    const darkModeText = document.getElementById('darkModeText');
    
    if (darkMode === 'enabled') {
        body.classList.add('dark-mode');
        darkModeIcon.className = 'bi bi-sun-fill';
        darkModeText.textContent = 'Light Mode';
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('UA Friend Match initialized');
    initializeDarkMode();
    checkProfileStatus();
});

// Check if user has a profile
function checkProfileStatus() {
    const userId = getCurrentUserId();
    let hasProfile = localStorage.getItem(`uaFriendMatch_profileCreated_${userId}`) === 'true';
    let profileData = JSON.parse(localStorage.getItem(`uaFriendMatch_profileData_${userId}`) || '{}');
    
    // Check shared data service for profile
    if (window.sharedDataService && !hasProfile) {
        const sharedProfile = window.sharedDataService.getField('friendMatchProfile');
        if (sharedProfile && sharedProfile.userId === userId) {
            // Load profile from shared data service
            profileData = sharedProfile;
            hasProfile = true;
            
            // Save to localStorage for backward compatibility
            localStorage.setItem(`uaFriendMatch_profileCreated_${userId}`, 'true');
            localStorage.setItem(`uaFriendMatch_profileData_${userId}`, JSON.stringify(profileData));
            console.log('Profile loaded from shared data service');
        }
    }
    
    console.log('Profile exists for user', userId, ':', hasProfile);
    
    if (hasProfile) {
        // Check if this is a new profile (just created)
        const isNewProfile = profileData.isNewProfile === true;
        
        if (isNewProfile) {
            // Mark profile as no longer new
            profileData.isNewProfile = false;
            localStorage.setItem(`uaFriendMatch_profileData_${userId}`, JSON.stringify(profileData));
            
            // Update shared data service
            if (window.sharedDataService) {
                window.sharedDataService.setField('friendMatchProfile', profileData);
            }
        }
        
        // Load connections from shared data service
        loadConnectionsFromSharedData();
        
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

// Make function globally available
window.showProfileForm = showProfileForm;

// Load connections from shared data service
function loadConnectionsFromSharedData() {
    if (!window.sharedDataService) return;
    
    const userId = getCurrentUserId();
    const sharedConnections = window.sharedDataService.getField('friendMatchConnections') || [];
    const userConnections = sharedConnections.filter(conn => conn.userId === userId);
    
    if (userConnections.length > 0) {
        // Load connections into localStorage for backward compatibility
        const matchedUsers = userConnections.map(conn => ({
            id: conn.id,
            name: conn.name,
            age: conn.age,
            major: conn.major,
            year: conn.year,
            bio: conn.bio,
            interests: conn.interests,
            matchedAt: conn.matchedAt,
            messages: conn.messages || []
        }));
        
        localStorage.setItem(`uaFriendMatch_matchedUsers_${userId}`, JSON.stringify(matchedUsers));
        console.log('Connections loaded from shared data service:', matchedUsers.length);
    }
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
    
    // Save to localStorage with user-specific key (for backward compatibility)
    const userId = getCurrentUserId();
    localStorage.setItem(`uaFriendMatch_profileCreated_${userId}`, 'true');
    localStorage.setItem(`uaFriendMatch_profileData_${userId}`, JSON.stringify(profileData));
    
    // Save to shared data service for cross-user access
    if (window.sharedDataService) {
        const friendMatchProfile = {
            ...profileData,
            userId: userId,
            profileType: 'friendMatch',
            createdAt: new Date().toISOString()
        };
        window.sharedDataService.setField('friendMatchProfile', friendMatchProfile);
        console.log('Profile saved to shared data service');
    }
    
    console.log('Profile saved:', profileData);
    
    // Show success message
    showNotification('Profile created successfully!', 'success');
    
    // Update profile display
    updateProfileDisplay(profileData);
    
    // Reset form for future use
    resetProfileForm();
    
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
    const userId = getCurrentUserId();
    const matchedUsers = JSON.parse(localStorage.getItem(`uaFriendMatch_matchedUsers_${userId}`) || '[]');
    
    // Check if user already exists
    const existingUser = matchedUsers.find(user => user.id === matchData.id);
    if (!existingUser) {
        const newConnection = {
            ...matchData,
            matchedAt: new Date().toISOString(),
            messages: []
        };
        matchedUsers.push(newConnection);
        localStorage.setItem(`uaFriendMatch_matchedUsers_${userId}`, JSON.stringify(matchedUsers));
        
        // Save to shared data service for cross-user access
        if (window.sharedDataService) {
            const connections = window.sharedDataService.getField('friendMatchConnections') || [];
            const existingConnection = connections.find(conn => conn.id === matchData.id && conn.userId === userId);
            if (!existingConnection) {
                connections.push({
                    ...newConnection,
                    userId: userId,
                    connectionType: 'friendMatch'
                });
                window.sharedDataService.setField('friendMatchConnections', connections);
                console.log('Connection saved to shared data service');
            }
        }
        
        console.log('Added matched user:', matchData.name);
    }
}

// Initialize messages display
function initializeMessagesDisplay() {
    const matchedUsersList = document.getElementById('matchedUsersList');
    if (!matchedUsersList) return;
    
    const userId = getCurrentUserId();
    const matchedUsers = JSON.parse(localStorage.getItem(`uaFriendMatch_matchedUsers_${userId}`) || '[]');
    
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
    const currentUserId = getCurrentUserId();
    const matchedUsers = JSON.parse(localStorage.getItem(`uaFriendMatch_matchedUsers_${currentUserId}`) || '[]');
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
        localStorage.setItem(`uaFriendMatch_matchedUsers_${currentUserId}`, JSON.stringify(matchedUsers));
        
        // Save to shared data service for cross-user access
        if (window.sharedDataService) {
            const connections = window.sharedDataService.getField('friendMatchConnections') || [];
            const connectionIndex = connections.findIndex(conn => conn.id === userId && conn.userId === currentUserId);
            if (connectionIndex >= 0) {
                connections[connectionIndex].messages = user.messages;
                window.sharedDataService.setField('friendMatchConnections', connections);
                console.log('Message saved to shared data service');
            }
        }
        
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
    
    const currentUserId = getCurrentUserId();
    const matchedUsers = JSON.parse(localStorage.getItem(`uaFriendMatch_matchedUsers_${currentUserId}`) || '[]');
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
        localStorage.setItem(`uaFriendMatch_matchedUsers_${currentUserId}`, JSON.stringify(matchedUsers));
        
        // Save to shared data service for cross-user access
        if (window.sharedDataService) {
            const connections = window.sharedDataService.getField('friendMatchConnections') || [];
            const connectionIndex = connections.findIndex(conn => conn.id === userId && conn.userId === currentUserId);
            if (connectionIndex >= 0) {
                connections[connectionIndex].messages = user.messages;
                window.sharedDataService.setField('friendMatchConnections', connections);
                console.log('AI response saved to shared data service');
            }
        }
        
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
    console.log('Opening edit profile form...');
    
    // Get current profile data
    const userId = getCurrentUserId();
    const profileData = JSON.parse(localStorage.getItem(`uaFriendMatch_profileData_${userId}`) || '{}');
    
    if (!profileData.firstName) {
        showNotification('No profile data found. Please create a profile first.', 'danger');
        return;
    }
    
    // Show profile form section
    document.getElementById('profileCreation').style.display = 'none';
    document.getElementById('profileForm').style.display = 'block';
    document.getElementById('mainAppContent').style.display = 'none';
    document.getElementById('mainNavLinks').style.display = 'none';
    
    // Populate form with existing data
    populateEditForm(profileData);
    
    // Change form title and button text
    const formTitle = document.querySelector('#profileForm h2');
    const submitButton = document.querySelector('#profileForm button[onclick="saveProfile()"]');
    const backButton = document.querySelector('#profileForm button[onclick="goBackToPrompt()"]');
    
    if (formTitle) formTitle.textContent = 'Edit Your Profile';
    if (submitButton) {
        submitButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>Update Profile';
        submitButton.onclick = updateProfile;
    }
    if (backButton) {
        backButton.innerHTML = '<i class="bi bi-arrow-left me-2"></i>Cancel';
        backButton.onclick = cancelEditProfile;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Populate edit form with existing data
function populateEditForm(profileData) {
    // Basic info
    document.getElementById('firstName').value = profileData.firstName || '';
    document.getElementById('lastName').value = profileData.lastName || '';
    document.getElementById('major').value = profileData.major || '';
    document.getElementById('year').value = profileData.year || '';
    document.getElementById('bio').value = profileData.bio || '';
    
    // Clear existing interests
    const selectedInterests = document.getElementById('selectedInterests');
    selectedInterests.innerHTML = '';
    
    // Add existing interests
    if (profileData.interests && profileData.interests.length > 0) {
        profileData.interests.forEach(interest => {
            const badge = document.createElement('span');
            badge.className = 'badge bg-primary me-2 mb-2';
            badge.innerHTML = `${interest} <i class="bi bi-x" onclick="removeInterest('${interest}')"></i>`;
            selectedInterests.appendChild(badge);
        });
    }
    
    // Clear existing looking for items
    const lookingForItems = document.getElementById('lookingForItems');
    lookingForItems.innerHTML = '';
    
    // Add existing looking for items
    if (profileData.lookingFor && profileData.lookingFor.length > 0) {
        profileData.lookingFor.forEach(item => {
            const newItem = document.createElement('div');
            newItem.className = 'looking-for-item';
            newItem.innerHTML = `
                <input type="text" class="form-control" placeholder="What are you looking for?" value="${item}">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeLookingFor(this)">
                    <i class="bi bi-x"></i>
                </button>
            `;
            lookingForItems.appendChild(newItem);
        });
    } else {
        // Add one empty item if none exist
        addLookingFor();
    }
}

// Update profile function
function updateProfile() {
    console.log('Updating profile...');
    
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
    
    // Create updated profile data
    const updatedProfileData = {
        firstName,
        lastName,
        major,
        year,
        bio,
        interests,
        lookingFor,
        isNewProfile: false  // Keep as existing profile
    };
    
    console.log('Profile updated for existing user');
    
    // Save to localStorage
    const userId = getCurrentUserId();
    localStorage.setItem(`uaFriendMatch_profileData_${userId}`, JSON.stringify(updatedProfileData));
    
    // Save to shared data service for cross-user access
    if (window.sharedDataService) {
        const friendMatchProfile = {
            ...updatedProfileData,
            userId: userId,
            profileType: 'friendMatch',
            lastUpdated: new Date().toISOString()
        };
        window.sharedDataService.setField('friendMatchProfile', friendMatchProfile);
        console.log('Profile updated in shared data service');
    }
    
    console.log('Profile updated:', updatedProfileData);
    
    // Show success message
    showNotification('Profile updated successfully!', 'success');
    
    // Update profile display
    updateProfileDisplay(updatedProfileData);
    
    // Return to main app
    setTimeout(() => {
        showMainApp();
    }, 1500);
}

// Cancel edit profile function
function cancelEditProfile() {
    console.log('Canceling profile edit...');
    
    // Reset form title and buttons
    const formTitle = document.querySelector('#profileForm h2');
    const submitButton = document.querySelector('#profileForm button[onclick="updateProfile()"]');
    const backButton = document.querySelector('#profileForm button[onclick="cancelEditProfile()"]');
    
    if (formTitle) formTitle.textContent = 'Create Your Profile';
    if (submitButton) {
        submitButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>Create Profile';
        submitButton.onclick = saveProfile;
    }
    if (backButton) {
        backButton.innerHTML = 'Back';
        backButton.onclick = goBackToPrompt;
    }
    
    // Return to main app
    showMainApp();
}

// Reset profile form to default state
function resetProfileForm() {
    // Clear all form fields
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('major').value = '';
    document.getElementById('year').value = '';
    document.getElementById('bio').value = '';
    
    // Clear interests
    const selectedInterests = document.getElementById('selectedInterests');
    selectedInterests.innerHTML = '';
    
    // Clear looking for items
    const lookingForItems = document.getElementById('lookingForItems');
    lookingForItems.innerHTML = '';
    
    // Add one empty looking for item
    addLookingFor();
    
    // Reset form title and buttons
    const formTitle = document.querySelector('#profileForm h2');
    const submitButton = document.querySelector('#profileForm button[onclick="updateProfile()"]');
    const backButton = document.querySelector('#profileForm button[onclick="cancelEditProfile()"]');
    
    if (formTitle) formTitle.textContent = 'Create Your Profile';
    if (submitButton) {
        submitButton.innerHTML = '<i class="bi bi-check-circle me-2"></i>Create Profile';
        submitButton.onclick = saveProfile;
    }
    if (backButton) {
        backButton.innerHTML = 'Back';
        backButton.onclick = goBackToPrompt;
    }
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
    const userId = getCurrentUserId();
    localStorage.removeItem(`uaFriendMatch_profileCreated_${userId}`);
    localStorage.removeItem(`uaFriendMatch_profileData_${userId}`);
    localStorage.removeItem(`uaFriendMatch_matchedUsers_${userId}`);
    console.log('Profile data cleared for user', userId, '- refresh page to test');
    location.reload();
};

window.checkProfileStatus = checkProfileStatus;