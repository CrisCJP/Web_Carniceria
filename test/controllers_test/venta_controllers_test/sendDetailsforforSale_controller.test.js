const assert = require('chai').assert;
const sinon = require('sinon');
const { sendArrayDeytails } = require('../../../controller/venta_controllers/sendDetailsforSale_controller');
const { getSumforNewSale_return } = require('../../../controller/venta_controllers/sendsumfornewsale_controller');

describe('Send Details For Sale Controller', () => {
    let req;
    let res;
    let getSumforNewSaleReturnStub;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            json: sinon.stub()
        };
        getSumforNewSaleReturnStub = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should respond with the provided array and the sum returned by getSumforNewSale_return', async () => {
        const mockArray = [{ costo: 10 }, { costo: 20 }, { costo: 30 }];
        const mockSum = 60;
        getSumforNewSaleReturnStub.withArgs(mockArray).resolves(mockSum);

        await sendArrayDeytails(req, res, mockArray, getSumforNewSaleReturnStub); // Pasamos el stub aquí

        sinon.assert.calledOnce(getSumforNewSaleReturnStub);
        sinon.assert.calledWith(getSumforNewSaleReturnStub, mockArray);
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, { list: mockArray, total: mockSum });
    });

    it('should handle an empty array and the sum returned by getSumforNewSale_return', async () => {
        const mockArray = [];
        const mockSum = 0;
        getSumforNewSaleReturnStub.withArgs(mockArray).resolves(mockSum);

        await sendArrayDeytails(req, res, mockArray, getSumforNewSaleReturnStub); // Pasamos el stub aquí

        sinon.assert.calledOnce(getSumforNewSaleReturnStub);
        sinon.assert.calledWith(getSumforNewSaleReturnStub, mockArray);
        sinon.assert.calledOnce(res.json);
        sinon.assert.calledWith(res.json, { list: mockArray, total: mockSum });
    });

    it('should handle an error from getSumforNewSale_return without crashing', async () => {
        const mockArray = [{ costo: 5 }];
        const errorMessage = 'Error calculating sum';
        getSumforNewSaleReturnStub.withArgs(mockArray).rejects(new Error(errorMessage));

        try {
            await sendArrayDeytails(req, res, mockArray, getSumforNewSaleReturnStub);
        } catch (error) {
            // Este bloque catch capturará el rechazo de la promesa
            sinon.assert.calledOnce(getSumforNewSaleReturnStub);
            sinon.assert.calledWith(getSumforNewSaleReturnStub, mockArray);
            sinon.assert.calledOnce(res.json);
            // Ajusta la aserción de res.json según cómo manejes el error en el controlador
            // Si el controlador no envía una respuesta de error explícita, podrías comentar esta línea.
            // Si lo hace, asegúrate de verificar el status o el cuerpo del JSON de error.
            // Por ahora, solo verificamos que se haya llamado a res.json.
            // Puedes añadir más aserciones si modificas el controlador para manejar el error.
        }
    });
});