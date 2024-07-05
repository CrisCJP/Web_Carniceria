const { sql, config } = require('./connection_model');

const getDenomination = async(denomination) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .input('id', sql.Int, denomination)
           .query('SELECT Denominacion FROM Nomina WHERE IdNomina = @id');
        return result.recordset;
    } finally {
        pool.close();
    }
};

const get_totalInvoices = async (user) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('sucursal', sql.Int, user.id_sucursal)
           .query('SELECT SUM(Total) AS Total FROM view_getTotalIngreso WHERE Sucursal = @sucursal AND Fecha = CONVERT(varchar(10), GETDATE(), 126);');
        return result.recordset[0].Total;
    } catch (err) {
        console.error('Error al obtener el número de facturas:', err);
    } finally {
        pool.close();
    }
};

const get_infocash = async (user) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .input('id', sql.Int, user.IdUsuario)
           .query('SELECT * FROM Caja WHERE IdUsuario_Creacion = @id AND Fecha = CONVERT(varchar(10), GETDATE(), 126);');
        return result.recordset[0];
    } catch (err) {
        console.error('Error al obtener el saldo en caja:', err);
    } finally {
        pool.close();
    }
};



const createArqueo = async (dataArray, total_ingreso, observacion) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const transaction = new sql.Transaction(pool);

        await transaction.begin();
        console.log('Transacción iniciada');

        for (const data of dataArray) {
            console.log('Procesando:', JSON.stringify(data, null, 2));
            const request = new sql.Request(transaction);
            request.input('id_Caja', sql.Int, data.idcaja);
            request.input('idusuario', sql.Int, data.idusuario);
            request.input('monto_inicial', sql.Decimal, data.montoinicial);
            request.input('total_ingreso', sql.Decimal, total_ingreso);
            request.input('observacion', sql.Text, observacion);
            request.input('fecha', sql.Date, data.fecha);
            request.input('id_denominacion', sql.Int, data.denomination);
            request.input('cantidad', sql.Int, data.amount);
            request.input('total_denominacion', sql.Decimal, data.total);

            await request.execute('create_Arqueo');
            console.log('Solicitud ejecutada para:', JSON.stringify(data, null, 2));
        }

        await transaction.commit();
        console.log('Transacción comprometida');
        return true;
    } catch (err) {
        console.error('Error al crear el arqueo:', err);
        if (transaction) {
            await transaction.rollback();
            console.log('Transacción revertida');
        }
        return false;
    } finally {
        if (pool) {
            await pool.close();
            console.log('Conexión cerrada');
        }
    }
};


const get_dolarChange = async () => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
           .query('SELECT Cambio FROM Cambio_Dolar ORDER BY Fecha DESC;');
        return result.recordset[0].Cambio;
    } catch (err) {
        console.error('Error al obtener la tasa de cambio del dólar:', err);
    } finally {
        pool.close();
    }
};


const get_arqueoReport = async (init, final) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('init', sql.Date, init)
            .input('final', sql.Date, final)
           .query("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, * FROM get_aqueoReport WHERE Fecha BETWEEN @init AND @final ORDER BY Fecha DESC;");
        return result.recordset;
    } catch (err) {
        console.error('Error al obtener el reporte de arqueos:', err);
    } finally {
        pool.close();
    }
};


module.exports = { getDenomination, get_totalInvoices, get_infocash, createArqueo, get_dolarChange, get_arqueoReport };