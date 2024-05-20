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

// Get User and Password
const getSelledProducts = async (idUsuario) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('idusuario', sql.Int, idUsuario)
            .query("select m.Producto, m.Cantidad from most_selled_products m JOIN Usuario u ON u.IdUsuario = m.Id_Usuario where m.Id_Usuario = @idusuario");
        return result.recordset;
    } finally {
        pool.close();
    }
};

module.exports = { getSelledProducts };