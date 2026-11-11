const ventas = require("./datos");

console.log("Total de registros:", ventas.length);
console.log("\nPrimer registro:", ventas[0]);
console.log("\nÚltimo registro:", ventas[ventas.length - 1]);
console.log("\nProducto en posición 4:", ventas[4].producto);
console.log("\nTabla completa:");
console.table(ventas);
