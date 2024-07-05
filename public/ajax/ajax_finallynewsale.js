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
                document.getElementById('txtCosto').value = '';

                window.location.replace('/nueva_venta');
            
            }
            else {
                alert("Hubo un error al finalizar la venta");
                console.log("Hubo un error al finalizar la venta");
            }
            
        }
        else {
            console.log('Error en la petición: ' + xhr.status);
        }
    };

    xhr.send(formData);
};


function generateInvoicePDF(invoiceData1, userData) {
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
    doc.text(`Numero de venta: ${invoiceData1[0].idfactura}`, 2, (startY += lineSpacing));
    doc.text(`Fecha: ${invoiceData1[0].fecha}`, 2, (startY += lineSpacing));
    doc.text(`Cajero: ${userData.IdUsuario}-${userData.Nombre} ${userData.Apellido}`, 2, (startY += lineSpacing));
    
    // Línea en blanco para más espacio
    startY += lineSpacing;
    doc.text(' ', 2, startY);
    startY += lineSpacing;
    
    doc.setFont(undefined, 'bold');
    doc.text('Datos del Cliente:', 2, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`Nombre: ${invoiceData1[0].nombreCliente} ${invoiceData1[0].apellidoCliente}`, 2, (startY += lineSpacing));
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
    invoiceData1.forEach(function(item, index) {
        //var xPosition = columnPositions[index % columnPositions.length];
        doc.text(`Articulo: ${item.idproducto}`, 2, (startY += lineSpacing));
        doc.text(`Descrip.: ${item.nombreproducto}`, 2, (startY += lineSpacing));
        doc.text(`Cantidad: ${item.cantidadopeso.toString()} ${item.UnidadMedida}`, 2, (startY += lineSpacing));
        doc.text(`Precio.U: C$ ${item.precioventa.toFixed(2)}`, 2, (startY += lineSpacing));
        doc.text(`Costo: C$ ${item.costo.toFixed(2)}`, 2, (startY += lineSpacing));
        doc.text(']', 2, (startY += lineSpacing));
        acum_article += parseFloat(item.cantidadopeso);
    });
    
    doc.text(' ', 2, (startY += lineSpacing));
    doc.text('Cantidad de articulos: ' + acum_article, 2, (startY += lineSpacing));
    doc.text(' ', 2, (startY += lineSpacing));

    // Totales
    startY += lineSpacing * 2;
    doc.setFont(undefined, 'bold');
    doc.text('Total: ', 2, startY);
    doc.setFont(undefined, 'normal');
    doc.text(`C$ ${invoiceData1[0].total.toFixed(2)}`, 13, startY);

    doc.setFont(undefined, 'bold');
    doc.text('Paga con: ', 2, startY += lineSpacing);
    doc.setFont(undefined, 'normal');
    doc.text(`C$ ${invoiceData1[0].efectivo.toFixed(2)}`, 18, startY);

    // Calcula el cambio restando el total del efectivo
    const cambio = invoiceData1[0].efectivo - invoiceData1[0].total;

    doc.setFont(undefined, 'bold');
    doc.text('Cambio: ', 2, startY += lineSpacing);
    doc.setFont(undefined, 'normal');
    // Asegúrate de que el cambio no sea negativo antes de mostrarlo
    doc.text(`C$ ${cambio > 0 ? cambio.toFixed(2) : '0.00'}`, 14, startY);

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

// Función para limpiar la tabla
function clearTable(tableId) {
    var table = document.getElementById(tableId);
    var rows = table.getElementsByTagName('tr');
    while(rows.length > 1) { // Mientras haya más de una fila (excluyendo el encabezado)
        table.deleteRow(1); // Elimina la primera fila (después del encabezado)
    }
};
