function getReportforDate(initial_date, final_date) {
    var formData = new FormData();
    formData.append('start_date', initial_date);
    formData.append('end_date', final_date);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getReportforDate', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                const tbody = document.getElementById('table_body');
                tbody.innerHTML = '';

                answer.reportList.forEach((element) => {
                    const fila = document.createElement('tr');
                    fila.innerHTML = `
                        <td>${element.FechaFormateada}</td>
                        <td>${element.No_Venta}</td>
                        <td>${element.IdCliente}</td>
                        <td>${element.NombreCliente}</td>
                        <td>${element.IdUsuario}</td>
                        <td>${element.NombreUsuario}</td>
                        <td>${element.TotalVenta} C$</td>
                        <td>${element.Producto}</td>
                        <td>${element.Cantidad}</td>
                        <td>${element.Precio} C$</td>
                        <td>${element.Total} C$</td>
                    `;
                    tbody.appendChild(fila);
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



function validate_date () {
    var start_date = new Date(document.getElementById('txtFechaInicio').value);
    var end_date = new Date(document.getElementById('txtFechaFin').value);

    if (start_date > end_date) {
        alert('La fecha de inicio no puede ser mayor a la fecha final');
        return true;
    } else { 
        return false;
    }
};


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnBuscar').addEventListener('click', function(event) {
        var initial_date = document.getElementById('txtFechaInicio').value;
        var final_date = document.getElementById('txtFechaFin').value;

        if (initial_date.trim() === '' && final_date.trim() === '') {
            alert ('Fecha de inicio o Fecha Fin, estos campos no deben estar vacios');
            event.preventDefault();
        }
        else {
            if (validate_date() != true)
                getReportforDate(initial_date, final_date);
            else
                event.preventDefault();
        }
    });
});