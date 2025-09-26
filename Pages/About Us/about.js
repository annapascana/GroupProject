// about.js - About Us Page JavaScript

// Dark mode toggle functionality
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    updateDarkModeIcon(isDarkMode);
}

function updateDarkModeIcon(isDarkMode) {
    const icon = document.getElementById('darkModeIcon');
    const text = document.getElementById('darkModeText');
    
    if (icon) {
        icon.classList.toggle('bi-sun-fill', isDarkMode);
        icon.classList.toggle('bi-moon-fill', !isDarkMode);
    }
    
    if (text) {
        text.textContent = isDarkMode ? 'Light Mode' : 'Dark Mode';
    }
}

// Apply theme on page load
function applySavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }
    updateDarkModeIcon(savedTheme === 'dark');
}

// Animate statistics on scroll
function animateStats() {
    const statItems = document.querySelectorAll('.stat-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statValue = entry.target.querySelector('.stat-value');
                const finalValue = statValue.textContent;
                
                // Extract number from text (e.g., "500+" -> 500)
                const number = parseInt(finalValue.replace(/\D/g, ''));
                
                if (number && number > 0) {
                    animateNumber(statValue, 0, number, 2000, finalValue);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statItems.forEach(item => observer.observe(item));
}

// Animate number counting effect
function animateNumber(element, start, end, duration, suffix) {
    const startTime = performance.now();
    
    function updateNumber(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (end - start) * easeOutQuart);
        
        element.textContent = current + suffix.replace(/\d/g, '');
        
        if (progress < 1) {
            requestAnimationFrame(updateNumber);
        }
    }
    
    requestAnimationFrame(updateNumber);
}

// Smooth scrolling for anchor links
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Add hover effects to cards
function setupCardHoverEffects() {
    const cards = document.querySelectorAll('.card, .stat-item, .value-item');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
}

// Initialize page functionality
function initializePage() {
    applySavedTheme();
    animateStats();
    setupSmoothScrolling();
    setupCardHoverEffects();
    
    // Add loading animation
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
}

// Event listeners
document.addEventListener('DOMContentLoaded', initializePage);

// Handle window resize for responsive adjustments
window.addEventListener('resize', function() {
    // Recalculate any size-dependent elements if needed
    const heroSection = document.querySelector('.hero-section');
    if (heroSection && window.innerWidth < 768) {
        heroSection.style.padding = '60px 0';
    } else if (heroSection) {
        heroSection.style.padding = '80px 0';
    }
});

// Add click tracking for analytics (placeholder)
function trackClick(element, action) {
    console.log(`Tracked click: ${action} on ${element}`);
    // Here you would integrate with your analytics service
    // Example: gtag('event', 'click', { event_category: 'About Us', event_label: action });
}

// Add event listeners for tracking
document.addEventListener('click', function(e) {
    if (e.target.matches('.btn')) {
        const buttonText = e.target.textContent.trim();
        trackClick(e.target, `Button: ${buttonText}`);
    }
    
    if (e.target.matches('.footer-link')) {
        const linkText = e.target.textContent.trim();
        trackClick(e.target, `Footer Link: ${linkText}`);
    }
});

// Export functions for potential external use
window.AboutUsPage = {
    toggleDarkMode,
    animateStats,
    trackClick
};
