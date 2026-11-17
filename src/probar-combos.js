const catalogo = require("./catalogo");
const ventas = require("./datos");
const {
  comboRegaloBruto,
  comboRegalo,
  productoEstrellaPorCiudad,
  primerClienteUnico,
} = require("./analitica");

// === 1. comboRegalo: fuerza bruta vs optimizada ===

console.log("=== comboRegalo — Fuerza bruta vs Optimizada ===\n");

// Prueba con 87.000 (debe encontrar Huila 500g + Sierra 500g = 42000 + 45000)
const brutoCon87 = comboRegaloBruto(catalogo, 87000);
const optCon87 = comboRegalo(catalogo, 87000);
console.log("$87.000 — Bruto:", brutoCon87);
console.log("$87.000 — Map:  ", optCon87);

// Prueba con 61.000 (debe encontrar Nariño 250g + Taza cerámica = 26000 + 35000)
const brutoCon61 = comboRegaloBruto(catalogo, 61000);
const optCon61 = comboRegalo(catalogo, 61000);
console.log("$61.000 — Bruto:", brutoCon61);
console.log("$61.000 — Map:  ", optCon61);

// Prueba sin combinación posible (1.000 — ningún par suma tan poco)
const brutoSin = comboRegaloBruto(catalogo, 1000);
const optSin = comboRegalo(catalogo, 1000);
console.log("$1.000  — Bruto:", brutoSin);
console.log("$1.000  — Map:  ", optSin);

// === Traza de la versión optimizada para $87.000 ===

console.log("\n=== Traza de comboRegalo(catalogo, 87000) ===\n");
// Recorremos el catálogo simulando paso a paso:
const vistos = new Map();
for (const p of catalogo) {
  const falta = 87000 - p.precio;
  const encontrado = vistos.has(falta);
  console.log(
    `  ${p.producto} ($${p.precio})` +
    `  → falta: $${falta}` +
    `  → ¿vistos.has($${falta})? ${encontrado ? "SÍ ✓" : "NO"}`
  );
  if (encontrado) {
    console.log(`  → PAR ENCONTRADO: [${vistos.get(falta)}, ${p.producto}]`);
    break;
  }
  vistos.set(p.precio, p.producto);
  console.log(`  → Guardamos: vistos.set($${p.precio}, "${p.producto}")`);
}

// === 2. productoEstrellaPorCiudad ===

console.log("\n=== productoEstrellaPorCiudad ===\n");
const estrellas = productoEstrellaPorCiudad(ventas);
// Mostramos el producto más vendido (por apariciones) en cada ciudad
for (const [ciudad, info] of Object.entries(estrellas)) {
  console.log(`  ${ciudad}: ${info.producto} (${info.apariciones} apariciones)`);
}

// === 3. primerClienteUnico ===

console.log("\n=== primerClienteUnico ===\n");
const unico = primerClienteUnico(ventas);
// Con los datos del Día 1, el primer cliente que compró exactamente una vez es C04
console.log(`  Primer cliente único: ${unico}`);
console.log(`  Esperado: C04`);
console.log(`  ¿Correcto?: ${unico === "C04" ? "✓ SÍ" : "✗ NO"}`);

// === 4. Clasificación de complejidad ===

console.log("\n=== Clasificación de complejidad ===\n");
console.log("  comboRegalo:              O(n) tiempo, O(n) espacio — un recorrido del catálogo");
console.log("  productoEstrellaPorCiudad: O(n) tiempo, O(c×p) espacio — n ventas, c ciudades, p productos");
console.log("  primerClienteUnico:        O(n) tiempo, O(c) espacio — dos recorridos, c clientes únicos");
