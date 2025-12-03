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

    // Consulta SQL: ajusta nombres de tablas/columnas según tu BD
    const result = await pool.request()
      .input('producto', sql.VarChar, producto)
      .input('inicio', sql.Date, inicio)
      .input('fin', sql.Date, fin)
      .query(`
        SELECT 
          CONVERT(varchar, f.FechaFactura, 23) AS fecha,
          p.NombreProducto AS producto,
          SUM(d.Cantidad) AS cantidadVendida
        FROM DetallesFactura d
        INNER JOIN Factura f ON d.IdFactura = f.IdFactura
        INNER JOIN Producto p ON d.IdProducto = p.IdProducto
        WHERE p.NombreProducto = @producto
          AND f.FechaFactura BETWEEN @inicio AND @fin
        GROUP BY CONVERT(varchar, f.FechaFactura, 23), p.NombreProducto
        ORDER BY fecha ASC;
      `);

    return result.recordset.map(r => ({
      fecha: r.fecha,
      producto: r.producto,
      cantidadVendida: parseFloat(r.cantidadVendida)
    }));
  } catch (err) {
    console.error('Error en getVentasPorProducto:', err);
    return [];
  }
}

module.exports = { getVentasPorProducto };
