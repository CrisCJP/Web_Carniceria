const assert = require('chai').assert;
const { getAmount, getDiscount } = require('../../../controller/venta_controllers/updateamountforarray_controller');

describe('Update Amount For Array Controller', () => {
    let req;
    let res;
    let mockArray;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {}; // No se utiliza res.json en estas funciones
        mockArray = [
            { idproducto: 1, cantidadopeso: 5, existencia: 10, costo: 25, descuento: 0 },
            { idproducto: 2, cantidadopeso: 2, existencia: 5, costo: 15, descuento: 5 },
            { idproducto: 3, cantidadopeso: 1, existencia: 3, costo: 10, descuento: 10 }
        ];
    });

    describe('getAmount', () => {
        it('should update cantidadopeso, existencia, and costo for the matching idproducto', async () => {
            req.body = { id: 2, new_amount: 3, new_existence: 6, new_costo: 18 };

            const result = await getAmount(req, res, mockArray);

            assert.isArray(result, 'El resultado debe ser un array');
            assert.strictEqual(result.length, mockArray.length, 'El array resultante debe tener la misma longitud');

            const updatedObject = result.find(item => item.idproducto === req.body.id);
            assert.exists(updatedObject, 'Debe existir un objeto con el id actualizado');
            assert.strictEqual(updatedObject.cantidadopeso, req.body.new_amount, 'cantidadopeso debe ser actualizada');
            assert.strictEqual(updatedObject.existencia, req.body.new_existence, 'existencia debe ser actualizada');
            assert.strictEqual(updatedObject.costo, req.body.new_costo, 'costo debe ser actualizada');
        });

        it('should not modify objects with a different idproducto', async () => {
             req.body = { id: 1, new_amount: 6, new_existence: 11, new_costo: 30 };
             const originalObject = { ...mockArray[1] }; // Copia del objeto original

             await getAmount(req, res, mockArray);

            assert.deepStrictEqual(mockArray[1], originalObject, 'El objeto no debe ser modificado');
        });

        it('should handle a case where the id is not found', async () => {
            req.body = { id: 4, new_amount: 10, new_existence: 20, new_costo: 50 };

            const result = await getAmount(req, res, mockArray);

            assert.deepStrictEqual(result, mockArray, 'El array debe ser el mismo si no se encuentra el id');
        });
    });

    describe('getDiscount', () => {
        it('should update costo and descuento for the matching idproducto', async () => {
            req.body = { id: 3, discount: 15, cost: 8.5 };

            const result = await getDiscount(req, res, mockArray);

            assert.isArray(result, 'El resultado debe ser un array');
            assert.strictEqual(result.length, mockArray.length, 'El array resultante debe tener la misma longitud');

            const updatedObject = result.find(item => item.idproducto === req.body.id);
            assert.exists(updatedObject, 'Debe existir un objeto con el id actualizado');
            assert.strictEqual(updatedObject.costo, req.body.cost, 'costo debe ser actualizado');
            assert.strictEqual(updatedObject.descuento, req.body.discount, 'descuento debe ser actualizado');
        });

        it('should not modify objects with a different idproducto', async () => {
            req.body = { id: 1, discount: 20, cost: 20 };
            const originalObject = { ...mockArray[2] }; // Copia del objeto original

            await getDiscount(req, res, mockArray);

            assert.deepStrictEqual(mockArray[2], originalObject, 'El objeto no debe ser modificado');
        });

         it('should handle a case where the id is not found', async () => {
            req.body = { id: 5, discount: 25, cost: 7.0 };

            const result = await getDiscount(req, res, mockArray);

            assert.deepStrictEqual(result, mockArray, 'El array debe ser el mismo si no se encuentra el id');
        });
    });
});