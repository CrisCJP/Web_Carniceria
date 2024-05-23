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
            if (answer) {
                var table = document.getElementById('tbDetallesVenta');
                const tbody = document.querySelector('#tbDetallesVenta tbody');
                tbody.innerHTML = ''; // Limpia todas las filas existentes

                answer.list.forEach(function(row) {
                    var newRow = table.insertRow(); // Create a new row
                    newRow.insertCell().textContent = row.nombreproducto; // Add product name
                    newRow.insertCell().textContent = row.cantidadopeso; // Add amount
                    newRow.insertCell().textContent = row.precioventa; // Add price
                    newRow.insertCell().textContent = row.total; // Add total
                });
            }
            document.getElementById('cboBuscarProducto').value = '';
            document.getElementById('txtCantidad_Peso').value = '';
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