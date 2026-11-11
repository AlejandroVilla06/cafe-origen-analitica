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
