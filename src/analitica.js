function limpiarTexto(texto) {
  if (typeof texto !== 'string') return '';
  return texto.normalize('NFC').trim().replace(/\s+/g, ' ');
}

// "Medellín" y "medellín" producen la misma clave: "medellin"
function claveTexto(texto) {
  return limpiarTexto(texto)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function tieneTildes(texto) {
  return /[̀-ͯ]/.test(limpiarTexto(texto).normalize('NFD'));
}

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

function cantidadDe(venta) {
  if (!venta) return 0;
  const cantidad = Number(venta.cantidad);
  return Number.isFinite(cantidad) ? cantidad : 0;
}

function precioDe(venta) {
  if (!venta) return 0;
  const precio = Number(venta.precio);
  return Number.isFinite(precio) ? precio : 0;
}

function valorVenta(venta) {
  return cantidadDe(venta) * precioDe(venta);
}

function esVentaValida(venta) {
  return cantidadDe(venta) > 0;
}

function contarVentasValidas(ventas) {
  let validas = 0;
  for (const venta of ventas) {
    if (esVentaValida(venta)) validas++;
  }
  return validas;
}

function totalVendido(ventas) {
  let total = 0;
  for (const venta of ventas) {
    total += valorVenta(venta);
  }
  return total;
}

function unidadesVendidas(ventas) {
  let unidades = 0;
  for (const venta of ventas) {
    unidades += cantidadDe(venta);
  }
  return unidades;
}

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

// Devuelve 0 si no hay ventas válidas (evita NaN por división entre 0)
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

// Versiones con .reduce()

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

// Prefiere el nombre con tildes si existe ("Medellín" > "medellín")
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

function unidadesPorProducto(ventas) {
  return Object.fromEntries(
    Object.entries(agruparPorProducto(ventas)).map(([, grupo]) => [grupo.producto, grupo.unidades])
  );
}

function topProductosPorValor(ventas, k = 3) {
  const limite = Number(k);
  if (!Number.isInteger(limite) || limite <= 0) return [];

  return Object.entries(agruparPorProducto(ventas))
    .map(([, grupo]) => ({ ...grupo }))
    .sort((a, b) => b.valor - a.valor || a.producto.localeCompare(b.producto, 'es'))
    .slice(0, limite);
}

// Spread [...ventas] para no mutar el arreglo original
function ventasOrdenadasPorValor(ventas) {
  return [...ventas].sort((a, b) => valorVenta(b) - valorVenta(a));
}

function esFechaValida(fecha) {
  const texto = limpiarTexto(fecha);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return false;
  const fechaReal = new Date(`${texto}T00:00:00Z`);
  return !Number.isNaN(fechaReal.getTime()) && fechaReal.toISOString().slice(0, 10) === texto;
}

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

// MR7: 4 recorridos + 3 arreglos intermedios = O(n) tiempo, O(n) espacio
function totalCiudadCadena(ventas, ciudad) {
  const buscada = ciudad.toLowerCase().trim();
  return ventas
    .map((v) => ({ ...v, ciudadNorm: v.ciudad.toLowerCase().trim() }))
    .filter((v) => v.ciudadNorm === buscada)
    .map((v) => v.cantidad * v.precio)
    .reduce((sum, val) => sum + val, 0);
}

// MR7: 1 recorrido, 0 arreglos intermedios = O(n) tiempo, O(1) espacio
function totalCiudadUnaPasada(ventas, ciudad) {
  const buscada = ciudad.toLowerCase().trim();
  let total = 0;
  for (const v of ventas) {
    if (v.ciudad.toLowerCase().trim() === buscada) {
      total += v.cantidad * v.precio;
    }
  }
  return total;
}

// MR6: O(n²) — ciclo anidado, cada venta se compara con todas las siguientes
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

// MR9: O(n) — dos Sets: uno de vistos, otro de recurrentes
function clientesRecurrentesSet(ventas) {
  const vistos = new Set();
  const recurrentes = new Set();
  for (const v of ventas) {
    if (vistos.has(v.cliente)) recurrentes.add(v.cliente);
    else vistos.add(v.cliente);
  }
  return [...recurrentes];
}

// MR9: O(n) — Map que cuenta compras por cliente
function comprasPorCliente(ventas) {
  const conteo = new Map();
  for (const v of ventas) {
    conteo.set(v.cliente, (conteo.get(v.cliente) || 0) + 1);
  }
  return conteo;
}

function clientesRecurrentesMap(ventas) {
  const conteo = comprasPorCliente(ventas);
  const recurrentes = [];
  for (const [cliente, compras] of conteo) {
    if (compras > 1) recurrentes.push(cliente);
  }
  return recurrentes;
}

// MR11: O(n × k) — suma cada bloque de k días desde cero
function mejorSemanaBruta(dias, k) {
  if (k > dias.length) return null;
  let mejorTotal = 0;
  let mejorInicio = 0;
  for (let i = 0; i <= dias.length - k; i++) {
    let suma = 0;
    for (let j = i; j < i + k; j++) suma += dias[j];
    if (suma > mejorTotal) {
      mejorTotal = suma;
      mejorInicio = i;
    }
  }
  return { inicio: mejorInicio, total: mejorTotal };
}

// MR11: O(n) — ventana deslizante de tamaño fijo
function mejorSemana(dias, k) {
  if (k > dias.length) return null;
  let suma = 0;
  for (let i = 0; i < k; i++) suma += dias[i];
  let mejorTotal = suma;
  let mejorInicio = 0;
  for (let i = k; i < dias.length; i++) {
    suma += dias[i] - dias[i - k];
    if (suma > mejorTotal) {
      mejorTotal = suma;
      mejorInicio = i - k + 1;
    }
  }
  return { inicio: mejorInicio, total: mejorTotal };
}

// MR11: O(n log n) — dos punteros sobre precios ordenados
function parMasCercano(catalogo, presupuesto) {
  const ordenados = [...catalogo].sort((a, b) => a.precio - b.precio);
  let izq = 0;
  let der = ordenados.length - 1;
  let mejorPar = null;
  let mejorSuma = 0;
  while (izq < der) {
    const suma = ordenados[izq].precio + ordenados[der].precio;
    if (suma <= presupuesto) {
      if (suma > mejorSuma) {
        mejorSuma = suma;
        mejorPar = [ordenados[izq].producto, ordenados[der].producto];
      }
      izq++;
    } else {
      der--;
    }
  }
  return mejorPar;
}

// MR10: O(n²) — prueba todos los pares
function comboRegaloBruto(catalogo, valor) {
  for (let i = 0; i < catalogo.length; i++) {
    for (let j = i + 1; j < catalogo.length; j++) {
      if (catalogo[i].precio + catalogo[j].precio === valor) {
        return [catalogo[i].producto, catalogo[j].producto];
      }
    }
  }
  return null;
}

// MR10: O(n) — Map de complementos, un solo recorrido
function comboRegalo(catalogo, valor) {
  const vistos = new Map();
  for (const p of catalogo) {
    const falta = valor - p.precio;
    if (vistos.has(falta)) return [vistos.get(falta), p.producto];
    vistos.set(p.precio, p.producto);
  }
  return null;
}

// MR10: O(n) — conteo de frecuencias con Map anidado
function productoEstrellaPorCiudad(ventas) {
  const ciudades = new Map();
  for (const v of ventas) {
    const clave = claveTexto(v.ciudad);
    if (!ciudades.has(clave)) ciudades.set(clave, new Map());
    const frecuencias = ciudades.get(clave);
    frecuencias.set(v.producto, (frecuencias.get(v.producto) || 0) + 1);
  }

  const resultado = {};
  for (const [clave, frecuencias] of ciudades) {
    let estrella = null;
    let maxFrec = 0;
    for (const [producto, frec] of frecuencias) {
      if (frec > maxFrec || (frec === maxFrec && producto < estrella)) {
        estrella = producto;
        maxFrec = frec;
      }
    }

    let nombreCiudad = formatearNombreLugar(clave);
    for (const v of ventas) {
      if (claveTexto(v.ciudad) === clave && tieneTildes(v.ciudad)) {
        nombreCiudad = formatearNombreLugar(v.ciudad);
        break;
      }
    }
    resultado[nombreCiudad] = { producto: estrella, apariciones: maxFrec };
  }
  return resultado;
}

// MR10: O(n) — dos recorridos: contar y buscar el primero con 1 compra
function primerClienteUnico(ventas) {
  const conteo = new Map();
  for (const v of ventas) {
    conteo.set(v.cliente, (conteo.get(v.cliente) || 0) + 1);
  }
  for (const v of ventas) {
    if (conteo.get(v.cliente) === 1) return v.cliente;
  }
  return null;
}

// Versiones instrumentadas: reciben { ops: 0 } por referencia y cuentan operaciones
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
  totalCiudadCadena,
  totalCiudadUnaPasada,
  clientesRecurrentes,
  clientesRecurrentesSet,
  comprasPorCliente,
  clientesRecurrentesMap,
  mejorSemanaBruta,
  mejorSemana,
  parMasCercano,
  comboRegaloBruto,
  comboRegalo,
  productoEstrellaPorCiudad,
  primerClienteUnico,
  totalVendidoInst,
  ventaMayorInst,
  totalPorCiudadInst,
  primeraVenta,
};
