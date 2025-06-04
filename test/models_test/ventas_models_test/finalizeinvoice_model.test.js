const assert = require('chai').assert;
const sinon = require('sinon');
const finalizeInvoiceModel = require('../../../model/ventas_models/finalizeinvoice_model');
const sql = require('mssql');

describe('FinalizeInvoiceModel', () => {
    let transactionBeginStub;
    let transactionCommitStub;
    let transactionRollbackStub;
    let mockRequest;
    let poolMock;
    let mockTransactionInstance;
    let mockRequestWithError;

    beforeEach(() => {
        const mockBegin = sinon.stub().resolves();
        const mockCommit = sinon.stub().resolves();
        const mockRollback = sinon.stub().resolves();
        mockRequest = {
            input: sinon.stub().returnsThis(),
            execute: sinon.stub().resolves({ rowsAffected: [1] }),
        };
        mockRequestWithError = {
            input: sinon.stub().returnsThis(),
            execute: sinon.stub().rejects(new Error('Error al facturar')),
        };
        const mockTransactionRequest = sinon.stub().returns(mockRequest);

        mockTransactionInstance = {
            begin: mockBegin,
            commit: mockCommit,
            rollback: mockRollback,
            request: mockTransactionRequest,
        };

        const mockTransaction = sinon.stub().returns(mockTransactionInstance);

        poolMock = {
            request: sinon.stub().returns(mockRequest),
            close: sinon.stub().resolves(),
            connected: true,
            beginTransaction: sinon.stub().resolves(mockTransactionInstance),
            transaction: mockTransaction,
        };

        // Agregamos este log
        sql.Transaction = sinon.stub().returns(mockTransactionInstance).callsFake(() => {
            console.log('¡El mock de sql.Transaction ha sido llamado!');
            return mockTransactionInstance;
        });

        transactionBeginStub = mockBegin;
        transactionCommitStub = mockCommit;
        transactionRollbackStub = mockRollback;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should process each product in the list and commit the transaction', async () => {
        const listProducts = [
            { idVendedor: 1, idCliente: 'C001', nombreCliente: 'Cliente Uno', apellidoCliente: 'Apellido Uno', dir: 'Dir 1', tel: '123', idproducto: 'P001', idfactura: 'F001', fecha: new Date(), efectivo: 100, iddetalle: 'D001', cantidadopeso: 2 },
            { idVendedor: 2, idCliente: 'C002', nombreCliente: 'Cliente Dos', apellidoCliente: 'Apellido Dos', dir: 'Dir 2', tel: '456', idproducto: 'P002', idfactura: 'F001', fecha: new Date(), efectivo: 200, iddetalle: 'D002', cantidadopeso: 1 },
        ];
        await finalizeInvoiceModel.finalizeInvoice(listProducts, poolMock);
        sinon.assert.calledOnce(mockTransactionInstance.begin); // Asertamos directamente
        sinon.assert.calledOnce(mockTransactionInstance.commit);
        sinon.assert.calledTwice(mockTransactionInstance.request);
        sinon.assert.calledTwice(mockRequest.execute);
        sinon.assert.calledOnce(poolMock.close);
    });

    it('should not process products or commit if the list is empty', async () => {
        const listProducts = [];
        await finalizeInvoiceModel.finalizeInvoice(listProducts, poolMock);
        sinon.assert.notCalled(mockTransactionInstance.begin);
        sinon.assert.notCalled(mockTransactionInstance.commit);
        sinon.assert.notCalled(mockTransactionInstance.request);
        sinon.assert.notCalled(mockRequest.execute);
        sinon.assert.calledOnce(poolMock.close);
    });

    it('should rollback the transaction and close the connection if an error occurs during product processing', async () => {
        const listProducts = [
            { idVendedor: 1, idCliente: 'C001', nombreCliente: 'Cliente Uno', apellidoCliente: 'Apellido Uno', dir: 'Dir 1', tel: '123', idproducto: 'P001', idfactura: 'F001', fecha: new Date(), efectivo: 100, iddetalle: 'D001', cantidadopeso: 2 },
        ];
        mockTransactionInstance.request.returns(mockRequestWithError);
        await finalizeInvoiceModel.finalizeInvoice(listProducts, poolMock);
        sinon.assert.calledOnce(mockTransactionInstance.begin); // Asertamos directamente
        sinon.assert.calledOnce(mockTransactionInstance.rollback);
        sinon.assert.calledOnce(mockTransactionInstance.request);
        sinon.assert.calledOnce(mockRequestWithError.execute);
        sinon.assert.calledOnce(poolMock.close);
        mockTransactionInstance.request.returns(sinon.stub().returns(mockRequest));
    });

    describe('Error Handling', () => {
        it('should handle errors during transaction begin', async () => {
            transactionBeginStub.rejects(new Error('Error al iniciar transacción'));
            await finalizeInvoiceModel.finalizeInvoice([{ /* un producto */ }], poolMock).catch(() => {
                sinon.assert.calledOnce(transactionBeginStub);
                sinon.assert.calledOnce(mockTransactionInstance.rollback);
                sinon.assert.notCalled(mockTransactionInstance.request);
                sinon.assert.notCalled(mockTransactionInstance.commit);
                sinon.assert.calledOnce(poolMock.close);
            });
        });

        it('should handle errors during product processing and rollback transaction', async () => {
            mockTransactionInstance.request.returns(mockRequestWithError);
            await finalizeInvoiceModel.finalizeInvoice([{ /* un producto */ }], poolMock);
            sinon.assert.calledOnce(mockTransactionInstance.begin); // Asertamos directamente
            sinon.assert.calledOnce(mockTransactionInstance.request);
            sinon.assert.calledOnce(mockRequestWithError.execute);
            sinon.assert.calledOnce(mockTransactionInstance.rollback);
            sinon.assert.calledOnce(poolMock.close);
            mockTransactionInstance.request.returns(sinon.stub().returns(mockRequest));
        });

        it('should handle errors during connection close after successful transaction', async () => {
            const rejectingPoolMock = { ...poolMock, close: sinon.stub().rejects(new Error('Error al cerrar conexión')) };
            await finalizeInvoiceModel.finalizeInvoice([{ /* un producto */ }], rejectingPoolMock).catch(() => {
                sinon.assert.calledOnce(mockTransactionInstance.begin); // Asertamos directamente
                sinon.assert.calledOnce(mockTransactionInstance.request);
                sinon.assert.calledOnce(mockRequest.execute);
                sinon.assert.calledOnce(mockTransactionInstance.commit);
                sinon.assert.calledOnce(rejectingPoolMock.close);
            });
        });
    });
});