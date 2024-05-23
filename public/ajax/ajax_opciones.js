var datalist = document.getElementById('datalisIdproveedor');

document.addEventListener("DOMContentLoaded", function() {
    // Limpiar opciones anteriores si existen
    datalist.innerHTML = '';
    
    var formData = new FormData();

    var xhr = new XMLHttpRequest();

    xhr.open('post', '/option', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            
            // Analiza la respuesta JSON del servidor
            var answer = JSON.parse(xhr.responseText);
            
            // Asegúrate de que la respuesta contiene el arreglo de productos
            if (answer.idproveedor && answer.nombre_proveedor) {
                
                // Actualiza la tabla con los nuevos productos
                var idprov = answer.idproveedor;
                var proveedor = answer.nombre_proveedor;
                // Iterar sobre los productos y crear una opción para cada uno
                
                for(let i=0;i<idprov.length;i++){
                    var option2 = document.createElement('option');
                    option2.value = idprov[i]+" - "+proveedor[i];
                    datalist.appendChild(option2);
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
})