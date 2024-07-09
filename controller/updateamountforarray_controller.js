const getAmount = async (req, res, array) => {
    const { id, new_amount, new_existence, new_costo } = req.body;
    
    return array.map(array_temp => {
        if (array_temp.idproducto === id) {
            return { 
                ...array_temp, 
                cantidadopeso: parseFloat(new_amount),
                existencia: parseFloat(new_existence),
                costo: parseFloat(new_costo)
            };
        }
        return array_temp;
    });
};

const getDiscount = async (req, res, array) => {
    const { id, discount, cost } = req.body;
    
    return array.map(array_temp => {
        if (array_temp.idproducto === id) {
            return { 
               ...array_temp, 
                costo: parseFloat(cost),
                descuento: parseFloat(discount)
            };
        }
        return array_temp;
    });
};

module.exports = { getAmount, getDiscount };