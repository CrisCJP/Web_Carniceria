const { getHistoryInvoicePreview, getHistoryInvoicePreview_forDate, getHistoryInvoicePreview_forNoVenta } = require('../model/gethistoryinvoice_model');

const setHistoryInvoiceforDate = async (req, res, iduser) => {
    try {
        const { start_date, end_date } = req.body;

        const historyinvoice_fordate = await getHistoryInvoicePreview_forDate(iduser, start_date, end_date);

        if (!historyinvoice_fordate || historyinvoice_fordate === undefined || historyinvoice_fordate === '')
            return res.status(404).json({ message: 'No se encontraron resultados' });
        
        res.status(200).json({ historyinvoice_fordate: historyinvoice_fordate });

    } catch (err) {
        res.json({ message: err.message });
    }
};

const setHistoryInvoiceforNoVenta = async (req, res, iduser) => {
    try {
        const { sales_number } = req.body;

        const historyinvoice_fornoventa = await getHistoryInvoicePreview_forNoVenta(iduser, sales_number);

        if (!historyinvoice_fornoventa || typeof historyinvoice_fornoventa === undefined || historyinvoice_fornoventa === '')
            return res.status(404).json({ message: 'No se encontraron resultados' });

        

        res.status(200).json({ historyinvoice_fornoventa: historyinvoice_fornoventa });

    } catch (err) {
        res.json({ message: err.message });
    }
};

module.exports = { setHistoryInvoiceforDate, setHistoryInvoiceforNoVenta };