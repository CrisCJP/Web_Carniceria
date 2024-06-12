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

const getReport_most_selled_products = async () => {
    let pool;
    try {
        pool = await sql.connect(config);

        const result = await pool.request()
            .query("SELECT * FROM report_view_best_selling_products ORDER BY Cantidad DESC;");

        // Verifica si se obtuvieron resultados
        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        throw error; // O maneja el error según las necesidades de tu aplicación
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const get_product_but_sold_by_category = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query("SELECT * FROM product_but_sold_by_category ORDER BY Cantidad DESC;");

        // Verifica si se obtuvieron resultados
        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        throw error; // O maneja el error según las necesidades de tu aplicación
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


const get_category_total_view = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query("SELECT * FROM category_total_view ORDER BY Articulos DESC;");

        // Verifica si se obtuvieron resultados
        if (result.recordset.length > 0) {
            return result.recordset;
        } else {
            return [];
        }
    } catch (error) {
        console.error('Error al obtener el reporte:', error);
        throw error; // O maneja el error según las necesidades de tu aplicación
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

module.exports = { getReport, getReport_most_selled_products, get_product_but_sold_by_category, get_category_total_view };