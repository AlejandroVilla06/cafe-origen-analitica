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

## MiniReto 6: El reporte que se volvió lento

### Verificación con datos del Día 1

`clientesRecurrentes(ventas)` devuelve `["C01", "C02", "C03"]` — correcto. Son los tres clientes que compraron más de una vez.

### Traza con 5 ventas

Supongamos ventas con clientes: `[C01, C02, C01, C03, C02]`

```
i=0 (C01): j=1(C02≠) j=2(C01=, push C01) j=3(C03≠) j=4(C02≠) → 4 comparaciones
i=1 (C02): j=2(C01≠) j=3(C03≠) j=4(C02=, push C02)            → 3 comparaciones
i=2 (C01): j=3(C03≠) j=4(C02≠)                                 → 2 comparaciones
i=3 (C03): j=4(C02≠)                                            → 1 comparación
i=4 (C02): (sin j)                                               → 0

Total: 4 + 3 + 2 + 1 + 0 = 10 comparaciones
```

### Generalización

Con n ventas: `n × (n − 1) / 2` comparaciones del ciclo anidado.

- 5 ventas: 10
- 100 ventas: 4.950
- 1.000 ventas: 499.500
- 10.000 ventas: 49.995.000

### Tabla de tiempos medidos

| n      | Tiempo      | Factor (vs. anterior) |
|--------|------------|----------------------|
| 1.000  | 6,77 ms    | —                    |
| 2.000  | 22,57 ms   | ×3,3                 |
| 4.000  | 99,82 ms   | ×4,4                 |
| 8.000  | 423,29 ms  | ×4,2                 |
| 16.000 | 1.339,67 ms| ×3,2                 |

Al duplicar n, el tiempo se multiplica aproximadamente por **4** (2² = 4). Esto confirma **O(n²)**.

### Estimaciones calculadas

- **100.000 ventas**: ~52 s (estimación) → **64 s** (medido real)
- **1.000.000 ventas**: ~87 minutos (estimación basada en mediciones)

### Costo oculto: `includes()`

`recurrentes.includes()` también recorre un arreglo. En el peor caso (muchos clientes distintos), el arreglo `recurrentes` crece hasta k elementos, y cada `includes` es O(k). Esto añade un factor adicional: el peor caso total es O(n² × k), donde k es el número de clientes únicos. Si todos los clientes fueran distintos (k = n), la complejidad llegaría a **O(n³)**.

### Conclusión para la gerente

Doña gerente: el reporte de clientes recurrentes funciona bien con pocos datos, pero se vuelve lento porque compara **cada venta contra todas las demás**. Con 12 ventas hace 66 comparaciones y es instantáneo. Pero con el historial anual de 100.000 ventas hace casi **5 mil millones** de comparaciones — como si para buscar un nombre en una agenda de 1.000 páginas, leyera completa la agenda 1.000 veces. Por eso tarda más de un minuto. La buena noticia: hay formas más inteligentes de hacer esta consulta que la resolverían en menos de un segundo.

## MiniReto 7: Tiempo, memoria y cadenas de métodos

### Dos versiones de totalCiudad

**`totalCiudadCadena(ventas, ciudad)`** — encadena `.map().filter().map().reduce()`:
- 4 recorridos completos del arreglo (o subconjuntos)
- 3 arreglos intermedios creados (map→[], filter→[], map→[])
- Tiempo: O(n) — se simplifica porque O(4n) = O(n) (constantes se eliminan)
- Espacio: **O(n)** — los arreglos intermedios pueden ser tan grandes como la entrada

**`totalCiudadUnaPasada(ventas, ciudad)`** — un solo `for...of`:
- 1 recorrido completo
- 0 arreglos intermedios
- Tiempo: O(n)
- Espacio: **O(1)** — solo usa una variable `total`

### Verificación

Con 10.000 ventas generadas, ambas devuelven exactamente el mismo valor: **302.244.000**.

### ¿Por qué O(4n) = O(n)?

Big O describe el **orden de crecimiento**, no el tiempo exacto. Si n se multiplica por 10, ambas versiones hacen ×10 más trabajo. La constante 4 no cambia la forma de la curva, solo la desplaza. Por eso se simplifica: O(4n) → O(n).

Pero en la práctica, recorrer 4 veces con arreglos intermedios usa más memoria y más tiempo de reloj que una pasada.

### Clasificación espacial de todas las funciones del motor

| Función                | Espacio   | Justificación                                              |
|-----------------------|-----------|-----------------------------------------------------------|
| totalVendido          | O(1)      | Solo un acumulador `total`                                 |
| unidadesVendidas      | O(1)      | Solo un acumulador `unidades`                              |
| ventaMayor            | O(1)      | Solo `mayor` y `valorMayor`                                |
| ticketPromedio        | O(1)      | Dos variables: `total` y `validas`                         |
| ventasPorCiudad       | O(1)      | Solo un acumulador                                         |
| contarVentasValidas   | O(1)      | Solo un contador                                           |
| totalVendidoM         | O(1)      | `.reduce()` con acumulador, sin arreglo intermedio         |
| unidadesVendidasM     | O(1)      | `.reduce()` con acumulador                                 |
| ventasPorCiudadM      | **O(n)**  | `.filter()` y `.map()` crean arreglos intermedios          |
| totalPorCiudad        | **O(c)**  | Crea un objeto con c entradas (c = ciudades únicas)        |
| unidadesPorProducto   | **O(p)**  | Crea un objeto con p entradas (p = productos únicos)       |
| topProductosPorValor  | **O(p)**  | Copia del objeto de productos + sort                       |
| ventasOrdenadasPorValor| **O(n)** | Crea una copia completa del arreglo con spread `[...]`     |
| ventasDelDia          | **O(n)**  | `.filter()` crea un subarreglo                             |
| totalCiudadCadena     | **O(n)**  | 3 arreglos intermedios                                     |
| totalCiudadUnaPasada  | O(1)      | Solo un acumulador                                         |
| clientesRecurrentes   | **O(k)**  | Arreglo `recurrentes` crece hasta k clientes únicos        |

### Decisión final

Dejamos **`totalCiudadUnaPasada`** en el motor para producción. Razón: mismo resultado, O(1) en espacio vs O(n), y un solo recorrido. En un servidor con memoria limitada del marketplace, crear 3 arreglos intermedios con 100.000 ventas es desperdicio. La cadena de métodos es más legible, pero en este contexto la eficiencia pesa más.

## MiniReto 8: Analítica v0.2 — el informe de rendimiento

### Entregable

Se creó `RENDIMIENTO.md` en la raíz del repositorio con:

1. **Tabla completa** de todas las funciones del motor con complejidad temporal, espacial y justificación basada en el código.
2. **Proyección** de tiempos para 1.000.000 de ventas calculada a partir de las mediciones reales.
3. **Riesgos** ordenados de mayor a menor: `clientesRecurrentes` es el riesgo crítico (O(n²), 64 s con 100k).
4. **Plan de optimización**: usar un Map para contar apariciones de cada cliente en un solo recorrido, convirtiendo O(n²) en O(n).

### Revisión de un compañero

El informe fue revisado y se confirmó que:
- La clasificación Big O de cada función es consistente con el código fuente.
- Las estimaciones para 1.000.000 de ventas son coherentes con los factores de crecimiento medidos.
- La explicación para la gerente (MR6) traduce correctamente el problema técnico a lenguaje de negocio.

## MiniReto 9: Clientes recurrentes en tiempo lineal

### Método de resolución

**1. Entender**: dado un arreglo de ventas, encontrar los clientes que compraron más de una vez. Entrada: arreglo de objetos con propiedad `cliente`. Salida: arreglo de códigos de clientes recurrentes. Restricción: debe responder en < 1 segundo con 100.000 ventas.

**2. Ejemplos**:
- 12 ventas originales → `["C01", "C02", "C03"]` (cada uno aparece 2+ veces)
- Caso borde: arreglo vacío → `[]`
- Caso borde: todos distintos → `[]`
- Caso borde: un solo cliente repitiendo → `["C01"]`

**3. Fuerza bruta** (ya implementada en MR6): `clientesRecurrentes()` compara cada venta con todas las siguientes. Complejidad: O(n²) + O(k) del `includes()`. Con 100.000 ventas: ~64 segundos.

**4. Optimizar**: el trabajo repetido es preguntar "¿ya vi este cliente?" recorriendo un arreglo. Si en vez de un arreglo uso un **Set**, esa pregunta se responde en O(1) promedio. Dos enfoques:
- **Set**: un Set de vistos, otro de recurrentes. Un solo recorrido.
- **Map**: un Map que cuenta compras por cliente. Un recorrido para contar, otro para filtrar los que tienen > 1.

**5. Implementar**: `clientesRecurrentesSet(ventas)` y `clientesRecurrentesMap(ventas)` + `comprasPorCliente(ventas)`.

**6. Probar**: verificado que las tres versiones devuelven los mismos clientes (ordenados) con 12 ventas y con 5.000 ventas generadas.

### Tabla comparativa de tiempos

| n       | O(n²) original | O(n) Set   | O(n) Map  |
|---------|---------------|------------|-----------|
| 1.000   | 5,77 ms       | 0,23 ms    | 0,61 ms   |
| 10.000  | 617,18 ms     | 5,58 ms    | 1,17 ms   |
| 100.000 | — (omitido)   | 33,22 ms   | 8,65 ms   |

La versión original crece cuadráticamente (×100 al multiplicar n por 10). Las optimizadas crecen linealmente.

### Intercambio tiempo / memoria

- **Original O(n²)**: usa O(k) de memoria (solo el arreglo `recurrentes`)
- **Set O(n)**: usa O(n) de memoria (un Set de todos los clientes vistos + un Set de recurrentes)
- **Map O(n)**: usa O(c) de memoria (un Map con c clientes únicos, c ≤ n)

Intercambiamos **más memoria** (guardar todos los clientes vistos) por **mucho más tiempo** ahorrado. Con 100.000 ventas pasamos de ~64 segundos a < 35 milisegundos — un factor de ~1.800×.

## MiniReto 10: Combos de regalo y frecuencias

### Catálogo

Representado como arreglo de objetos `{ producto, precio }` en `src/catalogo.js`. 8 productos con precios de $18.000 a $120.000.

### comboRegalo — búsqueda del complemento

**Fuerza bruta** (`comboRegaloBruto`): dos ciclos anidados, prueba todos los pares. O(n²).

**Optimizada** (`comboRegalo`): un Map de `precio → producto` ya visto. Para cada producto calcula `falta = valor - precio` y pregunta si ya vio uno con ese precio. O(n).

#### Traza de comboRegalo(catalogo, 87000)

```
Nariño 250g ($26.000) → falta $61.000 → ¿vistos? NO → guardo $26.000
Huila 500g  ($42.000) → falta $45.000 → ¿vistos? NO → guardo $42.000
Sierra 500g ($45.000) → falta $42.000 → ¿vistos? SÍ → PAR: [Huila 500g, Sierra 500g]
```

Solo 3 iteraciones en lugar de probar 28 pares.

#### Pruebas

| Valor   | Resultado                                  |
|---------|--------------------------------------------|
| $87.000 | Origen Huila 500 g + Origen Sierra 500 g   |
| $61.000 | Origen Nariño 250 g + Taza de cerámica     |
| $1.000  | null (sin combinación)                     |

### productoEstrellaPorCiudad

Map anidado: `ciudad → Map(producto → frecuencia)`. Un recorrido para contar, luego extraemos el máximo de cada ciudad. Regla de desempate: gana el primero alfabéticamente.

| Ciudad   | Producto estrella      | Apariciones |
|----------|------------------------|-------------|
| Medellín | Origen Huila 500 g     | 2           |
| Bogotá   | Origen Nariño 250 g    | 3           |
| Cali     | Origen Huila 500 g     | 1           |
| Pereira  | Origen Huila 500 g     | 1           |

### primerClienteUnico

Dos recorridos: (1) Map que cuenta apariciones de cada cliente, (2) segundo recorrido en orden original para encontrar el primero con conteo === 1.

Resultado con datos del Día 1: **C04** ✓ (compró Origen Sierra 500 g el 2026-09-03, una sola vez).

### Clasificación de complejidad

| Función                    | Tiempo | Espacio |
|----------------------------|--------|---------|
| comboRegalo                | O(n)   | O(n)    |
| productoEstrellaPorCiudad  | O(n)   | O(c×p)  |
| primerClienteUnico         | O(n)   | O(c)    |

Todas son O(n) en tiempo: recorren las ventas/catálogo una o dos veces, sin ciclos anidados sobre los datos.

## MiniReto 11: La mejor racha y el presupuesto exacto

### mejorSemana — ventana deslizante

**Fuerza bruta** (`mejorSemanaBruta`): para cada posición, suma k días desde cero. O(n × k).

**Optimizada** (`mejorSemana`): calcula la primera ventana, luego suma el que entra y resta el que sale. O(n).

#### Traza de las 3 primeras posiciones (k=7)

```
Ventana 0: [320, 410, 280, 390, 510, 620, 700] → total = 3.230
Ventana 1: [410, 280, 390, 510, 620, 700, 300] → +300 -320 = 3.210
Ventana 2: [280, 390, 510, 620, 700, 300, 290] → +290 -410 = 3.090
```

#### Resultado septiembre

Mejor semana: **día 23** (días 23–29) con total **$3.670** (en miles).

#### Verificación

| Conjunto       | Fuerza bruta | Ventana | ¿Iguales? | Tiempo bruta | Tiempo ventana |
|----------------|-------------|---------|-----------|-------------|----------------|
| 30 días sept.  | 3.670       | 3.670   | ✓         | —           | —              |
| 100.000 aleatorios | 6.377   | 6.377   | ✓         | 2,06 ms     | 0,87 ms        |

Caso borde: k > días → `null` ✓

### parMasCercano — dos punteros

Dos punteros desde los extremos de los precios ordenados. Si la suma cabe en el presupuesto, movemos el izquierdo para buscar una suma mayor; si se pasa, movemos el derecho para bajar.

#### Traza para presupuesto $100.000

```
izq=Filtros ($18k) + der=Molino ($120k) = $138k → se pasa, ←der
izq=Filtros ($18k) + der=Prensa ($95k)  = $113k → se pasa, ←der
izq=Filtros ($18k) + der=Huila 1kg ($79k) = $97k → cabe ✓, izq→
izq=Nariño ($26k)  + der=Huila 1kg ($79k) = $105k → se pasa, ←der
izq=Nariño ($26k)  + der=Sierra ($45k)  = $71k → cabe, izq→
izq=Taza ($35k)    + der=Sierra ($45k)  = $80k → cabe, izq→
izq=Huila 500g ($42k) + der=Sierra ($45k) = $87k → cabe, izq→
Mejor par: Filtros + Huila 1kg = $97.000
```

#### Pruebas

| Presupuesto | Resultado                              |
|-------------|----------------------------------------|
| $100.000    | Filtros de papel x100 + Origen Huila 1 kg ($97.000) |
| $140.000    | Origen Sierra 500 g + Prensa francesa ($140.000)    |
| $40.000     | null (ningún par cabe)                 |

### Clasificación de complejidad

| Función            | Tiempo      | Espacio | Justificación                                    |
|--------------------|------------|---------|--------------------------------------------------|
| mejorSemanaBruta   | O(n × k)   | O(1)    | Dos ciclos: n posiciones × k sumas cada una      |
| mejorSemana        | O(n)       | O(1)    | Un solo recorrido, ajustando la ventana           |
| parMasCercano      | O(n log n) | O(n)    | sort es O(n log n), luego los punteros son O(n)   |

## MiniReto 12: Analítica Café Origen v1.0 — lanzamiento

### Cambios realizados

- **reporte.js** actualizado a v1.0: integra las 6 secciones nuevas (clientes recurrentes, producto estrella por ciudad, combo de regalo, cliente para cupón, mejor semana, par más cercano al presupuesto).
- **process.argv**: `node src/reporte.js 100000` genera n ventas sintéticas para pruebas de rendimiento.
- **Medición de tiempos**: el reporte muestra el tiempo total de ejecución.
- **comparar-versiones.js**: benchmark v0.1 vs v1.0 con mediciones reales.
- **RENDIMIENTO.md**: tabla de complejidades completa (28 funciones), comparación v0.1 vs v1.0.
- **README.md**: documentación de producto — descripción, cómo ejecutar, preguntas que responde, estructura.

### Resultado del benchmark

| Versión | 10.000 ventas | 100.000 ventas |
|---------|--------------|----------------|
| v0.1 | 651 ms | 70 s |
| v1.0 | 76 ms | 622 ms |
| Mejora | 8,6× | 112,9× |

Ninguna función del reporte final es O(n²).

---

## Cierre de la semana — Resumen de los 12 MiniRetos

| MR | Nombre | Estrategia de optimización |
|----|--------|---------------------------|
| 1 | Primer tueste: repositorio y datos | Modelo de datos, casos borde, diccionario |
| 2 | Primer reporte | Funciones puras, acumuladores O(n) |
| 3 | Escalar los datos | Generador sintético, benchmarks |
| 4 | Versiones funcionales | .reduce(), .filter(), encadenamiento |
| 5 | Agrupar y clasificar | Agrupación con reduce, sort por valor |
| 6 | Clientes recurrentes (O(n²)) | Ciclo anidado + includes — identificar el cuello de botella |
| 7 | Medir y proyectar | Medición con performance.now(), proyección a 1M, plan de optimización |
| 8 | El reporte del Día 1 | Integración de módulos, formato de tabla, verificación automática |
| 9 | Set y Map para O(n) | Tres versiones de recurrentes: O(n²) → Set O(n) → Map O(n) |
| 10 | Map para complementos y frecuencias | Combo regalo O(n), producto estrella O(n), cliente único O(n) |
| 11 | Ventana deslizante y dos punteros | mejorSemana O(n), parMasCercano O(n log n) |
| 12 | Lanzamiento v1.0 | Integración final, process.argv, benchmark v0.1 vs v1.0, README |

### Estrategias de resolución aplicadas

1. **Método de resolución (Pólya)**: entender → ejemplos → fuerza bruta → optimizar → implementar → probar
2. **Set**: lookup O(1) para detectar duplicados sin ciclos anidados
3. **Map**: conteo de frecuencias, complementos, agrupación anidada
4. **Ventana deslizante**: evitar recalcular sumando lo que entra y restando lo que sale
5. **Dos punteros**: búsqueda en arreglo ordenado convergiendo desde los extremos
6. **Benchmarking**: medir antes y después para demostrar la mejora con datos reales
