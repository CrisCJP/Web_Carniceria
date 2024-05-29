const { get_salesHistorywithData, get_salesHistorywithProducts } = require('../model/getdetails_hystoryofthesale_model');

const set_salesHistorywithAll = async (req, res, user) => {
    try {
        const { sales_number } = req.body;

        const salesHistorywithData = await get_salesHistorywithData(sales_number);
        const salesHistorywithProducts = await get_salesHistorywithProducts(sales_number);

        if (!salesHistorywithData)
            return res.status(404).json({ message: 'No se encontraron resultados' });

        res.status(200).json({ salesHistorywithData: salesHistorywithData, salesHistorywithProducts: salesHistorywithProducts, user: user });

    } catch (err) {
        res.json({ message: err.message });
    }
};

module.exports = { set_salesHistorywithAll };