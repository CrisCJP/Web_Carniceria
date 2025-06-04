const assert = require('chai').assert;
const sinon = require('sinon');
const { loginUser } = require('../../../controller/login_controllers/loginuser_controller');
const { getUserById, getInvoicesByUserId } = require('../../../model/login_models/loginuser_model');
const { getSelledProducts } = require('../../../model/dashboard_models/mostselledproducts_model');
const { getDetailsDashboard, getCountProductCategories, getCountCategories } = require('../../../model/dashboard_models/detailsdashboard_model');

describe('Login User Controller', () => {
    let req;
    let res;
    let getUserByIdStub;
    let getInvoicesByUserIdStub;
    let getSelledProductsStub;
    let getDetailsDashboardStub;
    let getCountProductCategoriesStub;
    let getCountCategoriesStub;

    beforeEach(() => {
        req = {
            body: {
                mail: 'test@example.com',
                password: 'password123'
            }
        };
        res = {
            send: sinon.stub(),
            render: sinon.stub()
        };
        getUserByIdStub = sinon.stub();
        getInvoicesByUserIdStub = sinon.stub();
        getSelledProductsStub = sinon.stub();
        getDetailsDashboardStub = sinon.stub();
        getCountProductCategoriesStub = sinon.stub();
        getCountCategoriesStub = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('loginUser', () => {
        it('should render the index view with user data and dashboard information on successful login', async () => {
            const mockUser = { IdUsuario: 1, Nombre: 'Test User' };
            const mockInvoices = [{ id: 1, total: 100 }];
            const mockSelledProducts = [{ product: 'A', quantity: 10 }];
            const mockDetailsDashboard = { totalSales: 500 };
            const mockCountProductCategories = 5;
            const mockCountCategories = 3;

            getUserByIdStub.withArgs('test@example.com', 'password123').resolves(mockUser);
            getInvoicesByUserIdStub.withArgs(1).resolves(mockInvoices);
            getSelledProductsStub.withArgs(1).resolves(mockSelledProducts);
            getDetailsDashboardStub.withArgs(1).resolves(mockDetailsDashboard);
            getCountProductCategoriesStub.resolves(mockCountProductCategories);
            getCountCategoriesStub.resolves(mockCountCategories);

            await loginUser(
                req,
                res,
                getUserByIdStub,
                getInvoicesByUserIdStub,
                getSelledProductsStub,
                getDetailsDashboardStub,
                getCountProductCategoriesStub,
                getCountCategoriesStub
            );

            sinon.assert.calledOnce(getUserByIdStub);
            sinon.assert.calledWith(getUserByIdStub, 'test@example.com', 'password123');
            sinon.assert.calledOnce(getInvoicesByUserIdStub);
            sinon.assert.calledWith(getInvoicesByUserIdStub, 1);
            sinon.assert.calledOnce(getSelledProductsStub);
            sinon.assert.calledWith(getSelledProductsStub, 1);
            sinon.assert.calledOnce(getDetailsDashboardStub);
            sinon.assert.calledWith(getDetailsDashboardStub, 1);
            sinon.assert.calledOnce(getCountProductCategoriesStub);
            sinon.assert.calledOnce(getCountCategoriesStub);
            sinon.assert.calledOnce(res.render);
            sinon.assert.calledWith(res.render, 'index', {
                user: mockUser,
                historyInvoice: mockInvoices,
                selledProduct: mockSelledProducts,
                detailsDashboard: mockDetailsDashboard,
                countProduct: mockCountProductCategories,
                countCategories: mockCountCategories
            });
        });

        it('should send an alert and redirect to login if user credentials are invalid', async () => {
            getUserByIdStub.withArgs('test@example.com', 'password123').resolves(null);

            await loginUser(
                req,
                res,
                getUserByIdStub,
                getInvoicesByUserIdStub,
                getSelledProductsStub,
                getDetailsDashboardStub,
                getCountProductCategoriesStub,
                getCountCategoriesStub
            );

            sinon.assert.calledOnce(getUserByIdStub);
            sinon.assert.calledWith(getUserByIdStub, 'test@example.com', 'password123');
            sinon.assert.notCalled(getInvoicesByUserIdStub);
            sinon.assert.notCalled(getSelledProductsStub);
            sinon.assert.notCalled(getDetailsDashboardStub);
            sinon.assert.notCalled(getCountProductCategoriesStub);
            sinon.assert.notCalled(getCountCategoriesStub);
            sinon.assert.calledOnce(res.send);
            assert.strictEqual(res.send.firstCall.args[0], '<script>alert("Correo o contraseña inválidos"); window.location.href = "/login";</script>');
            sinon.assert.notCalled(res.render);
        });

        it('should render the index view with an error message if an error occurs during login', async () => {
            const errorMessage = 'Database connection error';
            getUserByIdStub.withArgs('test@example.com', 'password123').rejects(new Error(errorMessage));

            await loginUser(
                req,
                res,
                getUserByIdStub,
                getInvoicesByUserIdStub,
                getSelledProductsStub,
                getDetailsDashboardStub,
                getCountProductCategoriesStub,
                getCountCategoriesStub
            );

            sinon.assert.calledOnce(getUserByIdStub);
            sinon.assert.calledWith(getUserByIdStub, 'test@example.com', 'password123');
            sinon.assert.notCalled(getInvoicesByUserIdStub);
            sinon.assert.notCalled(getSelledProductsStub);
            sinon.assert.notCalled(getDetailsDashboardStub);
            sinon.assert.notCalled(getCountProductCategoriesStub);
            sinon.assert.notCalled(getCountCategoriesStub);
            sinon.assert.calledOnce(res.render);
            sinon.assert.calledWith(res.render, 'index', { error: 'Error al iniciar sesión' });
            sinon.assert.notCalled(res.send);
        });
    });
});