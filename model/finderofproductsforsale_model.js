//library import
const sql = require('mssql');

//Connect configuration
const config = {
    server: 'DESKTOP-DEUHLCS',
    database: 'CarniceriaLupita',
    user: 'prueba',
    password: '1234',
    port: 1433,

    options: {
        trustServerCertificate: true,
        encrypt: true,
    }
};

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