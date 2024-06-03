const { sql, config } = require('./connection_model');

const getReport = async (user, start_date, end_date) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('user', sql.Int, user)
            .input('start', sql.Date, start_date)
            .input('end', sql.Date, end_date)
            .query("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, * FROM viewSalesReport WHERE Fecha BETWEEN @start AND @end ORDER BY Fecha DESC");
        return result.recordset;
    } finally {
        pool.close();
    }
};

module.exports = { getReport };