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

module.exports = {
    viewCurrentInvoice: async function(userId) {
        let pool;
        try {
            pool = await sql.connect(config);
            const result = await pool.request()
                .input('IdUser', sql.Int, userId)
                .query('SELECT i.No_Factura, i.Fecha, i.Efectivo, i.Total, i.Cambio, i.Nombre_Cliente, i.Id_Usuario FROM invoice_history_now i INNER JOIN Usuario u ON u.IdUsuario = i.Id_Usuario WHERE i.Id_Usuario = @IdUser ORDER BY i.Fecha DESC');
            
            // Format dates before sending to view
            const formattedResult = result.recordset.map(factura => {
                factura.Fecha = new Date(factura.Fecha).toLocaleDateString('es-ES');
                return factura;
            });
            
            return formattedResult;
        } catch (err) {
            console.error('Error al realizar la consulta:', err);
            throw err; // Or handle the error according to your application logic
        } finally {
            // Make sure to close the connection to the database
            if (pool) {
                await pool.close();
            }
        }
    }
};
