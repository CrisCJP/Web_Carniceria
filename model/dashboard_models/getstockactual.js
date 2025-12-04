const { sql, config } = require('../connection_model');


async function getStockActual() {
    try {
        await sql.connect(config);

        const result = await sql.query(`
            SELECT p.IdProducto,
                   p.NombreProducto,
                   i.StockFinal AS StockActual
            FROM Producto p
            INNER JOIN InventarioDiario i ON i.IdProducto = p.IdProducto
            WHERE i.Fecha = CONVERT(date, GETDATE())
        `);

        return result.recordset; // [{ IdProducto, ProductoNombre, StockActual }]
    } catch (err) {
        console.error("Error al obtener stock actual:", err);
        return [];
    }
}

module.exports = { getStockActual };
