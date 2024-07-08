const { sql, config } = require('./connection_model');
const { getDate } = require('../controller/getdateforsale_controller');

const get_infoBoxes = async (user) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .input('ID', sql.Int, user.IdUsuario)
           .query('SELECT * FROM Caja WHERE IdUsuario_Creacion = @ID AND Fecha = CONVERT(varchar(10), GETDATE(), 126);');
        // Verificar si result.recordset está vacío
        if (result.recordset.length === 0) {
            console.log('No hay registros.');
            return true; // O manejar como prefieras
        } else {
            //console.log('Información de cajas:', result.recordset);
            return false;
        }
    } catch (err) {
        console.error('Error al obtener información de cajas:', err);
    } finally {
        pool.close();
    }
 
};

const openCash = async (monto, user) => {
    let pool;
    try {
        pool = await sql.connect(config);
        await pool.request()
           .input('idestado', sql.Int, 1)
           .input('monto', sql.Decimal(15, 2), monto)
           .input('idusuario', sql.Int, user.IdUsuario)
           .input('fecha', sql.Date, getDate())
           .execute('abrirCaja'); // Llamada al procedimiento almacenado
        console.log('Caja abierta exitosamente.');
        return true;
    } catch (err) {
        console.error('Error al abrir caja:', err);
        return false;
    } finally {
        if (pool) {
            pool.close();
        }
    }
};


module.exports = { get_infoBoxes, openCash };