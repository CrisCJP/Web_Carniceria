// Get the history of the sales for date range
function getHistoryInvoiceforDate(initial_date, final_date) {
    var formDate = new FormData();
    formDate.append('start_date', initial_date);
    formDate.append('end_date', final_date);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getHistoryInvoiceforDate', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                const tbody = document.getElementById('table_body');
                tbody.innerHTML = '';

                answer.historyinvoice_fordate.forEach((element) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${element.FechaFormateada}</td>
                        <td>${element.No_Venta}</td>
                        <td>${element.Nombre_Cliente}</td>
                        <td>${element.IdUsuario}</td>
                        <td>${element.Total} C$</td>
                        <td>
                            <button type="button" class="btn btn-info btn-sm" data-toggle="modal" data-target="#modalData" data-noventa="${element.No_Venta}">
                                <i class="fas fa-eye"></i> Ver Detalle
                            </button>
                        </td>
                    `;
                    tbody.appendChild(fila);
                });

                // Event listener para detectar clics en los botones
                tbody.addEventListener('click', function(event) {
                    // Asegúrate de que el evento se dispare solo cuando se haga clic en un botón
                    if (event.target.tagName === 'BUTTON' || event.target.parentNode.tagName === 'BUTTON') {
                        // Obtén el número de venta desde el atributo 'data-noventa'
                        const noVenta = event.target.getAttribute('data-noventa') || event.target.parentNode.getAttribute('data-noventa');
                        console.log('El botón con No_Venta', noVenta, 'fue presionado.');
                        // Aquí puedes llamar a una función para mostrar los detalles, pasando el No_Venta
                        getDetails_HistoryoftheSale(noVenta);
                    }
                });
                
            }
            else {
                throw new Error('Invalid');
            }
        }
        else {
            console.log(xhr.status);
        }
    };
    xhr.send(formDate);
};


// Get the history of the sales for the sales number
function getHistoryInvoiceforSalesNumber(sales_number) {
    var formData = new FormData();
    formData.append('sales_number', sales_number);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getHistoryInvoiceforSalesNumber', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                const tbody = document.getElementById('table_body');
                tbody.innerHTML = '';

                answer.historyinvoice_fornoventa.forEach((element) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${element.FechaFormateada}</td>
                        <td>${element.No_Venta}</td>
                        <td>${element.Nombre_Cliente}</td>
                        <td>${element.IdUsuario}</td>
                        <td>${element.Total} C$</td>
                        <td>
                            <button class="btn btn-info btn-sm" data-toggle="modal" data-target="#modalData" data-noventa="${element.No_Venta}">
                                <i class="fas fa-eye"></i> Ver Detalle
                            </button>
                        </td>
                    `;
                    tbody.appendChild(fila);
                });

                // Event listener para detectar clics en los botones
                tbody.addEventListener('click', function(event) {
                    // Asegúrate de que el evento se dispare solo cuando se haga clic en un botón
                    if (event.target.tagName === 'BUTTON' || event.target.parentNode.tagName === 'BUTTON') {
                        // Obtén el número de venta desde el atributo 'data-noventa'
                        const noVenta = event.target.getAttribute('data-noventa') || event.target.parentNode.getAttribute('data-noventa');
                        console.log('El botón con No_Venta', noVenta, 'fue presionado.');
                        // Aquí puedes llamar a una función para mostrar los detalles, pasando el No_Venta
                        getDetails_HistoryoftheSale(noVenta);
                    }
                });
                
            }
            else {
                throw new Error('Invalid');
            }
        }
        else {
            console.log(xhr.status);
        }
    };
    xhr.send(formData);
};


function getDetails_HistoryoftheSale (sales_number) {
    var formData = new FormData();
    formData.append('sales_number', sales_number);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getDetails_HistoryoftheSale', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            console.log(answer);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                const tbody = document.getElementById('table_body_modal');
                tbody.innerHTML = '';

                document.getElementById('txtFechaRegistro').value = answer.salesHistorywithData[0].Fecha;
                document.getElementById('txtNumVenta').value = answer.salesHistorywithData[0].No_Venta;
                document.getElementById('txtUsuarioRegistro').value = answer.user.IdUsuario;
                document.getElementById('txtDocumentoCliente').value = answer.salesHistorywithData[0].IdCliente;
                document.getElementById('txtNombreCliente').value = answer.salesHistorywithData[0].Nombre_Cliente;
                document.getElementById('txtSubTotal').value = answer.salesHistorywithData[0].Total + 'C$';
                document.getElementById('txtEfectivo').value = answer.salesHistorywithData[0].Efectivo + 'C$';
                document.getElementById('txtCambio').value = answer.salesHistorywithData[0].Cambio + 'C$';

                answer.salesHistorywithProducts.forEach((element) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${element.Producto}</td>
                        <td>${element.Cantidad}</td>
                        <td>${element.Precio} C$</td>
                        <td>${element.Total} C$</td>
                    `;
                    tbody.appendChild(fila);
                });
            }
            else {
                throw new Error('Invalid')
            }
        }
        else {
            console.log(xhr.status);
        }
    };
    xhr.send(formData);
};


function validate_date () {
    var start_date = new Date(document.getElementById('txtFechaInicio').value);
    var end_date = new Date(document.getElementById('txtFechaFin').value);

    if (start_date > end_date) {
        alert('La fecha de inicio no puede ser mayor a la fecha final');
        return true;
    } else { 
        return false;
    }
};


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnBuscar').addEventListener('click', function(event) {
        var initial_date = document.getElementById('txtFechaInicio').value;
        var final_date = document.getElementById('txtFechaFin').value;
        var sales_number = document.getElementById('txtNumeroVenta').value;
        // Get the reference to the select element
        var select_element = document.getElementById('cboBuscarPor');
        if (select_element.value == 'fecha') {
            if (initial_date.trim() === '' && final_date.trim() === '') {
                alert ('Fecha de inicio o Fecha Fin, estos campos no deben estar vacios');
                event.preventDefault();
            }
            else {
                if (validate_date() != true)
                    getHistoryInvoiceforDate(initial_date, final_date);
                else
                    event.preventDefault();
            }
        }
        else {
            if (sales_number.trim() === '' || typeof sales_number === 'undefined') {
                alert ('Por favor, ingrese un numero de venta valido');
                event.preventDefault();
            }
            else {
                getHistoryInvoiceforSalesNumber(sales_number);
            }
        }
        
    });
});


document.addEventListener('DOMContentLoaded', function() {
    var initial_date = document.getElementById('txtFechaInicio');
    var final_date = document.getElementById('txtFechaFin');
    var sales_number = document.getElementById('txtNumeroVenta');
    // Obtén la referencia al elemento select
    var selectElement = document.getElementById('cboBuscarPor');

    // Añade un event listener para el evento 'change'
    selectElement.addEventListener('change', function() {
        // Obtén el valor de la opción seleccionada
        var value_element = selectElement.value;

        // Haz algo con el valor seleccionado
        if (value_element == 'fecha') {
            initial_date.disabled = false;
            final_date.disabled = false;
            sales_number.disabled = true;
            sales_number.value = '';
        }
        else {
            initial_date.disabled = true;
            final_date.disabled = true;
            sales_number.disabled = false;
            initial_date.value = '';
            final_date.value = '';
        }
    });
});



