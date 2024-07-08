function getReportforDate(init, final) {
    var formData = new FormData();
    formData.append('start_date', init);
    formData.append('end_date', final);

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getReportArqueo', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            var json = JSON.parse(xhr.responseText);
            if ('message' in json) {
                alert('Error al generar el reporte.', json.message);
            }
            else if (json && typeof json === 'object' && Object.keys(json).length > 0) {
                const array = ['Fecha', 'Arqueo', 'Caja', 'Usuario', 'Sucursal', 'Monto Inicial', 'Total Ingreso', 'Observaciones'];
                actualizarEncabezados(array);
                agregarDatos(json);
                document.getElementById('btnExportar').disabled = false;
            }
        }
    };
    xhr.send(formData);
};



document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnBuscar').addEventListener('click', function(event) {
        var initial_date = document.getElementById('txtFechaInicio').value;
        var final_date = document.getElementById('txtFechaFin').value;

        if (initial_date.trim() === '' && final_date.trim() === '') {
            alert('Debe seleccionar una fecha de inicio y una fecha final');
            event.preventDefault();
        }
        else {
            if (validate_date(initial_date, final_date) == true) {
                event.preventDefault();
            }
            else {
                getReportforDate(initial_date, final_date);
            }
        }
    });
});

function validate_date (start_date, end_date) {
    if (start_date > end_date) {
        alert('La fecha de inicio no puede ser mayor a la fecha final');
        return true;
    } else { 
        return false;
    }
};

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


function agregarDatos(datas) {
    const tbody = document.querySelector('#tbdata tbody');
    tbody.innerHTML = ''; // Limpia las filas de datos existentes
    
    // Asumiendo que 'datas' es un objeto que contiene una propiedad 'reportList' que es un arreglo
    if (datas.reportArqueo && Array.isArray(datas.reportArqueo)) {
        datas.reportArqueo.forEach(filaDatos => {
            const tr = document.createElement('tr');
            
            // Si 'filaDatos' es un objeto, itera sobre sus valores
            if (filaDatos && typeof filaDatos === 'object') {
                
            
                Object.keys(filaDatos).forEach(key => {
                    if (key !== 'Monto_Inicial' && key !== 'Total_Ingreso' && key !== 'Observacion' && key !== 'Fecha') { // Omitimos la propiedad 'fecha'
                        const td = document.createElement('td');
                        td.textContent = filaDatos[key];
                        tr.appendChild(td);
                    }
                });

                // Agrega la celda para 'Subtotal'
                const tdMontoInicial = document.createElement('td');
                tdMontoInicial.textContent = `C$ ${filaDatos.Monto_Inicial}`;
                tr.appendChild(tdMontoInicial);

                // Agrega la celda para 'Subtotal'
                const tdTotal_Ingreso = document.createElement('td');
                tdTotal_Ingreso.textContent = `C$ ${filaDatos.Total_Ingreso}`;
                tr.appendChild(tdTotal_Ingreso);

                // Agrega la celda para 'Subtotal'
                const tdObservacion = document.createElement('td');
                tdObservacion.textContent = `${filaDatos.Observacion}`;
                tr.appendChild(tdObservacion);
            }
            tbody.appendChild(tr);
        
        });
        document.getElementById('btnExportar').addEventListener('click', function(event) {
            exportToExcel(datas.reportArqueo, 'ReporteArqueo')
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
    let dataWithoutDate;
    // Eliminar la propiedad Fecha de cada objeto en reportList
    if (fileName == 'ReporteArqueo')
        dataWithoutDate = removeDateProperty(reportList);
    else 
        dataWithoutDate = reportList;

    // Calcular la suma total de la propiedad 'Total'
    const totalSum = dataWithoutDate.reduce((sum, record) => sum + (record.Total_Ingreso || 0), 0);
    console.log(totalSum); // Para verificar que la suma se calcula correctamente

    // Crear un nuevo libro de trabajo y una hoja de cálculo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataWithoutDate);

    // Asegurarse de que el rango de la hoja de cálculo incluya la nueva columna
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    range.e.c += 1; // Aumentar el rango de columnas en 1 para la nueva columna
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    // Añadir un encabezado para la nueva columna 'Total Sum'
    worksheet[XLSX.utils.encode_cell({r: 0, c: range.e.c})] = {v: 'Total de conteo', t: 's'};

    // Añadir la suma total en la segunda fila de la nueva columna
    worksheet[XLSX.utils.encode_cell({r: 1, c: range.e.c})] = {v: totalSum, t: 'n'};
    // Proteger la hoja de cálculo
    worksheet['!protect'] = {
        password: '1234' // Contraseña sin el punto
    };

    // Ajustar el ancho de las columnas
    autoWidth(worksheet); // Asegúrate de definir esta función

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

function autoWidth(worksheet) {
    const columnWidths = [];
    const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    data.forEach(row => {
        row.forEach((cell, index) => {
            // Asegúrate de que haya un valor para comparar
            if (cell != null) {
                // Convertir todo a cadena
                const length = cell.toString().length;
                // Si no existe un ancho máximo para esta columna o este valor es más largo, actualízalo
                if (!columnWidths[index] || columnWidths[index] < length) {
                    columnWidths[index] = length;
                }
            }
        });
    });

    // Establecer el ancho de la columna en el objeto worksheet
    worksheet['!cols'] = columnWidths.map(width => ({ wch: width }));
};