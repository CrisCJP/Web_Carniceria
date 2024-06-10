//For button "Agregar Productos"
function sendDataDetail(firstname, lastname, productname, amountproduct) {
    var formData = new FormData();
    formData.append('first_name',firstname);
    formData.append('last_name', lastname);
    formData.append('product_name', productname);
    formData.append('amount_product', amountproduct);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/addDataforSale', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if ('message' in answer) {
                document.getElementById('btnTerminarVentar').disabled = true;
                alert('No hay producto en existencia');
                throw new Error ('Fatal Error (Falta de existencia)');
            }
            else {
                if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                    var table = document.getElementById('tbDetallesVenta');
                    var row = answer.list[answer.list.length - 1]; // Get the last product added
                    var newRow = table.insertRow(); // Create a new row for the latest product
    
                    // Agrega el nombre del producto
                    newRow.insertCell().textContent = row.nombreproducto;
    
                    // Create an editable cell for cantidadopeso
                    var amountCell = newRow.insertCell();
                    var input = document.createElement('input');
                    input.type = 'number';
                    input.min = '1';
                    input.value = row.cantidadopeso;
                    input.addEventListener('change', function() {
                        if (this.value > 0) {
                            var new_amount = parseFloat(this.value);
                            var nuevaExistencia = row.existencia_defore - new_amount;
                            var nuevoCosto = row.precioventa * new_amount;
    
                            // Find the total cell in the current row and update its contents
                            var totalCell = newRow.cells[3]; // Assuming the total cell is the fourth cell
                            totalCell.textContent = nuevoCosto.toFixed(2) + 'C$'; // Format to two decimal places and add the currency
    
    
                            updateAmount(row.idproducto, new_amount, nuevaExistencia, nuevoCosto); // Function to update the value
                        } else {
                            alert('Debes ingresar una cantidad mayor que 0');
                            this.value = row.cantidadopeso;
                        }
                    });
                    amountCell.appendChild(input);
                    // Add the sales price
                    newRow.insertCell().textContent = row.precioventa + ' C$';
                    // Add the total
                    newRow.insertCell().textContent = row.costo.toFixed(2) + ' C$';
    
                    document.getElementById('txtTotal').value = answer.total + ' C$';
    
                }
    
                document.getElementById('cboBuscarProducto').value = '';
                document.getElementById('txtCantidad_Peso').value = '';
            }
        }
        else {
            console.log(xhr.status);
        }
    };

    xhr.send(formData);
}


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById('btnAgregarVenta').addEventListener('click', function(event) {
        var first_name = document.getElementById('txtNombreCliente').value;
        var last_name = document.getElementById('txtApellidoCliente').value;
        var product_name = document.getElementById('cboBuscarProducto').value;
        var amount_product = document.getElementById('txtCantidad_Peso').value;

        const input_firstname = document.getElementById('txtNombreCliente');
        const input_lastname = document.getElementById('txtApellidoCliente');
        const btn_finish = document.getElementById('btnTerminarVentar');

        if (!product_name || product_name === '') {
            window.alert("No puedes ingresar el producto, si antes seleccionarlo")
            event.preventDefault();
            return false;
        }

        if (!amount_product || amount_product === '' || amount_product <= 0) {
            alert("Debes ingresar la cantidad del producto y no ingresar valores menores que 1");
            event.preventDefault();
            return false;
        }

        input_firstname.disabled = true;
        input_lastname.disabled = true;
        btn_finish.disabled = false;

        sendDataDetail(first_name, last_name, product_name, amount_product);
    });
});


function updateAmount (idproduct, amount, existence, costo) {
    var formData = new FormData();
    formData.append('id', idproduct);
    formData.append('new_amount', amount);
    formData.append('new_existence', existence);
    formData.append('new_costo', costo);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateAmount', true); // Make sure you have this route on your server
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Cantidad actualizada");

            var answer = JSON.parse(xhr.responseText);
            if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                document.getElementById('txtTotal').value = answer.total + ' C$';
            }
            else {
                console.log("Error al actualizar la cantidad");
            }
        } else {
            console.log("Error al actualizar la cantidad");
        }
    };
    xhr.send(formData);
};