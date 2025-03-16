const pool = require('../db');

exports.obtenerProductos = async (req, res) => {
    try {
        const resultado = await pool.query('SELECT * FROM productos');
        res.json(resultado.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearProducto = async (req, res) => {
    try {
        const { nombre, descripcion, cantidad_actual, categoria_id, precio_unitario } = req.body;
        const resultado = await pool.query(
            'INSERT INTO productos (nombre, descripcion, cantidad_actual, categoria_id, precio_unitario) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [nombre, descripcion, cantidad_actual, categoria_id, precio_unitario]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, descripcion, cantidad_actual, categoria_id, precio_unitario } = req.body;
        const resultado = await pool.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, cantidad_actual = $3, categoria_id = $4, precio_unitario = $5 WHERE id = $6 RETURNING *',
            [nombre, descripcion, cantidad_actual, categoria_id, precio_unitario, id]
        );
        res.json(resultado.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ mensaje: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
