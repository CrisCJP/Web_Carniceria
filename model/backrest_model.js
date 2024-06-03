const { sql, config } = require('./connection_model');
const path = require('path');
const os = require('os');

// Ruta de la carpeta de descargas del sistema
const backupPath = path.join(__dirname, '..', 'backrest', 'CarniceriaLupita.bak');

async function backupDatabase(req, res) {
    try {
        // Asegúrate de que la cadena de conexión esté correctamente formada y sin espacios
        await sql.connect(config);
        
        // Verificar si la ruta es accesible
        console.log(`Intentando respaldar la base de datos en: ${backupPath}`);
        
        const query = `BACKUP DATABASE [CarniceriaLupita] TO DISK = N'${backupPath}'`;
        const result = await sql.query(query);
        
        console.log('Backup realizado con éxito:', result);

        // Después de realizar el backup, envía el archivo al cliente
        res.download(backupPath, 'CarniceriaLupita-Backup.bak', function(err){
            if (err) {
                // Manejo de errores si no se puede descargar el archivo
                console.error("Error al enviar el archivo:", err);
                res.status(500).send('Error al descargar el archivo de respaldo.');
            } else {
                // Si no hay errores, el archivo se habrá enviado con éxito
                console.log("Archivo de respaldo enviado con éxito.");
            }
        });
    } catch (err) {
        console.error('Error al realizar el backup:', err);
        res.status(500).send('Error al realizar el backup de la base de datos.');
    } finally {
        // Cerrar la conexión
        await sql.close();
    }
}

module.exports = { backupDatabase };


