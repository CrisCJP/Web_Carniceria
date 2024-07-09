function obtenerIndicesEnRango(fechaInicio, fechaFin, fechasArray) {
    // Convertir las fechas a objetos Date para compararlas
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);

    // Verificar que la fecha de inicio sea menor que la fecha de fin
    if (inicio > fin) {
        alert("La fecha de inicio debe ser menor que la fecha de fin.");
        return [];
    }

    // Array para almacenar los índices de las fechas dentro del rango
    const indicesEnRango = [];

    // Recorrer el array de fechas y obtener los índices de las fechas en el rango
    fechasArray.forEach((fecha, index) => {
        const fechaActual = new Date(fecha);
        if (fechaActual >= inicio && fechaActual <= fin) {
            indicesEnRango.push(index);
        }
    });

    return indicesEnRango;
}

function buscarNumero(numero, array) {
    // Recorrer el array y verificar si el número está presente
    for (var i = 0; i < array.length; i++) {
        if (array[i] === numero) {
            return i; // Retorna el número encontrado
        }
    }
    return -1; // Retorna false si el número no se encuentra
}

function formatearFechas(arrayFechas) {
    // Array para almacenar las fechas formateadas
    var fechasFormateadas = [];

    // Recorrer el array de fechas y formatearlas
    arrayFechas.forEach(function(fecha) {
        // Crear un objeto Date a partir de la fecha actual
        var fechaActual = new Date(fecha);

        // Obtener día, mes y año
        var dia = fechaActual.getDate() +1;
        var mes = fechaActual.getMonth() + 1; // Los meses van de 0 a 11, por eso se suma 1
        var año = fechaActual.getFullYear();

        // Agregar un cero delante si el día o mes son menores que 10
        if (dia < 10) {
            dia = '0' + dia;
        }
        if (mes < 10) {
            mes = '0' + mes;
        }

        // Formatear la fecha al formato DD/MM/AAAA y añadirla al array de fechas formateadas
        fechasFormateadas.push(dia + '/' + mes + '/' + año);
    });

    // Retornar el array de fechas formateadas
    return fechasFormateadas;
}

function detallemodal(idtabla, idcompra) {
    var formData = new FormData();
    formData.append('idcompra', idcompra);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/formodal', true);
    xhr.send(formData);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Respuesta del servidor:', xhr.responseText);
            var answer = JSON.parse(xhr.responseText);
            if (answer.fechacompra && answer.idcompra && answer.idusuario && answer.idproveedor && answer.nombreproveedor && answer.total && answer.nombreproducto.length && answer.cantidad.length && answer.preciocompra.length && answer.subtotal.length) {
                var tabla = document.getElementById(idtabla).getElementsByTagName('tbody')[0];
                var tbody = document.getElementById('table_body_modal');
                while (tbody.firstChild) {
                    tbody.removeChild(tbody.firstChild);
                }

                document.getElementById('txtFechaRegistro').value = answer.fechacompra;
                document.getElementById('txtNumCompra').value = answer.idcompra;
                document.getElementById('txtUsuarioRegistro').value = answer.idusuario;
                document.getElementById('txtDocumentoProveedor').value = answer.idproveedor;
                document.getElementById('txtNombreProveedor').value = answer.nombreproveedor;
                document.getElementById('txtSubTotal').value = answer.total;

                for(let i=0; i < answer.nombreproducto.length; i++){
                    var fila = tabla.insertRow();
                    fila.insertCell(0).innerHTML = answer.nombreproducto[i];
                    fila.insertCell(1).innerHTML = answer.cantidad[i];
                    fila.insertCell(2).innerHTML = answer.preciocompra[i];
                    fila.insertCell(3).innerHTML = answer.subtotal[i];
                }
            } else {
                console.log('No hay productos para mostrar.');
            }
        } else {
            console.log("Error al agregar producto");
        }
    };
}


function historial(idtabla, opcion) {


    var fechaInicio = document.getElementById('txtFechaInicio').value;
    var fechaFin = document.getElementById('txtFechaFin').value;

    

    var formData = new FormData();

    var xhr = new XMLHttpRequest();

    xhr.open('post', '/historialcompra', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            
            // Analiza la respuesta JSON del servidor
            var answer = JSON.parse(xhr.responseText);
            // Asegúrate de que la respuesta contiene el arreglo de productos
            if (answer.fechacompra && answer.idcompra && answer.nombreproveedor && answer.idusuario && answer.total) {
                // Actualiza la tabla con los nuevos productos
                

                var tabla = document.getElementById(idtabla).getElementsByTagName('tbody')[0];
                            // Selecciona el cuerpo de la tabla por su ID
                var tbody = document.getElementById('table_body');

                // Vacía el cuerpo de la tabla eliminando todos sus hijos
                while (tbody.firstChild) {
                    tbody.removeChild(tbody.firstChild);
                }
                var numeroABuscar = document.getElementById('txtNumeroCompra').value
                
                var indicesNEC = obtenerIndicesEnRango(fechaInicio, fechaFin, answer.fechacompra);

                var fechaFormat = formatearFechas(answer.fechacompra);
                if(opcion == 2){
                    if(buscarNumero(parseInt(numeroABuscar), answer.idcompra) != -1){
                        var fila = tabla.insertRow();

                        fila.insertCell(0).innerHTML = fechaFormat[buscarNumero(parseInt(numeroABuscar), answer.idcompra)];
                        fila.insertCell(1).innerHTML = answer.idcompra[buscarNumero(parseInt(numeroABuscar), answer.idcompra)];
                        fila.insertCell(2).innerHTML = answer.nombreproveedor[buscarNumero(parseInt(numeroABuscar), answer.idcompra)];
                        fila.insertCell(3).innerHTML = answer.idusuario[buscarNumero(parseInt(numeroABuscar), answer.idcompra)];
                        fila.insertCell(4).innerHTML = answer.total[buscarNumero(parseInt(numeroABuscar), answer.idcompra)];

                        // Crear botones de acción
                        var celdaAcciones = fila.insertCell(5);

                        var botonVerDetalle = document.createElement('button');
                        botonVerDetalle.className = 'btn btn-primary btn-sm';
                        var iconoVerDetalle = document.createElement('i');
                        iconoVerDetalle.className = 'fas fa-eye';
                        botonVerDetalle.appendChild(iconoVerDetalle);
                        botonVerDetalle.onclick = function() {
                            
                            detallemodal('tbProductos', answer.idcompra[buscarNumero(parseInt(numeroABuscar), answer.idcompra)]);

                            $('#modalData').modal('show');
                        };
                        celdaAcciones.appendChild(botonVerDetalle);

                    }else{
                        alert('no se encontro una compra con ese numero')
                    }
                }else if(opcion == 1){
                    for(let i=0; i < indicesNEC.length; i++){

                        var fila = tabla.insertRow();

                        fila.insertCell(0).innerHTML = fechaFormat[parseInt(indicesNEC[i])];
                        fila.insertCell(1).innerHTML = answer.idcompra[parseInt(indicesNEC[i])];
                        fila.insertCell(2).innerHTML = answer.nombreproveedor[parseInt(indicesNEC[i])];
                        fila.insertCell(3).innerHTML = answer.idusuario[parseInt(indicesNEC[i])];
                        fila.insertCell(4).innerHTML = answer.total[parseInt(indicesNEC[i])];
                        
                        // Crear botones de acción
                        var celdaAcciones = fila.insertCell(5);

                        var botonVerDetalle = document.createElement('button');
                        botonVerDetalle.className = 'btn btn-primary btn-sm';
                        var iconoVerDetalle = document.createElement('i');
                        iconoVerDetalle.className = 'fas fa-eye';
                        botonVerDetalle.appendChild(iconoVerDetalle);
                        botonVerDetalle.onclick = function() {
                            
                            detallemodal('tbProductos', answer.idcompra[parseInt(indicesNEC[i])]) 

                            $('#modalData').modal('show');
                        };
                        celdaAcciones.appendChild(botonVerDetalle);

                        
                    
                    }
                }else{
                    alert('error desconocido');
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

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnBuscar').addEventListener('click', function(){
        var opti = 0;
        if(document.getElementById('cboBuscarPor').value == 'fecha'){
            opti = 1;
            historial('tbcompra',parseInt(opti));
        }else if(document.getElementById('cboBuscarPor').value == 'numero'){
            opti = 2;
            historial('tbcompra',parseInt(opti));
        }else{
            alert('error desconocido');
        }
    })

    document.getElementById('cboBuscarPor').addEventListener('input', function(){
        if(document.getElementById('cboBuscarPor').value == 'fecha'){
            document.getElementById('txtNumeroCompra').disabled = true
            document.getElementById('txtFechaInicio').disabled = false
            document.getElementById('txtFechaFin').disabled = false
        }else if(document.getElementById('cboBuscarPor').value == 'numero'){
            document.getElementById('txtNumeroCompra').disabled = false
            document.getElementById('txtFechaInicio').disabled = true
            document.getElementById('txtFechaFin').disabled = true
        }
        
    })
    
})


