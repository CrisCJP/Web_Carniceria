function actualizarCategoria(categoria, idcategoria){
    var formData = new FormData();
    formData.append('categoria', categoria);
    formData.append('idcategoria', idcategoria);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/updatecate', true);
    xhr.onload = function() {
        if (xhr.status === 200) {

        } else {
            console.log("Error al actualizar");
        }
    };
    xhr.send(formData);
}

function inventarioCategoria(idtabla) {
    var formData = new FormData();
    
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/categoriasinventario', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var answer = JSON.parse(xhr.responseText);
            if (answer.idcategoria && answer.categoria) {
                var tabla = document.getElementById(idtabla).getElementsByTagName('tbody')[0];
                var tbody = document.getElementById('tbbodytbdata');
                while (tbody.firstChild) {
                    tbody.removeChild(tbody.firstChild);
                }
                for(let i=0; i < answer.idcategoria.length; i++){
                    var fila = tabla.insertRow();
                    fila.insertCell(0).innerHTML = answer.idcategoria[i];
                    fila.insertCell(1).innerHTML = answer.categoria[i];
                    //Crear el badge
                    /*
                    var celdaEstado = fila.insertCell(2);
                    var badge = document.createElement('span');
                    badge.className = 'badge badge-info';
                    badge.textContent = 'Activo';
                    celdaEstado.appendChild(badge);
                    */
                    var celdaAcciones = fila.insertCell(2);

                    var botonEditar = document.createElement('button');
                    botonEditar.className = 'btn btn-primary btn-sm';
                    var iconoEditar = document.createElement('i');
                    iconoEditar.className = 'fas fa-pencil-alt';
                    botonEditar.appendChild(iconoEditar);
                    botonEditar.onclick = function() {
                        document.getElementById("modalModificarCategoriaTitulo").textContent = 'Modificar Categoria -> '+answer.idcategoria[i];
                        document.getElementById("modificarDescripcionCategoria").value = answer.categoria[i];
                        $('#modalModificarCategoria').modal('show');
                    };
                    celdaAcciones.appendChild(botonEditar);
                    /*
                    var botonEliminar = document.createElement('button');
                    botonEliminar.className = 'btn btn-danger btn-sm';
                    var iconoEliminar = document.createElement('i');
                    iconoEliminar.className = 'fas fa-trash-alt';
                    botonEliminar.appendChild(iconoEliminar);
                    botonEliminar.onclick = function() {
                        alert('Eliminar categoria ' + answer.idcategoria[i]);
                    };
                    celdaAcciones.appendChild(botonEliminar);
                    */
                }
            } else {
                console.log('No hay productos para mostrar.');
            }
        } else {
            console.log("Error al agregar producto");
        }
    };
    xhr.send(formData);
}
function eliminarNoNumeros(texto) {
    return texto.replace(/\D/g, '');
}


document.addEventListener("DOMContentLoaded", function() {
    
    inventarioCategoria("tbdata");
    document.getElementById("btnGuardarCambiosCategoria").addEventListener('click', function() {
        var descripcionCategoria = document.getElementById("modificarDescripcionCategoria").value.trim();
        var tituloModal = document.getElementById("modalModificarCategoriaTitulo").textContent;
    
        if (descripcionCategoria === "") {
            alert('No dejar el campo vacío');
        } else {
            var idCategoria = parseInt(eliminarNoNumeros(tituloModal));
            if (isNaN(idCategoria)) {
                alert('ID de categoría no válido');
            } else {
                actualizarCategoria(descripcionCategoria, idCategoria);
                inventarioCategoria("tbdata");
                $('#modalModificarCategoria').modal('hide');
            }
        }
    });
    
})





























/*
function usarDatosEnOtraVista() {
    // Obtener los datos guardados en el almacenamiento local
    const storedData = localStorage.getItem('tablaRecordatoriosData');
    
    if (storedData) {
        // Convertir los datos de JSON a objeto JavaScript
        const tableData = JSON.parse(storedData);
        
        // Hacer algo con los datos, como mostrarlos en la consola
        console.log('Datos de la tabla en otra vista:', tableData);
        
        // También puedes usar los datos de la tabla para otros fines en esta vista
        // Por ejemplo, mostrarlos en otra tabla o realizar cálculos con ellos
    } else {
        console.log('No hay datos de la tabla almacenados en el almacenamiento local.');
    }
}
usarDatosEnOtraVista();
*/