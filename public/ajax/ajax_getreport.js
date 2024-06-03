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
                document.getElementById('btnExportar').disabled = false;
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
            document.getElementById('btnExportar').addEventListener('click', function(event) {
                exportToExcel(answer.reportList, "Reporte_Ventas");
            });
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



function removeDateProperty(reportList) {
    return reportList.map(({ Fecha, ...rest }) => rest);
};

function exportToExcel(reportList, fileName) {
    // Eliminar la propiedad Fecha de cada objeto en reportList
    const dataWithoutDate = removeDateProperty(reportList);

    // Crear un nuevo libro de trabajo y una hoja de cálculo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataWithoutDate);

    // Añadir la hoja de cálculo al libro de trabajo
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    // Especificar opciones para el archivo Excel
    const options = { bookType: 'xlsx', type: 'array' };

    // Escribir el archivo Excel
    const excelBuffer = XLSX.write(workbook, options);

    // Guardar el archivo Excel
    saveAsExcelFile(excelBuffer, fileName);
};

function saveAsExcelFile(buffer, fileName) {
    const data = new Blob([buffer], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"});
    saveAs(data, fileName + '.xlsx');
};