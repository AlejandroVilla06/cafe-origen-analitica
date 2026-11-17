# Café Origen — Motor de Analítica v1.0

Motor de analítica de ventas para Café Origen, construido con Node.js puro como parte del trayecto Algoritmia 2 de Riwi (Cohorte 8+, Medellín).

## ¿Qué preguntas responde?

1. **Resumen general**: total vendido, unidades, ticket promedio, venta más grande
2. **Ventas por ciudad**: desglose con participación porcentual
3. **Unidades por producto**: ranking de productos por unidades vendidas
4. **Top 3 productos por valor**: los productos que más facturan
5. **Resumen por día**: métricas de cualquier fecha específica
6. **Clientes recurrentes**: quiénes compran más de una vez (con conteo)
7. **Producto estrella por ciudad**: el más vendido en cada ciudad
8. **Combo de regalo**: dos productos que sumen un valor exacto
9. **Cliente para cupón**: el primer cliente que compró una sola vez
10. **Mejor semana de ventas**: los 7 días consecutivos con mayor total
11. **Par más cercano al presupuesto**: dos productos que mejor aprovechan el presupuesto

## Cómo ejecutarlo

```bash
# Clonar el repositorio
git clone https://github.com/AlejandroVilla06/cafe-origen-analitica.git
cd cafe-origen-analitica

# Reporte con datos reales (12 ventas del Día 1)
node src/reporte.js

# Reporte con n ventas generadas (prueba de rendimiento)
node src/reporte.js 100000

# Reporte con fechas específicas
node src/reporte.js 2026-09-01 2026-09-04
```

No requiere `npm install` — usa solo Node.js (v18+).

## Estructura del proyecto

```
cafe-origen-analitica/
├── src/
│   ├── datos.js                # Dataset de 12 ventas reales
│   ├── generador.js            # Genera n ventas sintéticas para benchmarks
│   ├── catalogo.js             # Catálogo de productos con precios
│   ├── analitica.js            # Todas las funciones de análisis (28 funciones)
│   ├── reporte.js              # Genera el reporte completo (11 secciones)
│   ├── explorar.js             # Script de exploración de datos
│   ├── medir-recurrentes.js    # Benchmark O(n²) vs O(n) de recurrentes
│   ├── comparar-recurrentes.js # Verificación de las 3 versiones de recurrentes
│   ├── probar-combos.js        # Pruebas de combo, estrella, cliente único
│   ├── probar-ventana.js       # Pruebas de ventana deslizante y dos punteros
│   └── comparar-versiones.js   # Benchmark v0.1 vs v1.0
├── bitacora.md                 # Bitácora de desarrollo (12 MiniRetos)
├── RENDIMIENTO.md              # Tabla de complejidades y comparación de versiones
└── README.md
```

## Rendimiento

| Versión | 10.000 ventas | 100.000 ventas |
|---------|--------------|----------------|
| v0.1 (5 secciones, O(n²)) | 651 ms | 70 s |
| **v1.0 (11 secciones, O(n))** | **76 ms** | **622 ms** |

Ninguna función del reporte v1.0 es O(n²). Detalles completos en [RENDIMIENTO.md](RENDIMIENTO.md).

## Técnicas aplicadas

| MiniReto | Técnica | Complejidad |
|----------|---------|-------------|
| MR1-MR8 | Acumuladores, reduce, filter, sort | O(n) a O(n log n) |
| MR9 | Set y Map para eliminar O(n²) | O(n) |
| MR10 | Map de complementos, Map anidado, dos pasadas | O(n) |
| MR11 | Ventana deslizante, dos punteros | O(n), O(n log n) |
| MR12 | Integración, process.argv, medición de tiempos | — |
