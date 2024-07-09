function getViewDetail_fromIndex(number_invoice) {
    var formData = new FormData();
    formData.append('sales_number', number_invoice);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getDetails_HistoryoftheSale', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                const tbody = document.getElementById('table_body_modal');
                tbody.innerHTML = '';

                document.getElementById('txtFechaRegistro').value = answer.salesHistorywithData[0].Fecha;
                document.getElementById('txtNumVenta').value = answer.salesHistorywithData[0].No_Venta;
                document.getElementById('txtUsuarioRegistro').value = answer.user.IdUsuario;
                document.getElementById('txtDocumentoCliente').value = answer.salesHistorywithData[0].IdCliente;
                document.getElementById('txtNombreCliente').value = answer.salesHistorywithData[0].Nombre_Cliente;
                document.getElementById('txtSubTotal').value = 'C$ ' + answer.salesHistorywithData[0].Total;
                document.getElementById('txtEfectivo').value = 'C$ ' + answer.salesHistorywithData[0].Efectivo;
                document.getElementById('txtCambio').value = 'C$ ' + answer.salesHistorywithData[0].Cambio;

                answer.salesHistorywithProducts.forEach((element) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${element.Producto}</td>
                        <td>${element.Cantidad}</td>
                        <td>C$ ${element.Precio}</td>
                        <td>C$ ${element.Total}</td>
                    `;
                    tbody.appendChild(fila);
                });

                document.getElementById('linkImprimir').addEventListener('click', function() {
                    generateInvoicePDF(answer.salesHistorywithData, answer.salesHistorywithProducts, answer.user);
                    window.location.reload();
                });
            }
            else {
                console.log("No hay datos");
            }
        }
        else {
            console.log(xhr.status);
        }
    };

    xhr.send(formData);
};


document.addEventListener("DOMContentLoaded", function(e) {
    // Supongamos que tienes una tabla con un ID específico (por ejemplo, "tablaVentas")
    value_boxes();
    const tablaVentas = document.getElementById("tbventa");

    // Agrega un manejador de eventos al botón "Ver Detalle"
    tablaVentas.addEventListener("click", function(event) {
        const target = event.target;

        // Verifica si el elemento clickeado es un botón
        if (target.tagName === "BUTTON") {
            // Encuentra la fila correspondiente al botón clickeado
            const fila = target.closest("tr");

            // Obtén el número de factura de esa fila
            const numeroFactura = fila.querySelector("td:first-child").textContent;

            getViewDetail_fromIndex(numeroFactura);
            console.log("Número de factura:", numeroFactura);
        }
    });
});

function generateInvoicePDF(invoiceData1, invoiceData2, userData) {
    var doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [48, 210] // Ancho de 48 mm y altura dinámica según el contenido
    });

    console.log(invoiceData1, invoiceData2);
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
    doc.text(`C$ ${invoiceData1[0].Total.toFixed(2)}`, 13, startY);

    doc.setFont(undefined, 'bold');
    doc.text('Paga con: ', 2, startY += lineSpacing);
    doc.setFont(undefined, 'normal');
    doc.text(`C$ ${invoiceData1[0].Efectivo.toFixed(2)}`, 18, startY);

    doc.setFont(undefined, 'bold');
    doc.text('Cambio: ', 2, startY += lineSpacing);
    doc.setFont(undefined, 'normal');
    doc.text(`C$ ${invoiceData1[0].Cambio.toFixed(2)}`, 14, startY);

    doc.text(' ', 2, startY += lineSpacing);
    doc.text('Los productos ya incluyen el IVA 15%', 2, startY += lineSpacing);
    doc.text(' ', 2, startY += lineSpacing);
    doc.text(' ', 2, startY += lineSpacing);

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