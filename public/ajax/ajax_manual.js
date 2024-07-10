$(document).ready(function() {
    $('#verManual').on('click', function(event) {
        event.preventDefault(); // Prevenir la acción por defecto del enlace
        var pdfPath = '/manual/Manual_de_Usuario.pdf'; // Ruta correcta del PDF
        window.open(pdfPath, '_blank');
    });
});