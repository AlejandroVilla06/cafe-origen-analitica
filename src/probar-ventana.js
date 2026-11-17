const catalogo = require("./catalogo");
const { mejorSemanaBruta, mejorSemana, parMasCercano } = require("./analitica");

// === Datos de septiembre (en miles de pesos) ===
const ventasDiarias = [
  320, 410, 280, 390, 510, 620, 700, 300, 290, 450,
  480, 530, 610, 680, 350, 330, 420, 470, 560, 640,
  710, 380, 360, 440, 500, 590, 650, 720, 400, 370,
];

// === 1. mejorSemana — fuerza bruta vs ventana deslizante ===

console.log("=== mejorSemana (k=7) — Septiembre ===\n");
const bruta = mejorSemanaBruta(ventasDiarias, 7);
const ventana = mejorSemana(ventasDiarias, 7);
console.log("Fuerza bruta:", bruta);
console.log("Ventana:     ", ventana);
console.log(`¿Iguales?: ${bruta.total === ventana.total && bruta.inicio === ventana.inicio ? "✓ SÍ" : "✗ NO"}`);

// Caso borde: k mayor que días
console.log("\nCaso borde k=50:", mejorSemana(ventasDiarias, 50));

// === Traza de las 3 primeras posiciones de la ventana ===

console.log("\n=== Traza de ventana deslizante (k=7) ===\n");
let suma = 0;
for (let i = 0; i < 7; i++) suma += ventasDiarias[i];
console.log(`Ventana 0: días[0..6] = [${ventasDiarias.slice(0, 7)}] → total = ${suma}`);

suma += ventasDiarias[7] - ventasDiarias[0];
console.log(`Ventana 1: días[1..7] = [${ventasDiarias.slice(1, 8)}] → +${ventasDiarias[7]} -${ventasDiarias[0]} = ${suma}`);

suma += ventasDiarias[8] - ventasDiarias[1];
console.log(`Ventana 2: días[2..8] = [${ventasDiarias.slice(2, 9)}] → +${ventasDiarias[8]} -${ventasDiarias[1]} = ${suma}`);

// === Verificación con 100.000 días aleatorios ===

console.log("\n=== Verificación con 100.000 días ===\n");
const diasAleatorios = Array.from({ length: 100000 }, () => Math.floor(Math.random() * 1000));

const t1 = performance.now();
const brutaGrande = mejorSemanaBruta(diasAleatorios, 7);
const tBruta = performance.now() - t1;

const t2 = performance.now();
const ventanaGrande = mejorSemana(diasAleatorios, 7);
const tVentana = performance.now() - t2;

console.log(`Fuerza bruta: total=${brutaGrande.total}, inicio=${brutaGrande.inicio} — ${tBruta.toFixed(2)} ms`);
console.log(`Ventana:      total=${ventanaGrande.total}, inicio=${ventanaGrande.inicio} — ${tVentana.toFixed(2)} ms`);
console.log(`¿Iguales?: ${brutaGrande.total === ventanaGrande.total ? "✓ SÍ" : "✗ NO"}`);

// === 2. parMasCercano — dos punteros ===

console.log("\n=== parMasCercano ===\n");

const par100 = parMasCercano(catalogo, 100000);
const par140 = parMasCercano(catalogo, 140000);
const par40 = parMasCercano(catalogo, 40000);

console.log("Presupuesto $100.000:", par100);
console.log("Presupuesto $140.000:", par140);
console.log("Presupuesto $40.000: ", par40);

// === Traza de punteros para $100.000 ===

console.log("\n=== Traza de parMasCercano(catalogo, 100000) ===\n");
const ordenados = [...catalogo].sort((a, b) => a.precio - b.precio);
let izq = 0;
let der = ordenados.length - 1;

while (izq < der) {
  const s = ordenados[izq].precio + ordenados[der].precio;
  const cabe = s <= 100000;
  console.log(
    `  izq=${izq} (${ordenados[izq].producto} $${ordenados[izq].precio})` +
    `  der=${der} (${ordenados[der].producto} $${ordenados[der].precio})` +
    `  → suma=$${s} ${cabe ? "≤ cabe, muevo izq→" : "> se pasa, muevo ←der"}`
  );
  if (cabe) izq++;
  else der--;
}
