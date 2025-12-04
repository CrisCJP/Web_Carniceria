const { sql, config } = require('../connection_model');

async function getInventarioPorProducto(producto, inicio, fin) {
  try {
    const pool = await sql.connect(config);
    const result = await pool.request()
      .input('producto', sql.VarChar, producto)
      .input('inicio', sql.Date, inicio)
      .input('fin', sql.Date, fin)
      .query(`
        SELECT 
          CONVERT(varchar, Fecha, 23) AS fecha,
          StockInicial,
          StockFinal
        FROM InventarioDiario
        WHERE IdProducto = @producto
          AND Fecha BETWEEN @inicio AND @fin
        ORDER BY Fecha ASC;
      `);

    return result.recordset.map(r => ({
      fecha: r.fecha,
      stockInicial: parseFloat(r.StockInicial),
      stockFinal: parseFloat(r.StockFinal)
    }));
  } catch (err) {
    console.error('Error en getInventarioPorProducto:', err);
    return [];
  }
}

module.exports = { getInventarioPorProducto };
