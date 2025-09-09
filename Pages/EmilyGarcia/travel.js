document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    setupSearch();
    setupFilter();
    setupCreateTrip();
    setupJoinLeave();
    
    // Clear any existing duplicates first
    clearDuplicates();
    
    loadTrips();
    restoreJoinedTrips();
    removeExpiredTrips();
    clearDuplicates(); // Clear duplicates again after loading
}

// Function to reset all trips and clear localStorage
function resetAllTrips() {
    if (confirm('Are you sure you want to reset all trips? This will clear all data and reload example trips.')) {
        localStorage.removeItem('ua_trips');
        localStorage.removeItem('example_trips');
        localStorage.removeItem('example_trips_loaded');
        localStorage.removeItem('joined_trips');
        
        // Reload the page to start fresh
        location.reload();
    }
}

function setupSearch() {
    const input = document.getElementById('searchInput');
    input.addEventListener('input', () => filterTrips(input.value.toLowerCase()));
}

function setupFilter() {
    const filter = document.getElementById('tripTypeFilter');
    filter.addEventListener('change', () => filterTripsByType(filter.value));
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
        alert('Cannot create a trip for a date that has already passed!');
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
            <button class="btn btn-danger btn-sm delete-trip-btn" onclick="deleteTrip(this)">
                <i class="bi bi-trash"></i> Delete
            </button>
            <span class="trip-creator">Created by: You</span>
        </div>
    `;
    document.getElementById('tripsGrid').prepend(card);
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

function deleteTrip(button) {
    const card = button.closest('.trip-card');
    const destination = card.dataset.destination;
    const creator = card.querySelector('.trip-creator').textContent.replace('Created by: ', '');
    
    // Confirmation dialog
    if (!confirm(`Are you sure you want to delete the trip to ${destination}? This action cannot be undone.`)) {
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
    
    // Show success message
    alert('Trip deleted successfully!');
}

function setupJoinLeave() {
    document.addEventListener('click', e => {
        if (e.target.classList.contains('join-trip-btn')) {
            const btn = e.target;
            if (btn.classList.contains('joined')) leaveTrip(btn);
            else joinTrip(btn);
        }
    });
}

function joinTrip(btn) {
    const card = btn.closest('.trip-card');
    const seats = card.querySelector('.trip-details p:nth-child(4)');
    let [available, total] = seats.textContent.match(/\d+/g).map(Number);
    if (available <= 0) return alert('Trip is full!');

    if (confirm(`Join this trip to ${card.dataset.destination}?`)) {
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
        
        // Move trip from Available Trips to My Trips
        const myTripsGrid = document.getElementById('myTripsGrid');
        if (myTripsGrid) {
            // Clone the trip card
            const clonedCard = card.cloneNode(true);
            
            // Add to My Trips grid
            myTripsGrid.appendChild(clonedCard);
            
            // Remove from Available Trips grid
            card.remove();
        }
        
        // Save joined trip state
        saveJoinedTrip(card.dataset.destination, card.querySelector('.trip-creator').textContent.replace('Created by: ', ''));
        
        // Switch to My Trips tab
        const myTripsTab = document.getElementById('my-trips-tab');
        if (myTripsTab) {
            myTripsTab.click();
        }
        
        saveTrips();
    }
}

function leaveTrip(btn) {
    const card = btn.closest('.trip-card');
    const seats = card.querySelector('.trip-details p:nth-child(4)');
    let [available, total] = seats.textContent.match(/\d+/g).map(Number);
    if(confirm('Leave this trip?')) {
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
        
        // Move trip back to Available Trips
        const availableTripsGrid = document.getElementById('tripsGrid');
        if (availableTripsGrid) {
            // Check if trip already exists in Available Trips
            const existingTrip = availableTripsGrid.querySelector(`[data-destination="${card.dataset.destination}"]`);
            if (!existingTrip) {
                // Clone the trip card
                const clonedCard = card.cloneNode(true);
                
                // Add back to Available Trips grid
                availableTripsGrid.appendChild(clonedCard);
            }
            
            // Remove from My Trips grid
            card.remove();
        }
        
        // Remove joined trip state
        removeJoinedTrip(card.dataset.destination);
        
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
    const count = [...document.querySelectorAll('.trip-card')].filter(c=>c.style.display!=='none').length;
    document.getElementById('resultsCount').textContent=`${count} trip${count!==1?'s':''} found`;
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
    const activeGrid = document.getElementById('tripsGrid');
    const fullGrid = document.getElementById('fullTripsGrid');
    const myTripsGrid = document.getElementById('myTripsGrid');
    const pastTripsGrid = document.getElementById('pastTripsGrid');
    
    // Clear existing content first
    activeGrid.innerHTML = '';
    fullGrid.innerHTML = '';
    myTripsGrid.innerHTML = '';
    pastTripsGrid.innerHTML = '';
    
    // Load example trips only if they haven't been loaded before
    if (!localStorage.getItem('example_trips_loaded')) {
        loadExampleTrips(activeGrid, fullGrid);
        localStorage.setItem('example_trips_loaded', 'true');
    } else {
        // Load example trips from localStorage
        loadExampleTripsFromStorage(activeGrid, fullGrid);
    }
    
    // Load user-created trips from localStorage (only trips created by "You")
    const data=JSON.parse(localStorage.getItem('ua_trips')||'[]');
    data.forEach(html=>{
        const div=document.createElement('div'); div.innerHTML=html;
        const tripCard = div.firstChild;
        
        // Only load trips created by "You" (user-created trips)
        const creator = tripCard.querySelector('.trip-creator');
        if (creator && creator.textContent.includes('Created by: You')) {
            // Check if trip is expired
            if (isTripExpired(tripCard)) {
                pastTripsGrid.appendChild(tripCard);
            } else {
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
            }
        }
    });
    
    // Load my trips
    loadMyTrips(myTripsGrid);
    
    // Load past trips
    loadPastTrips(pastTripsGrid);
    
    // Update chat button visibility for all trips
    updateChatButtonVisibility();
    
    // Set up periodic check for expired trips (every 5 minutes)
    setInterval(() => {
        moveExpiredTripsToPast();
    }, 5 * 60 * 1000);
    
    updateResultsCount();
}

function loadExampleTrips(activeGrid, fullGrid) {
    const exampleTrips = [
        {
            type: 'airport',
            destination: 'Atlanta Airport',
            date: '2025-01-15',
            time: '08:30',
            totalSeats: 4,
            availableSeats: 2,
            totalCost: 48.00,
            creator: 'Jessica Chen',
            notes: 'Spring semester break - international flight'
        },
        {
            type: 'weekend',
            destination: 'Gulf Shores, AL',
            date: '2025-01-25',
            time: '09:00',
            totalSeats: 3,
            availableSeats: 1,
            totalCost: 35.00,
            creator: 'Marcus Williams',
            notes: 'Beach weekend getaway!'
        },
        {
            type: 'awaygames',
            destination: 'Auburn University',
            date: '2025-02-08',
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
            date: '2025-01-20',
            time: '16:30',
            totalSeats: 2,
            availableSeats: 1,
            totalCost: 28.00,
            creator: 'Sarah Davis',
            notes: 'Visiting family for MLK weekend'
        },
        {
            type: 'airport',
            destination: 'Nashville Airport',
            date: '2025-02-14',
            time: '06:00',
            totalSeats: 3,
            availableSeats: 2,
            totalCost: 55.00,
            creator: 'Alex Thompson',
            notes: 'Valentine\'s weekend trip'
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
    
    exampleTrips.forEach(trip => {
        // Only show trips that haven't expired
        if (validateTripDate(trip)) {
            const tripCard = createExampleTripCard(trip);
            if (trip.availableSeats === 0) {
                fullGrid.appendChild(tripCard);
            } else {
                activeGrid.appendChild(tripCard);
            }
        }
    });
    
    // Save example trips to localStorage for future loads
    const exampleTripsHTML = [];
    const allExampleCards = [...activeGrid.querySelectorAll('.trip-card'), ...fullGrid.querySelectorAll('.trip-card')];
    allExampleCards.forEach(card => {
        if (card.querySelector('.trip-creator').textContent.includes('Jessica Chen') || 
            card.querySelector('.trip-creator').textContent.includes('Marcus Williams') ||
            card.querySelector('.trip-creator').textContent.includes('Tyler Johnson') ||
            card.querySelector('.trip-creator').textContent.includes('Sarah Davis')) {
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
    // Get all trips that the user has joined or created
    const allTrips = [...document.querySelectorAll('.trip-card')];
    const myTrips = allTrips.filter(trip => {
        // First check if trip has expired
        if (isTripExpired(trip)) {
            return false;
        }
        
        // Check if user has joined this trip (button shows "Leave Trip")
        const joinBtn = trip.querySelector('.join-trip-btn');
        if (joinBtn && joinBtn.classList.contains('joined')) {
            return true;
        }
        
        // Check if user created this trip (for user-created trips)
        const creator = trip.querySelector('.trip-creator');
        if (creator && creator.textContent.includes('You')) {
            return true;
        }
        
        return false;
    });
    
    // Only update if the grid is empty or if we're not already showing the trips
    if (myTripsGrid.children.length === 0) {
        if (myTrips.length === 0) {
            myTripsGrid.innerHTML = `
                <div class="text-center py-5">
                    <i class="bi bi-calendar-x" style="font-size: 3rem; color: #6c757d;"></i>
                    <h4 class="mt-3 text-muted">No trips yet</h4>
                    <p class="text-muted">Join a trip or create your own to see it here!</p>
                </div>
            `;
        } else {
            myTrips.forEach(trip => {
                const clonedTrip = trip.cloneNode(true);
                myTripsGrid.appendChild(clonedTrip);
            });
        }
    }
}

function createExampleTripCard(tripData) {
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
            <button class="btn btn-info btn-sm chat-trip-btn" onclick="openTripChat('${tripData.destination}', '${tripData.creator}')" style="display: none;">
                <i class="bi bi-chat-dots"></i> Chat
            </button>
            ${tripData.creator === 'You' ? `
                <button class="btn btn-danger btn-sm delete-trip-btn" onclick="deleteTrip(this)">
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
    
    return card;
}

// Chat functionality
function openTripChat(destination, creator) {
    // Check if user has joined this trip
    const allTrips = [...document.querySelectorAll('.trip-card')];
    const currentTrip = allTrips.find(trip => trip.dataset.destination === destination);
    
    if (!currentTrip) {
        alert('Trip not found!');
        return;
    }
    
    const joinBtn = currentTrip.querySelector('.join-trip-btn');
    if (!joinBtn || !joinBtn.classList.contains('joined')) {
        alert('You must join this trip before accessing the chat!');
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
                alert('Failed to save message. Please try again.');
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
    
    joinedTrips.forEach(joinedTrip => {
        const allTrips = [...document.querySelectorAll('.trip-card')];
        const tripCard = allTrips.find(trip => trip.dataset.destination === joinedTrip.destination);
        
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
                
                // Move to My Trips tab if not already there
                const myTripsGrid = document.getElementById('myTripsGrid');
                if (myTripsGrid && !tripCard.closest('#myTripsGrid')) {
                    const clonedCard = tripCard.cloneNode(true);
                    myTripsGrid.appendChild(clonedCard);
                    tripCard.remove();
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
    
    allGrids.forEach(gridId => {
        const grid = document.getElementById(gridId);
        if (!grid) return;
        
        const tripCards = [...grid.querySelectorAll('.trip-card')];
        tripCards.forEach(tripCard => {
            if (isTripExpired(tripCard)) {
                console.log('Moving expired trip to Past Trips:', tripCard.dataset.destination);
                // Clone the trip card and add to past trips
                const clonedCard = tripCard.cloneNode(true);
                pastTripsGrid.appendChild(clonedCard);
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
    // Get all expired trips from localStorage
    const data = JSON.parse(localStorage.getItem('ua_trips') || '[]');
    const expiredTrips = [];
    
    data.forEach(html => {
        const div = document.createElement('div');
        div.innerHTML = html;
        const tripCard = div.firstChild;
        
        if (isTripExpired(tripCard)) {
            expiredTrips.push(tripCard);
        }
    });
    
    // Clear existing content
    pastTripsGrid.innerHTML = '';
    
    if (expiredTrips.length === 0) {
        pastTripsGrid.innerHTML = `
            <div class="text-center py-5">
                <i class="bi bi-clock-history" style="font-size: 3rem; color: #6c757d;"></i>
                <h4 class="mt-3 text-muted">No past trips</h4>
                <p class="text-muted">Expired trips will appear here automatically.</p>
            </div>
        `;
    } else {
        expiredTrips.forEach(trip => {
            const clonedTrip = trip.cloneNode(true);
            pastTripsGrid.appendChild(clonedTrip);
        });
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
    
    return tripDate >= today;
}
