// JavaScript para controlar el modal
var modal = document.getElementById('modalEfectivo');
//var modal_envoice = document.getElementById('modalEnvoicedetails');
var btn = document.getElementById('btnTerminarVentar');
var span = document.getElementsByClassName('close_efectivo')[0];
var submitEfectivo = document.getElementById('submitEfectivo');

btn.onclick = function() {
  modal.style.display = 'block';
}

span.onclick = function() {
  modal.style.display = 'none';
}

submitEfectivo.onclick = function() {
    var efectivo = document.getElementById('inputEfectivo').value;

    if (efectivo != null && efectivo != '' && efectivo > 0) {
        if (sendSubtotaltoModal() <= efectivo) {
        // Llama a la función finalizarFactura y pasa el valor del efectivo
        //finalizarFactura(efectivo);
        modal.style.display = 'none';
        //modal_envoice.style.display = 'block';
        }
        else {
        alert('El efectivo no solventa el total de la factura');
        }
    } else {
        alert('Debes ingresar la cantidad de efectivo, asegurate que se mayor que 0 y evitar operaciones.');
    }
}

window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = 'none';
  }
}