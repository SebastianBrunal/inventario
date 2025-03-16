const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Configuración de PostgreSQL
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'inventario',
    password: '1q1q6asd',
    port: 5432
});

// 🔹 Agregar un producto
app.post('/productos', async (req, res) => {
    const { codigo_referencia, nombre, descripcion, cantidad, precio } = req.body;

    if (!codigo_referencia || !nombre || !descripcion || isNaN(cantidad) || isNaN(precio)) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y deben ser válidos' });
    }

    try {
        const precioTotal = cantidad * precio; // Se calcula antes de guardar
        const result = await pool.query(
            `INSERT INTO productos (codigo_referencia, nombre, descripcion, cantidad, precio, fecha)
             VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING id`,
            [codigo_referencia, nombre, descripcion, cantidad, precioTotal]
        );
        res.json({ message: 'Producto agregado correctamente', id: result.rows[0].id });
    } catch (err) {
        console.error('Error al insertar producto:', err);
        res.status(500).json({ message: 'Error interno al agregar el producto' });
    }
});

// 🔹 Obtener todos los productos
app.get('/productos', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM productos ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error al obtener productos:', err);
        res.status(500).json({ message: 'Error al obtener productos' });
    }
});

// 🔹 Obtener un producto por código de referencia
app.get('/productos/codigo/:codigo', async (req, res) => {
    const codigo = req.params.codigo;
    try {
        const result = await pool.query('SELECT * FROM productos WHERE codigo_referencia = $1', [codigo]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error al consultar producto:', err);
        res.status(500).json({ message: 'Error al consultar producto' });
    }
});

// 🔹 Reducir la cantidad de un producto
app.put('/productos/reducir/:id', async (req, res) => {
    const id = req.params.id;
    let { cantidad } = req.body;

    if (!cantidad) cantidad = 1;
    if (isNaN(cantidad) || cantidad <= 0) {
        return res.status(400).json({ message: 'Cantidad a reducir inválida' });
    }

    try {
        const result = await pool.query(
            `UPDATE productos
             SET cantidad = cantidad - $1
             WHERE id = $2
               AND cantidad >= $1
             RETURNING cantidad`,
            [cantidad, id]
        );
        if (result.rowCount === 0) {
            return res.status(400).json({ message: 'No se pudo reducir la cantidad' });
        }
        res.json({ message: 'Cantidad reducida correctamente', cantidad_actualizada: result.rows[0].cantidad });
    } catch (err) {
        console.error('Error al reducir cantidad:', err);
        res.status(500).json({ message: 'Error al reducir cantidad' });
    }
});

// 🔹 Eliminar un producto
app.delete('/productos/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const result = await pool.query('DELETE FROM productos WHERE id = $1 RETURNING *', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        res.status(500).json({ message: 'Error al eliminar producto' });
    }
});

// 🔹 Actualizar un producto por ID
app.put('/productos/:id', async (req, res) => {
    const id = req.params.id;
    const { codigo_referencia, nombre, descripcion, cantidad, precio } = req.body;

    if (!codigo_referencia || !nombre || !descripcion || isNaN(cantidad) || isNaN(precio)) {
        return res.status(400).json({ message: 'Todos los campos son obligatorios y deben ser válidos' });
    }

    try {
        const result = await pool.query(
            `UPDATE productos
             SET codigo_referencia = $1,
                 nombre = $2,
                 descripcion = $3,
                 cantidad = $4,
                 precio = $5
             WHERE id = $6
             RETURNING *`,
            [codigo_referencia, nombre, descripcion, cantidad, precio, id]
        );
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }
        res.json({ message: 'Producto actualizado correctamente' });
    } catch (err) {
        console.error('Error al actualizar producto:', err);
        res.status(500).json({ message: 'Error al actualizar producto' });
    }
});

// 🔹 Buscar productos por nombre (coincidencias parciales)
app.get('/productos/nombre/:nombre', async (req, res) => {
    const nombre = `%${req.params.nombre}%`; // Coincidencias parciales

    try {
        const result = await pool.query(
            'SELECT * FROM productos WHERE nombre ILIKE $1 ORDER BY nombre ASC',
            [nombre]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos con ese nombre' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error al buscar producto por nombre:', err);
        res.status(500).json({ message: 'Error al buscar producto' });
    }
});
app.get("/herramientas", async (req, res) => {
    try {
      const result = await pool.query("SELECT * FROM herramientas ORDER BY id ASC");
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al obtener herramientas");
    }
  });
  
  // Agregar una nueva herramienta
  app.post("/herramientas", async (req, res) => {
    const { nombre, cantidad } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO herramientas (nombre, cantidad) VALUES ($1, $2) RETURNING *",
        [nombre, cantidad]
      );
      res.json(result.rows[0]);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al agregar herramienta");
    }
  });
  
  // Buscar herramientas por nombre
  app.get("/herramientas/buscar/:nombre", async (req, res) => {
    const { nombre } = req.params;
    try {
      const result = await pool.query("SELECT * FROM herramientas WHERE nombre ILIKE $1", [`%${nombre}%`]);
      res.json(result.rows);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error al buscar herramienta");
    }
  });

// 🔹 Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

