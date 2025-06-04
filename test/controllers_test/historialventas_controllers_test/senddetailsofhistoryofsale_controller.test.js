const assert = require('chai').assert;
const sinon = require('sinon');
const { set_salesHistorywithAll } = require('../../../controller/historialventas_controllers/send_detailsofhistoryofthesale_controller');
const { get_salesHistorywithData, get_salesHistorywithProducts } = require('../../../model/historialventas_models/getdetails_hystoryofthesale_model');

describe('Sales History Controller', () => {
    let req;
    let res;
    let getSalesHistoryWithDataStub;
    let getSalesHistoryWithProductsStub;
    const mockUser = { IdUsuario: 1, Nombre: 'Test User' };

    beforeEach(() => {
        req = {
            body: {
                sales_number: '12345'
            }
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        getSalesHistoryWithDataStub = sinon.stub();
        getSalesHistoryWithProductsStub = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('set_salesHistorywithAll', () => {
        it('should return a 200 status and the sales history data and products with user info if data is found', async () => {
            const mockSalesHistoryData = { id: 1, sales_number: '12345', total: 100 };
            const mockSalesHistoryProducts = [{ product: 'A', quantity: 2 }, { product: 'B', quantity: 1 }];

            getSalesHistoryWithDataStub.withArgs('12345').resolves(mockSalesHistoryData);
            getSalesHistoryWithProductsStub.withArgs('12345').resolves(mockSalesHistoryProducts);

            await set_salesHistorywithAll(req, res, mockUser, getSalesHistoryWithDataStub, getSalesHistoryWithProductsStub);

            sinon.assert.calledOnce(getSalesHistoryWithDataStub);
            sinon.assert.calledWith(getSalesHistoryWithDataStub, '12345');
            sinon.assert.calledOnce(getSalesHistoryWithProductsStub);
            sinon.assert.calledWith(getSalesHistoryWithProductsStub, '12345');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, {
                salesHistorywithData: mockSalesHistoryData,
                salesHistorywithProducts: mockSalesHistoryProducts,
                user: mockUser
            });
        });

        it('should return a 404 status and an error message if no sales history data is found', async () => {
            getSalesHistoryWithDataStub.withArgs('12345').resolves(null);
            getSalesHistoryWithProductsStub.withArgs('12345').resolves([]);

            await set_salesHistorywithAll(req, res, mockUser, getSalesHistoryWithDataStub, getSalesHistoryWithProductsStub);

            sinon.assert.calledOnce(getSalesHistoryWithDataStub);
            sinon.assert.calledWith(getSalesHistoryWithDataStub, '12345');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
            sinon.assert.notCalled(getSalesHistoryWithProductsStub);
        });

        it('should return a JSON error message if an error occurs during data fetching', async () => {
            const errorMessage = 'Database error occurred';

            getSalesHistoryWithDataStub.withArgs('12345').rejects(new Error(errorMessage));
            getSalesHistoryWithProductsStub.withArgs('12345').resolves([]);

            await set_salesHistorywithAll(req, res, mockUser, getSalesHistoryWithDataStub, getSalesHistoryWithProductsStub);

            sinon.assert.calledOnce(getSalesHistoryWithDataStub);
            sinon.assert.calledWith(getSalesHistoryWithDataStub, '12345');
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: errorMessage });
            sinon.assert.notCalled(res.status);
            sinon.assert.notCalled(getSalesHistoryWithProductsStub);
        });
    });
});