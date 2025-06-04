const assert = require('chai').assert;
const sinon = require('sinon');
const InvoiceService = require('../../../model/historialventas_models/gethistoryinvoice_model');
const sql = require('mssql');

describe('InvoiceService', () => {
    let connectStub;
    let requestStub;
    let queryStub;
    let inputStub;
    let poolMock;
    let invoiceService;

    beforeEach(() => {
        queryStub = sinon.stub();
        inputStub = sinon.stub().returnsThis();
        requestStub = sinon.stub().returns({
            input: inputStub,
            query: queryStub,
        });
        poolMock = {
            request: requestStub,
            close: sinon.stub().resolves(),
        };
        connectStub = sinon.stub(sql, 'connect').resolves(poolMock);
        invoiceService = new InvoiceService();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getHistoryInvoicePreview', () => {
        it('should return a list of invoice previews for a given user ID', async () => {
            const mockInvoicePreviews = [
                { FechaFormateada: '27/04/2025', No_Venta: 'V001', Nombre_Cliente: 'Cliente A', IdUsuario: 1, Total: 100 },
                { FechaFormateada: '26/04/2025', No_Venta: 'V002', Nombre_Cliente: 'Cliente B', IdUsuario: 1, Total: 200 },
            ];
            queryStub.resolves({ recordset: mockInvoicePreviews });
            const userId = 1;

            const invoicePreviews = await invoiceService.getHistoryInvoicePreview(userId);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, "SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE IdUsuario = @Id ORDER BY Fecha DESC;");
            sinon.assert.calledOnce(inputStub);
            sinon.assert.calledWith(inputStub, 'Id', sql.Int, userId);
            assert.deepStrictEqual(invoicePreviews, mockInvoicePreviews);
        });

        it('should return an empty array if no invoice previews exist for the user ID', async () => {
            queryStub.resolves({ recordset: [] });
            const userId = 2;

            const invoicePreviews = await invoiceService.getHistoryInvoicePreview(userId);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, "SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE IdUsuario = @Id ORDER BY Fecha DESC;");
            sinon.assert.calledOnce(inputStub);
            sinon.assert.calledWith(inputStub, 'Id', sql.Int, userId);
            assert.deepStrictEqual(invoicePreviews, []);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);
            const userId = 3;

            try {
                await invoiceService.getHistoryInvoicePreview(userId);
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('getHistoryInvoicePreview_forDate', () => {
        it('should return invoice previews within the specified date range for a user', async () => {
            const mockInvoicePreviews = [
                { FechaFormateada: '27/04/2025', No_Venta: 'V003', Nombre_Cliente: 'Cliente C', IdUsuario: 4, Total: 150 },
            ];
            queryStub.resolves({ recordset: mockInvoicePreviews });
            const userId = 4;
            const startDate = '2025-04-26';
            const endDate = '2025-04-27';

            const invoicePreviews = await invoiceService.getHistoryInvoicePreview_forDate(userId, startDate, endDate);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, "SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE Fecha BETWEEN @start_date AND @end_date AND IdUsuario = @Id ORDER BY Fecha DESC;");
            assert.strictEqual(inputStub.callCount, 3); // Usamos .callCount directamente
            sinon.assert.calledWith(inputStub.getCall(0), 'Id', sql.Int, userId);
            sinon.assert.calledWith(inputStub.getCall(1), 'start_date', sql.Date, startDate);
            sinon.assert.calledWith(inputStub.getCall(2), 'end_date', sql.Date, endDate);
            assert.deepStrictEqual(invoicePreviews, mockInvoicePreviews);
        });

        it('should return an empty array if no invoices exist within the date range for the user', async () => {
            queryStub.resolves({ recordset: [] });
            const userId = 5;
            const startDate = '2025-04-20';
            const endDate = '2025-04-25';

            const invoicePreviews = await invoiceService.getHistoryInvoicePreview_forDate(userId, startDate, endDate);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, "SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE Fecha BETWEEN @start_date AND @end_date AND IdUsuario = @Id ORDER BY Fecha DESC;");
            assert.strictEqual(inputStub.callCount, 3); // Usamos .callCount directamente
            sinon.assert.calledWith(inputStub.getCall(0), 'Id', sql.Int, userId);
            sinon.assert.calledWith(inputStub.getCall(1), 'start_date', sql.Date, startDate);
            sinon.assert.calledWith(inputStub.getCall(2), 'end_date', sql.Date, endDate);
            assert.deepStrictEqual(invoicePreviews, []);
        });

        it('should handle database errors for date range search', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);
            const userId = 6;
            const startDate = '2025-04-26';
            const endDate = '2025-04-27';

            try {
                await invoiceService.getHistoryInvoicePreview_forDate(userId, startDate, endDate);
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('getHistoryInvoicePreview_forNoVenta', () => {
        it('should return invoice previews for a specific invoice number and user', async () => {
            const mockInvoicePreviews = [
                { FechaFormateada: '27/04/2025', No_Venta: 'INV001', Nombre_Cliente: 'Cliente D', IdUsuario: 7, Total: 250 },
            ];
            queryStub.resolves({ recordset: mockInvoicePreviews });
            const userId = 7;
            const invoiceNumber = 'INV001';

            const invoicePreviews = await invoiceService.getHistoryInvoicePreview_forNoVenta(userId, invoiceNumber);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, "SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE IdUsuario = @Id AND No_Venta = @invoice ORDER BY Fecha DESC;");
            assert.strictEqual(inputStub.callCount, 2); // Usamos .callCount directamente
            sinon.assert.calledWith(inputStub.getCall(0), 'Id', sql.Int, userId);
            sinon.assert.calledWith(inputStub.getCall(1), 'invoice', sql.VarChar, invoiceNumber);
            assert.deepStrictEqual(invoicePreviews, mockInvoicePreviews);
        });

        it('should return an empty array if no invoice exists for the given invoice number and user', async () => {
            queryStub.resolves({ recordset: [] });
            const userId = 8;
            const invoiceNumber = 'INV002';

            const invoicePreviews = await invoiceService.getHistoryInvoicePreview_forNoVenta(userId, invoiceNumber);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, "SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, No_Venta, Nombre_Cliente, IdUsuario, Total FROM HistoryInvoice_Preview WHERE IdUsuario = @Id AND No_Venta = @invoice ORDER BY Fecha DESC;");
            assert.strictEqual(inputStub.callCount, 2); // Usamos .callCount directamente
            sinon.assert.calledWith(inputStub.getCall(0), 'Id', sql.Int, userId);
            sinon.assert.calledWith(inputStub.getCall(1), 'invoice', sql.VarChar, invoiceNumber);
            assert.deepStrictEqual(invoicePreviews, []);
        });

        it('should handle database errors for invoice number search', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);
            const userId = 9;
            const invoiceNumber = 'INV003';

            try {
                await invoiceService.getHistoryInvoicePreview_forNoVenta(userId, invoiceNumber);
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });
});