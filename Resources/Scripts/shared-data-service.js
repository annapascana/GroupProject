// Shared Data Service for CrimsonCollab
class SharedDataService {
    constructor() {
        this.storageKey = 'crimsonCollabUserData';
        this.userData = this.loadUserData();
    }

    loadUserData() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : this.getDefaultUserData();
        } catch (error) {
            console.error('Error loading user data:', error);
            return this.getDefaultUserData();
        }
    }

    saveUserData() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.userData));
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