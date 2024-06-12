function getReportforDate(initial_date, final_date, option_report, option_product) {
    var formData = new FormData();
    formData.append('start_date', initial_date);
    formData.append('end_date', final_date);
    formData.append('option_report', option_report);
    formData.append('option_product', option_product);
    const btn_export = document.getElementById('btnExportar');

    var xhr = new XMLHttpRequest();
    xhr.open('post', '/getReportforDate', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {

                if (option_report == 'fecha') {
                    const array = ['Fecha', 'Numero de Venta', 'Efectivo', 'Total de la Venta', 'Cambio'];
                    actualizarEncabezados(array);
                    agregarDatos(answer, option_report);
                    btn_export.disabled = false;
                }
                else if (option_report == 'producto_mas_vendidos') {
                    if (option_product == 'all_products') {
                        const array = ['Producto', 'Categoria', 'Cantidad', 'Precio', 'Total'];
                        actualizarEncabezados(array);
                        agregarDatos(answer, option_report, option_product);
                        btn_export.disabled = false;
                    }
                    else if (option_product == 'for_products_in_category') {
                        const array = ['Categoria', 'Producto', 'Cantidad', 'Precio', 'Total'];
                        actualizarEncabezados(array);
                        agregarDatos(answer, option_report, option_product);
                        btn_export.disabled = false;
                    }
                    else {
                        const array = ['Categoria', 'Total de artículos', 'Total'];
                        actualizarEncabezados(array);
                        agregarDatos(answer, option_report, option_product);
                        btn_export.disabled = false;
                    }   
                }
                
                else {
                    console.error('Opcion no disponible');
                }
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
        var select_element_products = document.getElementById('cboBuscarPorProducto_Categoria');

        if (select_element.value == 'producto_mas_vendidos') {
            console.log(select_element_products.value);
            getReportforDate(initial_date, final_date, select_element.value, select_element_products.value);
            document.getElementById('btnExportar').disabled = false;
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
                    getReportforDate(initial_date, final_date, select_element.value);
                    document.getElementById('btnExportar').disabled = false;
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
            initial_date.value = '';
            final_date.value = '';
            document.getElementById('div_element_product').style.display = 'none';
        }
        else if (value_element == 'producto_mas_vendidos') {
            initial_date.disabled = true;
            final_date.disabled = true;
            initial_date.value = '';
            final_date.value = '';
            document.getElementById('div_element_product').style.display = 'block';
        }
        else {
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
function agregarDatos(datas, option, option_product) {
    const tbody = document.querySelector('#tbdata tbody');
    tbody.innerHTML = ''; // Limpia las filas de datos existentes
    
    // Asumiendo que 'datas' es un objeto que contiene una propiedad 'reportList' que es un arreglo
    if (datas.reportList && Array.isArray(datas.reportList)) {
        datas.reportList.forEach(filaDatos => {
            const tr = document.createElement('tr');
            
            // Si 'filaDatos' es un objeto, itera sobre sus valores
            if (filaDatos && typeof filaDatos === 'object') {
                
                if (option == 'fecha') {
                    Object.keys(filaDatos).forEach(key => {
                        if (key !== 'Fecha' && key !== 'Total' && key !== 'Efectivo' && key !== 'Cambio') { // Omitimos la propiedad 'fecha'
                            const td = document.createElement('td');
                            td.textContent = filaDatos[key];
                            tr.appendChild(td);
                        }
                    });

                    // Agrega la celda para 'Subtotal'
                    const tdEfectivo = document.createElement('td');
                    tdEfectivo.textContent = `${filaDatos.Efectivo} C$`;
                    tr.appendChild(tdEfectivo);

                    // Agrega la celda para 'Subtotal'
                    const tdVenta = document.createElement('td');
                    tdVenta.textContent = `${filaDatos.Total} C$`;
                    tr.appendChild(tdVenta);

                    // Agrega la celda para 'Subtotal'
                    const tdCambio = document.createElement('td');
                    tdCambio.textContent = `${filaDatos.Cambio} C$`;
                    tr.appendChild(tdCambio);
                }
                else if (option == 'producto_mas_vendidos') {
                    Object.keys(filaDatos).forEach(key => {
                        // Creamos una celda para cada propiedad, excepto 'Subtotal' y 'Precio' que se manejarán aparte
                        if (key !== 'Total' && key !== 'Precio') {
                            const td = document.createElement('td');
                            td.textContent = filaDatos[key];
                            tr.appendChild(td);
                        }
                    });

                    if (option_product == 'for_category') {
                        // Agrega la celda para 'Subtotal'
                        const tdSubtotal = document.createElement('td');
                        tdSubtotal.textContent = `${filaDatos.Total} C$`;
                        tr.appendChild(tdSubtotal);
                    }
                    else {
                        // Agrega la celda para 'Precio'
                        const tdPrecio = document.createElement('td');
                        tdPrecio.textContent = `${filaDatos.Precio} C$`;
                        tr.appendChild(tdPrecio);

                        // Agrega la celda para 'Subtotal'
                        const tdSubtotal = document.createElement('td');
                        tdSubtotal.textContent = `${filaDatos.Total} C$`;
                        tr.appendChild(tdSubtotal);
                    }
                }
                else if (option =='mensual') {
                    Object.keys(filaDatos).forEach(key => {
                        // Creamos una celda para cada propiedad, excepto 'Subtotal' y 'Precio' que se manejarán aparte
                        if (key !== 'Ventas_Mes') {
                            const td = document.createElement('td');
                            td.textContent = filaDatos[key];
                            tr.appendChild(td);
                        }
                    });

                    // Agrega la celda para 'Subtotal'
                    const tdVenta = document.createElement('td');
                    tdVenta.textContent = `${filaDatos.Ventas_Mes} C$`;
                    tr.appendChild(tdVenta);
                }
                else if (option =='semanal') {
                    Object.keys(filaDatos).forEach(key => {
                        // Creamos una celda para cada propiedad, excepto 'Subtotal' y 'Precio' que se manejarán aparte
                        if (key !== 'Ventas_Semana') {
                            const td = document.createElement('td');
                            td.textContent = filaDatos[key];
                            tr.appendChild(td);
                        }
                    });

                    // Agrega la celda para 'Subtotal'
                    const tdVenta = document.createElement('td');
                    tdVenta.textContent = `${filaDatos.Ventas_Semana} C$`;
                    tr.appendChild(tdVenta);
                }
                else {
                    console.error('Opcion no disponible');
                }
            }
            tbody.appendChild(tr);
        
        });
        document.getElementById('btnExportar').addEventListener('click', function(event) {
            exportToExcel(datas.reportList, option)
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
    if (fileName == 'fecha')
        dataWithoutDate = removeDateProperty(reportList);
    else 
        dataWithoutDate = reportList;

    // Calcular la suma total de la propiedad 'Total'
    const totalSum = dataWithoutDate.reduce((sum, record) => sum + (record.Total || 0), 0);
    console.log(totalSum); // Para verificar que la suma se calcula correctamente

    // Crear un nuevo libro de trabajo y una hoja de cálculo
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataWithoutDate);

    // Asegurarse de que el rango de la hoja de cálculo incluya la nueva columna
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    range.e.c += 1; // Aumentar el rango de columnas en 1 para la nueva columna
    worksheet['!ref'] = XLSX.utils.encode_range(range);

    // Añadir un encabezado para la nueva columna 'Total Sum'
    worksheet[XLSX.utils.encode_cell({r: 0, c: range.e.c})] = {v: 'Total de las Ventas', t: 's'};

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