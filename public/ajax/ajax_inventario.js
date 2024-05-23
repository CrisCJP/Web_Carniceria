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

                    // Configurar los atributos del elemento img
                    img.setAttribute("src", "img/Carne.png");
                    img.setAttribute("style", "height:60px;");
                    img.setAttribute("class", "rounded mx-auto d-block");
                    var imgsss = fila.insertCell(1);
                    imgsss.appendChild(img);


                    fila.insertCell(2).innerHTML = "21039";
                    fila.insertCell(3).innerHTML = answer.marca[i];
                    fila.insertCell(4).innerHTML = "oskd";
                    fila.insertCell(5).innerHTML = answer.categoria[i];
                    fila.insertCell(6).innerHTML = answer.stock[i];
                    fila.insertCell(7).innerHTML = answer.precio[i];
                    
                    // Crear el badge
                    var celdaEstado = fila.insertCell(8);
                    var badge = document.createElement('span');
                    badge.className = 'badge badge-info';
                    badge.textContent = 'Activo';
                    celdaEstado.appendChild(badge);

                    
                    // Crear botones de acción
                    var celdaAcciones = fila.insertCell(9);

                    var botonEditar = document.createElement('button');
                    botonEditar.className = 'btn btn-primary btn-sm';
                    var iconoEditar = document.createElement('i');
                    iconoEditar.className = 'fas fa-pencil-alt';
                    botonEditar.appendChild(iconoEditar);
                    botonEditar.onclick = function() {
                        alert('Editar producto ' + answer.id[i]);
                    };
                    celdaAcciones.appendChild(botonEditar);
                    
                    var botonEliminar = document.createElement('button');
                    botonEliminar.className = 'btn btn-danger btn-sm';
                    var iconoEliminar = document.createElement('i');
                    iconoEliminar.className = 'fas fa-trash-alt';
                    botonEliminar.appendChild(iconoEliminar);
                    botonEliminar.onclick = function() {
                        alert('Eliminar producto ' + answer.id[i]);
                    };
                    celdaAcciones.appendChild(botonEliminar);
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


document.addEventListener("DOMContentLoaded", function() {
    // Al cargar el DOM, se ejecutará este código
    invent();
})
