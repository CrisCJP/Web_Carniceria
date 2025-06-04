const assert = require('chai').assert;
const sinon = require('sinon');
const finderOfProductsForSaleModel = require('../../../model/ventas_models/finderofproductsforsale_model');
const sql = require('mssql');

describe('FinderOfProductsForSaleModel', () => {
    let connectStub; // Stub para la función sql.connect
    let requestStub; // Stub para el objeto request del pool
    let queryStub; // Stub para la función query del request
    let poolMock; // Mock para el objeto pool

    beforeEach(() => {
        // Crea un stub para la función query
        queryStub = sinon.stub();
        // Crea un stub para el objeto request que devuelve nuestro stub de query
        requestStub = () => ({
            query: queryStub,
        });
        // Crea un mock para el objeto pool
        poolMock = {
            request: sinon.stub().returns(requestStub()),
            close: sinon.stub().resolves(), // Simula el cierre exitoso de la conexión
        };
        // Crea un stub para la función sql.connect que resuelve con nuestro pool mock
        connectStub = sinon.stub(sql, 'connect').resolves(poolMock);
    });

    afterEach(() => {
        // Restaura todos los stubs y mocks después de cada prueba
        sinon.restore();
    });

    describe('findProductforSales', () => {
        it('should return an array of products with positive existence', async () => {
            // Simula una respuesta exitosa de la base de datos con algunos productos
            const mockProducts = [
                { NombreProducto: 'Product A', PrecioVenta: 10.99, UnidadDeMedida: 'unidad', Existencia: 5 },
                { NombreProducto: 'Product B', PrecioVenta: 20.50, UnidadDeMedida: 'kg', Existencia: 10 },
            ];
            queryStub.resolves({ recordset: mockProducts });

            // Llama a la función que estamos probando
            const products = await finderOfProductsForSaleModel.findProductforSales();

            // Verifica que la función sql.connect fue llamada una vez
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query fue llamada una vez con la consulta correcta
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT NombreProducto, PrecioVenta, UnidadDeMedida, Existencia FROM Producto WHERE Existencia > 0;');
            // Verifica que el resultado sea un array y que contenga los productos simulados
            assert.deepStrictEqual(products, mockProducts);
        });

        it('should return an empty array if no products have positive existence', async () => {
            // Simula una respuesta exitosa pero sin productos con Existencia > 0
            queryStub.resolves({ recordset: [] });

            // Llama a la función que estamos probando
            const products = await finderOfProductsForSaleModel.findProductforSales();

            // Verifica que la función sql.connect fue llamada una vez
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query fue llamada una vez con la consulta correcta
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT NombreProducto, PrecioVenta, UnidadDeMedida, Existencia FROM Producto WHERE Existencia > 0;');
            // Verifica que el resultado sea un array vacío
            assert.deepStrictEqual(products, []);
        });

        it('should handle database errors', async () => {
            // Simula un error de conexión a la base de datos
            const error = new Error('Database error');
            connectStub.rejects(error);

            // Intenta llamar a la función y verifica que la promesa sea rechazada con el error
            try {
                await finderOfProductsForSaleModel.findProductforSales();
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                // Verifica que el mensaje del error capturado sea igual al mensaje del error esperado
                assert.strictEqual(err.message, error.message);
            }

            // Verifica que la función sql.connect fue llamada una vez
            sinon.assert.calledOnce(connectStub);
            // Verifica que la función query no fue llamada ya que la conexión falló
            sinon.assert.notCalled(queryStub);
        });
    });
});