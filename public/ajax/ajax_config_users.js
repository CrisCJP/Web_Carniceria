function set_user_data_forTable(charac) {
    var formData = new FormData();
    formData.append('character', charac);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/set_user_data_forTable', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                const tbody = document.getElementById('table_body');
                tbody.innerHTML = '';

                answer.userdata.forEach((element) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${element.ID}</td>
                        <td>${element.Correo}</td>
                        <td>${element.Nombre}</td>
                        <td>${element.Apellido}</td>
                        <td>${element.Rol}</td>
                        <td>${element.Estado}</td>
                        <td>
                            <button type="button" class="btn btn-primary btn-sm" data-toggle="modal" data-target="#modalData_config" data-id="${element.ID}">
                                <i class="fas fa-pencil-alt"></i>
                            </button>
                        </td>
                    `;
                    tbody.appendChild(fila);
                });

                console.log(answer);
                // Event listener para detectar clics en los botones
                tbody.addEventListener('click', function(event) {
                    // Asegúrate de que el evento se dispare solo cuando se haga clic en un botón
                    if (event.target.tagName === 'BUTTON' || event.target.parentNode.tagName === 'BUTTON') {
                        // Obtén el número de venta desde el atributo 'data-noventa'
                        const noBoton = event.target.getAttribute('data-id') || event.target.parentNode.getAttribute('data-id');
                        console.log('El botón con No_Usuario', noBoton, 'fue presionado.');
                        // Aquí puedes llamar a una función para mostrar los detalles, pasando el No_Venta
                        getDetails_users(noBoton, answer.userdata);
                    }
                });
            }
            else {
                console.log("No hay datos");
            }
        }
        else {
            console.log(xhr.status);
        }
    };
    xhr.send(formData);
};

function getDetails_users(id_user, users_data) {
    const array_temp = find_userdata(id_user, users_data);
    console.log(array_temp);
    document.getElementById('txtIdUsuario_config').value = array_temp[0].ID;
    document.getElementById('txtCorreo_config').value = array_temp[0].Correo;
    document.getElementById('txtCedula_config').value = array_temp[0].Cedula;
    document.getElementById('txtNombre_config').value = array_temp[0].Nombre;
    document.getElementById('txtApellido_config').value = array_temp[0].Apellido;

    if (array_temp[0].Rol == 'Administrador')
        document.getElementById('cboRol_config').value = '1';
    else
        document.getElementById('cboRol_config').value = '2';

    if (array_temp[0].Estado == 'Activo')
        document.getElementById('cboEstado_config').value = 'Activo';
    else
        document.getElementById('cboEstado_config').value = 'No Activo';


    document.getElementById('linkCambiar').addEventListener('click', function(event) {
        const rol_temp = document.getElementById('cboRol_config').value;
        const estado_temp = document.getElementById('cboEstado_config').value;
        if(confirm('Estas seguro de hacer los cambios?')) {
            make_changes(id_user, rol_temp, estado_temp);
        }
    });
    
};


function make_changes(id, rol, estado) {
    var formData = new FormData();
    formData.append('id', id);
    formData.append('rol', rol);
    formData.append('estado', estado);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/make_changes_foruser', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");
            
            var answer = JSON.parse(xhr.responseText);
            if ('message' in answer) {
                alert('Los cambios se realizaron correctamente');
                window.location.replace('/usuarios');
            }
            else {
                console.log("Algo salio mal al actualizar los datos");
            }
        }
        else {
            console.log(xhr.status);
        }
    };
    xhr.send(formData);
};


function find_userdata(id, array) {
    // Asegúrate de que el ID sea del tipo correcto (número o cadena de texto)
    const idToCompare = typeof id === 'number' ? id : parseInt(id, 10);

    // Encuentra los objetos en el arreglo con el ID coincidente
    const userDetails = array.filter(user => {
        // Asegúrate de que el ID del usuario sea del tipo correcto
        const userId = typeof user.ID === 'number' ? user.ID : parseInt(user.ID, 10);
        return userId === idToCompare;
    });

    return userDetails;
};


function set_newUser(nombre, apellido, cedula, correo, contrasenia, rol, estado) {
    var formData = new FormData();
    formData.append('nombre', nombre);
    formData.append('apellido', apellido);
    formData.append('cedula', cedula);
    formData.append('correo', correo);
    formData.append('contrasenia', contrasenia);
    formData.append('rol', rol);
    formData.append('estado', estado);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/set_newUser', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");
            
            var answer = JSON.parse(xhr.responseText);
            if ('message' in answer) {
                alert('El usuario se creo correctamente');
                window.location.replace('/usuarios');
            }
            else if ('message_notfind' in answer) {
                alert('Los datos del usuario ya existen revise los campos de Nombre, Apellido, Cedula y Correo');
            }
            else {
                console.log("Algo salio mal al crear el usuario");
            }
        }
        else {
            console.log(xhr.status);
        }
    };
    xhr.send(formData);
};


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnBuscar').addEventListener('click', function(event) {
        const btnSearch = document.getElementById('txtNombreUsuario')
        set_user_data_forTable(btnSearch.value);
    });
});


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnGuardar').addEventListener('click', function(event) {
        var nombre = document.getElementById('txtNombre').value;
        var apellido = document.getElementById('txtApellido').value;
        var cedula = document.getElementById('txtCedula').value;
        var correo = document.getElementById('txtCorreo').value;
        var contrasenia = document.getElementById('txtContrasenia').value;
        var rol = document.getElementById('cboRol').value;
        var estado = document.getElementById('cboEstado').value;

        if (nombre.trim() === '' || apellido.trim() === '' || cedula.trim() === '' || contrasenia.trim() === '' || correo.trim() === '' || estado.trim() === '' || rol.trim() === '')
            alert('Todos los campos son obligatorios');
        else if (!validarCedulaNicaragua(cedula))
            alert('La cédula ingresada no es válida');
        else if (!validarCorreoElectronico(correo))
            alert('El correo electrónico ingresado no es válido');
        else 
            set_newUser(nombre, apellido, cedula, correo, contrasenia, rol, estado);
    });
});

function validarCedulaNicaragua(cedula) {
    // Expresión regular para validar la cédula de Nicaragua
    var regex = /^\d{3}-\d{6}-\d{4}[A-Z]$/;
    return regex.test(cedula);
};

function validarCorreoElectronico(correo) {
    var regexEmail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regexEmail.test(correo);
};