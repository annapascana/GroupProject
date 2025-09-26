/**
 * Event Sync Helper - Universal functions for syncing events to dashboard calendar
 * This file provides easy-to-use functions that any page can call to sync events
 */

/**
 * Sync a trip event to the dashboard calendar
 * Call this when a user joins a trip
 * @param {Object} tripData - Trip data object
 */
function syncTripToCalendar(tripData) {
    if (typeof window.sharedDataService === 'undefined') {
        console.warn('SharedDataService not available');
        return false;
    }
    
    try {
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
        
        const result = window.sharedDataService.syncTripToCalendar(eventData);
        console.log('Trip synced to calendar:', result);
        return true;
    } catch (error) {
        console.error('Error syncing trip to calendar:', error);
        return false;
    }
}

/**
 * Sync a group event to the dashboard calendar
 * Call this when a user joins a group
 * @param {Object} groupData - Group data object
 */
function syncGroupToCalendar(groupData) {
    if (typeof window.sharedDataService === 'undefined') {
        console.warn('SharedDataService not available');
        return false;
    }
    
    try {
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
        
        const result = window.sharedDataService.syncGroupToCalendar(eventData);
        console.log('Group synced to calendar:', result);
        return true;
    } catch (error) {
        console.error('Error syncing group to calendar:', error);
        return false;
    }
}

/**
 * Sync a collaboration event to the dashboard calendar
 * Call this when a user joins a collaboration
 * @param {Object} collabData - Collaboration data object
 */
function syncCollaborationToCalendar(collabData) {
    if (typeof window.sharedDataService === 'undefined') {
        console.warn('SharedDataService not available');
        return false;
    }
    
    try {
        const eventData = {
            title: collabData.title,
            date: collabData.date,
            time: collabData.time || '10:00',
            description: collabData.description || `Collaboration session: ${collabData.title}`,
            collaborationCode: collabData.collaborationCode || '',
            location: collabData.location || 'Online',
            duration: collabData.duration || '1 hour',
            participants: collabData.participants || [],
            source: 'collaboration'
        };
        
        const result = window.sharedDataService.syncEventToCalendar('collaboration', eventData);
        console.log('Collaboration synced to calendar:', result);
        return true;
    } catch (error) {
        console.error('Error syncing collaboration to calendar:', error);
        return false;
    }
}

/**
 * Universal function to sync any event to the dashboard calendar
 * @param {string} eventType - Type of event (trip, group, collaboration, etc.)
 * @param {Object} eventData - Event data object
 */
function syncEventToCalendar(eventType, eventData) {
    if (typeof window.sharedDataService === 'undefined') {
        console.warn('SharedDataService not available');
        return false;
    }
    
    try {
        const result = window.sharedDataService.syncEventToCalendar(eventType, eventData);
        console.log(`${eventType} event synced to calendar:`, result);
        return true;
    } catch (error) {
        console.error(`Error syncing ${eventType} event to calendar:`, error);
        return false;
    }
}

/**
 * Example function for travel page integration
 * This shows how to integrate with existing trip joining functionality
 */
function joinTripWithCalendarSync(tripCard) {
    // Extract trip data from the trip card
    const tripData = extractTripDataFromCard(tripCard);
    
    if (!tripData) {
        console.error('Could not extract trip data from card');
        return false;
    }
    
    // Sync to calendar
    const syncSuccess = syncTripToCalendar(tripData);
    
    if (syncSuccess) {
        console.log('Trip successfully synced to calendar');
        // Show success message
        showToast('Trip added to your calendar!', 'success');
    } else {
        console.warn('Failed to sync trip to calendar');
        // Show warning message
        showToast('Trip joined, but failed to add to calendar', 'warning');
    }
    
    return syncSuccess;
}

/**
 * Helper function to extract trip data from a trip card element
 * This is a template function that should be customized for each page
 */
function extractTripDataFromCard(tripCard) {
    try {
        // This is a template - customize based on your trip card structure
        const destination = tripCard.querySelector('.trip-destination')?.textContent || 
                          tripCard.dataset.destination || 'Unknown Destination';
        
        const dateElement = tripCard.querySelector('.trip-date') || 
                          tripCard.querySelector('[data-date]');
        const date = dateElement?.textContent || 
                   dateElement?.dataset.date || 
                   new Date().toISOString().split('T')[0];
        
        const timeElement = tripCard.querySelector('.trip-time') || 
                          tripCard.querySelector('[data-time]');
        const time = timeElement?.textContent || 
                   timeElement?.dataset.time || 
                   '09:00';
        
        const descriptionElement = tripCard.querySelector('.trip-description');
        const description = descriptionElement?.textContent || 
                          `Travel to ${destination}`;
        
        return {
            destination: destination,
            date: date,
            time: time,
            description: description,
            duration: '1 day',
            participants: [],
            cost: '',
            source: 'travel'
        };
    } catch (error) {
        console.error('Error extracting trip data from card:', error);
        return null;
    }
}

/**
 * Show a toast notification
 * This is a helper function that can be customized for each page
 */
function showToast(message, type = 'info') {
    // Try to use existing toast system if available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback to alert if no toast system available
    console.log(`Toast (${type}): ${message}`);
    alert(message);
}

// Make functions available globally
window.syncTripToCalendar = syncTripToCalendar;
window.syncGroupToCalendar = syncGroupToCalendar;
window.syncCollaborationToCalendar = syncCollaborationToCalendar;
window.syncEventToCalendar = syncEventToCalendar;
window.joinTripWithCalendarSync = joinTripWithCalendarSync;
window.extractTripDataFromCard = extractTripDataFromCard;
