// Función para verificar productos vencidos
function verificarProductosVencidos(fechaVencimientoArray) {
    const productosVencidos = [];
    const fechaActual = new Date();

    fechaVencimientoArray.forEach((fecha, indice) => {
        if (fecha) {
            const fechaProducto = new Date(fecha);
            if (!isNaN(fechaProducto.getTime())) {
                if (fechaProducto < fechaActual) {
                    productosVencidos.push(indice);
                }
            } else {
                console.warn(`Fecha no válida en el índice ${indice}: ${fecha}`);
            }
        } else {
            console.warn(`Fecha nula en el índice ${indice}`);
        }
    });

    return productosVencidos;
}

function mostrarVencidos(){
    var formData = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/reporteproductovencido', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var answer = JSON.parse(xhr.responseText);
            if(answer.nombreproduct && answer.fechavencimiento && answer.cantidad_peso){
                var tabla = document.getElementById('tbdata').getElementsByTagName('tbody')[0];
                // Limpiar la tabla antes de agregar nuevas filas
                tabla.innerHTML = '';
                // Verificar productos vencidos
                var vencidasIndices = verificarProductosVencidos(answer.fechavencimiento);


                // Agregar filas a la tabla para los productos vencidos
                vencidasIndices.forEach(indice => {
                    var fila = tabla.insertRow();
                    fila.insertCell(0).innerHTML = answer.nombreproduct[indice];
                    fila.insertCell(1).innerHTML = answer.fechavencimiento[indice];
                    fila.insertCell(2).innerHTML = answer.cantidad_peso[indice];
                });

                    
            }else {
                // Maneja el caso en que no hay productos
                console.log('No hay productos para mostrar.');
            }
        } else {
            console.log("Error al actualizar");
        }
    };
    xhr.send(formData);
}

document.addEventListener("DOMContentLoaded", function() {
    mostrarVencidos();
})