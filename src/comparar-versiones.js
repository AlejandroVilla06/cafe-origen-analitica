// Script de comparación v0.1 vs v1.0
// v0.1 = solo secciones originales (1-5), incluye clientesRecurrentes O(n²)
// v1.0 = todas las secciones (1-11), funciones optimizadas O(n)

const { generarVentas } = require('./generador');
const {
  contarVentasValidas, totalVendido, unidadesVendidas, ventaMayor,
  ticketPromedio, totalPorCiudad, unidadesPorProducto, topProductosPorValor,
  ventasDelDia, clientesRecurrentes,
  clientesRecurrentesSet, comprasPorCliente, comboRegalo,
  productoEstrellaPorCiudad, primerClienteUnico, mejorSemana, parMasCercano,
} = require('./analitica');
const catalogo = require('./catalogo');

// Simula el trabajo que hacía v0.1 (secciones 1-5 + clientesRecurrentes O(n²))
function reporteV01(datos) {
  contarVentasValidas(datos);
  totalVendido(datos);
  unidadesVendidas(datos);
  ventaMayor(datos);
  ticketPromedio(datos);
  totalPorCiudad(datos);
  unidadesPorProducto(datos);
  topProductosPorValor(datos, 3);
  ventasDelDia(datos, '2026-09-04');
  ventasDelDia(datos, '2026-09-07');
  // La función vieja O(n²) que era el cuello de botella
  clientesRecurrentes(datos);
}

// Simula el trabajo que hace v1.0 (secciones 1-11, todas optimizadas)
function reporteV10(datos) {
  contarVentasValidas(datos);
  totalVendido(datos);
  unidadesVendidas(datos);
  ventaMayor(datos);
  ticketPromedio(datos);
  totalPorCiudad(datos);
  unidadesPorProducto(datos);
  topProductosPorValor(datos, 3);
  ventasDelDia(datos, '2026-09-04');
  ventasDelDia(datos, '2026-09-07');
  // Nuevas secciones optimizadas
  clientesRecurrentesSet(datos);
  comprasPorCliente(datos);
  comboRegalo(catalogo, 61000);
  productoEstrellaPorCiudad(datos);
  primerClienteUnico(datos);
  mejorSemana([320,410,280,390,510,620,700,300,290,450,480,530,610,680,350,330,420,470,560,640,710,380,360,440,500,590,650,720,400,370], 7);
  parMasCercano(catalogo, 100000);
}

function medir(fn, datos) {
  const t0 = performance.now();
  fn(datos);
  return performance.now() - t0;
}

// Medimos con 10.000 y 100.000 ventas
for (const n of [10000, 100000]) {
  console.log(`\n=== ${n.toLocaleString('es-CO')} ventas ===\n`);
  const datos = generarVentas(n);

  const tv01 = medir(reporteV01, datos);
  const tv10 = medir(reporteV10, datos);
  const mejora = ((tv01 - tv10) / tv01 * 100).toFixed(1);

  console.log(`  v0.1: ${tv01.toFixed(2)} ms`);
  console.log(`  v1.0: ${tv10.toFixed(2)} ms`);
  console.log(`  Mejora: ${mejora}% más rápido`);
  console.log(`  Factor: ${(tv01 / tv10).toFixed(1)}×`);
}
