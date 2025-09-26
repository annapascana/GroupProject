/**
 * Enhanced Trip Joining with Calendar Sync
 * This file shows how to integrate calendar sync with existing trip joining functionality
 */

/**
 * Enhanced joinTrip function that includes calendar sync
 * This can replace or supplement the existing joinTrip function
 */
function joinTripWithCalendarSync(tripCard) {
    console.log('Joining trip with calendar sync:', tripCard);
    
    try {
        // Extract trip data from the card
        const tripData = extractTripDataFromCard(tripCard);
        
        if (!tripData) {
            console.error('Could not extract trip data from card');
            return false;
        }
        
        console.log('Extracted trip data:', tripData);
        
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
        
        // Continue with existing trip joining logic
        // This would be the existing joinTrip functionality
        // For now, we'll just log that the trip was joined
        console.log('Trip joined successfully:', tripData.destination);
        
        return syncSuccess;
        
    } catch (error) {
        console.error('Error joining trip with calendar sync:', error);
        showToast('Error joining trip', 'error');
        return false;
    }
}

/**
 * Enhanced extractTripDataFromCard function specifically for travel page
 * This extracts data from the travel page's trip card structure
 */
function extractTripDataFromTravelCard(tripCard) {
    try {
        // Get destination from the card
        const destinationElement = tripCard.querySelector('.trip-destination') || 
                                 tripCard.querySelector('h5') || 
                                 tripCard.querySelector('h6');
        const destination = destinationElement?.textContent?.trim() || 
                          tripCard.dataset.destination || 
                          'Unknown Destination';
        
        // Get date from the card
        const dateElement = tripCard.querySelector('.trip-date') || 
                          tripCard.querySelector('[data-date]') ||
                          tripCard.querySelector('p:nth-child(2)'); // Usually the 2nd p element
        let date = dateElement?.textContent || 
                  dateElement?.dataset.date || 
                  new Date().toISOString().split('T')[0];
        
        // Clean up date if it contains "Date:" prefix
        if (date.includes('Date:')) {
            date = date.replace('Date:', '').trim();
        }
        
        // Get time from the card
        const timeElement = tripCard.querySelector('.trip-time') || 
                          tripCard.querySelector('[data-time]');
        const time = timeElement?.textContent || 
                   timeElement?.dataset.time || 
                   '09:00';
        
        // Get description from the card
        const descriptionElement = tripCard.querySelector('.trip-description') || 
                                 tripCard.querySelector('p:nth-child(3)'); // Usually the 3rd p element
        const description = descriptionElement?.textContent?.trim() || 
                          `Travel to ${destination}`;
        
        // Get cost information
        const costElement = tripCard.querySelector('.trip-cost') || 
                          tripCard.querySelector('[data-cost]');
        const cost = costElement?.textContent || 
                   costElement?.dataset.cost || 
                   '';
        
        // Get participants count
        const participantsElement = tripCard.querySelector('.trip-participants') || 
                                 tripCard.querySelector('[data-participants]');
        const participants = participantsElement?.textContent || 
                           participantsElement?.dataset.participants || 
                           '1';
        
        return {
            destination: destination,
            date: date,
            time: time,
            description: description,
            duration: '1 day',
            participants: [participants],
            cost: cost,
            source: 'travel'
        };
    } catch (error) {
        console.error('Error extracting trip data from travel card:', error);
        return null;
    }
}

/**
 * Example of how to integrate with existing trip card click handlers
 * This function can be called when a trip card is clicked
 */
function handleTripCardClick(tripCard) {
    console.log('Trip card clicked:', tripCard);
    
    // Check if this is a join action
    const joinButton = tripCard.querySelector('.join-trip-btn') || 
                     tripCard.querySelector('[onclick*="joinTrip"]');
    
    if (joinButton) {
        // This is a join action, sync to calendar
        joinTripWithCalendarSync(tripCard);
    } else {
        // This is a view action, just show details
        console.log('Showing trip details');
        // Existing trip details logic would go here
    }
}

/**
 * Initialize calendar sync for existing trip cards
 * This function can be called when the page loads to add calendar sync to existing trip cards
 */
function initializeCalendarSyncForTrips() {
    console.log('Initializing calendar sync for trips');
    
    // Find all trip cards
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        // Add click handler for calendar sync
        card.addEventListener('click', function(e) {
            // Only handle if it's not a button click
            if (!e.target.closest('button')) {
                handleTripCardClick(this);
            }
        });
        
        // Add calendar sync to join buttons
        const joinButtons = card.querySelectorAll('.join-trip-btn, [onclick*="joinTrip"]');
        joinButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                joinTripWithCalendarSync(card);
            });
        });
    });
    
    console.log(`Initialized calendar sync for ${tripCards.length} trip cards`);
}

/**
 * Show a toast notification
 * This integrates with the existing toast system
 */
function showToast(message, type = 'info') {
    // Try to use existing toast system if available
    if (typeof window.showToast === 'function') {
        window.showToast(message, type);
        return;
    }
    
    // Fallback to console log if no toast system available
    console.log(`Toast (${type}): ${message}`);
}

// Initialize calendar sync when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the page to fully load
    setTimeout(() => {
        initializeCalendarSyncForTrips();
    }, 1000);
});

// Make functions available globally
window.joinTripWithCalendarSync = joinTripWithCalendarSync;
window.extractTripDataFromTravelCard = extractTripDataFromTravelCard;
window.handleTripCardClick = handleTripCardClick;
window.initializeCalendarSyncForTrips = initializeCalendarSyncForTrips;
