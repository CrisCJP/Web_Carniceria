function obtenerNumeroOpcion() {
    const cboBuscarPor = document.getElementById('cboBuscarPor')
    var selectedOption = cboBuscarPor.value;

    switch (selectedOption) {
        case "fecha":
            return 1;
        case "compras_totales":
            return 2;
        case "compras_por_cliente":
            return 3;
        case "compras_por_producto":
            return 4;
        case "compras_por_proveedor":
            return 5;
        default:
            return 0; // En caso de que no coincida con ninguna opción
    }
}

function formatearFecha(fecha) {
    const d = new Date(fecha);
    const dia = ('0' + d.getUTCDate()).slice(-2);
    const mes = ('0' + (d.getUTCMonth() + 1)).slice(-2);
    const anio = d.getUTCFullYear();
    return `${dia}-${mes}-${anio}`;
}

function mostrarReporte(NOpt){
    const fechainicio = document.getElementById('txtFechaInicio').value;
    const fechafin = document.getElementById('txtFechaFin').value;
    const fechainicioF = formatearFecha(fechainicio);
    const fechafinF = formatearFecha(fechafin);

    var formData = new FormData();
    formData.append('opt', NOpt);
    formData.append('inicio', fechainicioF);
    formData.append('fin', fechafinF);
    
    var xhr = new XMLHttpRequest();
    
    xhr.open('post', '/reportesdecompras', true);
    xhr.send(formData);
    xhr.onload = function() {
        
        
        if (xhr.status === 200) {
            var answer = JSON.parse(xhr.responseText);
            
            if(answer){
                rellenarTabla(answer);
                
                    
            }else {
                // Maneja el caso en que no hay productos
                console.log('No hay productos para mostrar.');
            }
        } else {
            console.log("Error al actualizar");
        }
    };
    
}

function rellenarTabla(data) {
    var tableBody = document.getElementById('tbdata').getElementsByTagName('tbody')[0];
    // Limpiar la tabla antes de agregar nuevas filas
    tableBody.innerHTML = '';
    var numeroOpcion = obtenerNumeroOpcion();
    
    data.forEach(function(row) {
        var newRow = tableBody.insertRow();

        switch (numeroOpcion) {
            case 1:
                newRow.insertCell(0).innerHTML = row.idcompra;
                newRow.insertCell(1).innerHTML = formatearFecha(row.FechaCompra);
                newRow.insertCell(2).innerHTML = row.Subtotal;
                break;
            case 2:
                newRow.insertCell(0).innerHTML = row.TotalCompras;
                break;
            case 3:
                newRow.insertCell(0).innerHTML = row.Cliente;
                newRow.insertCell(1).innerHTML = row.TotalComprasPorCliente;
                break;
            case 4:
                newRow.insertCell(0).innerHTML = row.NombreProducto;
                newRow.insertCell(1).innerHTML = row.TotalComprasPorProducto;
                break;
            case 5:
                newRow.insertCell(0).innerHTML = row.IdCompra;
                newRow.insertCell(1).innerHTML = row.Nombre_Proveedor;
                newRow.insertCell(2).innerHTML = row.total;
                newRow.insertCell(3).innerHTML = formatearFecha(row.FechaCompra);
                break;
            default:
                console.log("Opción no válida.");
                break;
        }
        
    });
    if(tableBody && tableBody.rows.length > 0){
        document.getElementById('btnExportar1').disabled = false;
    }else{
        document.getElementById('btnExportar1').disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', (event) => {
    
    document.getElementById('btnBuscar').addEventListener('click', function() {
        
        actualizarEncabezados();
        
        mostrarReporte(obtenerNumeroOpcion());
        
    });
    document.getElementById('btnExportar1').addEventListener('click', function(){
        exportTableToExcel('tbdata', 'NewExcel');
    })
});

var txtFechaInicio = document.getElementById("txtFechaInicio");
var txtFechaFin = document.getElementById("txtFechaFin");
var tableHead = document.getElementById("table_head");

// Función para actualizar los encabezados según la opción seleccionada
function actualizarEncabezados() {
    var selectedOption = cboBuscarPor.value;
    var headers = "";

    switch (selectedOption) {
        case "fecha":
            headers = "<tr><th>ID Compra</th><th>Fecha Compra</th><th>Total</th></tr>";
            txtFechaInicio.disabled = false;
            txtFechaFin.disabled = false;
            break;
        case "compras_totales":
            headers = "<tr><th>Total Compras</th></tr>";
            txtFechaInicio.disabled = true;
            txtFechaFin.disabled = true;
            break;
        case "compras_por_cliente":
            headers = "<tr><th>Nombre Usuario</th><th>Total de Venta por Usuario</th></tr>";
            txtFechaInicio.disabled = true;
            txtFechaFin.disabled = true;
            break;
        case "compras_por_producto":
            headers = "<tr><th>Nombre de Producto</th><th>Total Compra por Producto</th></tr>";
            txtFechaInicio.disabled = true;
            txtFechaFin.disabled = true;
            break;
        case "compras_por_proveedor":
            headers = "<tr><th>#Compra</th><th>Proveedor</th><th>Total</th><th>Fecha</th></tr>";
            txtFechaInicio.disabled = true;
            txtFechaFin.disabled = true;
            break;
        default:
            headers = "<tr><th>ID Compra</th><th>Fecha Compra</th><th>Total</th></tr>";
            txtFechaInicio.disabled = false;
            txtFechaFin.disabled = false;
            break;
    }
    var tableBody = document.getElementById('tbdata').getElementsByTagName('tbody')[0];
    // Limpiar la tabla antes de agregar nuevas filas
    tableBody.innerHTML = '';
    tableHead.innerHTML = headers;
}
document.getElementById('cboBuscarPor').addEventListener('input', function(){
    if(cboBuscarPor.value=="fecha"){
        txtFechaInicio.disabled = false;
        txtFechaFin.disabled = false;
    }else{
        txtFechaInicio.disabled = true;
        txtFechaFin.disabled = true;
    }
})

//btnExportar


function exportTableToExcel(tableID, filename = ''){
    var table = document.getElementById(tableID);
    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

    var wbout = XLSX.write(wb, {bookType: 'xlsx', type: 'binary'});

    function s2ab(s) {
        var buf = new ArrayBuffer(s.length);
        var view = new Uint8Array(buf);
        for (var i = 0; i < s.length; i++) {
            view[i] = s.charCodeAt(i) & 0xFF;
        }
        return buf;
    }

    var blob = new Blob([s2ab(wbout)], {type: "application/octet-stream"});
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename + ".xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}