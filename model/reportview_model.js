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

const getReport_quincenal = async (quincenal, month, year) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('quincenal', sql.Int, quincenal)
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query("SELECT FORMAT(v.Fecha, 'dd/MM/yyyy') AS FechaFormateada, v.No_Venta, v.Anio, CASE v.Mes WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo' WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio' WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre' WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre' END AS Mes, v.Quincena, v.Producto, v.Precio, v.Cantidad, v.Subtotal FROM  view_biweekly_sales v WHERE v.Mes = @month AND v.Quincena = @quincenal AND v.Anio = @year ORDER BY v.Fecha");
        return result.recordset;
    } finally {
        pool.close();
    }
};

module.exports = { getReport, getReport_quincenal };