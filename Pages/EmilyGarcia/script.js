// Emily Garcia - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    console.log('Emily Garcia page loaded successfully!');
    
    // Add any custom JavaScript functionality here
    const container = document.querySelector('.container');
    
    if (container) {
        container.addEventListener('click', function() {
            console.log('Container clicked!');
        });
    }
});
