document.addEventListener("DOMContentLoaded", function() {
    // Loader logic
    setTimeout(function() {
        document.body.classList.add('loaded');
        setTimeout(function() {
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('content').classList.remove('hidden');
        }, 1000); // Same duration as the opacity transition in CSS
    }, 3000); // Reduced duration for faster loading
});
