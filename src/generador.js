const ventas = require('./datos');

const random = (array) => array[Math.floor(Math.random() * array.length)];

const staticProducts = ventas.map((venta) => venta.producto);
const staticCities = ventas.map((venta) => venta.ciudad);
const staticQuantities = ventas.map((venta) => venta.cantidad);
// Mismo orden que staticProducts para mantener la relación producto-precio
const staticPrices = ventas.map((venta) => venta.precio);

function generarVentas(n) {
  const resultado = [];
  // n/3 clientes distintos para que haya recurrentes en el MR6
  const totalClientes = Math.floor(n / 3);

  for (let i = 0; i < n; i++) {
    // Mismo índice para producto y precio para que nunca se desacoplen
    const prodIndex = Math.floor(Math.random() * staticProducts.length);
    const numCliente = Math.floor(Math.random() * totalClientes) + 1;
    const cliente = "C" + String(numCliente).padStart(2, "0");

    resultado.push({
      id: i + 1,
      fecha: "2026-09-01",
      cliente: cliente,
      producto: staticProducts[prodIndex],
      ciudad: random(staticCities),
      cantidad: random(staticQuantities),
      precio: staticPrices[prodIndex],
    });
  }

  return resultado;
}

module.exports = { generarVentas };
