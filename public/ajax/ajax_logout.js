document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('logout-link').addEventListener('click', function(event) {
        event.preventDefault();

        window.history.pushState(null, "", window.location.href);
        window.onpopstate = function() {
            window.history.pushState(null, "", window.location.href);
        };

        window.location.replace('/login');
    });
});