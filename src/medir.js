// Paso 4 del MR5: script que ejecuta las funciones con cuatro tamaños
// y muestra la tabla de operaciones
// Req. técnico: console.table, notación Big O

// Importamos el generador y las funciones instrumentadas
const { generarVentas } = require("./generador");
const { totalVendidoInst, ventaMayorInst, totalPorCiudadInst, primeraVenta } = require("./analitica");

// Los cuatro tamaños que pide el reto: n = 100, 1.000, 10.000 y 100.000
const tamanios = [100, 1000, 10000, 100000];

// Arreglo donde guardamos los resultados para console.table
const resultados = [];

// Recorremos cada tamaño de datos
for (let i = 0; i < tamanios.length; i++) {
  const n = tamanios[i];

  // Generamos n ventas aleatorias con el generador del paso 1
  const ventas = generarVentas(n);

  // Creamos un contador NUEVO para cada función
  // Si reutilizáramos el mismo, las operaciones se acumularían
  // Cada contador es un objeto { ops: 0 } pasado por referencia
  const c1 = { ops: 0 };
  const c2 = { ops: 0 };
  const c3 = { ops: 0 };
  const c4 = { ops: 0 };

  // Ejecutamos cada función pasándole su contador
  // La función modifica contador.ops por referencia
  totalVendidoInst(ventas, c1);
  ventaMayorInst(ventas, c2);
  totalPorCiudadInst(ventas, "Medellín", c3);
  primeraVenta(ventas, c4);

  // Guardamos una fila para la tabla
  resultados.push({
    n: n,
    totalVendido: c1.ops,
    ventaMayor: c2.ops,
    totalPorCiudad: c3.ops,
    primeraVenta: c4.ops,
  });
}

// Req. técnico: console.table
// Criterio: muestra tabla con los cuatro tamaños y las operaciones de las cuatro funciones
console.log("\nTabla de operaciones por tamaño de entrada:\n");
console.table(resultados);

// Paso 6 del MR5: comparar predicciones y clasificar en Big O
// Mostramos el factor de crecimiento para demostrar la clasificación
console.log("\nFactor de crecimiento (cada fila vs la anterior):\n");
for (let i = 1; i < resultados.length; i++) {
  // Si n crece x10 y las ops también crecen x10, es O(n)
  // Si n crece x10 y las ops crecen x100, sería O(n²)
  // Si n crece x10 y las ops no crecen, es O(1)
  const factorN = resultados[i].n / resultados[i - 1].n;
  const factorOps = resultados[i].totalVendido / resultados[i - 1].totalVendido;

  console.log(
    "  n: " + resultados[i - 1].n + " -> " + resultados[i].n +
    " (x" + factorN + ")" +
    "  |  ops totalVendido: x" + factorOps.toFixed(1)
  );
}

// Req. técnico: notación Big O
// Criterio: cada función tiene su clasificación Big O justificada
console.log("\nClasificación Big O:\n");
console.log("  totalVendido   -> O(n) — un solo for, ops crecen igual que n");
console.log("  ventaMayor     -> O(n) — un solo for con una comparación por elemento");
console.log("  totalPorCiudad -> O(n) — un solo for, filtra y suma en un recorrido");
console.log("  primeraVenta   -> O(1) — acceso directo por índice, siempre 1 op");
