const ventas = require('./datos');
const { generarVentas } = require('./generador');
const catalogo = require('./catalogo');
const {
  claveTexto,
  valorVenta,
  contarVentasValidas,
  totalVendido,
  unidadesVendidas,
  ventaMayor,
  ticketPromedio,
  totalPorCiudad,
  unidadesPorProducto,
  topProductosPorValor,
  ventasDelDia,
  clientesRecurrentesSet,
  comprasPorCliente,
  comboRegalo,
  productoEstrellaPorCiudad,
  primerClienteUnico,
  mejorSemana,
  parMasCercano,
} = require('./analitica');

const ANCHO = 64;
const FECHAS_POR_DEFECTO = ['2026-09-04', '2026-09-07'];

function pesos(valor) {
  return Number(valor).toLocaleString('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function numero(valor) {
  return Number(valor).toLocaleString('es-CO');
}

function porcentaje(parte, total) {
  if (total === 0) return '0,0 %';
  return `${((parte / total) * 100).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} %`;
}

function titulo(texto) {
  return ['', texto, '─'.repeat(ANCHO)];
}

function dato(etiqueta, valor) {
  return `  ${`${etiqueta} `.padEnd(34, '.')} ${valor}`;
}

function tabla(columnas, filas, pie) {
  const todas = pie ? [...filas, pie] : filas;
  const anchos = columnas.map((col) =>
    Math.max(col.titulo.length, ...todas.map((fila) => String(fila[col.clave]).length))
  );
  const celda = (texto, i) =>
    columnas[i].derecha ? String(texto).padStart(anchos[i]) : String(texto).padEnd(anchos[i]);
  const linea = (fila) => `  ${columnas.map((col, i) => celda(fila[col.clave], i)).join('   ')}`;
  const separador = `  ${anchos.map((ancho) => '-'.repeat(ancho)).join('   ')}`;

  const resultado = [`  ${columnas.map((col, i) => celda(col.titulo, i)).join('   ')}`, separador];
  for (const fila of filas) resultado.push(linea(fila));
  if (pie) resultado.push(separador, linea(pie));
  return resultado;
}

function describirVenta(venta) {
  if (venta === null) return 'Sin ventas válidas';
  return `#${venta.id} · ${venta.producto} · ${pesos(valorVenta(venta))}`;
}

function seccionResumen(datos) {
  const fechas = datos.map((venta) => venta.fecha).sort();
  const periodo = fechas.length === 0 ? 'Sin datos' : `${fechas[0]} a ${fechas[fechas.length - 1]}`;
  const validas = contarVentasValidas(datos);

  return [
    ...titulo('1. RESUMEN GENERAL'),
    dato('Periodo', periodo),
    dato('Registros', numero(datos.length)),
    dato('Ventas válidas (cantidad > 0)', numero(validas)),
    dato('Registros sin unidades', numero(datos.length - validas)),
    dato('Unidades vendidas', numero(unidadesVendidas(datos))),
    dato('Total vendido', pesos(totalVendido(datos))),
    dato('Ticket promedio', pesos(ticketPromedio(datos))),
    dato('Venta más grande', describirVenta(ventaMayor(datos))),
  ];
}

function seccionCiudades(datos) {
  const total = totalVendido(datos);
  const filas = Object.entries(totalPorCiudad(datos))
    .sort(([, a], [, b]) => b - a)
    .map(([ciudad, valor]) => ({ ciudad, valor: pesos(valor), part: porcentaje(valor, total) }));

  if (filas.length === 0)
    return [...titulo('2. VENTAS POR CIUDAD'), '  No hay ventas registradas.'];
  return [
    ...titulo('2. VENTAS POR CIUDAD'),
    ...tabla(
      [
        { titulo: 'Ciudad', clave: 'ciudad' },
        { titulo: 'Total', clave: 'valor', derecha: true },
        { titulo: 'Participación', clave: 'part', derecha: true },
      ],
      filas,
      { ciudad: 'TOTAL', valor: pesos(total), part: porcentaje(total, total) }
    ),
  ];
}

function seccionProductos(datos) {
  const filas = Object.entries(unidadesPorProducto(datos))
    .sort(([prodA, a], [prodB, b]) => b - a || prodA.localeCompare(prodB, 'es'))
    .map(([producto, unidades]) => ({ producto, unidades: numero(unidades) }));

  if (filas.length === 0)
    return [...titulo('3. UNIDADES POR PRODUCTO'), '  No hay ventas registradas.'];
  return [
    ...titulo('3. UNIDADES POR PRODUCTO'),
    ...tabla(
      [
        { titulo: 'Producto', clave: 'producto' },
        { titulo: 'Unidades', clave: 'unidades', derecha: true },
      ],
      filas,
      { producto: 'TOTAL', unidades: numero(unidadesVendidas(datos)) }
    ),
  ];
}

function seccionTop(datos) {
  const filas = topProductosPorValor(datos, 3).map((item, i) => ({
    puesto: `${i + 1}.`,
    producto: item.producto,
    unidades: numero(item.unidades),
    valor: pesos(item.valor),
  }));

  if (filas.length === 0)
    return [...titulo('4. TOP 3 PRODUCTOS POR VALOR'), '  No hay ventas registradas.'];
  return [
    ...titulo('4. TOP 3 PRODUCTOS POR VALOR'),
    ...tabla(
      [
        { titulo: '#', clave: 'puesto' },
        { titulo: 'Producto', clave: 'producto' },
        { titulo: 'Unidades', clave: 'unidades', derecha: true },
        { titulo: 'Valor', clave: 'valor', derecha: true },
      ],
      filas
    ),
  ];
}

function seccionDias(datos, fechas) {
  const lineas = [...titulo('5. RESUMEN POR DÍA')];
  for (const fecha of fechas) {
    const dia = ventasDelDia(datos, fecha);
    lineas.push('', `  Día ${dia.fecha || '(sin fecha)'}`);

    if (!dia.fechaValida) {
      lineas.push(
        `  Fecha no válida. Use el formato AAAA-MM-DD, por ejemplo ${FECHAS_POR_DEFECTO[0]}.`
      );
      continue;
    }
    if (!dia.hayVentas) {
      lineas.push('  No se registraron ventas este día.');
    }
    lineas.push(
      dato('Registros', numero(dia.registros)),
      dato('Ventas válidas', numero(dia.ventasValidas)),
      dato('Unidades vendidas', numero(dia.unidades)),
      dato('Total vendido', pesos(dia.total)),
      dato('Ticket promedio', pesos(dia.ticketPromedio)),
      dato('Venta más grande', describirVenta(dia.ventaMayor))
    );
  }
  return lineas;
}

function seccionRecurrentes(datos) {
  const recurrentes = clientesRecurrentesSet(datos);
  const conteo = comprasPorCliente(datos);

  const filas = recurrentes.map((cliente) => ({
    cliente,
    compras: numero(conteo.get(cliente)),
  }));

  return [
    ...titulo('6. CLIENTES RECURRENTES'),
    dato('Total clientes recurrentes', numero(recurrentes.length)),
    '',
    ...tabla(
      [
        { titulo: 'Cliente', clave: 'cliente' },
        { titulo: 'Compras', clave: 'compras', derecha: true },
      ],
      filas
    ),
  ];
}

function seccionEstrellas(datos) {
  const estrellas = productoEstrellaPorCiudad(datos);
  const filas = Object.entries(estrellas).map(([ciudad, info]) => ({
    ciudad,
    producto: info.producto,
    apariciones: numero(info.apariciones),
  }));

  return [
    ...titulo('7. PRODUCTO ESTRELLA POR CIUDAD'),
    ...tabla(
      [
        { titulo: 'Ciudad', clave: 'ciudad' },
        { titulo: 'Producto estrella', clave: 'producto' },
        { titulo: 'Apariciones', clave: 'apariciones', derecha: true },
      ],
      filas
    ),
  ];
}

function seccionCombo() {
  const combo60 = comboRegalo(catalogo, 61000);
  const combo87 = comboRegalo(catalogo, 87000);

  const lineas = [...titulo('8. COMBO DE REGALO SUGERIDO')];
  if (combo60) lineas.push(dato('Combo $61.000', `${combo60[0]} + ${combo60[1]}`));
  else lineas.push(dato('Combo $61.000', 'Sin combinación exacta'));
  if (combo87) lineas.push(dato('Combo $87.000', `${combo87[0]} + ${combo87[1]}`));
  else lineas.push(dato('Combo $87.000', 'Sin combinación exacta'));

  return lineas;
}

function seccionCupon(datos) {
  const unico = primerClienteUnico(datos);
  return [
    ...titulo('9. CLIENTE PARA CUPÓN DE PRIMERA COMPRA'),
    dato('Primer cliente único', unico || 'Todos son recurrentes'),
  ];
}

function seccionMejorSemana() {
  const ventasDiarias = [
    320, 410, 280, 390, 510, 620, 700, 300, 290, 450,
    480, 530, 610, 680, 350, 330, 420, 470, 560, 640,
    710, 380, 360, 440, 500, 590, 650, 720, 400, 370,
  ];

  const resultado = mejorSemana(ventasDiarias, 7);

  return [
    ...titulo('10. MEJOR SEMANA DE VENTAS (SEPTIEMBRE)'),
    dato('Día de inicio', `Día ${resultado.inicio}`),
    dato('Total de la semana', `${numero(resultado.total)} (miles $COP)`),
    dato('Días', `[${ventasDiarias.slice(resultado.inicio, resultado.inicio + 7)}]`),
  ];
}

function seccionPresupuesto() {
  const par100 = parMasCercano(catalogo, 100000);
  const par140 = parMasCercano(catalogo, 140000);

  const lineas = [...titulo('11. PAR MÁS CERCANO AL PRESUPUESTO')];
  if (par100) lineas.push(dato('Presupuesto $100.000', `${par100[0]} + ${par100[1]}`));
  else lineas.push(dato('Presupuesto $100.000', 'Sin solución'));
  if (par140) lineas.push(dato('Presupuesto $140.000', `${par140[0]} + ${par140[1]}`));
  else lineas.push(dato('Presupuesto $140.000', 'Sin solución'));

  return lineas;
}

function generarReporte(datos, fechas = FECHAS_POR_DEFECTO) {
  const lineas = [
    '═'.repeat(ANCHO),
    '  CAFÉ ORIGEN · Reporte de ventas · v1.0',
    `  Generado: ${new Date().toLocaleDateString('es-CO')}`,
    '═'.repeat(ANCHO),
    ...seccionResumen(datos),
    ...seccionCiudades(datos),
    ...seccionProductos(datos),
    ...seccionTop(datos),
    ...seccionDias(datos, fechas),
    ...seccionRecurrentes(datos),
    ...seccionEstrellas(datos),
    ...seccionCombo(),
    ...seccionCupon(datos),
    ...seccionMejorSemana(),
    ...seccionPresupuesto(),
    '',
    '═'.repeat(ANCHO),
  ];
  return lineas.join('\n');
}

function revisarReporte(texto, datos) {
  const problemas = [];
  if (texto.includes('NaN')) problemas.push('El reporte contiene NaN.');
  if (texto.includes('undefined')) problemas.push('El reporte contiene undefined.');

  const claves = Object.keys(totalPorCiudad(datos)).map((ciudad) => claveTexto(ciudad));
  if (new Set(claves).size !== claves.length) problemas.push('Hay ciudades duplicadas.');
  return problemas;
}

if (require.main === module) {
  const argumentos = process.argv.slice(2);
  const primerArg = argumentos[0];
  const esNumero = primerArg && /^\d+$/.test(primerArg);

  let datosReporte;
  let fechas;

  if (esNumero) {
    const n = parseInt(primerArg, 10);
    console.log(`Generando ${numero(n)} ventas sintéticas...\n`);
    datosReporte = generarVentas(n);
    fechas = FECHAS_POR_DEFECTO;
  } else {
    datosReporte = ventas;
    fechas = argumentos.length > 0 ? argumentos : FECHAS_POR_DEFECTO;
  }

  const inicio = performance.now();
  const reporte = generarReporte(datosReporte, fechas);
  const tiempo = performance.now() - inicio;

  console.log(reporte);
  console.log(`\n  Tiempo total del reporte: ${tiempo.toFixed(2)} ms`);

  const problemas = revisarReporte(reporte, datosReporte);
  if (problemas.length === 0) {
    console.log('  Verificación: sin NaN, sin undefined y sin ciudades duplicadas.\n');
  } else {
    console.log('  Verificación con problemas:');
    for (const problema of problemas) console.log(`  - ${problema}`);
    process.exitCode = 1;
  }
}

module.exports = { generarReporte, revisarReporte };
