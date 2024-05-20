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

// Function to obtain sales and income totals
const getDetailsDashboard = async (idUsuario) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
        .input('Id', sql.Int, idUsuario)
        .query('SELECT v.TotaldeVentas, v.TotaldeIngresos FROM viewDetailsDashboard v WHERE v.Id_Usuario = @Id');
        return result.recordset[0];
    } finally {
        pool.close();
    }
};

// Function to get the count of categories in products
const getCountProductCategories = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT COUNT(IdProducto) as CountProducts FROM Producto');
        return result.recordset[0].CountProducts;
    } finally {
      pool.close();
    }
};

// Function to get the category count
const getCountCategories = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .query('SELECT COUNT(IdCategoria) as CountCategories FROM CategoriaProducto');
        return result.recordset[0].CountCategories;
    } catch (err) {
        console.error('SQL error', err);
        return err;
    } finally {
        pool.close();
    }
};

module.exports = { getDetailsDashboard, getCountProductCategories, getCountCategories };