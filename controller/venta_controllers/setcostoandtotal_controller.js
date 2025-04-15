
const setCostoandTotal = async (req, res, array) => {
    const { new_cash, new_total } = req.body;
    const idFactura = array[0].idfactura;
    

    return array.map (object => {
        object.idfactura = idFactura.toString();

        object.efectivo = parseFloat(new_cash);
        object.total = parseFloat(new_total);

        return object;
    });
};

module.exports = { setCostoandTotal };