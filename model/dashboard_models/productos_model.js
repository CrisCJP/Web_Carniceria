const { sql, config } = require('../connection_model');

async function getPrecioProducto(producto) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('producto', sql.VarChar, producto)
      .query(`
        SELECT PrecioVenta
        FROM Producto
        WHERE IdProducto = @producto;
      `);

    return result.recordset[0]?.PrecioVenta || 0;
  } catch (err) {
    console.error('Error en getPrecioProducto:', err);
    return 0;
  }
}

module.exports = { getPrecioProducto };
