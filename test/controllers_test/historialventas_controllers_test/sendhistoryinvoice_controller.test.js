const assert = require('chai').assert;
const sinon = require('sinon');
const { setHistoryInvoiceforDate, setHistoryInvoiceforNoVenta } = require('../../../controller/historialventas_controllers/send_historyinvoice_controller');
const InvoiceService = require('../../../model/historialventas_models/gethistoryinvoice_model');

describe('Send History Invoice Controller', () => {
    let req;
    let res;
    let invoiceServiceStub;
    const mockUserId = 123;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        invoiceServiceStub = sinon.createStubInstance(InvoiceService);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('setHistoryInvoiceforDate', () => {
        it('should return a 200 status and the history invoice data for a given date range', async () => {
            const mockInvoiceData = [{ invoice_number: 'INV-001', total: 50.00 }, { invoice_number: 'INV-002', total: 100.00 }];
            req.body = { start_date: '2025-04-20', end_date: '2025-04-29' };
            invoiceServiceStub.getHistoryInvoicePreview_forDate.withArgs(mockUserId, '2025-04-20', '2025-04-29').resolves(mockInvoiceData);

            await setHistoryInvoiceforDate(req, res, mockUserId, invoiceServiceStub); // Pass the stubbed service

            sinon.assert.calledOnce(invoiceServiceStub.getHistoryInvoicePreview_forDate);
            sinon.assert.calledWith(invoiceServiceStub.getHistoryInvoicePreview_forDate, mockUserId, '2025-04-20', '2025-04-29');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { historyinvoice_fordate: mockInvoiceData });
        });

        it('should return a 404 status if no history invoice data is found for the date range', async () => {
            req.body = { start_date: '2025-05-01', end_date: '2025-05-05' };
            invoiceServiceStub.getHistoryInvoicePreview_forDate.withArgs(mockUserId, '2025-05-01', '2025-05-05').resolves([]);

            await setHistoryInvoiceforDate(req, res, mockUserId, invoiceServiceStub); // Pass the stubbed service

            sinon.assert.calledOnce(invoiceServiceStub.getHistoryInvoicePreview_forDate);
            sinon.assert.calledWith(invoiceServiceStub.getHistoryInvoicePreview_forDate, mockUserId, '2025-05-01', '2025-05-05');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
        });

        it('should return a 500 status and an error message if an error occurs during data fetching', async () => {
            const errorMessage = 'Database error';
            req.body = { start_date: '2025-04-20', end_date: '2025-04-29' };
            invoiceServiceStub.getHistoryInvoicePreview_forDate.withArgs(mockUserId, '2025-04-20', '2025-04-29').rejects(new Error(errorMessage));

            await setHistoryInvoiceforDate(req, res, mockUserId, invoiceServiceStub); // Pass the stubbed service

            sinon.assert.calledOnce(invoiceServiceStub.getHistoryInvoicePreview_forDate);
            sinon.assert.calledWith(invoiceServiceStub.getHistoryInvoicePreview_forDate, mockUserId, '2025-04-20', '2025-04-29');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: errorMessage });
        });
    });

    describe('setHistoryInvoiceforNoVenta', () => {
        it('should return a 200 status and the history invoice data for a given sales number', async () => {
            const mockInvoiceData = [{ invoice_number: 'INV-003', total: 75.00 }];
            req.body = { sales_number: 'SALES-001' };
            invoiceServiceStub.getHistoryInvoicePreview_forNoVenta.withArgs(mockUserId, 'SALES-001').resolves(mockInvoiceData);

            await setHistoryInvoiceforNoVenta(req, res, mockUserId, invoiceServiceStub); // Pass the stubbed service

            sinon.assert.calledOnce(invoiceServiceStub.getHistoryInvoicePreview_forNoVenta);
            sinon.assert.calledWith(invoiceServiceStub.getHistoryInvoicePreview_forNoVenta, mockUserId, 'SALES-001');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { historyinvoice_fornoventa: mockInvoiceData });
        });

        it('should return a 404 status if no history invoice data is found for the sales number', async () => {
            req.body = { sales_number: 'SALES-002' };
            invoiceServiceStub.getHistoryInvoicePreview_forNoVenta.withArgs(mockUserId, 'SALES-002').resolves([]);

            await setHistoryInvoiceforNoVenta(req, res, mockUserId, invoiceServiceStub); // Pass the stubbed service

            sinon.assert.calledOnce(invoiceServiceStub.getHistoryInvoicePreview_forNoVenta);
            sinon.assert.calledWith(invoiceServiceStub.getHistoryInvoicePreview_forNoVenta, mockUserId, 'SALES-002');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
        });

        it('should return a 500 status and an error message if an error occurs during data fetching', async () => {
            const errorMessage = 'Network error';
            req.body = { sales_number: 'SALES-001' };
            invoiceServiceStub.getHistoryInvoicePreview_forNoVenta.withArgs(mockUserId, 'SALES-001').rejects(new Error(errorMessage));

            await setHistoryInvoiceforNoVenta(req, res, mockUserId, invoiceServiceStub); // Pass the stubbed service

            sinon.assert.calledOnce(invoiceServiceStub.getHistoryInvoicePreview_forNoVenta);
            sinon.assert.calledWith(invoiceServiceStub.getHistoryInvoicePreview_forNoVenta, mockUserId, 'SALES-001');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 500);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: errorMessage });
        });
    });
});