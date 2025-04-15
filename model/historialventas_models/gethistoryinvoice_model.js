const { sql, config } = require('../connection_model');

class InvoiceService {
    async getHistoryInvoicePreview(id_user) {
        let pool;
        try {
            pool = await sql.connect(config);
            const result = await pool.request()
                .input('Id', sql.Int, id_user)
                .query("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE IdUsuario = @Id ORDER BY Fecha DESC;");
            return result.recordset;
        } finally {
            pool.close();
        }
    }

    async getHistoryInvoicePreview_forDate(id_user, startdate, enddate) {
        let pool;
        try {
            pool = await sql.connect(config);
            const result = await pool.request()
                .input('Id', sql.Int, id_user)
                .input('start_date', sql.Date, startdate)
                .input('end_date', sql.Date, enddate)
                .query("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE Fecha BETWEEN @start_date AND @end_date AND IdUsuario = @Id ORDER BY Fecha DESC;");
            return result.recordset;
        } finally {
            pool.close();
        }
    }

    async getHistoryInvoicePreview_forNoVenta(id_user, no_invoice) {
        let pool;
        try {
            pool = await sql.connect(config);
            const result = await pool.request()
                .input('Id', sql.Int, id_user)
                .input('invoice', sql.VarChar, no_invoice)
                .query("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE IdUsuario = @Id AND No_Venta = @invoice ORDER BY Fecha DESC;");
            return result.recordset;
        } finally {
            pool.close();
        }
    }
}

module.exports = InvoiceService;
