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


const getUserById = async (username, password) => {
    const pool = await sql.connect(config);
    try {
        const result = await pool.request()
            .input('NameUse', sql.VarChar, username)
            .input('Password', sql.VarChar, password)
            // Asegúrate de ajustar la consulta para verificar también la contraseña.
            .query("select IdUsuario, Correo, convert(varchar(100), decryptbypassphrase('passwordCVB',Password_Encript)) as Contraseña_Desencryptada from Usuario where Correo LIKE @NameUse AND convert(varchar(100), decryptbypassphrase('passwordCVB',Password_Encript)) = @Password");
        return result.recordset[0];
    } finally {
        pool.close();
    }
};

const getInvoicesByUserId = async (userId) => {
    const pool = await sql.connect(config);
    try {
        const result = await pool.request()
            .input('Id', sql.Int, userId)
            .query('SELECT i.No_Factura, i.Fecha, i.Efectivo, i.Total, i.Cambio, i.Nombre_Cliente, i.Id_Usuario FROM invoice_history_now i INNER JOIN Usuario u ON u.IdUsuario = i.Id_Usuario WHERE i.Id_Usuario = @Id ORDER BY i.Fecha DESC');
        return result.recordset;
    } finally {
        pool.close();
    }
};

module.exports = { getUserById, getInvoicesByUserId };
