const { getVentasPorProducto } = require('../../model/dashboard_models/ventas_model');
const { getInventarioPorProducto } = require('../../model/dashboard_models/inventario_model');
const { getPrediccionesPorProducto } = require('../../model/dashboard_models/predicciones_model');
const { getPrecioProducto } = require('../../model/dashboard_models/productos_model');

async function compararProducto(producto, inicio, fin) {
  const ventas = await getVentasPorProducto(producto, inicio, fin);
  const inventario = await getInventarioPorProducto(producto, inicio, fin);
  const predicciones = await getPrediccionesPorProducto(producto, inicio, fin);
  const precioUnitario = Number(await getPrecioProducto(producto)) || 0;

  return ventas.map(v => {
    const inv = inventario.find(i => i.fecha === v.fecha) || { stockInicial: 0, stockFinal: 0 };
    const pred = predicciones.find(p => p.fecha === v.fecha);
    const prediccion = pred ? Number(pred.prediccion) : 0;

    const ventasReales = Number(v.cantidadVendida ?? 0);
    const stockInicial = Number(inv.stockInicial ?? 0);
    const stockFinal = Number(inv.stockFinal ?? 0);

    // Cobertura de demanda
    const stockDisponible = stockInicial;
    const ventasCubiertas = Math.min(ventasReales, stockDisponible);
    const demandaNoCubierta = Math.max(0, ventasReales - stockDisponible);
    const hayQuiebre = demandaNoCubierta > 0 || stockFinal === 0;

    // Diferencias vs predicción
    const diferenciaLibras = ventasReales - prediccion;
    const diferenciaPorcentaje = prediccion > 0
      ? ((ventasReales - prediccion) / prediccion * 100).toFixed(2)
      : "0.00";

    // Impacto económico (dinero)
    const ingresoReal = ventasReales * precioUnitario;
    const ingresoEsperado = prediccion * precioUnitario;
    const impacto = ingresoReal - ingresoEsperado;

    // Logística y acción recomendada
    let logistica = "";
    let accion = "";

    if (hayQuiebre) {
      logistica = "Quiebre de stock, demanda no cubierta";
      accion = "Aumentar reabastecimiento y revisar puntos de pedido";
    } else if (stockInicial > prediccion && ventasReales < stockInicial) {
      logistica = "Sobrestock, riesgo de desperdicio";
      accion = "Reducir reabastecimiento o activar promoción";
    } else {
      logistica = "Operación alineada";
      accion = "Mantener estrategia actual";
    }

    return {
      fecha: v.fecha,
      producto: v.producto,
      precio_unitario: precioUnitario,
      precio_unitario_texto: "C$" + precioUnitario.toFixed(2),

      stock_inicial: stockInicial,
      prediccion,
      ventas_reales: ventasReales,
      stock_final: stockFinal,
      ventas_cubiertas: ventasCubiertas,
      demanda_no_cubierta: demandaNoCubierta,
      quiebre: hayQuiebre,
      diferencia_libras: diferenciaLibras,
      diferencia_porcentaje: diferenciaPorcentaje,

      impacto_libras: diferenciaLibras,
      impacto_libras_texto: (diferenciaLibras >= 0 ? "+" : "-") + Math.abs(diferenciaLibras).toFixed(2) + " lbs",

      impacto_economico: impacto,
      impacto_economico_texto: (impacto >= 0 ? "+" : "-") + "C$" + Math.abs(impacto).toFixed(2),

      logistica,
      accion_recomendada: accion
    };
  });
}

module.exports = { compararProducto };
