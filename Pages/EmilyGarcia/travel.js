// Travel Buddy JavaScript Functionality

document.addEventListener('DOMContentLoaded', function() {
    console.log('Travel Buddy page loaded successfully!');
    
    // Initialize the application
    initializeTravelApp();
});

function initializeTravelApp() {
    // Set up event listeners
    setupSearchFunctionality();
    setupFilterFunctionality();
    setupCreateTripFunctionality();
    setupJoinTripFunctionality();
    
    // Calculate initial gas costs
    updateAllGasCosts();
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    
    searchInput.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        filterTrips(searchTerm);
    });
}

// Filter functionality
function setupFilterFunctionality() {
    const tripTypeFilter = document.getElementById('tripTypeFilter');
    
    tripTypeFilter.addEventListener('change', function() {
        const selectedType = this.value;
        filterTripsByType(selectedType);
    });
}

// Filter trips based on search term
function filterTrips(searchTerm) {
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        const destination = card.querySelector('.trip-details p:first-child').textContent.toLowerCase();
        const tripType = card.querySelector('.trip-header h5').textContent.toLowerCase();
        const creator = card.querySelector('.trip-creator').textContent.toLowerCase();
        
        const matchesSearch = destination.includes(searchTerm) || 
                           tripType.includes(searchTerm) || 
                           creator.includes(searchTerm);
        
        card.style.display = matchesSearch ? 'block' : 'none';
    });
    
    updateResultsCount();
}

// Filter trips by type
function filterTripsByType(type) {
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        const cardType = card.getAttribute('data-type');
        
        if (type === 'all' || cardType === type) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    updateResultsCount();
}

// Update results count
function updateResultsCount() {
    const visibleCards = document.querySelectorAll('.trip-card[style*="block"], .trip-card:not([style*="none"])');
    const count = visibleCards.length;
    
    // You could add a results counter element to display this
    console.log(`${count} trips found`);
}

// Create trip functionality
function setupCreateTripFunctionality() {
    const createTripBtn = document.getElementById('createTripBtn');
    const createTripForm = document.getElementById('createTripForm');
    
    createTripBtn.addEventListener('click', function() {
        if (validateTripForm()) {
            createNewTrip();
        }
    });
    
    // Auto-calculate gas cost per person
    const gasCostInput = document.getElementById('gasCost');
    const totalSeatsInput = document.getElementById('totalSeats');
    
    [gasCostInput, totalSeatsInput].forEach(input => {
        input.addEventListener('input', updateGasCostPreview);
    });
}

// Validate trip form
function validateTripForm() {
    const requiredFields = ['tripType', 'destination', 'tripDate', 'tripTime', 'totalSeats', 'gasCost'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });
    
    return isValid;
}

// Update gas cost preview
function updateGasCostPreview() {
    const gasCost = parseFloat(document.getElementById('gasCost').value) || 0;
    const totalSeats = parseInt(document.getElementById('totalSeats').value) || 1;
    
    const costPerPerson = gasCost / totalSeats;
    
    // Update preview if element exists
    const previewElement = document.getElementById('gasCostPreview');
    if (previewElement) {
        previewElement.textContent = `$${costPerPerson.toFixed(2)} per person`;
    }
}

// Create new trip
function createNewTrip() {
    const formData = {
        type: document.getElementById('tripType').value,
        destination: document.getElementById('destination').value,
        date: document.getElementById('tripDate').value,
        time: document.getElementById('tripTime').value,
        totalSeats: parseInt(document.getElementById('totalSeats').value),
        gasCost: parseFloat(document.getElementById('gasCost').value),
        notes: document.getElementById('tripNotes').value
    };
    
    // Create new trip card
    const newTripCard = createTripCard(formData);
    
    // Add to grid
    const tripsGrid = document.getElementById('tripsGrid');
    tripsGrid.insertBefore(newTripCard, tripsGrid.firstChild);
    
    // Add animation class
    newTripCard.classList.add('new-trip');
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('createTripModal'));
    modal.hide();
    
    // Reset form
    document.getElementById('createTripForm').reset();
    
    // Show success message
    showNotification('Trip created successfully!', 'success');
}

// Create trip card element
function createTripCard(tripData) {
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.setAttribute('data-type', tripData.type);
    card.setAttribute('data-destination', tripData.destination);
    
    const costPerPerson = tripData.gasCost / tripData.totalSeats;
    const availableSeats = tripData.totalSeats - 1; // Creator takes one seat
    
    const typeIcons = {
        'airport': 'bi-airplane-fill',
        'home': 'bi-house-fill',
        'weekend': 'bi-geo-alt-fill',
        'other': 'bi-car-front-fill'
    };
    
    const typeLabels = {
        'airport': 'Airport Trip',
        'home': 'Trip Home',
        'weekend': 'Weekend Trip',
        'other': 'Other Trip'
    };
    
    card.innerHTML = `
        <div class="trip-header">
            <h5><i class="bi ${typeIcons[tripData.type]}"></i> ${typeLabels[tripData.type]}</h5>
            <span class="badge bg-primary">Open</span>
        </div>
        <div class="trip-details">
            <p><strong>Destination:</strong> ${tripData.destination}</p>
            <p><strong>Date:</strong> ${formatDate(tripData.date)}</p>
            <p><strong>Time:</strong> ${formatTime(tripData.time)}</p>
            <p><strong>Seats Available:</strong> ${availableSeats}/${tripData.totalSeats}</p>
            <p class="cost-highlight"><strong>Gas Cost per Person:</strong> $${costPerPerson.toFixed(2)}</p>
            ${tripData.notes ? `<p><strong>Notes:</strong> ${tripData.notes}</p>` : ''}
        </div>
        <div class="trip-footer">
            <button class="btn btn-success btn-sm join-trip-btn">Join Trip</button>
            <span class="trip-creator">Created by: You</span>
        </div>
    `;
    
    return card;
}

// Setup join trip functionality
function setupJoinTripFunctionality() {
    // Use event delegation for dynamically created buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('join-trip-btn')) {
            joinTrip(e.target);
        }
    });
}

// Join trip functionality
function joinTrip(button) {
    const tripCard = button.closest('.trip-card');
    const seatsInfo = tripCard.querySelector('.trip-details p:nth-child(4)');
    const seatsText = seatsInfo.textContent;
    const currentSeats = parseInt(seatsText.match(/(\d+)\/\d+/)[1]);
    const totalSeats = parseInt(seatsText.match(/\d+\/(\d+)/)[1]);
    
    if (currentSeats > 0) {
        const newSeats = currentSeats - 1;
        seatsInfo.innerHTML = `<strong>Seats Available:</strong> ${newSeats}/${totalSeats}`;
        
        if (newSeats === 0) {
            button.textContent = 'Trip Full';
            button.classList.remove('btn-success');
            button.classList.add('btn-secondary');
            button.disabled = true;
            
            // Update badge
            const badge = tripCard.querySelector('.badge');
            badge.textContent = 'Full';
            badge.classList.remove('bg-primary');
            badge.classList.add('bg-danger');
        }
        
        showNotification('Successfully joined the trip!', 'success');
    } else {
        showNotification('This trip is already full!', 'error');
    }
}

// Update all gas costs (for existing trips)
function updateAllGasCosts() {
    const tripCards = document.querySelectorAll('.trip-card');
    
    tripCards.forEach(card => {
        const seatsInfo = card.querySelector('.trip-details p:nth-child(4)');
        const costInfo = card.querySelector('.trip-details p:nth-child(5)');
        
        if (seatsInfo && costInfo) {
            const seatsText = seatsInfo.textContent;
            const totalSeats = parseInt(seatsText.match(/\d+\/(\d+)/)[1]);
            const costText = costInfo.textContent;
            const totalCost = parseFloat(costText.match(/\$([\d.]+)/)[1]);
            
            const costPerPerson = totalCost / totalSeats;
            costInfo.innerHTML = `<strong>Gas Cost per Person:</strong> $${costPerPerson.toFixed(2)}`;
        }
    });
}

// Utility functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Export functions for potential external use
window.TravelBuddy = {
    createTrip: createNewTrip,
    joinTrip: joinTrip,
    filterTrips: filterTrips,
    updateGasCosts: updateAllGasCosts
};
