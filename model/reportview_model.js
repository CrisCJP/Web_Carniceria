const { sql, config } = require('./connection_model');

const getReport = async (user, start_date, end_date) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('user', sql.Int, user)
            .input('start', sql.Date, start_date)
            .input('end', sql.Date, end_date)
            .query("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, * FROM viewSalesReport WHERE Fecha BETWEEN @start AND @end ORDER BY Fecha DESC;");
        return result.recordset;
    } finally {
        pool.close();
    }
};

const getReport_quincenal = async (quincenal, month, year) => {
    let pool;
    try {
        pool = await sql.connect(config);
        console.log('Conectado a la base de datos con éxito.');

        // Imprime los valores de los parámetros para depuración
        console.log(`Parámetros recibidos - Quincenal: ${quincenal}, Mes: ${month}, Año: ${year}`);

        const result = await pool.request()
            .input('quincenal', sql.Int, quincenal)
            .input('month', sql.Int, month)
            .input('year', sql.Int, year)
            .query("SELECT FORMAT(v.Fecha, 'dd/MM/yyyy') AS FechaFormateada, v.No_Venta, CASE v.Mes WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo' WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio' WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre' WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre' END AS Mes, v.Quincena, v.Producto, v.Precio, v.Cantidad, v.Subtotal FROM  view_biweekly_sales v WHERE v.Mes = @month AND v.Quincena = @quincenal AND v.Anio = @year ORDER BY v.Fecha");

        // Verifica si se obtuvieron resultados
        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error al obtener el reporte quincenal:', error);
        throw error; // O maneja el error según las necesidades de tu aplicación
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const getReport_mensual = async (year) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('year', sql.Int, year)
            .query("SELECT v.Anio, CASE v.Mes WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo' WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio' WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre' WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre' END AS Mes, v.Ventas_Mes FROM view_monthly_and_annual_sales v WHERE v.Anio = @year;");
        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return [];
        }
    } catch (error) {
        throw new Error('Ups, hubo un error al obtener las ventas mensuales y anuales');
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const getReport_semanal = async (year) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .input('year', sql.Int, year)
           .query("select v.Anio, CASE v.Mes WHEN 1 THEN 'Enero' WHEN 2 THEN 'Febrero' WHEN 3 THEN 'Marzo' WHEN 4 THEN 'Abril' WHEN 5 THEN 'Mayo' WHEN 6 THEN 'Junio'WHEN 7 THEN 'Julio' WHEN 8 THEN 'Agosto' WHEN 9 THEN 'Septiembre' WHEN 10 THEN 'Octubre' WHEN 11 THEN 'Noviembre' WHEN 12 THEN 'Diciembre' END AS Mes, v.Semana, v.Ventas_Semana from view_weekly_sales v WHERE v.Anio = @year");
        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return [];
        }
    } catch (error) {
        throw new Error('Ups, hubo un error al obtener las ventas semanales');
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


module.exports = { getReport, getReport_quincenal, getReport_mensual, getReport_semanal };