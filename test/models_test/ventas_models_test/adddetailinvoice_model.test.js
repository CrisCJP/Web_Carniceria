const assert = require('chai').assert;
const sinon = require('sinon');
const addDetailInvoiceModel = require('../../../model/ventas_models/adddetailinvoice_model');
const sql = require('mssql');

describe('AddDetailInvoiceModel', () => {
    let connectStub; // Stub para la función sql.connect
    let requestStub; // Stub para la función request del pool
    let queryStub; // Stub para la función query del request
    let poolMock; // Mock para el objeto pool de la base de datos

    beforeEach(() => {
        // Crea un stub para la función query. Este stub simulará la ejecución de las consultas SQL.
        queryStub = sinon.stub();
        // Crea un stub para la función request del pool. Esta función es llamada por el modelo para crear una solicitud SQL.
        // Configuramos este stub para que devuelva un objeto con las funciones input y query (también stubs).
        requestStub = sinon.stub().returns({
            input: sinon.stub().returnsThis(), // Stub para la función input que se utiliza para definir los parámetros de la consulta. returnsThis() permite encadenar llamadas.
            query: queryStub, // Asigna el stub de query creado anteriormente.
        });
        // Crea un mock para el objeto pool de la base de datos.
        poolMock = {
            request: requestStub, // Asigna el stub de request al método request del pool mock.
            close: sinon.stub().resolves(), // Simula el cierre exitoso de la conexión del pool.
        };
        // Crea un stub para la función sql.connect. Esta función es llamada por el modelo para establecer la conexión a la base de datos.
        // Configuramos este stub para que resuelva con nuestro pool mock, simulando una conexión exitosa.
        connectStub = sinon.stub(sql, 'connect').resolves(poolMock);
    });

    afterEach(() => {
        // Restaura todos los stubs y mocks después de cada prueba para asegurar que no haya interferencia entre las pruebas.
        sinon.restore();
    });

    describe('getIdCustomer', () => {
        it('should return the modified next customer ID', async () => {
            // Simula una respuesta exitosa de la base de datos con un registro que contiene un IdCliente.
            queryStub.resolves({ recordset: [{ IdCliente: 'C100' }] });
            // Llama a la función que estamos probando.
            const nextId = await addDetailInvoiceModel.getIdCustomer();
            // Verifica que el ID devuelto sea el esperado ('C101' basado en la lógica de modifyIdCustomer).
            assert.strictEqual(nextId, 'C101');
            // Verifica que la función sql.connect fue llamada una vez (al inicio de la función del modelo).
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query del request fue llamada una vez.
            sinon.assert.calledOnce(queryStub);
            // Verifica que la función query fue llamada con la consulta SQL esperada.
            sinon.assert.calledWith(queryStub, 'SELECT TOP 1 IdCliente FROM Cliente ORDER BY CAST(SUBSTRING(IdCliente, 2, LEN(IdCliente)) AS INT) DESC');
        });

        it('should handle the case where no customer ID exists and return C1', async () => {
            // Simula una respuesta exitosa de la base de datos pero sin registros (no se encontraron clientes).
            queryStub.resolves({ recordset: [] });
            // Llama a la función que estamos probando.
            const nextId = await addDetailInvoiceModel.getIdCustomer();
            // Verifica que se devuelva 'C1' en el caso de no haber clientes (según la lógica del modelo).
            assert.strictEqual(nextId, 'C1');
            // Verifica que sql.connect fue llamado una vez.
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query fue llamada una vez con la consulta correcta.
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT TOP 1 IdCliente FROM Cliente ORDER BY CAST(SUBSTRING(IdCliente, 2, LEN(IdCliente)) AS INT) DESC');
        });

        it('should handle database errors', async () => {
            // Simula un error de conexión a la base de datos haciendo que connectStub rechace la promesa.
            const error = new Error('Database error');
            connectStub.rejects(error);
            // Intenta llamar a la función y verifica que la promesa sea rechazada con el error esperado.
            try {
                await addDetailInvoiceModel.getIdCustomer();
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err, error);
            }
            // Verifica que sql.connect fue llamado una vez.
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query no fue llamada ya que la conexión falló.
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('getDatasProductSale', () => {
        it('should return product data if the product name exists', async () => {
            // Simula una respuesta exitosa de la base de datos con datos de un producto.
            const mockProductData = { idproducto: 'P001', NombreProducto: 'Test Product', PrecioVenta: 10.99, Stock: 100 };
            queryStub.resolves({ recordset: [mockProductData] });
            // Llama a la función que estamos probando.
            const productData = await addDetailInvoiceModel.getDatasProductSale('Test');
            // Verifica que los datos del producto devueltos sean los esperados.
            assert.deepStrictEqual(productData, mockProductData);
            // Verifica que sql.connect fue llamado una vez.
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query fue llamada una vez con la consulta correcta.
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM get_view_for_productdata WHERE NombreProducto LIKE @NombreProducto');
            // Verifica que la función input del stub request fue llamada para configurar el parámetro de la consulta.
            sinon.assert.called(requestStub().input);
            // Verifica que la función input fue llamada con los argumentos esperados (nombre del parámetro, tipo y valor).
            sinon.assert.calledWith(requestStub().input, 'NombreProducto', sql.VarChar, '%Test%');
        });

        it('should return undefined if the product name does not exist', async () => {
            // Simula una respuesta exitosa de la base de datos pero sin registros (producto no encontrado).
            queryStub.resolves({ recordset: [] });
            // Llama a la función que estamos probando.
            const productData = await addDetailInvoiceModel.getDatasProductSale('NonExistent');
            // Verifica que se devuelva undefined si el producto no se encuentra.
            assert.isUndefined(productData);
            // Verifica que sql.connect fue llamado una vez.
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query fue llamada una vez con la consulta correcta.
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM get_view_for_productdata WHERE NombreProducto LIKE @NombreProducto');
            // Verifica que la función input del stub request fue llamada para configurar el parámetro de la consulta.
            sinon.assert.called(requestStub().input);
            // Verifica que la función input fue llamada con los argumentos esperados para el producto no existente.
            sinon.assert.calledWith(requestStub().input, 'NombreProducto', sql.VarChar, '%NonExistent%');
        });

        it('should handle database errors', async () => {
            // Simula un error de conexión a la base de datos haciendo que connectStub rechace la promesa.
            const error = new Error('Database error');
            connectStub.rejects(error);
            // Intenta llamar a la función y verifica que la promesa sea rechazada con el error esperado.
            try {
                await addDetailInvoiceModel.getDatasProductSale('Test');
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err, error);
            }
            // Verifica que sql.connect fue llamado una vez.
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query no fue llamada ya que la conexión falló.
            sinon.assert.notCalled(queryStub);
        });
    });
});