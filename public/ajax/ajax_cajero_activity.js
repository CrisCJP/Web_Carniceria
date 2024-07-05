var modal = document.getElementById('modalEfectivo');
//var modal_envoice = document.getElementById('modalEnvoicedetails');
var submitEfectivo = document.getElementById('submitEfectivo');

function value_boxes() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/get_valuesboxes', true);

    xhr.onload = function() {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);

            if ('message' in json) { 
                alert(json.message);
            }
            else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
                if (json.infobox == true) {
                    modal.style.display = 'block';
                }
                else {
                    modal.style.display = 'none';
                }
            }
        }
        else {
            alert('Error al conectar con el servidor', xhr.status);
        }
    };

    xhr.send();
};

submitEfectivo.onclick = function() {
    modal.style.display = 'block';
    var efectivo = document.getElementById('inputEfectivo').value;
    if (efectivo != null && efectivo != '' && efectivo > 0) {
        modal.style.display = 'none';
        add_datasforcash(efectivo);
    } else {
        alert('Debes ingresar la cantidad de efectivo, asegurate que se mayor que 0 y evitar operaciones.');
    }
};

function add_datasforcash(efectivo) {
    var formData = new FormData();
    formData.append('efectivo', efectivo);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/add_datasforcash', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);

            if ('message' in json) {
                alert(json.message);
            }
            else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
                if (json.success) {
                    confirm('Se agrego el monto inicial de la caja, "Recuerde cerrar la caja en el modulo de Generar Arqueo"');
                }
                else {
                    alert('Error al generar la factura');
                }
            }
        }
        else {
            alert('Error al conectar con el servidor', xhr.status);
        }
    };
    xhr.send(formData);
};