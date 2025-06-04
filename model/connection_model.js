const sql = require('mssql');

//Connect configuration
const config = {
    server: 'DESKTOP-5TKV4UB',
    database: 'CarniceriaLupita',
    user: 'user_prot',
    password: '12345',
    port: 1433,

    options: {
        trustServerCertificate: true,
        encrypt: true,
    }
};


module.exports = { sql, config };