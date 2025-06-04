const assert = require('chai').assert;
const sinon = require('sinon');
const { setReport } = require('../../../controller/reporteventas_controllers/send_reportofordate_controller');
const { getReport, getReport_most_selled_products, get_product_but_sold_by_category, get_category_total_view } = require('../../../model/reporteventas_models/reportview_model');

describe('Send Report Controller', () => {
    let req;
    let res;
    let getReportStub;
    let getReportMostSelledProductsStub;
    let getProductButSoldByCategoryStub;
    let getCategoryTotalViewStub;
    const mockUser = { IdUsuario: 1 };

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: sinon.stub().returnsThis(),
            json: sinon.stub()
        };
        getReportStub = sinon.stub();
        getReportMostSelledProductsStub = sinon.stub();
        getProductButSoldByCategoryStub = sinon.stub();
        getCategoryTotalViewStub = sinon.stub();
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('setReport', () => {
        describe('option_report: fecha', () => {
            it('should return a 200 status and the report list for a given date range', async () => {
                const mockReportList = [{ date: '2025-04-25', total: 150 }];
                req.body = { start_date: '2025-04-20', end_date: '2025-04-29', option_report: 'fecha' };
                getReportStub.withArgs(mockUser, '2025-04-20', '2025-04-29').resolves(mockReportList);

                await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                sinon.assert.calledOnce(getReportStub);
                sinon.assert.calledWith(getReportStub, mockUser, '2025-04-20', '2025-04-29');
                sinon.assert.calledOnce(res.status);
                sinon.assert.calledWith(res.status, 200);
                sinon.assert.calledOnce(res.json);
                sinon.assert.calledWith(res.json, { reportList: mockReportList });
            });

            it('should return a 404 status if no report data is found for the date range', async () => {
                req.body = { start_date: '2025-05-01', end_date: '2025-05-05', option_report: 'fecha' };
                getReportStub.withArgs(mockUser, '2025-05-01', '2025-05-05').resolves([]);

                await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                sinon.assert.calledOnce(getReportStub);
                sinon.assert.calledWith(getReportStub, mockUser, '2025-05-01', '2025-05-05');
                sinon.assert.calledOnce(res.status);
                sinon.assert.calledWith(res.status, 404);
                sinon.assert.calledOnce(res.json);
                sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
            });
        });

        describe('option_report: producto_mas_vendidos', () => {
            describe('option_product: all_products', () => {
                it('should return a 200 status and the most selled products report', async () => {
                    const mockReportList = [{ product: 'Product X', quantity: 20 }];
                    req.body = { option_report: 'producto_mas_vendidos', option_product: 'all_products' };
                    getReportMostSelledProductsStub.resolves(mockReportList);

                    await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                    sinon.assert.calledOnce(getReportMostSelledProductsStub);
                    sinon.assert.calledOnce(res.status);
                    sinon.assert.calledWith(res.status, 200);
                    sinon.assert.calledOnce(res.json);
                    sinon.assert.calledWith(res.json, { reportList: mockReportList });
                });

                it('should return a 404 status if no most selled products are found', async () => {
                    req.body = { option_report: 'producto_mas_vendidos', option_product: 'all_products' };
                    getReportMostSelledProductsStub.resolves([]);

                    await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                    sinon.assert.calledOnce(getReportMostSelledProductsStub);
                    sinon.assert.calledOnce(res.status);
                    sinon.assert.calledWith(res.status, 404);
                    sinon.assert.calledOnce(res.json);
                    sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
                });
            });

            describe('option_product: for_products_in_category', () => {
                it('should return a 200 status and the products sold by category report', async () => {
                    const mockReportList = [{ category: 'Category A', product: 'Product Y', quantity: 15 }];
                    req.body = { option_report: 'producto_mas_vendidos', option_product: 'for_products_in_category' };
                    getProductButSoldByCategoryStub.resolves(mockReportList);

                    await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                    sinon.assert.calledOnce(getProductButSoldByCategoryStub);
                    sinon.assert.calledOnce(res.status);
                    sinon.assert.calledWith(res.status, 200);
                    sinon.assert.calledOnce(res.json);
                    sinon.assert.calledWith(res.json, { reportList: mockReportList });
                });

                it('should return a 404 status if no products sold by category are found', async () => {
                    req.body = { option_report: 'producto_mas_vendidos', option_product: 'for_products_in_category' };
                    getProductButSoldByCategoryStub.resolves([]);

                    await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                    sinon.assert.calledOnce(getProductButSoldByCategoryStub);
                    sinon.assert.calledOnce(res.status);
                    sinon.assert.calledWith(res.status, 404);
                    sinon.assert.calledOnce(res.json);
                    sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
                });
            });

            describe('option_product: (other options)', () => {
                it('should return a 200 status and the total view by category report', async () => {
                    const mockReportList = [{ category: 'Category B', total_view: 1000 }];
                    req.body = { option_report: 'producto_mas_vendidos', option_product: 'some_other_option' };
                    getCategoryTotalViewStub.resolves(mockReportList);

                    await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                    sinon.assert.calledOnce(getCategoryTotalViewStub);
                    sinon.assert.calledOnce(res.status);
                    sinon.assert.calledWith(res.status, 200);
                    sinon.assert.calledOnce(res.json);
                    sinon.assert.calledWith(res.json, { reportList: mockReportList });
                });

                it('should return a 404 status if no total view by category is found', async () => {
                    req.body = { option_report: 'producto_mas_vendidos', option_product: 'another_option' };
                    getCategoryTotalViewStub.resolves([]);

                    await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

                    sinon.assert.calledOnce(getCategoryTotalViewStub);
                    sinon.assert.calledOnce(res.status);
                    sinon.assert.calledWith(res.status, 404);
                    sinon.assert.calledOnce(res.json);
                    sinon.assert.calledWith(res.json, { message: 'No se encontraron resultados' });
                });
            });
        });

        it('should return a JSON error message if an error occurs during report fetching', async () => {
            const errorMessage = 'Failed to fetch report';
            req.body = { start_date: '2025-04-20', end_date: '2025-04-29', option_report: 'fecha' };
            getReportStub.rejects(new Error(errorMessage));

            await setReport(req, res, mockUser, getReportStub, getReportMostSelledProductsStub, getProductButSoldByCategoryStub, getCategoryTotalViewStub);

            sinon.assert.calledOnce(getReportStub);
            sinon.assert.calledOnce(res.json);
            sinon.assert.calledWith(res.json, { message: errorMessage });
            sinon.assert.notCalled(res.status);
        });
    });
});