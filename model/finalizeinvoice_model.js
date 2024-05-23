//library import
const sql = require('mssql');

//Connect configuration
const config = {
    server: 'DESKTOP-OP1FG8F',
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
    finalizeInvoice: async function (list_products) {
        let transaction;
        try {
            // Conectar a la base de datos
            await sql.connect(config);
            console.log('Conectado a la base de datos.');
    
            // Crear una transacción SQL
            transaction = new sql.Transaction();
            await transaction.begin();
            console.log('Transacción iniciada.');
    
            console.log('list_products contiene:', list_products);
            if (list_products.length === 0) {
                console.log('list_products está vacío.');
            }
    
            // Iterar sobre cada producto en list_products
            for (let product of list_products) {
                // Crear una nueva solicitud SQL dentro de la transacción
                let request = transaction.request();
            
                console.log('Procesando producto:', product);
                // Llamar al procedimiento almacenado para cada producto
                request.input('idusuario', sql.Int, product.idVendedor);
                request.input('idcliente', sql.VarChar, product.idCliente);
                request.input('nombrecliente', sql.VarChar, product.nombreCliente);
                request.input('apellidocliente', sql.VarChar, product.apellidoCliente);
                request.input('direccion', sql.VarChar, product.dir);
                request.input('telefono', sql.VarChar, product.tel);
                request.input('idproducto', sql.VarChar, product.idproducto);
                request.input('idfactura', sql.VarChar, product.idfactura);
                request.input('fecha', sql.Date, product.fecha);
                request.input('efectivo', sql.Money, product.efectivo);
                request.input('iddetalle', sql.VarChar, product.iddetalle);
                request.input('cantidadopeso', sql.Decimal, product.cantidadopeso);
                // ... más parámetros según el procedimiento almacenado ...
    
                try {
                    let result = await request.execute('Facturar');
                    console.log('Producto facturado:', result);
                } catch (error) {
                    console.error('Error al facturar producto:', product, error);
                    // Decide si quieres continuar con el siguiente producto o revertir la transacción
                    break; // o continue;
                }   
            }
    
            // Finalizar la transacción
            await transaction.commit();
            console.log('Transacción finalizada con éxito.');
            list_products = [];
        } catch (err) {
            // Manejar cualquier error que ocurra durante la conexión, transacción o ejecución
            console.error('Error durante la finalización de la factura:', err);
    
            // Intentar revertir la transacción si es necesario
            if (transaction) {
                try {
                    await transaction.rollback();
                    console.log('Transacción revertida.');
                } catch (rollbackErr) {
                    console.error('Error al revertir la transacción:', rollbackErr);
                }
            }
        } finally {
            // Cerrar la conexión a la base de datos
            if (sql.connected) {
                await sql.close();
                console.log('Conexión a la base de datos cerrada.');
            }
        }
    }
};