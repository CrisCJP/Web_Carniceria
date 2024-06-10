let array_temp_datas = [];
let array_temp_products = [];

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
    var doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [48, 210] // Ancho de 48 mm y altura dinámica según el contenido
    });

    // Establecer una fuente monoespaciada
    doc.setFont('Courier');

    var startY = 10;
    var lineSpacing = 4; // Espaciado de línea ajustado para un mejor ajuste
    let acum_article = 0.0;

    doc.setFontSize(8); // Tamaño de fuente ajustado
    doc.setFont(undefined, 'bold');
    doc.text('CARNICERIA LUPITA', 2, startY);
    startY += lineSpacing * 2; // Espacio después del título
    doc.text(' ', 2, startY);
    startY += lineSpacing;

    doc.setFont(undefined, 'normal');
    doc.text('Direccion: De la gasolinera, 1/2 cuadra al norte', 2, startY);
    doc.text('Concepcion - Masaya', 2, (startY += lineSpacing));
    doc.text(' ', 2, (startY += lineSpacing));


    // Datos del cliente
    startY += lineSpacing * 2;
    // Control de venta debajo de los datos del cliente
    doc.setFont(undefined, 'bold');
    doc.text('Control de venta:', 2, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`Numero de venta: ${invoiceData1[0].No_Venta}`, 2, (startY += lineSpacing));
    doc.text(`Fecha: ${invoiceData1[0].Fecha}`, 2, (startY += lineSpacing));
    doc.text(`Cajero: ${userData.IdUsuario}-${userData.Nombre} ${userData.Apellido}`, 2, (startY += lineSpacing));
    
    // Línea en blanco para más espacio
    startY += lineSpacing;
    doc.text(' ', 2, startY);
    startY += lineSpacing;
    
    doc.setFont(undefined, 'bold');
    doc.text('Datos del Cliente:', 2, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${invoiceData1[0].Nombre_Cliente} ${invoiceData1[0].Apellido_Cliente}`, 2, (startY += lineSpacing));
    doc.text(`Direccion: ${invoiceData1[0].dir}`, 2, (startY += lineSpacing));
    doc.text(`Telefono: ${invoiceData1[0].tel}`, 2, (startY += lineSpacing));

    // Títulos de las columnas de la tabla
    startY += lineSpacing * 2;
    doc.text(' ', 2, startY);

    /*doc.setFont(undefined, 'bold');
    var columnTitles = ['Desc.', 'Cant.', 'P.U.', 'Total'];
    var columnPositions = [2, 12, 22, 32];
    columnTitles.forEach(function(title, index) {
        doc.text(title, columnPositions[index], startY);
    });*/

    // Líneas de la factura
    doc.setFont(undefined, 'normal');
    invoiceData2.forEach(function(item, index) {
        //var xPosition = columnPositions[index % columnPositions.length];
        doc.text(`Articulo: ${item.IdProducto}`, 2, (startY += lineSpacing));
        doc.text(`Descrip.: ${item.Producto}`, 2, (startY += lineSpacing));
        doc.text(`Cantidad: ${item.Cantidad.toString()} ${item.UnidadMedida}`, 2, (startY += lineSpacing));
        doc.text(`Precio.U: ${item.Precio.toFixed(2)} C$`, 2, (startY += lineSpacing));
        doc.text(`Costo: ${item.Total.toFixed(2)} C$`, 2, (startY += lineSpacing));
        doc.text(']', 2, (startY += lineSpacing));
        acum_article += parseFloat(item.Cantidad);
    });
    
    doc.text(' ', 2, (startY += lineSpacing));
    doc.text('Cantidad de articulos: ' + acum_article, 2, (startY += lineSpacing));
    doc.text(' ', 2, (startY += lineSpacing));

    // Totales
    startY += lineSpacing * 2;
    doc.setFont(undefined, 'bold');
    doc.text('Total: ', 2, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoiceData1[0].Total.toFixed(2)} C$`, 13, startY);

    doc.setFont(undefined, 'bold');
    doc.text('Paga con: ', 2, startY += lineSpacing);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoiceData1[0].Efectivo.toFixed(2)} C$`, 18, startY);

    doc.setFont(undefined, 'bold');
    doc.text('Cambio: ', 2, startY += lineSpacing);
    doc.setFont(undefined, 'normal');
    doc.text(`${invoiceData1[0].Cambio.toFixed(2)} C$`, 14, startY);

    doc.text(' ', 2, startY += lineSpacing);
    doc.text('Los productos ya incluyen el IVA 15%', 2, startY += lineSpacing);
    doc.text(' ', 2, startY += lineSpacing);
    console.log(invoiceData1);

    // Genera los datos binarios del PDF y crea un blob
    var pdfData = doc.output('blob');
    var blob = new Blob([pdfData], { type: 'application/pdf' });
    var url = URL.createObjectURL(blob);

    // Agregar un parámetro único a la URL para evitar el caché
    var uniqueUrl = url + '#t=' + new Date().getTime();

    // Abre el PDF en una nueva pestaña
    var newWindow = window.open(uniqueUrl, '_blank');
    if (newWindow) {
        newWindow.focus();
    } else {
        alert('Permita las ventanas emergentes para esta página para ver el PDF.');
    }

    // Revoca la URL del blob después de un corto período de tiempo
    setTimeout(function() {
        URL.revokeObjectURL(url);
    }, 1000);
};