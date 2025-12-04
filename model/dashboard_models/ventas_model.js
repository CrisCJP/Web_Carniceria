// model/dashboard_models/ventas_model.js
const { sql, config } = require('../connection_model');

/**
 * Consulta las ventas reales de un producto en un rango de fechas.
 * Devuelve un arreglo con objetos { fecha, producto, cantidadVendida }
 */
async function getVentasPorProducto(producto, inicio, fin) {
  try {
    // Crear conexión
    const pool = await sql.connect(config);

    // Consulta SQL: ajustada para usar IdProducto
    const result = await pool.request()
      .input('producto', sql.VarChar, producto) // producto = IdProducto (ej. PC001)
      .input('inicio', sql.Date, inicio)
      .input('fin', sql.Date, fin)
      .query(`
        SELECT 
          CONVERT(varchar, f.Fecha, 23) AS fecha,   -- Fecha en formato YYYY-MM-DD
          p.IdProducto AS producto,                 -- Usamos IdProducto para consistencia
          SUM(d.Cantidad_Peso) AS cantidadVendida
        FROM DetallesFactura d
        INNER JOIN Factura f ON d.IdFactura = f.IdFactura
        INNER JOIN Producto p ON d.IdProducto = p.IdProducto
        WHERE p.IdProducto = @producto
          AND f.Fecha BETWEEN @inicio AND @fin
        GROUP BY CONVERT(varchar, f.Fecha, 23), p.IdProducto
        ORDER BY fecha ASC;
      `);

    // Normalizar resultados
    return result.recordset.map(r => ({
      fecha: r.fecha,                        // YYYY-MM-DD
      producto: r.producto,                  // IdProducto (ej. PC001)
      cantidadVendida: parseFloat(r.cantidadVendida)
    }));
  } catch (err) {
    console.error('Error en getVentasPorProducto:', err);
    return [];
  }
}

module.exports = { getVentasPorProducto };