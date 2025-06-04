const assert = require('chai').assert;
const sinon = require('sinon');
const loginUserModel = require('../../../model/login_models/loginuser_model');
const sql = require('mssql');

describe('LoginUserModel', () => {
    let connectStub;
    let requestStub;
    let queryStub;
    let poolMock;

    beforeEach(() => {
        queryStub = sinon.stub().resolves({ recordset: [{ IdUsuario: 1, Correo: 'test@example.com', Nombre: 'Test', Apellido: 'User', idrol: 1, id_sucursal: 1, Contraseña_Desencryptada: 'password' }] });
        requestStub = () => ({
            input: sinon.stub().returnsThis(),
            query: queryStub,
        });
        poolMock = {
            request: sinon.stub().returns(requestStub()),
            close: sinon.stub().resolves(),
        };
        connectStub = sinon.stub(sql, 'connect').resolves(poolMock);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getUserById', () => {
        it('should return user data if username and password match', async () => {
            const user = await loginUserModel.getUserById('test@example.com', 'password');
            assert.deepStrictEqual(user, { IdUsuario: 1, Correo: 'test@example.com', Nombre: 'Test', Apellido: 'User', idrol: 1, id_sucursal: 1, Contraseña_Desencryptada: 'password' });
            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            // Simplemente verificamos que queryStub fue llamado
        });

        it('should return undefined if no matching user is found', async () => {
            queryStub.resolves({ recordset: [] });
            const user = await loginUserModel.getUserById('nonexistent@example.com', 'wrongpassword');
            assert.isUndefined(user);
            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            // Simplemente verificamos que queryStub fue llamado
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);
            try {
                await loginUserModel.getUserById('test@example.com', 'password');
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err, error);
            }
            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('getInvoicesByUserId', () => {
        it('should return a list of invoices for a given user ID', async () => {
            const mockInvoices = [
                { No_Factura: 'F001', Fecha: '26/04/2025', Efectivo: 100, Total: 120, Cambio: 20, Nombre_Cliente: 'Cliente A', Id_Usuario: 1 },
                { No_Factura: 'F002', Fecha: '25/04/2025', Efectivo: 50, Total: 50, Cambio: 0, Nombre_Cliente: 'Cliente B', Id_Usuario: 1 },
            ];
            queryStub.resolves({ recordset: mockInvoices });
            const invoices = await loginUserModel.getInvoicesByUserId(1);
            assert.deepStrictEqual(invoices, mockInvoices);
            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            // Simplemente verificamos que queryStub fue llamado
        });

        it('should return an empty array if no invoices are found for the user ID', async () => {
            queryStub.resolves({ recordset: [] });
            const invoices = await loginUserModel.getInvoicesByUserId(2);
            assert.deepStrictEqual(invoices, []);
            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            // Simplemente verificamos que queryStub fue llamado
        });

        it('should handle database errors when fetching invoices', async () => {
            const error = new Error('Database error fetching invoices');
            connectStub.rejects(error);
            try {
                await loginUserModel.getInvoicesByUserId(1);
                assert.fail('La promesa no fue rechazada');
            } catch (err) {
                assert.strictEqual(err, error);
            }
            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });
});