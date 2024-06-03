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

                document.getElementById('linkImprimir').addEventListener('click', function(event) {
                    generateInvoicePDF(answer.salesHistorywithData, answer.salesHistorywithProducts, answer.user);
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


function generateInvoicePDF(invoiceData1, invoiceData2, userData) {
    var doc = new jsPDF();
    var startY = 10;
    var lineSpacing = 5;
    var imageWidth = 30; // Ancho de la imagen en el PDF
    var imageHeight = imageWidth * (958 / 963); // Altura de la imagen manteniendo la proporción de aspecto

    // Carga la imagen de la carnicería
    var img = new Image();
    img.src = '../img/Logo_lupita.png'; // Asegúrate de reemplazar 'Logo_lupita.png' con el nombre real de tu imagen
    img.onload = function() {
        // Dibuja la imagen en el PDF a la derecha
        doc.addImage(this, 'PNG', doc.internal.pageSize.width - imageWidth - 10, startY, imageWidth, imageHeight);

        // Encabezado de la factura en negrita y tamaño 18
        doc.setFontSize(18);
        doc.setFont(undefined, 'bold');
        doc.text('CARNICERÍA LUPITA', 10, startY + 10); // Alinea a la izquierda

        // Restablece el tamaño de fuente para el resto del texto
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.text('Dirección: De la gasolinera, 1/2 cuadra al norte', 10, (startY += lineSpacing * 3));

        // Datos del cliente y Control de venta alineados
        startY += lineSpacing * 3; // Incrementa startY para 'Datos del Cliente'
        doc.setFont(undefined, 'bold');
        doc.text('Datos del Cliente:', 10, startY);
        doc.setFont(undefined, 'normal'); // Resto de datos del cliente en texto normal
        doc.text(`Nombre: ${invoiceData1[0].Nombre_Cliente} ${invoiceData1[0].Apellido_Cliente}`, 10, (startY += lineSpacing));
        doc.text(`Dirección: ${invoiceData1[0].dir}`, 10, (startY += lineSpacing));
        doc.text(`Teléfono: ${invoiceData1[0].tel}`, 10, (startY += lineSpacing));

        // Control de venta a la derecha alineado con 'Datos del Cliente'
        var controlVentaX = 120; // Posición X para el control de venta
        doc.setFont(undefined, 'bold');
        startY -= lineSpacing * 3; // Ajusta la posición Y para alinear con 'Datos del Cliente'
        doc.text('Control de venta:', controlVentaX, startY); // Alinea con 'Datos del Cliente'
        doc.setFont(undefined, 'normal');
        doc.text(`Número de venta: ${invoiceData1[0].No_Venta}`, controlVentaX, (startY += lineSpacing));
        doc.text(`Fecha: ${invoiceData1[0].Fecha}`, controlVentaX, (startY += lineSpacing));
        doc.text(`ID Usuario: ${userData.IdUsuario}`, controlVentaX, (startY += lineSpacing));
        doc.text(`Usuario: ${userData.Nombre} ${userData.Apellido}`, controlVentaX, (startY += lineSpacing));

        // Títulos de las columnas de la tabla en negrita
        startY += lineSpacing * 3; // Asegúrate de incrementar startY solo una vez para todos los encabezados
        doc.setFont(undefined, 'bold');
        var columnTitles = ['Descripción', 'Cantidad/Peso', 'Precio U.', 'Costo'];
        var columnPositions = [10, 70, 120, 170];
        columnTitles.forEach(function(title, index) {
            doc.text(title, columnPositions[index], startY);
        });

        // Líneas de la factura en texto normal
        doc.setFont(undefined, 'normal');
        invoiceData2.forEach(function(item) {
            startY += lineSpacing; // Incrementa startY antes de empezar a agregar los datos de cada línea
            doc.text(item.Producto, columnPositions[0], startY);
            doc.text(item.Cantidad.toString(), columnPositions[1], startY);
            doc.text(`${item.Precio.toFixed(2)} C$`, columnPositions[2], startY);
            doc.text(`${item.Total.toFixed(2)} C$`, columnPositions[3], startY);
        });

        startY += lineSpacing * 2; // Incrementa startY para los totales

        // Establece la fuente en negrita para 'Total:'
        doc.setFont(undefined, 'bold');
        doc.text('Total: ', 170, startY);
        // Restablece la fuente a normal y agrega el total en negrita
        doc.setFont(undefined, 'normal');
        doc.text(invoiceData1[0].Total.toFixed(2) + ' C$', doc.getTextWidth('Total: ') + 172, startY);

        
        doc.setFont(undefined, 'bold');
        doc.text('Efectivo: ', 170, startY += lineSpacing);
        doc.setFont(undefined, 'normal');
        doc.text(invoiceData1[0].Efectivo.toFixed(2) + ' C$', doc.getTextWidth('Efectivo: ') + 172, startY);


        doc.setFont(undefined, 'bold');
        doc.text('Cambio: ', 170, startY += lineSpacing);
        doc.setFont(undefined, 'normal');
        doc.text(invoiceData1[0].Cambio.toFixed(2) + ' C$', doc.getTextWidth('Cambio: ') + 172, startY);

        // Abre el PDF en una nueva pestaña del navegador
        window.open(doc.output('bloburl'), '_blank');
    };
};

