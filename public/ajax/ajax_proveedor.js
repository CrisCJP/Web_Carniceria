function actualizarProveedor(nombre, categoria, idProveedor) {
    var formData = new FormData();
    formData.append('NombreProveedor', nombre);
    formData.append('Categoria', categoria);
    formData.append('IdProveedor', idProveedor);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/updateprov', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Proveedor actualizado exitosamente');
        } else {
            console.log("Error al actualizar el proveedor");
        }
    };
    xhr.send(formData);
}

function nuevoProveedor(nombre, categoria) {
    var formData = new FormData();
    formData.append('nombreprov', nombre);
    formData.append('categ', categoria);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/addproveedor', true);
    xhr.send(formData);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log('Proveedor añadido exitosamente');
        } else {
            console.log("Error al añadir el proveedor");
        }
    };
}

function inventarioProveedores(idtabla) {
    var formData = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/proveedorestable', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var answer = JSON.parse(xhr.responseText);
            if (answer.idproveedor && answer.nombre_proveedor && answer.nombrecategoria) {
                var tabla = document.getElementById(idtabla).getElementsByTagName('tbody')[0];
                while (tabla.firstChild) {
                    tabla.removeChild(tabla.firstChild);
                }
                for (let i = 0; i < answer.idproveedor.length; i++) {
                    var fila = tabla.insertRow();
                    fila.insertCell(0).innerHTML = answer.idproveedor[i];
                    fila.insertCell(1).innerHTML = answer.nombre_proveedor[i];
                    fila.insertCell(2).innerHTML = answer.nombrecategoria[i];
                    
                    var celdaAcciones = fila.insertCell(3);
                    var botonEditar = document.createElement('button');
                    botonEditar.disabled = true
                    botonEditar.className = 'btn btn-primary btn-sm';
                    var iconoEditar = document.createElement('i');
                    iconoEditar.className = 'fas fa-pencil-alt';
                    botonEditar.appendChild(iconoEditar);
                    botonEditar.onclick = function() {
                        document.getElementById("modalModificarProveedorTitulo").textContent = 'Modificar Proveedor -> ' + answer.idproveedor[i];
                        document.getElementById("modificarNombreProveedor").value = answer.nombre_proveedor[i];
                        document.getElementById("modificarContacto").value = answer.nombrecategoria[i];
                        $('#modalModificarProveedor').modal('show');
                    };
                    celdaAcciones.appendChild(botonEditar);
                }
            } else {
                console.log('No hay proveedores para mostrar.');
            }
        } else {
            console.log("Error al cargar proveedores");
        }
    };
    xhr.send(formData);
}

function eliminarNoNumeros(texto) {
    // Elimina todo antes del símbolo '>' incluyendo el propio '>'
    return texto.replace(/.*>\s*/, '').replace(/\D/g, '');
}

document.addEventListener("DOMContentLoaded", function() {
    inventarioProveedores("tbdata");

    document.getElementById("btnGuardarProveedor").addEventListener('click', function() {
        var nombreProveedor = document.getElementById("modificarNombreProveedor").value.trim();
        var categoriaProveedor = document.getElementById("modificarContacto").value.trim();
        var tituloModal = document.getElementById("modalModificarProveedorTitulo").textContent;
    
        if (nombreProveedor === "" || categoriaProveedor === "") {
            alert('No dejar campos vacíos');
        } else {
            var idProveedor = parseInt(eliminarNoNumeros(tituloModal));
            if (isNaN(idProveedor)) {
                nuevoProveedor(nombreProveedor, categoriaProveedor);
            } else {
                actualizarProveedor(nombreProveedor, idProveedor);
            }
            inventarioProveedores("tbdata");
            $('#modalModificarProveedor').modal('hide');
        }
    });
});

function verificarCoincidencia() {
    let modificarNombreProveedor = document.getElementById('modalModificarProveedor').querySelector('#modificarNombreProveedor').value.trim().toLowerCase();
    let tableRows = document.querySelectorAll('#tbdata tbody tr');

    let existe = Array.from(tableRows).some(row => {
        let nombreProveedor = row.cells[1].textContent.trim().toLowerCase();
        return nombreProveedor === modificarNombreProveedor;
    });

    return existe;
}

document.getElementById('modificarNombreProveedor').addEventListener('input', function() {
    let btnGuardarProveedor = document.getElementById('modalModificarProveedor').querySelector('#btnGuardarProveedor');
    if (verificarCoincidencia()) {
        alert('Este proveedor ya existe');
        btnGuardarProveedor.disabled = true;
    } else {
        btnGuardarProveedor.disabled = false;
    }
});
