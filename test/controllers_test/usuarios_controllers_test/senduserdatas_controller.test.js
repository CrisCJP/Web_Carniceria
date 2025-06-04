const assert = require('chai').assert;
const sinon = require('sinon');
const { set_user_data_forTable, executeProcedure_makeChanges_forUser, executeProcedure_insertNewUser } = require('../../../controller/usuarios_controllers/send_user_datas_controller');
const { get_user_datas, make_changes_for_user, insert_new_user, valueFunctionsAsync } = require('../../../model/usuarios_models/get_user_datas_model');

describe('Send User Datas Controller', () => {
    let req;
    let res;
    let getUserDatasStub;
    let makeChangesForUserStub;
    let insertNewUserStub;
    let valueFunctionsAsyncStub;
    const mockUser = { IdUsuario: 1 };

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        getUserDatasStub = sinon.stub();
        makeChangesForUserStub = sinon.stub();
        insertNewUserStub = sinon.stub();
        valueFunctionsAsyncStub = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('set_user_data_forTable', () => {
        it('should return a 200 status and the user data if found', async () => {
            const mockUserData = [{ id: 1, nombre: 'Test User' }];
            req.body = { character: 'nombre' };
            getUserDatasStub.withArgs('nombre', mockUser).resolves(mockUserData);

            await set_user_data_forTable(req, res, mockUser, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(getUserDatasStub);
            sinon.assert.calledWith(getUserDatasStub, 'nombre', mockUser);
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { userdata: mockUserData });
        });

        it('should return a 404 status if no user data is found', async () => {
            req.body = { character: 'apellido' };
            getUserDatasStub.withArgs('apellido', mockUser).resolves(null);

            await set_user_data_forTable(req, res, mockUser, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(getUserDatasStub);
            sinon.assert.calledWith(getUserDatasStub, 'apellido', mockUser);
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message_notfind: 'No se encontraron resultados' });
        });

        it('should return a JSON error message if an error occurs', async () => {
            const errorMessage = 'Database error';
            req.body = { character: 'cedula' };
            getUserDatasStub.withArgs('cedula', mockUser).rejects(new Error(errorMessage));

            await set_user_data_forTable(req, res, mockUser, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(getUserDatasStub);
            sinon.assert.calledWith(getUserDatasStub, 'cedula', mockUser);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: errorMessage });
            sinon.assert.notCalled(res.status);
        });
    });

    describe('executeProcedure_makeChanges_forUser', () => {
        it('should return a 200 status and the procedure message on success', async () => {
            const mockProcedureMessage = 'User role updated successfully';
            req.body = { id: 5, rol: 'admin', estado: 'activo' };
            makeChangesForUserStub.withArgs(5, 'admin', 'activo').resolves(mockProcedureMessage);

            await executeProcedure_makeChanges_forUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(makeChangesForUserStub);
            sinon.assert.calledWith(makeChangesForUserStub, 5, 'admin', 'activo');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: mockProcedureMessage });
        });

        it('should return a 404 status if the procedure returns no result', async () => {
            req.body = { id: 10, rol: 'viewer', estado: 'inactivo' };
            makeChangesForUserStub.withArgs(10, 'viewer', 'inactivo').resolves(null);

            await executeProcedure_makeChanges_forUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(makeChangesForUserStub);
            sinon.assert.calledWith(makeChangesForUserStub, 10, 'viewer', 'inactivo');
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message_notfind: 'No se encontraron resultados result' });
        });

        it('should return a JSON error message if an error occurs', async () => {
            const errorMessage = 'Procedure failed';
            req.body = { id: 2, rol: 'editor', estado: 'activo' };
            makeChangesForUserStub.withArgs(2, 'editor', 'activo').rejects(new Error(errorMessage));

            await executeProcedure_makeChanges_forUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(makeChangesForUserStub);
            sinon.assert.calledWith(makeChangesForUserStub, 2, 'editor', 'activo');
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message_err: errorMessage });
            sinon.assert.notCalled(res.status);
        });
    });

    describe('executeProcedure_insertNewUser', () => {
        it('should return a 200 status and the procedure message on successful insertion', async () => {
            const mockProcedureMessage = 'New user inserted successfully';
            const newUser = { nombre: 'John', apellido: 'Doe', cedula: '123', correo: 'john.doe@example.com', contrasenia: 'password', rol: 'user', estado: 'activo' };
            req.body = newUser;
            valueFunctionsAsyncStub.withArgs(newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado).resolves(true);
            insertNewUserStub.withArgs(newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado).resolves(mockProcedureMessage);

            await executeProcedure_insertNewUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(valueFunctionsAsyncStub);
            sinon.assert.calledWith(valueFunctionsAsyncStub, newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado);
            sinon.assert.calledOnce(insertNewUserStub);
            sinon.assert.calledWith(insertNewUserStub, newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado);
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: mockProcedureMessage });
        });

        it('should return a 200 status with a message if user data already exists', async () => {
            const existingUser = { nombre: 'Existing', apellido: 'User', cedula: '456', correo: 'existing@example.com', contrasenia: 'oldpass', rol: 'guest', estado: 'inactivo' };
            req.body = existingUser;
            valueFunctionsAsyncStub.withArgs(existingUser.nombre, existingUser.apellido, existingUser.correo, existingUser.cedula, existingUser.contrasenia, existingUser.rol, existingUser.estado).resolves(false);

            await executeProcedure_insertNewUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(valueFunctionsAsyncStub);
            sinon.assert.calledWith(valueFunctionsAsyncStub, existingUser.nombre, existingUser.apellido, existingUser.correo, existingUser.cedula, existingUser.contrasenia, existingUser.rol, existingUser.estado);
            sinon.assert.notCalled(insertNewUserStub);
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 200);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message_notfind: 'Los datos ingresado ya existen como Nombre, Apellido, Cedula y Correo' });
        });

        it('should return a 404 status if the insertion procedure fails', async () => {
            const newUser = { nombre: 'Failed', apellido: 'Insert', cedula: '789', correo: 'failed@example.com', contrasenia: 'secure', rol: 'admin', estado: 'activo' };
            req.body = newUser;
            valueFunctionsAsyncStub.withArgs(newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado).resolves(true);
            insertNewUserStub.withArgs(newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado).resolves(null);

            await executeProcedure_insertNewUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(valueFunctionsAsyncStub);
            sinon.assert.calledWith(valueFunctionsAsyncStub, newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado);
            sinon.assert.calledOnce(insertNewUserStub);
            sinon.assert.calledWith(insertNewUserStub, newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado);
            sinon.assert.calledOnce(res.status);
            sinon.assert.calledWith(res.status, 404);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message_notfind: 'Algo fallo en el procedimiento' });
        });

        it('should return a JSON error message if an error occurs during insertion', async () => {
            const errorMessage = 'Insertion error';
            const newUser = { nombre: 'Error', apellido: 'Test', cedula: '012', correo: 'error@example.com', contrasenia: 'oops', rol: 'user', estado: 'inactivo' };
            req.body = newUser;
            valueFunctionsAsyncStub.withArgs(newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado).rejects(new Error(errorMessage));

            await executeProcedure_insertNewUser(req, res, getUserDatasStub, makeChangesForUserStub, insertNewUserStub, valueFunctionsAsyncStub);

            sinon.assert.calledOnce(valueFunctionsAsyncStub);
            sinon.assert.calledWith(valueFunctionsAsyncStub, newUser.nombre, newUser.apellido, newUser.correo, newUser.cedula, newUser.contrasenia, newUser.rol, newUser.estado);
            sinon.assert.notCalled(insertNewUserStub);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message_err: errorMessage });
            sinon.assert.notCalled(res.status);
        });
    });
});