var span = document.getElementsByClassName('close_changedolar')[0];

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('cambiar_valor_dolar').addEventListener('click', function() {
        var modal_changedolar = document.getElementById('modalChangedolar');
        modal_changedolar.style.display = 'block';
    });

    document.getElementById('submitChangedolar').addEventListener('click', function(event) {
        var modal_changedolar = document.getElementById('modalChangedolar');
        var input_dolar = document.getElementById('inputChangedolar').value;
        if (esNumeroPositivo(input_dolar) == true) {
            if (confirm('Esta seguro de cambiar el valor del Dolar?') == false) {
                modal_changedolar.style.display = 'none';
                event.preventDefault();
            }
            else {
                set_changedolar(input_dolar);
            }
        }
        else {
            alert('El valor debe ser un número positivo');
            event.preventDefault();
        }
        
    });
});

function esNumeroPositivo(valor) {
    let numero = parseFloat(valor);
    return !isNaN(numero) && numero > 0;
};

function set_changedolar(change) {
    var formData = new FormData();
    formData.append('change', change);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/setChangedolar', true);  
    xhr.onload = function() {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if ('message' in json) {
                alert(json.message);
                preventDefault();
            }
            else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
                alert('Se cambio el valor del dolar de: C$ ' + change + ' Córdobas');
                // Recargar la página actual sin caché
                window.location.reload(true);
            }
        }
        else {
            alert('Error al cambiar el valor del dólar', xhr.status);
        }
    };
    xhr.send(formData);
};

span.onclick = function() {
    var modal_changedolar = document.getElementById('modalChangedolar');
    modal_changedolar.style.display = 'none';
};