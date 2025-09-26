/**
 * Shared Data Service for Cross-Page Communication
 * Handles calendar events, user activities, and other shared data
 */
class SharedDataService {
    constructor() {
        this.storageKey = 'crimsonCollabSharedData';
        this.eventListeners = new Map();
        this.init();
    }

    init() {
        // Initialize shared data structure if it doesn't exist
        if (!localStorage.getItem(this.storageKey)) {
            const initialData = {
                pendingCalendarEvents: [],
                userActivities: [],
                lastSync: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(initialData));
        }
    }

    /**
     * Add a calendar event that will be synced to the dashboard
     * @param {Object} eventData - Event data to add to calendar
     */
    addCalendarEvent(eventData) {
        const sharedData = this.getSharedData();
        
        // Create event with unique ID and timestamp
        const calendarEvent = {
            id: Date.now().toString(),
            title: eventData.title,
            date: eventData.date,
            time: eventData.time,
            type: eventData.type || 'collaboration',
            description: eventData.description || '',
            source: eventData.source || 'collaboration',
            collaborationCode: eventData.collaborationCode || '',
            location: eventData.location || '',
            duration: eventData.duration || '',
            participants: eventData.participants || [],
            cost: eventData.cost || '',
            status: eventData.status || 'confirmed',
            createdAt: new Date().toISOString(),
            syncStatus: 'pending' // Will be processed by dashboard
        };

        sharedData.pendingCalendarEvents.push(calendarEvent);
        this.saveSharedData(sharedData);
        
        // Trigger event listeners
        this.triggerEvent('calendarEventAdded', calendarEvent);
        
        console.log('Calendar event added to shared data:', calendarEvent);
        return calendarEvent;
    }

    /**
     * Add a trip event to the calendar (specific for travel page)
     * @param {Object} tripData - Trip data to add to calendar
     */
    addTripEvent(tripData) {
        const eventData = {
            title: `Trip to ${tripData.destination}`,
            date: tripData.date,
            time: tripData.time || '09:00',
            type: 'trip',
            description: tripData.description || `Travel to ${tripData.destination}`,
            source: 'travel',
            location: tripData.destination,
            duration: tripData.duration || '1 day',
            participants: tripData.participants || [],
            cost: tripData.cost || '',
            status: 'confirmed'
        };
        
        return this.addCalendarEvent(eventData);
    }

    /**
     * Add a group event to the calendar (specific for groups)
     * @param {Object} groupData - Group data to add to calendar
     */
    addGroupEvent(groupData) {
        const eventData = {
            title: `Group: ${groupData.name}`,
            date: groupData.date,
            time: groupData.time || '19:00',
            type: 'group',
            description: groupData.description || `Group meeting: ${groupData.name}`,
            source: 'groups',
            location: groupData.location || 'TBD',
            duration: groupData.duration || '2 hours',
            participants: groupData.members || [],
            status: 'confirmed'
        };
        
        return this.addCalendarEvent(eventData);
    }

    /**
     * Add a collaboration event to the calendar (specific for collaboration page)
     * @param {Object} collabData - Collaboration data to add to calendar
     */
    addCollaborationEvent(collabData) {
        const eventData = {
            title: `Collaboration: ${collabData.title}`,
            date: collabData.date,
            time: collabData.time || '10:00',
            type: 'collaboration',
            description: collabData.description || `Collaboration session: ${collabData.title}`,
            source: 'collaboration',
            collaborationCode: collabData.collaborationCode || '',
            location: collabData.location || 'Online',
            duration: collabData.duration || '1 hour',
            participants: collabData.participants || [],
            status: 'confirmed'
        };
        
        return this.addCalendarEvent(eventData);
    }

    /**
     * Get all pending calendar events
     * @returns {Array} Array of pending calendar events
     */
    getPendingCalendarEvents() {
        const sharedData = this.getSharedData();
        return sharedData.pendingCalendarEvents || [];
    }

    /**
     * Mark calendar events as processed (moved to user's calendar)
     * @param {Array} eventIds - Array of event IDs to mark as processed
     */
    markCalendarEventsProcessed(eventIds) {
        const sharedData = this.getSharedData();
        sharedData.pendingCalendarEvents = sharedData.pendingCalendarEvents.filter(
            event => !eventIds.includes(event.id)
        );
        this.saveSharedData(sharedData);
        
        console.log('Calendar events marked as processed:', eventIds);
    }

    /**
     * Add user activity that will be synced to the dashboard
     * @param {Object} activityData - Activity data to add
     */
    addUserActivity(activityData) {
        const sharedData = this.getSharedData();
        
        const activity = {
            id: Date.now().toString(),
            type: activityData.type,
            title: activityData.title,
            description: activityData.description,
            time: new Date(),
            icon: activityData.icon || 'bi-activity',
            collaborationCode: activityData.collaborationCode || '',
            source: activityData.source || 'collaboration',
            status: 'pending'
        };

        sharedData.userActivities.push(activity);
        
        // Keep only last 100 activities
        if (sharedData.userActivities.length > 100) {
            sharedData.userActivities = sharedData.userActivities.slice(-100);
        }
        
        this.saveSharedData(sharedData);
        
        // Trigger event listeners
        this.triggerEvent('activityAdded', activity);
        
        console.log('User activity added to shared data:', activity);
        return activity;
    }

    /**
     * Get all pending user activities
     * @returns {Array} Array of pending user activities
     */
    getPendingUserActivities() {
        const sharedData = this.getSharedData();
        return sharedData.userActivities || [];
    }

    /**
     * Mark user activities as processed
     * @param {Array} activityIds - Array of activity IDs to mark as processed
     */
    markUserActivitiesProcessed(activityIds) {
        const sharedData = this.getSharedData();
        sharedData.userActivities = sharedData.userActivities.filter(
            activity => !activityIds.includes(activity.id)
        );
        this.saveSharedData(sharedData);
        
        console.log('User activities marked as processed:', activityIds);
    }

    /**
     * Get shared data from localStorage
     * @returns {Object} Shared data object
     */
    getSharedData() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { pendingCalendarEvents: [], userActivities: [] };
        } catch (error) {
            console.error('Error reading shared data:', error);
            return { pendingCalendarEvents: [], userActivities: [] };
        }
    }

    /**
     * Save shared data to localStorage
     * @param {Object} data - Data to save
     */
    saveSharedData(data) {
        try {
            data.lastSync = new Date().toISOString();
            localStorage.setItem(this.storageKey, JSON.stringify(data));
        } catch (error) {
            console.error('Error saving shared data:', error);
        }
    }

    /**
     * Add event listener for shared data changes
     * @param {string} eventName - Name of the event to listen for
     * @param {Function} callback - Callback function
     */
    addEventListener(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    /**
     * Remove event listener
     * @param {string} eventName - Name of the event
     * @param {Function} callback - Callback function to remove
     */
    removeEventListener(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            const listeners = this.eventListeners.get(eventName);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Trigger event listeners
     * @param {string} eventName - Name of the event
     * @param {*} data - Data to pass to listeners
     */
    triggerEvent(eventName, data) {
        if (this.eventListeners.has(eventName)) {
            this.eventListeners.get(eventName).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Error in event listener:', error);
                }
            });
        }
    }

    /**
     * Clear all shared data (useful for testing or reset)
     */
    clearAllData() {
        localStorage.removeItem(this.storageKey);
        this.init();
        console.log('All shared data cleared');
    }

    /**
     * Get data summary for debugging
     * @returns {Object} Summary of current shared data
     */
    getDataSummary() {
        const data = this.getSharedData();
        return {
            pendingCalendarEvents: data.pendingCalendarEvents.length,
            userActivities: data.userActivities.length,
            lastSync: data.lastSync
        };
    }

    /**
     * Get trips from localStorage (for travel page compatibility)
     */
    getTripsFromLocalStorage() {
        try {
            const trips = localStorage.getItem('crimsonCollabTrips');
            return trips ? JSON.parse(trips) : [];
        } catch (error) {
            console.error('Error getting trips from localStorage:', error);
            return [];
        }
    }

    /**
     * Save trip to localStorage (for travel page compatibility)
     */
    saveTrip(tripData) {
        try {
            const trips = this.getTripsFromLocalStorage();
            trips.push(tripData);
            localStorage.setItem('crimsonCollabTrips', JSON.stringify(trips));
            return true;
        } catch (error) {
            console.error('Error saving trip:', error);
            return false;
        }
    }

    /**
     * Save group to localStorage
     */
    saveGroup(groupData) {
        try {
            const groups = JSON.parse(localStorage.getItem('crimsonCollabGroups') || '[]');
            groups.push(groupData);
            localStorage.setItem('crimsonCollabGroups', JSON.stringify(groups));
            return true;
        } catch (error) {
            console.error('Error saving group:', error);
            return false;
        }
    }

    /**
     * Save profile to localStorage
     */
    saveProfile(profileData) {
        try {
            const profiles = JSON.parse(localStorage.getItem('crimsonCollabProfiles') || '[]');
            profiles.push(profileData);
            localStorage.setItem('crimsonCollabProfiles', JSON.stringify(profiles));
            return true;
        } catch (error) {
            console.error('Error saving profile:', error);
            return false;
        }
    }

    /**
     * Save message to localStorage
     */
    saveMessage(tripId, messageData) {
        try {
            const messages = JSON.parse(localStorage.getItem('crimsonCollabMessages') || '[]');
            
            // Add tripId to message data if not already present
            const messageWithTripId = {
                ...messageData,
                tripId: tripId,
                timestamp: new Date().toISOString()
            };
            
            messages.push(messageWithTripId);
            localStorage.setItem('crimsonCollabMessages', JSON.stringify(messages));
            return true;
        } catch (error) {
            console.error('Error saving message:', error);
            return false;
        }
    }

    /**
     * Get all shared data
     */
    getAllSharedData() {
        return {
            trips: this.getTripsFromLocalStorage(),
            groups: JSON.parse(localStorage.getItem('crimsonCollabGroups') || '[]'),
            profiles: JSON.parse(localStorage.getItem('crimsonCollabProfiles') || '[]'),
            messages: JSON.parse(localStorage.getItem('crimsonCollabMessages') || '[]'),
            calendarEvents: this.getSharedData().pendingCalendarEvents,
            activities: this.getSharedData().userActivities
        };
    }

    /**
     * Get groups from localStorage
     */
    getGroupsFromLocalStorage() {
        try {
            const groups = localStorage.getItem('crimsonCollabGroups');
            return groups ? JSON.parse(groups) : [];
        } catch (error) {
            console.error('Error getting groups from localStorage:', error);
            return [];
        }
    }

    /**
     * Get profiles from localStorage
     */
    getProfilesFromLocalStorage() {
        try {
            const profiles = localStorage.getItem('crimsonCollabProfiles');
            return profiles ? JSON.parse(profiles) : [];
        } catch (error) {
            console.error('Error getting profiles from localStorage:', error);
            return [];
        }
    }

    /**
     * Get messages from localStorage
     */
    getMessagesFromLocalStorage(tripId = null) {
        try {
            const messages = localStorage.getItem('crimsonCollabMessages');
            const allMessages = messages ? JSON.parse(messages) : [];
            
            // If tripId is provided, filter messages for that trip
            if (tripId) {
                return allMessages.filter(message => message.tripId === tripId);
            }
            
            return allMessages;
        } catch (error) {
            console.error('Error getting messages from localStorage:', error);
            return [];
        }
    }

    /**
     * Process sync queue (placeholder for future implementation)
     */
    processSyncQueue() {
        // This would handle syncing data between different users/sessions
        // For now, just return success
        return true;
    }

    /**
     * Universal function to sync any event to the dashboard calendar
     * This can be called from any page when a user joins/signs up for something
     * @param {string} eventType - Type of event (trip, group, collaboration, etc.)
     * @param {Object} eventData - Event data
     */
    syncEventToCalendar(eventType, eventData) {
        console.log(`Syncing ${eventType} event to calendar:`, eventData);
        
        switch (eventType.toLowerCase()) {
            case 'trip':
                return this.addTripEvent(eventData);
            case 'group':
                return this.addGroupEvent(eventData);
            case 'collaboration':
                return this.addCollaborationEvent(eventData);
            default:
                // Generic event
                return this.addCalendarEvent({
                    title: eventData.title || eventData.name,
                    date: eventData.date,
                    time: eventData.time || '09:00',
                    type: eventType,
                    description: eventData.description || '',
                    source: eventData.source || eventType,
                    location: eventData.location || eventData.destination || '',
                    duration: eventData.duration || '',
                    participants: eventData.participants || eventData.members || [],
                    cost: eventData.cost || '',
                    status: 'confirmed'
                });
        }
    }

    /**
     * Helper function for travel page to sync trip events
     * @param {Object} tripData - Trip data from travel page
     */
    syncTripToCalendar(tripData) {
        const eventData = {
            destination: tripData.destination,
            date: tripData.date,
            time: tripData.time || '09:00',
            description: tripData.description || `Travel to ${tripData.destination}`,
            duration: tripData.duration || '1 day',
            participants: tripData.participants || [],
            cost: tripData.cost || '',
            source: 'travel'
        };
        
        return this.addTripEvent(eventData);
    }

    /**
     * Helper function for groups page to sync group events
     * @param {Object} groupData - Group data from groups page
     */
    syncGroupToCalendar(groupData) {
        const eventData = {
            name: groupData.name,
            date: groupData.date,
            time: groupData.time || '19:00',
            description: groupData.description || `Group meeting: ${groupData.name}`,
            location: groupData.location || 'TBD',
            duration: groupData.duration || '2 hours',
            members: groupData.members || [],
            source: 'groups'
        };
        
        return this.addGroupEvent(eventData);
    }
}

// Create global instance
window.sharedDataService = new SharedDataService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SharedDataService;
}
