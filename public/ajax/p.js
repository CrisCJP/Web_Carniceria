function detallemodal(idtabla, idcompra) {
    var formData = new FormData();
    formData.append('idcompra', idcompra);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/formodal', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            // Analiza la respuesta JSON del servidor
            var answer = JSON.parse(xhr.responseText);
            // Asegúrate de que la respuesta contiene el arreglo de productos
                
            if (answer.fechacompra && answer.idcompra && answer.idusuario && answer.idproveedor && answer.nombreproveedor && answer.total && answer.nombreproducto && answer.cantidad && answer.preciocompra && answer.subtotal) {
                // Actualiza la tabla con los nuevos productos
                var tabla = document.getElementById(idtabla).getElementsByTagName('tbody')[0];
                // Selecciona el cuerpo de la tabla por su ID
                var tbody = document.getElementById('table_body_modal');
                // Vacía el cuerpo de la tabla eliminando todos sus hijos
                while (tbody.firstChild) {
                    tbody.removeChild(tbody.firstChild);
                }

                document.getElementById('txtFechaRegistro').value = answer.fechacompra;
                document.getElementById('txtNumCompra').value = answer.idcompra;
                document.getElementById('txtUsuarioRegistro').value = answer.idusuario;
                document.getElementById('txtDocumentoProveedor').value = answer.idproveedor;
                document.getElementById('txtNombreProveedor').value = answer.nombreproveedor;
                document.getElementById('txtSubTotal').value = answer.total;

                for(let i=0; i < answer.cantidad.length; i++){
                    var fila = tabla.insertRow();
                    fila.insertCell(0).innerHTML = answer.nombreproducto[i];
                    fila.insertCell(1).innerHTML = answer.cantidad[i];
                    fila.insertCell(2).innerHTML = answer.preciocompra[i];
                    fila.insertCell(3).innerHTML = answer.subtotal[i];
                }
            } else {
                // Maneja el caso en que no hay productos
                console.log('No hay productos para mostrar.');
            }
        } else {
            console.log("Error al agregar producto");
        }
    };
    xhr.send(formData);
}