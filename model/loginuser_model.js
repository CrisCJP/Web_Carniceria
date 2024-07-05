
const { sql, config } = require('./connection_model');
// Get User and Password
const getUserById = async (username, password) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('NameUse', sql.VarChar, username)
            .input('Password', sql.VarChar, password)
            .query("select IdUsuario, Correo, Nombre, Apellido, idrol, id_sucursal, convert(varchar(100), decryptbypassphrase('passwordCVB',Password_Encript)) as Contraseña_Desencryptada from Usuario where Correo LIKE @NameUse AND convert(varchar(100), decryptbypassphrase('passwordCVB',Password_Encript)) = @Password AND Estado = 'Activo'");
        return result.recordset[0];
    } finally {
        pool.close();
    }
};


// Get Id User
const getInvoicesByUserId = async (userId) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('Id', sql.Int, userId)
            .query(`SELECT i.No_Factura, FORMAT(i.Fecha, 'dd/MM/yyyy', 'es-ES') as Fecha, i.Efectivo, i.Total, i.Cambio, i.Nombre_Cliente, i.Id_Usuario FROM invoice_history_now i INNER JOIN Usuario u ON u.IdUsuario = i.Id_Usuario WHERE i.Id_Usuario = @Id ORDER BY i.Fecha DESC`);
        return result.recordset;
    } finally {
        if (pool) {
            pool.close();
        }
    }
};

const getUserById_limit = async (username) => {
    let pool;
    try {
        pool = await sql.connect(config);
        const result = await pool.request()
            .input('NameUse', sql.VarChar, username)
            .input('Password', sql.VarChar, password)
            .query("select IdUsuario, Correo, Nombre, Apellido, idrol, convert(varchar(100), decryptbypassphrase('passwordCVB',Password_Encript)) as Contraseña_Desencryptada from Usuario where Correo LIKE @NameUse AND convert(varchar(100), decryptbypassphrase('passwordCVB',Password_Encript)) = @Password");
        return result.recordset[0];
    } finally {
        pool.close();
    }
};

module.exports = { getUserById, getInvoicesByUserId };
