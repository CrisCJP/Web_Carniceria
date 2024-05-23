const { sql, config } = require('./connection');

//Show all products
const findProductforSales = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query("SELECT NombreProducto FROM Producto GO");
        return result.recordset;
    } finally {
        pool.close();
    }
};


module.exports = { findProductforSales };