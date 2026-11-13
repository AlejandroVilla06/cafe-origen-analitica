const { generarVentas } = require("./generador");
const { totalVendidoInst, ventaMayorInst, totalPorCiudadInst, primeraVenta } = require("./analitica");

const tamanios = [100, 1000, 10000, 100000];
const resultados = [];

for (let i = 0; i < tamanios.length; i++) {
  const n = tamanios[i];
  const ventas = generarVentas(n);

  // Un contador separado por función para que no se mezclen las ops
  const c1 = { ops: 0 };
  const c2 = { ops: 0 };
  const c3 = { ops: 0 };
  const c4 = { ops: 0 };

  totalVendidoInst(ventas, c1);
  ventaMayorInst(ventas, c2);
  totalPorCiudadInst(ventas, "Medellín", c3);
  primeraVenta(ventas, c4);

  resultados.push({
    n: n,
    totalVendido: c1.ops,
    ventaMayor: c2.ops,
    totalPorCiudad: c3.ops,
    primeraVenta: c4.ops,
  });
}

console.log("\nTabla de operaciones por tamaño de entrada:\n");
console.table(resultados);

console.log("\nFactor de crecimiento (cada fila vs la anterior):\n");
for (let i = 1; i < resultados.length; i++) {
  const factorN = resultados[i].n / resultados[i - 1].n;
  const factorOps = resultados[i].totalVendido / resultados[i - 1].totalVendido;

  console.log(
    "  n: " + resultados[i - 1].n + " -> " + resultados[i].n +
    " (x" + factorN + ")" +
    "  |  ops totalVendido: x" + factorOps.toFixed(1)
  );
}

console.log("\nClasificación Big O:\n");
console.log("  totalVendido   -> O(n) — un solo for, ops crecen igual que n");
console.log("  ventaMayor     -> O(n) — un solo for con una comparación por elemento");
console.log("  totalPorCiudad -> O(n) — un solo for, filtra y suma en un recorrido");
console.log("  primeraVenta   -> O(1) — acceso directo por índice, siempre 1 op");
