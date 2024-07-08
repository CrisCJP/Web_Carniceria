let list = [];
let temp_total = 0;
//add the denomination
function addArqueoDetails(denomination, amount) {
    var formData = new FormData();
    formData.append('denomination', denomination);
    formData.append('amount', amount);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/addArqueoDetails', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            
            if ('message' in json) {
                alert('Error al agregar el detalle de arqueo.', json.message);
                throw new Error('Error al agregar el detalle de arqueo');
            }
            else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
                if (json.total) {
                    list.push ({denomination: denomination, money: json.money, amount: amount, total: json.total, idcaja: json.monto_cash.IdCaja, idusuario: json.monto_cash.IdUsuario_Creacion, montoinicial: json.monto_cash.Monto_Inicial, fecha: json.monto_cash.Fecha });
                    updateTable(list, json.ingreso, json.monto_cash.Monto_Inicial, json.dolar);
                    document.getElementById('btnTerminar').disabled = false;
                    document.getElementById('txtObservacion').disabled = false;
                    document.getElementById('txtIngreso').value = json.ingreso;
                    
                }
                else {
                    alert('json no es un objeto');
                    console.log(json);
                }
            }
            else {
                alert('Ups algo fallo');
            }
            
        }
        else {
            alert('Error al agregar el detalle de arqueo.', xhr.status);
        }
    };
    xhr.send(formData);
};

//DOM's methods
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnAgregar').addEventListener('click', function(event) {
        var denomination = document.getElementById('cboBuscarPor').value;
        var amount = document.getElementById('txtCantidad').value;

        if (esFlotante(amount) == true){
            alert('Solo se permiten valores enteros para el campo de la cantidad.');
            event.preventDefault();
        }
        else {
            addArqueoDetails(denomination, amount);
        }
    });

    document.getElementById('btnTerminar').addEventListener('click', function(event) {
        if (list.length > 0) {
            var obs = document.getElementById('txtObservacion').value;
            ld_Arqueo(list, obs);
            
        }
        else {
            alert('No hay detalles de arqueo para terminar.');
            event.preventDefault();
        }
    });
});



function esFlotante(numero) {
    return Number.isFinite(numero) && !Number.isInteger(numero);
};

function updateTable(array, ingreso, monto, dolar) {
    var tbody = document.getElementById('tbDetallesDenominacion').getElementsByTagName('tbody')[0];

    // Limpiar el contenido existente del tbody
    tbody.innerHTML = '';
    let total = 0;
    // Agregar nuevos datos al tbody
    array.forEach(function(item) {
        
        var fila = tbody.insertRow();
        var celdaDinero = fila.insertCell();
        var celdaCantidad = fila.insertCell();
        var celdaTotal = fila.insertCell();

        if (item.denomination < 13) {
            celdaDinero.textContent = 'C$ ' + item.money;
            celdaCantidad.textContent = item.amount;
            celdaTotal.textContent = 'C$ ' + item.total;
            total += parseFloat(item.total);
        }
        else {
            celdaDinero.textContent = '$ ' + item.money;
            celdaCantidad.textContent = item.amount;
            celdaTotal.textContent = '$ ' + item.total;
            total += parseFloat(item.total * dolar);
        }
    });
    document.getElementById('txtSobrante').value = '';
    document.getElementById('txtPerdida').value = '';

    document.getElementById('txtContado').value = 'C$ ' + total.toFixed(2);
    document.getElementById('txtGanancia').value = 'C$ ' + (total - monto).toFixed(2);

    if ((total - monto) == ingreso ) {
        document.getElementById('txtSobrante').value = 'C$ 0';
        document.getElementById('txtPerdida').value = 'C$ 0';
    }
    else if ((total - monto) > ingreso ) {
        document.getElementById('txtSobrante').value = 'C$ ' + ((total - monto) - ingreso).toFixed(2);
    }
    else {
        document.getElementById('txtPerdida').value = 'C$ ' + ((total - monto) - ingreso).toFixed(2) * -1;
    }
    document.getElementById('txtCantidad').value = '';
    temp_total += total;
};

//finally
function ld_Arqueo (array, text) {
    var formData = new FormData();
    formData.append('list', JSON.stringify(list));
    formData.append('total_ingreso', temp_total);
    formData.append('observacion', text);

    

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/load_arqueo', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if ('message' in json) {
                alert('Error al agregar el arqueo.', json.message);
                preventDefault();
            }
            else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
                confirm('El arqueo se realizo y se guardo con exito');
                window.location.replace('/arqueo');
            }
        }
        else {
            alert('Error al agregar el arqueo.', xhr.status);
            preventDefault();
        }
    };
    xhr.send(formData);
};