document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('logout-link').addEventListener('click', function(event) {
        event.preventDefault();

        window.location.replace('/login');
    });
});