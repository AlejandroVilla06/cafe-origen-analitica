// Importamos los 12 datos originales del Día 1
// datos.js exporta el arreglo directo con module.exports = ventas
const ventas = require('./datos');

// Función helper: recibe un arreglo y devuelve un elemento al azar
// Math.random() genera un decimal entre 0 y 1 (ej: 0.73)
// Lo multiplica por array.length para escalar al rango del arreglo (ej: 0.73 * 4 = 2.92)
// Math.floor() redondea abajo para obtener un índice entero válido (ej: 2)
// Req. técnico: Math.random, Math.floor
const random = (array) => array[Math.floor(Math.random() * array.length)];

// Extraemos los valores de cada propiedad de los 12 datos originales con .map()
// .map() recorre cada venta y devuelve un arreglo nuevo solo con esa propiedad
// Así el generador usa exactamente los mismos valores que datos.js

// Todos los productos: ["Origen Huila 500 g", "Origen Nariño 250 g", ...]
const staticProducts = ventas.map((venta) => venta.producto);

// Todas las ciudades: ["Medellín", "Bogotá", "Cali", "medellín", ...]
const staticCities = ventas.map((venta) => venta.ciudad);

// Todas las cantidades: [2, 1, 1, 1, 3, 2, 1, 0, 2, 4, 1, 3]
const staticQuantities = ventas.map((venta) => venta.cantidad);

// Todos los precios en el MISMO orden que staticProducts
// Así el índice 0 de ambos corresponde al mismo producto
const staticPrices = ventas.map((venta) => venta.precio);

// Paso 1 del MR5: función generarVentas(n)
// Devuelve un arreglo de n ventas con la misma estructura de datos.js
// Req. técnico: generación de arreglos con ciclos, Math.random, Math.floor
function generarVentas(n) {
  // Arreglo vacío donde acumulamos las ventas generadas
  const resultado = [];

  // Req. del reto: "entre 1 y n/3 clientes distintos"
  // Con n=300 hay 100 clientes posibles, se repiten lo suficiente
  // para que en el MR6 aparezcan "clientes recurrentes"
  const totalClientes = Math.floor(n / 3);

  // Ciclo que genera n ventas, una por iteración
  for (let i = 0; i < n; i++) {
    // Para producto y precio usamos el MISMO índice aleatorio
    // Así "Origen Huila 500 g" siempre va con 42000, nunca se desacoplan
    const prodIndex = Math.floor(Math.random() * staticProducts.length);

    // Generamos el cliente dinámico según n, no de lista estática
    // Math.floor(Math.random() * totalClientes) da entre 0 y totalClientes-1
    // +1 para que empiece en 1, no en 0
    const numCliente = Math.floor(Math.random() * totalClientes) + 1;
    // padStart(2, "0") convierte 1 → "01", 12 → "12", 100 → "100"
    const cliente = "C" + String(numCliente).padStart(2, "0");

    // Armamos el objeto venta con la misma estructura de datos.js:
    // { id, fecha, cliente, producto, ciudad, cantidad, precio }
    resultado.push({
      id: i + 1,                            // ID secuencial empezando en 1
      fecha: "2026-09-01",                  // Fecha fija
      cliente: cliente,                     // Cliente dinámico según n/3
      producto: staticProducts[prodIndex],  // Producto al azar de los existentes
      ciudad: random(staticCities),         // Ciudad al azar de las existentes
      cantidad: random(staticQuantities),   // Cantidad al azar de las existentes
      precio: staticPrices[prodIndex],      // Precio que corresponde al producto
    });
  }

  // Devolvemos el arreglo con las n ventas generadas
  return resultado;
}

// Exportamos para usar en medir.js
module.exports = { generarVentas };
