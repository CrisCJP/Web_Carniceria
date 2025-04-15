const { sql, config } = require('../connection_model');

//Show all products
const findProductforSales = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query("SELECT NombreProducto, PrecioVenta, UnidadDeMedida, Existencia FROM Producto WHERE Existencia > 0;");
        return result.recordset;
    } finally {
        pool.close();
    }
};


module.exports = { findProductforSales };