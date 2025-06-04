const assert = require('chai').assert;
const { setCostoandTotal } = require('../../../controller/venta_controllers/setcostoandtotal_controller');

describe('Set Costo And Total Controller', () => {
    let req;
    let res;
    let mockArray;

    beforeEach(() => {
        req = {
            body: {
                new_cash: 100.50,
                new_total: 550.75
            }
        };
        res = {}; // No se utiliza res.json en esta función
        mockArray = [
            { idproducto: 1, idfactura: 'TEMP-123', precioventa: 50 },
            { idproducto: 2, idfactura: 'TEMP-123', precioventa: 100 },
            { idproducto: 3, idfactura: 'TEMP-123', precioventa: 150 }
        ];
    });

    it('should update the idfactura, efectivo, and total properties of each object in the array', async () => {
        const result = await setCostoandTotal(req, res, mockArray);

        assert.isArray(result, 'El resultado debe ser un array');
        assert.strictEqual(result.length, mockArray.length, 'El array resultante debe tener la misma longitud');

        result.forEach(item => {
            assert.strictEqual(item.idfactura, mockArray[0].idfactura.toString(), 'El idfactura debe ser el mismo para todos los objetos');
            assert.strictEqual(item.efectivo, req.body.new_cash, 'La propiedad efectivo debe ser actualizada');
            assert.strictEqual(item.total, req.body.new_total, 'La propiedad total debe ser actualizada');
        });
    });

    it('should handle an empty input array', async () => {
        const emptyArray = [];
        const result = await setCostoandTotal(req, res, emptyArray);

        assert.isArray(result, 'El resultado debe ser un array');
        assert.strictEqual(result.length, 0, 'El array resultante debe estar vacío');
    });

    it('should work correctly with different cash and total values', async () => {
        req.body.new_cash = 25.00;
        req.body.new_total = 175.20;

        const result = await setCostoandTotal(req, res, mockArray);

        result.forEach(item => {
            assert.strictEqual(item.efectivo, req.body.new_cash, 'La propiedad efectivo debe ser actualizada con el nuevo valor');
            assert.strictEqual(item.total, req.body.new_total, 'La propiedad total debe ser actualizada con el nuevo valor');
        });
    });
});