const { generarVentas } = require("./generador");
const { clientesRecurrentes } = require("./analitica");
const ventas12 = require("./datos");

// Verificar con los 12 datos originales
const resultado12 = clientesRecurrentes(ventas12);
console.log("Clientes recurrentes (12 ventas):", resultado12);
console.log("Esperado: C01, C02, C03\n");

// Medir tiempos con tamaños que se duplican
const tamanios = [1000, 2000, 4000, 8000, 16000];
const resultados = [];

for (const n of tamanios) {
  const ventas = generarVentas(n);

  const inicio = performance.now();
  const recurrentes = clientesRecurrentes(ventas);
  const fin = performance.now();

  const tiempo = fin - inicio;
  resultados.push({ n, tiempo: `${tiempo.toFixed(2)} ms`, recurrentes: recurrentes.length });
}

console.log("Tabla de tiempos — clientesRecurrentes O(n²):\n");
console.table(resultados);

console.log("\nFactor de crecimiento (al duplicar n):\n");
for (let i = 1; i < resultados.length; i++) {
  const tAnterior = parseFloat(resultados[i - 1].tiempo);
  const tActual = parseFloat(resultados[i].tiempo);
  const factor = tActual / tAnterior;
  console.log(
    `  n: ${resultados[i - 1].n} -> ${resultados[i].n}` +
    `  |  tiempo: ${tAnterior.toFixed(2)} ms -> ${tActual.toFixed(2)} ms` +
    `  |  factor: x${factor.toFixed(1)}`
  );
}

// Estimación basada en crecimiento cuadrático
const ultimo = parseFloat(resultados[resultados.length - 1].tiempo);
const nUltimo = resultados[resultados.length - 1].n;

const est100k = ultimo * Math.pow(100000 / nUltimo, 2);
const est1M = ultimo * Math.pow(1000000 / nUltimo, 2);

console.log("\nEstimaciones basadas en O(n²):\n");
console.log(`  100.000 ventas: ~${(est100k / 1000).toFixed(1)} s`);
console.log(`  1.000.000 ventas: ~${(est1M / 1000 / 60).toFixed(1)} min`);

if (est100k < 120000) {
  console.log("\n  Estimación < 2 min para 100.000. Ejecutando...\n");
  const ventas100k = generarVentas(100000);
  const inicio = performance.now();
  clientesRecurrentes(ventas100k);
  const real = performance.now() - inicio;
  console.log(`  Tiempo real con 100.000: ${(real / 1000).toFixed(2)} s`);
}
