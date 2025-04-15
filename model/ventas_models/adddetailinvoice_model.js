const { sql, config } = require('../connection_model');


const getIdCustomer = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT TOP 1 IdCliente FROM Cliente ORDER BY CAST(SUBSTRING(IdCliente, 2, LEN(IdCliente)) AS INT) DESC');//Know last "Id Cliente"
        return modifyIdCustomer(result.recordset[0].IdCliente);
    } finally{
        pool.close();
    }
};

function modifyIdCustomer(idcustomer) {
    let lastId = idcustomer;
    let numericId = parseInt(lastId.replace('C', ''));
    idcustomer = `C${numericId + 1}`
    return idcustomer;
};


const getDatasProductSale = async (product_name) => {
    let pool;
    try {
        // Crea una instancia del objeto pool
        pool = await sql.connect(config); // Asegúrate de que config esté correctamente configurado

        const result = await pool.request()
            .input('NombreProducto', sql.VarChar, `%${product_name}%`)
            .query('SELECT * FROM get_view_for_productdata WHERE NombreProducto LIKE @NombreProducto');

        return result.recordset[0];
    } finally {
        // Cierra la conexión del pool
        if (pool) {
            pool.close();
        }
    }
};



module.exports = { getIdCustomer, getDatasProductSale };