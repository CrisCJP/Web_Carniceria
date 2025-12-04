const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const dayjs = require('dayjs');

async function getPrediccionesPorProducto(producto, inicio, fin) {
  const predicciones = [];
  const csvPath = path.join(__dirname, '../../ml_prophet/ml/csv', `predicciones_producto_${producto}_diario.csv`);

  if (!fs.existsSync(csvPath)) {
    console.warn(`⚠️ No se encontró el archivo de predicciones: ${csvPath}`);
    return [];
  }

  await new Promise((resolve, reject) => {
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', row => {
        const fechaCsv = dayjs(row.ds, 'YYYY-MM-DD');
        const inicioObj = dayjs(inicio, 'YYYY-MM-DD');
        const finObj = dayjs(fin, 'YYYY-MM-DD');

        if (fechaCsv.isSame(inicioObj) || fechaCsv.isSame(finObj) || (fechaCsv.isAfter(inicioObj) && fechaCsv.isBefore(finObj))) {
          predicciones.push({
            fecha: row.ds,
            producto: row.ProductoID,
            prediccion: parseFloat(row.yhat),
            prediccion_lower: parseFloat(row.yhat_lower),
            prediccion_upper: parseFloat(row.yhat_upper)
          });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  return predicciones;
}

module.exports = { getPrediccionesPorProducto };
