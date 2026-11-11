# Café Origen — Motor de Analítica

Analytics engine for Café Origen's sales data, built with Node.js as part of Riwi's Algoritmia 2 track.

## Structure

```
cafe-origen-analitica/
├── src/
│   ├── datos.js       # Sales dataset (12 records)
│   ├── explorar.js    # Data exploration script
│   └── analitica.js   # Analytics functions
├── bitacora.md        # Development log & decisions
└── README.md
```

## Quick start

```bash
node src/explorar.js
```

## Dataset

12 sales records from Café Origen with fields: id, fecha, cliente, producto, ciudad, cantidad, precio.
