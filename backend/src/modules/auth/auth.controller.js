import { pool } from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

export const registrar = async (req, res, next) => {
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
    const correo = req.body.correo || req.body.email;
    const { password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({ error: 'Email y password son obligatorios' });
    }

    // 1. Buscar al usuario por email
    const { rows } = await pool.query('SELECT * FROM roles WHERE correo = $1', [correo]);
    const usuario = rows[0];

    // 2. Comparar la contraseña recibida con el hash guardado
    const passwordOk = usuario && (await bcrypt.compare(password, usuario.contraseña));

    // Mismo mensaje si falla el email o la contraseña: no le damos pistas a un atacante
    if (!passwordOk) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // 3. Firmar el token con datos mínimos (nunca la contraseña)
    const token = jwt.sign(
      { id: usuario.id, correo: usuario.correo }, // payload
      env.JWT_SECRET, // clave secreta del servidor
      { expiresIn: env.JWT_EXPIRES_IN } // vencimiento
    );

    // 4. Devolver el token: a partir de acá el cliente lo manda en cada pedido
    res.json({ token });
  } catch (err) {
    next(err);
  }
};

export const administrador = (req, res) => {
  res.json(req.usuario);
};