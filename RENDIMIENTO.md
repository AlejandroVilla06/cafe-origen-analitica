# Informe de rendimiento — Motor de analítica Café Origen v0.2

## Tabla de complejidad

| Función | Qué hace | Tiempo | Espacio | Justificación | Ops/Tiempo (10.000 ventas) |
|---------|----------|--------|---------|---------------|---------------------------|
| totalVendido | Suma el valor de todas las ventas | O(n) | O(1) | Un solo `for...of`, un acumulador | 10.000 ops |
| unidadesVendidas | Suma las unidades vendidas | O(n) | O(1) | Un solo `for...of`, un acumulador | 10.000 ops |
| ventaMayor | Encuentra la venta con mayor valor | O(n) | O(1) | Un solo `for...of`, dos variables de seguimiento | 9.999 ops |
| ticketPromedio | Promedio del valor por venta válida | O(n) | O(1) | Un solo `for...of`, dos acumuladores | 10.000 ops |
| ventasPorCiudad | Total vendido en una ciudad | O(n) | O(1) | Un solo `for...of`, compara y suma | 10.000 ops |
| contarVentasValidas | Cuenta ventas con cantidad > 0 | O(n) | O(1) | Un solo `for...of`, un contador | 10.000 ops |
| totalVendidoM | Versión .reduce() de totalVendido | O(n) | O(1) | `.reduce()` con acumulador, sin arreglo intermedio | 10.000 ops |
| unidadesVendidasM | Versión .reduce() de unidadesVendidas | O(n) | O(1) | `.reduce()` con acumulador | 10.000 ops |
| ventasPorCiudadM | Versión .filter().map().reduce() | O(n) | O(n) | Encadena 3 métodos, crea arreglos intermedios | 10.000 ops |
| totalPorCiudad | Agrupa ventas por ciudad | O(n) | O(c) | `.reduce()` construye un objeto con c ciudades únicas | 10.000 ops |
| unidadesPorProducto | Unidades por producto | O(n) | O(p) | `.reduce()` construye un objeto con p productos únicos | 10.000 ops |
| topProductosPorValor | Top k productos por valor | O(n + p log p) | O(p) | `.reduce()` + `.sort()` sobre productos | 10.000 ops + sort |
| ventasOrdenadasPorValor | Ordena ventas por valor | O(n log n) | O(n) | Copia con spread + `.sort()` | 10.000 elementos |
| ventasDelDia | Resumen de ventas de un día | O(n) | O(n) | `.filter()` crea subarreglo del día | 10.000 ops |
| totalCiudadCadena | Total ciudad con .map.filter.map.reduce | O(n) | O(n) | 4 recorridos, 3 arreglos intermedios | ~19 ms (100k) |
| totalCiudadUnaPasada | Total ciudad con un solo for | O(n) | O(1) | 1 recorrido, solo un acumulador | ~36 ms (100k) |
| clientesRecurrentes | Clientes que compraron más de una vez | **O(n²)** | O(k) | Ciclo anidado i×j + `.includes()` sobre arreglo creciente | **~100 ms (10k)** |
| primeraVenta | Acceso directo al primer elemento | O(1) | O(1) | Un solo acceso por índice | 1 op |

## Proyección a 1.000.000 de ventas

| Función | 10.000 ventas | 100.000 ventas | 1.000.000 ventas (estimado) |
|---------|--------------|----------------|----------------------------|
| totalVendido | < 1 ms | < 10 ms | ~100 ms |
| ventaMayor | < 1 ms | < 10 ms | ~100 ms |
| totalPorCiudad | < 1 ms | < 10 ms | ~100 ms |
| ventasOrdenadasPorValor | < 5 ms | ~50 ms | ~600 ms |
| totalCiudadCadena | < 2 ms | ~19 ms | ~190 ms |
| totalCiudadUnaPasada | < 1 ms | ~36 ms | ~360 ms |
| **clientesRecurrentes** | **~100 ms** | **~64 s** | **~87 min** |
| primeraVenta | < 0.01 ms | < 0.01 ms | < 0.01 ms |

Las estimaciones de funciones O(n) se calculan como crecimiento lineal (×10 por cada ×10 en n). La estimación de clientesRecurrentes se calcula como crecimiento cuadrático (×100 por cada ×10 en n), confirmado con la medición real de 64 s para 100.000 ventas.

## Riesgos (de mayor a menor)

1. **clientesRecurrentes — CRÍTICO**
   - Complejidad O(n²) en tiempo. Es la única función del motor que no escala.
   - Con 100.000 ventas ya tarda más de un minuto. Con 1.000.000 sería inutilizable (~87 minutos).
   - Criterio: el marketplace exige respuesta en menos de 1 segundo con 100.000 ventas. Esta función excede el límite en un factor de ×64.

2. **ventasOrdenadasPorValor — MODERADO**
   - Complejidad O(n log n) en tiempo y O(n) en espacio.
   - Crea una copia completa del arreglo para no mutar el original.
   - Con 1.000.000 sería ~600 ms, dentro del límite pero cerca.

3. **totalCiudadCadena — BAJO**
   - Funciona correctamente pero crea 3 arreglos intermedios innecesarios.
   - En un servidor con memoria limitada, preferimos totalCiudadUnaPasada.

4. **Funciones lineales O(n) — MÍNIMO**
   - Escalan bien. Con 1.000.000 de ventas estarían por debajo de 1 segundo.

## Plan de optimización

### Función objetivo: `clientesRecurrentes`

**¿Qué trabajo se repite?**

El ciclo anidado compara cada par de ventas para encontrar el mismo cliente. Si C01 aparece en las posiciones 0, 3 y 10, el ciclo lo "descubre" tres veces desde tres puntos de inicio distintos. Además, `.includes()` recorre el arreglo de recurrentes cada vez para verificar si ya fue registrado.

**¿Qué información se podría guardar para no buscarla de nuevo?**

Un **Map** o un objeto que cuente cuántas veces aparece cada cliente. En un solo recorrido del arreglo, incrementamos el contador de cada cliente. Al final, filtramos los que tienen contador > 1. Esto convertiría la función de O(n²) a **O(n)**: un solo recorrido para contar y un recorrido del Map para filtrar.

```
// Idea (sin implementar todavía):
// 1. Recorrer ventas una vez, contar apariciones de cada cliente en un Map
// 2. Filtrar los clientes con conteo > 1
// Resultado: O(n) en tiempo, O(k) en espacio (k = clientes únicos)
```

Esta optimización se implementará en el MiniReto 9 (Día 3).
