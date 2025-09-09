document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

// Enhanced utility functions
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

// Throttle function for performance optimization
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Enhanced DOM query caching
const domCache = new Map();
function getCachedElement(id) {
    if (!domCache.has(id)) {
        domCache.set(id, document.getElementById(id));
    }
    return domCache.get(id);
}

// Performance monitoring
const performanceMonitor = {
    start: (label) => {
        console.time(label);
    },
    end: (label) => {
        console.timeEnd(label);
    }
};

// Loading skeleton functions
function showLoadingSkeleton() {
    const grids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
    grids.forEach(gridId => {
        const grid = getCachedElement(gridId);
        if (grid && grid.children.length === 0) {
            grid.innerHTML = `
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-card"></div>
                <div class="skeleton skeleton-card"></div>
            `;
        }
    });
}

function hideLoadingSkeleton() {
    const grids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
    grids.forEach(gridId => {
        const grid = getCachedElement(gridId);
        if (grid) {
            const skeletons = grid.querySelectorAll('.skeleton');
            skeletons.forEach(skeleton => skeleton.remove());
        }
    });
}

// User profile functions
function loadUserProfile() {
    try {
        // Check if userManager is available
        if (typeof UserManager !== 'undefined') {
            const userManager = new UserManager();
            const currentUser = userManager.getCurrentUser();
            
            if (currentUser) {
                updateProfileDisplay(currentUser);
            } else {
                // No user logged in, show default
                updateProfileDisplay({
                    firstName: 'Guest',
                    lastName: 'User',
                    email: 'guest@ua.edu'
                });
            }
        } else {
            // Fallback if UserManager is not available
            updateProfileDisplay({
                firstName: 'Student',
                lastName: '',
                email: 'student@ua.edu'
            });
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        // Fallback display
        updateProfileDisplay({
            firstName: 'Student',
            lastName: '',
            email: 'student@ua.edu'
        });
    }
}

function updateProfileDisplay(user) {
    const profileName = getCachedElement('profileName');
    const profileEmail = getCachedElement('profileEmail');
    
    if (profileName) {
        const displayName = user.lastName ? `${user.firstName} ${user.lastName}` : user.firstName;
        profileName.textContent = displayName;
    }
    
    if (profileEmail) {
        profileEmail.textContent = user.email;
    }
}

// Toast Notification System
function showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toastId = 'toast-' + Date.now();
    const iconMap = {
        success: 'bi-check-circle-fill',
        error: 'bi-exclamation-triangle-fill',
        warning: 'bi-exclamation-circle-fill',
        info: 'bi-info-circle-fill'
    };

    const toastHTML = `
        <div class="toast custom-toast ${type}" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <i class="bi ${iconMap[type] || iconMap.info} me-2"></i>
                <strong class="me-auto">${getToastTitle(type)}</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHTML);
    
    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: duration
    });

    toast.show();

    // Remove the toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });

    return toast;
}

function getToastTitle(type) {
    const titles = {
        success: 'Success',
        error: 'Error',
        warning: 'Warning',
        info: 'Information'
    };
    return titles[type] || 'Information';
}

// Convenience functions for different toast types
function showSuccessToast(message, duration = 4000) {
    return showToast(message, 'success', duration);
}

function showErrorToast(message, duration = 6000) {
    return showToast(message, 'error', duration);
}

function showWarningToast(message, duration = 5000) {
    return showToast(message, 'warning', duration);
}

function showInfoToast(message, duration = 4000) {
    return showToast(message, 'info', duration);
}

// Custom Confirmation Dialog
function showConfirmDialog(message, title = 'Confirm Action', confirmText = 'Yes', cancelText = 'No') {
    console.log('showConfirmDialog called with:', message, title);
    return new Promise((resolve) => {
        const confirmId = 'confirm-' + Date.now();
        
        // Create modal backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop show';
        backdrop.style.zIndex = '9998';
        document.body.appendChild(backdrop);
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'modal show';
        modal.id = confirmId;
        modal.style.display = 'block';
        modal.style.zIndex = '9999';
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${confirmId}-title`);
        
        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="${confirmId}-title">
                            <i class="bi bi-question-circle-fill me-2"></i>
                            ${title}
                        </h5>
                    </div>
                    <div class="modal-body">
                        <p class="mb-3">${message}</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-outline-secondary" id="confirmCancel-${confirmId}">
                            ${cancelText}
                        </button>
                        <button type="button" class="btn btn-primary" id="confirmOk-${confirmId}">
                            ${confirmText}
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        console.log('Confirmation modal added');
        
        const cancelBtn = document.getElementById(`confirmCancel-${confirmId}`);
        const okBtn = document.getElementById(`confirmOk-${confirmId}`);

        if (!cancelBtn || !okBtn) {
            console.error('Failed to create confirmation dialog elements');
            resolve(false);
            return;
        }

        const cleanup = () => {
            if (modal && modal.parentNode) {
                modal.remove();
            }
            if (backdrop && backdrop.parentNode) {
                backdrop.remove();
            }
        };

        const handleCancel = () => {
            console.log('Cancel button clicked');
            cleanup();
            resolve(false);
        };

        const handleConfirm = () => {
            console.log('OK button clicked');
            cleanup();
            resolve(true);
        };

        // Add event listeners
        cancelBtn.addEventListener('click', handleCancel);
        okBtn.addEventListener('click', handleConfirm);
        
        // Handle backdrop click
        backdrop.addEventListener('click', handleCancel);
        
        // Handle escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        // Auto-hide after 30 seconds
        setTimeout(() => {
            if (document.getElementById(confirmId)) {
                console.log('Confirmation dialog auto-hiding');
                cleanup();
                document.removeEventListener('keydown', handleEscape);
                resolve(false);
            }
        }, 30000);
    });
}

function setupAutoUpdates() {
    // Update counts every 30 seconds
    setInterval(() => {
        updateResultsCount();
        updateTabBadges();
        updateHeaderStats();
        updateEmptyStates();
    }, 30000);
    
    // Update counts when tab changes
    const tabButtons = document.querySelectorAll('[data-bs-toggle="tab"]');
    tabButtons.forEach(button => {
        button.addEventListener('shown.bs.tab', () => {
            updateResultsCount();
            updateTabBadges();
            updateHeaderStats();
            updateEmptyStates();
        });
    });
    
    // Update counts when trips are modified (using MutationObserver)
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && 
                (mutation.target.id === 'tripsGrid' || 
                 mutation.target.id === 'myTripsGrid' || 
                 mutation.target.id === 'fullTripsGrid' || 
                 mutation.target.id === 'pastTripsGrid')) {
                shouldUpdate = true;
            }
        });
        
        if (shouldUpdate) {
            // Debounce updates to avoid excessive calls
            clearTimeout(window.updateTimeout);
            window.updateTimeout = setTimeout(() => {
                updateResultsCount();
                updateTabBadges();
                updateHeaderStats();
                updateEmptyStates();
            }, 100);
        }
    });
    
    // Observe all trip grids
    const grids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
    grids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            observer.observe(grid, { childList: true, subtree: true });
        }
    });
}

function initializeApp() {
    setupSearch();
    setupFilter();
    setupCreateTrip();
    setupJoinLeave();
    setupRefresh();
    loadUserProfile();
    
    // Clear only example trips cache, keep joined trips data
    localStorage.removeItem('example_trips_loaded');
    localStorage.removeItem('example_trips');
    
    // Clear any existing duplicates first
    clearDuplicates();
    
    loadTrips();
    restoreJoinedTrips();
    clearDuplicates(); // Clear duplicates again after loading
    updateEmptyStates();
}


function setupSearch() {
    const input = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    
    input.addEventListener('input', debounce(() => {
        const query = input.value.toLowerCase();
        filterTrips(query);
        
        // Show/hide clear button
        if (clearSearchBtn) {
            clearSearchBtn.style.display = query ? 'block' : 'none';
        }
        
        // Update filter tags
        updateFilterTags();
    }, 300));
    
    // Clear search functionality
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            input.value = '';
            clearSearchBtn.style.display = 'none';
            filterTrips('');
            updateFilterTags();
        });
    }
}

function setupFilter() {
    const filter = document.getElementById('tripTypeFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    filter.addEventListener('change', () => {
        filterTripsByType(filter.value);
        updateFilterTags();
    });
    
    if (sortFilter) {
        sortFilter.addEventListener('change', () => {
            sortTrips(sortFilter.value);
        });
    }
}

function setupCreateTrip() {
    const btn = document.getElementById('createTripBtn');
    const gasInput = document.getElementById('gasCost');
    const seatInput = document.getElementById('totalSeats');
    const preview = document.getElementById('gasCostPreview');

    [gasInput, seatInput].forEach(i => {
        i.addEventListener('input', () => {
            const cost = parseFloat(gasInput.value) || 0;
            const seats = parseInt(seatInput.value) || 1;
            preview.textContent = `$${(cost / seats).toFixed(2)} per person`;
        });
    });

    btn.addEventListener('click', () => {
        if (validateForm()) {
            const tripData = {
                type: document.getElementById('tripType').value,
                destination: document.getElementById('destination').value,
                date: document.getElementById('tripDate').value,
                time: document.getElementById('tripTime').value,
                totalSeats: parseInt(seatInput.value),
                gasCost: parseFloat(gasInput.value),
                notes: document.getElementById('tripNotes').value
            };
            createTrip(tripData);
        }
    });
}

function validateForm() {
    const fields = ['tripType','destination','tripDate','tripTime','totalSeats','gasCost'];
    let valid = true;
    fields.forEach(id => {
        const f = document.getElementById(id);
        if (!f.value) {
            f.classList.add('is-invalid');
            valid = false;
        } else f.classList.remove('is-invalid');
    });
    return valid;
}

function createTrip(data) {
    // Validate trip date before creating
    if (!validateTripDate(data)) {
        showErrorToast('Cannot create a trip for a date that has already passed!');
        return;
    }
    
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.dataset.type = data.type;
    card.dataset.destination = data.destination;

    const costPerPerson = (data.gasCost / data.totalSeats).toFixed(2);
    card.innerHTML = `
        <div class="trip-header">
            <h5><i class="bi ${getIcon(data.type)}"></i> ${getLabel(data.type)}</h5>
            <span class="badge bg-primary">Open</span>
        </div>
        <div class="trip-details">
            <p><strong>Destination:</strong> ${data.destination}</p>
            <p><strong>Date:</strong> ${formatDate(data.date)}</p>
            <p><strong>Time:</strong> ${formatTime(data.time)}</p>
            <p><strong>Seats Available:</strong> ${data.totalSeats - 1}/${data.totalSeats}</p>
            <p class="cost-highlight"><strong>Gas Cost per Person:</strong> $${costPerPerson}</p>
            ${data.notes ? `<p><strong>Notes:</strong> ${data.notes}</p>` : ''}
        </div>
        <div class="trip-footer">
            <button class="btn btn-success btn-sm join-trip-btn">Join Trip</button>
            <button class="btn btn-info btn-sm chat-trip-btn" data-destination="${data.destination}" data-creator="You" style="display: none;">
                <i class="bi bi-chat-dots"></i> Chat
            </button>
            <button class="btn btn-danger btn-sm delete-trip-btn">
                <i class="bi bi-trash"></i> Delete
            </button>
            <span class="trip-creator">Created by: You</span>
        </div>
        <div class="trip-participants" style="display: none;">
            <h6><i class="bi bi-people-fill"></i> Participants:</h6>
            <ul class="participants-list">
                <li><i class="bi bi-person-fill"></i> You (Creator)</li>
            </ul>
        </div>
    `;
    // Add to My Trips tab instead of Available Trips
    const myTripsGrid = document.getElementById('myTripsGrid');
    if (myTripsGrid) {
        myTripsGrid.appendChild(card);
        
        // Mark as joined since user created it
        const joinBtn = card.querySelector('.join-trip-btn');
        if (joinBtn) {
            joinBtn.textContent = 'Leave Trip';
            joinBtn.classList.replace('btn-success', 'btn-warning');
            joinBtn.classList.add('joined');
        }
        
        // Show chat button since user created it
        const chatBtn = card.querySelector('.chat-trip-btn');
        if (chatBtn) {
            chatBtn.style.display = 'inline-block';
        }
        
        // Show participants section
        const participantsSection = card.querySelector('.trip-participants');
        if (participantsSection) {
            participantsSection.style.display = 'block';
        }
        
        // Save as joined trip
        saveJoinedTrip(data.destination, 'You');
    }
    
    bootstrap.Modal.getInstance(document.getElementById('createTripModal')).hide();
    document.getElementById('createTripForm').reset();
    updateResultsCount();
    saveTrips();
}

function getIcon(type) {
    const icons = {airport:'bi-airplane-fill',home:'bi-house-fill',weekend:'bi-geo-alt-fill',other:'bi-car-front-fill'};
    return icons[type] || 'bi-airplane-fill';
}

function getLabel(type) {
    const labels = {airport:'Airport Trip',home:'Trip Home',weekend:'Weekend Getaway',other:'Other Trip'};
    return labels[type] || 'Trip';
}

async function deleteTrip(button) {
    const card = button.closest('.trip-card');
    const destination = card.dataset.destination;
    const creator = card.querySelector('.trip-creator').textContent.replace('Created by: ', '');
    
    // Confirmation dialog
    let confirmed;
    try {
        confirmed = await showConfirmDialog(
            `Are you sure you want to delete the trip to ${destination}? This action cannot be undone.`,
            'Delete Trip',
            'Delete',
            'Cancel'
        );
    } catch (error) {
        console.error('Error with custom confirmation dialog:', error);
        // Fallback to browser confirm
        confirmed = confirm(`Are you sure you want to delete the trip to ${destination}? This action cannot be undone.`);
    }
    
    if (!confirmed) {
        return;
    }
    
    // Remove from all grids
    const allGrids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
    allGrids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (grid) {
            const existingCard = grid.querySelector(`[data-destination="${destination}"]`);
            if (existingCard) {
                existingCard.remove();
            }
        }
    });
    
    // Remove from localStorage
    const data = JSON.parse(localStorage.getItem('ua_trips') || '[]');
    const updatedData = data.filter(html => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const tripCard = div.firstChild;
        return tripCard.dataset.destination !== destination;
    });
    localStorage.setItem('ua_trips', JSON.stringify(updatedData));
    
    // Remove from joined trips if applicable
    removeJoinedTrip(destination);
    
    // Update results count
    updateResultsCount();
    updateTabBadges();
    updateHeaderStats();
    updateEmptyStates();
    
    // Show success message
    showSuccessToast('Trip deleted successfully!');
}

function setupJoinLeave() {
    console.log('Setting up join/leave event listeners');
    document.addEventListener('click', async e => {
        console.log('Click detected on:', e.target);
        
        if (e.target.classList.contains('join-trip-btn')) {
            console.log('Join/Leave button clicked');
            const btn = e.target;
            if (btn.classList.contains('joined')) {
                console.log('Leaving trip');
                await leaveTrip(btn);
            } else {
                console.log('Joining trip');
                await joinTrip(btn);
            }
        } else if (e.target.classList.contains('delete-trip-btn') || e.target.closest('.delete-trip-btn')) {
            console.log('Delete button clicked');
            const btn = e.target.classList.contains('delete-trip-btn') ? e.target : e.target.closest('.delete-trip-btn');
            await deleteTrip(btn);
        } else if (e.target.classList.contains('chat-trip-btn') || e.target.closest('.chat-trip-btn')) {
            console.log('Chat button clicked');
            const btn = e.target.classList.contains('chat-trip-btn') ? e.target : e.target.closest('.chat-trip-btn');
            const destination = btn.dataset.destination;
            const creator = btn.dataset.creator;
            if (destination && creator) {
                openTripChat(destination, creator);
            }
        }
    });
}

async function joinTrip(btn) {
    console.log('joinTrip function called');
    const card = btn.closest('.trip-card');
    console.log('Card found:', card);
    const seats = card.querySelector('.trip-details p:nth-child(4)');
    console.log('Seats element:', seats);
    let [available, total] = seats.textContent.match(/\d+/g).map(Number);
    console.log('Available seats:', available, 'Total seats:', total);
    if (available <= 0) return showWarningToast('Trip is full!');

    console.log('Showing confirmation dialog');
    let confirmed;
    try {
        confirmed = await showConfirmDialog(
            `Join this trip to ${card.dataset.destination}?`,
            'Join Trip',
            'Join',
            'Cancel'
        );
    } catch (error) {
        console.error('Error with custom confirmation dialog:', error);
        // Fallback to browser confirm
        confirmed = confirm(`Join this trip to ${card.dataset.destination}?`);
    }
    
    console.log('Confirmation result:', confirmed);
    if (confirmed) {
        available -=1;
        seats.innerHTML = `<strong>Seats Available:</strong> ${available}/${total}`;
        btn.textContent='Leave Trip';
        btn.classList.replace('btn-success','btn-warning');
        btn.classList.add('joined');
        addParticipant(card);
        updateBadge(card, available);
        
        // Show participants section
        const participantsSection = card.querySelector('.trip-participants');
        if (participantsSection) {
            participantsSection.style.display = 'block';
        }
        
        // Show chat button
        const chatBtn = card.querySelector('.chat-trip-btn');
        if (chatBtn) {
            chatBtn.style.display = 'inline-block';
        }
        
        // Always move joined trips to My Trips tab
        const myTripsGrid = document.getElementById('myTripsGrid');
        if (myTripsGrid) {
            // Clone the trip card for My Trips
            const clonedCard = card.cloneNode(true);
            
            // Add to My Trips grid
            myTripsGrid.appendChild(clonedCard);
            
            console.log('Moved joined trip to My Trips tab:', card.dataset.destination);
        }
        
        // If trip is now full, also add it to Full Trips tab
        if (available === 0) {
            const fullTripsGrid = document.getElementById('fullTripsGrid');
            if (fullTripsGrid) {
                // Clone the trip card for Full Trips
                const fullClonedCard = card.cloneNode(true);
                
                // Add to Full Trips grid
                fullTripsGrid.appendChild(fullClonedCard);
                
                console.log('Trip is now full, also added to Full Trips tab:', card.dataset.destination);
            }
        }
        
        // Remove from current grid
        card.remove();
        
        // Save joined trip state
        const creator = card.querySelector('.trip-creator').textContent.replace('Created by: ', '');
        saveJoinedTrip(card.dataset.destination, creator);
        console.log('Saved joined trip to localStorage:', card.dataset.destination, 'by', creator);
        
        // Update counts immediately
        updateResultsCount();
        updateTabBadges();
        updateHeaderStats();
        updateEmptyStates();
        
        // Switch to My Trips tab
        const myTripsTab = document.getElementById('my-trips-tab');
        if (myTripsTab) {
            myTripsTab.click();
        }
        
        saveTrips();
    }
}

async function leaveTrip(btn) {
    const card = btn.closest('.trip-card');
    const seats = card.querySelector('.trip-details p:nth-child(4)');
    let [available, total] = seats.textContent.match(/\d+/g).map(Number);
    let confirmed;
    try {
        confirmed = await showConfirmDialog(
            'Leave this trip?',
            'Leave Trip',
            'Leave',
            'Cancel'
        );
    } catch (error) {
        console.error('Error with custom confirmation dialog:', error);
        // Fallback to browser confirm
        confirmed = confirm('Leave this trip?');
    }
    
    if (confirmed) {
        available +=1;
        seats.innerHTML = `<strong>Seats Available:</strong> ${available}/${total}`;
        btn.textContent='Join Trip';
        btn.classList.replace('btn-warning','btn-success');
        btn.classList.remove('joined');
        removeParticipant(card);
        updateBadge(card, available);
        
        // Hide chat button
        const chatBtn = card.querySelector('.chat-trip-btn');
        if (chatBtn) {
            chatBtn.style.display = 'none';
        }
        
        // Remove from Full Trips tab if it was there (since trip is no longer full)
        const fullTripsGrid = document.getElementById('fullTripsGrid');
        if (fullTripsGrid) {
            const fullTripCard = fullTripsGrid.querySelector(`[data-destination="${card.dataset.destination}"]`);
            if (fullTripCard) {
                fullTripCard.remove();
                console.log('Removed trip from Full Trips tab (no longer full):', card.dataset.destination);
            }
        }
        
        // Determine which grid to move the trip to based on availability
        const availableTripsGrid = document.getElementById('tripsGrid');
        
        if (available > 0) {
            // Trip has available seats - move to Available Trips
            if (availableTripsGrid) {
                // Check if trip already exists in Available Trips
                const existingTrip = availableTripsGrid.querySelector(`[data-destination="${card.dataset.destination}"]`);
                if (!existingTrip) {
                    // Clone the trip card with updated seat count
                    const clonedCard = card.cloneNode(true);
                    
                    // Update the seat count in the cloned card
                    const clonedSeats = clonedCard.querySelector('.trip-details p:nth-child(4)');
                    if (clonedSeats) {
                        clonedSeats.innerHTML = `<strong>Seats Available:</strong> ${available}/${total}`;
                    }
                    
                    // Update the badge in the cloned card
                    updateBadge(clonedCard, available);
                    
                    // Add back to Available Trips grid
                    availableTripsGrid.appendChild(clonedCard);
                    console.log('Moved trip back to Available Trips:', card.dataset.destination);
                }
            }
        } else {
            // Trip is still full - move to Full Trips
            const fullTripsGrid = document.getElementById('fullTripsGrid');
            if (fullTripsGrid) {
                // Check if trip already exists in Full Trips
                const existingTrip = fullTripsGrid.querySelector(`[data-destination="${card.dataset.destination}"]`);
                if (!existingTrip) {
                    // Clone the trip card with updated seat count
                    const clonedCard = card.cloneNode(true);
                    
                    // Update the seat count in the cloned card
                    const clonedSeats = clonedCard.querySelector('.trip-details p:nth-child(4)');
                    if (clonedSeats) {
                        clonedSeats.innerHTML = `<strong>Seats Available:</strong> ${available}/${total}`;
                    }
                    
                    // Update the badge in the cloned card
                    updateBadge(clonedCard, available);
                    
                    // Add to Full Trips grid
                    fullTripsGrid.appendChild(clonedCard);
                    console.log('Moved trip to Full Trips:', card.dataset.destination);
                }
            }
        }
        
        // Remove from My Trips grid
        card.remove();
        
        // Remove joined trip state
        removeJoinedTrip(card.dataset.destination);
        
        // Clean up any duplicates that might have been created
        clearDuplicates();
        
        // Update counts immediately
        updateResultsCount();
        updateTabBadges();
        updateHeaderStats();
        updateEmptyStates();
        
        // Show success message
        showSuccessToast(`Left trip to ${card.dataset.destination} successfully!`);
        
        saveTrips();
    }
}

function addParticipant(card) {
    let part = card.querySelector('.trip-participants');
    if(!part) {
        part = document.createElement('div');
        part.className='trip-participants active';
        part.innerHTML = `<h6><i class="bi bi-people-fill"></i> Participants:</h6><ul class="participants-list"></ul>`;
        card.querySelector('.trip-details').after(part);
    } else part.classList.add('active');

    const ul = part.querySelector('.participants-list');
    const li = document.createElement('li');
    li.innerHTML=`<i class="bi bi-person-circle"></i> You`;
    ul.appendChild(li);
}

function removeParticipant(card) {
    const part = card.querySelector('.trip-participants');
    if(!part) return;
    const ul = part.querySelector('.participants-list');
    const you = [...ul.children].find(li=>li.textContent.includes('You'));
    if(you) you.remove();
    if(ul.children.length===0) part.classList.remove('active');
}

function updateBadge(card, seats) {
    const badge = card.querySelector('.badge');
    if(seats===0){badge.textContent='Full'; badge.className='badge bg-danger';}
    else if(seats<=2){badge.textContent='Almost Full'; badge.className='badge bg-warning';}
    else{badge.textContent='Open'; badge.className='badge bg-primary';}
}

function filterTrips(term){
    const cards = [...document.querySelectorAll('.trip-card')];
    cards.forEach(c=>{
        const dest = c.dataset.destination.toLowerCase();
        const type = c.dataset.type.toLowerCase();
        const text = c.textContent.toLowerCase();
        const match = dest.includes(term) || type.includes(term) || text.includes(term);
        c.style.display = match ? 'block':'none';
    });
    updateResultsCount();
}

function filterTripsByType(type){
    const cards = [...document.querySelectorAll('.trip-card')];
    cards.forEach(c=>{
        c.style.display = (type==='all'||c.dataset.type===type)?'block':'none';
    });
    updateResultsCount();
}

function updateResultsCount(){
    performanceMonitor.start('updateResultsCount');
    
    // Only count trips in the Available Trips tab (tripsGrid)
    const availableTripsGrid = getCachedElement('tripsGrid');
    const count = availableTripsGrid ? [...availableTripsGrid.querySelectorAll('.trip-card')].filter(c=>c.style.display!=='none').length : 0;
    
    const resultsCountEl = getCachedElement('resultsCount');
    if (resultsCountEl) {
        resultsCountEl.textContent = `${count} trip${count!==1?'s':''} found`;
    }

    // Update all tab badges
    updateTabBadges();
    
    performanceMonitor.end('updateResultsCount');
}

function updateTabBadges() {
    const grids = {
        'availableTripsBadge': 'tripsGrid',
        'myTripsBadge': 'myTripsGrid', 
        'pastTripsBadge': 'pastTripsGrid',
        'fullTripsBadge': 'fullTripsGrid'
    };
    
    Object.entries(grids).forEach(([badgeId, gridId]) => {
        const badge = getCachedElement(badgeId);
        const grid = getCachedElement(gridId);
        if (badge && grid) {
            const count = [...grid.querySelectorAll('.trip-card')].filter(c=>c.style.display!=='none').length;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'inline-block' : 'none';
        }
    });
    
    // Update header stats
    updateHeaderStats();
}

function updateHeaderStats() {
    const activeTripsCount = document.getElementById('activeTripsCount');
    const myTripsCount = document.getElementById('myTripsCount');
    
    if (activeTripsCount) {
        const activeGrid = document.getElementById('tripsGrid');
        const activeCount = activeGrid ? [...activeGrid.querySelectorAll('.trip-card')].filter(c=>c.style.display!=='none').length : 0;
        activeTripsCount.textContent = `${activeCount} active`;
    }
    
    if (myTripsCount) {
        const myGrid = document.getElementById('myTripsGrid');
        const myCount = myGrid ? [...myGrid.querySelectorAll('.trip-card')].filter(c=>c.style.display!=='none').length : 0;
        myTripsCount.textContent = `${myCount} my trips`;
    }
}

function updateFilterTags() {
    const activeFilters = document.getElementById('activeFilters');
    if (!activeFilters) return;
    
    activeFilters.innerHTML = '';
    
    const searchInput = document.getElementById('searchInput');
    const tripTypeFilter = document.getElementById('tripTypeFilter');
    
    // Add search filter tag
    if (searchInput && searchInput.value.trim()) {
        const searchTag = createFilterTag('Search', searchInput.value, () => {
            searchInput.value = '';
            document.getElementById('clearSearchBtn').style.display = 'none';
            filterTrips('');
            updateFilterTags();
        });
        activeFilters.appendChild(searchTag);
    }
    
    // Add trip type filter tag
    if (tripTypeFilter && tripTypeFilter.value !== 'all') {
        const typeText = tripTypeFilter.options[tripTypeFilter.selectedIndex].text;
        const typeTag = createFilterTag('Type', typeText, () => {
            tripTypeFilter.value = 'all';
            filterTripsByType('all');
            updateFilterTags();
        });
        activeFilters.appendChild(typeTag);
    }
}

function createFilterTag(label, value, onRemove) {
    const tag = document.createElement('div');
    tag.className = 'filter-tag';
    tag.innerHTML = `
        <span>${label}: ${value}</span>
        <button class="remove-tag" type="button">
            <i class="bi bi-x"></i>
        </button>
    `;
    
    tag.querySelector('.remove-tag').addEventListener('click', onRemove);
    return tag;
}

function sortTrips(sortBy) {
    const grids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
    
    grids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        const cards = [...grid.querySelectorAll('.trip-card')];
        
        cards.sort((a, b) => {
            switch(sortBy) {
                case 'date':
                    const dateA = new Date(a.querySelector('.trip-details p:nth-child(2)')?.textContent || '');
                    const dateB = new Date(b.querySelector('.trip-details p:nth-child(2)')?.textContent || '');
                    return dateA - dateB;
                    
                case 'cost':
                    const costA = parseFloat(a.querySelector('.cost-highlight')?.textContent?.match(/\$(\d+\.?\d*)/)?.[1] || 0);
                    const costB = parseFloat(b.querySelector('.cost-highlight')?.textContent?.match(/\$(\d+\.?\d*)/)?.[1] || 0);
                    return costA - costB;
                    
                case 'seats':
                    const seatsA = parseInt(a.querySelector('.trip-details p:nth-child(4)')?.textContent?.match(/(\d+)\/\d+/)?.[1] || 0);
                    const seatsB = parseInt(b.querySelector('.trip-details p:nth-child(4)')?.textContent?.match(/(\d+)\/\d+/)?.[1] || 0);
                    return seatsB - seatsA; // More seats first
                    
                case 'destination':
                    const destA = a.dataset.destination?.toLowerCase() || '';
                    const destB = b.dataset.destination?.toLowerCase() || '';
                    return destA.localeCompare(destB);
                    
                default:
                    return 0;
            }
        });
        
        // Re-append sorted cards
        cards.forEach(card => grid.appendChild(card));
    });
}

function setupRefresh() {
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            // Add loading animation
            refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise spin"></i>';
            refreshBtn.disabled = true;
            
            // Reload trips
            setTimeout(() => {
                loadTrips();
                refreshBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i>';
                refreshBtn.disabled = false;
            }, 1000);
        });
    }
}

function updateEmptyStates() {
    const grids = {
        'tripsGrid': 'activeTripsEmpty',
        'myTripsGrid': 'myTripsEmpty', 
        'pastTripsGrid': 'pastTripsEmpty',
        'fullTripsGrid': 'fullTripsEmpty'
    };
    
    Object.entries(grids).forEach(([gridId, emptyId]) => {
        const grid = document.getElementById(gridId);
        const empty = document.getElementById(emptyId);
        
        if (grid && empty) {
            const visibleCards = [...grid.querySelectorAll('.trip-card')].filter(c => c.style.display !== 'none');
            empty.style.display = visibleCards.length === 0 ? 'block' : 'none';
        }
    });
}

function formatDate(d){return new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});}
function formatTime(t){let [h,m]=t.split(':').map(Number);let ap=h>=12?'PM':'AM';h=h%12||12;return `${h}:${m.toString().padStart(2,'0')} ${ap}`;}

function saveTrips(){
    // Only save user-created trips, not example trips
    const cards=[...document.querySelectorAll('.trip-card')];
    const userCreatedTrips = cards.filter(card => {
        const creator = card.querySelector('.trip-creator');
        return creator && !creator.textContent.includes('Sarah Johnson') && 
               !creator.textContent.includes('Mike Chen') && 
               !creator.textContent.includes('Emily Garcia') &&
               !creator.textContent.includes('Alex Thompson') &&
               !creator.textContent.includes('Jessica Martinez') &&
               !creator.textContent.includes('David Wilson');
    });
    const data=userCreatedTrips.map(c=>c.outerHTML);
    localStorage.setItem('ua_trips',JSON.stringify(data));
}

function loadTrips(){
    performanceMonitor.start('loadTrips');
    console.log('loadTrips called');
    
    try {
        const activeGrid = getCachedElement('tripsGrid');
        const fullGrid = getCachedElement('fullTripsGrid');
        const myTripsGrid = getCachedElement('myTripsGrid');
        const pastTripsGrid = getCachedElement('pastTripsGrid');
        
        console.log('Grid elements found:', {
            activeGrid: !!activeGrid,
            fullGrid: !!fullGrid,
            myTripsGrid: !!myTripsGrid,
            pastTripsGrid: !!pastTripsGrid
        });
        
        // Clear existing content first
        if (activeGrid) activeGrid.innerHTML = '';
        if (fullGrid) fullGrid.innerHTML = '';
        if (myTripsGrid) myTripsGrid.innerHTML = '';
        if (pastTripsGrid) pastTripsGrid.innerHTML = '';
        
        // Show loading skeleton
        showLoadingSkeleton();
        
        // Always load example trips to ensure new trips are included
        console.log('Loading example trips...');
        loadExampleTrips(activeGrid, fullGrid, pastTripsGrid);
        
        // Load user-created trips from localStorage (only trips created by "You")
        const data = JSON.parse(localStorage.getItem('ua_trips') || '[]');
        data.forEach(html => {
            try {
                const div = document.createElement('div');
                div.innerHTML = html;
                const tripCard = div.firstChild;
                
                // Only load trips created by "You" (user-created trips)
                const creator = tripCard.querySelector('.trip-creator');
                if (creator && creator.textContent.includes('Created by: You')) {
                    // Check if trip is expired
                    if (isTripExpired(tripCard)) {
                        pastTripsGrid.appendChild(tripCard);
                    } else {
                        // User-created trips go to My Trips tab
                        myTripsGrid.appendChild(tripCard);
                    }
                }
            } catch (error) {
                console.error('Error loading user trip:', error);
            }
        });
        
        // Restore joined trips first (this will move them to appropriate grids)
        restoreJoinedTrips();
        
        // Load my trips (this will show trips that are already in My Trips grid)
        loadMyTrips(myTripsGrid);
        
        // Load past trips
        loadPastTrips(pastTripsGrid);
        
        // Update chat button visibility for all trips
        updateChatButtonVisibility();
        
        // Update all counts and badges
        updateResultsCount();
        updateTabBadges();
        updateHeaderStats();
        
        // Set up automatic updates
        setupAutoUpdates();
        
        // Set up periodic check for expired trips (every 5 minutes)
        setInterval(() => {
            moveExpiredTripsToPast();
        }, 5 * 60 * 1000);
        
        // Hide loading skeleton
        setTimeout(() => {
            hideLoadingSkeleton();
        }, 500);
        
    } catch (error) {
        console.error('Error in loadTrips:', error);
        showErrorToast('Failed to load trips. Please refresh the page.');
    }
    
    performanceMonitor.end('loadTrips');
}

function loadExampleTrips(activeGrid, fullGrid, pastTripsGrid) {
    console.log('loadExampleTrips called with grids:', {
        activeGrid: !!activeGrid,
        fullGrid: !!fullGrid,
        pastTripsGrid: !!pastTripsGrid
    });
    
    const exampleTrips = [
        {
            type: 'airport',
            destination: 'Atlanta Airport',
            date: '2025-09-15',
            time: '08:30',
            totalSeats: 4,
            availableSeats: 2,
            totalCost: 48.00,
            creator: 'Jessica Chen',
            notes: 'Fall semester break - international flight'
        },
        {
            type: 'home',
            destination: 'Birmingham, AL',
            date: '2025-09-20',
            time: '14:00',
            totalSeats: 3,
            availableSeats: 1,
            totalCost: 25.00,
            creator: 'Mike Johnson',
            notes: 'Weekend trip home to visit family'
        },
        {
            type: 'airport',
            destination: 'Atlanta Airport',
            date: '2024-12-20',
            time: '08:00',
            totalSeats: 4,
            availableSeats: 2,
            totalCost: 45.00,
            creator: 'Test User 1',
            notes: 'Test trip - should be in Past Trips'
        },
        {
            type: 'weekend',
            destination: 'Mobile, AL',
            date: '2024-12-15',
            time: '10:00',
            totalSeats: 3,
            availableSeats: 0,
            totalCost: 30.00,
            creator: 'Test User 2',
            notes: 'Test full trip - should be in Past Trips'
        },
        {
            type: 'weekend',
            destination: 'Nashville, TN',
            date: '2025-09-25',
            time: '09:00',
            totalSeats: 4,
            availableSeats: 3,
            totalCost: 60.00,
            creator: 'Sarah Williams',
            notes: 'Music city weekend getaway!'
        },
        {
            type: 'awaygames',
            destination: 'Auburn University',
            date: '2025-09-28',
            time: '11:00',
            totalSeats: 4,
            availableSeats: 2,
            totalCost: 40.00,
            creator: 'Tyler Brown',
            notes: 'Football game - Roll Tide!'
        },
        {
            type: 'airport',
            destination: 'Huntsville Airport',
            date: '2025-10-02',
            time: '06:00',
            totalSeats: 2,
            availableSeats: 1,
            totalCost: 35.00,
            creator: 'Lisa Davis',
            notes: 'Early morning flight for business trip'
        },
        {
            type: 'weekend',
            destination: 'Gulf Shores, AL',
            date: '2025-10-05',
            time: '08:00',
            totalSeats: 4,
            availableSeats: 3,
            totalCost: 55.00,
            creator: 'Alex Thompson',
            notes: 'Beach weekend - bring sunscreen!'
        },
        {
            type: 'home',
            destination: 'Montgomery, AL',
            date: '2025-10-12',
            time: '15:00',
            totalSeats: 3,
            availableSeats: 2,
            totalCost: 28.00,
            creator: 'Jordan Smith',
            notes: 'Going home for the weekend'
        },
        {
            type: 'awaygames',
            destination: 'LSU Stadium',
            date: '2025-10-18',
            time: '13:30',
            totalSeats: 4,
            availableSeats: 1,
            totalCost: 65.00,
            creator: 'Marcus Johnson',
            notes: 'Football game - Roll Tide!'
        },
        {
            type: 'airport',
            destination: 'Birmingham Airport',
            date: '2025-10-25',
            time: '12:00',
            totalSeats: 3,
            availableSeats: 2,
            totalCost: 40.00,
            creator: 'Sarah Wilson',
            notes: 'Fall break departure'
        },
        {
            type: 'weekend',
            destination: 'Chattanooga, TN',
            date: '2025-11-02',
            time: '09:30',
            totalSeats: 4,
            availableSeats: 3,
            totalCost: 48.00,
            creator: 'Chris Anderson',
            notes: 'Mountain weekend getaway'
        },
        {
            type: 'home',
            destination: 'Tuscaloosa, AL',
            date: '2025-11-09',
            time: '16:00',
            totalSeats: 2,
            availableSeats: 1,
            totalCost: 15.00,
            creator: 'Taylor Brown',
            notes: 'Quick trip home for family dinner'
        },
        {
            type: 'awaygames',
            destination: 'Ole Miss',
            date: '2025-11-16',
            time: '11:00',
            totalSeats: 4,
            availableSeats: 2,
            totalCost: 50.00,
            creator: 'Ryan Miller',
            notes: 'Basketball game - Roll Tide!'
        },
        {
            type: 'airport',
            destination: 'Nashville Airport',
            date: '2025-11-23',
            time: '07:00',
            totalSeats: 3,
            availableSeats: 1,
            totalCost: 42.00,
            creator: 'Emma Davis',
            notes: 'Early morning international flight'
        },
        {
            type: 'weekend',
            destination: 'New Orleans, LA',
            date: '2025-11-30',
            time: '10:00',
            totalSeats: 4,
            availableSeats: 4,
            totalCost: 70.00,
            creator: 'Noah Wilson',
            notes: 'Thanksgiving weekend getaway!'
        },
        {
            type: 'airport',
            destination: 'Atlanta Airport',
            date: '2025-12-07',
            time: '09:00',
            totalSeats: 3,
            availableSeats: 2,
            totalCost: 45.00,
            creator: 'Test User 3',
            notes: 'Winter break trip - definitely future date'
        },
        {
            type: 'home',
            destination: 'Birmingham, AL',
            date: '2025-12-14',
            time: '14:00',
            totalSeats: 2,
            availableSeats: 1,
            totalCost: 30.00,
            creator: 'Test User 4',
            notes: 'Winter break home visit'
        },
        {
            type: 'awaygames',
            destination: 'Auburn University',
            date: '2025-12-21',
            time: '12:00',
            totalSeats: 4,
            availableSeats: 3,
            totalCost: 42.00,
            creator: 'Tyler Johnson',
            notes: 'Basketball game - Roll Tide!'
        },
        {
            type: 'home',
            destination: 'Huntsville, AL',
            date: '2025-12-28',
            time: '16:30',
            totalSeats: 2,
            availableSeats: 1,
            totalCost: 28.00,
            creator: 'Sarah Davis',
            notes: 'Visiting family for New Year weekend'
        },
        {
            type: 'airport',
            destination: 'Nashville Airport',
            date: '2026-01-04',
            time: '06:00',
            totalSeats: 3,
            availableSeats: 2,
            totalCost: 55.00,
            creator: 'Alex Thompson',
            notes: 'Valentine\'s weekend trip'
        },
        {
            type: 'weekend',
            destination: 'Gatlinburg, TN',
            date: '2025-09-30',
            time: '08:00',
            totalSeats: 4,
            availableSeats: 0,
            totalCost: 65.00,
            creator: 'Full Trip Creator',
            notes: 'Mountain getaway - TRIP IS FULL!'
        },
        {
            type: 'awaygames',
            destination: 'Tennessee Stadium',
            date: '2025-10-15',
            time: '14:00',
            totalSeats: 3,
            availableSeats: 0,
            totalCost: 55.00,
            creator: 'Full Trip Creator 2',
            notes: 'Football game - TRIP IS FULL!'
        },
        {
            type: 'airport',
            destination: 'Miami Airport',
            date: '2025-11-15',
            time: '10:00',
            totalSeats: 2,
            availableSeats: 0,
            totalCost: 120.00,
            creator: 'Full Trip Creator 3',
            notes: 'Spring break Miami - TRIP IS FULL!'
        },
        {
            type: 'weekend',
            destination: 'New Orleans, LA',
            date: '2025-03-01',
            time: '10:00',
            totalSeats: 4,
            availableSeats: 1,
            totalCost: 75.00,
            creator: 'Maya Patel',
            notes: 'Mardi Gras weekend celebration!'
        },
        {
            type: 'awaygames',
            destination: 'LSU Stadium',
            date: '2025-03-15',
            time: '14:00',
            totalSeats: 3,
            availableSeats: 2,
            totalCost: 65.00,
            creator: 'David Wilson',
            notes: 'Spring break game trip'
        },
        {
            type: 'home',
            destination: 'Mobile, AL',
            date: '2025-01-18',
            time: '17:00',
            totalSeats: 2,
            availableSeats: 0,
            totalCost: 32.00,
            creator: 'Lisa Martinez',
            notes: 'Weekend visit home'
        },
        {
            type: 'airport',
            destination: 'Birmingham Airport',
            date: '2025-02-28',
            time: '11:30',
            totalSeats: 4,
            availableSeats: 3,
            totalCost: 38.00,
            creator: 'Chris Anderson',
            notes: 'Spring break departure'
        }
    ];
    
    console.log('Processing', exampleTrips.length, 'example trips');
    let validTrips = 0;
    let expiredTrips = 0;
    
    exampleTrips.forEach(trip => {
        const tripCard = createExampleTripCard(trip);
        
        if (validateTripDate(trip)) {
            // Trip is still valid - add to appropriate grid
            validTrips++;
            console.log('Creating trip card for:', trip.destination);
            if (trip.availableSeats === 0) {
                // Trip is full - add to Full Trips tab
                if (fullGrid) {
                    fullGrid.appendChild(tripCard);
                    console.log('Added to full grid (trip is full):', trip.destination);
                }
            } else {
                // Trip has available seats - add to Available Trips tab
                if (activeGrid) {
                    activeGrid.appendChild(tripCard);
                    console.log('Added to active grid (has available seats):', trip.destination);
                }
            }
        } else {
            // Trip is expired - add to Past Trips
            expiredTrips++;
            console.log('Adding expired trip to Past Trips:', trip.destination);
            if (pastTripsGrid) {
                pastTripsGrid.appendChild(tripCard);
                console.log('Added to past trips grid:', trip.destination);
            }
        }
    });
    console.log('Valid trips processed:', validTrips);
    console.log('Expired trips moved to Past Trips:', expiredTrips);
    
    // Save example trips to localStorage for future loads
    const exampleTripsHTML = [];
    const allExampleCards = [...activeGrid.querySelectorAll('.trip-card'), ...fullGrid.querySelectorAll('.trip-card')];
    allExampleCards.forEach(card => {
        // Save all example trips (not user-created ones)
        const creator = card.querySelector('.trip-creator');
        if (creator && !creator.textContent.includes('Created by: You')) {
            exampleTripsHTML.push(card.outerHTML);
        }
    });
    localStorage.setItem('example_trips', JSON.stringify(exampleTripsHTML));
}

function loadExampleTripsFromStorage(activeGrid, fullGrid) {
    const exampleTripsHTML = JSON.parse(localStorage.getItem('example_trips') || '[]');
    exampleTripsHTML.forEach(html => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const tripCard = div.firstChild;
        
        // Check if trip is expired
        if (isTripExpired(tripCard)) {
            return; // Skip expired trips
        }
        
        // Check if trip is full
        const seatsInfo = tripCard.querySelector('.trip-details p:nth-child(4)');
        if (seatsInfo) {
            const availableSeats = parseInt(seatsInfo.textContent.match(/(\d+)\/\d+/)[1]);
            if (availableSeats === 0) {
                fullGrid.appendChild(tripCard);
            } else {
                activeGrid.appendChild(tripCard);
            }
        } else {
            activeGrid.appendChild(tripCard);
        }
    });
}

function loadMyTrips(myTripsGrid) {
    // Check if there are already trips in the My Trips grid
    const existingTrips = myTripsGrid.querySelectorAll('.trip-card');
    
    if (existingTrips.length === 0) {
        // No trips in My Trips grid, show empty state
        myTripsGrid.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-calendar-x" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3 text-muted">No trips yet</h4>
                <p class="text-muted">Join a trip or create your own to see it here!</p>
            </div>
        `;
    } else {
        // There are trips in My Trips grid, remove any empty state message
        const emptyState = myTripsGrid.querySelector('.text-center');
        if (emptyState) {
            emptyState.remove();
        }
    }
    
    // Update the badge count
    updateTabBadges();
}

function createExampleTripCard(tripData) {
    console.log('Creating trip card for:', tripData.destination);
    const card = document.createElement('div');
    card.className = 'trip-card';
    card.setAttribute('data-type', tripData.type);
    card.setAttribute('data-destination', tripData.destination);
    
    const costPerPerson = tripData.totalCost / (tripData.totalSeats - tripData.availableSeats);
    const actualParticipants = tripData.totalSeats - tripData.availableSeats;
    
    const typeIcons = {
        'airport': 'bi-airplane-fill',
        'home': 'bi-house-fill',
        'weekend': 'bi-geo-alt-fill',
        'awaygames': 'bi-trophy-fill',
        'other': 'bi-car-front-fill'
    };
    
    const typeLabels = {
        'airport': 'Airport Trip',
        'home': 'Trip Home',
        'weekend': 'Weekend Trip',
        'awaygames': 'Away Games',
        'other': 'Other Trip'
    };
    
    const badgeClass = tripData.availableSeats === 0 ? 'bg-danger' : 
                      tripData.availableSeats === 1 ? 'bg-warning' : 'bg-primary';
    const badgeText = tripData.availableSeats === 0 ? 'Full' : 
                     tripData.availableSeats === 1 ? 'Almost Full' : 'Open';
    
    card.innerHTML = `
        <div class="trip-header">
            <h5><i class="bi ${typeIcons[tripData.type]}"></i> ${typeLabels[tripData.type]}</h5>
            <span class="badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="trip-details">
            <p><strong>Destination:</strong> ${tripData.destination}</p>
            <p><strong>Date:</strong> ${formatDate(tripData.date)}</p>
            <p><strong>Time:</strong> ${formatTime(tripData.time)}</p>
            <p><strong>Seats Available:</strong> ${tripData.availableSeats}/${tripData.totalSeats}</p>
            <p><strong>Total Gas Cost:</strong> $${tripData.totalCost.toFixed(2)}</p>
            <p class="cost-highlight"><strong>Gas Cost per Person:</strong> $${costPerPerson.toFixed(2)}</p>
            ${tripData.notes ? `<p><strong>Notes:</strong> ${tripData.notes}</p>` : ''}
        </div>
        <div class="trip-footer">
            <button class="btn btn-success btn-sm join-trip-btn">Join Trip</button>
            <button class="btn btn-info btn-sm chat-trip-btn" data-destination="${tripData.destination}" data-creator="${tripData.creator}" style="display: none;">
                <i class="bi bi-chat-dots"></i> Chat
            </button>
            ${tripData.creator === 'You' ? `
                <button class="btn btn-danger btn-sm delete-trip-btn">
                    <i class="bi bi-trash"></i> Delete
                </button>
            ` : ''}
            <span class="trip-creator">Created by: ${tripData.creator}</span>
        </div>
        <div class="trip-participants" style="display: none;">
            <h6><i class="bi bi-people-fill"></i> Participants:</h6>
            <ul class="participants-list">
                <li><i class="bi bi-person-fill"></i> ${tripData.creator} (Creator)</li>
            </ul>
        </div>
    `;
    
    console.log('Trip card created successfully for:', tripData.destination);
    return card;
}

// Chat functionality
function openTripChat(destination, creator) {
    // Check if user has joined this trip
    const allTrips = [...document.querySelectorAll('.trip-card')];
    const currentTrip = allTrips.find(trip => trip.dataset.destination === destination);
    
    if (!currentTrip) {
        showErrorToast('Trip not found!');
        return;
    }
    
    // Check if user is an active participant (has joined the trip)
    const joinBtn = currentTrip.querySelector('.join-trip-btn');
    if (!joinBtn || !joinBtn.classList.contains('joined')) {
        showWarningToast('You must join this trip before accessing the chat!');
        return;
    }
    
    // Check if trip is still active (not expired)
    if (isTripExpired(currentTrip)) {
        showWarningToast('This trip has already passed. Chat is no longer available.');
        return;
    }
    
    // Store current trip info for chat
    window.currentTripChat = {
        destination: destination,
        creator: creator,
        participants: [creator, 'You'] // Default participants
    };
    
    // Open chat modal
    const chatModal = new bootstrap.Modal(document.getElementById('chatModal'));
    document.getElementById('chatModalLabel').innerHTML = `<i class="bi bi-chat-dots"></i> ${destination} Trip Chat`;
    
    // Load chat messages
    loadChatMessages(destination);
    
    // Set up chat input
    setupChatInput();
    
    chatModal.show();
}

function loadChatMessages(destination) {
    const chatMessages = document.getElementById('chatMessages');
    const tripKey = `trip_chat_${destination.replace(/\s+/g, '_')}`;
    
    try {
        let messages = JSON.parse(localStorage.getItem(tripKey) || '[]');
        
        // Add some sample messages if this is a new chat
        if (messages.length === 0) {
            messages = [
                {
                    sender: 'System',
                    content: `Welcome to the ${destination} trip chat! You can now communicate with other participants.`,
                    timestamp: new Date().toISOString(),
                    id: 'system-welcome'
                },
                {
                    sender: 'Sarah Johnson',
                    content: 'Hey everyone! Looking forward to this trip!',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    id: 'sample-1'
                },
                {
                    sender: 'Mike Chen',
                    content: 'Same here! What time should we meet up?',
                    timestamp: new Date(Date.now() - 1800000).toISOString(),
                    id: 'sample-2'
                }
            ];
            localStorage.setItem(tripKey, JSON.stringify(messages));
            console.log('Initialized new chat with sample messages for:', destination);
        }
        
        // Sort messages by timestamp to ensure proper order
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        chatMessages.innerHTML = '';
        
        messages.forEach((msg, index) => {
            const messageDiv = document.createElement('div');
            const isOwnMessage = msg.sender === 'You';
            const isSystemMessage = msg.sender === 'System';
            
            messageDiv.className = `chat-message ${isOwnMessage ? 'own-message' : isSystemMessage ? 'system-message' : 'other-message'}`;
            messageDiv.setAttribute('data-message-id', msg.id || index);
            
            // Format timestamp for display
            const messageTime = new Date(msg.timestamp);
            const timeString = messageTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
            
            messageDiv.innerHTML = `
                <div class="message-header">
                    <strong>${msg.sender}</strong>
                    <small class="text-muted">${timeString}</small>
                </div>
                <div class="message-content">${msg.content}</div>
            `;
            chatMessages.appendChild(messageDiv);
        });
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        console.log(`Loaded ${messages.length} messages for ${destination}`);
        
    } catch (error) {
        console.error('Error loading chat messages:', error);
        chatMessages.innerHTML = `
            <div class="chat-message system-message">
                <i class="bi bi-exclamation-triangle"></i> Error loading messages. Please refresh the page.
            </div>
        `;
    }
}

function setupChatInput() {
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendMessageBtn');
    
    const sendMessage = () => {
        const message = chatInput.value.trim();
        if (message && window.currentTripChat) {
            const tripKey = `trip_chat_${window.currentTripChat.destination.replace(/\s+/g, '_')}`;
            
            try {
                // Show saving indicator
                showSavingIndicator();
                
                // Get existing messages
                const messages = JSON.parse(localStorage.getItem(tripKey) || '[]');
                
                // Add the new message
                const newMessage = {
                    sender: 'You',
                    content: message,
                    timestamp: new Date().toISOString(),
                    id: Date.now() + Math.random() // Unique ID for each message
                };
                
                messages.push(newMessage);
                
                // Save to localStorage with error handling
                localStorage.setItem(tripKey, JSON.stringify(messages));
                
                // Verify the save was successful
                const savedMessages = JSON.parse(localStorage.getItem(tripKey) || '[]');
                if (savedMessages.length === messages.length) {
                    // Success - reload messages to show the new one
                    loadChatMessages(window.currentTripChat.destination);
                    
                    // Clear input
                    chatInput.value = '';
                    
                    // Show success feedback
                    sendBtn.innerHTML = '<i class="bi bi-check"></i>';
                    sendBtn.style.background = '#28a745';
                    setTimeout(() => {
                        sendBtn.innerHTML = '<i class="bi bi-send"></i>';
                        sendBtn.style.background = '';
                    }, 1000);
                    
                    console.log('Message saved successfully:', newMessage);
                } else {
                    throw new Error('Message save verification failed');
                }
            } catch (error) {
                console.error('Error saving message:', error);
                showErrorToast('Failed to save message. Please try again.');
            }
        } else if (!message) {
            // Show brief feedback for empty message
            chatInput.placeholder = 'Please enter a message...';
            chatInput.style.borderColor = '#dc3545';
            setTimeout(() => {
                chatInput.placeholder = 'Type your message...';
                chatInput.style.borderColor = '';
            }, 2000);
        }
    };
    
    // Clear any existing event listeners
    sendBtn.onclick = null;
    chatInput.onkeypress = null;
    
    // Add new event listeners
    sendBtn.onclick = sendMessage;
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            sendMessage();
        }
    };
    
    // Focus on input when modal opens
    setTimeout(() => {
        chatInput.focus();
    }, 300);
}

// Function to show message saving indicator
function showSavingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const savingDiv = document.createElement('div');
    savingDiv.className = 'chat-message system-message saving-indicator';
    savingDiv.innerHTML = `
        <div class="message-content">
            <i class="bi bi-arrow-clockwise"></i> Saving message...
        </div>
    `;
    chatMessages.appendChild(savingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Remove after 1 second
    setTimeout(() => {
        if (savingDiv.parentNode) {
            savingDiv.remove();
        }
    }, 1000);
}

function updateChatButtonVisibility() {
    // Check all trip cards and show/hide chat buttons based on join status
    const allTrips = [...document.querySelectorAll('.trip-card')];
    allTrips.forEach(trip => {
        const joinBtn = trip.querySelector('.join-trip-btn');
        const chatBtn = trip.querySelector('.chat-trip-btn');
        
        if (joinBtn && chatBtn) {
            if (joinBtn.classList.contains('joined')) {
                chatBtn.style.display = 'inline-block';
            } else {
                chatBtn.style.display = 'none';
            }
        }
    });
}

// Function to save joined trip state
function saveJoinedTrip(destination, creator) {
    const joinedTrips = JSON.parse(localStorage.getItem('joined_trips') || '[]');
    const tripData = {
        destination: destination,
        creator: creator,
        joinedAt: new Date().toISOString()
    };
    
    // Check if already joined
    const existingIndex = joinedTrips.findIndex(trip => trip.destination === destination);
    if (existingIndex === -1) {
        joinedTrips.push(tripData);
        localStorage.setItem('joined_trips', JSON.stringify(joinedTrips));
        console.log('Saved joined trip:', destination);
    }
}

// Function to remove joined trip state
function removeJoinedTrip(destination) {
    const joinedTrips = JSON.parse(localStorage.getItem('joined_trips') || '[]');
    const filteredTrips = joinedTrips.filter(trip => trip.destination !== destination);
    localStorage.setItem('joined_trips', JSON.stringify(filteredTrips));
    console.log('Removed joined trip:', destination);
}

// Function to restore joined trips on page load
function restoreJoinedTrips() {
    const joinedTrips = JSON.parse(localStorage.getItem('joined_trips') || '[]');
    console.log('Restoring joined trips:', joinedTrips);
    
    if (joinedTrips.length === 0) {
        console.log('No joined trips to restore');
        return;
    }
    
    console.log('Found', joinedTrips.length, 'joined trips to restore');
    
    joinedTrips.forEach(joinedTrip => {
        // Search for trip in all grids
        const allGrids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
        let tripCard = null;
        
        for (const gridId of allGrids) {
            const grid = document.getElementById(gridId);
            if (grid) {
                tripCard = grid.querySelector(`[data-destination="${joinedTrip.destination}"]`);
                if (tripCard) break;
            }
        }
        
        if (tripCard) {
            const joinBtn = tripCard.querySelector('.join-trip-btn');
            const chatBtn = tripCard.querySelector('.chat-trip-btn');
            const participantsSection = tripCard.querySelector('.trip-participants');
            
            if (joinBtn) {
                // Update button state
                joinBtn.textContent = 'Leave Trip';
                joinBtn.classList.remove('btn-success');
                joinBtn.classList.add('btn-warning');
                joinBtn.classList.add('joined');
                
                // Show chat button
                if (chatBtn) {
                    chatBtn.style.display = 'inline-block';
                }
                
                // Show participants section
                if (participantsSection) {
                    participantsSection.style.display = 'block';
                }
                
                // Update seats (decrease by 1)
                const seatsInfo = tripCard.querySelector('.trip-details p:nth-child(4)');
                if (seatsInfo) {
                    const seatsText = seatsInfo.textContent;
                    const availableSeats = parseInt(seatsText.match(/(\d+)\/\d+/)[1]);
                    const totalSeats = parseInt(seatsText.match(/\d+\/(\d+)/)[1]);
                    
                    if (availableSeats > 0) {
                        const newSeats = availableSeats - 1;
                        seatsInfo.innerHTML = `<strong>Seats Available:</strong> ${newSeats}/${totalSeats}`;
                        updateBadge(tripCard, newSeats);
                    }
                }
                
                // Add user to participants
                addParticipant(tripCard);
                
                // Move to appropriate tab based on trip status
                const currentGrid = tripCard.closest('.trips-grid');
                const myTripsGrid = document.getElementById('myTripsGrid');
                const pastTripsGrid = document.getElementById('pastTripsGrid');
                
                // Check if trip is expired
                if (isTripExpired(tripCard)) {
                    // Move to Past Trips if expired
                    if (pastTripsGrid && !tripCard.closest('#pastTripsGrid')) {
                        const clonedCard = tripCard.cloneNode(true);
                        pastTripsGrid.appendChild(clonedCard);
                        tripCard.remove();
                        console.log('Moved expired joined trip to Past Trips:', joinedTrip.destination);
                    }
                } else {
                    // For joined trips, always move to My Trips tab
                    if (myTripsGrid && !tripCard.closest('#myTripsGrid')) {
                        const clonedCard = tripCard.cloneNode(true);
                        myTripsGrid.appendChild(clonedCard);
                        console.log('Moved joined trip to My Trips:', joinedTrip.destination);
                    }
                    
                    // Check if trip is full and also add to Full Trips tab
                    const seatsInfo = tripCard.querySelector('.trip-details p:nth-child(4)');
                    if (seatsInfo) {
                        const availableSeats = parseInt(seatsInfo.textContent.match(/(\d+)\/\d+/)[1]);
                        if (availableSeats === 0) {
                            // Trip is full - also add to Full Trips tab
                            const fullTripsGrid = document.getElementById('fullTripsGrid');
                            if (fullTripsGrid && !tripCard.closest('#fullTripsGrid')) {
                                const fullClonedCard = tripCard.cloneNode(true);
                                fullTripsGrid.appendChild(fullClonedCard);
                                console.log('Also added full joined trip to Full Trips tab:', joinedTrip.destination);
                            }
                        }
                    }
                    
                    // Remove from current grid if not already in My Trips
                    if (!tripCard.closest('#myTripsGrid')) {
                        tripCard.remove();
                    }
                }
                
                console.log('Restored joined state for:', joinedTrip.destination);
            }
        }
    });
}

// Function to check if a trip has expired
function isTripExpired(tripCard) {
    const tripDetails = tripCard.querySelector('.trip-details');
    if (!tripDetails) return false;
    
    const dateElement = tripDetails.querySelector('p:nth-child(2)'); // Date is usually the 2nd p element
    if (!dateElement) return false;
    
    const dateText = dateElement.textContent;
    const dateMatch = dateText.match(/Date:\s*(.+)/);
    if (!dateMatch) return false;
    
    const tripDate = new Date(dateMatch[1]);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    
    return tripDate < today;
}

// Function to move expired trips to Past Trips tab
function moveExpiredTripsToPast() {
    const allGrids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid'];
    const pastTripsGrid = document.getElementById('pastTripsGrid');
    
    if (!pastTripsGrid) return;
    
    allGrids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        const tripCards = [...grid.querySelectorAll('.trip-card')];
        tripCards.forEach(tripCard => {
            if (isTripExpired(tripCard)) {
                console.log('Moving expired trip to Past Trips:', tripCard.dataset.destination);
                
                // Check if trip already exists in Past Trips to avoid duplicates
                const existingPastTrip = pastTripsGrid.querySelector(`[data-destination="${tripCard.dataset.destination}"]`);
                if (!existingPastTrip) {
                    // Clone the trip card and add to past trips
                    const clonedCard = tripCard.cloneNode(true);
                    pastTripsGrid.appendChild(clonedCard);
                }
                
                // Remove from current grid
                tripCard.remove();
            }
        });
    });
    
    // Update results count after moving expired trips
    updateResultsCount();
}

// Function to load past trips
function loadPastTrips(pastTripsGrid) {
    // Check if there are already trips in the Past Trips grid
    const existingTrips = pastTripsGrid.querySelectorAll('.trip-card');
    
    if (existingTrips.length === 0) {
        // No trips in Past Trips grid, show empty state
        pastTripsGrid.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-clock-history" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3 text-muted">No past trips</h4>
                <p class="text-muted">Expired trips will appear here automatically.</p>
            </div>
        `;
    } else {
        // There are trips in Past Trips grid, remove any empty state message
        const emptyState = pastTripsGrid.querySelector('.text-center');
        if (emptyState) {
            emptyState.remove();
        }
    }
}

// Function to clear duplicate trips
function clearDuplicates() {
    const allGrids = ['tripsGrid', 'myTripsGrid', 'fullTripsGrid', 'pastTripsGrid'];
    const seenTrips = new Set();
    
    allGrids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        const tripCards = [...grid.querySelectorAll('.trip-card')];
        tripCards.forEach(tripCard => {
            const destination = tripCard.dataset.destination;
            const creator = tripCard.querySelector('.trip-creator')?.textContent || '';
            const date = tripCard.querySelector('.trip-details p:nth-child(2)')?.textContent || '';
            const time = tripCard.querySelector('.trip-details p:nth-child(3)')?.textContent || '';
            
            // Create a more unique key using destination, creator, date, and time
            const uniqueKey = `${destination}-${creator}-${date}-${time}`;
            
            if (seenTrips.has(uniqueKey)) {
                console.log('Removing duplicate trip:', destination, creator);
                tripCard.remove();
            } else {
                seenTrips.add(uniqueKey);
            }
        });
    });
    
    updateResultsCount();
}

// Function to validate trip date before showing
function validateTripDate(tripData) {
    const tripDate = new Date(tripData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    tripDate.setHours(0, 0, 0, 0);
    
    const isValid = tripDate >= today;
    console.log('Validating trip date:', tripData.destination, tripData.date, 'tripDate:', tripDate, 'today:', today, 'isValid:', isValid);
    
    return isValid;
}
