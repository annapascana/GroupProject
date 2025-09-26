/**
 * Shared Data Service
 * Handles cross-user data persistence and synchronization
 * This service ensures all user-created content is accessible to all users
 */

class SharedDataService {
    constructor() {
        this.baseUrl = 'http://localhost:3000/api'; // Backend API URL
        this.isOnline = navigator.onLine;
        this.syncQueue = [];
        
        // Listen for online/offline events
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
        });
        
        window.addEventListener('offline', () => {
            this.isOnline = false;
        });
        
        // Initialize with existing data
        this.initializeData();
    }

    /**
     * Initialize data from localStorage and sync with server
     */
    async initializeData() {
        try {
            // Load trips from server
            await this.loadTripsFromServer();
            
            // Load groups from server
            await this.loadGroupsFromServer();
            
            // Load profiles from server
            await this.loadProfilesFromServer();
            
            console.log('Shared data service initialized successfully');
        } catch (error) {
            console.warn('Failed to initialize shared data service:', error);
            // Continue with localStorage fallback
        }
    }

    /**
     * TRIP MANAGEMENT
     */
    
    async saveTrip(tripData) {
        const trip = {
            id: tripData.id || this.generateId(),
            ...tripData,
            createdAt: new Date().toISOString(),
            createdBy: this.getCurrentUserId(),
            lastModified: new Date().toISOString()
        };

        try {
            if (this.isOnline) {
                // Save to server
                const response = await fetch(`${this.baseUrl}/trips`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(trip)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    trip.id = result.tripId || trip.id;
                }
            }
            
            // Always save to localStorage as backup
            this.saveTripToLocalStorage(trip);
            
            // Add to sync queue if offline
            if (!this.isOnline) {
                this.addToSyncQueue('trip', 'create', trip);
            }
            
            return trip;
        } catch (error) {
            console.warn('Failed to save trip to server:', error);
            // Save to localStorage as fallback
            this.saveTripToLocalStorage(trip);
            this.addToSyncQueue('trip', 'create', trip);
            return trip;
        }
    }

    async loadTripsFromServer() {
        try {
            if (!this.isOnline) return;
            
            const response = await fetch(`${this.baseUrl}/trips`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.trips) {
                    // Merge server trips with localStorage trips
                    const localTrips = this.getTripsFromLocalStorage();
                    const allTrips = this.mergeTripData(data.trips, localTrips);
                    this.saveTripsToLocalStorage(allTrips);
                    return allTrips;
                }
            }
        } catch (error) {
            console.warn('Failed to load trips from server:', error);
        }
        
        // Fallback to localStorage
        return this.getTripsFromLocalStorage();
    }

    saveTripToLocalStorage(trip) {
        const trips = this.getTripsFromLocalStorage();
        const existingIndex = trips.findIndex(t => t.id === trip.id);
        
        if (existingIndex >= 0) {
            trips[existingIndex] = trip;
        } else {
            trips.push(trip);
        }
        
        localStorage.setItem('shared_trips', JSON.stringify(trips));
    }

    getTripsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('shared_trips') || '[]');
    }

    saveTripsToLocalStorage(trips) {
        localStorage.setItem('shared_trips', JSON.stringify(trips));
    }

    /**
     * GROUP MANAGEMENT
     */
    
    async saveGroup(groupData) {
        const group = {
            id: groupData.id || this.generateId(),
            ...groupData,
            createdAt: new Date().toISOString(),
            createdBy: this.getCurrentUserId(),
            lastModified: new Date().toISOString()
        };

        try {
            if (this.isOnline) {
                const response = await fetch(`${this.baseUrl}/groups`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(group)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    group.id = result.groupId || group.id;
                }
            }
            
            this.saveGroupToLocalStorage(group);
            
            if (!this.isOnline) {
                this.addToSyncQueue('group', 'create', group);
            }
            
            return group;
        } catch (error) {
            console.warn('Failed to save group to server:', error);
            this.saveGroupToLocalStorage(group);
            this.addToSyncQueue('group', 'create', group);
            return group;
        }
    }

    async loadGroupsFromServer() {
        try {
            if (!this.isOnline) return;
            
            const response = await fetch(`${this.baseUrl}/groups`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.groups) {
                    const localGroups = this.getGroupsFromLocalStorage();
                    const allGroups = this.mergeGroupData(data.groups, localGroups);
                    this.saveGroupsToLocalStorage(allGroups);
                    return allGroups;
                }
            }
        } catch (error) {
            console.warn('Failed to load groups from server:', error);
        }
        
        return this.getGroupsFromLocalStorage();
    }

    saveGroupToLocalStorage(group) {
        const groups = this.getGroupsFromLocalStorage();
        const existingIndex = groups.findIndex(g => g.id === group.id);
        
        if (existingIndex >= 0) {
            groups[existingIndex] = group;
        } else {
            groups.push(group);
        }
        
        localStorage.setItem('shared_groups', JSON.stringify(groups));
    }

    getGroupsFromLocalStorage() {
        return JSON.parse(localStorage.getItem('shared_groups') || '[]');
    }

    saveGroupsToLocalStorage(groups) {
        localStorage.setItem('shared_groups', JSON.stringify(groups));
    }

    /**
     * PROFILE MANAGEMENT
     */
    
    async saveProfile(profileData) {
        const profile = {
            id: profileData.id || this.getCurrentUserId(),
            ...profileData,
            lastModified: new Date().toISOString()
        };

        try {
            if (this.isOnline) {
                const response = await fetch(`${this.baseUrl}/users/${profile.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(profile)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to update profile on server');
                }
            }
            
            this.saveProfileToLocalStorage(profile);
            
            if (!this.isOnline) {
                this.addToSyncQueue('profile', 'update', profile);
            }
            
            return profile;
        } catch (error) {
            console.warn('Failed to save profile to server:', error);
            this.saveProfileToLocalStorage(profile);
            this.addToSyncQueue('profile', 'update', profile);
            return profile;
        }
    }

    async loadProfilesFromServer() {
        try {
            if (!this.isOnline) return;
            
            const response = await fetch(`${this.baseUrl}/users`);
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.users) {
                    const localProfiles = this.getProfilesFromLocalStorage();
                    const allProfiles = this.mergeProfileData(data.users, localProfiles);
                    this.saveProfilesToLocalStorage(allProfiles);
                    return allProfiles;
                }
            }
        } catch (error) {
            console.warn('Failed to load profiles from server:', error);
        }
        
        return this.getProfilesFromLocalStorage();
    }

    saveProfileToLocalStorage(profile) {
        const profiles = this.getProfilesFromLocalStorage();
        const existingIndex = profiles.findIndex(p => p.id === profile.id);
        
        if (existingIndex >= 0) {
            profiles[existingIndex] = profile;
        } else {
            profiles.push(profile);
        }
        
        localStorage.setItem('shared_profiles', JSON.stringify(profiles));
    }

    getProfilesFromLocalStorage() {
        return JSON.parse(localStorage.getItem('shared_profiles') || '[]');
    }

    saveProfilesToLocalStorage(profiles) {
        localStorage.setItem('shared_profiles', JSON.stringify(profiles));
    }

    /**
     * MESSAGE MANAGEMENT
     */
    
    async saveMessage(tripId, messageData) {
        const message = {
            id: this.generateId(),
            tripId,
            ...messageData,
            timestamp: new Date().toISOString(),
            userId: this.getCurrentUserId()
        };

        try {
            if (this.isOnline) {
                const response = await fetch(`${this.baseUrl}/trips/${tripId}/messages`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(message)
                });
                
                if (!response.ok) {
                    throw new Error('Failed to save message to server');
                }
            }
            
            this.saveMessageToLocalStorage(message);
            
            if (!this.isOnline) {
                this.addToSyncQueue('message', 'create', message);
            }
            
            return message;
        } catch (error) {
            console.warn('Failed to save message to server:', error);
            this.saveMessageToLocalStorage(message);
            this.addToSyncQueue('message', 'create', message);
            return message;
        }
    }

    saveMessageToLocalStorage(message) {
        const messages = this.getMessagesFromLocalStorage(message.tripId);
        messages.push(message);
        localStorage.setItem(`shared_messages_${message.tripId}`, JSON.stringify(messages));
    }

    getMessagesFromLocalStorage(tripId) {
        return JSON.parse(localStorage.getItem(`shared_messages_${tripId}`) || '[]');
    }

    /**
     * UTILITY METHODS
     */
    
    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    getCurrentUserId() {
        // Try to get from UA Innovate first
        let userId = localStorage.getItem('uaInnovateUserId');
        if (userId) return userId;
        
        // Try to get from travel page
        userId = localStorage.getItem('travelUserId');
        if (userId) return userId;
        
        // Generate a new user ID if none exists
        userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('travelUserId', userId);
        return userId;
    }

    mergeTripData(serverTrips, localTrips) {
        const merged = [...serverTrips];
        
        localTrips.forEach(localTrip => {
            const existingIndex = merged.findIndex(trip => trip.id === localTrip.id);
            if (existingIndex >= 0) {
                // Use the more recent version
                const serverTrip = merged[existingIndex];
                const localTime = new Date(localTrip.lastModified || localTrip.createdAt);
                const serverTime = new Date(serverTrip.lastModified || serverTrip.createdAt);
                
                if (localTime > serverTime) {
                    merged[existingIndex] = localTrip;
                }
            } else {
                merged.push(localTrip);
            }
        });
        
        return merged;
    }

    mergeGroupData(serverGroups, localGroups) {
        const merged = [...serverGroups];
        
        localGroups.forEach(localGroup => {
            const existingIndex = merged.findIndex(group => group.id === localGroup.id);
            if (existingIndex >= 0) {
                const serverGroup = merged[existingIndex];
                const localTime = new Date(localGroup.lastModified || localGroup.createdAt);
                const serverTime = new Date(serverGroup.lastModified || serverGroup.createdAt);
                
                if (localTime > serverTime) {
                    merged[existingIndex] = localGroup;
                }
            } else {
                merged.push(localGroup);
            }
        });
        
        return merged;
    }

    mergeProfileData(serverProfiles, localProfiles) {
        const merged = [...serverProfiles];
        
        localProfiles.forEach(localProfile => {
            const existingIndex = merged.findIndex(profile => profile.id === localProfile.id);
            if (existingIndex >= 0) {
                const serverProfile = merged[existingIndex];
                const localTime = new Date(localProfile.lastModified || 0);
                const serverTime = new Date(serverProfile.lastModified || 0);
                
                if (localTime > serverTime) {
                    merged[existingIndex] = localProfile;
                }
            } else {
                merged.push(localProfile);
            }
        });
        
        return merged;
    }

    addToSyncQueue(type, action, data) {
        this.syncQueue.push({
            type,
            action,
            data,
            timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }

    async processSyncQueue() {
        if (!this.isOnline || this.syncQueue.length === 0) return;
        
        const queue = [...this.syncQueue];
        this.syncQueue = [];
        
        for (const item of queue) {
            try {
                switch (item.type) {
                    case 'trip':
                        await this.saveTrip(item.data);
                        break;
                    case 'group':
                        await this.saveGroup(item.data);
                        break;
                    case 'profile':
                        await this.saveProfile(item.data);
                        break;
                    case 'message':
                        await this.saveMessage(item.data.tripId, item.data);
                        break;
                }
            } catch (error) {
                console.warn('Failed to sync item:', item, error);
                // Re-add to queue if sync failed
                this.syncQueue.push(item);
            }
        }
        
        localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
    }

    /**
     * Get all shared data for initialization
     */
    getAllSharedData() {
        return {
            trips: this.getTripsFromLocalStorage(),
            groups: this.getGroupsFromLocalStorage(),
            profiles: this.getProfilesFromLocalStorage(),
            syncQueue: JSON.parse(localStorage.getItem('sync_queue') || '[]')
        };
    }
}

// Create global instance
window.sharedDataService = new SharedDataService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedDataService;
}
