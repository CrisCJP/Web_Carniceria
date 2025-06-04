const assert = require('chai').assert;
const sinon = require('sinon');
const { getReport, getReport_most_selled_products, get_product_but_sold_by_category, get_category_total_view } = require('../../../model/reporteventas_models/reportview_model');
const sql = require('mssql');

describe('Report View Model', () => {
    let connectStub;
    let requestStub;
    let queryStub;
    let inputStub;
    let poolMock;

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
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('getReport', () => {
        it('should return a list of sales reports within the given date range for a specific user', async () => {
            const mockReportData = [
                { FechaFormateada: '27/04/2025', Producto: 'Producto A', Cantidad: 2, Precio: 10.00 },
                { FechaFormateada: '28/04/2025', Producto: 'Producto B', Cantidad: 1, Precio: 25.50 },
            ];
            queryStub.withArgs("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, * FROM viewSalesReport WHERE Fecha BETWEEN @start AND @end ORDER BY Fecha DESC;")
                .resolves({ recordset: mockReportData });

            const userId = 1;
            const startDate = new Date('2025-04-27');
            const endDate = new Date('2025-04-28');

            const report = await getReport(userId, startDate, endDate);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            sinon.assert.calledWith(inputStub.firstCall, 'user', sql.Int, userId);
            sinon.assert.calledWith(inputStub.secondCall, 'start', sql.Date, startDate);
            sinon.assert.calledWith(inputStub.thirdCall, 'end', sql.Date, endDate);
            assert.deepStrictEqual(report, mockReportData);
        });

        it('should return an empty array if no sales reports are found within the date range for the user', async () => {
            queryStub.withArgs("SELECT FORMAT(Fecha, 'dd/MM/yyyy') AS FechaFormateada, * FROM viewSalesReport WHERE Fecha BETWEEN @start AND @end ORDER BY Fecha DESC;")
                .resolves({ recordset: [] });

            const userId = 2;
            const startDate = new Date('2025-05-01');
            const endDate = new Date('2025-05-05');

            const report = await getReport(userId, startDate, endDate);

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(report, []);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);

            const userId = 3;
            const startDate = new Date('2025-04-20');
            const endDate = new Date('2025-04-25');

            try {
                await getReport(userId, startDate, endDate);
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('getReport_most_selled_products', () => {
        it('should return a list of the most selled products ordered by quantity', async () => {
            const mockProducts = [
                { Producto: 'Product X', Cantidad: 100 },
                { Producto: 'Product Y', Cantidad: 80 },
            ];
            queryStub.withArgs("SELECT * FROM report_view_best_selling_products ORDER BY Cantidad DESC;")
                .resolves({ recordset: mockProducts });

            const products = await getReport_most_selled_products();

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(products, mockProducts);
        });

        it('should return an empty array if there are no selled products', async () => {
            queryStub.withArgs("SELECT * FROM report_view_best_selling_products ORDER BY Cantidad DESC;")
                .resolves({ recordset: [] });

            const products = await getReport_most_selled_products();

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(products, []);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);

            try {
                await getReport_most_selled_products();
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('get_product_but_sold_by_category', () => {
        it('should return a list of products but sold by category ordered by quantity', async () => {
            const mockProductsByCategory = [
                { Categoria: 'Category A', Producto: 'Product 1', Cantidad: 50 },
                { Categoria: 'Category B', Producto: 'Product 2', Cantidad: 30 },
            ];
            queryStub.withArgs("SELECT * FROM product_but_sold_by_category ORDER BY Cantidad DESC;")
                .resolves({ recordset: mockProductsByCategory });

            const productsByCategory = await get_product_but_sold_by_category();

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(productsByCategory, mockProductsByCategory);
        });

        it('should return an empty array if there are no products sold by category', async () => {
            queryStub.withArgs("SELECT * FROM product_but_sold_by_category ORDER BY Cantidad DESC;")
                .resolves({ recordset: [] });

            const productsByCategory = await get_product_but_sold_by_category();

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(productsByCategory, []);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);

            try {
                await get_product_but_sold_by_category();
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });

    describe('get_category_total_view', () => {
        it('should return a list of categories with the total number of articles ordered by article count', async () => {
            const mockCategoryTotals = [
                { Categoria: 'Category X', Articulos: 120 },
                { Categoria: 'Category Y', Articulos: 95 },
            ];
            queryStub.withArgs("SELECT * FROM category_total_view ORDER BY Articulos DESC;")
                .resolves({ recordset: mockCategoryTotals });

            const categoryTotals = await get_category_total_view();

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(categoryTotals, mockCategoryTotals);
        });

        it('should return an empty array if there are no category totals', async () => {
            queryStub.withArgs("SELECT * FROM category_total_view ORDER BY Articulos DESC;")
                .resolves({ recordset: [] });

            const categoryTotals = await get_category_total_view();

            sinon.assert.calledOnce(connectStub);
            sinon.assert.calledOnce(queryStub);
            assert.deepStrictEqual(categoryTotals, []);
        });

        it('should handle database errors', async () => {
            const error = new Error('Database error');
            connectStub.rejects(error);

            try {
                await get_category_total_view();
                assert.fail('Should have thrown an error');
            } catch (err) {
                assert.strictEqual(err.message, error.message);
            }

            sinon.assert.calledOnce(connectStub);
            sinon.assert.notCalled(queryStub);
        });
    });
});