// Shared Data Service for CrimsonCollab
class SharedDataService {
    constructor() {
        this.baseStorageKey = 'crimsonCollabUserData';
        this.userData = this.loadUserData();
        this.isNewUser = this.checkIfNewUser();
    }

    getUserSpecificKey() {
        // Get user ID from email if available
        const email = this.userData?.email;
        if (email) {
            const userId = 'user_' + email.replace(/[^a-zA-Z0-9]/g, '_');
            return `${this.baseStorageKey}_${userId}`;
        }
        
        // Fall back to UA Innovate, travel, or workout user IDs
        const uaUserId = localStorage.getItem('uaInnovateUserId');
        if (uaUserId) return `${this.baseStorageKey}_${uaUserId}`;
        
        const travelUserId = localStorage.getItem('travelUserId');
        if (travelUserId) return `${this.baseStorageKey}_${travelUserId}`;
        
        const workoutUserId = localStorage.getItem('workoutUserId');
        if (workoutUserId) return `${this.baseStorageKey}_${workoutUserId}`;
        
        // Default to base key if no user ID found
        return this.baseStorageKey;
    }

    loadUserData() {
        try {
            const storageKey = this.getUserSpecificKey();
            const saved = localStorage.getItem(storageKey);
            return saved ? JSON.parse(saved) : this.getDefaultUserData();
        } catch (error) {
            console.error('Error loading user data:', error);
            return this.getDefaultUserData();
        }
    }

    saveUserData() {
        try {
            const storageKey = this.getUserSpecificKey();
            localStorage.setItem(storageKey, JSON.stringify(this.userData));
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    }

    getDefaultUserData() {
        return {
            name: '',
            email: '',
            year: '',
            age: '',
            gender: '',
            major: '',
            phone: '',
            preferences: {
                notifications: true,
                darkMode: false
            },
            workoutProfile: {
                goals: '',
                experience: '',
                preferredTime: '',
                location: '',
                bio: ''
            },
            lastUpdated: null,
            createdAt: null
        };
    }

    updateUserData(updates) {
        this.userData = { ...this.userData, ...updates };
        this.userData.lastUpdated = new Date().toISOString();
        
        if (!this.userData.createdAt) {
            this.userData.createdAt = new Date().toISOString();
        }
        
        return this.saveUserData();
    }

    getUserData() {
        return { ...this.userData };
    }

    getField(fieldPath) {
        const keys = fieldPath.split('.');
        let value = this.userData;
        
        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return null;
            }
        }
        
        return value;
    }

    setField(fieldPath, value) {
        const keys = fieldPath.split('.');
        let current = this.userData;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                current[key] = {};
            }
            current = current[key];
        }
        
        current[keys[keys.length - 1]] = value;
        this.userData.lastUpdated = new Date().toISOString();
        
        return this.saveUserData();
    }

    hasBasicInfo() {
        return !!(this.userData.name && this.userData.email);
    }

    autofillForm(formId, fieldMapping = {}) {
        const form = document.getElementById(formId);
        if (!form) {
            console.log(`Form with ID '${formId}' not found`);
            return false;
        }

        let filledCount = 0;

        const defaultMappings = {
            'name': 'name',
            'profileName': 'name',
            'email': 'email',
            'profileEmail': 'email',
            'year': 'year',
            'profileYear': 'year',
            'age': 'age',
            'profileAge': 'age',
            'gender': 'gender',
            'profileGender': 'gender',
            'major': 'major',
            'phone': 'phone'
        };

        const mappings = { ...defaultMappings, ...fieldMapping };

        Object.entries(mappings).forEach(([fieldId, dataPath]) => {
            const field = form.querySelector(`#${fieldId}`);
            if (field) {
                const value = this.getField(dataPath);
                if (value) {
                    field.value = value;
                    filledCount++;
                    field.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });

        return filledCount > 0;
    }

    autofillProfileForm(formId, profileType, fieldMapping = {}) {
        const form = document.getElementById(formId);
        if (!form) {
            console.log(`Form with ID '${formId}' not found`);
            return false;
        }

        let filledCount = 0;
        const profileData = this.userData[profileType] || {};

        const defaultMappings = {
            'goals': 'goals',
            'profileGoals': 'goals',
            'experience': 'experience',
            'profileExperience': 'experience',
            'preferredTime': 'preferredTime',
            'profilePreferredTime': 'preferredTime',
            'location': 'location',
            'profileLocation': 'location',
            'bio': 'bio',
            'profileBio': 'bio'
        };

        const mappings = { ...defaultMappings, ...fieldMapping };

        Object.entries(mappings).forEach(([fieldId, dataKey]) => {
            const field = form.querySelector(`#${fieldId}`);
            if (field && profileData[dataKey]) {
                field.value = profileData[dataKey];
                filledCount++;
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        return filledCount > 0;
    }

    getDisplayName() {
        return this.userData.name || 'User';
    }

    getUserEmail() {
        return this.userData.email || '';
    }

    isLoggedIn() {
        return this.hasBasicInfo();
    }

    // Check if this is a new user (no previous data)
    checkIfNewUser() {
        // Check if user has any existing data across all modules
        const hasUserData = this.hasBasicInfo();
        const hasUaInnovateData = localStorage.getItem('uaInnovateProfile') || localStorage.getItem('uaInnovateUserId');
        const hasTravelData = localStorage.getItem('travelUserId') || localStorage.getItem('ua_trips');
        const hasWorkoutData = localStorage.getItem('workoutUserId') || localStorage.getItem('workoutProfile');
        const hasFriendMatchData = localStorage.getItem('uaFriendMatch_profileCreated');
        
        // Check for any existing data
        const hasAnyData = hasUserData || hasUaInnovateData || hasTravelData || hasWorkoutData || hasFriendMatchData;
        
        // Check if user has visited before
        const hasVisitedBefore = localStorage.getItem('crimsonCollab_hasVisited');
        
        return !hasAnyData && !hasVisitedBefore;
    }

    // Mark user as having visited
    markUserAsVisited() {
        localStorage.setItem('crimsonCollab_hasVisited', 'true');
        this.isNewUser = false;
    }

    // Clear all user data for fresh start
    clearAllUserData() {
        try {
            // Clear all module-specific data
            const keysToRemove = [
                // User data
                'crimsonCollabUserData',
                'crimsonCollab_hasVisited',
                
                // UA Innovate data
                'uaInnovateProfile',
                'uaInnovateUserId',
                'allProfiles',
                'allGroups',
                'myGroups',
                
                // Travel data
                'travelUserId',
                'ua_trips',
                'joined_trips',
                'travel_notifications',
                'travel_theme',
                'travel_groups',
                'social_posts',
                'trip_groups',
                'travel_search_history',
                'travel_filters',
                'travel_chat_messages',
                'travel_analytics_cache',
                'travel_user_preferences',
                'travel_safety_checklist',
                'travel_pwa_installed',
                
                // Workout data
                'workoutUserId',
                'workoutProfile',
                'workoutGoals',
                'workoutHistory',
                
                // Friend Match data
                'uaFriendMatch_profileCreated',
                'uaFriendMatch_profileData',
                'uaFriendMatch_matchedUsers',
                
                // Dashboard data
                'dashboard_favorites',
                'theme'
            ];

            keysToRemove.forEach(key => {
                localStorage.removeItem(key);
            });

            // Clear user-specific keys (pattern matching)
            const allKeys = Object.keys(localStorage);
            allKeys.forEach(key => {
                if (key.includes('user_') || key.includes('_user_') || key.includes('emergency_contacts_')) {
                    localStorage.removeItem(key);
                }
            });

            // Reset user data
            this.userData = this.getDefaultUserData();
            this.isNewUser = true;
            
            console.log('All user data cleared for fresh start');
            return true;
        } catch (error) {
            console.error('Error clearing user data:', error);
            return false;
        }
    }

    // Get new user status
    getIsNewUser() {
        return this.isNewUser;
    }
}

// Create global instance
window.sharedDataService = new SharedDataService();

// Utility functions
window.getUserData = () => window.sharedDataService.getUserData();
window.updateUserData = (updates) => window.sharedDataService.updateUserData(updates);
window.autofillForm = (formId, fieldMapping) => window.sharedDataService.autofillForm(formId, fieldMapping);
window.getUserDisplayName = () => window.sharedDataService.getDisplayName();
window.getUserEmail = () => window.sharedDataService.getUserEmail();
window.isUserLoggedIn = () => window.sharedDataService.isLoggedIn();
window.isNewUser = () => window.sharedDataService.getIsNewUser();
window.markUserAsVisited = () => window.sharedDataService.markUserAsVisited();
window.clearAllUserData = () => window.sharedDataService.clearAllUserData();

// Auto-fill forms when page loads
document.addEventListener('DOMContentLoaded', function() {
    const forms = document.querySelectorAll('form[id]');
    forms.forEach(form => {
        const formId = form.id;
        if (formId.includes('profile') || formId.includes('user')) {
            window.sharedDataService.autofillForm(formId);
        }
    });
});

console.log('Shared Data Service loaded successfully');