//generate ID factura
function getDateTimeId() {
    var ahora = new Date();
    var fecha = ('0' + ahora.getDate()).slice(-2) +
                ('0' + (ahora.getMonth() + 1)).slice(-2) + 
                ahora.getFullYear() + '-' + 
                ('0' + ahora.getHours()).slice(-2) + 
                ('0' + ahora.getMinutes()).slice(-2) + 
                ('0' + ahora.getSeconds()).slice(-2);
    return fecha;
}

//generate ID Detalle Factura
function getDateTimeDetail() {
    var ahora = new Date();
    var fecha = ('0' + ahora.getHours()).slice(-2) + 
                ('0' + ahora.getMinutes()).slice(-2) + 
                ('0' + ahora.getSeconds()).slice(-2) + '-' +
                ('0' + ahora.getDate()).slice(-2) +
                ('0' + (ahora.getMonth() + 1)).slice(-2) + 
                ahora.getFullYear();
    return fecha;
}

//Get date format
function getDate() {
    var ahora = new Date();
    var fecha = ahora.getFullYear() + '-' +
                ('0' + (ahora.getMonth() + 1)).slice(-2) + '-' +
                ('0' + ahora.getDate()).slice(-2);
    return fecha;
}

module.exports = { getDateTimeId, getDateTimeDetail, getDate};