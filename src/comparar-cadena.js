const { generarVentas } = require("./generador");
const { totalCiudadCadena, totalCiudadUnaPasada } = require("./analitica");

const ventas = generarVentas(10000);
const ciudad = "Medellín";

const resultadoCadena = totalCiudadCadena(ventas, ciudad);
const resultadoUnaPasada = totalCiudadUnaPasada(ventas, ciudad);

console.log("Comparación totalCiudad con 10.000 ventas:\n");
console.log(`  Cadena (map.filter.map.reduce): ${resultadoCadena}`);
console.log(`  Una pasada (for...of):          ${resultadoUnaPasada}`);
console.log(`  Iguales: ${resultadoCadena === resultadoUnaPasada ? "SI" : "NO"}\n`);

const ventasGrandes = generarVentas(100000);

console.time("  Cadena (100k)");
totalCiudadCadena(ventasGrandes, ciudad);
console.timeEnd("  Cadena (100k)");

console.time("  Una pasada (100k)");
totalCiudadUnaPasada(ventasGrandes, ciudad);
console.timeEnd("  Una pasada (100k)");
