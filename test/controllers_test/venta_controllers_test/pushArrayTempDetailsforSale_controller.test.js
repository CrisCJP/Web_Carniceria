// pushArrayTempDetailsforSale_controller.test.js
const assert = require('chai').assert;
const sinon = require('sinon');
const { getArrayforSale } = require('../../../controller/venta_controllers/pushArrayTempDetailsforSale_controller');
const { getIdCustomer, getDatasProductSale } = require('../../../model/ventas_models/adddetailinvoice_model');
const { getDateTimeId, getDateTimeDetail, getDate } = require('../../../controller/venta_controllers/getdateforsale_controller');

describe('Push Array Temp Details For Sale Controller', () => {
    let req;
    let res;
    let getIdCustomerStub;
    let getDatasProductSaleStub;
    let getDateTimeIdStub;
    let getDateTimeDetailStub;
    let getDateStub;
    const mockIdUser = 1;
    const mockArray = []; // Simulación de un array temporal

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        getIdCustomerStub = sinon.stub();
        getDatasProductSaleStub = sinon.stub();
        getDateTimeIdStub = sinon.stub().returns('25042025-103000');
        getDateTimeDetailStub = sinon.stub().returns('103000-25042025');
        getDateStub = sinon.stub().returns('2025-04-25');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getArrayforSale', () => {
        it('should return success: false and an empty array if product stock is insufficient', async () => {
            req.body = { first_name: 'Test', last_name: 'Customer', product_name: 'Product A', amount_product: 10, discount: 0 };
            getIdCustomerStub.resolves(101);
            getDatasProductSaleStub.withArgs('Product A').resolves({ IdProducto: 1, Existencia: 5, PrecioVenta: 20, UnidadMedida: 'Unidad' });

            const result = await getArrayforSale(req, res, mockIdUser, mockArray, getIdCustomerStub, getDatasProductSaleStub, getDateTimeIdStub, getDateTimeDetailStub, getDateStub);

            assert.deepStrictEqual(result, { success: false, data: [] });
            sinon.assert.calledOnce(getIdCustomerStub);
            sinon.assert.calledOnce(getDatasProductSaleStub);
        });

        it('should return success: false and an empty array with an error message if amount is not an integer for "Unidad"', async () => {
            req.body = { first_name: 'Test', last_name: 'Customer', product_name: 'Product B', amount_product: 2.5, discount: 0 };
            getIdCustomerStub.resolves(102);
            getDatasProductSaleStub.withArgs('Product B').resolves({ IdProducto: 2, Existencia: 10, PrecioVenta: 15, UnidadMedida: 'Unidad' });

            const result = await getArrayforSale(req, res, mockIdUser, mockArray, getIdCustomerStub, getDatasProductSaleStub, getDateTimeIdStub, getDateTimeDetailStub, getDateStub);

            assert.deepStrictEqual(result, { success: false, data: [], onerror: 'Esto no es valido para la unidad: 2.5' });
            sinon.assert.calledOnce(getIdCustomerStub);
            sinon.assert.calledOnce(getDatasProductSaleStub);
        });

        it('should return success: true and the sale array if product stock is sufficient and valid amount', async () => {
            req.body = { first_name: '', last_name: '', product_name: 'Product C', amount_product: 3, discount: 10 };
            getIdCustomerStub.resolves(103);
            getDatasProductSaleStub.withArgs('Product C').resolves({ IdProducto: 3, Existencia: 15, PrecioVenta: 30, UnidadMedida: 'Unidad' });

            const result = await getArrayforSale(req, res, mockIdUser, mockArray, getIdCustomerStub, getDatasProductSaleStub, getDateTimeIdStub, getDateTimeDetailStub, getDateStub);

            assert.deepStrictEqual(result.success, true);
            assert.isArray(result.data);
            assert.lengthOf(result.data, 1);
            const expectedSaleItem = {
                idVendedor: mockIdUser,
                idCliente: 103,
                nombreCliente: 'Cliente',
                apellidoCliente: '-',
                dir: '-',
                tel: '-',
                idproducto: 3,
                idfactura: '25042025-103000',
                fecha: '2025-04-25',
                efectivo: 0,
                iddetalle: '103000-25042025',
                cantidadopeso: 3,
                precioventa: 30,
                UnidadMedida: 'Unidad',
                existencia_defore: 15,
                existencia: 12,
                costo: parseFloat((30 * 3) * (1 - (10 / 100))),
                nombreproducto: 'Product C',
                total: 0,
                descuento: 10
            };
            assert.deepStrictEqual(result.data[0], expectedSaleItem);
            sinon.assert.calledOnce(getIdCustomerStub);
            sinon.assert.calledOnce(getDatasProductSaleStub);
        });

        it('should handle "Peso" UnidadMedida correctly', async () => {
            req.body = { first_name: 'Another', last_name: 'Customer', product_name: 'Product D', amount_product: 1.5, discount: 5 };
            getIdCustomerStub.resolves(104);
            getDatasProductSaleStub.withArgs('Product D').resolves({ IdProducto: 4, Existencia: 20.0, PrecioVenta: 50, UnidadMedida: 'Peso' });

            const result = await getArrayforSale(req, res, mockIdUser, mockArray, getIdCustomerStub, getDatasProductSaleStub, getDateTimeIdStub, getDateTimeDetailStub, getDateStub);

            assert.deepStrictEqual(result.success, true);
            assert.isArray(result.data);
            assert.lengthOf(result.data, 1);
            const expectedSaleItem = {
                idVendedor: mockIdUser,
                idCliente: 104,
                nombreCliente: 'Another',
                apellidoCliente: 'Customer',
                dir: '-',
                tel: '-',
                idproducto: 4,
                idfactura: '25042025-103000',
                fecha: '2025-04-25',
                efectivo: 0,
                iddetalle: '103000-25042025',
                cantidadopeso: 1.5,
                precioventa: 50,
                UnidadMedida: 'Peso',
                existencia_defore: 20,
                existencia: 18.5,
                costo: parseFloat((50 * 1.5) * (1 - (5 / 100))),
                nombreproducto: 'Product D',
                total: 0,
                descuento: 5
            };
            assert.deepStrictEqual(result.data[0], expectedSaleItem);
            sinon.assert.calledOnce(getIdCustomerStub);
            sinon.assert.calledOnce(getDatasProductSaleStub);
        });

        it('should return success: null if the product already exists based on checkAndAddProduct (simulated)', async () => {
            req.body = { first_name: 'Repeated', last_name: 'Product', product_name: 'Product E', amount_product: 1, discount: 0 };
            getIdCustomerStub.resolves(105);
            getDatasProductSaleStub.withArgs('Product E').resolves({ IdProducto: 5, Existencia: 10, PrecioVenta: 25, UnidadMedida: 'Unidad' });

            // Simulamos que checkAndAddProduct devuelve true (producto repetido)
            const mockCheckAndAddProduct = sinon.stub().returns(true);

            // Reemplazamos temporalmente la función real con nuestro mock
            const originalCheckAndAddProduct = module.exports.checkAndAddProduct;
            module.exports.checkAndAddProduct = mockCheckAndAddProduct;

            const result = await getArrayforSale(req, res, mockIdUser, [{ idproducto: 5 }], getIdCustomerStub, getDatasProductSaleStub, getDateTimeIdStub, getDateTimeDetailStub, getDateStub);

            // Restauramos la función original
            module.exports.checkAndAddProduct = originalCheckAndAddProduct;

            assert.deepStrictEqual(result.success, null);
            assert.isArray(result.data);
            assert.lengthOf(result.data, 1);
            sinon.assert.calledOnce(getIdCustomerStub);
            sinon.assert.calledOnce(getDatasProductSaleStub);
            // No assertamos si mockCheckAndAddProduct fue llamado, sino el resultado de getArrayforSale
        });

        it('should return success: false and an empty array with an error message if an error occurs during fetching data', async () => {
            req.body = { first_name: 'Error', last_name: 'Case', product_name: 'NonExistentProduct', amount_product: 1, discount: 0 };
            getIdCustomerStub.rejects(new Error('Failed to fetch customer ID'));
            getDatasProductSaleStub.rejects(new Error('Failed to fetch product data'));

            const result = await getArrayforSale(req, res, mockIdUser, mockArray, getIdCustomerStub, getDatasProductSaleStub, getDateTimeIdStub, getDateTimeDetailStub, getDateStub);

            assert.deepStrictEqual(result.success, false);
            assert.deepStrictEqual(result.data, []);
            assert.property(result, 'onerror');
            assert.ok(result.onerror.includes('Failed to fetch'));
            sinon.assert.calledOnce(getIdCustomerStub);
            sinon.assert.notCalled(getDatasProductSaleStub); // El primer error detiene la ejecución
        });
    });
});

// Helper function (simulación de la función interna)
function esEnteroDesdeInput(value) {
    const numero = parseFloat(value);
    return Number.isInteger(numero);
}

// Helper function (simulación de la función interna)
function checkAndAddProduct(row, list_products) {
    var exists = list_products.some(product => product.idproducto === row[0].idproducto);
    return exists;
}