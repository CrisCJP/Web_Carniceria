function extraerDatosDesdeAlmacenamientoLocal() {
    return JSON.parse(localStorage.getItem('tablaRecordatoriosData'));
}

function notifiet(){
    const tableDATA = extraerDatosDesdeAlmacenamientoLocal();
    
    for(let i=0; i<tableDATA.length; i++){
        var timeouts = [];
        const fechaNotificacion = new Date(tableDATA[i].fecha);
        fechaNotificacion.setHours(16, 28, 0, 0); // Establecer la hora a las 00:00:00
        const diferenciaTiempo = fechaNotificacion.getTime() - Date.now(); // Calcular la diferencia de tiempo
        timeouts[i] = setTimeout(function() {
            // Aquí puedes agregar la lógica para la notificación cuando se active el tiempo
            //sonido('audio');

            // Crear un elemento de notificación dinámico
            const nuevaNotificacion = document.createElement('a');
            nuevaNotificacion.className = 'dropdown-item d-flex align-items-center';
            nuevaNotificacion.href = '#';

            // Contenido de la notificación
            nuevaNotificacion.innerHTML = `
                <div class="mr-3">
                    <div class="icon-circle bg-primary">
                        <i class="fas fa-file-alt text-white"></i>
                    </div>
                </div>
                <div>
                    <div class="small text-gray-500">${tableDATA[i].fecha}</div>
                    <span class="font-weight-bold">${tableDATA[i].descripcion}</span>
                </div>
            `;

            // Agregar la notificación al contenedor de notificaciones
            const contenedorNotificaciones = document.getElementById('notification-container');
            contenedorNotificaciones.prepend(nuevaNotificacion);

            // Obtener el elemento del contador del badge
            const contadorBadge = document.querySelector('.badge.badge-danger.badge-counter');

            // Obtener el valor actual del contador
            let valorContador = parseInt(contadorBadge.textContent);

            // Incrementar el valor del contador
            valorContador++;

            // Actualizar el valor del contador en el badge
            contadorBadge.textContent = valorContador;

            console.log('Notificación para la fila:', i);
        }, diferenciaTiempo);
    }
    
}

document.addEventListener('DOMContentLoaded', (event) => {
    notifiet();
});