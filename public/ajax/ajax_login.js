function sendDataUser(mail, password) {
    var formData = new FormData();
    formData.append('mail', mail);
    formData.append('password', password);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/login_user', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('responding to login');
            document.getElementById('mail').value = '';
            document.getElementById('password').value = '';
        }
        else {
            console.log('error');
        }
    };
    xhr.onerror = function() {
        console.error('error in login');
    };
    xhr.send(formData);
}

document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('btn_get_into').addEventListener('submit', function(event) {
        var mail_user = document.getElementById('mail').value;
        var password_user = document.getElementById('password').value;

        sendDataUser(mail_user, password_user);
    });
});