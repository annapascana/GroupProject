// CrimsonCollab Dashboard JavaScript

// Global variables
let currentTab = 'dashboard';
let currentConversation = null;
let userActivity = JSON.parse(localStorage.getItem('userActivity') || '[]');
let userMessages = JSON.parse(localStorage.getItem('userMessages') || '[]');

// Convert date strings back to Date objects
function restoreDateObjects() {
    // Restore userActivity dates
    userActivity.forEach(activity => {
        if (typeof activity.time === 'string') {
            activity.time = new Date(activity.time);
        }
    });
    
    // Calendar events removed - no userEvents to restore
    
    // Restore userMessages dates
    userMessages.forEach(conversation => {
        if (typeof conversation.time === 'string') {
            conversation.time = new Date(conversation.time);
        }
        conversation.messages.forEach(message => {
            if (typeof message.time === 'string') {
                message.time = new Date(message.time);
            }
        });
    });
}

// Restore date objects on initialization
restoreDateObjects();

// Fresh Start System for New Users
function initializeFreshStart() {
    console.log('Checking for fresh start initialization...');
    
    // Check if this is a new user (no data in localStorage)
    const hasExistingData = localStorage.getItem('userActivity') || 
                           localStorage.getItem('userMessages') ||
                           localStorage.getItem('dashboard_favorites');
    
    if (!hasExistingData) {
        console.log('New user detected! Setting up fresh start...');
        setupFreshStartData();
    } else {
        console.log('Existing user detected, loading saved data...');
    }
}

function setupFreshStartData() {
    console.log('Setting up fresh start data for new user...');
    
    // Create sample activities
    createSampleActivities();
    
    // Create sample messages
    generateSampleMessages();
    
    // Set up some initial favorites
    const initialFavorites = ['Travel Group - Nashville Trip', 'Study Group - CS 101'];
    localStorage.setItem('dashboard_favorites', JSON.stringify(initialFavorites));
    
    // Set initial view preferences
    localStorage.setItem('dashboard_view', 'grid');
    localStorage.setItem('dashboard_theme', 'light');
    
    // Set initial notification preferences
    localStorage.setItem('notifications_enabled', 'true');
    localStorage.setItem('email_notifications', 'true');
    
    console.log('Fresh start data setup complete!');
    
    // Show welcome notification
    setTimeout(() => {
        showNotification('Welcome to CrimsonCollab! Your dashboard is ready.', 'success');
    }, 1000);
}

// Calendar deletion test removed - calendar features no longer available

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait for userManager to be available
    setTimeout(() => {
        if (!checkAuthentication()) {
            return;
        }
        initializeDashboard();
    }, 100);
});

// Check authentication
function checkAuthentication() {
    // Check if userManager is available
    if (typeof userManager === 'undefined') {
        console.log('userManager not available, using fallback...');
        // Use fallback data from localStorage
        const fallbackUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (fallbackUser.firstName) {
            updateUserInfo(fallbackUser);
            return true;
        }
        showNotification('Please log in to access the dashboard.', 'warning');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return false;
    }
    
    const session = userManager.getCurrentSession();
    
    if (!session) {
        // Try fallback from localStorage
        const fallbackUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (fallbackUser.firstName) {
            updateUserInfo(fallbackUser);
            return true;
        }
        showNotification('Please log in to access the dashboard.', 'warning');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return false;
    }
    
    // Update user info in sidebar
    updateUserInfo(session);
    
    // Also try to get current user as a fallback
    const currentUser = userManager.getCurrentUser();
    if (currentUser) {
        // Always update with current user data to ensure we have the right ID
        updateUserInfo({
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            email: currentUser.email,
            userId: currentUser.id,
            id: currentUser.id
        });
    }
    
    return true;
}

// Update user info in sidebar
function updateUserInfo(session) {
    console.log('updateUserInfo called with session:', session);
    const userNameElement = document.querySelector('.user-name');
    const userEmailElement = document.querySelector('.user-email');
    const profileLink = document.getElementById('profileLink');
    // Avatar is now a simple person icon - no variables needed
    
    // Handle case where session might not have all required fields
    const firstName = session?.firstName || 'User';
    const lastName = session?.lastName || '';
    const email = session?.email || 'user@example.com';
    const userId = session?.userId || session?.id;
    
    console.log('Extracted user data - firstName:', firstName, 'lastName:', lastName, 'email:', email, 'userId:', userId);
    
    if (userNameElement) {
        userNameElement.textContent = `${firstName} ${lastName}`.trim();
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = email;
    }
    
    // Avatar is now a simple person icon - no need to update
    console.log('Dashboard avatar is now a simple person icon');
    
    // Update the navigation link that shows the user's name
    const navUserNameElement = document.querySelector('.nav-list .nav-item:first-child .nav-link span');
    if (navUserNameElement) {
        navUserNameElement.textContent = `${firstName} ${lastName}`.trim();
    }
    
    // Add click handler for profile editing
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            openProfileEditModal();
        });
    }
}

// Avatar functions removed - now using simple person icon

// Check for OAuth callback data
function checkOAuthCallback() {
    const oauthUserData = localStorage.getItem('oauth_user_data');
    if (oauthUserData) {
        console.log('OAuth user data found:', oauthUserData);
        try {
            const userData = JSON.parse(oauthUserData);
            console.log('Parsed OAuth user data:', userData);
            
            // Create user session with OAuth data
            const session = {
                id: userData.id,
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                provider: userData.provider,
                verified: userData.verified,
                loginTime: new Date().toISOString()
            };
            
            // Store session
            localStorage.setItem('crimsonCollab_session', JSON.stringify(session));
            
            // Update user info
            updateUserInfo(session);
            
            // Clear OAuth data
            localStorage.removeItem('oauth_user_data');
            
            console.log('OAuth login successful, user session created');
            showNotification(`Successfully logged in with ${userData.provider}!`, 'success');
            
        } catch (error) {
            console.error('Error processing OAuth data:', error);
            localStorage.removeItem('oauth_user_data');
        }
    }
}

// Initialize all dashboard functionality
function initializeDashboard() {
    console.log('Initializing dashboard...');
    
    // Check for OAuth callback first
    checkOAuthCallback();
    
    // Initialize fresh start for new users
    initializeFreshStart();
    
    // Ensure user info is displayed even if userManager isn't available
    ensureUserInfoDisplayed();
    
    setupTabSwitching();
    setupNavigation();
    setupViewToggle();
    setupSearch();
    setupFilters();
    setupCardInteractions();
    setupMobileMenu();
    setupAccessibility();
    setupAnimations();
    setupProfileEdit();
    setupMessages();
    setupMessageSending();
    setupHelpForm();
    loadActivityFeed();
    syncSharedData();
    
    // Refresh user info after a short delay to ensure it's loaded
    setTimeout(() => {
        refreshUserInfo();
    }, 500);
    
    // Force avatar generation test after 2 seconds
    setTimeout(() => {
        console.log('Running forced avatar test...');
        window.testAvatarGeneration();
    }, 2000);
    
    
    // Ensure favorites are loaded after everything is set up
    setTimeout(() => {
        console.log('Loading favorites...');
        loadFavorites();
    }, 100);
}

// Shared Data Sync Functions
function syncSharedData() {
    console.log('Syncing shared data...');
    
    // Check if shared data service is available
    if (typeof sharedDataService === 'undefined') {
        console.log('Shared data service not available, skipping sync');
        return;
    }
    
    // Sync pending user activities
    syncPendingUserActivities();
    
    // Set up periodic sync (every 30 seconds)
    setInterval(() => {
        syncPendingUserActivities();
    }, 30000);
}

// Calendar sync function removed - calendar features no longer available

function syncPendingUserActivities() {
    if (typeof sharedDataService === 'undefined') return;
    
    const pendingActivities = sharedDataService.getPendingUserActivities();
    if (pendingActivities.length === 0) return;
    
    console.log(`Syncing ${pendingActivities.length} pending user activities`);
    
    const processedActivityIds = [];
    
    pendingActivities.forEach(activity => {
        // Check if activity already exists
        const existingActivity = userActivity.find(a => 
            a.title === activity.title && 
            a.description === activity.description &&
            Math.abs(new Date(a.time) - new Date(activity.time)) < 60000 // Within 1 minute
        );
        
        if (!existingActivity) {
            // Add activity to user's activity feed
            const activityItem = {
                id: activity.id,
                type: activity.type,
                title: activity.title,
                description: activity.description,
                time: new Date(activity.time),
                icon: activity.icon,
                collaborationCode: activity.collaborationCode
            };
            
            userActivity.unshift(activityItem);
            processedActivityIds.push(activity.id);
            
            console.log('Added user activity:', activityItem);
        } else {
            // Activity already exists, mark as processed
            processedActivityIds.push(activity.id);
        }
    });
    
    // Save updated activities to localStorage
    if (processedActivityIds.length > 0) {
        localStorage.setItem('userActivity', JSON.stringify(userActivity));
        
        // Mark activities as processed in shared data
        sharedDataService.markUserActivitiesProcessed(processedActivityIds);
        
        // Refresh activity feed if it's currently visible
        if (currentTab === 'activity') {
            loadActivityFeed();
        }
        
        // Update activity badge
        updateActivityBadge();
    }
}

// Ensure user info is displayed
function ensureUserInfoDisplayed() {
    const userNameElement = document.querySelector('.user-name');
    const userEmailElement = document.querySelector('.user-email');
    
    // Check if user info is already displayed
    if (userNameElement && userNameElement.textContent !== 'Loading...') {
        return; // User info is already displayed
    }
    
    // Try to get user info from various sources
    let userInfo = null;
    
    // Try userManager first
    if (typeof userManager !== 'undefined') {
        const session = userManager.getCurrentSession();
        if (session && session.firstName) {
            userInfo = session;
        } else {
            const currentUser = userManager.getCurrentUser();
            if (currentUser && currentUser.firstName) {
                userInfo = currentUser;
            }
        }
    }
    
    // Try localStorage fallback
    if (!userInfo) {
        const fallbackUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        if (fallbackUser.firstName) {
            userInfo = fallbackUser;
        }
    }
    
    // Try shared data service
    if (!userInfo && typeof window.sharedDataService !== 'undefined') {
        const sharedUserData = window.sharedDataService.getUserData();
        if (sharedUserData && sharedUserData.name) {
            const nameParts = sharedUserData.name.split(' ');
            userInfo = {
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                email: sharedUserData.email || 'user@example.com'
            };
        }
    }
    
    // Use sample data if nothing else works
    if (!userInfo) {
        userInfo = {
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@example.com'
        };
    }
    
    // Update the UI
    updateUserInfo(userInfo);
}

// Setup tab switching - THIS IS THE KEY FUNCTION FOR NAVIGATION
function setupTabSwitching() {
    const navLinks = document.querySelectorAll('.nav-link[data-tab]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const tabName = this.getAttribute('data-tab');
            console.log('Tab clicked:', tabName);
            switchTab(tabName);
            
            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            this.closest('.nav-item').classList.add('active');
        });
    });
}

// Switch between tabs
function switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    const selectedTab = document.getElementById(tabName + 'Tab');
    if (selectedTab) {
        selectedTab.classList.add('active');
        currentTab = tabName;
        console.log('Tab switched successfully to:', tabName);
        
        // Load tab-specific content
        switch(tabName) {
            case 'activity':
                loadActivityFeed();
                // Clear activity badge when user views activity tab
                clearActivityBadge();
                break;
            case 'messages':
                loadMessages();
                // Clear messages badge when user views messages tab
                clearMessagesBadge();
                break;
            case 'help':
                // Help tab is static, no loading needed
                console.log('Help tab activated');
                break;
            case 'dashboard':
            default:
                // Dashboard is default, no loading needed
                break;
        }
    } else {
        console.error('Tab not found:', tabName + 'Tab');
    }
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Handle dark mode toggle - check for onclick attribute
            if (this.getAttribute('onclick') && this.getAttribute('onclick').includes('toggleDarkMode')) {
                // Don't prevent default, let the HTML onclick handler work
                return;
            }
            
            e.preventDefault();
            
            // Handle sign out
            if (this.textContent.trim() === 'Sign Out') {
                handleSignOut();
                return;
            }
            
            // Handle profile link (already handled in updateUserInfo)
            if (this.id === 'profileLink') {
                return;
            }
            
            // Handle tab navigation (already handled in setupTabSwitching)
            if (this.getAttribute('data-tab')) {
                return;
            }
            
            // Handle other navigation actions
            const linkText = this.textContent.trim();
            handleNavigation(linkText);
        });
    });
}

// Handle navigation actions
function handleNavigation(linkText) {
    switch (linkText) {
        case 'Sign Out':
            handleSignOut();
            break;
        case 'Messages':
            showNotification('Messages feature coming soon!', 'info');
            break;
        case 'Progress':
            showNotification('Progress tracking coming soon!', 'info');
            break;
        case 'Tools':
            showNotification('Tools panel coming soon!', 'info');
            break;
        case 'Help':
            showNotification('Help documentation coming soon!', 'info');
            break;
        default:
            console.log(`Navigating to: ${linkText}`);
    }
}

// Handle sign out
function handleSignOut() {
    if (confirm('Are you sure you want to sign out?')) {
        showNotification('Signing out...', 'info');
        
        // Clear session
        if (typeof userManager !== 'undefined') {
            userManager.clearSession();
        }
        
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1000);
    }
}

// Refresh user info from session
function refreshUserInfo() {
    console.log('Refreshing user info...');
    
    if (typeof userManager !== 'undefined') {
        const session = userManager.getCurrentSession();
        if (session) {
            console.log('Found session:', session);
            updateUserInfo(session);
        } else {
            // If no session, try to get current user
            const currentUser = userManager.getCurrentUser();
            if (currentUser) {
                console.log('Found current user:', currentUser);
                updateUserInfo({
                    firstName: currentUser.firstName,
                    lastName: currentUser.lastName,
                    email: currentUser.email
                });
            }
        }
    }
    
    // Also try shared data service
    if (typeof window.sharedDataService !== 'undefined') {
        const sharedUserData = window.sharedDataService.getUserData();
        if (sharedUserData && sharedUserData.name) {
            console.log('Found shared user data:', sharedUserData);
            const nameParts = sharedUserData.name.split(' ');
            updateUserInfo({
                firstName: nameParts[0] || 'User',
                lastName: nameParts.slice(1).join(' ') || '',
                email: sharedUserData.email || 'user@example.com'
            });
        }
    }
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
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
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

// Activity Feed Functions
function loadActivityFeed() {
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) return;
    
    // Clear loading state
    activityFeed.innerHTML = '';
    
    // Only show real activity - no sample data
    if (userActivity.length === 0) {
        // Show empty state message
        activityFeed.innerHTML = `
            <div class="empty-activity-state">
                <i class="bi bi-activity"></i>
                <h4>No Recent Activity</h4>
                <p>Your activity will appear here when you join trips or participate in collaborations.</p>
                <button class="btn btn-primary btn-sm" onclick="switchTab('dashboard')">
                    <i class="bi bi-compass me-1"></i>Explore Collaborations
                </button>
            </div>
        `;
    } else {
        // Display real activity items
        userActivity.forEach(activity => {
            const activityItem = createActivityItem(activity);
            activityFeed.appendChild(activityItem);
        });
    }
    
    // Update activity badge
    updateActivityBadge();
}

// Add real activity when user joins a collaboration
function addActivity(type, title, description, collaborationCode = null) {
    const activity = {
        id: Date.now().toString(),
        type: type,
        title: title,
        description: description,
        time: new Date(),
        collaborationCode: collaborationCode
    };
    
    // Add to beginning of array (most recent first)
    userActivity.unshift(activity);
    
    // Keep only last 50 activities
    if (userActivity.length > 50) {
        userActivity = userActivity.slice(0, 50);
    }
    
    // Save to localStorage
    localStorage.setItem('userActivity', JSON.stringify(userActivity));
    
    // Refresh activity feed if currently viewing
    if (currentTab === 'activity') {
        loadActivityFeed();
    }
    
    // Update activity badge
    updateActivityBadge();
    
    // Update profile statistics if profile page is loaded
    updateProfileStatistics();
    
    console.log('Activity added:', activity);
}

// Update Profile Statistics (for cross-page communication)
function updateProfileStatistics() {
    // This function can be called from other pages to update profile stats
    if (typeof refreshStatistics === 'function') {
        refreshStatistics();
    }
}

// Get activity icon based on type
function getActivityIcon(type) {
    const icons = {
        'trip': 'bi-airplane-fill',
        'travel': 'bi-airplane-fill',
        'study': 'bi-book-fill',
        'workout': 'bi-heart-pulse-fill',
        'friend': 'bi-people-fill',
        'innovate': 'bi-lightbulb-fill',
        'match': 'bi-person-check-fill',
        'join': 'bi-person-plus-fill',
        'leave': 'bi-person-dash-fill',
        'favorite': 'bi-star-fill',
        'message': 'bi-chat-fill',
        'update': 'bi-pencil-fill'
    };
    return icons[type] || 'bi-activity';
}

function createActivityItem(activity) {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const timeAgo = getTimeAgo(activity.time);
    const iconClass = getActivityIcon(activity.type);
    
    item.innerHTML = `
        <div class="activity-item-header">
            <div class="activity-icon">
                <i class="bi ${iconClass}"></i>
            </div>
            <div class="activity-content">
                <h4>${activity.title}</h4>
                <p>${activity.description}</p>
                <div class="activity-time">${timeAgo}</div>
            </div>
        </div>
    `;
    
    return item;
}

function getTimeAgo(date) {
    const now = new Date();
    let targetDate;
    
    // Handle both Date objects and date strings
    if (date instanceof Date) {
        targetDate = date;
    } else if (typeof date === 'string') {
        targetDate = new Date(date);
    } else {
        console.log('Invalid date format:', date);
        return 'Unknown time';
    }
    
    // Check if the date is valid
    if (isNaN(targetDate.getTime())) {
        console.log('Invalid date:', date);
        return 'Unknown time';
    }
    
    const diff = now - targetDate;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

function updateActivityBadge() {
    const badge = document.getElementById('activityBadge');
    if (badge) {
        const lastViewTime = localStorage.getItem('lastActivityViewTime');
        let newActivityCount;
        
        if (lastViewTime) {
            // Count activities since last view
            newActivityCount = userActivity.filter(activity => 
                new Date(activity.time) > new Date(lastViewTime)
            ).length;
        } else {
            // If no last view time, count recent activities (last 24 hours)
            newActivityCount = userActivity.filter(activity => 
                new Date(activity.time) > new Date(Date.now() - 24 * 60 * 60 * 1000)
            ).length;
        }
        
        if (newActivityCount > 0) {
            badge.textContent = newActivityCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

function clearActivityBadge() {
    const badge = document.getElementById('activityBadge');
    if (badge) {
        badge.style.display = 'none';
        // Store the last viewed time to track what's been seen
        localStorage.setItem('lastActivityViewTime', new Date().toISOString());
        console.log('Activity badge cleared - last view time updated');
    }
}

function updateMessagesBadge() {
    const badge = document.getElementById('messagesBadge');
    if (badge) {
        const lastViewTime = localStorage.getItem('lastMessagesViewTime');
        let unreadCount = 0;
        
        if (lastViewTime) {
            // Count unread messages since last view
            userMessages.forEach(conversation => {
                conversation.messages.forEach(message => {
                    if (!message.sent && new Date(message.time) > new Date(lastViewTime)) {
                        unreadCount++;
                    }
                });
            });
        } else {
            // If no last view time, count all unread messages
            userMessages.forEach(conversation => {
                conversation.messages.forEach(message => {
                    if (!message.sent && !message.read) {
                        unreadCount++;
                    }
                });
            });
        }
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

function clearMessagesBadge() {
    const badge = document.getElementById('messagesBadge');
    if (badge) {
        badge.style.display = 'none';
        // Store the last viewed time to track what's been seen
        localStorage.setItem('lastMessagesViewTime', new Date().toISOString());
        console.log('Messages badge cleared - last view time updated');
    }
}

// Load Activity Feed
function loadActivityFeed() {
    console.log('Loading activity feed...');
    console.log('Current userActivity:', userActivity);
    
    // Create sample activities if none exist
    if (userActivity.length === 0) {
        console.log('No activities found, creating sample activities...');
        createSampleActivities();
    }
    
    const activityFeed = document.getElementById('activityFeed');
    if (!activityFeed) {
        console.log('Activity feed container not found');
        return;
    }
    
    // Clear loading state
    activityFeed.innerHTML = '';
    
    if (userActivity.length === 0) {
        // Show empty state
        activityFeed.innerHTML = `
            <div class="empty-activity">
                <i class="bi bi-activity"></i>
                <h3>No Activity Yet</h3>
                <p>Start exploring collaborations to see your activity here!</p>
            </div>
        `;
        console.log('No activities found, showing empty state');
        return;
    }
    
    // Sort activities by time (most recent first)
    const sortedActivities = userActivity.sort((a, b) => new Date(b.time) - new Date(a.time));
    
    // Create activity items
    sortedActivities.forEach(activity => {
        const activityItem = createActivityItem(activity);
        activityFeed.appendChild(activityItem);
    });
    
    console.log(`Loaded ${sortedActivities.length} activities`);
}

// Create sample activities for testing
function createSampleActivities() {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const sampleActivities = [
        {
            id: 'activity1',
            type: 'travel',
            title: 'Joined Travel Trip',
            description: 'You joined a trip to New York',
            time: oneHourAgo,
            collaborationCode: 'New York'
        },
        {
            id: 'activity2',
            type: 'study',
            title: 'Visited Study Group Page',
            description: 'You explored study collaboration: Math Study Group',
            time: twoHoursAgo,
            collaborationCode: 'Math Study Group'
        },
        {
            id: 'activity3',
            type: 'favorite',
            title: 'Added to Favorites',
            description: 'You added "Workout Buddy" to your favorites',
            time: oneDayAgo,
            collaborationCode: 'Workout Buddy'
        }
    ];
    
    userActivity = sampleActivities;
    localStorage.setItem('userActivity', JSON.stringify(userActivity));
    console.log('Sample activities created:', userActivity);
}

// Calendar functions removed - calendar features no longer available

// Calendar sample events removed - calendar features no longer available

// Calendar load function removed - calendar features no longer available

// Calendar render function removed - calendar features no longer available

// Calendar modal functions removed - calendar features no longer available

// Calendar save function removed - calendar features no longer available

// Calendar event editing functions removed - calendar features no longer available

// Calendar update function removed - calendar features no longer available

// Calendar delete function removed - calendar features no longer available

// Calendar event editing setup removed - calendar features no longer available

// Messages Functions
function setupMessages() {
    // Messages functionality will be implemented here
    // For now, we'll create some sample conversations
    if (userMessages.length === 0) {
        generateSampleMessages();
    }
}

function loadMessages() {
    const conversationsList = document.getElementById('conversationsList');
    const messagesContent = document.getElementById('messagesContent');
    
    if (!conversationsList) return;
    
    // Clear loading state
    conversationsList.innerHTML = '';
    
    // Display conversations
    userMessages.forEach((conversation, index) => {
        const conversationItem = createConversationItem(conversation, index);
        conversationsList.appendChild(conversationItem);
    });
    
    // Update messages badge
    updateMessagesBadge();
}

function generateSampleMessages() {
    const sampleMessages = [
        {
            name: 'Travel Group - Nashville Trip',
            lastMessage: 'See you at 8 AM tomorrow!',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000),
            messages: [
                { sender: 'Sarah', content: 'Hey everyone! Excited for the trip!', time: new Date(Date.now() - 5 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'Me too! What time are we meeting?', time: new Date(Date.now() - 4 * 60 * 60 * 1000), sent: true },
                { sender: 'Sarah', content: '8 AM at the student center', time: new Date(Date.now() - 3 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'Perfect, see you there!', time: new Date(Date.now() - 2 * 60 * 60 * 1000), sent: true }
            ]
        },
        {
            name: 'Study Group - CS 101',
            lastMessage: 'Thanks for the help with the assignment!',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000),
            messages: [
                { sender: 'Alex', content: 'Anyone need help with the homework?', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'I could use some help with problem 3', time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), sent: true },
                { sender: 'Alex', content: 'Sure! Let me explain it', time: new Date(Date.now() - 24 * 60 * 60 * 1000), sent: false }
            ]
        },
        {
            name: 'Workout Buddy',
            lastMessage: 'Let\'s crush this workout! 💪',
            time: new Date(Date.now() - 30 * 60 * 1000),
            messages: [
                { sender: 'Mike', content: 'Ready for our workout today?', time: new Date(Date.now() - 2 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'Absolutely! What time works for you?', time: new Date(Date.now() - 90 * 60 * 1000), sent: true },
                { sender: 'Mike', content: 'How about 6 PM at the gym?', time: new Date(Date.now() - 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'Perfect! I\'ll be there', time: new Date(Date.now() - 45 * 60 * 1000), sent: true },
                { sender: 'Mike', content: 'Let\'s crush this workout! 💪', time: new Date(Date.now() - 30 * 60 * 1000), sent: false }
            ]
        },
        {
            name: 'Innovation Lab',
            lastMessage: 'That\'s a brilliant idea!',
            time: new Date(Date.now() - 3 * 60 * 60 * 1000),
            messages: [
                { sender: 'Jordan', content: 'Hey! I have an idea for our project', time: new Date(Date.now() - 4 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'I\'d love to hear it! What are you thinking?', time: new Date(Date.now() - 3.5 * 60 * 60 * 1000), sent: true },
                { sender: 'Jordan', content: 'What if we integrate AI to make it smarter?', time: new Date(Date.now() - 3.2 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'That could really change everything!', time: new Date(Date.now() - 3.1 * 60 * 60 * 1000), sent: true },
                { sender: 'Jordan', content: 'That\'s a brilliant idea!', time: new Date(Date.now() - 3 * 60 * 60 * 1000), sent: false }
            ]
        },
        {
            name: 'Book Club',
            lastMessage: 'I can\'t wait to discuss this chapter!',
            time: new Date(Date.now() - 6 * 60 * 60 * 1000),
            messages: [
                { sender: 'Emma', content: 'How is everyone liking the book so far?', time: new Date(Date.now() - 8 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'It\'s really engaging! The plot twist was unexpected', time: new Date(Date.now() - 7 * 60 * 60 * 1000), sent: true },
                { sender: 'Emma', content: 'Right? I didn\'t see that coming at all!', time: new Date(Date.now() - 6.5 * 60 * 60 * 1000), sent: false },
                { sender: 'You', content: 'Me neither! Can\'t wait to see what happens next', time: new Date(Date.now() - 6.2 * 60 * 60 * 1000), sent: true },
                { sender: 'Emma', content: 'I can\'t wait to discuss this chapter!', time: new Date(Date.now() - 6 * 60 * 60 * 1000), sent: false }
            ]
        }
    ];
    
    userMessages = sampleMessages;
    localStorage.setItem('userMessages', JSON.stringify(userMessages));
}

function createConversationItem(conversation, index) {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.dataset.conversationIndex = index;
    
    const timeAgo = getTimeAgo(conversation.time);
    
    item.innerHTML = `
        <div class="conversation-header">
            <div class="conversation-name">${conversation.name}</div>
            <div class="conversation-time">${timeAgo}</div>
        </div>
        <div class="conversation-preview">${conversation.lastMessage}</div>
    `;
    
    item.addEventListener('click', function() {
        selectConversation(index);
    });
    
    return item;
}

function selectConversation(index) {
    // Update active conversation
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const selectedItem = document.querySelector(`[data-conversation-index="${index}"]`);
    if (selectedItem) {
        selectedItem.classList.add('active');
    }
    
    // Load messages
    const conversation = userMessages[index];
    const messagesContent = document.getElementById('messagesContent');
    const messageInputContainer = document.getElementById('messageInputContainer');
    
    if (messagesContent) {
        messagesContent.innerHTML = '';
        
        conversation.messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message-item ${message.sent ? 'sent' : 'received'}`;
            
            messageElement.innerHTML = `
                <div class="message-header">
                    <span>${message.sender}</span>
                    <span>${getTimeAgo(message.time)}</span>
                </div>
                <div class="message-content">${message.content}</div>
            `;
            
            messagesContent.appendChild(messageElement);
        });
        
        // Scroll to bottom
        messagesContent.scrollTop = messagesContent.scrollHeight;
    }
    
    // Show message input
    if (messageInputContainer) {
        messageInputContainer.style.display = 'block';
    }
    
    currentConversation = index;
}

function updateMessagesBadge() {
    const badge = document.getElementById('messagesBadge');
    if (badge) {
        const unreadCount = userMessages.filter(conversation => 
            conversation.messages.some(message => !message.sent && !message.read)
        ).length;
        
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'inline';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Message Sending Functions
function setupMessageSending() {
    const messageForm = document.getElementById('messageForm');
    const messageInput = document.getElementById('messageInput');
    
    if (messageForm) {
        messageForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendMessage();
        });
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }
}

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageContent = messageInput.value.trim();
    
    if (!messageContent) {
        showNotification('Please enter a message.', 'warning');
        return;
    }
    
    if (currentConversation === null) {
        showNotification('Please select a conversation first.', 'warning');
        return;
    }
    
    // Get current user info
    const currentUser = userManager.getCurrentUser();
    const senderName = currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : 'You';
    
    // Create new message
    const newMessage = {
        id: Date.now().toString(),
        sender: senderName,
        content: messageContent,
        time: new Date(),
        sent: true,
        read: true
    };
    
    // Add message to conversation
    userMessages[currentConversation].messages.push(newMessage);
    
    // Save to localStorage
    localStorage.setItem('userMessages', JSON.stringify(userMessages));
    
    // Clear input
    messageInput.value = '';
    
    // Refresh messages display
    selectConversation(currentConversation);
    
    // Add activity
    addActivity('message', 'Sent Message', `You sent a message to ${userMessages[currentConversation].name}`, userMessages[currentConversation].name);
    
    // Show success notification
    showNotification('Message sent!', 'success');
    
    // Simulate response (in a real app, this would come from the server)
    // Variable response time between 1-5 seconds to make it more realistic
    const responseDelay = Math.random() * 4000 + 1000; // 1-5 seconds
    setTimeout(() => {
        simulateResponse(currentConversation);
    }, responseDelay);
}

function simulateResponse(conversationIndex) {
    const conversation = userMessages[conversationIndex];
    
    // Get the last message sent by the user
    const lastUserMessage = conversation.messages
        .filter(msg => msg.sent)
        .pop();
    
    // Generate contextual AI response based on conversation type and user's message
    const aiResponse = generateAIResponse(conversation.name, lastUserMessage?.content || '');
    
    const responseMessage = {
        id: Date.now().toString(),
        sender: conversation.name,
        content: aiResponse,
        time: new Date(),
        sent: false,
        read: false
    };
    
    conversation.messages.push(responseMessage);
    localStorage.setItem('userMessages', JSON.stringify(userMessages));
    
    // Refresh messages if this conversation is currently selected
    if (currentConversation === conversationIndex) {
        selectConversation(conversationIndex);
    }
    
    // Update badge
    updateMessagesBadge();
    
    // Add activity for receiving message
    addActivity('message', 'Received Message', `You received a message from ${conversation.name}`, conversation.name);
}

function generateAIResponse(conversationName, userMessage) {
    // Define fake users with different personalities
    const fakeUsers = {
        'Travel Group - Nashville Trip': {
            name: 'Sarah',
            personality: 'enthusiastic',
            responses: {
                travel: [
                    "I'm so excited for this trip! 🎉",
                    "This is going to be amazing! Can't wait to explore Nashville together!",
                    "Perfect! I've been researching the best spots to visit.",
                    "I'm bringing my camera - we're going to get some great photos!",
                    "The music scene there is incredible. We should definitely check out some live shows!",
                    "I've been counting down the days! This is going to be epic!",
                    "I'm so glad we're all going together. Group trips are the best!",
                    "I've got some restaurant recommendations if you're interested!"
                ],
                logistics: [
                    "Great idea! Let's coordinate our meeting time.",
                    "I'll be there early to grab us good seats.",
                    "Should we carpool or meet there?",
                    "I can pick up snacks for the road trip!",
                    "Let me know if you need help with anything.",
                    "I'll send you the address details.",
                    "Perfect timing! I was just about to ask about that."
                ],
                general: [
                    "That sounds awesome!",
                    "I'm totally on board with that!",
                    "Count me in!",
                    "That's a great idea!",
                    "I'm so excited about this!",
                    "This is going to be so much fun!"
                ]
            }
        },
        'Study Group - CS 101': {
            name: 'Alex',
            personality: 'helpful',
            responses: {
                study: [
                    "I can definitely help with that! Let me explain it step by step.",
                    "That's a great question! I struggled with that concept too at first.",
                    "I have some practice problems that might help. Want me to share them?",
                    "The key is understanding the algorithm first, then the code becomes easier.",
                    "I found a really helpful video on this topic. Let me send you the link.",
                    "Don't worry, this is one of the trickier concepts. We'll figure it out together!",
                    "I can walk you through it during our study session.",
                    "Practice makes perfect! I'll help you work through some examples."
                ],
                homework: [
                    "I'm working on that problem too. Want to collaborate?",
                    "I think I found a different approach. Let me show you.",
                    "The deadline is coming up fast! Let's help each other out.",
                    "I've been stuck on that one too. Maybe we can solve it together.",
                    "I found some helpful resources online. Want me to share them?",
                    "Let's tackle this assignment as a team!",
                    "I can review your code if you want a second pair of eyes."
                ],
                general: [
                    "That makes sense!",
                    "Good point!",
                    "I agree with that approach.",
                    "That's a solid plan!",
                    "Thanks for sharing that!",
                    "I appreciate the help!"
                ]
            }
        },
        'Workout Buddy': {
            name: 'Mike',
            personality: 'motivational',
            responses: {
                workout: [
                    "Let's crush this workout! 💪",
                    "I'm ready to push ourselves today!",
                    "That's the spirit! We've got this!",
                    "Time to get stronger! Let's do this!",
                    "I love your energy! Let's make today count!",
                    "Nothing beats a good workout with a friend!",
                    "I'm feeling pumped! Ready to sweat?",
                    "Let's show up and give it our all!"
                ],
                motivation: [
                    "You're doing great! Keep pushing!",
                    "Every workout counts! You're building something amazing.",
                    "I believe in you! We're going to reach our goals!",
                    "That's the mindset we need! Let's keep it up!",
                    "Progress over perfection! We're getting there!",
                    "Your dedication is inspiring!",
                    "Let's celebrate every small victory!",
                    "We're a team! Let's motivate each other!"
                ],
                general: [
                    "Absolutely!",
                    "I'm with you!",
                    "That's awesome!",
                    "Let's do this!",
                    "Perfect!",
                    "I'm excited!"
                ]
            }
        },
        'Innovation Lab': {
            name: 'Jordan',
            personality: 'creative',
            responses: {
                innovation: [
                    "That's a brilliant idea! I love how you're thinking outside the box.",
                    "This could really change things! Let's explore this further.",
                    "I'm getting excited just thinking about the possibilities!",
                    "That's exactly the kind of innovation we need!",
                    "I have some ideas that could complement yours perfectly.",
                    "This is why I love brainstorming sessions!",
                    "Let's prototype this and see where it takes us!",
                    "I can already see the potential impact of this project."
                ],
                collaboration: [
                    "I'm excited to work on this together!",
                    "Two minds are better than one! Let's combine our ideas.",
                    "I think we can create something amazing together.",
                    "This collaboration is going to be incredible!",
                    "I love how our ideas are building on each other.",
                    "Let's schedule some time to dive deeper into this.",
                    "I'm bringing fresh perspective to the table.",
                    "Together we can solve any challenge!"
                ],
                general: [
                    "That's fascinating!",
                    "I love this approach!",
                    "This is exciting!",
                    "Great thinking!",
                    "I'm intrigued!",
                    "Let's explore this!"
                ]
            }
        },
        'Book Club': {
            name: 'Emma',
            personality: 'thoughtful',
            responses: {
                book: [
                    "I love how the author develops the characters!",
                    "This chapter really made me think about the themes.",
                    "The writing style is so engaging, don't you think?",
                    "I can't wait to discuss this with everyone!",
                    "The plot twist was completely unexpected!",
                    "I've been highlighting so many quotes from this book.",
                    "The character development is incredible in this section.",
                    "This book is really making me reflect on my own experiences."
                ],
                discussion: [
                    "That's such an interesting perspective! I hadn't thought of it that way.",
                    "I agree! The symbolism in that scene was powerful.",
                    "I'd love to hear more about your interpretation.",
                    "That connects perfectly to what we discussed last week.",
                    "I think we should explore that theme more deeply.",
                    "Your analysis really adds to my understanding of the book.",
                    "I'm looking forward to our discussion about this chapter.",
                    "That's a great point! It really changes how I see the story."
                ],
                general: [
                    "That's so true!",
                    "I completely agree!",
                    "That's a great observation!",
                    "I love that perspective!",
                    "That makes perfect sense!",
                    "I hadn't thought of it that way!"
                ]
            }
        }
    };
    
    // Get the fake user for this conversation
    const fakeUser = fakeUsers[conversationName];
    if (!fakeUser) {
        // Fallback responses for unknown conversations
        const fallbackResponses = [
            "Thanks for your message!",
            "That sounds great!",
            "I'll get back to you soon.",
            "Let me know if you need anything else.",
            "Perfect timing!",
            "I'm interested in that too.",
            "Sounds like a plan!",
            "Looking forward to it!"
        ];
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    // Determine response category based on user's message
    let category = 'general';
    const message = userMessage.toLowerCase();
    
    if (conversationName.includes('Travel') || conversationName.includes('Trip')) {
        if (message.includes('time') || message.includes('meet') || message.includes('when') || message.includes('where')) {
            category = 'logistics';
        } else if (message.includes('excited') || message.includes('trip') || message.includes('travel') || message.includes('nashville')) {
            category = 'travel';
        }
    } else if (conversationName.includes('Study') || conversationName.includes('CS')) {
        if (message.includes('help') || message.includes('problem') || message.includes('homework') || message.includes('assignment')) {
            category = 'homework';
        } else if (message.includes('study') || message.includes('learn') || message.includes('understand') || message.includes('concept')) {
            category = 'study';
        }
    } else if (conversationName.includes('Workout')) {
        if (message.includes('workout') || message.includes('exercise') || message.includes('gym') || message.includes('train')) {
            category = 'workout';
        } else if (message.includes('motivation') || message.includes('encourage') || message.includes('goal') || message.includes('progress')) {
            category = 'motivation';
        }
    } else if (conversationName.includes('Innovation')) {
        if (message.includes('idea') || message.includes('innovate') || message.includes('create') || message.includes('project')) {
            category = 'innovation';
        } else if (message.includes('collaborate') || message.includes('together') || message.includes('team') || message.includes('work')) {
            category = 'collaboration';
        }
    } else if (conversationName.includes('Book Club')) {
        if (message.includes('book') || message.includes('chapter') || message.includes('read') || message.includes('story') || message.includes('character')) {
            category = 'book';
        } else if (message.includes('discuss') || message.includes('think') || message.includes('interpret') || message.includes('theme') || message.includes('symbol')) {
            category = 'discussion';
        }
    }
    
    // Get responses for the determined category
    const responses = fakeUser.responses[category] || fakeUser.responses.general;
    
    // Return a random response from the appropriate category
    return responses[Math.floor(Math.random() * responses.length)];
}

// Help Form Functions
function setupHelpForm() {
    const supportForm = document.getElementById('supportForm');
    
    if (supportForm) {
        supportForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitSupportRequest();
        });
    }
}

function submitSupportRequest() {
    const formData = {
        subject: document.getElementById('supportSubject').value,
        category: document.getElementById('supportCategory').value,
        message: document.getElementById('supportMessage').value
    };
    
    // Validate form
    if (!formData.subject || !formData.category || !formData.message) {
        showNotification('Please fill in all fields.', 'warning');
        return;
    }
    
    // Simulate sending email (in a real app, this would send to a server)
    console.log('Support request submitted:', formData);
    
    // Show success message
    showNotification('Support request submitted successfully! We\'ll get back to you soon.', 'success');
    
    // Reset form
    document.getElementById('supportForm').reset();
    
    // In a real application, you would send this data to your backend
    // fetch('/api/support', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(formData)
    // });
}

// Profile Edit Modal Functions
function openProfileEditModal() {
    const session = typeof userManager !== 'undefined' ? userManager.getCurrentSession() : null;
    const currentUser = typeof userManager !== 'undefined' ? userManager.getCurrentUser() : null;
    
    // Populate form with current user data
    document.getElementById('editFirstName').value = session?.firstName || currentUser?.firstName || '';
    document.getElementById('editLastName').value = session?.lastName || currentUser?.lastName || '';
    document.getElementById('editEmail').value = session?.email || currentUser?.email || '';
    document.getElementById('editMajor').value = currentUser?.major || '';
    document.getElementById('editYear').value = currentUser?.year || '';
    document.getElementById('editInterests').value = currentUser?.interests || '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('profileEditModal'));
    modal.show();
}

function setupProfileEdit() {
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', function() {
            saveProfile();
        });
    }
}

function saveProfile() {
    const formData = {
        firstName: document.getElementById('editFirstName').value,
        lastName: document.getElementById('editLastName').value,
        email: document.getElementById('editEmail').value,
        major: document.getElementById('editMajor').value,
        year: document.getElementById('editYear').value,
        interests: document.getElementById('editInterests').value
    };
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
        showNotification('Please fill in all required fields.', 'warning');
        return;
    }
    
    // Update user in userManager
    if (typeof userManager !== 'undefined') {
        const currentUser = userManager.getCurrentUser();
        if (currentUser) {
            Object.assign(currentUser, formData);
            userManager.updateUser(currentUser);
        }
        
        // Update session
        const session = userManager.getCurrentSession();
        if (session) {
            Object.assign(session, formData);
            userManager.updateSession(session);
        }
    }
    
    // Update UI
    updateUserInfo(formData);
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('profileEditModal'));
    modal.hide();
    
    showNotification('Profile updated successfully!', 'success');
}

// Placeholder functions for other features
// View Toggle Setup
function setupViewToggle() {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const contentGrid = document.getElementById('contentGrid');
    
    if (gridViewBtn && listViewBtn && contentGrid) {
        gridViewBtn.addEventListener('click', function() {
            contentGrid.classList.remove('list-view');
            gridViewBtn.classList.add('active');
            listViewBtn.classList.remove('active');
            updateViewButtons(true);
        });
        
        listViewBtn.addEventListener('click', function() {
            contentGrid.classList.add('list-view');
            listViewBtn.classList.add('active');
            gridViewBtn.classList.remove('active');
            updateViewButtons(false);
        });
        
        // Set default to grid view
        updateViewButtons(true);
    }
}

// Update view buttons
function updateViewButtons(isGridView) {
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    
    if (isGridView) {
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    } else {
        listViewBtn.classList.add('active');
        gridViewBtn.classList.remove('active');
    }
}
// Search Setup
function setupSearch() {
    const searchInput = document.querySelector('.search-input');
    const resultsCount = document.getElementById('resultsCount');
    
    if (searchInput && resultsCount) {
        // Debounced search
        const debouncedSearch = debounce(function() {
            performSearch(searchInput.value);
        }, 300);
        
        searchInput.addEventListener('input', debouncedSearch);
        
        // Initial search
        performSearch('');
    }
}

// Perform search
function performSearch(query) {
    const cards = document.querySelectorAll('.collaboration-card');
    const resultsCount = document.getElementById('resultsCount');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardText = card.textContent.toLowerCase();
        const searchQuery = query.toLowerCase();
        
        if (cardText.includes(searchQuery)) {
            card.style.display = 'block';
            card.classList.add('fade-in');
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results count
    if (resultsCount) {
        resultsCount.textContent = `${visibleCount} result${visibleCount !== 1 ? 's' : ''}`;
    }
}

// Debounce utility function
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
// Filters Setup
function setupFilters() {
    setupTypeFilter();
    setupStatusFilter();
    setupItemsPerPage();
    setupFavoritesFilter();
}

// Type filter setup
function setupTypeFilter() {
    const typeItems = document.querySelectorAll('[data-filter]');
    
    typeItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            applyTypeFilter(filter);
            updateFilterTag(this.textContent);
        });
    });
}

// Apply type filter
function applyTypeFilter(filter) {
    const cards = document.querySelectorAll('.collaboration-card');
    
    cards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        
        if (filter === 'all' || cardType === filter) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
    
    updateResultsCount();
}

// Status filter setup
function setupStatusFilter() {
    const statusItems = document.querySelectorAll('[data-status]');
    
    statusItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const status = this.getAttribute('data-status');
            applyStatusFilter(status);
        });
    });
}

// Apply status filter
function applyStatusFilter(status) {
    const cards = document.querySelectorAll('.collaboration-card');
    
    cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        
        if (status === 'all' || cardStatus === status) {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else {
            card.style.display = 'none';
        }
    });
    
    updateResultsCount();
}

// Items per page setup
function setupItemsPerPage() {
    const itemsPerPageItems = document.querySelectorAll('[data-items]');
    
    itemsPerPageItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const items = this.getAttribute('data-items');
            updateItemsPerPage(items);
        });
    });
}

// Update items per page
function updateItemsPerPage(items) {
    const itemsPerPageSpan = document.getElementById('itemsPerPage');
    if (itemsPerPageSpan) {
        itemsPerPageSpan.textContent = items;
    }
    
    showNotification(`Showing ${items} items per page`, 'info');
}

// Update filter tag
function updateFilterTag(text) {
    const filterTag = document.querySelector('.filter-tag span');
    if (filterTag) {
        filterTag.textContent = text;
    }
}

// Setup favorites filter
function setupFavoritesFilter() {
    // Add favorites filter button to the filter controls
    const filterControls = document.querySelector('.filter-controls');
    if (filterControls) {
        const favoritesFilter = document.createElement('div');
        favoritesFilter.className = 'dropdown';
        favoritesFilter.innerHTML = `
            <button class="btn btn-outline-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" id="favoritesFilterBtn">
                <i class="bi bi-star"></i> Favorites
            </button>
            <ul class="dropdown-menu">
                <li><a class="dropdown-item" href="#" data-favorites="all">All Items</a></li>
                <li><a class="dropdown-item" href="#" data-favorites="favorites">Favorites Only</a></li>
            </ul>
        `;
        
        filterControls.appendChild(favoritesFilter);
        
        // Add event listeners
        const favoritesItems = favoritesFilter.querySelectorAll('[data-favorites]');
        favoritesItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const filter = this.getAttribute('data-favorites');
                applyFavoritesFilter(filter);
                
                // Update button text
                const btn = document.getElementById('favoritesFilterBtn');
                if (btn) {
                    const icon = filter === 'favorites' ? 'bi-star-fill' : 'bi-star';
                    btn.innerHTML = `<i class="bi ${icon}"></i> ${filter === 'favorites' ? 'Favorites Only' : 'Favorites'}`;
                }
            });
        });
    }
}

// Apply favorites filter
function applyFavoritesFilter(filter) {
    const cards = document.querySelectorAll('.collaboration-card');
    const favorites = JSON.parse(localStorage.getItem('dashboard_favorites') || '[]');
    
    cards.forEach(card => {
        const cardCode = card.querySelector('.card-code').textContent;
        const isFavorited = favorites.includes(cardCode);
        
        if (filter === 'all') {
            card.style.display = 'block';
            card.classList.add('fade-in');
        } else if (filter === 'favorites') {
            if (isFavorited) {
                card.style.display = 'block';
                card.classList.add('fade-in');
            } else {
                card.style.display = 'none';
            }
        }
    });
    
    updateResultsCount();
}

// Update results count
function updateResultsCount() {
    const visibleCards = document.querySelectorAll('.collaboration-card[style*="block"], .collaboration-card:not([style*="none"])');
    const resultsCount = document.getElementById('resultsCount');
    
    if (resultsCount) {
        resultsCount.textContent = `${visibleCards.length} result${visibleCards.length !== 1 ? 's' : ''}`;
    }
}
// Card Interactions Setup
function setupCardInteractions() {
    setupCardClicks();
    setupFavoriteButtons();
}

// Setup card clicks
function setupCardClicks() {
    const cards = document.querySelectorAll('.collaboration-card');
    
    cards.forEach(card => {
        // Remove any existing onclick handlers
        card.removeAttribute('onclick');
        
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on favorite button or its children
            if (e.target.closest('.btn-favorite') || e.target.classList.contains('btn-favorite')) {
                console.log('Click on favorite button, not navigating');
                return;
            }
            
            // Don't trigger if clicking on the star icon itself
            if (e.target.classList.contains('bi-star') || e.target.classList.contains('bi-star-fill')) {
                console.log('Click on star icon, not navigating');
                return;
            }
            
            const cardType = this.getAttribute('data-type');
            
            // Special handling for travel card
            if (cardType === 'travel') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Travel card clicked, navigating to travel page...');
                
                // Add activity for visiting travel page
                const cardCode = this.querySelector('.card-code').textContent;
                addActivity('travel', 'Visited Travel Page', `You explored travel collaboration: ${cardCode}`, cardCode);
                
                window.location.href = '../Pages/EmilyGarcia/travel.html';
                return;
            }
            
            // Special handling for friend card
            if (cardType === 'friend') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Friend Match card clicked, navigating to friend match page...');
                
                // Add activity for visiting friend match page
                const cardCode = this.querySelector('.card-code').textContent;
                addActivity('friend', 'Visited Friend Match Page', `You explored friend matching: ${cardCode}`, cardCode);
                
                window.location.href = '../Pages/Anna/index.html';
                return;
            }
            
            // Special handling for workout card
            if (cardType === 'workout') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Workout card clicked, navigating to workout page...');
                
                // Add activity for visiting workout page
                const cardCode = this.querySelector('.card-code').textContent;
                addActivity('workout', 'Visited Workout Page', `You explored workout collaboration: ${cardCode}`, cardCode);
                
                window.location.href = '../Pages/jaxon/workout.html';
                return;
            }
            
            // Special handling for study card
            if (cardType === 'study') {
                e.preventDefault();
                e.stopPropagation();
                console.log('Study card clicked, navigating to study page...');
                
                // Add activity for visiting study page
                const cardCode = this.querySelector('.card-code').textContent;
                addActivity('study', 'Visited Study Group Page', `You explored study collaboration: ${cardCode}`, cardCode);
                
                window.location.href = '../Pages/Sofia/study.html';
                return;
            }
            
            // Special handling for innovate card
            if (cardType === 'innovate') {
                e.preventDefault();
                e.stopPropagation();
                console.log('UA Innovate card clicked, navigating to innovate page...');
                
                // Add activity for visiting innovate page
                const cardCode = this.querySelector('.card-code').textContent;
                addActivity('innovate', 'Visited UA Innovate Page', `You explored innovation collaboration: ${cardCode}`, cardCode);
                
                window.location.href = '../Pages/UAInnovate/innovate.html';
                return;
            }
            
            // Special handling for about card
            if (cardType === 'about') {
                e.preventDefault();
                e.stopPropagation();
                console.log('About Us card clicked, navigating to about page...');
                
                // Add activity for visiting about page
                const cardCode = this.querySelector('.card-code').textContent;
                addActivity('about', 'Visited About Us Page', `You explored: ${cardCode}`, cardCode);
                
                window.location.href = '../Pages/About Us/about.html';
                return;
            }
            
            const cardCode = this.querySelector('.card-code').textContent;
            handleCardClick(cardType, cardCode);
        });
    });
}

// Handle card click
function handleCardClick(type, code) {
    const typeNames = {
        'workout': 'Workout Buddy',
        'study': 'Study Group',
        'friend': 'Friend Match',
        'travel': 'Travel',
        'innovate': 'UA Innovate',
        'about': 'About Us'
    };
    
    const typeName = typeNames[type] || type;
    showNotification(`Opening ${typeName} collaboration: ${code}`, 'info');
    
    // In a real app, this would navigate to the specific collaboration page
    setTimeout(() => {
        console.log(`Navigating to ${type} collaboration: ${code}`);
        // window.location.href = `./collaboration.html?type=${type}&code=${code}`;
    }, 1000);
}

// Setup favorite buttons
function setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    favoriteButtons.forEach(button => {
        // Remove any existing event listeners
        button.removeEventListener('click', toggleFavorite);
        
        // Add click event listener with proper event handling
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            console.log('Favorite button clicked - preventing navigation');
            toggleFavorite(this);
            return false;
        });
        
        // Also add mousedown event to prevent any other interactions
        button.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
        
        // Prevent any other mouse events from bubbling
        button.addEventListener('mouseup', function(e) {
            e.stopPropagation();
        });
    });
    
    // Load existing favorites on page load
    loadFavorites();
}
function setupMobileMenu() { console.log('Mobile menu setup'); }
function setupAccessibility() { console.log('Accessibility setup'); }
function setupAnimations() { console.log('Animations setup'); }
// Load favorites from localStorage
function loadFavorites() {
    const favorites = JSON.parse(localStorage.getItem('dashboard_favorites') || '[]');
    const cards = document.querySelectorAll('.collaboration-card');
    
    cards.forEach(card => {
        const cardCode = card.querySelector('.card-code').textContent;
        const favoriteButton = card.querySelector('.btn-favorite');
        
        if (favorites.includes(cardCode)) {
            favoriteButton.classList.add('favorited');
            favoriteButton.querySelector('i').className = 'bi bi-star-fill';
        }
    });
}

// Save favorites to localStorage
function saveFavorites(favorites) {
    localStorage.setItem('dashboard_favorites', JSON.stringify(favorites));
}

// Toggle favorite
function toggleFavorite(button) {
    console.log('toggleFavorite called');
    
    const card = button.closest('.collaboration-card');
    if (!card) {
        console.error('Could not find parent card');
        return;
    }
    
    const cardCodeElement = card.querySelector('.card-code');
    if (!cardCodeElement) {
        console.error('Could not find card-code element');
        return;
    }
    
    const cardCode = cardCodeElement.textContent;
    const icon = button.querySelector('i');
    const favorites = JSON.parse(localStorage.getItem('dashboard_favorites') || '[]');
    
    console.log('Card code:', cardCode);
    console.log('Current favorites:', favorites);
    
    const isFavorited = button.classList.contains('favorited');
    console.log('Is favorited:', isFavorited);
    
    if (isFavorited) {
        button.classList.remove('favorited');
        icon.className = 'bi bi-star';
        // Remove from favorites array
        const index = favorites.indexOf(cardCode);
        if (index > -1) {
            favorites.splice(index, 1);
        }
        saveFavorites(favorites);
        showNotification(`Removed "${cardCode}" from favorites`, 'info');
        console.log('Removed from favorites');
        
        // Add activity for removing favorite
        addActivity('favorite', 'Removed from Favorites', `You removed "${cardCode}" from your favorites`, cardCode);
        
        // Update profile statistics
        updateProfileStatistics();
    } else {
        button.classList.add('favorited');
        icon.className = 'bi bi-star-fill';
        // Add to favorites array
        if (!favorites.includes(cardCode)) {
            favorites.push(cardCode);
        }
        saveFavorites(favorites);
        showNotification(`Added "${cardCode}" to favorites`, 'success');
        console.log('Added to favorites');
        
        // Add activity for adding favorite
        addActivity('favorite', 'Added to Favorites', `You added "${cardCode}" to your favorites`, cardCode);
        
        // Update profile statistics
        updateProfileStatistics();
    }
}

// Update user info in the sidebar
function updateUserInfo(userInfo) {
    console.log('Updating user info:', userInfo);
    
    // Update user name
    const userNameElement = document.querySelector('.user-name');
    if (userNameElement) {
        const userNameLink = userNameElement.querySelector('.user-name-link');
        if (userNameLink) {
            userNameLink.textContent = `${userInfo.firstName} ${userInfo.lastName}`.trim();
        } else {
            userNameElement.textContent = `${userInfo.firstName} ${userInfo.lastName}`.trim();
        }
        console.log('Updated user name to:', `${userInfo.firstName} ${userInfo.lastName}`.trim());
    } else {
        console.log('User name element not found');
    }
    
    // Update user email
    const userEmailElement = document.querySelector('.user-email');
    if (userEmailElement) {
        userEmailElement.textContent = userInfo.email;
        console.log('Updated user email to:', userInfo.email);
    } else {
        console.log('User email element not found');
    }
    
    // Avatar is now a simple person icon - no need to update
    
    console.log('User info updated successfully');
}
