const sql = require('mssql');

//Connect configuration
const config = {
    server: 'PC-Roni',
    database: 'CarniceriaLupita',
    user: 'prueba',
    password: '1234',
    port: 1433,

    options: {
        trustServerCertificate: true,
        encrypt: true,
    }
};


module.exports = { sql, config };