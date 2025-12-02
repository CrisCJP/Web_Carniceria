const sql = require('mssql');

// Configuración de conexión a Azure SQL
const config = {
    server: 'serverbutchershop.database.windows.net',
    database: 'CarniceriaLupita',
    user: 'user_db',
    password: 'iejr6225,',
    port: 1433, // Puerto estándar de SQL Server

    options: {
        encrypt: true,              // Requerido en Azure
        trustServerCertificate: false, // No aceptar certificados no confiables
    },
    connectionTimeout: 30000 // 30 segundos
};

module.exports = { sql, config };
