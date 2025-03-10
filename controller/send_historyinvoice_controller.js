const InvoiceService  = require('../model/gethistoryinvoice_model');

// Crear una instancia de la clase
const invoiceService = new InvoiceService();

const setHistoryInvoiceforDate = async (req, res, iduser) => {
    try {
        const { start_date, end_date } = req.body;

        const historyInvoiceForDate = await invoiceService.getHistoryInvoicePreview_forDate(iduser, start_date, end_date);

        if (!historyInvoiceForDate || historyInvoiceForDate.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados' });
        }
        
        res.status(200).json({ historyinvoice_fordate: historyInvoiceForDate });

    } catch (err) {
        console.error("Error en setHistoryInvoiceforDate:", err);
        res.status(500).json({ message: err.message });
    }
};

const setHistoryInvoiceforNoVenta = async (req, res, iduser) => {
    try {
        const { sales_number } = req.body;

        const historyInvoiceForNoVenta = await invoiceService.getHistoryInvoicePreview_forNoVenta(iduser, sales_number);

        if (!historyInvoiceForNoVenta || historyInvoiceForNoVenta.length === 0) {
            return res.status(404).json({ message: 'No se encontraron resultados' });
        }

        res.status(200).json({ historyinvoice_fornoventa: historyInvoiceForNoVenta });

    } catch (err) {
        console.error("Error en setHistoryInvoiceforNoVenta:", err);
        res.status(500).json({ message: err.message });
    }
};

module.exports = { setHistoryInvoiceforDate, setHistoryInvoiceforNoVenta };
