document.getElementById('restoredresp').addEventListener('click', function(event) {
    event.preventDefault(); // Evitar la navegación por defecto

    var formData = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/restaurarrespaldo', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            var answer = xhr.responseText;
            alert(answer); // Mostrar el mensaje de éxito o error
        } else {
            console.log("Error al restaurar la base de datos.");
            alert('Error al restaurar la base de datos.');
        }
    };

    xhr.onerror = function() {
        console.error("Request failed");
        alert('Hubo un error en la solicitud.');
    };

    xhr.send(formData); // Enviar la solicitud
});