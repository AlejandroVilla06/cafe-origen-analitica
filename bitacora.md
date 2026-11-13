# Bitácora — Café Origen Analítica

## MiniReto 1: Primer tueste — el repositorio y los datos

### Diccionario de datos

| Propiedad  | Tipo   | Significado                                      |
|------------|--------|--------------------------------------------------|
| id         | number | Identificador único de la venta                  |
| fecha      | string | Fecha de la venta en formato ISO (YYYY-MM-DD)    |
| cliente    | string | Código del cliente (ej: C01, C02)                |
| producto   | string | Nombre del producto vendido                      |
| ciudad     | string | Ciudad donde se realizó la venta                 |
| cantidad   | number | Unidades vendidas en esa transacción             |
| precio     | number | Precio unitario del producto en pesos colombianos|

### Casos borde detectados

1. **Ciudad con mayúscula inconsistente (id 5)**
   - `"medellín"` en minúscula vs `"Medellín"` en los demás registros.
   - Si agrupamos por ciudad sin normalizar, quedarían como dos ciudades distintas.
   - **Decisión**: al consultar o agrupar, normalizar con `toLowerCase()` y `trim()` para comparar. No modificar el dato original.

2. **Venta con cantidad 0 (id 8)**
   - Producto "Origen Huila 500 g" con cantidad 0. Podría ser una cancelación, un error de registro o una muestra.
   - Valor de esa venta: 0 × 42000 = 0.
   - **Decisión**: mantener el registro pero excluirlo de cálculos de promedio y rankings. Documentar cuando se filtre.

3. **Mezcla de categorías de producto**
   - Hay café de origen (Huila, Nariño, Sierra) y accesorios (Prensa francesa, Molino manual) con precios muy distintos.
   - Café: $26.000–$45.000. Accesorios: $95.000–$120.000.
   - **Decisión**: tenerlo en cuenta al calcular promedios de precio — un promedio general mezclaría categorías distintas. En futuros retos podría ser útil separar por tipo.

## MiniReto 2: Tablero mínimo — ciclos for...of

### Funciones implementadas

- `totalVendido(ventas)` — suma el valor de todas las ventas con `for...of`
- `unidadesVendidas(ventas)` — suma las unidades con `for...of`
- `ventaMayor(ventas)` — encuentra la venta con mayor valor, ignora cantidad 0
- `ticketPromedio(ventas)` — promedio del valor por venta válida, devuelve 0 si no hay válidas
- `ventasPorCiudad(ventas, ciudad)` — total vendido en una ciudad, normaliza con `claveTexto()`

### Pruebas de escritorio

| Entrada          | totalVendido | unidades | ventaMayor | ticketPromedio | ventasPorCiudad("Medellín") |
|------------------|-------------|----------|------------|----------------|----------------------------|
| 12 ventas        | 985.000     | 21       | id 10      | 89.545,45      | 356.000                    |
| 1 venta (id 1)   | 84.000      | 2        | id 1       | 84.000         | 84.000                     |
| Vacío            | 0           | 0        | null       | 0              | 0                          |

### Decisiones

- Se crearon funciones auxiliares `cantidadDe()`, `precioDe()`, `valorVenta()`, `esVentaValida()` para encapsular la extracción segura de valores.
- La normalización de ciudades usa `claveTexto()` que aplica NFD + quita tildes, así "Medellín" y "medellín" son la misma clave.

## MiniReto 3: Rankings y agrupaciones — métodos de arreglo

### Funciones implementadas

- `totalVendidoM(ventas)` — versión con `.reduce()` de totalVendido
- `unidadesVendidasM(ventas)` — versión con `.reduce()` de unidadesVendidas
- `ventasPorCiudadM(ventas, ciudad)` — versión con `.filter().map().reduce()`
- `totalPorCiudad(ventas)` — agrupa por ciudad normalizada con `.reduce()`
- `unidadesPorProducto(ventas)` — unidades por producto con `.reduce()`
- `topProductosPorValor(ventas, k)` — top k productos ordenados por valor, sin mutar el original

### Verificación ciclo vs. método

Las versiones con `for...of` y con `.reduce()` devuelven exactamente los mismos resultados en todos los casos (completo, un elemento, vacío) y con todas las variaciones de ciudad.

### Decisión: no mutar el arreglo original

`ventasOrdenadasPorValor()` usa spread `[...ventas]` antes de `.sort()` para no modificar el orden original.

## MiniReto 4: Primer reporte de negocio

### Estructura del reporte v0.1

1. Resumen general (periodo, registros, unidades, total, ticket promedio, venta mayor)
2. Ventas por ciudad (tabla con participación porcentual)
3. Unidades por producto
4. Top 3 productos por valor
5. Resumen por día (acepta fechas por argumento CLI)

### Errores reproducidos y corregidos

1. **Ciudad duplicada** — sin normalizar, "Medellín" y "medellín" aparecen como ciudades distintas. La v0.1 las agrupa correctamente.
2. **Ticket promedio NaN** — dividir por 0 cuando no hay ventas. La v0.1 devuelve 0.
3. **Ticket inflado** — la versión defectuosa incluye ventas con cantidad 0 en el promedio (2026-09-04: $60.000 vs $120.000 correcto).

### Verificación

`revisarReporte()` comprueba que no haya NaN, undefined ni ciudades duplicadas en el reporte generado.

## MiniReto 5: ¿Cuánto cuesta cada reporte?

### Predicciones (antes de medir)

Si n se multiplica por 10:
- `totalVendido`: las operaciones se multiplican por **10** (un solo `for`, recorre todo una vez)
- `ventaMayor`: las operaciones se multiplican por **10** (un solo `for` con una comparación)
- `totalPorCiudad`: las operaciones se multiplican por **10** (un solo `for` que filtra y suma)
- `primeraVenta`: las operaciones **no crecen** (acceso directo por índice)

### Resultados medidos

| n       | totalVendido | ventaMayor | totalPorCiudad | primeraVenta |
|---------|-------------|------------|----------------|--------------|
| 100     | 100         | 99         | 100            | 1            |
| 1.000   | 1.000       | 999        | 1.000          | 1            |
| 10.000  | 10.000      | 9.999      | 10.000         | 1            |
| 100.000 | 100.000     | 99.999     | 100.000        | 1            |

### Comparación predicción vs. realidad

Las predicciones se cumplieron exactamente:
- `totalVendido`, `ventaMayor`, `totalPorCiudad`: cuando n crece ×10, las operaciones crecen ×10. **O(n)**.
- `primeraVenta`: siempre 1 operación sin importar n. **O(1)**.
