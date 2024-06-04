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