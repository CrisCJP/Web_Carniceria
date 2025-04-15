const { sql, config } = require('../connection_model');

// Get User and Password
const getSelledProducts = async (idUsuario) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('idusuario', sql.Int, idUsuario)
            .query("select m.Producto, SUM(m.Cantidad) as Cantidad from most_selled_products m JOIN Usuario u ON u.IdUsuario = m.Id_Usuario where m.Id_Usuario = @idusuario GROUP BY m.Producto");
        return result.recordset;
    } finally {
        pool.close();
    }
};

module.exports = { getSelledProducts };