//library import
const { sql, config } = require('../connection_model');

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
            .query('SELECT COUNT(IdProducto) as CountProducts FROM Producto WHERE Existencia > 0;');
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