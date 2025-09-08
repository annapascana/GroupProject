// CrimsonCollab Dashboard JavaScript

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (!checkAuthentication()) {
        return;
    }
    
    initializeDashboard();
});

// Check authentication
function checkAuthentication() {
    const session = userManager.getCurrentSession();
    
    if (!session) {
        showNotification('Please log in to access the dashboard.', 'warning');
        setTimeout(() => {
            window.location.href = './login.html';
        }, 2000);
        return false;
    }
    
    // Update user info in sidebar
    updateUserInfo(session);
    return true;
}

// Update user info in sidebar
function updateUserInfo(session) {
    const userNameElement = document.querySelector('.user-name');
    const userEmailElement = document.querySelector('.user-email');
    
    if (userNameElement) {
        userNameElement.textContent = `${session.firstName} ${session.lastName}`;
    }
    
    if (userEmailElement) {
        userEmailElement.textContent = session.email;
    }
}

// Initialize all dashboard functionality
function initializeDashboard() {
    setupNavigation();
    setupViewToggle();
    setupSearch();
    setupFilters();
    setupCardInteractions();
    setupMobileMenu();
    setupAccessibility();
    setupAnimations();
}

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav items
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Add active class to clicked item
            this.closest('.nav-item').classList.add('active');
            
            // Handle specific navigation actions
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
        case 'Calendar':
            showNotification('Calendar feature coming soon!', 'info');
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
        userManager.clearSession();
        
        setTimeout(() => {
            window.location.href = './login.html';
        }, 1000);
    }
}

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

// Filters Setup
function setupFilters() {
    setupTypeFilter();
    setupStatusFilter();
    setupItemsPerPage();
}

// Type filter setup
function setupTypeFilter() {
    const typeDropdown = document.querySelector('[data-bs-toggle="dropdown"]');
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
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on favorite button
            if (e.target.closest('.btn-favorite')) {
                return;
            }
            
            const cardType = this.getAttribute('data-type');
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
        'travel': 'Travel',
        'innovate': 'UA Innovate'
    };
    
    const typeName = typeNames[type] || type;
    
    // Special handling for travel card
    if (type === 'travel') {
        openTravelPage();
        return;
    }
    
    showNotification(`Opening ${typeName} collaboration: ${code}`, 'info');
    
    // In a real app, this would navigate to the specific collaboration page
    setTimeout(() => {
        console.log(`Navigating to ${type} collaboration: ${code}`);
        // window.location.href = `./collaboration.html?type=${type}&code=${code}`;
    }, 1000);
}

// Open travel page function
function openTravelPage() {
    showNotification('Opening Travel page...', 'info');
    
    setTimeout(() => {
        window.location.href = './Pages/EmilyGarcia/travel.html';
    }, 1000);
}

// Setup favorite buttons
function setupFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleFavorite(this);
        });
    });
}

// Toggle favorite
function toggleFavorite(button) {
    const isFavorited = button.classList.contains('favorited');
    const icon = button.querySelector('i');
    
    if (isFavorited) {
        button.classList.remove('favorited');
        icon.className = 'bi bi-star';
        showNotification('Removed from favorites', 'info');
    } else {
        button.classList.add('favorited');
        icon.className = 'bi bi-star-fill';
        showNotification('Added to favorites', 'success');
    }
}

// Mobile Menu Setup
function setupMobileMenu() {
    // Create mobile menu toggle button
    const mobileToggle = document.createElement('button');
    mobileToggle.className = 'mobile-menu-toggle';
    mobileToggle.innerHTML = '<i class="bi bi-list"></i>';
    mobileToggle.setAttribute('aria-label', 'Toggle navigation menu');
    
    document.body.appendChild(mobileToggle);
    
    const sidebar = document.querySelector('.sidebar');
    
    mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('open');
        
        // Update button icon
        const icon = this.querySelector('i');
        if (sidebar.classList.contains('open')) {
            icon.className = 'bi bi-x';
        } else {
            icon.className = 'bi bi-list';
        }
    });
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 992) {
            if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                mobileToggle.querySelector('i').className = 'bi bi-list';
            }
        }
    });
}

// Accessibility Setup
function setupAccessibility() {
    // Add keyboard navigation for cards
    const cards = document.querySelectorAll('.collaboration-card');
    
    cards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
    
    // Add ARIA labels
    const favoriteButtons = document.querySelectorAll('.btn-favorite');
    favoriteButtons.forEach(button => {
        button.setAttribute('aria-label', 'Add to favorites');
    });
    
    // Add ARIA labels to dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-toggle');
    dropdowns.forEach(dropdown => {
        dropdown.setAttribute('aria-haspopup', 'true');
        dropdown.setAttribute('aria-expanded', 'false');
    });
}

// Setup animations
function setupAnimations() {
    // Add fade-in animation to cards
    const cards = document.querySelectorAll('.collaboration-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Add slide-in animation to sidebar
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        sidebar.classList.add('slide-in');
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

// Utility functions
const utils = {
    // Debounce function
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Format date
    formatDate: function(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(date);
    },
    
    // Generate unique ID
    generateId: function() {
        return Math.random().toString(36).substr(2, 9);
    }
};

// Export utils for potential external use
window.CrimsonCollabDashboard = utils;
