const assert = require('chai').assert;
const sinon = require('sinon');
const getSalesHistoryModel = require('../../../model/historialventas_models/getdetails_hystoryofthesale_model');
const sql = require('mssql');

describe('GetSalesHistoryModel', () => {
    let connectStub; // Stub para la función sql.connect
    let requestStub; // Stub para el objeto request del pool
    let queryStub; // Stub para la función query del request
    let inputStub;   // Stub para la función input del request
    let poolMock; // Mock para el objeto pool

    beforeEach(() => {
        // Crea un stub para la función query
        queryStub = sinon.stub();
        // Crea un stub para la función input
        inputStub = sinon.stub().returnsThis();
        // Crea un stub para el objeto request que devuelve nuestros stubs
        requestStub = sinon.stub().returns({
            input: inputStub,
            query: queryStub,
        });
        // Crea un mock para el objeto pool
        poolMock = {
            request: requestStub,
            close: sinon.stub().resolves(), // Simula el cierre exitoso de la conexión
        };
        // Crea un stub para la función sql.connect que resuelve con nuestro pool mock
        connectStub = sinon.stub(sql, 'connect').resolves(poolMock);
    });

    afterEach(() => {
        // Restaura todos los stubs y mocks después de cada prueba
        sinon.restore();
    });

    describe('get_salesHistorywithData', () => {
        // Describe el conjunto de pruebas para la función get_salesHistorywithData
        it('should return sales history data for a given sale number', async () => {
            // Prueba que la función devuelve los datos del historial de ventas para un número de venta específico
            const mockSalesData = [{ /* Datos de la venta */ }];
            queryStub.resolves({ recordset: mockSalesData });
            const saleNumber = 'SV001';

            const salesHistory = await getSalesHistoryModel.get_salesHistorywithData(saleNumber);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM view_DetailoftheSailforData WHERE No_Venta = @no_venta');
            sinon.assert.calledOnce(inputStub);
            sinon.assert.calledWith(inputStub, 'no_venta', sql.VarChar, saleNumber);
            assert.deepStrictEqual(salesHistory, mockSalesData);
        });

        it('should return an empty array if no sales history data exists for the sale number', async () => {
            // Prueba que la función devuelve un array vacío si no hay datos de historial de ventas para el número de venta proporcionado
            queryStub.resolves({ recordset: [] });
            const saleNumber = 'SV002';

            const salesHistory = await getSalesHistoryModel.get_salesHistorywithData(saleNumber);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM view_DetailoftheSailforData WHERE No_Venta = @no_venta');
            sinon.assert.calledOnce(inputStub);
            sinon.assert.calledWith(inputStub, 'no_venta', sql.VarChar, saleNumber);
            assert.deepStrictEqual(salesHistory, []);
        });

        it('should handle database errors', async () => {
            // Prueba que la función maneja correctamente los errores de la base de datos
            const error = new Error('Database error');
            connectStub.rejects(error);
            const saleNumber = 'SV003';

            try {
                await getSalesHistoryModel.get_salesHistorywithData(saleNumber);
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('get_salesHistorywithProducts', () => {
        // Describe el conjunto de pruebas para la función get_salesHistorywithProducts
        it('should return sales history with product details for a given sale number', async () => {
            // Prueba que la función devuelve el historial de ventas con los detalles de los productos para un número de venta específico
            const mockSalesProducts = [{ /* Detalles de los productos de la venta */ }];
            queryStub.resolves({ recordset: mockSalesProducts });
            const saleNumber = 'SV004';

            const salesHistoryProducts = await getSalesHistoryModel.get_salesHistorywithProducts(saleNumber);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM view_DetailoftheSailforProducts WHERE No_Venta = @no_venta');
            sinon.assert.calledOnce(inputStub);
            sinon.assert.calledWith(inputStub, 'no_venta', sql.VarChar, saleNumber);
            assert.deepStrictEqual(salesHistoryProducts, mockSalesProducts);
        });

        it('should return an empty array if no sales history with product details exists', async () => {
            // Prueba que la función devuelve un array vacío si no hay historial de ventas con detalles de productos para el número de venta proporcionado
            queryStub.resolves({ recordset: [] });
            const saleNumber = 'SV005';

            const salesHistoryProducts = await getSalesHistoryModel.get_salesHistorywithProducts(saleNumber);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM view_DetailoftheSailforProducts WHERE No_Venta = @no_venta');
            sinon.assert.calledOnce(inputStub);
            sinon.assert.calledWith(inputStub, 'no_venta', sql.VarChar, saleNumber);
            assert.deepStrictEqual(salesHistoryProducts, []);
        });

        it('should handle database errors for get_salesHistorywithProducts', async () => {
            // Prueba que la función maneja correctamente los errores de la base de datos para get_salesHistorywithProducts
            const error = new Error('Database error');
            connectStub.rejects(error);
            const saleNumber = 'SV006';

            try {
                await getSalesHistoryModel.get_salesHistorywithProducts(saleNumber);
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });
});