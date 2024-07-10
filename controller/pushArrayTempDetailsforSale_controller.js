const { getIdCustomer, getDatasProductSale } = require('../model/adddetailinvoice_model');
const { getDateTimeId, getDateTimeDetail, getDate } = require('./getdateforsale_controller');

const getArrayforSale = async (req, res, iduser, array) => {
    try {
        let arraysale_temp = [];
        var { first_name, last_name, product_name, amount_product, discount } = req.body;
        if(first_name === '')
            first_name = 'Cliente';
        if(last_name === '')
            last_name = '-';

        const idCustomer = await getIdCustomer();
        const datasProductSale = await getDatasProductSale(product_name);
        
        // Asegúrate de que ambos valores son numéricos
        const existencia = parseFloat(datasProductSale.Existencia);
        const cantidadSolicitada = parseFloat(amount_product);
        const UnidadMedida = datasProductSale.UnidadMedida;

        if (existencia <= cantidadSolicitada) {
            return { success: false, data: arraysale_temp };
        }
        else {

            if (UnidadMedida === 'Unidad'){
                if (!esEnteroDesdeInput(cantidadSolicitada)) {
                    return { success: false, data: arraysale_temp, onerror: `Esto no es valido para la unidad: ${cantidadSolicitada}`};
                }
            }

            const dateTimeId = getDateTimeId();
            const dateTimeDetail = getDateTimeDetail();
            const date = getDate();

            arraysale_temp.push({
                idVendedor: iduser,
                idCliente: idCustomer,
                nombreCliente: first_name,
                apellidoCliente: last_name,
                dir: '-',
                tel: '-',
                idproducto: datasProductSale.IdProducto,
                idfactura: dateTimeId,
                fecha: date,
                efectivo: 0,
                iddetalle: dateTimeDetail,
                cantidadopeso: parseFloat(amount_product),
                precioventa: datasProductSale.PrecioVenta,
                UnidadMedida: datasProductSale.UnidadMedida,
                existencia_defore: datasProductSale.Existencia,
                existencia: parseFloat(datasProductSale.Existencia - amount_product),
                costo: parseFloat((datasProductSale.PrecioVenta * amount_product) * (1 - (discount / 100))),
                nombreproducto: product_name,
                total: 0,
                descuento: discount
            });
            

            
            if (!checkAndAddProduct(arraysale_temp, array)) {
                return { success: true, data: arraysale_temp };
            }
            else {
                return { success: null, data: arraysale_temp };
            }
        }
    } catch (err) {
        console.error("Algo malo sucedio en el Array", err);
    }
};


function checkAndAddProduct(row, list_products) {
    // Check if the product already exists in the list_products array
    var exists = list_products.some(product => product.idproducto === row[0].idproducto);
    if (exists) {
        // Log the repeated product and show an alert with the product name
        /*alert('El producto ya existe en la lista: ' + row.nombreproducto);
        document.getElementById('cboBuscarProducto').value = '';
        document.getElementById('txtCantidad_Peso').value = '';*/
        return false; // Indicate that the product already exists
    } else {
        // Add the product to the list_products array if it doesn't exist
        //list_products.push(row);
        return true; // Indicate that the product was added successfully
    }
};


function esEnteroDesdeInput(value) {
    const numero = parseFloat(value);
    return Number.isInteger(numero);
}

module.exports = { getArrayforSale };