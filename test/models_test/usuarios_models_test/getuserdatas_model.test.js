const assert = require('chai').assert;
const sinon = require('sinon');
const {
    get_user_datas,
    make_changes_for_user,
    insert_new_user,
    valueFunctionsAsync
} = require('../../../model/usuarios_models/get_user_datas_model');
const sql = require('mssql');

describe('User Data Model', () => {
    let connectStub;
    let requestStub;
    let queryStub;
    let inputStub;
    let executeStub;
    let outputStub;
    let poolMock;

    beforeEach(() => {
        queryStub = sinon.stub();
        inputStub = sinon.stub().returnsThis();
        outputStub = sinon.stub();
        executeStub = sinon.stub().resolves({ output: { outputMessage: 'Success' } });
        requestStub = sinon.stub().returns({
            input: inputStub,
            query: queryStub,
            execute: executeStub,
            output: outputStub,
        });
        poolMock = {
            request: requestStub,
            close: sinon.stub().resolves(),
        };
        connectStub = sinon.stub(sql, 'connect').resolves(poolMock);
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('get_user_datas', () => {
        it('should return a list of users whose name starts with the given character, excluding the current user', async () => {
            const mockUsers = [{ ID: 2, Nombre: 'Carlos' }, { ID: 3, Nombre: 'Carla' }];
            queryStub.withArgs('SELECT * FROM view_user_data WHERE Nombre LIKE @character AND ID != @ID')
                .resolves({ recordset: mockUsers });
            const character = 'C';
            const user = { IdUsuario: 1 };

            const users = await get_user_datas(character, user);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(queryStub, 'SELECT * FROM view_user_data WHERE Nombre LIKE @character AND ID != @ID');
            sinon.assert.calledWith(inputStub.firstCall, 'character', sql.VarChar, 'C%');
            sinon.assert.calledWith(inputStub.secondCall, 'ID', sql.Int, user.IdUsuario);
            assert.deepStrictEqual(users, mockUsers);
        });

        it('should return an empty array if no users match the criteria', async () => {
            queryStub.withArgs('SELECT * FROM view_user_data WHERE Nombre LIKE @character AND ID != @ID')
                .resolves({ recordset: [] });
            const character = 'Z';
            const user = { IdUsuario: 1 };

            const users = await get_user_datas(character, user);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(users, []);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);
            const character = 'A';
            const user = { IdUsuario: 1 };

            try {
                await get_user_datas(character, user);
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('make_changes_for_user', () => {
        it('should execute the stored procedure and return the output message on success', async () => {
            const id = 10;
            const rol = 2;
            const estado = 'Activo';

            const outputMessage = await make_changes_for_user(id, rol, estado);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(executeStub);
            sinon.assert.calledWith(executeStub, 'make_changes_for_user');
            sinon.assert.calledWith(inputStub.firstCall, 'id', sql.Int, id);
            sinon.assert.calledWith(inputStub.secondCall, 'rol', sql.Int, rol);
            sinon.assert.calledWith(inputStub.thirdCall, 'estado', sql.VarChar, estado);
            assert.strictEqual(outputMessage, 'Success');
        });

        it('should handle database errors and return the error message', async () => {
            const error = new Error('Procedure failed');
            connectStub.rejects(error);
            const id = 11;
            const rol = 1;
            const estado = 'Inactivo';

            try {
                await make_changes_for_user(id, rol, estado);
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(executeStub);
        });
    });

    describe('insert_new_user', () => {
        it('should execute the stored procedure for inserting a new user and return the output message on success', async () => {
            const nombre = 'Nuevo';
            const apellido = 'Usuario';
            const correo = 'nuevo@example.com';
            const cedula = '123-456789-0001A';
            const contrasenia = 'password';
            const rol = 1;
            const estado = 'Pendiente';

            const outputMessage = await insert_new_user(nombre, apellido, correo, cedula, contrasenia, rol, estado);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(executeStub);
            sinon.assert.calledWith(executeStub, 'insert_new_user');
            sinon.assert.calledWith(inputStub.getCall(0), 'nombre', sql.VarChar(30), nombre);
            sinon.assert.calledWith(inputStub.getCall(1), 'apellido', sql.VarChar(30), apellido);
            sinon.assert.calledWith(inputStub.getCall(2), 'correo', sql.VarChar(30), correo);
            sinon.assert.calledWith(inputStub.getCall(3), 'cedula', sql.VarChar(17), cedula);
            sinon.assert.calledWith(inputStub.getCall(4), 'contrasenia', sql.VarChar(30), contrasenia);
            sinon.assert.calledWith(inputStub.getCall(5), 'rol', sql.Int, rol);
            sinon.assert.calledWith(inputStub.getCall(6), 'estado', sql.VarChar(15), estado);
            assert.strictEqual(outputMessage, 'Success');
        });

        it('should handle database errors during user insertion and return the error message', async () => {
            const error = new Error('Insertion failed');
            connectStub.rejects(error);
            const nombre = 'Error';
            const apellido = 'Usuario';
            const correo = 'error@example.com';
            const cedula = '999-888777-6666Z';
            const contrasenia = 'fail';
            const rol = 3;
            const estado = 'Error';

            try {
                await insert_new_user(nombre, apellido, correo, cedula, contrasenia, rol, estado);
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(executeStub);
        });
    });

    describe('valueFunctionsAsync', () => {
        it('should return false if any of the user details (name, email, cedula) already exist', async () => {
            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .resolves({ recordset: [{}] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Correo = @correo")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Cedula = @cedula")
                .resolves({ recordset: [] });
            let result = await valueFunctionsAsync('Existing', 'User', 'new@example.com', '111-222333-4444X', 'pass', 1, 'Active');
            assert.isFalse(result);

            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Correo = @correo")
                .resolves({ recordset: [{}] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Cedula = @cedula")
                .resolves({ recordset: [] });
            result = await valueFunctionsAsync('New', 'User', 'existing@example.com', '111-222333-4444X', 'pass', 1, 'Active');
            assert.isFalse(result);

            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Correo = @correo")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Cedula = @cedula")
                .resolves({ recordset: [{}] });
            result = await valueFunctionsAsync('New', 'User', 'new@example.com', 'existing-cedula', 'pass', 1, 'Active');
            assert.isFalse(result);
        });

        it('should return true if none of the user details already exist', async () => {
            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Correo = @correo")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Cedula = @cedula")
                .resolves({ recordset: [] });
            const result = await valueFunctionsAsync('New', 'User', 'new@example.com', 'new-cedula', 'pass', 1, 'Active');
            assert.isTrue(result);
        });

        it('should handle errors from the underlying functions', async () => {
            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .rejects(new Error('Name check failed'));

            try {
                await valueFunctionsAsync('Error', 'User', 'new@example.com', 'new-cedula', 'pass', 1, 'Active');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, 'Error al ejecutar las funciones asíncronas');
            }

            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Correo = @correo")
                .rejects(new Error('Email check failed'));

            try {
                await valueFunctionsAsync('Error', 'User', 'new@example.com', 'new-cedula', 'pass', 1, 'Active');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, 'Error al ejecutar las funciones asíncronas');
            }

            queryStub.withArgs("SELECT * FROM Usuario WHERE Nombre = @nombre AND Apellido = @apellido")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Correo = @correo")
                .resolves({ recordset: [] });
            queryStub.withArgs("SELECT * FROM Usuario WHERE Cedula = @cedula")
                .rejects(new Error('Cedula check failed'));

            try {
                await valueFunctionsAsync('Error', 'User', 'new@example.com', 'new-cedula', 'pass', 1, 'Active');
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, 'Error al ejecutar las funciones asíncronas');
            }
        });
    });
});