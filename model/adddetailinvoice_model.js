const { sql, config } = require('./connection');


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
    try  {
        pool = await pool.request()
            .input('NombreProducto', sql.VarChar, `%${product_name}%`)
            .query('SELECT IdProducto, Existencia, PrecioVenta FROM Producto WHERE NombreProducto LIKE @NombreProducto')//Search for the product if it exists and Get existences
            return result.recordset[0];
    } finally {
        pool.close();
    }
};


module.exports = {};