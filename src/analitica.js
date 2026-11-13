// === FUNCIONES DEL DÍA 1 (base del motor de analítica) ===

// Normaliza texto: quita espacios extra y aplica NFC
function limpiarTexto(texto) {
  if (typeof texto !== 'string') return '';
  return texto.normalize('NFC').trim().replace(/\s+/g, ' ');
}

// Genera una clave en minúscula sin tildes para comparar
// "Medellín" y "medellín" producen la misma clave: "medellin"
function claveTexto(texto) {
  return limpiarTexto(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Detecta si el texto tiene tildes
function tieneTildes(texto) {
  return /[̀-ͯ]/.test(limpiarTexto(texto).normalize('NFD'));
}

// Capitaliza nombres de lugar respetando conectores (de, del, la, etc.)
function formatearNombreLugar(texto) {
  const conectores = ['de', 'del', 'la', 'las', 'los', 'y', 'e'];
  const limpio = limpiarTexto(texto).toLowerCase();
  if (limpio === '') return '';

  const palabras = [];
  let posicion = 0;
  for (const palabra of limpio.split(' ')) {
    const esConector = posicion > 0 && conectores.includes(palabra);
    palabras.push(esConector ? palabra : palabra.charAt(0).toUpperCase() + palabra.slice(1));
    posicion++;
  }
  return palabras.join(' ');
}

// Extrae la cantidad de una venta de forma segura
function cantidadDe(venta) {
  if (!venta) return 0;
  const cantidad = Number(venta.cantidad);
  return Number.isFinite(cantidad) ? cantidad : 0;
}

// Extrae el precio de una venta de forma segura
function precioDe(venta) {
  if (!venta) return 0;
  const precio = Number(venta.precio);
  return Number.isFinite(precio) ? precio : 0;
}

// Calcula el valor de una venta: cantidad × precio
function valorVenta(venta) {
  return cantidadDe(venta) * precioDe(venta);
}

// Determina si una venta es válida (cantidad > 0)
function esVentaValida(venta) {
  return cantidadDe(venta) > 0;
}

// Cuenta cuántas ventas tienen cantidad > 0
function contarVentasValidas(ventas) {
  let validas = 0;
  for (const venta of ventas) {
    if (esVentaValida(venta)) validas++;
  }
  return validas;
}

// Suma el valor de todas las ventas
function totalVendido(ventas) {
  let total = 0;
  for (const venta of ventas) {
    total += valorVenta(venta);
  }
  return total;
}

// Suma las unidades de todas las ventas
function unidadesVendidas(ventas) {
  let unidades = 0;
  for (const venta of ventas) {
    unidades += cantidadDe(venta);
  }
  return unidades;
}

// Encuentra la venta con mayor valor (ignora ventas con cantidad 0)
function ventaMayor(ventas) {
  let mayor = null;
  let valorMayor = 0;
  for (const venta of ventas) {
    if (!esVentaValida(venta)) continue;
    const valor = valorVenta(venta);
    if (mayor === null || valor > valorMayor) {
      mayor = venta;
      valorMayor = valor;
    }
  }
  return mayor;
}

// Promedio del valor por venta válida (devuelve 0 si no hay ventas válidas)
function ticketPromedio(ventas) {
  let total = 0;
  let validas = 0;
  for (const venta of ventas) {
    if (!esVentaValida(venta)) continue;
    total += valorVenta(venta);
    validas++;
  }
  if (validas === 0) return 0;
  return total / validas;
}

// Total vendido en una ciudad específica (normaliza para comparar)
function ventasPorCiudad(ventas, ciudad) {
  const buscada = claveTexto(ciudad);
  if (buscada === '') return 0;

  let total = 0;
  for (const venta of ventas) {
    if (venta && claveTexto(venta.ciudad) === buscada) {
      total += valorVenta(venta);
    }
  }
  return total;
}

// === Versiones con .reduce() para verificar.js ===

function totalVendidoM(ventas) {
  return ventas.reduce((total, venta) => total + valorVenta(venta), 0);
}

function unidadesVendidasM(ventas) {
  return ventas.reduce((unidades, venta) => unidades + cantidadDe(venta), 0);
}

function ventasPorCiudadM(ventas, ciudad) {
  const buscada = claveTexto(ciudad);
  if (buscada === '') return 0;

  return ventas
    .filter((venta) => Boolean(venta) && claveTexto(venta.ciudad) === buscada)
    .map((venta) => valorVenta(venta))
    .reduce((total, valor) => total + valor, 0);
}

// Agrupa ventas por ciudad con nombre normalizado
function totalPorCiudad(ventas) {
  const grupos = ventas.reduce((acumulado, venta) => {
    if (!venta) return acumulado;
    const clave = claveTexto(venta.ciudad);
    const nombre = clave === '' ? 'Sin ciudad' : formatearNombreLugar(venta.ciudad);

    if (!acumulado[clave]) {
      acumulado[clave] = { nombre, total: 0 };
    } else if (!tieneTildes(acumulado[clave].nombre) && tieneTildes(nombre)) {
      acumulado[clave].nombre = nombre;
    }
    acumulado[clave].total += valorVenta(venta);
    return acumulado;
  }, {});

  return Object.fromEntries(Object.entries(grupos).map(([, grupo]) => [grupo.nombre, grupo.total]));
}

// Agrupa ventas por producto (unidades y valor)
function agruparPorProducto(ventas) {
  return ventas.reduce((grupos, venta) => {
    if (!venta) return grupos;
    const clave = claveTexto(venta.producto);
    if (!grupos[clave]) {
      grupos[clave] = {
        producto: limpiarTexto(venta.producto) || 'Sin producto',
        unidades: 0,
        valor: 0,
      };
    }
    grupos[clave].unidades += cantidadDe(venta);
    grupos[clave].valor += valorVenta(venta);
    return grupos;
  }, {});
}

// Unidades vendidas por producto
function unidadesPorProducto(ventas) {
  return Object.fromEntries(
    Object.entries(agruparPorProducto(ventas)).map(([, grupo]) => [grupo.producto, grupo.unidades])
  );
}

// Top k productos por valor de venta
function topProductosPorValor(ventas, k = 3) {
  const limite = Number(k);
  if (!Number.isInteger(limite) || limite <= 0) return [];

  return Object.entries(agruparPorProducto(ventas))
    .map(([, grupo]) => ({ ...grupo }))
    .sort((a, b) => b.valor - a.valor || a.producto.localeCompare(b.producto, 'es'))
    .slice(0, limite);
}

// Ordena ventas por valor de mayor a menor (sin mutar el original)
function ventasOrdenadasPorValor(ventas) {
  return [...ventas].sort((a, b) => valorVenta(b) - valorVenta(a));
}

// Valida formato de fecha ISO (YYYY-MM-DD)
function esFechaValida(fecha) {
  const texto = limpiarTexto(fecha);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fechaReal = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fechaReal.getTime()) && fechaReal.toISOString().slice(0, 10) === texto;
}

// Resumen de ventas de un día específico
function ventasDelDia(ventas, fecha) {
  const buscada = limpiarTexto(fecha);
  const delDia = ventas.filter((venta) => Boolean(venta) && limpiarTexto(venta.fecha) === buscada);
  const validas = contarVentasValidas(delDia);

  return {
    fecha: buscada,
    fechaValida: esFechaValida(buscada),
    registros: delDia.length,
    ventasValidas: validas,
    unidades: unidadesVendidas(delDia),
    total: totalVendido(delDia),
    ticketPromedio: ticketPromedio(delDia),
    ventaMayor: ventaMayor(delDia),
    hayVentas: validas > 0,
  };
}

// === MR6 DÍA 2: CLIENTES RECURRENTES (O(n²)) ===

function clientesRecurrentes(ventas) {
  const recurrentes = [];
  for (let i = 0; i < ventas.length; i++) {
    for (let j = i + 1; j < ventas.length; j++) {
      if (ventas[i].cliente === ventas[j].cliente &&
          !recurrentes.includes(ventas[i].cliente)) {
        recurrentes.push(ventas[i].cliente);
      }
    }
  }
  return recurrentes;
}

// === MR5 DÍA 2: VERSIONES INSTRUMENTADAS CON CONTADOR ===
// Reciben un objeto contador por referencia y suman 1 por cada operación
// Req. técnico: paso de objetos por referencia para el contador

function totalVendidoInst(ventas, contador) {
  let total = 0;
  for (let i = 0; i < ventas.length; i++) {
    contador.ops++;
    total += ventas[i].cantidad * ventas[i].precio;
  }
  return total;
}

function ventaMayorInst(ventas, contador) {
  let mayor = ventas[0];
  let mayorValor = mayor.cantidad * mayor.precio;
  for (let i = 1; i < ventas.length; i++) {
    contador.ops++;
    const valor = ventas[i].cantidad * ventas[i].precio;
    if (valor > mayorValor) {
      mayor = ventas[i];
      mayorValor = valor;
    }
  }
  return mayor;
}

function totalPorCiudadInst(ventas, ciudad, contador) {
  let total = 0;
  for (let i = 0; i < ventas.length; i++) {
    contador.ops++;
    if (ventas[i].ciudad.toLowerCase().trim() === ciudad.toLowerCase().trim()) {
      total += ventas[i].cantidad * ventas[i].precio;
    }
  }
  return total;
}

function primeraVenta(ventas, contador) {
  contador.ops++;
  return ventas[0];
}

module.exports = {
  limpiarTexto,
  claveTexto,
  tieneTildes,
  formatearNombreLugar,
  cantidadDe,
  precioDe,
  esVentaValida,
  contarVentasValidas,
  valorVenta,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  ventasPorCiudad,
  totalVendidoM,
  unidadesVendidasM,
  ventasPorCiudadM,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasOrdenadasPorValor,
  esFechaValida,
  ventasDelDia,
  clientesRecurrentes,
  totalVendidoInst,
  ventaMayorInst,
  totalPorCiudadInst,
  primeraVenta,
};
