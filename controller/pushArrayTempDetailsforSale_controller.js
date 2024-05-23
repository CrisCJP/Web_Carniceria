const { getIdCustomer, getDatasProductSale } = require('../model/adddetailinvoice_model');
const { getDateTimeId, getDateTimeDetail, getDate } = require('./getdateforsale_controller');

const getArrayforSale = async (req, res, iduser) => {
    try {
        let arraysale_temp = [];
        var { first_name, last_name, product_name, amount_product } = req.body;
        if(first_name === '')
            first_name = '-';
        if(last_name === '')
            last_name = '-';

        const idCustomer = await getIdCustomer();
        const datasProductSale = await getDatasProductSale(product_name);

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
            cantidadopeso: amount_product,
            precioventa: datasProductSale.PrecioVenta,
            existencia: datasProductSale.Existencia - amount_product,
            total: datasProductSale.PrecioVenta * amount_product,
            nombreproducto: product_name
        });
        
        return arraysale_temp;
    } catch (err) {
        console.error("Algo malo sucedio en el Array", err);
    }
};


module.exports = { getArrayforSale };