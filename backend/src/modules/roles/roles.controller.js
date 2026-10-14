import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';

// Toda la lógica de acceso a datos vive en el controller consulta la DB directamente.

export const listar = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM roles ORDER BY id');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

export const obtener = async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM roles WHERE id = $1', [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const crear = async (req, res, next) => {
  try {
    const { correo, password } = req.body;
    
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    const { rows } = await pool.query(
      `INSERT INTO roles (correo, password)
       VALUES ($1, $2)
       RETURNING id, correo`,
      [correo, passwordHash]
    );
    
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { correo, password } = req.body;

    const { rows } = await pool.query('SELECT * FROM roles WHERE correo = $1', [correo]);
    
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    const usuario = rows[0];

    const passwordValida = await bcrypt.compare(password, usuario.password);

    if (!passwordValida) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
    }

    res.json({
      id: usuario.id,
      correo: usuario.correo
    });
  } catch (err) {
    next(err);
  }
};


export const actualizar = async (req, res, next) => {
  try {
    const { correo, password } =
      req.body;
    const { rows } = await pool.query(
      `UPDATE roles
       SET correo = $1, password = $2
       WHERE id = $3
       RETURNING *`,
      [correo, password, req.params.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

export const eliminar = async (req, res, next) => {
  try {
    const { rowCount } = await pool.query('DELETE FROM roles WHERE id = $1', [
      req.params.id,
    ]);
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};
