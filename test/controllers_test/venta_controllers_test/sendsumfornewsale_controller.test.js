const assert = require('chai').assert;
const sinon = require('sinon');
const { getSumforNewSale, getSumforNewSale_return } = require('../../../controller/venta_controllers/sendsumfornewsale_controller');

describe('Send Sum For New Sale Controller', () => {
    let req;
    let res;

    beforeEach(() => {
        req = {
            body: {} // No se utiliza directamente en estas funciones, pero se incluye por convención
        };
        res = {
            json: sinon.stub()
        };
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getSumforNewSale', () => {
        it('should respond with the sum of the "costo" property in the array', async () => {
            const mockArray = [{ costo: 10 }, { costo: 20 }, { costo: 30 }];
            const expectedSum = 60;

            await getSumforNewSale(req, res, mockArray);

            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { addition: expectedSum });
        });

        it('should respond with 0 for an empty array', async () => {
            const mockArray = [];
            const expectedSum = 0;

            await getSumforNewSale(req, res, mockArray);

            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { addition: expectedSum });
        });
    });

    describe('getSumforNewSale_return', () => {
        it('should return the sum of the "costo" property in the array', async () => {
            const mockArray = [{ costo: 5 }, { costo: 15 }, { costo: 25 }];
            const expectedSum = 45;

            const result = await getSumforNewSale_return(mockArray);

            assert.strictEqual(result, expectedSum);
        });

        it('should return 0 for an empty array', async () => {
            const mockArray = [];
            const expectedSum = 0;

            const result = await getSumforNewSale_return(mockArray);

            assert.strictEqual(result, expectedSum);
        });
    });
});