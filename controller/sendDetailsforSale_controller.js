const { getSumforNewSale_return } = require('./sendsumfornewsale_controller');

const sendArrayDeytails = async (req, res, array) => {
    try {
        const sum = await getSumforNewSale_return(array);
        res.json({ list: array, total: sum });
    } catch (err) {
        console.error('SQL error', err);
    }
};

module.exports = { sendArrayDeytails };