const { sql, config } = require('./connection_model');

const get_salesHistorywithData = async (no_venta) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .input('no_venta', sql.VarChar, no_venta)
           .query("SELECT * FROM view_DetailoftheSailforData WHERE No_Venta = @no_venta");
        return result.recordset;

    } finally {
        pool.close();
    }  
};

const get_salesHistorywithProducts = async (no_venta) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .input('no_venta', sql.VarChar, no_venta)
           .query("SELECT * FROM view_DetailoftheSailforProducts WHERE No_Venta = @no_venta");
        return result.recordset;

    } finally {
        pool.close();
    }
};


module.exports = { get_salesHistorywithData, get_salesHistorywithProducts };