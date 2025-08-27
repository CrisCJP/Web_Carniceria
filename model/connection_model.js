const sql = require('mssql');

//Connect configuration
const config = {
    server: 'localhost',
    database: 'CarniceriaLupita',
    user: 'user_db',
    password: '12345',
    port: 1433,

    options: {
        trustServerCertificate: true,
        encrypt: true,
    }
};


module.exports = { sql, config };