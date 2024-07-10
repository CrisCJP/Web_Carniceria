var temp_amount = null;
var temp_discount = null;
let list_products = [];

function checkAndAddProduct(row) {
    // Check if the product already exists in the list_products array
    var exists = list_products.some(product => product.idproducto === row.idproducto);
    if (exists) {
        // Log the repeated product and show an alert with the product name
        alert('El producto ya existe en la lista: ' + row.nombreproducto);
        document.getElementById('cboBuscarProducto').value = '';
        document.getElementById('txtCantidad_Peso').value = '';
        return false; // Indicate that the product already exists
    } else {
        // Add the product to the list_products array if it doesn't exist
        list_products.push(row);
        return true; // Indicate that the product was added successfully
    }
};

//For button "Agregar Productos"
function sendDataDetail(firstname, lastname, productname, amountproduct, discount) {
    var formData = new FormData();
    formData.append('first_name',firstname);
    formData.append('last_name', lastname);
    formData.append('product_name', productname);
    formData.append('amount_product', amountproduct);
    formData.append('discount', discount);

    const input_firstname = document.getElementById('txtNombreCliente');
    const input_lastname = document.getElementById('txtApellidoCliente');
    const btn_finish = document.getElementById('btnTerminarVentar');

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/addDataforSale', true);
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Conectado");

            var answer = JSON.parse(xhr.responseText);
            if ('message' in answer) {
                if ('onerror' in answer) {
                    alert('La unidad de medida es por unidades y no por libra asegurese que sea un valor entero');
                    document.getElementById('txtCantidad_Peso').value = '';
                    throw new Error ('Fatal Error (Falta de congruensia)');
                }
                else {
                    alert('No hay producto en existencia');
                    document.getElementById('cboBuscarProducto').value = '';
                    document.getElementById('txtCantidad_Peso').value = '';
                    throw new Error ('Fatal Error (Falta de existencia)');
                }
            }
            else {
                if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                    
                    var table = document.getElementById('tbDetallesVenta');
                    var row = answer.list[answer.list.length - 1]; // Get the last product added

                    // Check if the product can be added
                    if (!checkAndAddProduct(row)) {
                        return; // Stop execution if the product already exists
                    }

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
                        if (this.value && this.value <= row.existencia_defore) {
                            var new_amount = parseFloat(this.value);
                            //console.log(row);
                            if (row.UnidadMedida === 'Unidad') {
                                if (!esEnteroDesdeInput(new_amount)) {
                                     alert('La unidad de medida es por unidades y no por libra asegurese que sea un valor entero');
                                    this.value = row.cantidadopeso;
                                    return;
                                }
                            }
                            
                            var nuevaExistencia = row.existencia_defore - new_amount;
                            var nuevoCosto = (row.precioventa * new_amount) * (1 - (row.descuento / 100));

                            console.log(nuevoCosto);
    
                            // Find the total cell in the current row and update its contents
                            var totalCell = newRow.cells[4]; // Assuming the total cell is the fourth cell
                            totalCell.textContent = 'C$ ' + nuevoCosto.toFixed(2); // Format to two decimal places and add the currency
    
                            updateAmount(row.idproducto, new_amount, nuevaExistencia, nuevoCosto); // Function to update the value
                            row.cantidadopeso = new_amount;
                        } else {
                            alert('Debes ingresar una cantidad mayor que 0 o no hay suficiente producto en existencia');
                            this.value = row.cantidadopeso;
                        }
                    });

                    // Add the amount
                    amountCell.appendChild(input);
                    // Add the sales price
                    newRow.insertCell().textContent = 'C$ ' + row.precioventa;
                    


                    // Update the discount
                    var discountCell = newRow.insertCell();
                    var input2 = document.createElement('input');
                    input2.type = 'number';
                    input2.min = '0';
                    input2.value = row.descuento;
                    input2.addEventListener('change', function() {
                        if (this.value >= 0 && this.value <= 100) {
                            var new_discount = parseFloat(this.value);
                            var new_costo = (row.precioventa * row.cantidadopeso) * (1 - (new_discount / 100));

                            updateDiscount(row.idproducto, new_discount, new_costo);
                            

                            var totalCell = newRow.cells[4]; // Assuming the total cell is the fourth cell
                            totalCell.textContent = 'C$ ' + new_costo.toFixed(2); // Format to two decimal places and add the currency
                            row.descuento = new_discount;
                        }
                        else {
                            alert('Debes ingresar un descuento entre 0 y 100');
                            this.value = row.descuento;
                        }
                    });
                    discountCell.appendChild(input2);

                    // Add the total
                    newRow.insertCell().textContent = 'C$ ' + row.costo.toFixed(2);
    
                    document.getElementById('txtTotal').value = 'C$ ' + answer.total.toFixed(2);

                    input_firstname.disabled = true;
                    input_lastname.disabled = true;
                    btn_finish.disabled = false;
    
                }
    
                document.getElementById('cboBuscarProducto').value = '';
                document.getElementById('txtCantidad_Peso').value = '';
                document.getElementById('txtDescuento').value = '';
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
        var discount = document.getElementById('txtDescuento').value;

        

        if (!product_name || product_name === '') {
            window.alert("No puedes ingresar el producto, si antes seleccionarlo")
            event.preventDefault();
            return false;
        }

        if (!amount_product || amount_product.trim() === '' || amount_product <= 0) {
            alert("Debes ingresar la cantidad del producto y no ingresar valores menores que 1");
            event.preventDefault();
            return false;
        }
        else if (!esEnteroOFlotanteDesdeInput(amount_product)) {
            alert("Solamente puedes ingresa valores enteros o flotante para la cantidad del producto");
            event.preventDefault();
            return false;
        }

        if (discount.trim() === '') {
            discount = 0;
        }
        else if (!esEnteroOFlotanteDesdeInput(discount)){
            alert("Solamente puedes ingresa valores enteros o flotante para el descuento");
            event.preventDefault();
            return false;
        }
        else if (discount < 0 || discount > 100) {
            alert("El descuento no se encuentra dentro del rango de 0% al 100%");
            event.preventDefault();
            return false;
        }

        sendDataDetail(first_name, last_name, product_name, amount_product, discount);
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
                document.getElementById('txtTotal').value = 'C$ ' + answer.total.toFixed(2);
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

function esEnteroOFlotanteDesdeInput(value) {
    const numero = parseFloat(value);
    return !isNaN(numero);
};

function esEnteroDesdeInput(value) {
    const numero = parseFloat(value);
    return Number.isInteger(numero);
};



function updateDiscount(id, discount, cost) {
    var formData = new FormData();
    formData.append('id', id);
    formData.append('discount', discount);
    formData.append('cost', cost);

    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/updateDiscount', true); // Make sure you have this route on your server
    xhr.onload = function() {
        if (xhr.status === 200) {
            console.log("Descuento actualizado");
            var answer = JSON.parse(xhr.responseText);

            if ('message' in answer) {
                alert("No se pudo actualizar el descuento");
            }
            else if (answer && typeof answer === 'object' && Object.keys(answer).length > 0) {
                document.getElementById('txtTotal').value = 'C$ ' + answer.total.toFixed(2);
            }
            else {
                console.log("Error al actualizar el descuento");
            }
        }
        else {
            console.log("Error al actualizar el descuento", xhr.status);
        }
    };
    xhr.send(formData);
};