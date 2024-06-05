function getReportforDate(initial_date, final_date, option_report) {
    var formData = new FormData();
    formData.append('start_date', initial_date);
    formData.append('end_date', final_date);
    formData.append('option_report', option_report);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getReportforDate', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {

                if (option_report == 'fecha') {
                    const array = ['Fecha', 'Numero de Venta', 'Producto', 'Precio', 'Cantidad', 'Total'];
                    actualizarEncabezados(array);
                    agregarDatos(answer);
                }
                else if (option_report == 'quincenal') {
                    const array = ['Fecha', 'Numero de Venta', 'Mes', 'Quincena del mes', 'Producto', 'Precio', 'Cantidad', 'Total'];
                    actualizarEncabezados(array);
                    agregarDatos(answer);
                }
                else if (option_report == 'mensual') {

                }
                else if (option_report == 'semanal') {

                }
                else if (option_report == 'anual') {

                }

                /*else if (option_report == '')
                    else if (option_report == '')
                        else if (option_report == '')
                            else if (option_report == '')
                                else if (option_report == '')*/


                /*document.getElementById('btnExportar').disabled = false;
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
                });*/
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
        // Get the reference to the select element
        var select_element = document.getElementById('cboBuscarPor');


        if (select_element.value != 'fecha') {
            if (initial_date.trim() === '') {
                alert ('Fecha de inicio, este campo no debe estar vacio');
                event.preventDefault();
            }
            else {
                console.log(select_element.value);
                getReportforDate(initial_date, final_date, select_element.value);
            }
        }
        else {
            if (initial_date.trim() === '' && final_date.trim() === '') {
                alert ('Fecha de inicio o Fecha Fin, estos campos no deben estar vacios');
                event.preventDefault();
            }
            else {
                if (validate_date() == true) {
                    alert ('Fecha de inicio debe ser menor a la fecha fin');
                    event.preventDefault();
                }
                else {
                    console.log(select_element.value);
                    getReportforDate(initial_date, final_date, select_element.value);
                }
            }
        }
    });
});


document.addEventListener('DOMContentLoaded', function() {
    var initial_date = document.getElementById('txtFechaInicio');
    var final_date = document.getElementById('txtFechaFin');
    
    // Obtén la referencia al elemento select
    var selectElement = document.getElementById('cboBuscarPor');

    // Añade un event listener para el evento 'change'
    selectElement.addEventListener('change', function() {
        // Obtén el valor de la opción seleccionada
        var value_element = selectElement.value;

        // Haz algo con el valor seleccionado
        if (value_element == 'fecha') {
            initial_date.disabled = false;
            final_date.disabled = false;
            
        }
        else {
            final_date.disabled = true;
            initial_date.value = '';
            final_date.value = '';
        }
    });
});


// Función para actualizar los encabezados de la tabla
function actualizarEncabezados(headers) {
    const thead = document.querySelector('#tbdata thead');
    thead.innerHTML = ''; // Limpia los encabezados existentes
    const tr = document.createElement('tr');
    headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        tr.appendChild(th);
    });
    thead.appendChild(tr);
};

// Función para agregar filas de datos a la tabla
function agregarDatos(datas) {
    const tbody = document.querySelector('#tbdata tbody');
    tbody.innerHTML = ''; // Limpia las filas de datos existentes
    console.log(datas);
    // Asumiendo que 'datas' es un objeto que contiene una propiedad 'reportList' que es un arreglo
    if (datas.reportList && Array.isArray(datas.reportList)) {
        datas.reportList.forEach(filaDatos => {
            const tr = document.createElement('tr');
            
            // Si 'filaDatos' es un objeto, itera sobre sus valores
            if (filaDatos && typeof filaDatos === 'object') {
                Object.values(filaDatos).forEach(valor => {
                    const td = document.createElement('td');
                    td.textContent = valor;
                    tr.appendChild(td);
                });
            }
            
            tbody.appendChild(tr);
        });
    } else {
        console.error('La propiedad reportList no existe o no es un arreglo:', datas);
    }
};



//Export EXCEL
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