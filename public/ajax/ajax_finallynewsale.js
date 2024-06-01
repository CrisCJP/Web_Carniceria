function get_sum_of_products (cash) {
    var formData = new FormData();
    formData.append('cash', cash);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/get_sum_for_sale', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer) {
                console.log(answer.addition);
                if (answer.addition <= cash) {
                    console.log("Ultimos toques para finalizar la venta");
                    setFinallyfornewSale(cash, answer.addition);
                }
                else {
                    alert('El efectivo no solventa con el total de la factura');
                    throw new Error("Hubo un error con el efectivo");
                }
            }
        }
        else {
            console.log('error');
        }
    };

    xhr.send(formData);
};


function setFinallyfornewSale (cash_amount, addition_costo) {
    var formData = new FormData();
    formData.append('new_cash', cash_amount);
    formData.append('new_total', addition_costo);

    const input_firstname = document.getElementById('txtNombreCliente');
    const input_lastname = document.getElementById('txtApellidoCliente');
    const btn_finish = document.getElementById('btnTerminarVentar');

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/finally_new_sale', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Finalizando nueva venta");

            var response = JSON.parse(xhr.responseText);
            console.log(response.success);
            if (response.success) {
                generateInvoicePDF(response.success, response.user);
                clearTable('tbDetallesVenta');
                
                input_firstname.disabled = false;
                input_lastname.disabled = false;
                btn_finish.disabled = true;

                input_firstname.value = '';
                input_lastname.value = '';
                document.getElementById('txtTotal').value = '';
            }
            else {
                console.log("Hubo un error al finalizar la venta");
            }
            
        }
        else {
            console.log('Error en la petición: ' + xhr.status);
        }
    };

    xhr.send(formData);
};


// Asegúrate de haber incluido el script jspdf.min.js en tu proyecto

function generateInvoicePDF(invoiceData, userData) {
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
        doc.text(`Nombre: ${invoiceData[0].nombreCliente} ${invoiceData[0].apellidoCliente}`, 10, (startY += lineSpacing));
        doc.text(`Dirección: ${invoiceData[0].dir}`, 10, (startY += lineSpacing));
        doc.text(`Teléfono: ${invoiceData[0].tel}`, 10, (startY += lineSpacing));

        // Control de venta a la derecha alineado con 'Datos del Cliente'
        var controlVentaX = 120; // Posición X para el control de venta
        doc.setFont(undefined, 'bold');
        startY -= lineSpacing * 3; // Ajusta la posición Y para alinear con 'Datos del Cliente'
        doc.text('Control de venta:', controlVentaX, startY); // Alinea con 'Datos del Cliente'
        doc.setFont(undefined, 'normal');
        doc.text(`Número de venta: ${invoiceData[0].idfactura}`, controlVentaX, (startY += lineSpacing));
        doc.text(`Fecha: ${invoiceData[0].fecha}`, controlVentaX, (startY += lineSpacing));
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
        invoiceData.forEach(function(item) {
            startY += lineSpacing; // Incrementa startY antes de empezar a agregar los datos de cada línea
            doc.text(item.nombreproducto, columnPositions[0], startY);
            doc.text(item.cantidadopeso.toString(), columnPositions[1], startY);
            doc.text(`${item.precioventa.toFixed(2)} C$`, columnPositions[2], startY);
            doc.text(`${item.costo.toFixed(2)} C$`, columnPositions[3], startY);
        });

        // Totales
        var total = invoiceData.reduce(function(acc, item) {
            return acc + item.costo;
        }, 0);
        var cambio = (invoiceData[0].efectivo - total);
        startY += lineSpacing * 2; // Incrementa startY para los totales

        // Establece la fuente en negrita para 'Total:'
        doc.setFont(undefined, 'bold');
        doc.text('Total: ', 170, startY);
        // Restablece la fuente a normal y agrega el total en negrita
        doc.setFont(undefined, 'normal');
        doc.text(total.toFixed(2) + ' C$', doc.getTextWidth('Total: ') + 172, startY);

        
        doc.setFont(undefined, 'bold');
        doc.text('Efectivo: ', 170, startY += lineSpacing);
        doc.setFont(undefined, 'normal');
        doc.text(invoiceData[0].efectivo.toFixed(2) + ' C$', doc.getTextWidth('Efectivo: ') + 172, startY);


        doc.setFont(undefined, 'bold');
        doc.text('Cambio: ', 170, startY += lineSpacing);
        doc.setFont(undefined, 'normal');
        doc.text(cambio.toFixed(2) + ' C$', doc.getTextWidth('Cambio: ') + 172, startY);

        // Abre el PDF en una nueva pestaña del navegador
        window.open(doc.output('bloburl'), '_blank');
    };
};

function agregarNegrita(texto) {
    return '<b>' + texto + '</b>';
};


// Función para limpiar la tabla
function clearTable(tableId) {
    var table = document.getElementById(tableId);
    var rows = table.getElementsByTagName('tr');
    while(rows.length > 1) { // Mientras haya más de una fila (excluyendo el encabezado)
        table.deleteRow(1); // Elimina la primera fila (después del encabezado)
    }
};
