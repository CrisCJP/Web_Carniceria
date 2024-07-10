//const { name } = require("ejs");

function actualizarProducto(idproducto, stock, precio){
    var formData = new FormData();
    formData.append('idproducto', idproducto);
    formData.append('stock', stock);
    formData.append('precio', precio);
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/updateproduct', true);
    xhr.onload = function() {
        if (xhr.status === 200) {

        } else {
            console.log("Error al actualizar");
        }
    };
    xhr.send(formData);
}

function AgregarNuevoProducto(nombreProducto, PrecioVenta, UnidadMedida, Existencia, NombreCategoria, NombreProveedor){
    var formData = new FormData();

    formData.append('nombreProducto', nombreProducto);
    formData.append('PrecioVenta', PrecioVenta);
    formData.append('UnidadMedida', UnidadMedida);
    formData.append('Existencia', Existencia);
    formData.append('NombreCategoria', NombreCategoria);
    formData.append('NombreProveedor', NombreProveedor);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/nuevoproducto', true);
    xhr.onload = function() {
        if (xhr.status === 200) {

        } else {
            console.log("Error al actualizar");
        }
    };
    xhr.send(formData);
}

function elimValid(id, idErro){
    document.getElementById(id).classList.remove('is-invalid');
    document.getElementById(id).classList.remove('is-valid');
    document.getElementById(idErro).textContent = ''  
}

function modifProduct(){

    var name = document.getElementById('modificarNombre');
    var marca = document.getElementById('modificarMarca');
    var descripcion = document.getElementById('modificarDescripcion');
    var stocks = document.getElementById('modificarStock');
    var price = document.getElementById('modificarPrecio');

    var formData = new FormData();

    formData.append('modificarNombre', name);
    formData.append('modificarMarca', marca);
    formData.append('modificarStock', stocks);
    formData.append('modificarPrecio', price);

    var xhr = new XMLHttpRequest();

    xhr.open('post', '/updateproduct', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            
            // Analiza la respuesta JSON del servidor
            var answer = JSON.parse(xhr.responseText);
            
            // Asegúrate de que la respuesta contiene el arreglo de productos
            if (answer.id && answer.marca && answer.categoria && answer.stock && answer.precio) {
                // Actualiza la tabla con los nuevos productos
                
                
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

function invent() {
    var formData = new FormData();

    var xhr = new XMLHttpRequest();

    xhr.open('post', '/inventary', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            
            // Analiza la respuesta JSON del servidor
            var answer = JSON.parse(xhr.responseText);
            
            // Asegúrate de que la respuesta contiene el arreglo de productos
            if (answer.id && answer.marca && answer.categoria && answer.stock && answer.precio) {
                // Actualiza la tabla con los nuevos productos
                

                var tabla = document.getElementById('tbdata').getElementsByTagName('tbody')[0];


                for(let i=0; i < answer.id.length; i++){

                    var fila = tabla.insertRow();
                    fila.insertCell(0).innerHTML = answer.id[i];
                    

                    var img = document.createElement("img");

                    /*
                    // Configurar los atributos del elemento img
                    img.setAttribute("src", "img/Carne.png");
                    img.setAttribute("style", "height:60px;");
                    img.setAttribute("class", "rounded mx-auto d-block");
                    var imgsss = fila.insertCell(1);
                    imgsss.appendChild(img);
                    */


                    fila.insertCell(1).innerHTML = answer.nombreproduct[i];
                    fila.insertCell(2).innerHTML = answer.marca[i];
                    //fila.insertCell(4).innerHTML = "oskd";
                    fila.insertCell(3).innerHTML = answer.categoria[i];
                    fila.insertCell(4).innerHTML = answer.stock[i];
                    fila.insertCell(5).innerHTML = answer.precio[i];
                    /*
                    // Crear el badge
                    var celdaEstado = fila.insertCell(6);
                    var badge = document.createElement('span');
                    badge.className = 'badge badge-info';
                    badge.textContent = 'Activo';
                    celdaEstado.appendChild(badge);
                    */
                    
                    // Crear botones de acción
                    
                    var celdaAcciones = fila.insertCell(6);

                    var botonEditar = document.createElement('button');
                    botonEditar.className = 'btn btn-primary btn-sm';
                    var iconoEditar = document.createElement('i');
                    iconoEditar.className = 'fas fa-pencil-alt';
                    botonEditar.appendChild(iconoEditar);
                    botonEditar.onclick = function() {

                        document.getElementById('modalModificarProductoTitulo').innerHTML = "Modificar producto - "+answer.nombreproduct[i]+" - "+answer.id[i];
                        // Llenar los campos del formulario con los datos del producto
                        document.getElementById('modificarNombre').value = answer.nombreproduct[i];
                        document.getElementById('modificarMarca').value = answer.marca[i];
                        //document.getElementById('modificarDescripcion').value = 'oskd';
                        document.getElementById('modificarStock').value = answer.stock[i];
                        document.getElementById('modificarPrecio').value = answer.precio[i];
                        document.getElementById('modificarCategoria').value = answer.categoria[i];

                        elimValid('modificarNombre', 'errorProducto');
                        elimValid('modificarMarca', 'errorMarca');
                        elimValid('modificarStock', 'errorStock');
                        elimValid('modificarPrecio', 'errorPrecio');
                        elimValid('modificarCategoria', 'errorCategoria');
                        
                        
                        $('#modalModificarProducto').modal('show');
                    };
                    celdaAcciones.appendChild(botonEditar);
                    /*
                    var botonEliminar = document.createElement('button');
                    botonEliminar.className = 'btn btn-danger btn-sm';
                    var iconoEliminar = document.createElement('i');
                    iconoEliminar.className = 'fas fa-trash-alt';
                    botonEliminar.appendChild(iconoEliminar);
                    botonEliminar.onclick = function() {
                        alert('Eliminar producto ' + answer.id[i]);
                    };
                    celdaAcciones.appendChild(botonEliminar);
                    */

                    
                }
                console.log(answer.id);
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

function validCamp (id, erroId){
    
    document.getElementById(id).addEventListener(('input'),(event) => {
        if(document.getElementById(id).value != ''){
            document.getElementById(id).classList.remove('is-invalid');
            document.getElementById(id).classList.add('is-valid');
            document.getElementById(erroId).textContent = ''
        }else{
            document.getElementById(id).classList.add('is-invalid');
            document.getElementById(erroId).textContent = '(*) campo obligatorio'
        }
    });
}

function validCampCOpt (id, erroId, idlist){
    
        document.getElementById(id).addEventListener(('input'),(event) => {
            if(document.getElementById(id).value != '' && verificarOpcion(id, idlist)){
                document.getElementById(id).classList.remove('is-invalid');
                document.getElementById(id).classList.add('is-valid');
                document.getElementById(erroId).textContent = ''
            }else{
                document.getElementById(id).classList.add('is-invalid');
                document.getElementById(erroId).textContent = '(*) campo obligatorio'
            }
        });
}

function MenusDeOpciones(idDatalist, namePost){
    var datalist2 = document.getElementById(idDatalist);

    datalist2.innerHTML = '';

    var formData = new FormData();

    var xhr = new XMLHttpRequest();
    xhr.open('post', namePost, true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            
            // Analiza la respuesta JSON del servidor
            var answer = JSON.parse(xhr.responseText);
            
            // Asegúrate de que la respuesta contiene el arreglo de productos
            if (answer.consult) {
                var consulta = answer.consult;
                // Iterar sobre los productos y crear una opción para cada uno
                for(let i=0;i<consulta.length;i++){
                    var option = document.createElement('option');
                    option.value = consulta[i];
                    datalist2.appendChild(option);
                }
            }else{
                // Maneja el caso en que no hay productos
                console.log('consulta vacia');
            }
            
        } else {
            console.log("Error al consultar");
        }
    };
    xhr.send(formData);
    
}

function verificarOpcion(idInput, idlist) {
    var input = document.getElementById(idInput);
    var valorInput = input.value;
    var opciones = document.getElementById(idlist).getElementsByTagName("option");
    var opcionEncontrada = false;

    // Verificar si el valor introducido coincide con alguna opción del datalist
    for (var i = 0; i < opciones.length; i++) {
        if (valorInput === opciones[i].value) {
            opcionEncontrada = true;
            break;
        }
    }

    if (!opcionEncontrada) {
        return false;
    }else{
        return true;
    }
}
function obtenerCodigo(cadena) {
    // Dividir la cadena en partes usando el guion como separador
    var partes = cadena.split('-');
    
    // Verificar si hay al menos tres partes (dos guiones)
    if (partes.length >= 3) {
        // Tomar la tercera parte y eliminar los espacios al inicio y al final
        var codigo = partes[2].trim();
        return codigo;
    } else {
        // Si no hay suficientes guiones, retornar un mensaje de error o null
        return null;
    }
}




document.addEventListener("DOMContentLoaded", function() {
    // Al cargar el DOM, se ejecutará este código
    invent();


    MenusDeOpciones('datalistMarca','/optmarca');
    MenusDeOpciones('datalistCategoria','/optcategoria');
    MenusDeOpciones('datalistMedida', '/optmedidas')

    validCamp('modificarNombre', 'errorProducto');
    validCamp('modificarStock', 'errorStock');
    validCamp('modificarPrecio', 'errorPrecio');

    validCampCOpt('modificarMarca', 'errorMarca', 'datalistMarca');
    validCampCOpt('modificarCategoria', 'errorCategoria', 'datalistCategoria');


    
     //btnGuardarCambios
     document.getElementById('btnGuardarCambios').addEventListener('click', function() {
        
        var name = document.getElementById('modificarNombre');
        var marca = document.getElementById('modificarMarca');
        //var descripcion = document.getElementById('modificarDescripcion');
        var stocks = document.getElementById('modificarStock');
        var price = document.getElementById('modificarPrecio');
        if(verificarOpcion("modificarMarca",'datalistMarca') && verificarOpcion("modificarCategoria", 'datalistCategoria')){
            
            if(name && marca /*&& descripcion*/ && stocks && price){
                if(name.value != '' && marca.value != '' && stocks.value >0 && price.value >0){
                    actualizarProducto(obtenerCodigo(document.getElementById('modalModificarProductoTitulo').textContent), parseFloat(stocks.value), parseFloat(price.value) );
                }else{
                    alert('no dejar campos vacios o negativos');
                }
            }else{
                alert('error desconocido uno de los campos no existe');
            }
        }else{
            alert('los campos como marca y categoria deben coincidir con su lista de opciones')
        }
        invent();
        $('#modalModificarProducto').modal('hide');
        
     })

     validCampCOpt('modificarMedida', 'errorMedida', 'datalistMedida');
     validCampCOpt('modificarCategorias', 'errorCategorias', 'datalistCategoria');
     validCampCOpt('modificarProv', 'errorProv', 'datalistMarca');

    document.getElementById("btnAgregaNuevoProducto").addEventListener('click', function(){
        var nombreProducto = document.getElementById("modificarNombreProducto").value;
        var precioVenta2 = document.getElementById("modificarPrecioVenta").value.trim();
        var unidadMedida = document.getElementById("modificarMedida").value.trim();
        var existencia = parseFloat(0.0);
        var nombreCategoria = document.getElementById("modificarCategorias").value.trim();
        var nombreProveedor = document.getElementById("modificarProv").value.trim();

        // Validar si los campos están vacíos
        if (nombreProducto === '') {
            alert('El campo Nombre Producto no puede estar vacío.');
        } else if (precioVenta2 === '' || parseFloat(precioVenta2)<=0) {
            alert('El campo Precio de Venta no puede estar vacío ni ser menor que 0.');
        } else if (unidadMedida === '') {
            alert('El campo Unidad de Medida no puede estar vacío.');
        } else if (isNaN(existencia)) {
            alert('El campo Existencia Inicial debe ser un número válido.');
        } else if (existencia < 0) {
            alert('El campo Existencia Inicial debe ser mayor o igual que cero.');
        } else if (nombreCategoria === '') {
            alert('El campo Nombre de Categoría no puede estar vacío.');
        } else if (nombreProveedor === '') {
            alert('El campo Nombre de Proveedor no puede estar vacío.');
        } else {
            // Los campos están completos y son válidos
            // Aquí puedes continuar con tu lógica de negocio

            console.log('Todos los campos obtenidos correctamente:');
            console.log('Nombre Producto:', nombreProducto);
            console.log('Precio de Venta:', precioVenta2);
            console.log('Unidad de Medida:', unidadMedida);
            console.log('Existencia Inicial:', existencia);
            console.log('Nombre de Categoría:', nombreCategoria);
            console.log('Nombre de Proveedor:', nombreProveedor);
            // Verificar si el precio de venta es un número válido
            if (isNaN(precioVenta2)) {
                alert('El precio de venta debe ser un número válido.');
                console.log(precioVenta2)
                return;
            }

            AgregarNuevoProducto(nombreProducto, precioVenta2, unidadMedida, existencia, nombreCategoria, nombreProveedor);
            $('#modalModificarProducto2').modal('hide');
        }
    

        
    
        // Lógica para enviar la solicitud al servidor aquí
        //
    });
})

function verificarCoincidencia() {
    // Obtener el valor ingresado por el usuario en el input dentro del modal
    let modificarNombreProducto = document.getElementById('modalModificarProducto2').querySelector('#modificarNombreProducto').value.trim().toLowerCase();

    // Obtener todas las filas de la tabla tbdata
    let tableRows = document.querySelectorAll('#tbdata tbody tr');

    // Verificar si hay alguna fila donde el segundo dato (columna 2) coincide con modificarNombreProducto
    let existe = Array.from(tableRows).some(row => {
        let nombreProducto = row.cells[1].textContent.trim().toLowerCase();
        return nombreProducto === modificarNombreProducto;
    });

    // Retornar true si existe al menos una coincidencia, de lo contrario retornar false
    return existe;
}

document.getElementById('modificarNombreProducto').addEventListener('input', function(){
    // Obtener el botón con ID btnAgregaNuevoProducto dentro del modal
    let btnAgregaNuevoProducto = document.getElementById('modalModificarProducto2').querySelector('#btnAgregaNuevoProducto');

    if(verificarCoincidencia()){
        alert('este producto ya existe')
        
        // Deshabilitar el botón
        btnAgregaNuevoProducto.disabled = true;
    }else{
        // habilitar el botón
        btnAgregaNuevoProducto.disabled = false;
    }
})
