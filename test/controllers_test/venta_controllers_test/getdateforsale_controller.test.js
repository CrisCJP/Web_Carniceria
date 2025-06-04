const assert = require('chai').assert;
const { getDateTimeId, getDateTimeDetail, getDate } = require('../../../controller/venta_controllers/getdateforsale_controller');

describe('Get Date For Sale Controller', () => {
    describe('getDateTimeId', () => {
        it('should return a string in the format DDMMYYYY-HHMMSS', () => {
            const dateTimeId = getDateTimeId();
            assert.match(dateTimeId, /^\d{2}\d{2}\d{4}-\d{2}\d{2}\d{2}$/, 'ID de Factura no tiene el formato esperado');
        });
    });

    describe('getDateTimeDetail', () => {
        it('should return a string in the format HHMMSS-DDMMYYYY', () => {
            const dateTimeDetail = getDateTimeDetail();
            assert.match(dateTimeDetail, /^\d{6}-\d{2}\d{2}\d{4}$/, 'ID de Detalle de Factura no tiene el formato esperado');
        });
    });

    describe('getDate', () => {
        it('should return a string in the format YYYY-MM-DD', () => {
            const date = getDate();
            assert.match(date, /^\d{4}-\d{2}-\d{2}$/, 'Fecha no tiene el formato esperado');
        });
    });
});