const getSumforNewSale = async (req, res, array) => {
    try {
        const sum = await sumTotal(array);
        res.json({ addition: sum });
    }
    catch (err) {
        console.error('Error al enviar datos', err);
    }
};

const sumTotal = (array_sum) => {
    return array_sum.reduce((accumulator, current_object) => 
    accumulator + current_object.costo, 0);
};

module.exports = { getSumforNewSale };